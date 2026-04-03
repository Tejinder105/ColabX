import type { Response, NextFunction } from "express";
import { getPartnerById } from "./partners.service.js";
import type { AuthRequest } from "../middlewares/authMiddleware.js";

export async function requirePartner(
    req: AuthRequest,
    res: Response,
    next: NextFunction
): Promise<void> {
    try {
        if (!req.org) {
            res.status(403).json({ error: "Organization context required" });
            return;
        }

        const partnerId = req.params.partnerId as string;

        if (!partnerId) {
            res.status(400).json({ error: "partnerId parameter is required" });
            return;
        }

        // orgId filter enforces cross-tenant isolation
        const partnerRow = await getPartnerById(partnerId, req.org.id);

        if (!partnerRow) {
            res.status(404).json({ error: "Partner not found" });
            return;
        }

        req.partner = {
            id: partnerRow.id,
            name: partnerRow.name,
            type: partnerRow.type,
            status: partnerRow.status,
            orgId: partnerRow.orgId,
            createdBy: partnerRow.createdBy,
            userId: partnerRow.userId,
        };

        next();
    } catch (error) {
        console.error("requirePartner error:", error);
        res.status(500).json({ error: "Failed to verify partner access" });
    }
}

export function requirePartnerOwnerOrAdminManager(
    req: AuthRequest,
    res: Response,
    next: NextFunction
): void {
    if (!req.partner || !req.membership || !req.user) {
        res.status(403).json({ error: "Partner access denied" });
        return;
    }

    if (["admin", "manager"].includes(req.membership.role)) {
        next();
        return;
    }

    if (req.membership.role === "partner" && req.partner.userId === req.user.id) {
        next();
        return;
    }

    res.status(403).json({ error: "Cannot access other partners' data" });
}
