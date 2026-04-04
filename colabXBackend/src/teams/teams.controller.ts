import type { Response } from "express";
import type { AuthRequest } from "../middlewares/authMiddleware.js";
import { createActivity } from "../collaboration/collaboration.service.js";
import { getPartnerById } from "../partners/partners.service.js";
import {
    createTeam,
    getOrgTeams,
    getTeamWithMembers,
    updateTeam,
    deleteTeam,
    isOrgMember,
    getOrgMemberUserIds,
    getTeamMemberRecord,
    addTeamMember,
    getTeamMembers,
    updateTeamMemberRole,
    removeTeamMember,
    getTeamPartnerRecord,
    assignPartnerToTeam,
    removePartnerFromTeam,
    getTeamPartners,
    getTeamDeals,
    getTeamObjectives,
    getTeamActivity,
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

        const requestedUserIds = [
            ...(req.body.memberIds ?? []),
            ...(req.body.leadUserId ? [req.body.leadUserId] : []),
        ];
        const validUserIds = await getOrgMemberUserIds(req.org.id, requestedUserIds);

        if (validUserIds.length !== [...new Set(requestedUserIds)].length) {
            res.status(400).json({
                error: "Lead and members must belong to this organization",
            });
            return;
        }

        const created = await createTeam(req.org.id, req.user.id, req.body);
        if (!created.team) {
            throw new Error("Failed to create team");
        }

        try {
            await createActivity(
                req.org.id,
                req.user.id,
                "team",
                created.team.id,
                `created team "${created.team.name}"`
            );
        } catch (activityError) {
            console.error("Activity log write failed:", activityError);
        }

        res.status(201).json(created);
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
        if (!req.org || !req.user || !req.membership) {
            res.status(403).json({ error: "Access denied" });
            return;
        }

        const visibleToUserId =
            req.membership.role === "manager" ? req.user.id : undefined;

        const teams = await getOrgTeams(req.org.id, visibleToUserId);
        res.json({
            teams,
            summary: {
                totalTeams: teams.length,
                totalMembers: teams.reduce((sum, teamRow) => sum + teamRow.memberCount, 0),
                activeTeams: teams.filter((teamRow) => teamRow.isActive).length,
            },
        });
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
        if (!req.team || !req.org) {
            res.status(404).json({ error: "Team not found" });
            return;
        }

        const result = await getTeamWithMembers(req.team.id, req.org.id);
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

        const updates: Record<string, string | null> = {};
        if (req.body.name !== undefined) updates.name = req.body.name;
        if (req.body.description !== undefined) updates.description = req.body.description;

        if (Object.keys(updates).length === 0) {
            res.status(400).json({ error: "No fields to update" });
            return;
        }

        const updated = await updateTeam(req.team.id, updates);
        if (!updated) {
            res.status(404).json({ error: "Team not found" });
            return;
        }

        if (req.org && req.user) {
            try {
                const changedFields = Object.keys(updates).join(", ");
                await createActivity(
                    req.org.id,
                    req.user.id,
                    "team",
                    req.team.id,
                    `updated team "${updated.name}" (${changedFields})`
                );
            } catch (activityError) {
                console.error("Activity log write failed:", activityError);
            }
        }

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

        const deleted = await deleteTeam(req.team.id);

        if (req.org && req.user && deleted) {
            try {
                await createActivity(
                    req.org.id,
                    req.user.id,
                    "team",
                    req.team.id,
                    `deleted team "${req.team.name}"`
                );
            } catch (activityError) {
                console.error("Activity log write failed:", activityError);
            }
        }

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

        const orgMember = await isOrgMember(req.org.id, userId);
        if (!orgMember) {
            res.status(400).json({
                error: "User is not a member of this organization",
            });
            return;
        }

        const existing = await getTeamMemberRecord(req.team.id, userId);
        if (existing) {
            res.status(409).json({
                error: "User is already a member of this team",
            });
            return;
        }

        const member = await addTeamMember(req.team.id, userId, role);

        if (req.org && req.user) {
            try {
                await createActivity(
                    req.org.id,
                    req.user.id,
                    "team",
                    req.team.id,
                    `added user ${userId} to team "${req.team.name}" as ${role}`
                );
            } catch (activityError) {
                console.error("Activity log write failed:", activityError);
            }
        }

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

        if (req.org && req.user) {
            try {
                await createActivity(
                    req.org.id,
                    req.user.id,
                    "team",
                    req.team.id,
                    `updated user ${userId} role in team "${req.team.name}" to ${role}`
                );
            } catch (activityError) {
                console.error("Activity log write failed:", activityError);
            }
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

        if (req.org && req.user) {
            try {
                await createActivity(
                    req.org.id,
                    req.user.id,
                    "team",
                    req.team.id,
                    `removed user ${userId} from team "${req.team.name}"`
                );
            } catch (activityError) {
                console.error("Activity log write failed:", activityError);
            }
        }

        res.json({ success: true });
    } catch (error) {
        console.error("Remove team member error:", error);
        res.status(500).json({ error: "Failed to remove team member" });
    }
}

// POST /api/teams/:teamId/partners
export async function assignTeamPartnerHandler(
    req: AuthRequest,
    res: Response
): Promise<void> {
    try {
        if (!req.team || !req.org || !req.user) {
            res.status(403).json({ error: "Access denied" });
            return;
        }

        const { partnerId } = req.body;
        const partnerRow = await getPartnerById(partnerId, req.org.id);

        if (!partnerRow) {
            res.status(404).json({ error: "Partner not found" });
            return;
        }

        const existing = await getTeamPartnerRecord(req.team.id, partnerId);
        if (existing) {
            res.status(409).json({ error: "Partner is already assigned to this team" });
            return;
        }

        const assignment = await assignPartnerToTeam(req.team.id, partnerId, req.user.id);

        try {
            await createActivity(
                req.org.id,
                req.user.id,
                "team",
                req.team.id,
                `assigned partner "${partnerRow.name}" to team "${req.team.name}"`
            );
        } catch (activityError) {
            console.error("Activity log write failed:", activityError);
        }

        res.status(201).json({ assignment });
    } catch (error) {
        console.error("Assign team partner error:", error);
        res.status(500).json({ error: "Failed to assign partner to team" });
    }
}

// DELETE /api/teams/:teamId/partners/:partnerId
export async function removeTeamPartnerHandler(
    req: AuthRequest,
    res: Response
): Promise<void> {
    try {
        if (!req.team || !req.org || !req.user) {
            res.status(403).json({ error: "Access denied" });
            return;
        }

        const partnerId = req.params.partnerId as string;
        const removed = await removePartnerFromTeam(req.team.id, partnerId);

        if (removed.length === 0) {
            res.status(404).json({ error: "Partner assignment not found" });
            return;
        }

        try {
            await createActivity(
                req.org.id,
                req.user.id,
                "team",
                req.team.id,
                `removed partner ${partnerId} from team "${req.team.name}"`
            );
        } catch (activityError) {
            console.error("Activity log write failed:", activityError);
        }

        res.json({ success: true });
    } catch (error) {
        console.error("Remove team partner error:", error);
        res.status(500).json({ error: "Failed to remove partner from team" });
    }
}

// GET /api/teams/:teamId/partners
export async function getTeamPartnersHandler(
    req: AuthRequest,
    res: Response
): Promise<void> {
    try {
        if (!req.team || !req.org) {
            res.status(404).json({ error: "Team not found" });
            return;
        }

        const partners = await getTeamPartners(req.team.id, req.org.id);
        res.json({ partners });
    } catch (error) {
        console.error("Get team partners error:", error);
        res.status(500).json({ error: "Failed to fetch team partners" });
    }
}

// GET /api/teams/:teamId/deals
export async function getTeamDealsHandler(
    req: AuthRequest,
    res: Response
): Promise<void> {
    try {
        if (!req.team || !req.org) {
            res.status(404).json({ error: "Team not found" });
            return;
        }

        const deals = await getTeamDeals(req.team.id, req.org.id);
        res.json({ deals });
    } catch (error) {
        console.error("Get team deals error:", error);
        res.status(500).json({ error: "Failed to fetch team deals" });
    }
}

// GET /api/teams/:teamId/objectives
export async function getTeamObjectivesHandler(
    req: AuthRequest,
    res: Response
): Promise<void> {
    try {
        if (!req.team || !req.org) {
            res.status(404).json({ error: "Team not found" });
            return;
        }

        const objectives = await getTeamObjectives(req.team.id, req.org.id);
        res.json({ objectives });
    } catch (error) {
        console.error("Get team objectives error:", error);
        res.status(500).json({ error: "Failed to fetch team objectives" });
    }
}

// GET /api/teams/:teamId/activity
export async function getTeamActivityHandler(
    req: AuthRequest,
    res: Response
): Promise<void> {
    try {
        if (!req.team || !req.org) {
            res.status(404).json({ error: "Team not found" });
            return;
        }

        const activities = await getTeamActivity(req.team.id, req.org.id);
        res.json({ activities });
    } catch (error) {
        console.error("Get team activity error:", error);
        res.status(500).json({ error: "Failed to fetch team activity" });
    }
}
