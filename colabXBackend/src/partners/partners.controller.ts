import type { Response } from "express";
import type { AuthRequest } from "../middlewares/authMiddleware.js";
import {
    createPartner,
    getOrgPartners,
    getPartnerWithTeams,
    updatePartner,
    softDeletePartner,
    getPartnerTeamRecord,
    assignTeamToPartner,
    getPartnerTeams,
    removeTeamFromPartner,
    getPartnerUserRecord,
    addPartnerUser,
    getPartnerUsers,
    updatePartnerUserRole,
    removePartnerUser,
    isOrgMember,
} from "./partners.service.js";
import { getTeamById } from "../teams/teams.service.js";

// ── Partner CRUD ─────────────────────────────────────────────────────────────

// POST /api/partners
export async function createPartnerHandler(
    req: AuthRequest,
    res: Response
): Promise<void> {
    try {
        if (!req.org || !req.user) {
            res.status(401).json({ error: "Unauthorized" });
            return;
        }

        const created = await createPartner(req.org.id, req.user.id, req.body);
        res.status(201).json({ partner: created });
    } catch (error) {
        console.error("Create partner error:", error);
        res.status(500).json({ error: "Failed to create partner" });
    }
}

// GET /api/partners
export async function getOrgPartnersHandler(
    req: AuthRequest,
    res: Response
): Promise<void> {
    try {
        if (!req.org) {
            res.status(403).json({ error: "Access denied" });
            return;
        }

        const partners = await getOrgPartners(req.org.id);
        res.json({ partners });
    } catch (error) {
        console.error("Get partners error:", error);
        res.status(500).json({ error: "Failed to fetch partners" });
    }
}

// GET /api/partners/:partnerId
export async function getPartnerByIdHandler(
    req: AuthRequest,
    res: Response
): Promise<void> {
    try {
        if (!req.partner) {
            res.status(404).json({ error: "Partner not found" });
            return;
        }

        const result = await getPartnerWithTeams(req.partner.id);
        res.json({ partner: result.partner, teams: result.teams });
    } catch (error) {
        console.error("Get partner error:", error);
        res.status(500).json({ error: "Failed to fetch partner" });
    }
}

// PATCH /api/partners/:partnerId
export async function updatePartnerHandler(
    req: AuthRequest,
    res: Response
): Promise<void> {
    try {
        if (!req.partner) {
            res.status(404).json({ error: "Partner not found" });
            return;
        }

        const updates: Record<string, string | Date | null> = {};
        if (req.body.name !== undefined) updates.name = req.body.name;
        if (req.body.type !== undefined) updates.type = req.body.type;
        if (req.body.status !== undefined) updates.status = req.body.status;
        if (req.body.contactEmail !== undefined) updates.contactEmail = req.body.contactEmail;
        if (req.body.industry !== undefined) updates.industry = req.body.industry;
        if (req.body.onboardingDate !== undefined) {
            updates.onboardingDate = req.body.onboardingDate
                ? new Date(req.body.onboardingDate)
                : null;
        }

        if (Object.keys(updates).length === 0) {
            res.status(400).json({ error: "No fields to update" });
            return;
        }

        const updated = await updatePartner(req.partner.id, updates);
        res.json({ partner: updated });
    } catch (error) {
        console.error("Update partner error:", error);
        res.status(500).json({ error: "Failed to update partner" });
    }
}

// DELETE /api/partners/:partnerId  (soft delete)
export async function deletePartnerHandler(
    req: AuthRequest,
    res: Response
): Promise<void> {
    try {
        if (!req.partner) {
            res.status(404).json({ error: "Partner not found" });
            return;
        }

        const updated = await softDeletePartner(req.partner.id);
        res.json({ partner: updated });
    } catch (error) {
        console.error("Delete partner error:", error);
        res.status(500).json({ error: "Failed to delete partner" });
    }
}

// ── Partner–Team Assignment ──────────────────────────────────────────────────

// POST /api/partners/:partnerId/teams
export async function assignTeamHandler(
    req: AuthRequest,
    res: Response
): Promise<void> {
    try {
        if (!req.partner || !req.org) {
            res.status(403).json({ error: "Access denied" });
            return;
        }

        const { teamId } = req.body;

        // Verify the team belongs to this org
        const teamRow = await getTeamById(teamId, req.org.id);
        if (!teamRow) {
            res.status(404).json({ error: "Team not found in this organization" });
            return;
        }

        // Prevent duplicate assignment
        const existing = await getPartnerTeamRecord(req.partner.id, teamId);
        if (existing) {
            res.status(409).json({ error: "Team is already assigned to this partner" });
            return;
        }

        const assignment = await assignTeamToPartner(req.partner.id, teamId);
        res.status(201).json({ assignment });
    } catch (error) {
        console.error("Assign team error:", error);
        res.status(500).json({ error: "Failed to assign team" });
    }
}

// GET /api/partners/:partnerId/teams
export async function getPartnerTeamsHandler(
    req: AuthRequest,
    res: Response
): Promise<void> {
    try {
        if (!req.partner) {
            res.status(404).json({ error: "Partner not found" });
            return;
        }

        const teams = await getPartnerTeams(req.partner.id);
        res.json({ teams });
    } catch (error) {
        console.error("Get partner teams error:", error);
        res.status(500).json({ error: "Failed to fetch partner teams" });
    }
}

// DELETE /api/partners/:partnerId/teams/:teamId
export async function removeTeamFromPartnerHandler(
    req: AuthRequest,
    res: Response
): Promise<void> {
    try {
        if (!req.partner) {
            res.status(404).json({ error: "Partner not found" });
            return;
        }

        const teamId = req.params.teamId as string;
        const deleted = await removeTeamFromPartner(req.partner.id, teamId);

        if (deleted.length === 0) {
            res.status(404).json({ error: "Team assignment not found" });
            return;
        }

        res.json({ success: true });
    } catch (error) {
        console.error("Remove team from partner error:", error);
        res.status(500).json({ error: "Failed to remove team from partner" });
    }
}

// ── Partner Users ─────────────────────────────────────────────────────────────

// POST /api/partners/:partnerId/users
export async function addPartnerUserHandler(
    req: AuthRequest,
    res: Response
): Promise<void> {
    try {
        if (!req.partner || !req.org) {
            res.status(403).json({ error: "Access denied" });
            return;
        }

        const { userId, role } = req.body;

        // Verify the target user is a member of this organization
        const orgMember = await isOrgMember(req.org.id, userId);
        if (!orgMember) {
            res.status(400).json({ error: "User is not a member of this organization" });
            return;
        }

        // Prevent duplicate partner-user link
        const existing = await getPartnerUserRecord(req.partner.id, userId);
        if (existing) {
            res.status(409).json({ error: "User is already linked to this partner" });
            return;
        }

        const member = await addPartnerUser(req.partner.id, userId, role);
        res.status(201).json({ member });
    } catch (error) {
        console.error("Add partner user error:", error);
        res.status(500).json({ error: "Failed to add partner user" });
    }
}

// GET /api/partners/:partnerId/users
export async function getPartnerUsersHandler(
    req: AuthRequest,
    res: Response
): Promise<void> {
    try {
        if (!req.partner) {
            res.status(404).json({ error: "Partner not found" });
            return;
        }

        const users = await getPartnerUsers(req.partner.id);
        res.json({ users });
    } catch (error) {
        console.error("Get partner users error:", error);
        res.status(500).json({ error: "Failed to fetch partner users" });
    }
}

// PATCH /api/partners/:partnerId/users/:userId/role
export async function updatePartnerUserRoleHandler(
    req: AuthRequest,
    res: Response
): Promise<void> {
    try {
        if (!req.partner) {
            res.status(404).json({ error: "Partner not found" });
            return;
        }

        const userId = req.params.userId as string;
        const { role } = req.body;

        const updated = await updatePartnerUserRole(req.partner.id, userId, role);
        if (!updated) {
            res.status(404).json({ error: "Partner user not found" });
            return;
        }

        res.json({ member: updated });
    } catch (error) {
        console.error("Update partner user role error:", error);
        res.status(500).json({ error: "Failed to update partner user role" });
    }
}

// DELETE /api/partners/:partnerId/users/:userId
export async function removePartnerUserHandler(
    req: AuthRequest,
    res: Response
): Promise<void> {
    try {
        if (!req.partner) {
            res.status(404).json({ error: "Partner not found" });
            return;
        }

        const userId = req.params.userId as string;
        const deleted = await removePartnerUser(req.partner.id, userId);

        if (deleted.length === 0) {
            res.status(404).json({ error: "Partner user not found" });
            return;
        }

        res.json({ success: true });
    } catch (error) {
        console.error("Remove partner user error:", error);
        res.status(500).json({ error: "Failed to remove partner user" });
    }
}
