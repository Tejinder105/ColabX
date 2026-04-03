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
    getPartnerForUserInOrg,
    createDealMessage,
    getDealMessages,
    deleteDealMessage,
    getDealMessageById,
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

        const requestedPartnerId = req.query.partnerId as string | undefined;
        const requestedAssignedUser = req.query.assignedUser as string | undefined;

        if (requestedPartnerId) filters.partnerId = requestedPartnerId;
        if (requestedAssignedUser) filters.assignedUser = requestedAssignedUser;

        // Partner role: can only see deals assigned to them
        if (req.membership.role === "partner") {
            const linkedPartner = await getPartnerForUserInOrg(req.org.id, req.user.id);

            // If partner explicitly requests partnerId, it must be their own partner record.
            // Otherwise default to assignments-only view.
            if (requestedPartnerId) {
                if (!linkedPartner || linkedPartner.id !== requestedPartnerId) {
                    res.status(403).json({ error: "Cannot view deals for another partner" });
                    return;
                }
                filters.partnerId = linkedPartner.id;
                delete filters.assignedUser;
            } else {
                filters.assignedUser = req.user.id;
                delete filters.partnerId;
            }
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

// ── Deal Messages ──────────────────────────────────────────────────────────────

// POST /api/deals/:dealId/messages
export async function createMessageHandler(
    req: AuthRequest,
    res: Response
): Promise<void> {
    try {
        if (!req.deal || !req.user) {
            res.status(403).json({ error: "Access denied" });
            return;
        }

        const { content } = req.body;
        const message = await createDealMessage(req.deal.id, req.user.id, content);

        res.status(201).json({ message });
    } catch (error) {
        console.error("Create message error:", error);
        res.status(500).json({ error: "Failed to create message" });
    }
}

// GET /api/deals/:dealId/messages
export async function getDealMessagesHandler(
    req: AuthRequest,
    res: Response
): Promise<void> {
    try {
        if (!req.deal) {
            res.status(404).json({ error: "Deal not found" });
            return;
        }

        const messages = await getDealMessages(req.deal.id);
        res.json({ messages });
    } catch (error) {
        console.error("Get deal messages error:", error);
        res.status(500).json({ error: "Failed to fetch messages" });
    }
}

// DELETE /api/deals/:dealId/messages/:messageId
export async function deleteMessageHandler(
    req: AuthRequest,
    res: Response
): Promise<void> {
    try {
        if (!req.deal || !req.user || !req.membership) {
            res.status(403).json({ error: "Access denied" });
            return;
        }

        const messageId = req.params.messageId as string;
        const message = await getDealMessageById(messageId);

        if (!message || message.dealId !== req.deal.id) {
            res.status(404).json({ error: "Message not found" });
            return;
        }

        // Only allow sender or admin/manager to delete
        const isOwner = message.senderId === req.user.id;
        const isAdminOrManager = req.membership.role === "admin" || req.membership.role === "manager";

        if (!isOwner && !isAdminOrManager) {
            res.status(403).json({ error: "You can only delete your own messages" });
            return;
        }

        await deleteDealMessage(messageId);
        res.json({ success: true });
    } catch (error) {
        console.error("Delete message error:", error);
        res.status(500).json({ error: "Failed to delete message" });
    }
}
