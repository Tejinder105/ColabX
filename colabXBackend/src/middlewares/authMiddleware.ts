import type { Request, Response, NextFunction } from "express";
import { auth } from "../utils/auth.js";
import { fromNodeHeaders } from "better-auth/node";

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
        id: string;
        name: string;
        slug: string;
    };
    membership?: {
        id: string;
        role: "admin" | "manager" | "partner";
        joinedAt: Date;
    };
    team?: {
        id: string;
        name: string;
        description: string | null;
        orgId: string;
        createdBy: string | null;
    };
    partner?: {
        id: string;
        name: string;
        type: "reseller" | "agent" | "technology" | "distributor";
        status: "pending" | "active" | "inactive" | "suspended";
        orgId: string;
        createdBy: string | null;
    };
    deal?: {
        id: string;
        title: string;
        partnerId: string;
        stage: "lead" | "proposal" | "negotiation" | "won" | "lost";
        orgId: string;
        createdBy: string | null;
    };
    objective?: {
        id: string;
        title: string;
        partnerId: string;
        orgId: string;
    };
    keyResult?: {
        id: string;
        objectiveId: string;
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
