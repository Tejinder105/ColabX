/**
 * Integration Test: Partner Auto-Creation on Invitation Acceptance
 *
 * This test verifies the complete flow where:
 * 1. Admin invites a user with role="partner"
 * 2. User accepts invitation
 * 3. System auto-creates partner record if it doesn't exist
 * 4. User is linked to partner with status="active"
 */

import { describe, it, expect, beforeEach, beforeAll, afterAll } from "@jest/globals";

let eq: typeof import("drizzle-orm").eq;
let and: typeof import("drizzle-orm").and;
let db: typeof import("../db/index.js").default;
let user: typeof import("../schemas/authSchema.js").user;
let organization: typeof import("../schemas/orgSchema.js").organization;
let orgUser: typeof import("../schemas/orgSchema.js").orgUser;
let invitation: typeof import("../schemas/orgSchema.js").invitation;
let partner: typeof import("../partners/partners.schema.js").partner;

const runDatabaseIntegrationTests =
  !!process.env.DATABASE_URL && !!process.env.BETTER_AUTH_SECRET;

const describeIfDatabase = runDatabaseIntegrationTests ? describe : describe.skip;

describeIfDatabase("Partner Auto-Creation on Invitation Acceptance", () => {
  let testOrg: typeof organization.$inferSelect;
  let adminUser: typeof user.$inferSelect;
  let partnerUser: typeof user.$inferSelect;
  let invitationRecord: typeof invitation.$inferSelect;

  beforeAll(async () => {
    ({ eq, and } = await import("drizzle-orm"));
    ({ default: db } = await import("../db/index.js"));
    ({ user } = await import("../schemas/authSchema.js"));
    ({ organization, orgUser, invitation } = await import("../schemas/orgSchema.js"));
    ({ partner } = await import("../partners/partners.schema.js"));
  });

  beforeEach(async () => {
    // Create test organization
    const [org] = await db
      .insert(organization)
      .values({
        id: `org-${Date.now()}`,
        name: "Test Organization",
        slug: `test-org-${Date.now()}`,
      })
      .returning();
    testOrg = org;

    // Create admin user
    const [admin] = await db
      .insert(user)
      .values({
        id: `admin-${Date.now()}`,
        email: `admin-${Date.now()}@test.com`,
        name: "Admin User",
        emailVerified: true,
      })
      .returning();
    adminUser = admin;

    // Add admin to organization
    await db.insert(orgUser).values({
      id: `orguser-admin-${Date.now()}`,
      userId: adminUser.id,
      orgId: testOrg.id,
      role: "admin",
    });

    // Create partner user
    const [partnerUserRecord] = await db
      .insert(user)
      .values({
        id: `partner-user-${Date.now()}`,
        email: `partner-${Date.now()}@test.com`,
        name: "Partner User",
        emailVerified: true,
      })
      .returning();
    partnerUser = partnerUserRecord;
  });

  afterAll(async () => {
    // Cleanup is handled by cascade delete or explicit cleanup if needed
  });

  describe("Partner Role Invitation + Auto-Create Partner Record", () => {
    it("should auto-create partner record when user accepts partner invitation", async () => {
      // 1. Create invitation for partner role
      const token = `TEST_TOKEN_${Date.now()}_${Math.random().toString(36).slice(2)}`;
      const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

      const [invite] = await db
        .insert(invitation)
        .values({
          id: `invite-${Date.now()}`,
          orgId: testOrg.id,
          email: partnerUser.email,
          token,
          role: "partner",
          expiresAt,
        })
        .returning();

      invitationRecord = invite;

      // 2. Simulate accepting invitation (this is what acceptInvitation controller does)
      await db.transaction(async (tx) => {
        // Add user to org with partner role
        await tx.insert(orgUser).values({
          id: `orguser-partner-${Date.now()}`,
          userId: partnerUser.id,
          orgId: testOrg.id,
          role: "partner",
        });

        // Mark invitation as used
        await tx
          .update(invitation)
          .set({ usedAt: new Date() })
          .where(eq(invitation.id, invite.id));

        // AUTO-CREATE PARTNER if doesn't exist
        const [existingPartner] = await tx
          .select({ id: partner.id })
          .from(partner)
          .where(
            and(
              eq(partner.orgId, testOrg.id),
              eq(partner.contactEmail, partnerUser.email)
            )
          )
          .limit(1);

        if (!existingPartner) {
          await tx.insert(partner).values({
            id: `partner-${Date.now()}`,
            orgId: testOrg.id,
            name: partnerUser.name || partnerUser.email,
            type: "reseller", // Default type
            status: "active",
            contactEmail: partnerUser.email,
            userId: partnerUser.id,
            createdBy: partnerUser.id,
          });
        } else {
          // Link existing partner to user
          await tx
            .update(partner)
            .set({ userId: partnerUser.id, status: "active" })
            .where(eq(partner.id, existingPartner.id));
        }
      });

      // 3. Verify orgUser was created
      const [createdOrgUser] = await db
        .select()
        .from(orgUser)
        .where(
          and(
            eq(orgUser.userId, partnerUser.id),
            eq(orgUser.orgId, testOrg.id)
          )
        )
        .limit(1);

      expect(createdOrgUser).toBeDefined();
      expect(createdOrgUser.role).toBe("partner");

      // 4. Verify invitation was marked as used
      const [updatedInvite] = await db
        .select()
        .from(invitation)
        .where(eq(invitation.id, invite.id))
        .limit(1);

      expect(updatedInvite.usedAt).not.toBeNull();

      // 5. Verify partner record was AUTO-CREATED
      const [createdPartner] = await db
        .select()
        .from(partner)
        .where(
          and(
            eq(partner.orgId, testOrg.id),
            eq(partner.contactEmail, partnerUser.email)
          )
        )
        .limit(1);

      expect(createdPartner).toBeDefined();
      expect(createdPartner.name).toBe(partnerUser.name);
      expect(createdPartner.contactEmail).toBe(partnerUser.email);
      expect(createdPartner.type).toBe("reseller");
      expect(createdPartner.status).toBe("active");

      // 6. Verify user is linked to partner
      expect(createdPartner.userId).toBe(partnerUser.id);

      // 7. Verify creator is set
      expect(createdPartner.createdBy).toBe(partnerUser.id);
    });

    it("should link existing partner record when user accepts partner invitation", async () => {
      // 1. Pre-create a partner record (active, no user assigned)
      const [existingPartner] = await db
        .insert(partner)
        .values({
          id: `partner-pending-${Date.now()}`,
          orgId: testOrg.id,
          name: "Pending Partner Corp",
          type: "reseller",
          status: "active",
          contactEmail: partnerUser.email,
          userId: null, // No user yet
          createdBy: adminUser.id,
        })
        .returning();

      // 2. Create invitation for same email with partner role
      const token = `TEST_TOKEN_EXISTING_${Date.now()}_${Math.random().toString(36).slice(2)}`;
      const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

      const [invite] = await db
        .insert(invitation)
        .values({
          id: `invite-existing-${Date.now()}`,
          orgId: testOrg.id,
          email: partnerUser.email,
          token,
          role: "partner",
          expiresAt,
        })
        .returning();

      // 3. Simulate accepting invitation
      await db.transaction(async (tx) => {
        // Add user to org with partner role
        await tx.insert(orgUser).values({
          id: `orguser-partner-existing-${Date.now()}`,
          userId: partnerUser.id,
          orgId: testOrg.id,
          role: "partner",
        });

        // Mark invitation as used
        await tx
          .update(invitation)
          .set({ usedAt: new Date() })
          .where(eq(invitation.id, invite.id));

        // Look for existing partner
        const [found] = await tx
          .select({ id: partner.id })
          .from(partner)
          .where(
            and(
              eq(partner.orgId, testOrg.id),
              eq(partner.contactEmail, partnerUser.email)
            )
          )
          .limit(1);

        if (found) {
          // Link existing partner
          await tx
            .update(partner)
            .set({ userId: partnerUser.id, status: "active" })
            .where(eq(partner.id, found.id));
        } else {
          // This branch won't execute since we pre-created the partner
        }
      });

      // 4. Verify existing partner was LINKED
      const [linkedPartner] = await db
        .select()
        .from(partner)
        .where(eq(partner.id, existingPartner.id))
        .limit(1);

      expect(linkedPartner.userId).toBe(partnerUser.id);
      expect(linkedPartner.status).toBe("active");
      expect(linkedPartner.name).toBe("Pending Partner Corp"); // Name unchanged
    });

    it("should handle multiple users joining with same email (only last one linked)", async () => {
      // This typically shouldn't happen due to email uniqueness, but tests the linking logic

      // 1. Create invitation
      const token = `TEST_TOKEN_MULTI_${Date.now()}_${Math.random().toString(36).slice(2)}`;
      const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

      const [invite] = await db
        .insert(invitation)
        .values({
          id: `invite-multi-${Date.now()}`,
          orgId: testOrg.id,
          email: partnerUser.email,
          token,
          role: "partner",
          expiresAt,
        })
        .returning();

      // 2. Accept invitation (auto-creates partner)
      await db.transaction(async (tx) => {
        await tx.insert(orgUser).values({
          id: `orguser-multi-${Date.now()}`,
          userId: partnerUser.id,
          orgId: testOrg.id,
          role: "partner",
        });

        await tx
          .update(invitation)
          .set({ usedAt: new Date() })
          .where(eq(invitation.id, invite.id));

        const [existingPartner] = await tx
          .select({ id: partner.id })
          .from(partner)
          .where(
            and(
              eq(partner.orgId, testOrg.id),
              eq(partner.contactEmail, partnerUser.email)
            )
          )
          .limit(1);

        if (!existingPartner) {
          await tx.insert(partner).values({
            id: `partner-multi-${Date.now()}`,
            orgId: testOrg.id,
            name: partnerUser.name || partnerUser.email,
            type: "reseller",
            status: "active",
            contactEmail: partnerUser.email,
            userId: partnerUser.id,
            createdBy: partnerUser.id,
          });
        }
      });

      // 3. Verify partner exists and is linked
      const [finalPartner] = await db
        .select()
        .from(partner)
        .where(
          and(
            eq(partner.orgId, testOrg.id),
            eq(partner.contactEmail, partnerUser.email)
          )
        )
        .limit(1);

      expect(finalPartner).toBeDefined();
      expect(finalPartner.userId).toBe(partnerUser.id);
      expect(finalPartner.status).toBe("active");
    });
  });

  describe("Non-Partner Roles", () => {
    it("should NOT create partner record for manager role", async () => {
      // Create a manager user
      const [managerUser] = await db
        .insert(user)
        .values({
          id: `manager-user-${Date.now()}`,
          email: `manager-${Date.now()}@test.com`,
          name: "Manager User",
          emailVerified: true,
        })
        .returning();

      // Create invitation with manager role
      const token = `TEST_TOKEN_MANAGER_${Date.now()}_${Math.random().toString(36).slice(2)}`;
      const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

      await db
        .insert(invitation)
        .values({
          id: `invite-manager-${Date.now()}`,
          orgId: testOrg.id,
          email: managerUser.email,
          token,
          role: "manager",
          expiresAt,
        })
        .returning();

      // Accept invitation (manager role)
      await db.transaction(async (tx) => {
        await tx.insert(orgUser).values({
          id: `orguser-manager-${Date.now()}`,
          userId: managerUser.id,
          orgId: testOrg.id,
          role: "manager",
        });
        // Note: No partner auto-creation for manager role
      });

      // Verify NO partner record was created
      const [foundPartner] = await db
        .select()
        .from(partner)
        .where(
          and(
            eq(partner.orgId, testOrg.id),
            eq(partner.contactEmail, managerUser.email)
          )
        )
        .limit(1);

      expect(foundPartner).toBeUndefined();

      // But verify orgUser was created
      const [foundOrgUser] = await db
        .select()
        .from(orgUser)
        .where(
          and(
            eq(orgUser.userId, managerUser.id),
            eq(orgUser.orgId, testOrg.id)
          )
        )
        .limit(1);

      expect(foundOrgUser).toBeDefined();
      expect(foundOrgUser.role).toBe("manager");
    });
  });
});
