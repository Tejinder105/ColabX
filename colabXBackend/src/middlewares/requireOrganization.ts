import type { Response, NextFunction } from "express";
import { eq, and } from "drizzle-orm";
import db from "../db/index.js";
import { organization, orgUser } from "../schemas/orgSchema.js";
import type { AuthRequest } from "./authMiddleware.js";
import type { OrgRole } from "../org/org.constants.js";

export async function requireOrganization(
    req: AuthRequest,
    res: Response,
    next: NextFunction
): Promise<void> {
    try {
        const orgId = req.headers["x-org-id"] as string | undefined;

        if (!orgId) {
            res.status(400).json({ error: "x-org-id header is required" });
            return;
        }

        const userId = req.user?.id;
        if (!userId) {
            res.status(401).json({ error: "Unauthorized" });
            return;
        }

        const [result] = await db
            .select({
                organizationId: organization.organizationId,
                orgName: organization.name,
                orgSlug: organization.slug,
                membershipId: orgUser.orgUserId,
                role: orgUser.role,
                joinedAt: orgUser.joinedAt,
            })
            .from(orgUser)
            .innerJoin(organization, eq(orgUser.organizationId, organization.organizationId))
            .where(
                and(
                    eq(orgUser.organizationId, orgId),
                    eq(orgUser.userId, userId)
                )
            )
            .limit(1);

        if (!result) {
            res.status(403).json({ error: "Not a member of this organization" });
            return;
        }

        req.org = {
            organizationId: result.organizationId,
            name: result.orgName,
            slug: result.orgSlug,
        };
        req.membership = {
            orgUserId: result.membershipId,
            role: result.role,
            joinedAt: result.joinedAt,
        };

        next();
    } catch (error) {
        console.error("requireOrganization error:", error);
        res.status(500).json({ error: "Failed to verify organization access" });
    }
}

export function requireRole(...allowedRoles: OrgRole[]) {
    return (req: AuthRequest, res: Response, next: NextFunction): void => {
        if (!req.membership || !allowedRoles.includes(req.membership.role)) {
            res.status(403).json({ error: "Insufficient permissions" });
            return;
        }
        next();
    };
}
