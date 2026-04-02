import type { Response } from "express";
import type { AuthRequest } from "../middlewares/authMiddleware.js";
import {
    createObjective,
    getOrgObjectives,
    getObjectiveWithKeyResults,
    updateObjective,
    archiveObjective,
    createKeyResult,
    getKeyResultsByObjective,
    updateKeyResult,
    recordMetric,
    getPartnerMetrics,
    calculateAndStorePartnerScore,
    getLatestPartnerScore,
    getPartnerByIdForOrg,
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

        const partnerRow = await getPartnerByIdForOrg(req.body.partnerId, req.org.id);
        if (!partnerRow) {
            res.status(400).json({ error: "Partner is not part of this organization" });
            return;
        }

        const created = await createObjective(req.org.id, req.user.id, req.body);
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
            startDate?: string;
            endDate?: string;
        } = {};
        if (req.query.partnerId) filters.partnerId = req.query.partnerId as string;
        if (req.query.startDate) filters.startDate = req.query.startDate as string;
        if (req.query.endDate) filters.endDate = req.query.endDate as string;

        // Partner role: only see objectives linked to their partner records
        if (req.membership.role === "partner") {
            const userPartners = await getOrgPartnersForUser(req.org.id, req.user.id);
            const partnerIds = userPartners.map(p => p.id);

            if (partnerIds.length === 0) {
                res.json({ objectives: [] });
                return;
            }

            // If a specific partnerId filter was set, verify it belongs to this user
            if (filters.partnerId && !partnerIds.includes(filters.partnerId)) {
                res.json({ objectives: [] });
                return;
            }

            // If no partnerId filter, we fetch for each of the user's partners and merge
            if (!filters.partnerId) {
                const allObjectives = [];
                for (const pid of partnerIds) {
                    const objs = await getOrgObjectives(req.org.id, { ...filters, partnerId: pid });
                    allObjectives.push(...objs);
                }
                res.json({ objectives: allObjectives });
                return;
            }
        }

        const objectives = await getOrgObjectives(req.org.id, filters);
        res.json({ objectives });
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

        const result = await getObjectiveWithKeyResults(req.objective.id);
        res.json({
            objective: result.objective,
            keyResults: result.keyResults,
            progressPercent: result.progressPercent,
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
        if (req.body.partnerId !== undefined) {
            const partnerRow = await getPartnerByIdForOrg(req.body.partnerId, req.org.id);
            if (!partnerRow) {
                res.status(400).json({ error: "Partner is not part of this organization" });
                return;
            }
            updates.partnerId = req.body.partnerId;
        }
        if (req.body.startDate !== undefined) updates.startDate = req.body.startDate;
        if (req.body.endDate !== undefined) updates.endDate = req.body.endDate;

        if (Object.keys(updates).length === 0) {
            res.status(400).json({ error: "No fields to update" });
            return;
        }

        const updated = await updateObjective(req.objective.id, updates);
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

        await archiveObjective(req.objective.id);
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

        const created = await createKeyResult(req.objective.id, req.body);
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

        const keyResults = await getKeyResultsByObjective(req.objective.id);
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

        const updated = await updateKeyResult(req.keyResult.id, req.body);
        res.json({ keyResult: updated });
    } catch (error) {
        console.error("Update key result error:", error);
        res.status(500).json({ error: "Failed to update key result" });
    }
}

// Partner Performance Handlers ->

// POST /api/okr/partners/:partnerId/metrics
export async function recordMetricHandler(
    req: AuthRequest,
    res: Response
): Promise<void> {
    try {
        if (!req.org || !req.partner) {
            res.status(403).json({ error: "Access denied" });
            return;
        }

        const created = await recordMetric(req.partner.id, req.body);

        // Auto-recalculate partner score after new metric is recorded
        await calculateAndStorePartnerScore(req.partner.id);

        res.status(201).json({ metric: created });
    } catch (error) {
        console.error("Record metric error:", error);
        res.status(500).json({ error: "Failed to record metric" });
    }
}

// GET /api/okr/partners/:partnerId/metrics
export async function getPartnerMetricsHandler(
    req: AuthRequest,
    res: Response
): Promise<void> {
    try {
        if (!req.org || !req.partner) {
            res.status(403).json({ error: "Access denied" });
            return;
        }

        const filters: { metricType?: string } = {};
        if (req.query.metricType) filters.metricType = req.query.metricType as string;

        const metrics = await getPartnerMetrics(req.partner.id, filters);
        res.json({ metrics });
    } catch (error) {
        console.error("Get metrics error:", error);
        res.status(500).json({ error: "Failed to fetch metrics" });
    }
}

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

        const score = await getLatestPartnerScore(req.partner.id);

        if (!score) {
            res.json({ score: null });
            return;
        }

        res.json({ score });
    } catch (error) {
        console.error("Get partner score error:", error);
        res.status(500).json({ error: "Failed to fetch partner score" });
    }
}
