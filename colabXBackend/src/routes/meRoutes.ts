import { Router } from "express";
import type { Response } from "express";
import { eq } from "drizzle-orm";
import db from "../db/index.js";
import { orgUser, organization } from "../schemas/orgSchema.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import type { AuthRequest } from "../middlewares/authMiddleware.js";

const router = Router();

// All routes require authentication
router.use(authMiddleware);

// GET /api/me - Get current user with organizations
router.get("/", async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const userId = req.user?.id;

        if (!userId) {
            res.status(401).json({ error: "Unauthorized" });
            return;
        }

        const userOrgs = await db
            .select({
                organizationId: organization.organizationId,
                name: organization.name,
                slug: organization.slug,
                role: orgUser.role,
                joinedAt: orgUser.joinedAt,
            })
            .from(orgUser)
            .innerJoin(organization, eq(orgUser.organizationId, organization.organizationId))
            .where(eq(orgUser.userId, userId));

        res.json({
            user: req.user,
            organizations: userOrgs,
            orgCount: userOrgs.length,
        });
    } catch (error) {
        console.error("Get current user error:", error);
        res.status(500).json({ error: "Failed to fetch user data" });
    }
});

export default router;
