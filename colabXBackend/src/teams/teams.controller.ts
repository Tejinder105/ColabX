import type { Response } from "express";
import type { AuthRequest } from "../middlewares/authMiddleware.js";
import {
    createTeam,
    getOrgTeams,
    getTeamWithMembers,
    updateTeam,
    deleteTeam,
    isOrgMember,
    getTeamMemberRecord,
    addTeamMember,
    getTeamMembers,
    updateTeamMemberRole,
    removeTeamMember,
} from "./teams.service.js";

// POST /api/teams
export async function createTeamHandler(
    req: AuthRequest,
    res: Response
): Promise<void> {
    try {
        if (!req.org || !req.user) {
            res.status(401).json({ error: "Unauthorized" });
            return;
        }

        const created = await createTeam(req.org.id, req.user.id, req.body);
        res.status(201).json({ team: created });
    } catch (error) {
        console.error("Create team error:", error);
        res.status(500).json({ error: "Failed to create team" });
    }
}

// GET /api/teams
export async function getOrgTeamsHandler(
    req: AuthRequest,
    res: Response
): Promise<void> {
    try {
        if (!req.org) {
            res.status(403).json({ error: "Access denied" });
            return;
        }

        const teams = await getOrgTeams(req.org.id);
        res.json({ teams });
    } catch (error) {
        console.error("Get teams error:", error);
        res.status(500).json({ error: "Failed to fetch teams" });
    }
}

// GET /api/teams/:teamId
export async function getTeamByIdHandler(
    req: AuthRequest,
    res: Response
): Promise<void> {
    try {
        if (!req.team) {
            res.status(404).json({ error: "Team not found" });
            return;
        }

        const result = await getTeamWithMembers(req.team.id);
        res.json({ team: result.team, members: result.members });
    } catch (error) {
        console.error("Get team error:", error);
        res.status(500).json({ error: "Failed to fetch team" });
    }
}

// PATCH /api/teams/:teamId
export async function updateTeamHandler(
    req: AuthRequest,
    res: Response
): Promise<void> {
    try {
        if (!req.team) {
            res.status(404).json({ error: "Team not found" });
            return;
        }

        // Strip undefined values — only send defined keys to Drizzle
        const updates: Record<string, string | null> = {};
        if (req.body.name !== undefined) updates.name = req.body.name;
        if (req.body.description !== undefined) updates.description = req.body.description;

        if (Object.keys(updates).length === 0) {
            res.status(400).json({ error: "No fields to update" });
            return;
        }

        const updated = await updateTeam(req.team.id, updates);
        res.json({ team: updated });
    } catch (error) {
        console.error("Update team error:", error);
        res.status(500).json({ error: "Failed to update team" });
    }
}

// DELETE /api/teams/:teamId
export async function deleteTeamHandler(
    req: AuthRequest,
    res: Response
): Promise<void> {
    try {
        if (!req.team) {
            res.status(404).json({ error: "Team not found" });
            return;
        }

        await deleteTeam(req.team.id);
        res.json({ success: true });
    } catch (error) {
        console.error("Delete team error:", error);
        res.status(500).json({ error: "Failed to delete team" });
    }
}

// POST /api/teams/:teamId/members
export async function addTeamMemberHandler(
    req: AuthRequest,
    res: Response
): Promise<void> {
    try {
        if (!req.team || !req.org) {
            res.status(403).json({ error: "Access denied" });
            return;
        }

        const { userId, role } = req.body;

        // Verify the target user is a member of this organization
        const orgMember = await isOrgMember(req.org.id, userId);
        if (!orgMember) {
            res.status(400).json({
                error: "User is not a member of this organization",
            });
            return;
        }

        // Prevent duplicate team membership
        const existing = await getTeamMemberRecord(req.team.id, userId);
        if (existing) {
            res.status(409).json({
                error: "User is already a member of this team",
            });
            return;
        }

        const member = await addTeamMember(req.team.id, userId, role);
        res.status(201).json({ member });
    } catch (error) {
        console.error("Add team member error:", error);
        res.status(500).json({ error: "Failed to add team member" });
    }
}

// GET /api/teams/:teamId/members
export async function getTeamMembersHandler(
    req: AuthRequest,
    res: Response
): Promise<void> {
    try {
        if (!req.team) {
            res.status(404).json({ error: "Team not found" });
            return;
        }

        const members = await getTeamMembers(req.team.id);
        res.json({ members });
    } catch (error) {
        console.error("Get team members error:", error);
        res.status(500).json({ error: "Failed to fetch team members" });
    }
}

// PATCH /api/teams/:teamId/members/:userId/role
export async function updateTeamMemberRoleHandler(
    req: AuthRequest,
    res: Response
): Promise<void> {
    try {
        if (!req.team) {
            res.status(404).json({ error: "Team not found" });
            return;
        }

        const userId = req.params.userId as string;
        const { role } = req.body;

        const updated = await updateTeamMemberRole(req.team.id, userId, role);
        if (!updated) {
            res.status(404).json({ error: "Team member not found" });
            return;
        }

        res.json({ member: updated });
    } catch (error) {
        console.error("Update team member role error:", error);
        res.status(500).json({ error: "Failed to update team member role" });
    }
}

// DELETE /api/teams/:teamId/members/:userId
export async function removeTeamMemberHandler(
    req: AuthRequest,
    res: Response
): Promise<void> {
    try {
        if (!req.team) {
            res.status(404).json({ error: "Team not found" });
            return;
        }

        const userId = req.params.userId as string;

        const deleted = await removeTeamMember(req.team.id, userId);
        if (deleted.length === 0) {
            res.status(404).json({ error: "Team member not found" });
            return;
        }

        res.json({ success: true });
    } catch (error) {
        console.error("Remove team member error:", error);
        res.status(500).json({ error: "Failed to remove team member" });
    }
}
