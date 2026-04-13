import { relations } from "drizzle-orm";
import {
    pgTable,
    text,
    timestamp,
    index,
    pgEnum,
} from "drizzle-orm/pg-core";
import { user } from "./authSchema.js";
import { ORG_ROLES } from "../org/org.constants.js";

export const roleEnum = pgEnum("orgRole", ORG_ROLES);

// Partner-specific enums for invitation (reuse from partners schema)
export const invitePartnerTypeEnum = pgEnum("invitePartnerType", [
    "reseller",
    "agent",
    "technology",
    "distributor",
]);

// Organization table
export const organization = pgTable("organization", {
    organizationId: text("organizationId").primaryKey(),
    name: text("name").notNull(),
    slug: text("slug").notNull().unique(),
    logo: text("logo"),
    industry: text("industry"),
    timezone: text("timezone"),
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
        orgUserId: text("orgUserId").primaryKey(),
        userId: text("userId")
            .notNull()
            .references(() => user.id, { onDelete: "cascade" }),
        organizationId: text("organizationId")
            .notNull()
            .references(() => organization.organizationId, { onDelete: "cascade" }),
        role: roleEnum("role").notNull().default("partner"),
        joinedAt: timestamp("joinedAt").defaultNow().notNull(),
    },
    (table) => [
        index("orgUser_userId_idx").on(table.userId),
        index("orgUser_organizationId_idx").on(table.organizationId),
    ]
);

// Invitation table
export const invitation = pgTable(
    "invitation",
    {
        invitationId: text("invitationId").primaryKey(),
        organizationId: text("organizationId")
            .notNull()
            .references(() => organization.organizationId, { onDelete: "cascade" }),
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
        index("invitation_organizationId_idx").on(table.organizationId),
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
        fields: [orgUser.organizationId],
        references: [organization.organizationId],
    }),
}));

export const invitationRelations = relations(invitation, ({ one }) => ({
    organization: one(organization, {
        fields: [invitation.organizationId],
        references: [organization.organizationId],
    }),
}));
