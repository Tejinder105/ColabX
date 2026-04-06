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
import { team } from "../teams/teams.schema.js";

export const dealStageEnum = pgEnum("dealStage", [
    "lead",
    "proposal",
    "negotiation",
    "won",
    "lost",
]);
export const dealTaskStatusEnum = pgEnum("dealTaskStatus", [
    "todo",
    "in_progress",
    "done",
]);
export const dealDocumentVisibilityEnum = pgEnum("dealDocumentVisibility", [
    "shared",
    "internal",
]);

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
        teamId: text("teamId")
            .references(() => team.id, {
                onDelete: "cascade",
            }),
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
        index("deal_teamId_idx").on(table.teamId),
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

// DealMessage table — messages/chat within a deal
export const dealMessage = pgTable(
    "dealMessage",
    {
        id: text("id").primaryKey(),
        dealId: text("dealId")
            .notNull()
            .references(() => deal.id, { onDelete: "cascade" }),
        senderId: text("senderId")
            .notNull()
            .references(() => user.id, { onDelete: "cascade" }),
        content: text("content").notNull(),
        createdAt: timestamp("createdAt").defaultNow().notNull(),
    },
    (table) => [
        index("dealMessage_dealId_idx").on(table.dealId),
        index("dealMessage_senderId_idx").on(table.senderId),
        index("dealMessage_createdAt_idx").on(table.createdAt),
    ]
);

export const dealTask = pgTable(
    "dealTask",
    {
        id: text("id").primaryKey(),
        dealId: text("dealId")
            .notNull()
            .references(() => deal.id, { onDelete: "cascade" }),
        title: text("title").notNull(),
        description: text("description"),
        assigneeUserId: text("assigneeUserId").references(() => user.id, {
            onDelete: "set null",
        }),
        status: dealTaskStatusEnum("status").notNull().default("todo"),
        dueDate: timestamp("dueDate"),
        createdBy: text("createdBy").references(() => user.id, {
            onDelete: "set null",
        }),
        createdAt: timestamp("createdAt").defaultNow().notNull(),
        updatedAt: timestamp("updatedAt")
            .defaultNow()
            .$onUpdate(() => new Date())
            .notNull(),
        completedAt: timestamp("completedAt"),
    },
    (table) => [
        index("dealTask_dealId_idx").on(table.dealId),
        index("dealTask_assigneeUserId_idx").on(table.assigneeUserId),
        index("dealTask_status_idx").on(table.status),
    ]
);

export const dealDocument = pgTable(
    "dealDocument",
    {
        id: text("id").primaryKey(),
        dealId: text("dealId")
            .notNull()
            .references(() => deal.id, { onDelete: "cascade" }),
        uploadedBy: text("uploadedBy")
            .notNull()
            .references(() => user.id, { onDelete: "cascade" }),
        fileName: text("fileName").notNull(),
        fileUrl: text("fileUrl").notNull(),
        visibility: dealDocumentVisibilityEnum("visibility").notNull().default("shared"),
        uploadedAt: timestamp("uploadedAt").defaultNow().notNull(),
    },
    (table) => [
        index("dealDocument_dealId_idx").on(table.dealId),
        index("dealDocument_uploadedBy_idx").on(table.uploadedBy),
        index("dealDocument_visibility_idx").on(table.visibility),
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
    team: one(team, {
        fields: [deal.teamId],
        references: [team.id],
    }),
    creator: one(user, {
        fields: [deal.createdBy],
        references: [user.id],
    }),
    assignments: many(dealAssignment),
    messages: many(dealMessage),
    tasks: many(dealTask),
    documents: many(dealDocument),
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

export const dealMessageRelations = relations(dealMessage, ({ one }) => ({
    deal: one(deal, {
        fields: [dealMessage.dealId],
        references: [deal.id],
    }),
    sender: one(user, {
        fields: [dealMessage.senderId],
        references: [user.id],
    }),
}));

export const dealTaskRelations = relations(dealTask, ({ one }) => ({
    deal: one(deal, {
        fields: [dealTask.dealId],
        references: [deal.id],
    }),
    assignee: one(user, {
        fields: [dealTask.assigneeUserId],
        references: [user.id],
        relationName: "dealTaskAssignee",
    }),
    creator: one(user, {
        fields: [dealTask.createdBy],
        references: [user.id],
        relationName: "dealTaskCreator",
    }),
}));

export const dealDocumentRelations = relations(dealDocument, ({ one }) => ({
    deal: one(deal, {
        fields: [dealDocument.dealId],
        references: [deal.id],
    }),
    uploader: one(user, {
        fields: [dealDocument.uploadedBy],
        references: [user.id],
    }),
}));
