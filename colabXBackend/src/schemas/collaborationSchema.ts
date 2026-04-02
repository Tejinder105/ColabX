import { relations } from "drizzle-orm";
import { pgTable, text, timestamp, index } from "drizzle-orm/pg-core";
import { organization } from "./orgSchema.js";
import { partner } from "../partners/partners.schema.js";
import { user } from "./authSchema.js";

export const communication = pgTable(
    "communication",
    {
        id: text("id").primaryKey(),
        orgId: text("orgId")
            .notNull()
            .references(() => organization.id, { onDelete: "cascade" }),
        partnerId: text("partnerId")
            .notNull()
            .references(() => partner.id, { onDelete: "cascade" }),
        senderId: text("senderId")
            .notNull()
            .references(() => user.id, { onDelete: "cascade" }),
        message: text("message").notNull(),
        createdAt: timestamp("createdAt").defaultNow().notNull(),
    },
    (table) => [
        index("communication_orgId_idx").on(table.orgId),
        index("communication_partnerId_idx").on(table.partnerId),
        index("communication_senderId_idx").on(table.senderId),
    ]
);

export const document = pgTable(
    "document",
    {
        id: text("id").primaryKey(),
        orgId: text("orgId")
            .notNull()
            .references(() => organization.id, { onDelete: "cascade" }),
        partnerId: text("partnerId")
            .notNull()
            .references(() => partner.id, { onDelete: "cascade" }),
        uploadedBy: text("uploadedBy")
            .notNull()
            .references(() => user.id, { onDelete: "cascade" }),
        fileName: text("fileName").notNull(),
        fileUrl: text("fileUrl").notNull(),
        visibility: text("visibility").notNull(),
        uploadedAt: timestamp("uploadedAt").defaultNow().notNull(),
    },
    (table) => [
        index("document_orgId_idx").on(table.orgId),
        index("document_partnerId_idx").on(table.partnerId),
        index("document_uploadedBy_idx").on(table.uploadedBy),
    ]
);

export const activityLog = pgTable(
    "activityLog",
    {
        id: text("id").primaryKey(),
        orgId: text("orgId")
            .notNull()
            .references(() => organization.id, { onDelete: "cascade" }),
        userId: text("userId")
            .notNull()
            .references(() => user.id, { onDelete: "cascade" }),
        entityType: text("entityType").notNull(),
        entityId: text("entityId").notNull(),
        action: text("action").notNull(),
        createdAt: timestamp("createdAt").defaultNow().notNull(),
    },
    (table) => [
        index("activityLog_orgId_idx").on(table.orgId),
        index("activityLog_userId_idx").on(table.userId),
        index("activityLog_entityType_idx").on(table.entityType),
    ]
);

export const communicationRelations = relations(communication, ({ one }) => ({
    organization: one(organization, {
        fields: [communication.orgId],
        references: [organization.id],
    }),
    partner: one(partner, {
        fields: [communication.partnerId],
        references: [partner.id],
    }),
    sender: one(user, {
        fields: [communication.senderId],
        references: [user.id],
    }),
}));

export const documentRelations = relations(document, ({ one }) => ({
    organization: one(organization, {
        fields: [document.orgId],
        references: [organization.id],
    }),
    partner: one(partner, {
        fields: [document.partnerId],
        references: [partner.id],
    }),
    uploader: one(user, {
        fields: [document.uploadedBy],
        references: [user.id],
    }),
}));

export const activityLogRelations = relations(activityLog, ({ one }) => ({
    organization: one(organization, {
        fields: [activityLog.orgId],
        references: [organization.id],
    }),
    user: one(user, {
        fields: [activityLog.userId],
        references: [user.id],
    }),
}));
