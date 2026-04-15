import type { Response, NextFunction } from "express";
import { getObjectiveById, getKeyResultById } from "./okr.service.js";
import type { AuthRequest } from "../middlewares/authMiddleware.js";
import { getOrgPartnersForUser } from "../partners/partners.service.js";
import { getPartnerIdsForTeams, getScopedTeamIdsForUser } from "../teams/teams.service.js";


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

        const objectiveRow = await getObjectiveById(objectiveId, req.org.organizationId);

        if (!objectiveRow) {
            res.status(404).json({ error: "Objective not found" });
            return;
        }

        req.objective = {
            objectiveId: objectiveRow.objectiveId,
            title: objectiveRow.title,
            partnerId: objectiveRow.partnerId,
            teamId: objectiveRow.teamId,
            organizationId: objectiveRow.organizationId,
        };

        next();
    } catch (error) {
        console.error("requireObjective error:", error);
        res.status(500).json({ error: "Failed to verify objective access" });
    }
}


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

        if (!krRow || krRow.organizationId !== req.org.organizationId) {
            res.status(404).json({ error: "Key result not found" });
            return;
        }

        req.keyResult = {
            keyResultId: krRow.keyResultId,
            objectiveId: krRow.objectiveId,
            title: krRow.title,
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

export async function requireObjectiveAccess(
    req: AuthRequest,
    res: Response,
    next: NextFunction
): Promise<void> {
    try {
        if (!req.objective || !req.org || !req.user || !req.membership) {
            res.status(403).json({ error: "Access denied" });
            return;
        }

        if (req.membership.role === "admin" || req.membership.role === "manager") {
            next();
            return;
        }

        if (req.membership.role === "member") {
            const scopedTeamIds = await getScopedTeamIdsForUser(
                req.org.organizationId,
                req.user.id,
                req.membership.role
            );

            if (!scopedTeamIds || scopedTeamIds.length === 0) {
                res.status(403).json({ error: "Access denied to this objective" });
                return;
            }

            const scopedPartnerIds = await getPartnerIdsForTeams(scopedTeamIds);
            const canAccess =
                (req.objective.teamId ? scopedTeamIds.includes(req.objective.teamId) : false) ||
                (req.objective.partnerId
                    ? scopedPartnerIds.includes(req.objective.partnerId)
                    : false);

            if (!canAccess) {
                res.status(403).json({ error: "Access denied to this objective" });
                return;
            }

            next();
            return;
        }

        if (req.membership.role !== "partner" || !req.objective.partnerId) {
            res.status(403).json({ error: "Access denied to this objective" });
            return;
        }

        const userPartners = await getOrgPartnersForUser(req.org.organizationId, req.user.id);
        const canAccess = userPartners.some(
            (partnerRow) => partnerRow.partnerId === req.objective?.partnerId
        );

        if (!canAccess) {
            res.status(403).json({ error: "Access denied to this objective" });
            return;
        }

        next();
    } catch (error) {
        console.error("requireObjectiveAccess error:", error);
        res.status(500).json({ error: "Failed to verify objective permissions" });
    }
}

export async function requireKeyResultAccess(
    req: AuthRequest,
    res: Response,
    next: NextFunction
): Promise<void> {
    try {
        if (!req.keyResult || !req.org || !req.user || !req.membership) {
            res.status(403).json({ error: "Access denied" });
            return;
        }

        if (req.membership.role === "admin" || req.membership.role === "manager") {
            next();
            return;
        }

        const objectiveRow = await getObjectiveById(req.keyResult.objectiveId, req.org.organizationId);
        if (!objectiveRow) {
            res.status(403).json({ error: "Access denied to this key result" });
            return;
        }

        if (req.membership.role === "member") {
            const scopedTeamIds = await getScopedTeamIdsForUser(
                req.org.organizationId,
                req.user.id,
                req.membership.role
            );

            if (!scopedTeamIds || scopedTeamIds.length === 0) {
                res.status(403).json({ error: "Access denied to this key result" });
                return;
            }

            const scopedPartnerIds = await getPartnerIdsForTeams(scopedTeamIds);
            const canAccess =
                (objectiveRow.teamId ? scopedTeamIds.includes(objectiveRow.teamId) : false) ||
                (objectiveRow.partnerId ? scopedPartnerIds.includes(objectiveRow.partnerId) : false);

            if (!canAccess) {
                res.status(403).json({ error: "Access denied to this key result" });
                return;
            }

            next();
            return;
        }

        if (!objectiveRow.partnerId) {
            res.status(403).json({ error: "Access denied to this key result" });
            return;
        }

        const userPartners = await getOrgPartnersForUser(req.org.organizationId, req.user.id);
        const canAccess = userPartners.some(
            (partnerRow) => partnerRow.partnerId === objectiveRow.partnerId
        );

        if (!canAccess) {
            res.status(403).json({ error: "Access denied to this key result" });
            return;
        }

        next();
    } catch (error) {
        console.error("requireKeyResultAccess error:", error);
        res.status(500).json({ error: "Failed to verify key result permissions" });
    }
}
