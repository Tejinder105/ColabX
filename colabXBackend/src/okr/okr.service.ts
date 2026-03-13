import { eq, and, gte, lte, desc } from "drizzle-orm";
import db from "../db/index.js";
import {
    objective,
    keyResult,
    performanceMetric,
    partnerScore,
} from "./okr.schema.js";
import { user } from "../schemas/authSchema.js";
import { partner } from "../partners/partners.schema.js";

export async function createObjective(
    orgId: string,
    userId: string,
    data: {
        partnerId: string;
        title: string;
        description?: string;
        startDate: string;
        endDate: string;
    }
) {
    const [created] = await db
        .insert(objective)
        .values({
            id: crypto.randomUUID(),
            orgId,
            partnerId: data.partnerId,
            title: data.title,
            description: data.description ?? null,
            startDate: data.startDate,
            endDate: data.endDate,
            createdBy: userId,
        })
        .returning();

    return created;
}

export async function getOrgObjectives(
    orgId: string,
    filters?: {
        partnerId?: string;
        startDate?: string;
        endDate?: string;
    }
) {
    const conditions = [eq(objective.orgId, orgId)];

    if (filters?.partnerId) {
        conditions.push(eq(objective.partnerId, filters.partnerId));
    }
    if (filters?.startDate) {
        conditions.push(gte(objective.startDate, filters.startDate));
    }
    if (filters?.endDate) {
        conditions.push(lte(objective.endDate, filters.endDate));
    }

    return db
        .select({
            id: objective.id,
            orgId: objective.orgId,
            partnerId: objective.partnerId,
            partnerName: partner.name,
            title: objective.title,
            description: objective.description,
            startDate: objective.startDate,
            endDate: objective.endDate,
            createdBy: objective.createdBy,
            createdAt: objective.createdAt,
        })
        .from(objective)
        .leftJoin(partner, eq(objective.partnerId, partner.id))
        .where(and(...conditions))
        .orderBy(objective.createdAt);
}

export async function getObjectiveById(objectiveId: string, orgId: string) {
    const [result] = await db
        .select()
        .from(objective)
        .where(and(eq(objective.id, objectiveId), eq(objective.orgId, orgId)))
        .limit(1);

    return result;
}

export async function getObjectiveWithKeyResults(objectiveId: string) {
    const [objectiveRow] = await db
        .select({
            id: objective.id,
            orgId: objective.orgId,
            partnerId: objective.partnerId,
            partnerName: partner.name,
            title: objective.title,
            description: objective.description,
            startDate: objective.startDate,
            endDate: objective.endDate,
            createdBy: objective.createdBy,
            createdByName: user.name,
            createdAt: objective.createdAt,
            updatedAt: objective.updatedAt,
        })
        .from(objective)
        .leftJoin(partner, eq(objective.partnerId, partner.id))
        .leftJoin(user, eq(objective.createdBy, user.id))
        .where(eq(objective.id, objectiveId))
        .limit(1);

    const keyResults = await db
        .select()
        .from(keyResult)
        .where(eq(keyResult.objectiveId, objectiveId))
        .orderBy(keyResult.createdAt);

    let progressPercent = 0;
    if (keyResults.length > 0) {
        const total = keyResults.reduce((sum, kr) => {
            const krProgress =
                kr.targetValue > 0
                    ? (kr.currentValue / kr.targetValue) * 100
                    : 0;
            return sum + Math.min(krProgress, 100);
        }, 0);
        progressPercent = Math.round((total / keyResults.length) * 100) / 100;
    }

    return {
        objective: objectiveRow,
        keyResults,
        progressPercent,
    };
}

export async function updateObjective(
    objectiveId: string,
    data: Record<string, string | null | undefined>
) {
    const [updated] = await db
        .update(objective)
        .set(data)
        .where(eq(objective.id, objectiveId))
        .returning();

    return updated;
}

export async function archiveObjective(objectiveId: string) {
    return db
        .delete(objective)
        .where(eq(objective.id, objectiveId))
        .returning();
}

export async function createKeyResult(
    objectiveId: string,
    data: {
        targetValue: number;
        currentValue?: number;
        status?: "on_track" | "at_risk" | "off_track";
    }
) {
    const [created] = await db
        .insert(keyResult)
        .values({
            id: crypto.randomUUID(),
            objectiveId,
            targetValue: data.targetValue,
            currentValue: data.currentValue ?? 0,
            status: data.status ?? "on_track",
        })
        .returning();

    return created;
}

export async function getKeyResultById(keyResultId: string) {
    const [result] = await db
        .select({
            id: keyResult.id,
            objectiveId: keyResult.objectiveId,
            targetValue: keyResult.targetValue,
            currentValue: keyResult.currentValue,
            status: keyResult.status,
            orgId: objective.orgId,
        })
        .from(keyResult)
        .innerJoin(objective, eq(keyResult.objectiveId, objective.id))
        .where(eq(keyResult.id, keyResultId))
        .limit(1);

    return result;
}

export async function getKeyResultsByObjective(objectiveId: string) {
    return db
        .select()
        .from(keyResult)
        .where(eq(keyResult.objectiveId, objectiveId))
        .orderBy(keyResult.createdAt);
}

export async function updateKeyResult(
    keyResultId: string,
    data: {
        currentValue?: number;
        targetValue?: number;
        status?: "on_track" | "at_risk" | "off_track";
    }
) {
    const updates: Record<string, number | string> = {};
    if (data.currentValue !== undefined) updates.currentValue = data.currentValue;
    if (data.targetValue !== undefined) updates.targetValue = data.targetValue;
    if (data.status !== undefined) updates.status = data.status;

    const [updated] = await db
        .update(keyResult)
        .set(updates)
        .where(eq(keyResult.id, keyResultId))
        .returning();

    return updated;
}

export async function recordMetric(
    partnerId: string,
    data: {
        metricType: string;
        metricValue: number;
    }
) {
    const [created] = await db
        .insert(performanceMetric)
        .values({
            id: crypto.randomUUID(),
            partnerId,
            metricType: data.metricType,
            metricValue: data.metricValue,
        })
        .returning();

    return created;
}

export async function getPartnerMetrics(
    partnerId: string,
    filters?: { metricType?: string }
) {
    const conditions = [eq(performanceMetric.partnerId, partnerId)];

    if (filters?.metricType) {
        conditions.push(eq(performanceMetric.metricType, filters.metricType));
    }

    return db
        .select()
        .from(performanceMetric)
        .where(and(...conditions))
        .orderBy(desc(performanceMetric.recordedAt));
}

export async function calculateAndStorePartnerScore(partnerId: string) {
    const metrics = await db
        .select()
        .from(performanceMetric)
        .where(eq(performanceMetric.partnerId, partnerId));

    if (metrics.length === 0) return null;

    const totalValue = metrics.reduce((sum, m) => sum + m.metricValue, 0);
    const avgScore = Math.round((totalValue / metrics.length) * 100) / 100;

    const [created] = await db
        .insert(partnerScore)
        .values({
            id: crypto.randomUUID(),
            partnerId,
            score: avgScore,
        })
        .returning();

    return created;
}

export async function getLatestPartnerScore(partnerId: string) {
    const [result] = await db
        .select()
        .from(partnerScore)
        .where(eq(partnerScore.partnerId, partnerId))
        .orderBy(desc(partnerScore.calculatedOn))
        .limit(1);

    return result;
}

export async function getPartnerByIdForOrg(partnerId: string, orgId: string) {
    const [result] = await db
        .select()
        .from(partner)
        .where(and(eq(partner.id, partnerId), eq(partner.orgId, orgId)))
        .limit(1);

    return result;
}
