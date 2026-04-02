import { eq, and, desc } from "drizzle-orm";
import db from "../db/index.js";
import { communication, document, activityLog } from "../schemas/collaborationSchema.js";
import { user } from "../schemas/authSchema.js";
import { partner } from "../partners/partners.schema.js";

// Communications ->

export async function createCommunication(
    orgId: string,
    partnerId: string,
    senderId: string,
    message: string
) {
    const [created] = await db
        .insert(communication)
        .values({
            id: crypto.randomUUID(),
            orgId,
            partnerId,
            senderId,
            message,
        })
        .returning();

    return created;
}

export async function getPartnerCommunications(partnerId: string) {
    return db
        .select({
            id: communication.id,
            message: communication.message,
            createdAt: communication.createdAt,
            senderId: communication.senderId,
            senderName: user.name,
            senderEmail: user.email,
        })
        .from(communication)
        .leftJoin(user, eq(communication.senderId, user.id))
        .where(eq(communication.partnerId, partnerId))
        .orderBy(desc(communication.createdAt));
}

// Documents ->

export async function createDocument(
    orgId: string,
    partnerId: string,
    uploadedBy: string,
    data: {
        fileName: string;
        fileUrl: string;
        visibility: string;
    }
) {
    const [created] = await db
        .insert(document)
        .values({
            id: crypto.randomUUID(),
            orgId,
            partnerId,
            uploadedBy,
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
            id: document.id,
            partnerId: document.partnerId,
            partnerName: partner.name,
            fileName: document.fileName,
            fileUrl: document.fileUrl,
            visibility: document.visibility,
            uploadedAt: document.uploadedAt,
            uploadedBy: document.uploadedBy,
            uploaderName: user.name,
        })
        .from(document)
        .leftJoin(partner, eq(document.partnerId, partner.id))
        .leftJoin(user, eq(document.uploadedBy, user.id))
        .where(eq(document.partnerId, partnerId))
        .orderBy(desc(document.uploadedAt));
}

export async function getOrgDocuments(orgId: string, visibilityFilter?: string) {
    const conditions = [eq(document.orgId, orgId)];
    if (visibilityFilter) {
        conditions.push(eq(document.visibility, visibilityFilter));
    }

    return db
        .select({
            id: document.id,
            partnerId: document.partnerId,
            partnerName: partner.name,
            fileName: document.fileName,
            fileUrl: document.fileUrl,
            visibility: document.visibility,
            uploadedAt: document.uploadedAt,
            uploadedBy: document.uploadedBy,
            uploaderName: user.name,
        })
        .from(document)
        .leftJoin(partner, eq(document.partnerId, partner.id))
        .leftJoin(user, eq(document.uploadedBy, user.id))
        .where(and(...conditions))
        .orderBy(desc(document.uploadedAt));
}

export async function getDocumentById(documentId: string, orgId: string) {
    const [result] = await db
        .select()
        .from(document)
        .where(and(eq(document.id, documentId), eq(document.orgId, orgId)))
        .limit(1);

    return result;
}

export async function deleteDocument(documentId: string) {
    const [deleted] = await db
        .delete(document)
        .where(eq(document.id, documentId))
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
        .where(eq(document.id, documentId))
        .returning();

    return updated;
}

// Activity Logs ->

export async function createActivity(
    orgId: string,
    userId: string,
    entityType: string,
    entityId: string,
    action: string
) {
    const [created] = await db
        .insert(activityLog)
        .values({
            id: crypto.randomUUID(),
            orgId,
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
            id: activityLog.id,
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
