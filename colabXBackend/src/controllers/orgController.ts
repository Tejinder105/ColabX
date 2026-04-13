import type { Response } from "express";
import { eq, and, ne, desc } from "drizzle-orm";
import db from "../db/index.js";
import { organization, orgUser } from "../schemas/orgSchema.js";
import { user } from "../schemas/authSchema.js";
import { activityLog } from "../schemas/collaborationSchema.js";
import { createActivity } from "../collaboration/collaboration.service.js";
import type { AuthRequest } from "../middlewares/authMiddleware.js";
import {
  ensureRoleAssignmentAllowed,
  hasInternalMembership,
} from "../org/org-membership.service.js";
import { isInternalOrgRole, type OrgRole } from "../org/org.constants.js";
import { team, teamMember, teamPartner } from "../teams/teams.schema.js";

// Generate slug from name
function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

// Generate unique ID
function generateId(): string {
  return crypto.randomUUID();
}

async function logActivitySafe(
  organizationId: string,
  userId: string,
  entityType: string,
  entityId: string,
  action: string,
): Promise<void> {
  try {
    await createActivity(organizationId, userId, entityType, entityId, action);
  } catch (error) {
    console.error("Activity log write failed:", error);
  }
}

// Create organization
export async function createOrganization(
  req: AuthRequest,
  res: Response,
): Promise<void> {
  try {
    const { name } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const alreadyHasInternalOrg = await hasInternalMembership(userId);
    if (alreadyHasInternalOrg) {
      res.status(409).json({
        error:
          "Internal users can belong to exactly one organization. This account already has an internal organization.",
      });
      return;
    }

    const slug = generateSlug(name);
    const orgId = generateId();

    // Check if slug already exists
    const existingOrg = await db
      .select()
      .from(organization)
      .where(eq(organization.slug, slug))
      .limit(1);

    if (existingOrg.length > 0) {
      res
        .status(409)
        .json({ error: "Organization with this name already exists" });
      return;
    }

    // Create organization and add user as admin atomically
    const newOrg = await db.transaction(async (tx) => {
      const [created] = await tx
        .insert(organization)
        .values({
          organizationId: orgId,
          name,
          slug,
          logo: req.body.logo ?? null,
          industry: req.body.industry ?? null,
          timezone: req.body.timezone ?? null,
        })
        .returning();

      if (!created) {
        throw new Error("Failed to create organization");
      }

      await tx.insert(orgUser).values({
        orgUserId: generateId(),
        userId,
        organizationId: created.organizationId,
        role: "admin",
      });

      return created;
    });

    res.status(201).json({ organization: newOrg });
  } catch (error) {
    console.error("Create organization error:", error);
    res.status(500).json({ error: "Failed to create organization" });
  }
}

// Get user's organizations
export async function getUserOrganizations(
  req: AuthRequest,
  res: Response,
): Promise<void> {
  try {
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const userOrgs = await db
      .select({
        id: organization.organizationId,
        name: organization.name,
        slug: organization.slug,
        role: orgUser.role,
        joinedAt: orgUser.joinedAt,
      })
      .from(orgUser)
      .innerJoin(organization, eq(orgUser.organizationId, organization.organizationId))
      .where(eq(orgUser.userId, userId));

    res.json({ organizations: userOrgs });
  } catch (error) {
    console.error("Get organizations error:", error);
    res.status(500).json({ error: "Failed to fetch organizations" });
  }
}

// Get organization by ID (uses requireOrganization middleware)
export async function getOrganizationById(
  req: AuthRequest,
  res: Response,
): Promise<void> {
  try {
    if (!req.org || !req.membership) {
      res.status(403).json({ error: "Access denied" });
      return;
    }

    const [orgRow] = await db
      .select()
      .from(organization)
      .where(eq(organization.organizationId, req.org.organizationId))
      .limit(1);

    res.json({ organization: orgRow ?? req.org, role: req.membership.role });
  } catch (error) {
    console.error("Get organization error:", error);
    res.status(500).json({ error: "Failed to fetch organization" });
  }
}

// Get organization members (uses requireOrganization middleware)
export async function getOrganizationMembers(
  req: AuthRequest,
  res: Response,
): Promise<void> {
  try {
    if (!req.org) {
      res.status(403).json({ error: "Access denied" });
      return;
    }

    if (req.membership?.role !== "admin") {
      res.status(403).json({ error: "Only admins can view organization members" });
      return;
    }

    const members = await db
      .select({
        id: orgUser.orgUserId,
        userId: orgUser.userId,
        role: orgUser.role,
        joinedAt: orgUser.joinedAt,
        userName: user.name,
        userEmail: user.email,
        userImage: user.image,
      })
      .from(orgUser)
      .innerJoin(user, eq(orgUser.userId, user.id))
      .where(eq(orgUser.organizationId, req.org.organizationId));

    res.json({ members });
  } catch (error) {
    console.error("Get members error:", error);
    res.status(500).json({ error: "Failed to fetch members" });
  }
}

// Update organization (admin only, uses requireOrganization middleware)
export async function updateOrganization(
  req: AuthRequest,
  res: Response,
): Promise<void> {
  try {
    if (!req.org || !req.membership) {
      res.status(403).json({ error: "Access denied" });
      return;
    }

    if (req.membership.role !== "admin") {
      res
        .status(403)
        .json({ error: "Only admins can update the organization" });
      return;
    }

    const { name } = req.body;
    const updates: Record<string, string | null> = {};

    if (name) {
      updates.name = name;
      const slug = generateSlug(name);
      updates.slug = slug;

      // Check slug uniqueness (exclude current org)
      const [existing] = await db
        .select()
        .from(organization)
        .where(
          and(eq(organization.slug, slug), ne(organization.organizationId, req.org.organizationId)),
        )
        .limit(1);

      if (existing) {
        res
          .status(409)
          .json({ error: "An organization with this name already exists" });
        return;
      }
    }

    if (req.body.logo !== undefined) {
      updates.logo = req.body.logo ?? null;
    }
    if (req.body.industry !== undefined) {
      updates.industry = req.body.industry ?? null;
    }
    if (req.body.timezone !== undefined) {
      updates.timezone = req.body.timezone ?? null;
    }

    if (Object.keys(updates).length === 0) {
      res.status(400).json({ error: "No fields to update" });
      return;
    }

    const [updated] = await db
      .update(organization)
      .set(updates)
      .where(eq(organization.organizationId, req.org.organizationId))
      .returning();

    if (updated && req.user) {
      await logActivitySafe(
        req.org.organizationId,
        req.user.id,
        "organization",
        req.org.organizationId,
        "updated organization profile",
      );
    }

    res.json({ organization: updated });
  } catch (error) {
    console.error("Update organization error:", error);
    res.status(500).json({ error: "Failed to update organization" });
  }
}

// Delete organization (admin only, uses requireOrganization middleware)
export async function deleteOrganization(
  req: AuthRequest,
  res: Response,
): Promise<void> {
  try {
    if (!req.org || !req.membership) {
      res.status(403).json({ error: "Access denied" });
      return;
    }

    if (req.membership.role !== "admin") {
      res
        .status(403)
        .json({ error: "Only admins can delete the organization" });
      return;
    }

    if (req.user) {
      await logActivitySafe(
        req.org.organizationId,
        req.user.id,
        "organization",
        req.org.organizationId,
        "deleted organization",
      );
    }

    await db.delete(organization).where(eq(organization.organizationId, req.org.organizationId));

    res.json({ success: true });
  } catch (error) {
    console.error("Delete organization error:", error);
    res.status(500).json({ error: "Failed to delete organization" });
  }
}

// Change member role (admin only, uses requireOrganization middleware)
export async function changeMemberRole(
  req: AuthRequest,
  res: Response,
): Promise<void> {
  try {
    if (!req.org || !req.membership) {
      res.status(403).json({ error: "Access denied" });
      return;
    }

    if (req.membership.role !== "admin") {
      res.status(403).json({ error: "Only admins can change member roles" });
      return;
    }

    const memberId = req.params.memberId as string;
    const { role } = req.body as { role: OrgRole };

    // Prevent admin from changing their own role
    if (memberId === req.membership.orgUserId) {
      res.status(400).json({ error: "Cannot change your own role" });
      return;
    }

    const [memberRecord] = await db
      .select({
        id: orgUser.orgUserId,
        userId: orgUser.userId,
        role: orgUser.role,
      })
      .from(orgUser)
      .where(and(eq(orgUser.orgUserId, memberId), eq(orgUser.organizationId, req.org.organizationId)))
      .limit(1);

    if (!memberRecord) {
      res.status(404).json({ error: "Member not found" });
      return;
    }

    const assignmentCheck = await ensureRoleAssignmentAllowed(
      memberRecord.userId,
      role,
      { organizationId: req.org.organizationId }
    );

    if (!assignmentCheck.allowed) {
      res.status(409).json({ error: assignmentCheck.error });
      return;
    }

    if (memberRecord.role === "admin" && role !== "admin") {
      const adminCount = await db
        .select({ id: orgUser.orgUserId })
        .from(orgUser)
        .where(and(eq(orgUser.organizationId, req.org.organizationId), eq(orgUser.role, "admin")));

      if (adminCount.length <= 1) {
        res.status(400).json({
          error: "Each organization must keep at least one admin",
        });
        return;
      }
    }

    const [updated] = await db
      .update(orgUser)
      .set({ role })
      .where(and(eq(orgUser.orgUserId, memberId), eq(orgUser.organizationId, req.org.organizationId)))
      .returning();

    if (!updated) {
      res.status(404).json({ error: "Member not found" });
      return;
    }

    if (req.user) {
      await logActivitySafe(
        req.org.organizationId,
        req.user.id,
        "organization_member",
        memberId,
        `changed member role to ${role}`,
      );
    }

    res.json({ member: updated });
  } catch (error) {
    console.error("Change member role error:", error);
    res.status(500).json({ error: "Failed to change member role" });
  }
}

// Remove member (admin only, uses requireOrganization middleware)
export async function removeMember(
  req: AuthRequest,
  res: Response,
): Promise<void> {
  try {
    if (!req.org || !req.membership) {
      res.status(403).json({ error: "Access denied" });
      return;
    }

    if (req.membership.role !== "admin") {
      res.status(403).json({ error: "Only admins can remove members" });
      return;
    }

    const memberId = req.params.memberId as string;

    // Prevent admin from removing themselves
    if (memberId === req.membership.orgUserId) {
      res
        .status(400)
        .json({ error: "Cannot remove yourself from the organization" });
      return;
    }

    const [memberRecord] = await db
      .select({
        id: orgUser.orgUserId,
        role: orgUser.role,
      })
      .from(orgUser)
      .where(and(eq(orgUser.orgUserId, memberId), eq(orgUser.organizationId, req.org.organizationId)))
      .limit(1);

    if (!memberRecord) {
      res.status(404).json({ error: "Member not found" });
      return;
    }

    if (memberRecord.role === "admin") {
      const adminCount = await db
        .select({ id: orgUser.orgUserId })
        .from(orgUser)
        .where(and(eq(orgUser.organizationId, req.org.organizationId), eq(orgUser.role, "admin")));

      if (adminCount.length <= 1) {
        res.status(400).json({
          error: "Each organization must keep at least one admin",
        });
        return;
      }
    }

    const deleted = await db
      .delete(orgUser)
      .where(and(eq(orgUser.orgUserId, memberId), eq(orgUser.organizationId, req.org.organizationId)))
      .returning();

    if (deleted.length === 0) {
      res.status(404).json({ error: "Member not found" });
      return;
    }

    if (req.user) {
      await logActivitySafe(
        req.org.organizationId,
        req.user.id,
        "organization_member",
        memberId,
        "removed member from organization",
      );
    }

    res.json({ success: true });
  } catch (error) {
    console.error("Remove member error:", error);
    res.status(500).json({ error: "Failed to remove member" });
  }
}

export async function getOrganizationPermissions(
  req: AuthRequest,
  res: Response,
): Promise<void> {
  try {
    if (!req.org) {
      res.status(403).json({ error: "Access denied" });
      return;
    }

    if (req.membership?.role !== "admin") {
      res.status(403).json({ error: "Only admins can view organization permissions" });
      return;
    }

    // Role capabilities are derived from existing backend route policies.
    const permissions = [
      { feature: "Manage Organization Profile", admin: true, manager: false, member: false, partner: false },
      { feature: "Invite New Users", admin: true, manager: false, member: false, partner: false },
      { feature: "Manage Teams", admin: true, manager: true, member: false, partner: false },
      { feature: "View Team Deals", admin: true, manager: true, member: true, partner: false },
      { feature: "Update Team KR Progress", admin: true, manager: true, member: true, partner: false },
      { feature: "Update Partner KR Progress", admin: false, manager: false, member: false, partner: true },
      { feature: "Access Audit Logs", admin: true, manager: false, member: false, partner: false },
    ];

    res.json({ permissions });
  } catch (error) {
    console.error("Get organization permissions error:", error);
    res.status(500).json({ error: "Failed to fetch organization permissions" });
  }
}

export async function getOrganizationAuditLogs(
  req: AuthRequest,
  res: Response,
): Promise<void> {
  try {
    if (!req.org) {
      res.status(403).json({ error: "Access denied" });
      return;
    }

    if (req.membership?.role !== "admin") {
      res.status(403).json({ error: "Only admins can view organization audit logs" });
      return;
    }

    const limitQuery = Number.parseInt((req.query.limit as string) ?? "200", 10);
    const limit = Number.isNaN(limitQuery) ? 200 : Math.min(Math.max(limitQuery, 1), 500);

    const logs = await db
      .select({
        id: activityLog.activityLogId,
        action: activityLog.action,
        entityType: activityLog.entityType,
        entityId: activityLog.entityId,
        createdAt: activityLog.createdAt,
        userId: activityLog.userId,
        userName: user.name,
        userEmail: user.email,
      })
      .from(activityLog)
      .leftJoin(user, eq(activityLog.userId, user.id))
      .where(eq(activityLog.organizationId, req.org.organizationId))
      .orderBy(desc(activityLog.createdAt))
      .limit(limit);

    res.json({ logs });
  } catch (error) {
    console.error("Get organization audit logs error:", error);
    res.status(500).json({ error: "Failed to fetch organization audit logs" });
  }
}

export async function getOrganizationIntegrityReport(
  req: AuthRequest,
  res: Response,
): Promise<void> {
  try {
    if (!req.org || req.membership?.role !== "admin") {
      res.status(403).json({ error: "Only admins can view integrity reports" });
      return;
    }

    const [
      internalMemberships,
      teamMembersWithRoles,
      partnerAssignments,
      orgTeams,
      orgLeadRows,
    ] = await Promise.all([
      db
        .select({
          userId: orgUser.userId,
          organizationId: orgUser.organizationId,
          role: orgUser.role,
          email: user.email,
          name: user.name,
        })
        .from(orgUser)
        .innerJoin(user, eq(orgUser.userId, user.id))
        .where(and(eq(orgUser.organizationId, req.org.organizationId))),
      db
        .select({
          teamId: teamMember.teamId,
          role: teamMember.role,
          userId: teamMember.userId,
          teamName: team.name,
          orgRole: orgUser.role,
          userName: user.name,
          userEmail: user.email,
        })
        .from(teamMember)
        .innerJoin(team, eq(teamMember.teamId, team.teamId))
        .innerJoin(
          orgUser,
          and(eq(orgUser.organizationId, team.organizationId), eq(orgUser.userId, teamMember.userId))
        )
        .innerJoin(user, eq(teamMember.userId, user.id))
        .where(eq(team.organizationId, req.org.organizationId)),
      db
        .select({
          partnerId: teamPartner.partnerId,
          teamId: teamPartner.teamId,
          partnerName: user.name,
        })
        .from(teamPartner)
        .innerJoin(team, eq(teamPartner.teamId, team.teamId))
        .leftJoin(orgUser, and(eq(orgUser.organizationId, team.organizationId), eq(orgUser.userId, teamPartner.assignedByUserId)))
        .where(eq(team.organizationId, req.org.organizationId)),
      db.select({ id: team.teamId, name: team.name }).from(team).where(eq(team.organizationId, req.org.organizationId)),
      db
        .select({
          teamId: teamMember.teamId,
        })
        .from(teamMember)
        .innerJoin(team, eq(teamMember.teamId, team.teamId))
        .where(and(eq(team.organizationId, req.org.organizationId), eq(teamMember.role, "lead"))),
    ]);

    const internalUsersInMultipleOrgs = new Map<
      string,
      { userId: string; name: string | null; email: string }
    >();

    const orgInternalMembers = internalMemberships.filter((membership) =>
      isInternalOrgRole(membership.role)
    );

    for (const membership of orgInternalMembers) {
      const hasOtherInternalMembership = await hasInternalMembership(membership.userId, {
        excludeOrgId: req.org.organizationId,
      });

      if (hasOtherInternalMembership) {
        internalUsersInMultipleOrgs.set(membership.userId, {
          userId: membership.userId,
          name: membership.name,
          email: membership.email,
        });
      }
    }

    const partnersInTeams = teamMembersWithRoles.filter(
      (memberRow) => memberRow.orgRole === "partner"
    );
    const partnersLeadingTeams = teamMembersWithRoles.filter(
      (memberRow) => memberRow.orgRole === "partner" && memberRow.role === "lead"
    );

    const partnerAssignmentCounts = new Map<string, number>();
    for (const assignment of partnerAssignments) {
      partnerAssignmentCounts.set(
        assignment.partnerId,
        (partnerAssignmentCounts.get(assignment.partnerId) ?? 0) + 1
      );
    }

    const partnersAssignedToMultipleTeams = [...partnerAssignmentCounts.entries()]
      .filter(([, count]) => count > 1)
      .map(([partnerId, count]) => ({ partnerId, assignmentCount: count }));

    const leadTeamIds = new Set(orgLeadRows.map((row) => row.teamId));
    const teamsWithoutLead = orgTeams.filter((teamRow) => !leadTeamIds.has(teamRow.id));

    res.json({
      internalUsersInMultipleOrgs: [...internalUsersInMultipleOrgs.values()],
      partnersInTeams,
      partnersLeadingTeams,
      partnersAssignedToMultipleTeams,
      teamsWithoutLead,
    });
  } catch (error) {
    console.error("Get organization integrity report error:", error);
    res.status(500).json({ error: "Failed to fetch organization integrity report" });
  }
}
