import { relations } from "drizzle-orm";
import {
    pgTable,
    text,
    timestamp,
    index,
    uniqueIndex,
    pgEnum,
} from "drizzle-orm/pg-core";
import { organization } from "../schemas/orgSchema.js";
import { user } from "../schemas/authSchema.js";
import { team } from "../teams/teams.schema.js";

export const partnerTypeEnum = pgEnum("partnerType", [
    "reseller",
    "agent",
    "technology",
    "distributor",
]);

export const partnerStatusEnum = pgEnum("partnerStatus", [
    "active",
    "inactive",
    "suspended",
]);

export const partnerUserRoleEnum = pgEnum("partnerUserRole", [
    "partner_admin",
    "partner_member",
]);

// Partner table — one partner belongs to one organization
export const partner = pgTable(
    "partner",
    {
        id: text("id").primaryKey(),
        orgId: text("orgId")
            .notNull()
            .references(() => organization.id, { onDelete: "cascade" }),
        name: text("name").notNull(),
        type: partnerTypeEnum("type").notNull(),
        status: partnerStatusEnum("status").notNull().default("active"),
        contactEmail: text("contactEmail"),
        industry: text("industry"),
        onboardingDate: timestamp("onboardingDate"),
        createdBy: text("createdBy").references(() => user.id, {
            onDelete: "set null",
        }),
        createdAt: timestamp("createdAt").defaultNow().notNull(),
        updatedAt: timestamp("updatedAt")
            .defaultNow()
            .$onUpdate(() => new Date())
            .notNull(),
    },
    (table) => [
        index("partner_orgId_idx").on(table.orgId),
        index("partner_createdBy_idx").on(table.createdBy),
        index("partner_status_idx").on(table.status),
    ]
);

// PartnerTeam table — links partners to teams
export const partnerTeam = pgTable(
    "partnerTeam",
    {
        id: text("id").primaryKey(),
        partnerId: text("partnerId")
            .notNull()
            .references(() => partner.id, { onDelete: "cascade" }),
        teamId: text("teamId")
            .notNull()
            .references(() => team.id, { onDelete: "cascade" }),
        assignedAt: timestamp("assignedAt").defaultNow().notNull(),
    },
    (table) => [
        uniqueIndex("partnerTeam_partnerId_teamId_unique").on(
            table.partnerId,
            table.teamId
        ),
        index("partnerTeam_partnerId_idx").on(table.partnerId),
        index("partnerTeam_teamId_idx").on(table.teamId),
    ]
);

// PartnerUser table — links users to partner organizations with a partner-level role
export const partnerUser = pgTable(
    "partnerUser",
    {
        id: text("id").primaryKey(),
        partnerId: text("partnerId")
            .notNull()
            .references(() => partner.id, { onDelete: "cascade" }),
        userId: text("userId")
            .notNull()
            .references(() => user.id, { onDelete: "cascade" }),
        role: partnerUserRoleEnum("role").notNull().default("partner_member"),
        joinedAt: timestamp("joinedAt").defaultNow().notNull(),
    },
    (table) => [
        uniqueIndex("partnerUser_partnerId_userId_unique").on(
            table.partnerId,
            table.userId
        ),
        index("partnerUser_partnerId_idx").on(table.partnerId),
        index("partnerUser_userId_idx").on(table.userId),
    ]
);

// Relations
export const partnerRelations = relations(partner, ({ one, many }) => ({
    organization: one(organization, {
        fields: [partner.orgId],
        references: [organization.id],
    }),
    creator: one(user, {
        fields: [partner.createdBy],
        references: [user.id],
    }),
    teams: many(partnerTeam),
    users: many(partnerUser),
}));

export const partnerTeamRelations = relations(partnerTeam, ({ one }) => ({
    partner: one(partner, {
        fields: [partnerTeam.partnerId],
        references: [partner.id],
    }),
    team: one(team, {
        fields: [partnerTeam.teamId],
        references: [team.id],
    }),
}));

export const partnerUserRelations = relations(partnerUser, ({ one }) => ({
    partner: one(partner, {
        fields: [partnerUser.partnerId],
        references: [partner.id],
    }),
    user: one(user, {
        fields: [partnerUser.userId],
        references: [user.id],
    }),
}));
