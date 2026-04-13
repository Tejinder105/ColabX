import type { Request, Response, NextFunction } from "express";
import { auth } from "../utils/auth.js";
import { fromNodeHeaders } from "better-auth/node";
import type { OrgRole } from "../org/org.constants.js";

export interface AuthRequest extends Request {
    user?: {
        id: string;
        email: string;
        name: string;
        image?: string | null | undefined;
    };
    session?: {
        id: string;
        userId: string;
    };
    org?: {
        organizationId: string;
        name: string;
        slug: string;
    };
    membership?: {
        orgUserId: string;
        role: OrgRole;
        joinedAt: Date;
    };
    team?: {
        teamId: string;
        name: string;
        description: string | null;
        organizationId: string;
        createdByUserId: string | null;
    };
    partner?: {
        partnerId: string;
        name: string;
        type: "reseller" | "agent" | "technology" | "distributor";
        status: "pending" | "active" | "inactive" | "suspended";
        organizationId: string;
        createdByUserId: string | null;
        userId: string | null;
    };
    deal?: {
        dealId: string;
        title: string;
        partnerId: string;
        teamId: string | null;
        stage: "lead" | "proposal" | "negotiation" | "won" | "lost";
        organizationId: string;
        createdByUserId: string | null;
    };
    objective?: {
        objectiveId: string;
        title: string;
        partnerId: string | null;
        teamId: string | null;
        organizationId: string;
    };
    keyResult?: {
        keyResultId: string;
        objectiveId: string;
        title: string;
        targetValue: number;
        currentValue: number;
        status: "on_track" | "at_risk" | "off_track";
    };
}

export async function authMiddleware(
    req: AuthRequest,
    res: Response,
    next: NextFunction
): Promise<void> {
    try {
        const session = await auth.api.getSession({
            headers: fromNodeHeaders(req.headers),
        });

        if (!session) {
            res.status(401).json({ error: "Unauthorized" });
            return;
        }

        req.user = session.user;
        req.session = session.session;
        next();
    } catch (error) {
        res.status(401).json({ error: "Unauthorized" });
    }
}
