import { eq, and, desc } from "drizzle-orm";
import db from "../db/index.js";
import { communication, document, activityLog } from "../schemas/collaborationSchema.js";
import { user } from "../schemas/authSchema.js";
import { partner } from "../partners/partners.schema.js";

// Communications ->

export async function createCommunication(
    partnerId: string,
    senderUserId: string,
    message: string
) {
    const [created] = await db
        .insert(communication)
        .values({
            communicationId: crypto.randomUUID(),
            partnerId,
            senderUserId,
            message,
        })
        .returning();

    return created;
}

export async function getPartnerCommunications(partnerId: string) {
    return db
        .select({
            communicationId: communication.communicationId,
            message: communication.message,
            createdAt: communication.createdAt,
            senderUserId: communication.senderUserId,
            senderName: user.name,
            senderEmail: user.email,
        })
        .from(communication)
        .leftJoin(user, eq(communication.senderUserId, user.id))
        .where(eq(communication.partnerId, partnerId))
        .orderBy(desc(communication.createdAt));
}

// Documents ->

export async function createDocument(
    partnerId: string,
    uploadedByUserId: string,
    data: {
        fileName: string;
        fileUrl: string;
        visibility: string;
    }
) {
    const [created] = await db
        .insert(document)
        .values({
            documentId: crypto.randomUUID(),
            partnerId,
            uploadedByUserId,
            fileName: data.fileName,
            fileUrl: data.fileUrl,
            visibility: data.visibility,
        })
        .returning();

    return created;
}

export async function getPartnerDocuments(partnerId: string) {
    return db
        .select({
            documentId: document.documentId,
            partnerId: document.partnerId,
            partnerName: partner.name,
            fileName: document.fileName,
            fileUrl: document.fileUrl,
            visibility: document.visibility,
            uploadedAt: document.uploadedAt,
            uploadedByUserId: document.uploadedByUserId,
            uploaderName: user.name,
        })
        .from(document)
        .leftJoin(partner, eq(document.partnerId, partner.partnerId))
        .leftJoin(user, eq(document.uploadedByUserId, user.id))
        .where(eq(document.partnerId, partnerId))
        .orderBy(desc(document.uploadedAt));
}

export async function getOrgDocuments(organizationId: string, visibilityFilter?: string) {
    const conditions = [eq(partner.organizationId, organizationId)];
    if (visibilityFilter) {
        conditions.push(eq(document.visibility, visibilityFilter));
    }

    return db
        .select({
            documentId: document.documentId,
            partnerId: document.partnerId,
            partnerName: partner.name,
            fileName: document.fileName,
            fileUrl: document.fileUrl,
            visibility: document.visibility,
            uploadedAt: document.uploadedAt,
            uploadedByUserId: document.uploadedByUserId,
            uploaderName: user.name,
        })
        .from(document)
        .innerJoin(partner, eq(document.partnerId, partner.partnerId))
        .leftJoin(user, eq(document.uploadedByUserId, user.id))
        .where(and(...conditions))
        .orderBy(desc(document.uploadedAt));
}

export async function getDocumentById(documentId: string, organizationId: string) {
    const [result] = await db
        .select({
            documentId: document.documentId,
            partnerId: document.partnerId,
            uploadedByUserId: document.uploadedByUserId,
            fileName: document.fileName,
            fileUrl: document.fileUrl,
            visibility: document.visibility,
            uploadedAt: document.uploadedAt,
        })
        .from(document)
        .innerJoin(partner, eq(document.partnerId, partner.partnerId))
        .where(and(eq(document.documentId, documentId), eq(partner.organizationId, organizationId)))
        .limit(1);

    return result;
}

export async function deleteDocument(documentId: string) {
    const [deleted] = await db
        .delete(document)
        .where(eq(document.documentId, documentId))
        .returning();

    return deleted;
}

export async function updateDocumentVisibility(
    documentId: string,
    visibility: "public" | "private" | "team"
) {
    const [updated] = await db
        .update(document)
        .set({ visibility })
        .where(eq(document.documentId, documentId))
        .returning();

    return updated;
}

// Activity Logs ->

export async function createActivity(
    organizationId: string,
    userId: string,
    entityType: string,
    entityId: string,
    action: string
) {
    const [created] = await db
        .insert(activityLog)
        .values({
            activityLogId: crypto.randomUUID(),
            organizationId,
            userId,
            entityType,
            entityId,
            action,
        })
        .returning();

    return created;
}

export async function getPartnerActivities(partnerId: string) {
    return db
        .select({
            activityLogId: activityLog.activityLogId,
            action: activityLog.action,
            createdAt: activityLog.createdAt,
            userId: activityLog.userId,
            userName: user.name,
        })
        .from(activityLog)
        .leftJoin(user, eq(activityLog.userId, user.id))
        .where(and(
            eq(activityLog.entityType, "partner"),
            eq(activityLog.entityId, partnerId)
        ))
        .orderBy(desc(activityLog.createdAt))
        .limit(50);
}
