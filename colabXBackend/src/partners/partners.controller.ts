import type { Response } from "express";
import type { AuthRequest } from "../middlewares/authMiddleware.js";
import { eq, and, gt, isNull, sql } from "drizzle-orm";
import db from "../db/index.js";
import { invitation, orgUser, organization } from "../schemas/orgSchema.js";
import { user } from "../schemas/authSchema.js";
import { partner } from "./partners.schema.js";
import { sendInvitationEmail } from "../utils/email.js";
import { createActivity } from "../collaboration/collaboration.service.js";
import {
    createPartner,
    getPartnerByEmail,
    linkUserToPartner,
    getOrgPartners,
    getOrgPartnersForUser,
    getPartnerWithTeams,
    updatePartner,
    softDeletePartner,
    normalizeEmail,
} from "./partners.service.js";

/**
 * Generate a unique invitation token with collision retry
 */
async function generateUniqueToken(maxRetries = 3): Promise<string> {
    for (let i = 0; i < maxRetries; i++) {
        const token = crypto.randomUUID().replace(/-/g, "").slice(0, 16).toUpperCase();
        
        // Check if token already exists
        const [existing] = await db
            .select({ invitationId: invitation.invitationId })
            .from(invitation)
            .where(eq(invitation.token, token))
            .limit(1);
        
        if (!existing) {
            return token;
        }
    }
    
    // Fallback to full UUID if collisions persist (extremely unlikely)
    return crypto.randomUUID().replace(/-/g, "").toUpperCase();
}

export async function createPartnerHandler(
    req: AuthRequest,
    res: Response
): Promise<void> {
    try {
        if (!req.org || !req.user) {
            res.status(401).json({ error: "Unauthorized" });
            return;
        }

        const { contactEmail } = req.body;
        const normalizedContactEmail = normalizeEmail(contactEmail);

        // Prevent duplicate partner email within org (case-insensitive)
        const existing = await getPartnerByEmail(req.org.organizationId, normalizedContactEmail);
        if (existing) {
            res.status(409).json({ error: "A partner with this email already exists in this organization" });
            return;
        }

        // Use transaction for atomic partner + invitation creation
        const result = await db.transaction(async (tx) => {
            // Create partner with status=pending
            const [created] = await tx
                .insert(partner)
                .values({
                    partnerId: crypto.randomUUID(),
                    organizationId: req.org!.organizationId,
                    name: req.body.name,
                    type: req.body.type,
                    contactEmail: normalizedContactEmail,
                    industry: req.body.industry ?? null,
                    onboardingDate: req.body.onboardingDate
                        ? new Date(req.body.onboardingDate)
                        : null,
                    createdByUserId: req.user!.id,
                })
                .returning();

            if (!created) {
                throw new Error("Failed to create partner");
            }

            // Check if user with this email already exists
        const [existingUser] = await tx
                .select({ userId: user.id })
                .from(user)
                .where(sql`lower(${user.email}) = ${normalizedContactEmail}`)
                .limit(1);

            if (existingUser) {
                // Check if already an org member
                const [existingMember] = await tx
                    .select()
                    .from(orgUser)
                    .where(and(eq(orgUser.organizationId, req.org!.organizationId), eq(orgUser.userId, existingUser.userId)))
                    .limit(1);

                if (existingMember) {
                    // User is already in the org — link directly and activate
                    const [linked] = await tx
                        .update(partner)
                        .set({ userId: existingUser.userId, status: "active" })
                        .where(eq(partner.partnerId, created.partnerId))
                        .returning();

                    return { partner: linked, linked: true, invitation: null };
                }
            }

            // Generate unique token and create invitation
            const token = await generateUniqueToken();
            const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

            await tx.insert(invitation).values({
                invitationId: crypto.randomUUID(),
                organizationId: req.org!.organizationId,
                email: normalizedContactEmail,
                token,
                role: "partner",
                expiresAt,
            });

            // Log activity
            try {
                await createActivity(
                    req.org!.organizationId,
                    req.user!.id,
                    "partner",
                    created.partnerId,
                    `created partner "${created.name}" and sent invitation`
                );
            } catch (activityError) {
                console.error("Activity log write failed:", activityError);
            }

            return { partner: created, linked: false, invitation: { token, expiresAt } };
        });

        // Send invitation email outside transaction (non-critical)
        if (result.invitation) {
            try {
                const [org] = await db
                    .select({ name: organization.name })
                    .from(organization)
                    .where(eq(organization.organizationId, req.org.organizationId))
                    .limit(1);

                if (org) {
                    const inviterName = req.user?.name || "Someone";
                    await sendInvitationEmail({
                        to: normalizedContactEmail,
                        orgName: org.name,
                        invitedBy: inviterName,
                        token: result.invitation.token,
                        role: "partner",
                    });
                }
            } catch (emailError) {
                console.error("Failed to send partner invitation email:", emailError);
                // Don't fail the request if email fails - invitation is created
            }
        }

        if (result.linked) {
            res.status(201).json({ partner: result.partner, linked: true });
        } else {
            res.status(201).json({
                partner: result.partner,
                invitation: result.invitation,
            });
        }
    } catch (error) {
        console.error("Create partner error:", error);
        res.status(500).json({ error: "Failed to create partner" });
    }
}

export async function getOrgPartnersHandler(
    req: AuthRequest,
    res: Response
): Promise<void> {
    try {
        if (!req.org || !req.user || !req.membership) {
            res.status(403).json({ error: "Access denied" });
            return;
        }

        const partners = await getOrgPartners(req.org.organizationId);

        res.json({ partners });
    } catch (error) {
        console.error("Get partners error:", error);
        res.status(500).json({ error: "Failed to fetch partners" });
    }
}

export async function getMyPartnerProfileHandler(
    req: AuthRequest,
    res: Response
): Promise<void> {
    try {
        if (!req.org || !req.user) {
            res.status(403).json({ error: "Access denied" });
            return;
        }

        let selfPartner = (await getOrgPartnersForUser(req.org.organizationId, req.user.id))[0];

        // Recovery path: if partner row isn't linked yet, match by contact email and link it.
        // getPartnerByEmail already uses case-insensitive matching
        if (!selfPartner) {
            const emailMatch = await getPartnerByEmail(req.org.organizationId, req.user.email);

            if (emailMatch && !emailMatch.userId) {
                await linkUserToPartner(emailMatch.partnerId, req.user.id);
                selfPartner = { ...emailMatch, userId: req.user.id, status: "active" };
                
                // Log the auto-link activity
                try {
                    await createActivity(
                        req.org.organizationId,
                        req.user.id,
                        "partner",
                        emailMatch.partnerId,
                        `auto-linked partner "${emailMatch.name}" to user account`
                    );
                } catch (activityError) {
                    console.error("Activity log write failed:", activityError);
                }
            }
        }

        if (!selfPartner) {
            res.status(404).json({
                error: "Partner profile is not linked to this account. Ask an admin to link your partner record to this login email.",
            });
            return;
        }

        const result = await getPartnerWithTeams(selfPartner.partnerId);
        res.json({ partner: result.partner, teams: result.teams });
    } catch (error) {
        console.error("Get my partner profile error:", error);
        res.status(500).json({ error: "Failed to fetch partner profile" });
    }
}

export async function getPartnerByIdHandler(
    req: AuthRequest,
    res: Response
): Promise<void> {
    try {
        if (!req.partner) {
            res.status(404).json({ error: "Partner not found" });
            return;
        }

        const result = await getPartnerWithTeams(req.partner.partnerId);
        res.json({ partner: result.partner, teams: result.teams });
    } catch (error) {
        console.error("Get partner error:", error);
        res.status(500).json({ error: "Failed to fetch partner" });
    }
}

export async function updatePartnerHandler(
    req: AuthRequest,
    res: Response
): Promise<void> {
    try {
        if (!req.partner || !req.org || !req.user) {
            res.status(404).json({ error: "Partner not found" });
            return;
        }

        const updates: Record<string, string | Date | null> = {};
        if (req.body.name !== undefined) updates.name = req.body.name;
        if (req.body.type !== undefined) updates.type = req.body.type;
        if (req.body.status !== undefined) updates.status = req.body.status;
        if (req.body.industry !== undefined) updates.industry = req.body.industry;
        if (req.body.onboardingDate !== undefined) {
            updates.onboardingDate = req.body.onboardingDate
                ? new Date(req.body.onboardingDate)
                : null;
        }

        // Handle email change with invitation cleanup
        const oldEmail = req.partner.userId ? null : await getPartnerContactEmail(req.partner.partnerId);
        const newEmail = req.body.contactEmail !== undefined ? normalizeEmail(req.body.contactEmail) : null;
        
        if (newEmail && oldEmail && newEmail !== oldEmail) {
            // Check for duplicate email in org
            const existingWithEmail = await getPartnerByEmail(req.org.organizationId, newEmail);
            if (existingWithEmail && existingWithEmail.partnerId !== req.partner.partnerId) {
                res.status(409).json({ error: "Another partner with this email already exists" });
                return;
            }
            updates.contactEmail = newEmail;
        } else if (req.body.contactEmail !== undefined) {
            updates.contactEmail = normalizeEmail(req.body.contactEmail);
        }

        if (Object.keys(updates).length === 0) {
            res.status(400).json({ error: "No fields to update" });
            return;
        }

        // Use transaction to update partner and clean up old invitations if email changed
        const updated = await db.transaction(async (tx) => {
            // If email is changing and partner is not yet linked to a user, invalidate old invitations
            if (newEmail && oldEmail && newEmail !== oldEmail && !req.partner!.userId) {
                await tx
                    .update(invitation)
                    .set({ usedAt: new Date() }) // Mark as "used" to invalidate
                    .where(
                        and(
                            eq(invitation.organizationId, req.org!.organizationId),
                            sql`lower(${invitation.email}) = ${oldEmail}`,
                            isNull(invitation.usedAt)
                        )
                    );
            }

            const [result] = await tx
                .update(partner)
                .set(updates)
                .where(eq(partner.partnerId, req.partner!.partnerId))
                .returning();

            return result;
        });

        // Log the update
        try {
            const changedFields = Object.keys(updates).join(", ");
            await createActivity(
                req.org.organizationId,
                req.user.id,
                "partner",
                req.partner.partnerId,
                `updated partner "${req.partner.name}" (${changedFields})`
            );
        } catch (activityError) {
            console.error("Activity log write failed:", activityError);
        }

        res.json({ partner: updated });
    } catch (error) {
        console.error("Update partner error:", error);
        res.status(500).json({ error: "Failed to update partner" });
    }
}

/**
 * Helper to get partner's contact email by ID
 */
async function getPartnerContactEmail(partnerId: string): Promise<string | null> {
    const [result] = await db
        .select({ contactEmail: partner.contactEmail })
        .from(partner)
        .where(eq(partner.partnerId, partnerId))
        .limit(1);
    return result?.contactEmail ? normalizeEmail(result.contactEmail) : null;
}

export async function deletePartnerHandler(
    req: AuthRequest,
    res: Response
): Promise<void> {
    try {
        if (!req.partner || !req.org || !req.user) {
            res.status(404).json({ error: "Partner not found" });
            return;
        }

        const deleted = await softDeletePartner(req.partner.partnerId);

        // Log the deletion
        try {
            await createActivity(
                req.org.organizationId,
                req.user.id,
                "partner",
                req.partner.partnerId,
                `deleted partner "${req.partner.name}"`
            );
        } catch (activityError) {
            console.error("Activity log write failed:", activityError);
        }

        res.json({ partner: deleted });
    } catch (error) {
        console.error("Delete partner error:", error);
        res.status(500).json({ error: "Failed to delete partner" });
    }
}
