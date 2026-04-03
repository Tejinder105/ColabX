import type { Response } from "express";
import { eq, and, gt, isNull, sql } from "drizzle-orm";
import db from "../db/index.js";
import { invitation, orgUser, organization } from "../schemas/orgSchema.js";
import { user } from "../schemas/authSchema.js";
import { partner } from "../partners/partners.schema.js";
import { createActivity } from "../collaboration/collaboration.service.js";
import { sendInvitationEmail } from "../utils/email.js";
import type { AuthRequest } from "../middlewares/authMiddleware.js";

function generateId(): string {
  return crypto.randomUUID();
}

/**
 * Normalize email for consistent storage and comparison
 */
function normalizeEmail(email: string): string {
  return email.toLowerCase().trim();
}

/**
 * Generate unique invitation token with collision retry
 */
async function generateUniqueToken(maxRetries = 3): Promise<string> {
  for (let i = 0; i < maxRetries; i++) {
    const token = crypto.randomUUID().replace(/-/g, "").slice(0, 16).toUpperCase();
    
    // Check if token already exists
    const [existing] = await db
      .select({ id: invitation.id })
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

// Create invitation (admin/manager only)
export async function createInvitation(
  req: AuthRequest,
  res: Response,
): Promise<void> {
  try {
    const { orgId, role = "partner", partnerType, partnerIndustry } = req.body;
    // Email is already normalized by validation schema
    const email = normalizeEmail(req.body.email);
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    // Check if user is admin or manager of this org
    const membership = await db
      .select()
      .from(orgUser)
      .where(and(eq(orgUser.orgId, orgId), eq(orgUser.userId, userId)))
      .limit(1);

    if (
      membership.length === 0 ||
      !["admin", "manager"].includes(membership[0]?.role ?? "")
    ) {
      res.status(403).json({ error: "Only admins and managers can invite" });
      return;
    }

    // Check if target email is already a member (case-insensitive)
    const [existingUser] = await db
      .select({ id: user.id })
      .from(user)
      .where(sql`lower(${user.email}) = ${email}`)
      .limit(1);

    if (existingUser) {
      const [existingMember] = await db
        .select()
        .from(orgUser)
        .where(
          and(eq(orgUser.orgId, orgId), eq(orgUser.userId, existingUser.id)),
        )
        .limit(1);

      if (existingMember) {
        res
          .status(409)
          .json({ error: "User is already a member of this organization" });
        return;
      }
    }

    // Check for existing pending invitation (case-insensitive)
    const [existingInvite] = await db
      .select()
      .from(invitation)
      .where(
        and(
          eq(invitation.orgId, orgId),
          sql`lower(${invitation.email}) = ${email}`,
          isNull(invitation.usedAt),
          gt(invitation.expiresAt, new Date()),
        ),
      )
      .limit(1);

    if (existingInvite) {
      try {
        const orgs = await db
          .select({ name: organization.name })
          .from(organization)
          .where(eq(organization.id, orgId))
          .limit(1);

        const org = orgs[0];
        if (org) {
          const inviterName = req.user?.name || "Someone";
          await sendInvitationEmail({
            to: email,
            orgName: org.name,
            invitedBy: inviterName,
            token: existingInvite.token,
            role: existingInvite.role,
          });
        }
      } catch (emailError) {
        console.error("Failed to resend invitation email:", emailError);
      }

      res.status(200).json({
        invitation: { token: existingInvite.token },
        message: "A pending invitation already exists. Invitation email was re-sent.",
      });
      return;
    }

    // Generate unique token with collision handling
    const token = await generateUniqueToken();
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    const insertedInvites = await db
      .insert(invitation)
      .values({
        id: generateId(),
        orgId,
        email, // Already normalized
        token,
        role,
        // Store partner details if role is partner
        partnerType: role === "partner" ? partnerType : null,
        partnerIndustry: role === "partner" ? partnerIndustry : null,
        expiresAt,
      })
      .returning();

    const newInvite = insertedInvites[0];

    if (!newInvite) {
      res.status(500).json({ error: "Failed to create invitation" });
      return;
    }

    try {
      await createActivity(
        orgId,
        userId,
        "invitation",
        newInvite.id,
        `invited ${email} as ${role}`,
      );
    } catch (activityError) {
      console.error("Activity log write failed:", activityError);
    }

    // Send invitation email
    try {
      const orgs = await db
        .select({ name: organization.name })
        .from(organization)
        .where(eq(organization.id, orgId))
        .limit(1);

      const org = orgs[0];
      if (org) {
        const inviterName = req.user?.name || "Someone";
        await sendInvitationEmail({
          to: email,
          orgName: org.name,
          invitedBy: inviterName,
          token: newInvite.token,
          role,
        });
      }
    } catch (emailError) {
      console.error("Failed to send invitation email:", emailError);
      // Don't fail the whole request if email fails
    }

    res.status(201).json({ invitation: { ...newInvite, token } });
  } catch (error) {
    console.error("Create invitation error:", error);
    res.status(500).json({ error: "Failed to create invitation" });
  }
}

// Validate invitation token (public endpoint)
export async function validateInvitation(
  req: AuthRequest,
  res: Response,
): Promise<void> {
  try {
    const token = req.params.token as string;

    const [invite] = await db
      .select({
        id: invitation.id,
        email: invitation.email,
        role: invitation.role,
        expiresAt: invitation.expiresAt,
        usedAt: invitation.usedAt,
        orgId: invitation.orgId,
        orgName: organization.name,
        orgSlug: organization.slug,
      })
      .from(invitation)
      .innerJoin(organization, eq(invitation.orgId, organization.id))
      .where(eq(invitation.token, token))
      .limit(1);

    if (!invite) {
      res.status(404).json({ error: "Invitation not found", valid: false });
      return;
    }

    if (invite.usedAt) {
      res.status(400).json({ error: "Invitation already used", valid: false });
      return;
    }

    if (new Date(invite.expiresAt) < new Date()) {
      res.status(400).json({ error: "Invitation expired", valid: false });
      return;
    }

    res.json({
      valid: true,
      invitation: {
        email: invite.email,
        role: invite.role,
        organization: {
          id: invite.orgId,
          name: invite.orgName,
          slug: invite.orgSlug,
        },
      },
    });
  } catch (error) {
    console.error("Validate invitation error:", error);
    res.status(500).json({ error: "Failed to validate invitation" });
  }
}

// Accept invitation (strict email match enforced)
export async function acceptInvitation(
  req: AuthRequest,
  res: Response,
): Promise<void> {
  try {
    const token = req.params.token as string;
    const userId = req.user?.id;
    const userEmail = req.user?.email;

    if (!userId || !userEmail) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const normalizedUserEmail = normalizeEmail(userEmail);

    const [invite] = await db
      .select()
      .from(invitation)
      .where(
        and(eq(invitation.token, token), gt(invitation.expiresAt, new Date())),
      )
      .limit(1);

    if (!invite) {
      res.status(404).json({ error: "Invalid or expired invitation" });
      return;
    }

    if (invite.usedAt) {
      res.status(400).json({ error: "Invitation already used" });
      return;
    }

    // Strict email match (case-insensitive)
    const normalizedInviteEmail = normalizeEmail(invite.email);
    if (normalizedInviteEmail !== normalizedUserEmail) {
      res.status(403).json({
        error: "This invitation was sent to a different email address",
      });
      return;
    }

    // Check if user already member
    const existingMember = await db
      .select()
      .from(orgUser)
      .where(and(eq(orgUser.orgId, invite.orgId), eq(orgUser.userId, userId)))
      .limit(1);

    if (existingMember.length > 0) {
      res.status(409).json({ error: "Already a member of this organization" });
      return;
    }

    // Add user to org and mark invitation as used atomically
    const org = await db.transaction(async (tx) => {
      await tx.insert(orgUser).values({
        id: crypto.randomUUID(),
        userId,
        orgId: invite.orgId,
        role: invite.role,
      });

      await tx
        .update(invitation)
        .set({ usedAt: new Date() })
        .where(eq(invitation.id, invite.id));

      // If partner role, ensure partner record exists and link user
      if (invite.role === "partner") {
        // Use case-insensitive match for partner lookup
        const [existingPartner] = await tx
          .select({ id: partner.id })
          .from(partner)
          .where(
            and(
              eq(partner.orgId, invite.orgId),
              sql`lower(${partner.contactEmail}) = ${normalizedInviteEmail}`,
            )
          )
          .limit(1);

        if (existingPartner) {
          // Link user to existing partner and activate
          await tx
            .update(partner)
            .set({ userId, status: "active" })
            .where(eq(partner.id, existingPartner.id));
        } else {
          // Auto-create partner record using stored invitation data
          const partnerType = invite.partnerType || "reseller";
          await tx.insert(partner).values({
            id: crypto.randomUUID(),
            orgId: invite.orgId,
            name: req.user?.name || invite.email,
            type: partnerType as "reseller" | "agent" | "technology" | "distributor",
            industry: invite.partnerIndustry || undefined,
            status: "active",
            contactEmail: normalizedInviteEmail, // Store normalized
            userId,
            createdBy: userId,
          });
        }
      }

      const [orgDetails] = await tx
        .select()
        .from(organization)
        .where(eq(organization.id, invite.orgId))
        .limit(1);

      return orgDetails;
    });

    res.json({ success: true, organization: org });
  } catch (error) {
    console.error("Accept invitation error:", error);
    res.status(500).json({ error: "Failed to accept invitation" });
  }
}

// Get pending invitations for an organization (admin/manager only, uses requireOrganization middleware)
export async function getPendingInvitations(
  req: AuthRequest,
  res: Response,
): Promise<void> {
  try {
    if (!req.org || !req.membership) {
      res.status(403).json({ error: "Access denied" });
      return;
    }

    if (!["admin", "manager"].includes(req.membership.role)) {
      res
        .status(403)
        .json({ error: "Only admins and managers can view invitations" });
      return;
    }

    const pendingInvites = await db
      .select({
        id: invitation.id,
        email: invitation.email,
        role: invitation.role,
        expiresAt: invitation.expiresAt,
        createdAt: invitation.createdAt,
      })
      .from(invitation)
      .where(
        and(
          eq(invitation.orgId, req.org.id),
          isNull(invitation.usedAt),
          gt(invitation.expiresAt, new Date()),
        ),
      )
      .orderBy(invitation.createdAt);

    res.json({ invitations: pendingInvites });
  } catch (error) {
    console.error("Get pending invitations error:", error);
    res.status(500).json({ error: "Failed to fetch invitations" });
  }
}
