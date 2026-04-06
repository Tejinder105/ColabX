import type { Response } from "express";
import type { AuthRequest } from "../middlewares/authMiddleware.js";
import {
    createDeal,
    getOrgDeals,
    getDealWithDetails,
    updateDeal,
    softDeleteDeal,
    getScopedDealTeamIds,
    getDealAssignmentRecord,
    assignUserToDeal,
    getDealAssignments,
    removeUserFromDeal,
    isOrgMember,
    getPartnerByIdForOrg,
    getTeamByIdForOrg,
    getPartnerTeamAssignment,
    isPartnerAssignedToTeam,
    isUserInTeam,
    getPartnerForUserInOrg,
    createDealMessage,
    getDealMessages,
    deleteDealMessage,
    getDealMessageById,
    createDealTask,
    getDealTaskById,
    getDealTasks,
    updateDealTask,
    deleteDealTask,
    createDealDocument,
    getDealDocumentById,
    getDealDocuments,
    deleteDealDocument,
} from "./deals.core.service.js";
import { createActivity } from "../collaboration/collaboration.service.js";

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

        const teamId = req.body.teamId as string;
        const teamRow = await getTeamByIdForOrg(teamId, req.org.id);
        if (!teamRow) {
            res.status(404).json({ error: "Team not found in this organization" });
            return;
        }

        const assignment = await getPartnerTeamAssignment(req.body.partnerId, req.org.id);
        if (!assignment || assignment.teamId !== teamId) {
            res.status(400).json({
                error: "Partner must be assigned to the selected team before creating a deal",
            });
            return;
        }

        const created = await createDeal(req.org.id, req.user.id, {
            ...req.body,
            teamId,
        });
        await createActivity(
            req.org.id,
            req.user.id,
            "deal",
            created.id,
            `created deal "${created.title}"`
        );
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

        const filters: {
            stage?: string;
            partnerId?: string;
            assignedUser?: string;
            teamId?: string;
            teamIds?: string[];
        } = {};
        if (req.query.stage) filters.stage = req.query.stage as string;

        const requestedPartnerId = req.query.partnerId as string | undefined;
        const requestedAssignedUser = req.query.assignedUser as string | undefined;
        const requestedTeamId = req.query.teamId as string | undefined;

        if (requestedPartnerId) filters.partnerId = requestedPartnerId;
        if (requestedAssignedUser) filters.assignedUser = requestedAssignedUser;
        if (requestedTeamId) filters.teamId = requestedTeamId;

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
            } else if (linkedPartner) {
                filters.partnerId = linkedPartner.id;
                delete filters.assignedUser;
            }
        } else if (req.membership.role === "manager" || req.membership.role === "member") {
            const visibleTeamIds = await getScopedDealTeamIds(
                req.org.id,
                req.user.id,
                req.membership.role
            );

            filters.teamIds = visibleTeamIds ?? [];
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

        const result = await getDealWithDetails(req.deal.id, {
            audience: req.membership?.role === "partner" ? "partner" : "internal",
        });
        res.json({
            deal: result.deal,
            partner: result.partner,
            team: result.team,
            assignments: result.assignments,
            tasks: result.tasks,
            documents: result.documents,
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
        if (req.body.teamId !== undefined) {
            if (!req.org) {
                res.status(403).json({ error: "Access denied" });
                return;
            }

            const teamRow = await getTeamByIdForOrg(req.body.teamId, req.org.id);
            if (!teamRow) {
                res.status(404).json({ error: "Team not found in this organization" });
                return;
            }

            const partnerAssignedToTeam = await isPartnerAssignedToTeam(
                req.body.teamId,
                req.deal.partnerId
            );
            if (!partnerAssignedToTeam) {
                res.status(400).json({
                    error: "Deal partner must be assigned to the selected team",
                });
                return;
            }

            updates.teamId = req.body.teamId;
        }

        if (Object.keys(updates).length === 0) {
            res.status(400).json({ error: "No fields to update" });
            return;
        }

        const updated = await updateDeal(req.deal.id, updates);
        if (updated && req.org) {
            await createActivity(
                req.org.id,
                req.user.id,
                "deal",
                req.deal.id,
                `updated deal "${updated.title}"`
            );
        }
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
        if (updated && req.org && req.user) {
            await createActivity(
                req.org.id,
                req.user.id,
                "deal",
                req.deal.id,
                `archived deal "${req.deal.title}"`
            );
        }
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

        const memberOfDealTeam = await isUserInTeam(req.deal.teamId, userId);
        if (!memberOfDealTeam) {
            res.status(400).json({
                error: "User must be a member of the deal's team",
            });
            return;
        }

        const existing = await getDealAssignmentRecord(req.deal.id, userId);
        if (existing) {
            res.status(409).json({ error: "User is already assigned to this deal" });
            return;
        }

        const assignment = await assignUserToDeal(req.deal.id, userId);
        await createActivity(
            req.org.id,
            req.user.id,
            "deal",
            req.deal.id,
            `assigned user ${userId} to deal "${req.deal.title}"`
        );

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

        if (req.org && req.user) {
            await createActivity(
                req.org.id,
                req.user.id,
                "deal",
                req.deal.id,
                `removed user ${userId} from deal "${req.deal.title}"`
            );
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
        if (req.org) {
            await createActivity(
                req.org.id,
                req.user.id,
                "deal",
                req.deal.id,
                "posted a deal comment"
            );
        }

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

// Deal Tasks ->

export async function createDealTaskHandler(
    req: AuthRequest,
    res: Response
): Promise<void> {
    try {
        if (!req.deal || !req.user || !req.org) {
            res.status(403).json({ error: "Access denied" });
            return;
        }

        if (req.body.assigneeUserId) {
            const validAssignee = await isUserInTeam(req.deal.teamId, req.body.assigneeUserId);
            if (!validAssignee) {
                res.status(400).json({
                    error: "Task assignee must be a member of the deal team",
                });
                return;
            }
        }

        const task = await createDealTask(req.deal.id, req.user.id, req.body);
        await createActivity(
            req.org.id,
            req.user.id,
            "deal_task",
            req.deal.id,
            `created task "${task.title}" on deal "${req.deal.title}"`
        );

        res.status(201).json({ task });
    } catch (error) {
        console.error("Create deal task error:", error);
        res.status(500).json({ error: "Failed to create task" });
    }
}

export async function getDealTasksHandler(
    req: AuthRequest,
    res: Response
): Promise<void> {
    try {
        if (!req.deal || !req.membership) {
            res.status(403).json({ error: "Access denied" });
            return;
        }

        if (req.membership.role === "partner") {
            res.json({ tasks: [] });
            return;
        }

        const tasks = await getDealTasks(req.deal.id);
        res.json({ tasks });
    } catch (error) {
        console.error("Get deal tasks error:", error);
        res.status(500).json({ error: "Failed to fetch tasks" });
    }
}

export async function updateDealTaskHandler(
    req: AuthRequest,
    res: Response
): Promise<void> {
    try {
        if (!req.deal || !req.user || !req.org || !req.membership) {
            res.status(403).json({ error: "Access denied" });
            return;
        }

        const taskId = req.params.taskId as string;
        const task = await getDealTaskById(taskId);

        if (!task || task.dealId !== req.deal.id) {
            res.status(404).json({ error: "Task not found" });
            return;
        }

        if (req.body.assigneeUserId) {
            const validAssignee = await isUserInTeam(req.deal.teamId, req.body.assigneeUserId);
            if (!validAssignee) {
                res.status(400).json({
                    error: "Task assignee must be a member of the deal team",
                });
                return;
            }
        }

        if (req.membership.role === "member") {
            const allowedFields = ["status"];
            const requestedFields = Object.keys(req.body);
            const hasInvalidField = requestedFields.some((field) => !allowedFields.includes(field));

            if (hasInvalidField || task.assigneeUserId !== req.user.id) {
                res.status(403).json({
                    error: "Members can only update the status of tasks assigned to them",
                });
                return;
            }
        }

        const updated = await updateDealTask(taskId, req.body);
        if (!updated) {
            res.status(404).json({ error: "Task not found" });
            return;
        }

        await createActivity(
            req.org.id,
            req.user.id,
            "deal_task",
            req.deal.id,
            `updated task "${updated.title}" on deal "${req.deal.title}"`
        );

        res.json({ task: updated });
    } catch (error) {
        console.error("Update deal task error:", error);
        res.status(500).json({ error: "Failed to update task" });
    }
}

export async function deleteDealTaskHandler(
    req: AuthRequest,
    res: Response
): Promise<void> {
    try {
        if (!req.deal || !req.user || !req.org) {
            res.status(403).json({ error: "Access denied" });
            return;
        }

        const taskId = req.params.taskId as string;
        const task = await getDealTaskById(taskId);

        if (!task || task.dealId !== req.deal.id) {
            res.status(404).json({ error: "Task not found" });
            return;
        }

        await deleteDealTask(taskId);
        await createActivity(
            req.org.id,
            req.user.id,
            "deal_task",
            req.deal.id,
            `deleted task "${task.title}" from deal "${req.deal.title}"`
        );

        res.json({ success: true });
    } catch (error) {
        console.error("Delete deal task error:", error);
        res.status(500).json({ error: "Failed to delete task" });
    }
}

// Deal Documents ->

export async function createDealDocumentHandler(
    req: AuthRequest,
    res: Response
): Promise<void> {
    try {
        if (!req.deal || !req.user || !req.org || !req.membership) {
            res.status(403).json({ error: "Access denied" });
            return;
        }

        const visibility =
            req.membership.role === "partner"
                ? "shared"
                : ((req.body.visibility ?? "shared") as "shared" | "internal");

        const document = await createDealDocument(req.deal.id, req.user.id, {
            fileName: req.body.fileName,
            fileUrl: req.body.fileUrl,
            visibility,
        });

        await createActivity(
            req.org.id,
            req.user.id,
            "deal_document",
            req.deal.id,
            `uploaded ${visibility} document "${document.fileName}" to deal "${req.deal.title}"`
        );

        res.status(201).json({ document });
    } catch (error) {
        console.error("Create deal document error:", error);
        res.status(500).json({ error: "Failed to upload document" });
    }
}

export async function getDealDocumentsHandler(
    req: AuthRequest,
    res: Response
): Promise<void> {
    try {
        if (!req.deal || !req.membership) {
            res.status(403).json({ error: "Access denied" });
            return;
        }

        const documents = await getDealDocuments(
            req.deal.id,
            req.membership.role === "partner" ? { visibility: "shared" } : undefined
        );
        res.json({ documents });
    } catch (error) {
        console.error("Get deal documents error:", error);
        res.status(500).json({ error: "Failed to fetch documents" });
    }
}

export async function deleteDealDocumentHandler(
    req: AuthRequest,
    res: Response
): Promise<void> {
    try {
        if (!req.deal || !req.user || !req.org || !req.membership) {
            res.status(403).json({ error: "Access denied" });
            return;
        }

        const documentId = req.params.documentId as string;
        const document = await getDealDocumentById(documentId);

        if (!document || document.dealId !== req.deal.id) {
            res.status(404).json({ error: "Document not found" });
            return;
        }

        const canDelete =
            req.membership.role === "admin" ||
            req.membership.role === "manager" ||
            document.uploadedBy === req.user.id;

        if (!canDelete) {
            res.status(403).json({ error: "Insufficient permissions" });
            return;
        }

        await deleteDealDocument(documentId);
        await createActivity(
            req.org.id,
            req.user.id,
            "deal_document",
            req.deal.id,
            `deleted document "${document.fileName}" from deal "${req.deal.title}"`
        );

        res.json({ success: true });
    } catch (error) {
        console.error("Delete deal document error:", error);
        res.status(500).json({ error: "Failed to delete document" });
    }
}
