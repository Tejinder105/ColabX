import { eq, and, count } from "drizzle-orm";
import db from "../db/index.js";
import { deal, dealAssignment } from "./deals.schema.js";
import { partner } from "../partners/partners.schema.js";
import { user } from "../schemas/authSchema.js";
import { orgUser } from "../schemas/orgSchema.js";

export async function createDeal(
    orgId: string,
    userId: string,
    data: {
        partnerId: string;
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
    filters?: { stage?: string; partnerId?: string; assignedUser?: string }
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

    const results = await db
        .select({
            id: deal.id,
            orgId: deal.orgId,
            partnerId: deal.partnerId,
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
        .leftJoin(dealAssignment, eq(deal.id, dealAssignment.dealId))
        .where(and(...conditions))
        .groupBy(deal.id, partner.name);

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

    return {
        deal: dealRow,
        partner: partnerRow[0] ?? null,
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
