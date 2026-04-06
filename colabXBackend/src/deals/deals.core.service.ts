import { and, asc, count, desc, eq, inArray, or } from "drizzle-orm";
import db from "../db/index.js";
import { activityLog } from "../schemas/collaborationSchema.js";
import { user } from "../schemas/authSchema.js";
import { orgUser } from "../schemas/orgSchema.js";
import { partner } from "../partners/partners.schema.js";
import { team, teamMember, teamPartner } from "../teams/teams.schema.js";
import {
    deal,
    dealAssignment,
    dealDocument,
    dealMessage,
    dealTask,
} from "./deals.schema.js";
import type { OrgRole } from "../org/org.constants.js";

type DealTaskStatus = "todo" | "in_progress" | "done";
type DealDocumentVisibility = "shared" | "internal";

function uniqueIds(ids: string[]) {
    return [...new Set(ids.filter(Boolean))];
}

export async function createDeal(
    orgId: string,
    userId: string,
    data: {
        partnerId: string;
        teamId: string;
        title: string;
        description?: string;
        value?: number;
    }
) {
    const [created] = await db
        .insert(deal)
        .values({
            id: crypto.randomUUID(),
            orgId,
            partnerId: data.partnerId,
            teamId: data.teamId,
            title: data.title,
            description: data.description ?? null,
            value: data.value ?? null,
            createdBy: userId,
        })
        .returning();

    return created;
}

export async function getOrgDeals(
    orgId: string,
    filters?: {
        stage?: string;
        partnerId?: string;
        assignedUser?: string;
        teamId?: string;
        teamIds?: string[];
    }
) {
    const conditions = [eq(deal.orgId, orgId)];

    if (filters?.stage) {
        conditions.push(
            eq(deal.stage, filters.stage as "lead" | "proposal" | "negotiation" | "won" | "lost")
        );
    }

    if (filters?.partnerId) {
        conditions.push(eq(deal.partnerId, filters.partnerId));
    }

    if (filters?.teamId) {
        conditions.push(eq(deal.teamId, filters.teamId));
    } else if (filters?.teamIds) {
        if (filters.teamIds.length === 0) {
            return [];
        }

        conditions.push(inArray(deal.teamId, uniqueIds(filters.teamIds)));
    }

    const results = await db
        .select({
            id: deal.id,
            orgId: deal.orgId,
            partnerId: deal.partnerId,
            teamId: deal.teamId,
            teamName: team.name,
            partnerName: partner.name,
            title: deal.title,
            description: deal.description,
            value: deal.value,
            stage: deal.stage,
            createdBy: deal.createdBy,
            createdAt: deal.createdAt,
            updatedAt: deal.updatedAt,
            assigneeCount: count(dealAssignment.id),
        })
        .from(deal)
        .leftJoin(partner, eq(deal.partnerId, partner.id))
        .leftJoin(team, eq(deal.teamId, team.id))
        .leftJoin(dealAssignment, eq(deal.id, dealAssignment.dealId))
        .where(and(...conditions))
        .groupBy(deal.id, partner.name, team.name)
        .orderBy(desc(deal.updatedAt));

    if (filters?.assignedUser) {
        const assignedDealIds = await db
            .select({ dealId: dealAssignment.dealId })
            .from(dealAssignment)
            .where(eq(dealAssignment.userId, filters.assignedUser));

        const assignedSet = new Set(assignedDealIds.map((row) => row.dealId));
        return results.filter((row) => assignedSet.has(row.id));
    }

    return results;
}

export async function getDealById(dealId: string, orgId: string) {
    const [result] = await db
        .select()
        .from(deal)
        .where(and(eq(deal.id, dealId), eq(deal.orgId, orgId)))
        .limit(1);

    return result;
}

export async function updateDeal(
    dealId: string,
    data: Record<string, string | number | null | undefined>
) {
    const [updated] = await db
        .update(deal)
        .set(data)
        .where(eq(deal.id, dealId))
        .returning();

    return updated;
}

export async function softDeleteDeal(dealId: string) {
    const [updated] = await db
        .update(deal)
        .set({ stage: "lost" })
        .where(eq(deal.id, dealId))
        .returning();

    return updated;
}

export async function getDealAssignmentRecord(dealId: string, userId: string) {
    const [result] = await db
        .select()
        .from(dealAssignment)
        .where(and(eq(dealAssignment.dealId, dealId), eq(dealAssignment.userId, userId)))
        .limit(1);

    return result;
}

export async function isUserAssignedToDeal(dealId: string, userId: string): Promise<boolean> {
    const [result] = await db
        .select({ id: dealAssignment.id })
        .from(dealAssignment)
        .where(and(eq(dealAssignment.dealId, dealId), eq(dealAssignment.userId, userId)))
        .limit(1);

    return !!result;
}

export async function getPartnerForUserInOrg(orgId: string, userId: string) {
    const [result] = await db
        .select({ id: partner.id, orgId: partner.orgId, userId: partner.userId })
        .from(partner)
        .where(and(eq(partner.orgId, orgId), eq(partner.userId, userId)))
        .limit(1);

    return result;
}

export async function getPartnerIdsForUserInOrg(orgId: string, userId: string) {
    const rows = await db
        .select({ id: partner.id })
        .from(partner)
        .where(and(eq(partner.orgId, orgId), eq(partner.userId, userId)));

    return rows.map((row) => row.id);
}

export async function assignUserToDeal(dealId: string, userId: string) {
    const [created] = await db
        .insert(dealAssignment)
        .values({
            id: crypto.randomUUID(),
            dealId,
            userId,
        })
        .returning();

    return created;
}

export async function getDealAssignments(dealId: string) {
    return db
        .select({
            id: dealAssignment.id,
            dealId: dealAssignment.dealId,
            userId: dealAssignment.userId,
            assignedAt: dealAssignment.assignedAt,
            userName: user.name,
            userEmail: user.email,
            userImage: user.image,
        })
        .from(dealAssignment)
        .innerJoin(user, eq(dealAssignment.userId, user.id))
        .where(eq(dealAssignment.dealId, dealId));
}

export async function removeUserFromDeal(dealId: string, userId: string) {
    return db
        .delete(dealAssignment)
        .where(and(eq(dealAssignment.dealId, dealId), eq(dealAssignment.userId, userId)))
        .returning();
}

export async function isOrgMember(orgId: string, userId: string): Promise<boolean> {
    const [result] = await db
        .select({ id: orgUser.id })
        .from(orgUser)
        .where(and(eq(orgUser.orgId, orgId), eq(orgUser.userId, userId)))
        .limit(1);

    return !!result;
}

export async function getPartnerByIdForOrg(partnerId: string, orgId: string) {
    const [result] = await db
        .select()
        .from(partner)
        .where(and(eq(partner.id, partnerId), eq(partner.orgId, orgId)))
        .limit(1);

    return result;
}

export async function getTeamByIdForOrg(teamId: string, orgId: string) {
    const [result] = await db
        .select()
        .from(team)
        .where(and(eq(team.id, teamId), eq(team.orgId, orgId)))
        .limit(1);

    return result;
}

export async function getPartnerTeamAssignment(partnerId: string, orgId: string) {
    const [result] = await db
        .select({
            id: teamPartner.id,
            teamId: teamPartner.teamId,
            partnerId: teamPartner.partnerId,
        })
        .from(teamPartner)
        .innerJoin(team, eq(teamPartner.teamId, team.id))
        .where(and(eq(teamPartner.partnerId, partnerId), eq(team.orgId, orgId)))
        .limit(1);

    return result;
}

export async function isPartnerAssignedToTeam(
    teamId: string,
    partnerId: string
): Promise<boolean> {
    const [result] = await db
        .select({ id: teamPartner.id })
        .from(teamPartner)
        .where(and(eq(teamPartner.teamId, teamId), eq(teamPartner.partnerId, partnerId)))
        .limit(1);

    return !!result;
}

export async function isUserInTeam(teamId: string, userId: string): Promise<boolean> {
    const [result] = await db
        .select({ id: teamMember.id })
        .from(teamMember)
        .where(and(eq(teamMember.teamId, teamId), eq(teamMember.userId, userId)))
        .limit(1);

    return !!result;
}

export async function getScopedDealTeamIds(
    orgId: string,
    userId: string,
    role: OrgRole
) {
    if (role === "admin") {
        return null;
    }

    if (role === "partner") {
        const rows = await db
            .select({ teamId: teamPartner.teamId })
            .from(teamPartner)
            .innerJoin(partner, eq(teamPartner.partnerId, partner.id))
            .innerJoin(team, eq(teamPartner.teamId, team.id))
            .where(and(eq(team.orgId, orgId), eq(partner.userId, userId)));

        return uniqueIds(rows.map((row) => row.teamId));
    }

    const rows = await db
        .select({ teamId: teamMember.teamId })
        .from(teamMember)
        .innerJoin(team, eq(teamMember.teamId, team.id))
        .where(and(eq(team.orgId, orgId), eq(teamMember.userId, userId)));

    return uniqueIds(rows.map((row) => row.teamId));
}

export async function createDealMessage(dealId: string, senderId: string, content: string) {
    const [created] = await db
        .insert(dealMessage)
        .values({
            id: crypto.randomUUID(),
            dealId,
            senderId,
            content,
        })
        .returning();

    return created;
}

export async function getDealMessages(dealId: string) {
    return db
        .select({
            id: dealMessage.id,
            dealId: dealMessage.dealId,
            senderId: dealMessage.senderId,
            content: dealMessage.content,
            createdAt: dealMessage.createdAt,
            senderName: user.name,
            senderEmail: user.email,
            senderImage: user.image,
        })
        .from(dealMessage)
        .innerJoin(user, eq(dealMessage.senderId, user.id))
        .where(eq(dealMessage.dealId, dealId))
        .orderBy(asc(dealMessage.createdAt));
}

export async function deleteDealMessage(messageId: string) {
    const [deleted] = await db
        .delete(dealMessage)
        .where(eq(dealMessage.id, messageId))
        .returning();

    return deleted;
}

export async function getDealMessageById(messageId: string) {
    const [result] = await db
        .select()
        .from(dealMessage)
        .where(eq(dealMessage.id, messageId))
        .limit(1);

    return result;
}

export async function getDealTasks(dealId: string) {
    return db
        .select({
            id: dealTask.id,
            dealId: dealTask.dealId,
            title: dealTask.title,
            description: dealTask.description,
            assigneeUserId: dealTask.assigneeUserId,
            status: dealTask.status,
            dueDate: dealTask.dueDate,
            createdBy: dealTask.createdBy,
            createdAt: dealTask.createdAt,
            updatedAt: dealTask.updatedAt,
            completedAt: dealTask.completedAt,
            assigneeName: user.name,
            assigneeEmail: user.email,
        })
        .from(dealTask)
        .leftJoin(user, eq(dealTask.assigneeUserId, user.id))
        .where(eq(dealTask.dealId, dealId))
        .orderBy(asc(dealTask.createdAt));
}

export async function getDealTaskById(taskId: string) {
    const [result] = await db
        .select()
        .from(dealTask)
        .where(eq(dealTask.id, taskId))
        .limit(1);

    return result;
}

export async function createDealTask(
    dealId: string,
    createdBy: string,
    data: {
        title: string;
        description?: string;
        assigneeUserId?: string;
        dueDate?: string;
    }
) {
    const [created] = await db
        .insert(dealTask)
        .values({
            id: crypto.randomUUID(),
            dealId,
            title: data.title,
            description: data.description ?? null,
            assigneeUserId: data.assigneeUserId ?? null,
            dueDate: data.dueDate ? new Date(data.dueDate) : null,
            createdBy,
        })
        .returning();

    return created;
}

export async function updateDealTask(
    taskId: string,
    data: {
        title?: string;
        description?: string | null;
        assigneeUserId?: string | null;
        status?: DealTaskStatus;
        dueDate?: string | null;
    }
) {
    const updates: Record<string, string | Date | null> = {};

    if (data.title !== undefined) updates.title = data.title;
    if (data.description !== undefined) updates.description = data.description;
    if (data.assigneeUserId !== undefined) updates.assigneeUserId = data.assigneeUserId;
    if (data.status !== undefined) {
        updates.status = data.status;
        updates.completedAt = data.status === "done" ? new Date() : null;
    }
    if (data.dueDate !== undefined) {
        updates.dueDate = data.dueDate ? new Date(data.dueDate) : null;
    }

    const [updated] = await db
        .update(dealTask)
        .set(updates)
        .where(eq(dealTask.id, taskId))
        .returning();

    return updated;
}

export async function deleteDealTask(taskId: string) {
    const [deleted] = await db
        .delete(dealTask)
        .where(eq(dealTask.id, taskId))
        .returning();

    return deleted;
}

export async function getDealDocuments(
    dealId: string,
    options?: { visibility?: DealDocumentVisibility }
) {
    const conditions = [eq(dealDocument.dealId, dealId)];

    if (options?.visibility) {
        conditions.push(eq(dealDocument.visibility, options.visibility));
    }

    return db
        .select({
            id: dealDocument.id,
            dealId: dealDocument.dealId,
            fileName: dealDocument.fileName,
            fileUrl: dealDocument.fileUrl,
            visibility: dealDocument.visibility,
            uploadedAt: dealDocument.uploadedAt,
            uploadedBy: dealDocument.uploadedBy,
            uploaderName: user.name,
            uploaderEmail: user.email,
        })
        .from(dealDocument)
        .leftJoin(user, eq(dealDocument.uploadedBy, user.id))
        .where(and(...conditions))
        .orderBy(desc(dealDocument.uploadedAt));
}

export async function getDealDocumentById(documentId: string) {
    const [result] = await db
        .select()
        .from(dealDocument)
        .where(eq(dealDocument.id, documentId))
        .limit(1);

    return result;
}

export async function createDealDocument(
    dealId: string,
    uploadedBy: string,
    data: {
        fileName: string;
        fileUrl: string;
        visibility: DealDocumentVisibility;
    }
) {
    const [created] = await db
        .insert(dealDocument)
        .values({
            id: crypto.randomUUID(),
            dealId,
            uploadedBy,
            fileName: data.fileName,
            fileUrl: data.fileUrl,
            visibility: data.visibility,
        })
        .returning();

    return created;
}

export async function deleteDealDocument(documentId: string) {
    const [deleted] = await db
        .delete(dealDocument)
        .where(eq(dealDocument.id, documentId))
        .returning();

    return deleted;
}

export async function getDealActivities(dealId: string) {
    return db
        .select({
            id: activityLog.id,
            action: activityLog.action,
            entityType: activityLog.entityType,
            entityId: activityLog.entityId,
            createdAt: activityLog.createdAt,
            userId: activityLog.userId,
            userName: user.name,
        })
        .from(activityLog)
        .leftJoin(user, eq(activityLog.userId, user.id))
        .where(
            or(
                and(eq(activityLog.entityType, "deal"), eq(activityLog.entityId, dealId)),
                and(eq(activityLog.entityType, "deal_task"), eq(activityLog.entityId, dealId)),
                and(eq(activityLog.entityType, "deal_document"), eq(activityLog.entityId, dealId))
            )
        )
        .orderBy(desc(activityLog.createdAt))
        .limit(50);
}

export async function getDealWithDetails(
    dealId: string,
    options?: { audience?: "internal" | "partner" }
) {
    const [currentDeal, assignments, tasks, documents, activities] = await Promise.all([
        db.select().from(deal).where(eq(deal.id, dealId)).limit(1),
        getDealAssignments(dealId),
        getDealTasks(dealId),
        getDealDocuments(
            dealId,
            options?.audience === "partner" ? { visibility: "shared" } : undefined
        ),
        getDealActivities(dealId),
    ]);

    const dealRow = currentDeal[0] ?? null;
    if (!dealRow) {
        return {
            deal: null,
            partner: null,
            team: null,
            assignments: [],
            tasks: [],
            documents: [],
            activities: [],
        };
    }

    const [partnerRow] = await db
        .select({
            id: partner.id,
            name: partner.name,
            contactEmail: partner.contactEmail,
        })
        .from(partner)
        .where(eq(partner.id, dealRow.partnerId))
        .limit(1);

    const [teamRow] = await db
        .select({
            id: team.id,
            name: team.name,
            description: team.description,
        })
        .from(team)
        .where(eq(team.id, dealRow.teamId))
        .limit(1);

    const [leadRow] = await db
        .select({
            userId: teamMember.userId,
            name: user.name,
            email: user.email,
        })
        .from(teamMember)
        .innerJoin(user, eq(teamMember.userId, user.id))
        .where(and(eq(teamMember.teamId, dealRow.teamId), eq(teamMember.role, "lead")))
        .limit(1);

    return {
        deal: dealRow,
        partner: partnerRow ?? null,
        team: teamRow ? { ...teamRow, lead: leadRow ?? null } : null,
        assignments: options?.audience === "partner" ? [] : assignments,
        tasks: options?.audience === "partner" ? [] : tasks,
        documents,
        activities: options?.audience === "partner" ? [] : activities,
    };
}
