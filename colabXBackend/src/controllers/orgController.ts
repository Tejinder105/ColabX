import type { Response } from "express";
import { eq, and, ne } from "drizzle-orm";
import db from "../db/index.js";
import { organization, orgUser } from "../schemas/orgSchema.js";
import { user } from "../schemas/authSchema.js";
import type { AuthRequest } from "../middlewares/authMiddleware.js";

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
        .values({ id: orgId, name, slug })
        .returning();

      if (!created) {
        throw new Error("Failed to create organization");
      }

      await tx.insert(orgUser).values({
        id: generateId(),
        userId,
        orgId: created.id,
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
        id: organization.id,
        name: organization.name,
        slug: organization.slug,
        role: orgUser.role,
        joinedAt: orgUser.joinedAt,
      })
      .from(orgUser)
      .innerJoin(organization, eq(orgUser.orgId, organization.id))
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

    res.json({ organization: req.org, role: req.membership.role });
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

    const members = await db
      .select({
        id: orgUser.id,
        userId: orgUser.userId,
        role: orgUser.role,
        joinedAt: orgUser.joinedAt,
        userName: user.name,
        userEmail: user.email,
        userImage: user.image,
      })
      .from(orgUser)
      .innerJoin(user, eq(orgUser.userId, user.id))
      .where(eq(orgUser.orgId, req.org.id));

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
    const updates: Record<string, string> = {};

    if (name) {
      updates.name = name;
      const slug = generateSlug(name);
      updates.slug = slug;

      // Check slug uniqueness (exclude current org)
      const [existing] = await db
        .select()
        .from(organization)
        .where(
          and(eq(organization.slug, slug), ne(organization.id, req.org.id)),
        )
        .limit(1);

      if (existing) {
        res
          .status(409)
          .json({ error: "An organization with this name already exists" });
        return;
      }
    }

    const [updated] = await db
      .update(organization)
      .set(updates)
      .where(eq(organization.id, req.org.id))
      .returning();

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

    await db.delete(organization).where(eq(organization.id, req.org.id));

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
    const { role } = req.body;

    // Prevent admin from changing their own role
    if (memberId === req.membership.id) {
      res.status(400).json({ error: "Cannot change your own role" });
      return;
    }

    const [updated] = await db
      .update(orgUser)
      .set({ role })
      .where(and(eq(orgUser.id, memberId), eq(orgUser.orgId, req.org.id)))
      .returning();

    if (!updated) {
      res.status(404).json({ error: "Member not found" });
      return;
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
    if (memberId === req.membership.id) {
      res
        .status(400)
        .json({ error: "Cannot remove yourself from the organization" });
      return;
    }

    const deleted = await db
      .delete(orgUser)
      .where(and(eq(orgUser.id, memberId), eq(orgUser.orgId, req.org.id)))
      .returning();

    if (deleted.length === 0) {
      res.status(404).json({ error: "Member not found" });
      return;
    }

    res.json({ success: true });
  } catch (error) {
    console.error("Remove member error:", error);
    res.status(500).json({ error: "Failed to remove member" });
  }
}
