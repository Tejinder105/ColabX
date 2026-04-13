import { relations } from "drizzle-orm";
import {
    pgTable,
    text,
    timestamp,
    index,
    pgEnum,
    real,
} from "drizzle-orm/pg-core";
import { organization } from "../schemas/orgSchema.js";
import { user } from "../schemas/authSchema.js";
 
export const partnerTypeEnum = pgEnum("partnerType", [
    "reseller",
    "agent",
    "technology",
    "distributor",
]);

export const partnerStatusEnum = pgEnum("partnerStatus", [
    "pending",
    "active",
    "inactive",
    "suspended",
]);

// Partner table — one partner belongs to one organization
export const partner = pgTable(
    "partner",
    {
        partnerId: text("partnerId").primaryKey(),
        organizationId: text("organizationId")
            .notNull()
            .references(() => organization.organizationId, { onDelete: "cascade" }),
        name: text("name").notNull(),
        type: partnerTypeEnum("type").notNull(),
        status: partnerStatusEnum("status").notNull().default("pending"),
        contactEmail: text("contactEmail").notNull(),
        userId: text("userId").references(() => user.id, {
            onDelete: "set null",
        }),
        industry: text("industry"),
        onboardingDate: timestamp("onboardingDate"),
        score: real("score"),
        scoreCalculatedAt: timestamp("scoreCalculatedAt"),
        createdByUserId: text("createdByUserId").references(() => user.id, {
            onDelete: "set null",
        }),
        createdAt: timestamp("createdAt").defaultNow().notNull(),
        updatedAt: timestamp("updatedAt")
            .defaultNow()
            .$onUpdate(() => new Date())
            .notNull(),
    },
    (table) => [
        index("partner_organizationId_idx").on(table.organizationId),
        index("partner_createdByUserId_idx").on(table.createdByUserId),
        index("partner_userId_idx").on(table.userId),
        index("partner_status_idx").on(table.status),
    ]
);

// Relations
export const partnerRelations = relations(partner, ({ one }) => ({
    organization: one(organization, {
        fields: [partner.organizationId],
        references: [organization.organizationId],
    }),
    linkedUser: one(user, {
        fields: [partner.userId],
        references: [user.id],
        relationName: "partnerUser",
    }),
    creator: one(user, {
        fields: [partner.createdByUserId],
        references: [user.id],
        relationName: "partnerCreator",
    }),
}));
