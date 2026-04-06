import { eq, and, count, asc } from "drizzle-orm";
import db from "../db/index.js";
import { deal, dealAssignment, dealMessage } from "./deals.schema.js";
import { partner } from "../partners/partners.schema.js";
import { user } from "../schemas/authSchema.js";
import { orgUser } from "../schemas/orgSchema.js";
import { team, teamMember, teamPartner } from "../teams/teams.schema.js";

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
        .groupBy(deal.id, partner.name, team.name);

    if (filters?.assignedUser) {
        const assignedDealIds = await db
            .select({ dealId: dealAssignment.dealId })
            .from(dealAssignment)
            .where(eq(dealAssignment.userId, filters.assignedUser));

        const assignedSet = new Set(assignedDealIds.map((r) => r.dealId));
        return results.filter((r) => assignedSet.has(r.id));
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

export async function getDealWithDetails(dealId: string) {
    const [dealRow] = await db
        .select()
        .from(deal)
        .where(eq(deal.id, dealId))
        .limit(1);

    const assignments = await db
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

    const partnerRow = dealRow
        ? await db
              .select({ id: partner.id, name: partner.name })
              .from(partner)
              .where(eq(partner.id, dealRow.partnerId))
              .limit(1)
        : [];

    const teamRow = dealRow?.teamId
        ? await db
              .select({ id: team.id, name: team.name, description: team.description })
              .from(team)
              .where(eq(team.id, dealRow.teamId))
              .limit(1)
        : [];

    return {
        deal: dealRow,
        partner: partnerRow[0] ?? null,
        team: teamRow?.[0] ?? null,
        assignments,
        activities: [],
    };
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
        .where(
            and(
                eq(dealAssignment.dealId, dealId),
                eq(dealAssignment.userId, userId)
            )
        )
        .limit(1);

    return result;
}

export async function isUserAssignedToDeal(dealId: string, userId: string): Promise<boolean> {
    const [result] = await db
        .select({ id: dealAssignment.id })
        .from(dealAssignment)
        .where(
            and(
                eq(dealAssignment.dealId, dealId),
                eq(dealAssignment.userId, userId)
            )
        )
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
        .where(
            and(
                eq(dealAssignment.dealId, dealId),
                eq(dealAssignment.userId, userId)
            )
        )
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

export async function getTeamsForPartner(partnerId: string, orgId: string) {
    return db
        .select({
            id: team.id,
            name: team.name,
            description: team.description,
        })
        .from(teamPartner)
        .innerJoin(team, eq(teamPartner.teamId, team.id))
        .where(and(eq(teamPartner.partnerId, partnerId), eq(team.orgId, orgId)));
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

// ── Deal Message Functions ─────────────────────────────────────────────────────

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
