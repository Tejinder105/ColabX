import type { Response, NextFunction } from "express";
import {
    getDealById,
    getPartnerForUserInOrg,
    getScopedDealTeamIds,
    isUserAssignedToDeal,
} from "./deals.core.service.js";
import type { AuthRequest } from "../middlewares/authMiddleware.js";


export async function requireDeal(
    req: AuthRequest,
    res: Response,
    next: NextFunction
): Promise<void> {
    try {
        if (!req.org) {
            res.status(403).json({ error: "Organization context required" });
            return;
        }

        const dealId = req.params.dealId as string;

        if (!dealId) {
            res.status(400).json({ error: "dealId parameter is required" });
            return;
        }

        const dealRow = await getDealById(dealId, req.org.id);

        if (!dealRow) {
            res.status(404).json({ error: "Deal not found" });
            return;
        }

        req.deal = {
            id: dealRow.id,
            title: dealRow.title,
            partnerId: dealRow.partnerId,
            teamId: dealRow.teamId,
            stage: dealRow.stage,
            orgId: dealRow.orgId,
            createdBy: dealRow.createdBy,
        };

        next();
    } catch (error) {
        console.error("requireDeal error:", error);
        res.status(500).json({ error: "Failed to verify deal access" });
    }
}

export async function requireDealAccess(
    req: AuthRequest,
    res: Response,
    next: NextFunction
): Promise<void> {
    try {
        if (!req.deal || !req.user || !req.org || !req.membership) {
            res.status(403).json({ error: "Access denied" });
            return;
        }

        if (req.membership.role === "admin") {
            next();
            return;
        }

        if (req.membership.role === "manager" || req.membership.role === "member") {
            const visibleTeamIds = await getScopedDealTeamIds(
                req.org.id,
                req.user.id,
                req.membership.role
            );

            if (!visibleTeamIds?.includes(req.deal.teamId)) {
                res.status(403).json({ error: "Access denied to this deal" });
                return;
            }

            next();
            return;
        }

        if (req.membership.role !== "partner") {
            res.status(403).json({ error: "Insufficient permissions" });
            return;
        }

        const [isAssigned, linkedPartner] = await Promise.all([
            isUserAssignedToDeal(req.deal.id, req.user.id),
            getPartnerForUserInOrg(req.org.id, req.user.id),
        ]);

        const canAccessViaPartner = linkedPartner?.id === req.deal.partnerId;

        if (!isAssigned && !canAccessViaPartner) {
            res.status(403).json({ error: "Access denied to this deal" });
            return;
        }

        next();
    } catch (error) {
        console.error("requireDealAccess error:", error);
        res.status(500).json({ error: "Failed to verify deal permissions" });
    }
}
