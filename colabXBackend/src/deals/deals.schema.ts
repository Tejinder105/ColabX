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
        dealId: text("dealId").primaryKey(),
        organizationId: text("organizationId")
            .notNull()
            .references(() => organization.organizationId, { onDelete: "cascade" }),
        partnerId: text("partnerId")
            .notNull()
            .references(() => partner.partnerId, { onDelete: "cascade" }),
        teamId: text("teamId")
            .references(() => team.teamId, {
                onDelete: "cascade",
            }),
        title: text("title").notNull(),
        description: text("description"),
        value: real("value"),
        stage: dealStageEnum("stage").notNull().default("lead"),
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
        index("deal_organizationId_idx").on(table.organizationId),
        index("deal_partnerId_idx").on(table.partnerId),
        index("deal_teamId_idx").on(table.teamId),
        index("deal_stage_idx").on(table.stage),
    ]
);

// DealAssignment table — assigns users to deals for collaboration
export const dealAssignment = pgTable(
    "dealAssignment",
    {
        dealAssignmentId: text("dealAssignmentId").primaryKey(),
        dealId: text("dealId")
            .notNull()
            .references(() => deal.dealId, { onDelete: "cascade" }),
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
        dealMessageId: text("dealMessageId").primaryKey(),
        dealId: text("dealId")
            .notNull()
            .references(() => deal.dealId, { onDelete: "cascade" }),
        senderUserId: text("senderUserId")
            .notNull()
            .references(() => user.id, { onDelete: "cascade" }),
        content: text("content").notNull(),
        createdAt: timestamp("createdAt").defaultNow().notNull(),
    },
    (table) => [
        index("dealMessage_dealId_idx").on(table.dealId),
        index("dealMessage_senderUserId_idx").on(table.senderUserId),
        index("dealMessage_createdAt_idx").on(table.createdAt),
    ]
);

export const dealTask = pgTable(
    "dealTask",
    {
        dealTaskId: text("dealTaskId").primaryKey(),
        dealId: text("dealId")
            .notNull()
            .references(() => deal.dealId, { onDelete: "cascade" }),
        title: text("title").notNull(),
        description: text("description"),
        assigneeUserId: text("assigneeUserId").references(() => user.id, {
            onDelete: "set null",
        }),
        status: dealTaskStatusEnum("status").notNull().default("todo"),
        dueDate: timestamp("dueDate"),
        createdByUserId: text("createdByUserId").references(() => user.id, {
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
        dealDocumentId: text("dealDocumentId").primaryKey(),
        dealId: text("dealId")
            .notNull()
            .references(() => deal.dealId, { onDelete: "cascade" }),
        uploadedByUserId: text("uploadedByUserId")
            .notNull()
            .references(() => user.id, { onDelete: "cascade" }),
        fileName: text("fileName").notNull(),
        fileUrl: text("fileUrl").notNull(),
        visibility: dealDocumentVisibilityEnum("visibility").notNull().default("shared"),
        uploadedAt: timestamp("uploadedAt").defaultNow().notNull(),
    },
    (table) => [
        index("dealDocument_dealId_idx").on(table.dealId),
        index("dealDocument_uploadedByUserId_idx").on(table.uploadedByUserId),
        index("dealDocument_visibility_idx").on(table.visibility),
    ]
);

// Relations
export const dealRelations = relations(deal, ({ one, many }) => ({
    organization: one(organization, {
        fields: [deal.organizationId],
        references: [organization.organizationId],
    }),
    partner: one(partner, {
        fields: [deal.partnerId],
        references: [partner.partnerId],
    }),
    team: one(team, {
        fields: [deal.teamId],
        references: [team.teamId],
    }),
    creator: one(user, {
        fields: [deal.createdByUserId],
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
        references: [deal.dealId],
    }),
    user: one(user, {
        fields: [dealAssignment.userId],
        references: [user.id],
    }),
}));

export const dealMessageRelations = relations(dealMessage, ({ one }) => ({
    deal: one(deal, {
        fields: [dealMessage.dealId],
        references: [deal.dealId],
    }),
    sender: one(user, {
        fields: [dealMessage.senderUserId],
        references: [user.id],
    }),
}));

export const dealTaskRelations = relations(dealTask, ({ one }) => ({
    deal: one(deal, {
        fields: [dealTask.dealId],
        references: [deal.dealId],
    }),
    assignee: one(user, {
        fields: [dealTask.assigneeUserId],
        references: [user.id],
        relationName: "dealTaskAssignee",
    }),
    creator: one(user, {
        fields: [dealTask.createdByUserId],
        references: [user.id],
        relationName: "dealTaskCreator",
    }),
}));

export const dealDocumentRelations = relations(dealDocument, ({ one }) => ({
    deal: one(deal, {
        fields: [dealDocument.dealId],
        references: [deal.dealId],
    }),
    uploader: one(user, {
        fields: [dealDocument.uploadedByUserId],
        references: [user.id],
    }),
}));
