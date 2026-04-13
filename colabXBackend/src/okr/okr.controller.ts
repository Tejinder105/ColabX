import type { Response } from "express";
import type { AuthRequest } from "../middlewares/authMiddleware.js";
import { createActivity } from "../collaboration/collaboration.service.js";
import {
    createObjective,
    getOrgObjectives,
    getObjectiveWithKeyResults,
    updateObjective,
    archiveObjective,
    createKeyResult,
    getKeyResultsByObjective,
    updateKeyResult,
    calculateAndStorePartnerScore,
    getPartnerByIdForOrg,
    getTeamByIdForOrg,
    getPartnerPerformanceSummary,
    getTeamPerformanceSummary,
    getPartnerHealthLabel,
} from "./okr.service.js";
import { getOrgPartnersForUser } from "../partners/partners.service.js";

// Objective Handlers ->

// POST /api/okr/objectives
export async function createObjectiveHandler(
    req: AuthRequest,
    res: Response
): Promise<void> {
    try {
        if (!req.org || !req.user) {
            res.status(401).json({ error: "Unauthorized" });
            return;
        }

        if (req.body.partnerId) {
            const partnerRow = await getPartnerByIdForOrg(req.body.partnerId, req.org.organizationId);
            if (!partnerRow) {
                res.status(400).json({ error: "Partner is not part of this organization" });
                return;
            }
        }

        if (req.body.teamId) {
            const teamRow = await getTeamByIdForOrg(req.body.teamId, req.org.organizationId);
            if (!teamRow) {
                res.status(400).json({ error: "Team is not part of this organization" });
                return;
            }
        }

        const created = await createObjective(req.org.organizationId, req.user.id, req.body);
        if (!created) {
            throw new Error("Failed to create objective");
        }

        try {
            await createActivity(
                req.org.organizationId,
                req.user.id,
                "objective",
                created.objectiveId,
                `created objective "${created.title}"`
            );
        } catch (activityError) {
            console.error("Activity log write failed:", activityError);
        }

        res.status(201).json({ objective: created });
    } catch (error) {
        console.error("Create objective error:", error);
        res.status(500).json({ error: "Failed to create objective" });
    }
}

// GET /api/okr/objectives
export async function getOrgObjectivesHandler(
    req: AuthRequest,
    res: Response
): Promise<void> {
    try {
        if (!req.org || !req.user || !req.membership) {
            res.status(403).json({ error: "Access denied" });
            return;
        }

        const filters: {
            partnerId?: string;
            teamId?: string;
            startDate?: string;
            endDate?: string;
        } = {};
        if (req.query.partnerId) filters.partnerId = req.query.partnerId as string;
        if (req.query.teamId) filters.teamId = req.query.teamId as string;
        if (req.query.startDate) filters.startDate = req.query.startDate as string;
        if (req.query.endDate) filters.endDate = req.query.endDate as string;

        // Partner role: only see objectives linked to their partner records
        if (req.membership.role === "partner") {
            const userPartners = await getOrgPartnersForUser(req.org.organizationId, req.user.id);
            const partnerIds = userPartners.map((p) => p.partnerId);

            if (partnerIds.length === 0) {
                res.json({
                    objectives: [],
                    summary: {
                        activeObjectives: 0,
                        completedObjectives: 0,
                        atRiskObjectives: 0,
                    },
                });
                return;
            }

            // If a specific partnerId filter was set, verify it belongs to this user
            if (filters.partnerId && !partnerIds.includes(filters.partnerId)) {
                res.json({
                    objectives: [],
                    summary: {
                        activeObjectives: 0,
                        completedObjectives: 0,
                        atRiskObjectives: 0,
                    },
                });
                return;
            }

            if (filters.teamId) {
                res.json({
                    objectives: [],
                    summary: {
                        activeObjectives: 0,
                        completedObjectives: 0,
                        atRiskObjectives: 0,
                    },
                });
                return;
            }

            // If no partnerId filter, we fetch for each of the user's partners and merge
            if (!filters.partnerId) {
                const allObjectives = [];
                for (const pid of partnerIds) {
                    const objs = await getOrgObjectives(req.org.organizationId, { ...filters, partnerId: pid });
                    allObjectives.push(...objs);
                }
                res.json({
                    objectives: allObjectives,
                    summary: {
                        activeObjectives: allObjectives.length,
                        completedObjectives: allObjectives.filter(
                            (objective: {
                                completedKeyResults: number;
                                totalKeyResults: number;
                            }) => objective.completedKeyResults === objective.totalKeyResults
                        ).length,
                        atRiskObjectives: allObjectives.filter(
                            (objective: { status: string }) => objective.status === "at_risk"
                        ).length,
                    },
                });
                return;
            }
        }

        const objectives = await getOrgObjectives(req.org.organizationId, filters);
        res.json({
            objectives,
            summary: {
                activeObjectives: objectives.length,
                completedObjectives: objectives.filter(
                    (objective: {
                        completedKeyResults: number;
                        totalKeyResults: number;
                    }) => objective.completedKeyResults === objective.totalKeyResults
                ).length,
                atRiskObjectives: objectives.filter(
                    (objective: { status: string }) => objective.status === "at_risk"
                ).length,
            },
        });
    } catch (error) {
        console.error("Get objectives error:", error);
        res.status(500).json({ error: "Failed to fetch objectives" });
    }
}

// GET /api/okr/objectives/:objectiveId
export async function getObjectiveByIdHandler(
    req: AuthRequest,
    res: Response
): Promise<void> {
    try {
        if (!req.objective) {
            res.status(404).json({ error: "Objective not found" });
            return;
        }

        const result = await getObjectiveWithKeyResults(req.objective.objectiveId);
        res.json({
            objective: result.objective,
            keyResults: result.keyResults,
            progressPercent: result.progressPercent,
            status: result.status,
            completedKeyResults: result.completedKeyResults,
            totalKeyResults: result.totalKeyResults,
            activities: result.activities,
        });
    } catch (error) {
        console.error("Get objective error:", error);
        res.status(500).json({ error: "Failed to fetch objective" });
    }
}

// PATCH /api/okr/objectives/:objectiveId
export async function updateObjectiveHandler(
    req: AuthRequest,
    res: Response
): Promise<void> {
    try {
        if (!req.objective || !req.org) {
            res.status(404).json({ error: "Objective not found" });
            return;
        }

        const updates: Record<string, string | null> = {};
        if (req.body.title !== undefined) updates.title = req.body.title;
        if (req.body.description !== undefined) updates.description = req.body.description;
        if (req.body.partnerId !== undefined || req.body.teamId !== undefined) {
            if (req.body.partnerId) {
                const partnerRow = await getPartnerByIdForOrg(req.body.partnerId, req.org.organizationId);
                if (!partnerRow) {
                    res.status(400).json({ error: "Partner is not part of this organization" });
                    return;
                }

                updates.partnerId = req.body.partnerId;
                updates.teamId = null;
            } else if (req.body.teamId) {
                const teamRow = await getTeamByIdForOrg(req.body.teamId, req.org.organizationId);
                if (!teamRow) {
                    res.status(400).json({ error: "Team is not part of this organization" });
                    return;
                }

                updates.teamId = req.body.teamId;
                updates.partnerId = null;
            } else {
                res.status(400).json({
                    error: "Objective must be assigned to exactly one entity",
                });
                return;
            }
        }
        if (req.body.startDate !== undefined) updates.startDate = req.body.startDate;
        if (req.body.endDate !== undefined) updates.endDate = req.body.endDate;

        if (Object.keys(updates).length === 0) {
            res.status(400).json({ error: "No fields to update" });
            return;
        }

        const updated = await updateObjective(req.objective.objectiveId, updates);
        if (!updated) {
            res.status(404).json({ error: "Objective not found" });
            return;
        }

        if (req.org && req.user) {
            try {
                const changedFields = Object.keys(updates).join(", ");
                await createActivity(
                    req.org.organizationId,
                    req.user.id,
                    "objective",
                    req.objective.objectiveId,
                    `updated objective "${updated.title}" (${changedFields})`
                );
            } catch (activityError) {
                console.error("Activity log write failed:", activityError);
            }
        }

        res.json({ objective: updated });
    } catch (error) {
        console.error("Update objective error:", error);
        res.status(500).json({ error: "Failed to update objective" });
    }
}

// DELETE /api/okr/objectives/:objectiveId 
export async function deleteObjectiveHandler(
    req: AuthRequest,
    res: Response
): Promise<void> {
    try {
        if (!req.objective) {
            res.status(404).json({ error: "Objective not found" });
            return;
        }

        await archiveObjective(req.objective.objectiveId);

        if (req.org && req.user) {
            try {
                await createActivity(
                    req.org.organizationId,
                    req.user.id,
                    "objective",
                    req.objective.objectiveId,
                    `archived objective "${req.objective.title}"`
                );
            } catch (activityError) {
                console.error("Activity log write failed:", activityError);
            }
        }

        res.json({ success: true });
    } catch (error) {
        console.error("Delete objective error:", error);
        res.status(500).json({ error: "Failed to archive objective" });
    }
}

// Key Result Handlers ->

// POST /api/okr/objectives/:objectiveId/key-results
export async function createKeyResultHandler(
    req: AuthRequest,
    res: Response
): Promise<void> {
    try {
        if (!req.objective) {
            res.status(404).json({ error: "Objective not found" });
            return;
        }

        const created = await createKeyResult(req.objective.objectiveId, req.body);
        if (!created) {
            throw new Error("Failed to create key result");
        }

        if (req.org && req.user) {
            try {
                await createActivity(
                    req.org.organizationId,
                    req.user.id,
                    "objective",
                    req.objective.objectiveId,
                    `added key result "${created.title}" to objective "${req.objective.title}"`
                );
            } catch (activityError) {
                console.error("Activity log write failed:", activityError);
            }
        }

        res.status(201).json({ keyResult: created });
    } catch (error) {
        console.error("Create key result error:", error);
        res.status(500).json({ error: "Failed to create key result" });
    }
}

// GET /api/okr/objectives/:objectiveId/key-results
export async function getKeyResultsHandler(
    req: AuthRequest,
    res: Response
): Promise<void> {
    try {
        if (!req.objective) {
            res.status(404).json({ error: "Objective not found" });
            return;
        }

        const keyResults = await getKeyResultsByObjective(req.objective.objectiveId);
        res.json({ keyResults });
    } catch (error) {
        console.error("Get key results error:", error);
        res.status(500).json({ error: "Failed to fetch key results" });
    }
}

// PATCH /api/okr/key-results/:keyResultId
export async function updateKeyResultHandler(
    req: AuthRequest,
    res: Response
): Promise<void> {
    try {
        if (!req.keyResult) {
            res.status(404).json({ error: "Key result not found" });
            return;
        }

        if (!req.membership) {
            res.status(403).json({ error: "Access denied" });
            return;
        }

        if (req.membership.role === "partner") {
            const invalidFields = ["title", "targetValue", "status"].filter(
                (field) => req.body[field] !== undefined
            );

            if (invalidFields.length > 0) {
                res.status(403).json({
                    error: "Partners can only update current progress",
                });
                return;
            }
        }

        const updated = await updateKeyResult(req.keyResult.keyResultId, req.body);
        if (!updated) {
            res.status(404).json({ error: "Key result not found" });
            return;
        }

        if (req.org && req.user) {
            try {
                await createActivity(
                    req.org.organizationId,
                    req.user.id,
                    "objective",
                    req.keyResult.objectiveId,
                    `updated progress for key result "${updated.title}"`
                );
            } catch (activityError) {
                console.error("Activity log write failed:", activityError);
            }
        }

        const objectiveResult = await getObjectiveWithKeyResults(req.keyResult.objectiveId);
        if (objectiveResult.objective?.partnerId) {
            await calculateAndStorePartnerScore(objectiveResult.objective.partnerId);
        }

        res.json({ keyResult: updated });
    } catch (error) {
        console.error("Update key result error:", error);
        res.status(500).json({ error: "Failed to update key result" });
    }
}

// Partner Performance Handlers ->

// GET /api/okr/partners/:partnerId/score
export async function getPartnerScoreHandler(
    req: AuthRequest,
    res: Response
): Promise<void> {
    try {
        if (!req.org || !req.partner) {
            res.status(403).json({ error: "Access denied" });
            return;
        }

        const score = await calculateAndStorePartnerScore(req.partner.partnerId);

        if (!score) {
            res.json({ score: null, healthLabel: null });
            return;
        }

        res.json({
            score: score.score,
            healthLabel: score.healthLabel,
            calculatedAt: score.scoreCalculatedAt,
        });
    } catch (error) {
        console.error("Get partner score error:", error);
        res.status(500).json({ error: "Failed to fetch partner score" });
    }
}

// GET /api/okr/partners/:partnerId/performance
export async function getPartnerPerformanceHandler(
    req: AuthRequest,
    res: Response
): Promise<void> {
    try {
        if (!req.org || !req.partner) {
            res.status(403).json({ error: "Access denied" });
            return;
        }

        const summary = await getPartnerPerformanceSummary(req.partner.partnerId, req.org.organizationId);
        res.json(summary);
    } catch (error) {
        console.error("Get partner performance error:", error);
        res.status(500).json({ error: "Failed to fetch partner performance" });
    }
}

// GET /api/okr/teams/:teamId/performance
export async function getTeamPerformanceHandler(
    req: AuthRequest,
    res: Response
): Promise<void> {
    try {
        if (!req.org) {
            res.status(403).json({ error: "Access denied" });
            return;
        }

        const teamId = req.params.teamId as string;
        const teamRow = await getTeamByIdForOrg(teamId, req.org.organizationId);

        if (!teamRow) {
            res.status(404).json({ error: "Team not found" });
            return;
        }

        const summary = await getTeamPerformanceSummary(teamId, req.org.organizationId);
        res.json(summary);
    } catch (error) {
        console.error("Get team performance error:", error);
        res.status(500).json({ error: "Failed to fetch team performance" });
    }
}
