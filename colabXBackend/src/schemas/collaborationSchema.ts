import { relations } from "drizzle-orm";
import { pgTable, text, timestamp, index, boolean } from "drizzle-orm/pg-core";
import { organization } from "./orgSchema.js";
import { partner } from "../partners/partners.schema.js";
import { user } from "./authSchema.js";

export const communication = pgTable(
    "communication",
    {
        communicationId: text("communicationId").primaryKey(),
        partnerId: text("partnerId")
            .notNull()
            .references(() => partner.partnerId, { onDelete: "cascade" }),
        senderUserId: text("senderUserId")
            .notNull()
            .references(() => user.id, { onDelete: "cascade" }),
        message: text("message").notNull(),
        createdAt: timestamp("createdAt").defaultNow().notNull(),
    },
    (table) => [
        index("communication_partnerId_idx").on(table.partnerId),
        index("communication_senderUserId_idx").on(table.senderUserId),
    ]
);

export const document = pgTable(
    "document",
    {
        documentId: text("documentId").primaryKey(),
        partnerId: text("partnerId")
            .notNull()
            .references(() => partner.partnerId, { onDelete: "cascade" }),
        uploadedByUserId: text("uploadedByUserId")
            .notNull()
            .references(() => user.id, { onDelete: "cascade" }),
        fileName: text("fileName").notNull(),
        fileUrl: text("fileUrl").notNull(),
        visibility: text("visibility").notNull(),
        uploadedAt: timestamp("uploadedAt").defaultNow().notNull(),
    },
    (table) => [
        index("document_partnerId_idx").on(table.partnerId),
        index("document_uploadedByUserId_idx").on(table.uploadedByUserId),
    ]
);

export const activityLog = pgTable(
    "activityLog",
    {
        activityLogId: text("activityLogId").primaryKey(),
        organizationId: text("organizationId")
            .notNull()
            .references(() => organization.organizationId, { onDelete: "cascade" }),
        userId: text("userId")
            .notNull()
            .references(() => user.id, { onDelete: "cascade" }),
        entityType: text("entityType").notNull(),
        entityId: text("entityId").notNull(),
        action: text("action").notNull(),
        createdAt: timestamp("createdAt").defaultNow().notNull(),
    },
    (table) => [
        index("activityLog_organizationId_idx").on(table.organizationId),
        index("activityLog_userId_idx").on(table.userId),
        index("activityLog_entityType_idx").on(table.entityType),
    ]
);

export const communicationRelations = relations(communication, ({ one }) => ({
    partner: one(partner, {
        fields: [communication.partnerId],
        references: [partner.partnerId],
    }),
    sender: one(user, {
        fields: [communication.senderUserId],
        references: [user.id],
    }),
}));

export const documentRelations = relations(document, ({ one }) => ({
    partner: one(partner, {
        fields: [document.partnerId],
        references: [partner.partnerId],
    }),
    uploader: one(user, {
        fields: [document.uploadedByUserId],
                         references: [user.id],
    }),
}));

export const activityLogRelations = relations(activityLog, ({ one }) => ({
    organization: one(organization, {
        fields: [activityLog.organizationId],
        references: [organization.organizationId],
    }),
    user: one(user, {
        fields: [activityLog.userId],
        references: [user.id],
    }),
}));

export const notification = pgTable(
    "notification",
    {
        notificationId: text("notificationId").primaryKey(),
        organizationId: text("organizationId")
            .notNull()
            .references(() => organization.organizationId, { onDelete: "cascade" }),
        recipientUserId: text("recipientUserId")
            .notNull()
            .references(() => user.id, { onDelete: "cascade" }),
        partnerId: text("partnerId").references(() => partner.partnerId, { onDelete: "cascade" }),
        alertType: text("alertType").notNull(), // 'missed_deadline', 'low_okr', 'pending_action'
        title: text("title").notNull(),
        message: text("message").notNull(),
        severity: text("severity").default("info"), // 'info', 'warning', 'critical'
        read: boolean("read").default(false),
        sentViaEmail: boolean("sentViaEmail").default(false),
        emailSentAt: timestamp("emailSentAt"),
        relatedEntityType: text("relatedEntityType"), // 'objective', 'dealTask', 'partner'
        relatedEntityId: text("relatedEntityId"),
        createdAt: timestamp("createdAt").defaultNow().notNull(),
        readAt: timestamp("readAt"),
    },
    (table) => [
        index("notification_organizationId_idx").on(table.organizationId),
        index("notification_recipientUserId_idx").on(table.recipientUserId),
        index("notification_partnerId_idx").on(table.partnerId),
        index("notification_alertType_idx").on(table.alertType),
        index("notification_read_idx").on(table.read),
    ]
);

export const notificationRelations = relations(notification, ({ one }) => ({
    organization: one(organization, {
        fields: [notification.organizationId],
        references: [organization.organizationId],
    }),
    recipient: one(user, {
        fields: [notification.recipientUserId],
        references: [user.id],
    }),
    partner: one(partner, {
        fields: [notification.partnerId],
        references: [partner.partnerId],
    }),
}));
