import { relations } from "drizzle-orm";
import {
    pgTable,
    text,
    timestamp,
    index,
    pgEnum,
} from "drizzle-orm/pg-core";
import { user } from "./authSchema.js";

export const roleEnum = pgEnum("orgRole", ["admin", "manager", "partner"]);

// Partner-specific enums for invitation (reuse from partners schema)
export const invitePartnerTypeEnum = pgEnum("invitePartnerType", [
    "reseller",
    "agent",
    "technology",
    "distributor",
]);

// Organization table
export const organization = pgTable("organization", {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    slug: text("slug").notNull().unique(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt")
        .defaultNow()
        .$onUpdate(() => new Date())
        .notNull(),
});

// OrgUser -users<->organizations
export const orgUser = pgTable(
    "orgUser",
    {
        id: text("id").primaryKey(),
        userId: text("userId")
            .notNull()
            .references(() => user.id, { onDelete: "cascade" }),
        orgId: text("orgId")
            .notNull()
            .references(() => organization.id, { onDelete: "cascade" }),
        role: roleEnum("role").notNull().default("partner"),
        joinedAt: timestamp("joinedAt").defaultNow().notNull(),
    },
    (table) => [
        index("orgUser_userId_idx").on(table.userId),
        index("orgUser_orgId_idx").on(table.orgId),
    ]
);

// Invitation table
export const invitation = pgTable(
    "invitation",
    {
        id: text("id").primaryKey(),
        orgId: text("orgId")
            .notNull()
            .references(() => organization.id, { onDelete: "cascade" }),
        email: text("email").notNull(),
        token: text("token").notNull().unique(),
        role: roleEnum("role").notNull().default("partner"),
        // Partner-specific fields (only used when role="partner")
        partnerType: text("partnerType"), // reseller, agent, technology, distributor
        partnerIndustry: text("partnerIndustry"), // Finance, Healthcare, etc.
        expiresAt: timestamp("expiresAt").notNull(),
        usedAt: timestamp("usedAt"),
        createdAt: timestamp("createdAt").defaultNow().notNull(),
    },
    (table) => [
        index("invitation_orgId_idx").on(table.orgId),
        index("invitation_token_idx").on(table.token),
    ]
);

// Relations
export const organizationRelations = relations(organization, ({ many }) => ({
    members: many(orgUser),
    invitations: many(invitation),
}));

export const orgUserRelations = relations(orgUser, ({ one }) => ({
    user: one(user, {
        fields: [orgUser.userId],
        references: [user.id],
    }),
    organization: one(organization, {
        fields: [orgUser.orgId],
        references: [organization.id],
    }),
}));

export const invitationRelations = relations(invitation, ({ one }) => ({
    organization: one(organization, {
        fields: [invitation.orgId],
        references: [organization.id],
    }),
}));
