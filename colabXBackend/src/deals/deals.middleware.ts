import type { Response, NextFunction } from "express";
import { getDealById } from "./deals.service.js";
import type { AuthRequest } from "../middlewares/authMiddleware.js";

// Verifies the deal exists and belongs to the current org.
// Must run AFTER requireOrganization (requires req.org to be set).
// Attaches req.deal on success.
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

        // orgId filter enforces cross-tenant isolation
        const dealRow = await getDealById(dealId, req.org.id);

        if (!dealRow) {
            res.status(404).json({ error: "Deal not found" });
            return;
        }

        req.deal = {
            id: dealRow.id,
            title: dealRow.title,
            partnerId: dealRow.partnerId,
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
