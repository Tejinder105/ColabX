import type { Response } from "express";
import type { AuthRequest } from "../middlewares/authMiddleware.js";
import { eq, and, gt, isNull } from "drizzle-orm";
import db from "../db/index.js";
import { invitation, orgUser } from "../schemas/orgSchema.js";
import { user } from "../schemas/authSchema.js";
import {
    createPartner,
    getPartnerByEmail,
    linkUserToPartner,
    getOrgPartners,
    getOrgPartnersForUser,
    getPartnerWithTeams,
    updatePartner,
    softDeletePartner,
} from "./partners.service.js";

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

        // Prevent duplicate partner email within org
        const existing = await getPartnerByEmail(req.org.id, contactEmail);
        if (existing) {
            res.status(409).json({ error: "A partner with this email already exists in this organization" });
            return;
        }

        // Create partner with status=pending
        const created = await createPartner(req.org.id, req.user.id, req.body);

        if (!created) {
            res.status(500).json({ error: "Failed to create partner" });
            return;
        }

        // Check if user with this email already exists
        const [existingUser] = await db
            .select({ id: user.id })
            .from(user)
            .where(eq(user.email, contactEmail))
            .limit(1);

        if (existingUser) {
            // Check if already an org member
            const [existingMember] = await db
                .select()
                .from(orgUser)
                .where(and(eq(orgUser.orgId, req.org.id), eq(orgUser.userId, existingUser.id)))
                .limit(1);

            if (existingMember) {
                // User is already in the org — link directly and activate
                await linkUserToPartner(created.id, existingUser.id);
                const linked = { ...created, userId: existingUser.id, status: "active" as const };
                res.status(201).json({ partner: linked, linked: true });
                return;
            }
        }

        // Create invitation for the partner
        const token = crypto.randomUUID().replace(/-/g, "").slice(0, 16).toUpperCase();
        const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

        await db.insert(invitation).values({
            id: crypto.randomUUID(),
            orgId: req.org.id,
            email: contactEmail,
            token,
            role: "partner",
            expiresAt,
        });

        res.status(201).json({
            partner: created,
            invitation: { token, expiresAt },
        });
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

        const partners = await getOrgPartners(req.org.id);

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

        let selfPartner = (await getOrgPartnersForUser(req.org.id, req.user.id))[0];

        // Recovery path: if partner row isn't linked yet, match by contact email and link it.
        if (!selfPartner) {
            const directEmailMatch = await getPartnerByEmail(req.org.id, req.user.email);

            if (directEmailMatch && !directEmailMatch.userId) {
                await linkUserToPartner(directEmailMatch.id, req.user.id);
                selfPartner = { ...directEmailMatch, userId: req.user.id, status: "active" };
            } else if (!directEmailMatch) {
                const orgPartners = await getOrgPartners(req.org.id);
                const caseInsensitiveMatch = orgPartners.find(
                    (partnerRow) =>
                        partnerRow.contactEmail?.toLowerCase() === req.user?.email.toLowerCase() &&
                        !partnerRow.userId
                );

                if (caseInsensitiveMatch) {
                    await linkUserToPartner(caseInsensitiveMatch.id, req.user.id);
                    selfPartner = { ...caseInsensitiveMatch, userId: req.user.id, status: "active" };
                }
            }
        }

        if (!selfPartner) {
            res.status(404).json({
                error: "Partner profile is not linked to this account. Ask an admin to link your partner record to this login email.",
            });
            return;
        }

        const result = await getPartnerWithTeams(selfPartner.id);
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

        const result = await getPartnerWithTeams(req.partner.id);
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
        if (!req.partner) {
            res.status(404).json({ error: "Partner not found" });
            return;
        }

        const updates: Record<string, string | Date | null> = {};
        if (req.body.name !== undefined) updates.name = req.body.name;
        if (req.body.type !== undefined) updates.type = req.body.type;
        if (req.body.status !== undefined) updates.status = req.body.status;
        if (req.body.contactEmail !== undefined) updates.contactEmail = req.body.contactEmail;
        if (req.body.industry !== undefined) updates.industry = req.body.industry;
        if (req.body.onboardingDate !== undefined) {
            updates.onboardingDate = req.body.onboardingDate
                ? new Date(req.body.onboardingDate)
                : null;
        }

        if (Object.keys(updates).length === 0) {
            res.status(400).json({ error: "No fields to update" });
            return;
        }

        const updated = await updatePartner(req.partner.id, updates);
        res.json({ partner: updated });
    } catch (error) {
        console.error("Update partner error:", error);
        res.status(500).json({ error: "Failed to update partner" });
    }
}

export async function deletePartnerHandler(
    req: AuthRequest,
    res: Response
): Promise<void> {
    try {
        if (!req.partner) {
            res.status(404).json({ error: "Partner not found" });
            return;
        }

        const updated = await softDeletePartner(req.partner.id);
        res.json({ partner: updated });
    } catch (error) {
        console.error("Delete partner error:", error);
        res.status(500).json({ error: "Failed to delete partner" });
    }
}
