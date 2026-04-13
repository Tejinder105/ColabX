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

        const dealRow = await getDealById(dealId, req.org.organizationId);

        if (!dealRow) {
            res.status(404).json({ error: "Deal not found" });
            return;
        }

        req.deal = {
            dealId: dealRow.dealId,
            title: dealRow.title,
            partnerId: dealRow.partnerId,
            teamId: dealRow.teamId,
            stage: dealRow.stage,
            organizationId: dealRow.organizationId,
            createdByUserId: dealRow.createdByUserId,
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
                req.org.organizationId,
                req.user.id,
                req.membership.role
            );

            if (req.deal.teamId !== null && !visibleTeamIds?.includes(req.deal.teamId)) {
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
            isUserAssignedToDeal(req.deal.dealId, req.user.id),
            getPartnerForUserInOrg(req.org.organizationId, req.user.id),
        ]);

        const canAccessViaPartner = linkedPartner?.partnerId === req.deal.partnerId;

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
