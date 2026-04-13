import { and, desc, eq, gte, inArray, lte, or, count } from "drizzle-orm";
import db from "../db/index.js";
import {
    objective,
    keyResult,
} from "./okr.schema.js";
import { user } from "../schemas/authSchema.js";
import { partner } from "../partners/partners.schema.js";
import { team } from "../teams/teams.schema.js";
import { deal } from "../deals/deals.schema.js";
import { activityLog } from "../schemas/collaborationSchema.js";

type KeyResultStatus = "on_track" | "at_risk" | "off_track";
type PartnerHealthLabel = "Healthy" | "At Risk" | "Underperforming";

function clampScore(value: number) {
    return Math.max(0, Math.min(100, Math.round(value * 100) / 100));
}

function calculateKeyResultStatus(currentValue: number, targetValue: number): KeyResultStatus {
    if (targetValue <= 0) {
        return "off_track";
    }

    const progressRatio = currentValue / targetValue;

    if (progressRatio >= 1) {
        return "on_track";
    }

    if (progressRatio >= 0.6) {
        return "at_risk";
    }

    return "off_track";
}

function calculateProgressPercent(currentValue: number, targetValue: number) {
    if (targetValue <= 0) {
        return 0;
    }

    return clampScore((currentValue / targetValue) * 100);
}

export function getPartnerHealthLabel(score: number | null | undefined): string {
    if (score === null || score === undefined) return "Not Rated";
    if (score >= 75) {
        return "Healthy";
    }

    if (score >= 50) {
        return "At Risk";
    }

    return "Underperforming";
}

function calculateObjectiveSummary(
    keyResults: Array<{
        targetValue: number;
        currentValue: number;
        status: KeyResultStatus;
    }>
) {
    if (keyResults.length === 0) {
        return {
            progressPercent: 0,
            status: "off_track" as KeyResultStatus,
            completedKeyResults: 0,
            totalKeyResults: 0,
        };
    }

    const progressTotal = keyResults.reduce((sum, keyResultRow) => {
        return sum + calculateProgressPercent(keyResultRow.currentValue, keyResultRow.targetValue);
    }, 0);

    const progressPercent = clampScore(progressTotal / keyResults.length);
    const completedKeyResults = keyResults.filter(
        (keyResultRow) => keyResultRow.currentValue >= keyResultRow.targetValue
    ).length;

    let status: KeyResultStatus = "on_track";

    if (keyResults.some((keyResultRow) => keyResultRow.status === "off_track")) {
        status = "off_track";
    } else if (keyResults.some((keyResultRow) => keyResultRow.status === "at_risk")) {
        status = "at_risk";
    }

    if (completedKeyResults === keyResults.length) {
        status = "on_track";
    }

    return {
        progressPercent,
        status,
        completedKeyResults,
        totalKeyResults: keyResults.length,
    };
}

export async function createObjective(
    organizationId: string,
    userId: string,
    data: {
        partnerId?: string;
        teamId?: string;
        title: string;
        description?: string;
        startDate: string;
        endDate: string;
    }
) {
    const [created] = await db
        .insert(objective)
        .values({
            objectiveId: crypto.randomUUID(),
            organizationId,
            partnerId: data.partnerId ?? null,
            teamId: data.teamId ?? null,
            title: data.title,
            description: data.description ?? null,
            startDate: data.startDate,
            endDate: data.endDate,
            createdByUserId: userId,
        })
        .returning();

    return created;
}

export async function getOrgObjectives(
    organizationId: string,
    filters?: {
        partnerId?: string;
        partnerIds?: string[];
        teamId?: string;
        teamIds?: string[];
        startDate?: string;
        endDate?: string;
    }
) {
    const conditions = [eq(objective.organizationId, organizationId)];

    if (filters?.partnerId) {
        conditions.push(eq(objective.partnerId, filters.partnerId));
    } else if (filters?.partnerIds) {
        if (filters.partnerIds.length === 0) {
            return [];
        }

        conditions.push(inArray(objective.partnerId, filters.partnerIds));
    }
    if (filters?.teamId) {
        conditions.push(eq(objective.teamId, filters.teamId));
    } else if (filters?.teamIds) {
        if (filters.teamIds.length === 0) {
            return [];
        }

        conditions.push(inArray(objective.teamId, filters.teamIds));
    }
    if (filters?.startDate) {
        conditions.push(gte(objective.startDate, filters.startDate));
    }
    if (filters?.endDate) {
        conditions.push(lte(objective.endDate, filters.endDate));
    }

    const objectiveRows = await db
        .select({
            objectiveId: objective.objectiveId,
            organizationId: objective.organizationId,
            partnerId: objective.partnerId,
            teamId: objective.teamId,
            partnerName: partner.name,
            teamName: team.name,
            title: objective.title,
            description: objective.description,
            startDate: objective.startDate,
            endDate: objective.endDate,
            createdByUserId: objective.createdByUserId,
            createdAt: objective.createdAt,
            updatedAt: objective.updatedAt,
        })
        .from(objective)
        .leftJoin(partner, eq(objective.partnerId, partner.partnerId))
        .leftJoin(team, eq(objective.teamId, team.teamId))
        .where(and(...conditions))
        .orderBy(objective.createdAt);

    const objectiveIds = objectiveRows.map((row) => row.objectiveId);
    const keyResults = objectiveIds.length > 0
        ? await db
              .select()
              .from(keyResult)
              .where(or(...objectiveIds.map((objectiveId) => eq(keyResult.objectiveId, objectiveId))))
        : [];

    const keyResultsByObjectiveId = new Map<string, typeof keyResults>();
    for (const keyResultRow of keyResults) {
        const collection = keyResultsByObjectiveId.get(keyResultRow.objectiveId) ?? [];
        collection.push(keyResultRow);
        keyResultsByObjectiveId.set(keyResultRow.objectiveId, collection);
    }

    return objectiveRows.map((objectiveRow) => {
        const summary = calculateObjectiveSummary(
            (keyResultsByObjectiveId.get(objectiveRow.objectiveId) ?? []).map((keyResultRow) => ({
                targetValue: keyResultRow.targetValue,
                currentValue: keyResultRow.currentValue,
                status: keyResultRow.status,
            }))
        );

        return {
            ...objectiveRow,
            assignedToType: objectiveRow.partnerId ? "partner" : "team",
            assignedToName: objectiveRow.partnerName ?? objectiveRow.teamName ?? null,
            ...summary,
        };
    });
}

export async function getObjectiveById(objectiveId: string, organizationId: string) {
    const [result] = await db
        .select()
        .from(objective)
        .where(and(eq(objective.objectiveId, objectiveId), eq(objective.organizationId, organizationId)))
        .limit(1);

    return result;
}

export async function getObjectiveWithKeyResults(objectiveId: string) {
    const [objectiveRow] = await db
        .select({
            objectiveId: objective.objectiveId,
            organizationId: objective.organizationId,
            partnerId: objective.partnerId,
            teamId: objective.teamId,
            partnerName: partner.name,
            teamName: team.name,
            title: objective.title,
            description: objective.description,
            startDate: objective.startDate,
            endDate: objective.endDate,
            createdByUserId: objective.createdByUserId,
            createdByName: user.name,
            createdAt: objective.createdAt,
            updatedAt: objective.updatedAt,
        })
        .from(objective)
        .leftJoin(partner, eq(objective.partnerId, partner.partnerId))
        .leftJoin(team, eq(objective.teamId, team.teamId))
        .leftJoin(user, eq(objective.createdByUserId, user.id))
        .where(eq(objective.objectiveId, objectiveId))
        .limit(1);

    const keyResults = await db
        .select()
        .from(keyResult)
        .where(eq(keyResult.objectiveId, objectiveId))
        .orderBy(keyResult.createdAt);
    const enhancedKeyResults = keyResults.map((keyResultRow) => ({
        ...keyResultRow,
        progressPercent: calculateProgressPercent(
            keyResultRow.currentValue,
            keyResultRow.targetValue
        ),
    }));
    const summary = calculateObjectiveSummary(keyResults);
    const activities = await db
        .select({
            activityLogId: activityLog.activityLogId,
            action: activityLog.action,
            createdAt: activityLog.createdAt,
            userId: activityLog.userId,
            userName: user.name,
        })
        .from(activityLog)
        .leftJoin(user, eq(activityLog.userId, user.id))
        .where(and(eq(activityLog.entityType, "objective"), eq(activityLog.entityId, objectiveId)))
        .orderBy(desc(activityLog.createdAt))
        .limit(20);

    return {
        objective: objectiveRow
            ? {
                  ...objectiveRow,
                  assignedToType: objectiveRow.partnerId ? "partner" : "team",
                  assignedToName: objectiveRow.partnerName ?? objectiveRow.teamName ?? null,
                  status: summary.status,
              }
            : null,
        keyResults: enhancedKeyResults,
        progressPercent: summary.progressPercent,
        status: summary.status,
        completedKeyResults: summary.completedKeyResults,
        totalKeyResults: summary.totalKeyResults,
        activities,
    };
}

export async function updateObjective(
    objectiveId: string,
    data: Record<string, string | null | undefined>
) {
    const [updated] = await db
        .update(objective)
        .set(data)
        .where(eq(objective.objectiveId, objectiveId))
        .returning();

    return updated;
}

export async function archiveObjective(objectiveId: string) {
    return db
        .delete(objective)
        .where(eq(objective.objectiveId, objectiveId))
        .returning();
}

export async function createKeyResult(
    objectiveId: string,
    data: {
        title: string;
        targetValue: number;
        currentValue?: number;
    }
) {
    const currentValue = data.currentValue ?? 0;
    const status = calculateKeyResultStatus(currentValue, data.targetValue);

    const [created] = await db
        .insert(keyResult)
        .values({
            keyResultId: crypto.randomUUID(),
            objectiveId,
            title: data.title,
            targetValue: data.targetValue,
            currentValue,
            status,
        })
        .returning();

    return created;
}

export async function getKeyResultById(keyResultId: string) {
    const [result] = await db
        .select({
            keyResultId: keyResult.keyResultId,
            objectiveId: keyResult.objectiveId,
            title: keyResult.title,
            targetValue: keyResult.targetValue,
            currentValue: keyResult.currentValue,
            status: keyResult.status,
            organizationId: objective.organizationId,
            partnerId: objective.partnerId,
            teamId: objective.teamId,
        })
        .from(keyResult)
        .innerJoin(objective, eq(keyResult.objectiveId, objective.objectiveId))
        .where(eq(keyResult.keyResultId, keyResultId))
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
        title?: string;
        currentValue?: number;
        targetValue?: number;
    }
) {
    const existing = await getKeyResultById(keyResultId);
    if (!existing) {
        return null;
    }

    const nextTargetValue = data.targetValue ?? existing.targetValue;
    const nextCurrentValue = data.currentValue ?? existing.currentValue;
    const nextStatus = calculateKeyResultStatus(nextCurrentValue, nextTargetValue);

    const updates: Record<string, number | string> = {
        status: nextStatus,
    };

    if (data.title !== undefined) updates.title = data.title;
    if (data.currentValue !== undefined) updates.currentValue = data.currentValue;
    if (data.targetValue !== undefined) updates.targetValue = data.targetValue;

    const [updated] = await db
        .update(keyResult)
        .set(updates)
        .where(eq(keyResult.keyResultId, keyResultId))
        .returning();

    return updated;
}

async function calculatePartnerScoreSnapshot(partnerId: string) {
    const sinceDate = new Date();
    sinceDate.setDate(sinceDate.getDate() - 90);

    const [partnerObjectives, partnerDeals, recentActivities] = await Promise.all([
        db.select({ objectiveId: objective.objectiveId })
            .from(objective)
            .where(eq(objective.partnerId, partnerId)),
        db.select({
            dealId: deal.dealId,
            stage: deal.stage,
            value: deal.value,
        })
            .from(deal)
            .where(and(eq(deal.partnerId, partnerId), gte(deal.createdAt, sinceDate))),
        db.select({ activityCount: count(activityLog.activityLogId) })
            .from(activityLog)
            .where(and(eq(activityLog.entityId, partnerId), gte(activityLog.createdAt, sinceDate))),
    ]);

    const objectiveIds = partnerObjectives.map((objectiveRow) => objectiveRow.objectiveId);
    const objectiveKeyResults = objectiveIds.length > 0
        ? await db.select().from(keyResult).where(inArray(keyResult.objectiveId, objectiveIds))
        : [];

    const okrCompletionScore =
        objectiveKeyResults.length > 0
            ? clampScore(
                  objectiveKeyResults.reduce((sum, keyResultRow) => {
                      return (
                          sum +
                          calculateProgressPercent(
                              keyResultRow.currentValue,
                              keyResultRow.targetValue
                          )
                      );
                  }, 0) / objectiveKeyResults.length
              )
            : 0;

    const wonDeals = partnerDeals.filter((dealRow) => dealRow.stage === "won");
    const closedDeals = partnerDeals.filter(
        (dealRow) => dealRow.stage === "won" || dealRow.stage === "lost"
    );
    const totalRevenue = partnerDeals.reduce((sum, dealRow) => sum + (dealRow.value ?? 0), 0);
    const wonRevenue = wonDeals.reduce((sum, dealRow) => sum + (dealRow.value ?? 0), 0);
    const winRateScore =
        closedDeals.length > 0 ? clampScore((wonDeals.length / closedDeals.length) * 100) : 0;
    const winCountScore = clampScore((wonDeals.length / 10) * 100);
    const revenueScore =
        totalRevenue > 0 ? clampScore((wonRevenue / totalRevenue) * 100) : 0;
    const dealsPerformanceScore = clampScore(
        winCountScore * 0.3 + winRateScore * 0.4 + revenueScore * 0.3
    );

    const activityScore = clampScore((Number(recentActivities[0]?.activityCount ?? 0) / 25) * 100);
    const finalScore = clampScore(
        dealsPerformanceScore * 0.4 + okrCompletionScore * 0.4 + activityScore * 0.2
    );

    return {
        partnerId,
        score: finalScore,
        healthLabel: getPartnerHealthLabel(finalScore),
    };
}

export async function calculateAndStorePartnerScore(
    partnerId: string,
    options?: { persist?: boolean }
) {
    const snapshot = await calculatePartnerScoreSnapshot(partnerId);
    const shouldPersist = options?.persist ?? true;

    if (!shouldPersist) {
        return {
            score: snapshot.score,
            healthLabel: snapshot.healthLabel,
            scoreCalculatedAt: new Date(),
        };
    }

    const [updated] = await db
        .update(partner)
        .set({
            score: snapshot.score,
            scoreCalculatedAt: new Date(),
        })
        .where(eq(partner.partnerId, partnerId))
        .returning();

    if (!updated) {
        throw new Error(`Partner ${partnerId} not found`);
    }

    return {
        score: updated.score,
        healthLabel: getPartnerHealthLabel(updated.score),
        scoreCalculatedAt: updated.scoreCalculatedAt,
    };
}

export async function getLatestPartnerScore(partnerId: string) {
    const [result] = await db
        .select()
        .from(partner)
        .where(eq(partner.partnerId, partnerId))
        .limit(1);

    return result;
}

export async function getPartnerByIdForOrg(partnerId: string, organizationId: string) {
    const [result] = await db
        .select()
        .from(partner)
        .where(and(eq(partner.partnerId, partnerId), eq(partner.organizationId, organizationId)))
        .limit(1);

    return result ?? null;
}

export async function getTeamByIdForOrg(teamId: string, organizationId: string) {
    const [result] = await db
        .select()
        .from(team)
        .where(and(eq(team.teamId, teamId), eq(team.organizationId, organizationId)))
        .limit(1);

    return result;
}

export async function getPartnerPerformanceSummary(partnerId: string, organizationId: string) {
    const [partnerRow, objectives, latestScore] = await Promise.all([
        getPartnerByIdForOrg(partnerId, organizationId),
        getOrgObjectives(organizationId, { partnerId }),
        getLatestPartnerScore(partnerId),
    ]);

    const score =
        latestScore ??
        (await calculateAndStorePartnerScore(partnerId, {
            persist: false,
        }));

    const activeObjectives = objectives.filter(
        (objectiveRow) => new Date(objectiveRow.endDate) >= new Date()
    );
    const completionRate =
        objectives.length > 0
            ? clampScore(
                  objectives.reduce((sum, objectiveRow) => sum + objectiveRow.progressPercent, 0) /
                      objectives.length
              )
            : 0;

    return {
        partner: partnerRow ?? null,
        score,
        activeObjectives,
        completionRate,
        objectiveCount: objectives.length,
    };
}

export async function getTeamPerformanceSummary(teamId: string, organizationId: string) {
    const [teamRow, objectives] = await Promise.all([
        getTeamByIdForOrg(teamId, organizationId),
        getOrgObjectives(organizationId, { teamId }),
    ]);

    const completionRate =
        objectives.length > 0
            ? clampScore(
                  objectives.reduce((sum, objectiveRow) => sum + objectiveRow.progressPercent, 0) /
                      objectives.length
              )
            : 0;

    return {
        team: teamRow ?? null,
        objectives,
        completionRate,
        activeObjectives: objectives.filter(
            (objectiveRow) => new Date(objectiveRow.endDate) >= new Date()
        ).length,
        atRiskObjectives: objectives.filter((objectiveRow) => objectiveRow.status === "at_risk")
            .length,
    };
}
