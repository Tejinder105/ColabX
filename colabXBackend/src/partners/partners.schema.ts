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
        id: text("id").primaryKey(),
        orgId: text("orgId")
            .notNull()
            .references(() => organization.id, { onDelete: "cascade" }),
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
        index("partner_userId_idx").on(table.userId),
        index("partner_status_idx").on(table.status),
    ]
);

// Relations
export const partnerRelations = relations(partner, ({ one }) => ({
    organization: one(organization, {
        fields: [partner.orgId],
        references: [organization.id],
    }),
    linkedUser: one(user, {
        fields: [partner.userId],
        references: [user.id],
        relationName: "partnerUser",
    }),
    creator: one(user, {
        fields: [partner.createdBy],
        references: [user.id],
        relationName: "partnerCreator",
    }),
}));
