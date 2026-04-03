import type { Response, NextFunction } from "express";
import { getObjectiveById, getKeyResultById } from "./okr.service.js";
import type { AuthRequest } from "../middlewares/authMiddleware.js";

// Verifies the objective exists and belongs to the current org.
// Must run AFTER requireOrganization (requires req.org to be set).
// Attaches req.objective on success.
export async function requireObjective(
    req: AuthRequest,
    res: Response,
    next: NextFunction
): Promise<void> {
    try {
        if (!req.org) {
            res.status(403).json({ error: "Organization context required" });
            return;
        }

        const objectiveId = req.params.objectiveId as string;

        if (!objectiveId) {
            res.status(400).json({ error: "objectiveId parameter is required" });
            return;
        }

        const objectiveRow = await getObjectiveById(objectiveId, req.org.id);

        if (!objectiveRow) {
            res.status(404).json({ error: "Objective not found" });
            return;
        }

        req.objective = {
            id: objectiveRow.id,
            title: objectiveRow.title,
            partnerId: objectiveRow.partnerId,
            orgId: objectiveRow.orgId,
        };

        next();
    } catch (error) {
        console.error("requireObjective error:", error);
        res.status(500).json({ error: "Failed to verify objective access" });
    }
}

// Verifies the key result exists and its parent objective belongs to the current org.
// Must run AFTER requireOrganization (requires req.org to be set).
// Attaches req.keyResult on success.
export async function requireKeyResult(
    req: AuthRequest,
    res: Response,
    next: NextFunction
): Promise<void> {
    try {
        if (!req.org) {
            res.status(403).json({ error: "Organization context required" });
            return;
        }

        const keyResultId = req.params.keyResultId as string;

        if (!keyResultId) {
            res.status(400).json({ error: "keyResultId parameter is required" });
            return;
        }

        const krRow = await getKeyResultById(keyResultId);

        if (!krRow || krRow.orgId !== req.org.id) {
            res.status(404).json({ error: "Key result not found" });
            return;
        }

        req.keyResult = {
            id: krRow.id,
            objectiveId: krRow.objectiveId,
            targetValue: krRow.targetValue,
            currentValue: krRow.currentValue,
            status: krRow.status,
        };

        next();
    } catch (error) {
        console.error("requireKeyResult error:", error);
        res.status(500).json({ error: "Failed to verify key result access" });
    }
}
