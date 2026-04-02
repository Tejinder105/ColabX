import type { Response } from "express";
import type { AuthRequest } from "../middlewares/authMiddleware.js";
import {
    createDeal,
    getOrgDeals,
    getDealWithDetails,
    updateDeal,
    softDeleteDeal,
    getDealAssignmentRecord,
    assignUserToDeal,
    getDealAssignments,
    removeUserFromDeal,
    isOrgMember,
    getPartnerByIdForOrg,
} from "./deals.service.js";

// Deal CRUD ->

// POST /api/deals
export async function createDealHandler(
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
            res.status(404).json({ error: "Partner not found in this organization" });
            return;
        }

        const created = await createDeal(req.org.id, req.user.id, req.body);
        res.status(201).json({ deal: created });
    } catch (error) {
        console.error("Create deal error:", error);
        res.status(500).json({ error: "Failed to create deal" });
    }
}

// GET /api/deals
export async function getOrgDealsHandler(
    req: AuthRequest,
    res: Response
): Promise<void> {
    try {
        if (!req.org || !req.user || !req.membership) {
            res.status(403).json({ error: "Access denied" });
            return;
        }

        const filters: { stage?: string; partnerId?: string; assignedUser?: string } = {};
        if (req.query.stage) filters.stage = req.query.stage as string;
        if (req.query.partnerId) filters.partnerId = req.query.partnerId as string;
        if (req.query.assignedUser) filters.assignedUser = req.query.assignedUser as string;

        // Partner role: can only see deals assigned to them
        if (req.membership.role === "partner") {
            filters.assignedUser = req.user.id;
        }

        const deals = await getOrgDeals(req.org.id, filters);
        res.json({ deals });
    } catch (error) {
        console.error("Get deals error:", error);
        res.status(500).json({ error: "Failed to fetch deals" });
    }
}

// GET /api/deals/:dealId
export async function getDealByIdHandler(
    req: AuthRequest,
    res: Response
): Promise<void> {
    try {
        if (!req.deal) {
            res.status(404).json({ error: "Deal not found" });
            return;
        }

        const result = await getDealWithDetails(req.deal.id);
        res.json({
            deal: result.deal,
            partner: result.partner,
            assignments: result.assignments,
            activities: result.activities,
        });
    } catch (error) {
        console.error("Get deal error:", error);
        res.status(500).json({ error: "Failed to fetch deal" });
    }
}

// PATCH /api/deals/:dealId
export async function updateDealHandler(
    req: AuthRequest,
    res: Response
): Promise<void> {
    try {
        if (!req.deal || !req.user) {
            res.status(404).json({ error: "Deal not found" });
            return;
        }

        const updates: Record<string, string | number | null> = {};
        if (req.body.title !== undefined) updates.title = req.body.title;
        if (req.body.description !== undefined) updates.description = req.body.description;
        if (req.body.value !== undefined) updates.value = req.body.value;
        if (req.body.stage !== undefined) updates.stage = req.body.stage;

        if (Object.keys(updates).length === 0) {
            res.status(400).json({ error: "No fields to update" });
            return;
        }

        const updated = await updateDeal(req.deal.id, updates);
        res.json({ deal: updated });
    } catch (error) {
        console.error("Update deal error:", error);
        res.status(500).json({ error: "Failed to update deal" });
    }
}

// DELETE /api/deals/:dealId 
export async function deleteDealHandler(
    req: AuthRequest,
    res: Response
): Promise<void> {
    try {
        if (!req.deal) {
            res.status(404).json({ error: "Deal not found" });
            return;
        }

        const updated = await softDeleteDeal(req.deal.id);
        res.json({ deal: updated });
    } catch (error) {
        console.error("Delete deal error:", error);
        res.status(500).json({ error: "Failed to delete deal" });
    }
}

//  Deal Assignments ->

// POST /api/deals/:dealId/assign
export async function assignUserHandler(
    req: AuthRequest,
    res: Response
): Promise<void> {
    try {
        if (!req.deal || !req.org || !req.user) {
            res.status(403).json({ error: "Access denied" });
            return;
        }

        const { userId } = req.body;

        const orgMember = await isOrgMember(req.org.id, userId);
        if (!orgMember) {
            res.status(400).json({ error: "User is not a member of this organization" });
            return;
        }

        const existing = await getDealAssignmentRecord(req.deal.id, userId);
        if (existing) {
            res.status(409).json({ error: "User is already assigned to this deal" });
            return;
        }

        const assignment = await assignUserToDeal(req.deal.id, userId);

        res.status(201).json({ assignment });
    } catch (error) {
        console.error("Assign user error:", error);
        res.status(500).json({ error: "Failed to assign user" });
    }
}

// GET /api/deals/:dealId/assign
export async function getDealAssignmentsHandler(
    req: AuthRequest,
    res: Response
): Promise<void> {
    try {
        if (!req.deal) {
            res.status(404).json({ error: "Deal not found" });
            return;
        }

        const assignments = await getDealAssignments(req.deal.id);
        res.json({ assignments });
    } catch (error) {
        console.error("Get deal assignments error:", error);
        res.status(500).json({ error: "Failed to fetch deal assignments" });
    }
}

// DELETE /api/deals/:dealId/assign/:userId
export async function removeAssignmentHandler(
    req: AuthRequest,
    res: Response
): Promise<void> {
    try {
        if (!req.deal) {
            res.status(404).json({ error: "Deal not found" });
            return;
        }

        const userId = req.params.userId as string;
        const deleted = await removeUserFromDeal(req.deal.id, userId);

        if (deleted.length === 0) {
            res.status(404).json({ error: "Assignment not found" });
            return;
        }

        res.json({ success: true });
    } catch (error) {
        console.error("Remove assignment error:", error);
        res.status(500).json({ error: "Failed to remove assignment" });
    }
}
