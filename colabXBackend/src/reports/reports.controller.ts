import type { Response } from "express";
import type { AuthRequest } from "../middlewares/authMiddleware.js";
import { getOrgPartners } from "../partners/partners.service.js";
import { getOrgDeals } from "../deals/deals.core.service.js";
import {
    getOrgObjectives,
    getObjectiveWithKeyResults,
    getLatestPartnerScore,
} from "../okr/okr.service.js";

type ObjectiveStatus = "completed" | "on_track" | "at_risk";

function monthKey(dateStr: string): string {
    return new Date(dateStr).toLocaleString("en-US", { month: "short" });
}

function getLastMonths(count: number): string[] {
    const now = new Date();
    const months: string[] = [];
    for (let i = count - 1; i >= 0; i -= 1) {
        const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
        months.push(date.toLocaleString("en-US", { month: "short" }));
    }
    return months;
}

function classifyObjective(
    progress: number,
    statuses: Array<"on_track" | "at_risk" | "off_track">
): ObjectiveStatus {
    if (progress >= 100) return "completed";
    if (statuses.includes("off_track") || statuses.includes("at_risk")) return "at_risk";
    return "on_track";
}

function growthPercent(current: number, previous: number): number {
    if (previous <= 0) {
        return current > 0 ? 100 : 0;
    }
    return Math.round(((current - previous) / previous) * 100);
}

// GET /api/reports/dashboard
export async function getReportsDashboardHandler(req: AuthRequest, res: Response): Promise<void> {
    try {
        if (!req.org) {
            res.status(403).json({ error: "Access denied" });
            return;
        }

        const [partners, deals, objectives] = await Promise.all([
            getOrgPartners(req.org.organizationId),
            getOrgDeals(req.org.organizationId),
            getOrgObjectives(req.org.organizationId),
        ]);

        const partnerScores = await Promise.all(
            partners.map(async (partner) => {
                const score = await getLatestPartnerScore(partner.partnerId);
                return { partnerId: partner.partnerId, score: Math.round(score?.score ?? 0) };
            })
        );
        const scoreMap = new Map(partnerScores.map((item) => [item.partnerId, item.score]));

        const now = Date.now();
        const windowMs = 1000 * 60 * 60 * 24 * 30;
        const currentStart = now - windowMs;
        const previousStart = now - windowMs * 2;

        const partnerMetrics = partners.map((partner) => {
            const partnerDeals = deals.filter((deal) => deal.partnerId === partner.partnerId);
            const wonDeals = partnerDeals.filter((deal) => deal.stage === "won");
            const revenue = wonDeals.reduce((sum, deal) => sum + (deal.value ?? 0), 0);
            const dealsClosed = wonDeals.length;

            const currentRevenue = wonDeals
                .filter((deal) => {
                    const t = new Date(deal.createdAt).getTime();
                    return t >= currentStart;
                })
                .reduce((sum, deal) => sum + (deal.value ?? 0), 0);

            const previousRevenue = wonDeals
                .filter((deal) => {
                    const t = new Date(deal.createdAt).getTime();
                    return t >= previousStart && t < currentStart;
                })
                .reduce((sum, deal) => sum + (deal.value ?? 0), 0);

            return {
                partnerName: partner.name,
                performanceScore: scoreMap.get(partner.partnerId) ?? 0,
                revenue,
                dealsClosed,
                growthPercent: growthPercent(currentRevenue, previousRevenue),
            };
        });

        const topPartners = [...partnerMetrics]
            .sort((a, b) => b.revenue - a.revenue)
            .slice(0, 5);

        const underperformingPartners = [...partnerMetrics]
            .sort((a, b) => a.performanceScore - b.performanceScore || a.growthPercent - b.growthPercent)
            .slice(0, 5);

        const months = getLastMonths(7);
        const monthlyMap = new Map<string, { revenue: number; deals: number }>();
        months.forEach((m) => monthlyMap.set(m, { revenue: 0, deals: 0 }));

        deals.forEach((deal) => {
            if (deal.stage !== "won") return;
            const key = monthKey(deal.createdAt.toISOString());
            const bucket = monthlyMap.get(key);
            if (!bucket) return;
            bucket.revenue += deal.value ?? 0;
            bucket.deals += 1;
        });

        const revenueTrend = months.map((month) => ({
            month,
            revenue: monthlyMap.get(month)?.revenue ?? 0,
            deals: monthlyMap.get(month)?.deals ?? 0,
        }));

        const objectiveDetails = await Promise.all(
            objectives.map((objective) => getObjectiveWithKeyResults(objective.objectiveId))
        );

        let objectivesCompleted = 0;
        let objectivesOnTrack = 0;
        let objectivesAtRisk = 0;
        let totalProgress = 0;

        objectiveDetails.forEach((detail) => {
            const fallbackProgress = detail.keyResults.length > 0
                ? Math.round(
                    detail.keyResults.reduce((sum, kr) => {
                        if (kr.targetValue <= 0) return sum;
                        return sum + Math.min(100, Math.round((kr.currentValue / kr.targetValue) * 100));
                    }, 0) / detail.keyResults.length
                )
                : 0;

            const progress = Math.round(detail.progressPercent || fallbackProgress);
            totalProgress += progress;

            const status = classifyObjective(progress, detail.keyResults.map((kr) => kr.status));
            if (status === "completed") objectivesCompleted += 1;
            if (status === "on_track") objectivesOnTrack += 1;
            if (status === "at_risk") objectivesAtRisk += 1;
        });

        const averageTeamPerformance = objectiveDetails.length > 0
            ? Math.round(totalProgress / objectiveDetails.length)
            : 0;

        res.json({
            analytics: {
                topPartners,
                underperformingPartners,
                revenueTrend,
                okrSummary: {
                    objectivesCompleted,
                    objectivesOnTrack,
                    objectivesAtRisk,
                    averageTeamPerformance,
                },
            },
        });
    } catch (error) {
        console.error("Get reports dashboard error:", error);
        res.status(500).json({ error: "Failed to fetch reports dashboard" });
    }
}
