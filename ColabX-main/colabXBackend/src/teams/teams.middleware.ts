import type { Response, NextFunction } from "express";
import { getTeamById } from "./teams.service.js";
import type { AuthRequest } from "../middlewares/authMiddleware.js";

// Verifies the team exists and belongs to the current org.
// Must run AFTER requireOrganization (requires req.org to be set).
// Attaches req.team on success.
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

        // orgId filter enforces cross-tenant isolation: a team from another org returns 404
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
