import { relations } from "drizzle-orm";
import {
    pgTable,
    text,
    real,
    timestamp,
    index,
    uniqueIndex,
    pgEnum,
} from "drizzle-orm/pg-core";
import { organization } from "../schemas/orgSchema.js";
import { partner } from "../partners/partners.schema.js";
import { user } from "../schemas/authSchema.js";

export const dealStageEnum = pgEnum("dealStage", [
    "lead",
    "proposal",
    "negotiation",
    "won",
    "lost",
]);

// Deal table — a business opportunity linked to a partner within an org
export const deal = pgTable(
    "deal",
    {
        id: text("id").primaryKey(),
        orgId: text("orgId")
            .notNull()
            .references(() => organization.id, { onDelete: "cascade" }),
        partnerId: text("partnerId")
            .notNull()
            .references(() => partner.id, { onDelete: "cascade" }),
        title: text("title").notNull(),
        description: text("description"),
        value: real("value"),
        stage: dealStageEnum("stage").notNull().default("lead"),
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
        index("deal_orgId_idx").on(table.orgId),
        index("deal_partnerId_idx").on(table.partnerId),
        index("deal_stage_idx").on(table.stage),
    ]
);

// DealAssignment table — assigns users to deals for collaboration
export const dealAssignment = pgTable(
    "dealAssignment",
    {
        id: text("id").primaryKey(),
        dealId: text("dealId")
            .notNull()
            .references(() => deal.id, { onDelete: "cascade" }),
        userId: text("userId")
            .notNull()
            .references(() => user.id, { onDelete: "cascade" }),
        assignedAt: timestamp("assignedAt").defaultNow().notNull(),
    },
    (table) => [
        uniqueIndex("dealAssignment_dealId_userId_unique").on(
            table.dealId,
            table.userId
        ),
        index("dealAssignment_dealId_idx").on(table.dealId),
        index("dealAssignment_userId_idx").on(table.userId),
    ]
);

// Relations
export const dealRelations = relations(deal, ({ one, many }) => ({
    organization: one(organization, {
        fields: [deal.orgId],
        references: [organization.id],
    }),
    partner: one(partner, {
        fields: [deal.partnerId],
        references: [partner.id],
    }),
    creator: one(user, {
        fields: [deal.createdBy],
        references: [user.id],
    }),
    assignments: many(dealAssignment),
}));

export const dealAssignmentRelations = relations(dealAssignment, ({ one }) => ({
    deal: one(deal, {
        fields: [dealAssignment.dealId],
        references: [deal.id],
    }),
    user: one(user, {
        fields: [dealAssignment.userId],
        references: [user.id],
    }),
}));
