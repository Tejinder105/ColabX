import type { Response, NextFunction } from "express";
import { getTeamById, isTeamMember } from "./teams.service.js";
import type { AuthRequest } from "../middlewares/authMiddleware.js";

export async function requireTeam(
    req: AuthRequest,
    res: Response,
    next: NextFunction
): Promise<void> {
    try {
        if (!req.org) {
            res.status(403).json({ error: "Organization context required" });
            return;
        }

        const teamId = req.params.teamId as string;

        if (!teamId) {
            res.status(400).json({ error: "teamId parameter is required" });
            return;
        }

        const teamRow = await getTeamById(teamId, req.org.id);

        if (!teamRow) {
            res.status(404).json({ error: "Team not found" });
            return;
        }

        req.team = {
            id: teamRow.id,
            name: teamRow.name,
            description: teamRow.description,
            orgId: teamRow.orgId,
            createdBy: teamRow.createdBy,
        };

        next();
    } catch (error) {
        console.error("requireTeam error:", error);
        res.status(500).json({ error: "Failed to verify team access" });
    }
}

export async function requireTeamAccess(
    req: AuthRequest,
    res: Response,
    next: NextFunction
): Promise<void> {
    try {
        if (!req.team || !req.user || !req.membership) {
            res.status(403).json({ error: "Access denied" });
            return;
        }

        if (req.membership.role === "admin") {
            next();
            return;
        }

        if (req.membership.role !== "manager" && req.membership.role !== "member") {
            res.status(403).json({ error: "Insufficient permissions" });
            return;
        }

        const memberOfTeam = await isTeamMember(req.team.id, req.user.id);
        if (!memberOfTeam) {
            res.status(403).json({ error: "Access denied to this team" });
            return;
        }

        next();
    } catch (error) {
        console.error("requireTeamAccess error:", error);
        res.status(500).json({ error: "Failed to verify team permissions" });
    }
}
