import type { Request, Response, NextFunction } from "express";
import { auth } from "../utils/auth.js";
import { fromNodeHeaders } from "better-auth/node";

export interface AuthRequest extends Request {
    user?: {
        id: string;
        email: string;
        name: string;
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
        status: "active" | "inactive" | "suspended";
        orgId: string;
        createdBy: string | null;
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
