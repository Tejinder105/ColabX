import { eq, and, count, asc } from "drizzle-orm";
import db from "../db/index.js";
import { deal, dealAssignment, dealMessage } from "./deals.schema.js";
import { partner } from "../partners/partners.schema.js";
import { user } from "../schemas/authSchema.js";
import { orgUser } from "../schemas/orgSchema.js";
import { team, teamMember, teamPartner } from "../teams/teams.schema.js";

export async function createDeal(
    organizationId: string,
    userId: string,
    data: {
        partnerId: string;
        teamId?: string;
        title: string;
        description?: string;
        value?: number;
    }
) {
    const [created] = await db
        .insert(deal)
        .values({
            dealId: crypto.randomUUID(),
            organizationId,
            partnerId: data.partnerId,
            teamId: data.teamId ?? null,
            title: data.title,
            description: data.description ?? null,
            value: data.value ?? null,
            createdByUserId: userId,
        })
        .returning();

    return created;
}

export async function getOrgDeals(
    organizationId: string,
    filters?: {
        stage?: string;
        partnerId?: string;
        assignedUser?: string;
        teamId?: string;
    }
) {
    const conditions = [eq(deal.organizationId, organizationId)];

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
            dealId: deal.dealId,
            organizationId: deal.organizationId,
            partnerId: deal.partnerId,
            teamId: deal.teamId,
            teamName: team.name,
            partnerName: partner.name,
            title: deal.title,
            description: deal.description,
            value: deal.value,
            stage: deal.stage,
            createdByUserId: deal.createdByUserId,
            createdAt: deal.createdAt,
            updatedAt: deal.updatedAt,
            assigneeCount: count(dealAssignment.dealAssignmentId),
        })
        .from(deal)
        .leftJoin(partner, eq(deal.partnerId, partner.partnerId))
        .leftJoin(team, eq(deal.teamId, team.teamId))
        .leftJoin(dealAssignment, eq(deal.dealId, dealAssignment.dealId))
        .where(and(...conditions))
        .groupBy(deal.dealId, partner.name, team.name);

    if (filters?.assignedUser) {
        const assignedDealIds = await db
            .select({ dealId: dealAssignment.dealId })
            .from(dealAssignment)
            .where(eq(dealAssignment.userId, filters.assignedUser));

        const assignedSet = new Set(assignedDealIds.map((r) => r.dealId));
        return results.filter((r) => assignedSet.has(r.dealId));
    }

    return results;
}

export async function getDealById(dealId: string, organizationId: string) {
    const [result] = await db
        .select()
        .from(deal)
        .where(and(eq(deal.dealId, dealId), eq(deal.organizationId, organizationId)))
        .limit(1);

    return result;
}

export async function getDealWithDetails(dealId: string) {
    const [dealRow] = await db
        .select()
        .from(deal)
        .where(eq(deal.dealId, dealId))
        .limit(1);

    const assignments = await db
        .select({
            dealAssignmentId: dealAssignment.dealAssignmentId,
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
              .select({ partnerId: partner.partnerId, name: partner.name })
              .from(partner)
              .where(eq(partner.partnerId, dealRow.partnerId))
              .limit(1)
        : [];

    const teamRow = dealRow?.teamId
        ? await db
              .select({ teamId: team.teamId, name: team.name, description: team.description })
              .from(team)
              .where(eq(team.teamId, dealRow.teamId))
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
        .where(eq(deal.dealId, dealId))
        .returning();

    return updated;
}

export async function softDeleteDeal(dealId: string) {
    const [updated] = await db
        .update(deal)
        .set({ stage: "lost" })
        .where(eq(deal.dealId, dealId))
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
        .select({ dealAssignmentId: dealAssignment.dealAssignmentId })
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

export async function getPartnerForUserInOrg(organizationId: string, userId: string) {
    const [result] = await db
        .select({
            partnerId: partner.partnerId,
            organizationId: partner.organizationId,
            userId: partner.userId,
        })
        .from(partner)
        .where(and(eq(partner.organizationId, organizationId), eq(partner.userId, userId)))
        .limit(1);

    return result;
}

export async function assignUserToDeal(dealId: string, userId: string) {
    const [created] = await db
        .insert(dealAssignment)
        .values({
            dealAssignmentId: crypto.randomUUID(),
            dealId,
            userId,
        })
        .returning();

    return created;
}

export async function getDealAssignments(dealId: string) {
    return db
        .select({
            dealAssignmentId: dealAssignment.dealAssignmentId,
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

export async function isOrgMember(organizationId: string, userId: string): Promise<boolean> {
    const [result] = await db
        .select({ orgUserId: orgUser.orgUserId })
        .from(orgUser)
        .where(and(eq(orgUser.organizationId, organizationId), eq(orgUser.userId, userId)))
        .limit(1);

    return !!result;
}

export async function getPartnerByIdForOrg(partnerId: string, organizationId: string) {
    const [result] = await db
        .select()
        .from(partner)
        .where(and(eq(partner.partnerId, partnerId), eq(partner.organizationId, organizationId)))
        .limit(1);

    return result;
}

export async function getTeamByIdForOrg(teamId: string, organizationId: string) {
    const [result] = await db
        .select()
        .from(team)
        .where(and(eq(team.teamId, teamId), eq(team.organizationId, organizationId)))
        .limit(1);

    return result;
}

export async function getTeamsForPartner(partnerId: string, organizationId: string) {
    return db
        .select({
            teamId: team.teamId,
            name: team.name,
            description: team.description,
        })
        .from(teamPartner)
        .innerJoin(team, eq(teamPartner.teamId, team.teamId))
        .where(and(eq(teamPartner.partnerId, partnerId), eq(team.organizationId, organizationId)));
}

export async function isPartnerAssignedToTeam(
    teamId: string,
    partnerId: string
): Promise<boolean> {
    const [result] = await db
        .select({ teamPartnerId: teamPartner.teamPartnerId })
        .from(teamPartner)
        .where(and(eq(teamPartner.teamId, teamId), eq(teamPartner.partnerId, partnerId)))
        .limit(1);

    return !!result;
}

export async function isUserInTeam(teamId: string, userId: string): Promise<boolean> {
    const [result] = await db
        .select({ teamMemberId: teamMember.teamMemberId })
        .from(teamMember)
        .where(and(eq(teamMember.teamId, teamId), eq(teamMember.userId, userId)))
        .limit(1);

    return !!result;
}

// ── Deal Message Functions ─────────────────────────────────────────────────────

export async function createDealMessage(dealId: string, senderUserId: string, content: string) {
    const [created] = await db
        .insert(dealMessage)
        .values({
            dealMessageId: crypto.randomUUID(),
            dealId,
            senderUserId,
            content,
        })
        .returning();

    return created;
}

export async function getDealMessages(dealId: string) {
    return db
        .select({
            dealMessageId: dealMessage.dealMessageId,
            dealId: dealMessage.dealId,
            senderUserId: dealMessage.senderUserId,
            content: dealMessage.content,
            createdAt: dealMessage.createdAt,
            senderName: user.name,
            senderEmail: user.email,
            senderImage: user.image,
        })
        .from(dealMessage)
        .innerJoin(user, eq(dealMessage.senderUserId, user.id))
        .where(eq(dealMessage.dealId, dealId))
        .orderBy(asc(dealMessage.createdAt));
}

export async function deleteDealMessage(messageId: string) {
    const [deleted] = await db
        .delete(dealMessage)
        .where(eq(dealMessage.dealMessageId, messageId))
        .returning();

    return deleted;
}

export async function getDealMessageById(messageId: string) {
    const [result] = await db
        .select()
        .from(dealMessage)
        .where(eq(dealMessage.dealMessageId, messageId))
        .limit(1);

    return result;
}
