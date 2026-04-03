import { Router } from "express";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import { requireOrganization, requireRole } from "../middlewares/requireOrganization.js";
import { validate } from "../middlewares/validate.js";
import {
    createOrgSchema,
    updateOrgSchema,
    changeMemberRoleSchema,
} from "../schemas/validationSchemas.js";
import {
    createOrganization,
    getUserOrganizations,
    getOrganizationById,
    getOrganizationMembers,
    getOrganizationPermissions,
    getOrganizationAuditLogs,
    updateOrganization,
    deleteOrganization,
    changeMemberRole,
    removeMember,
} from "../controllers/orgController.js";
import { getPendingInvitations } from "../controllers/inviteController.js";

const router = Router();

// All routes require authentication
router.use(authMiddleware);

// Routes that do NOT require org context
router.post("/", validate(createOrgSchema), createOrganization);
router.get("/", getUserOrganizations);

// Routes that require org context (x-org-id header)
router.get("/:id", requireOrganization, getOrganizationById);
router.get("/:id/permissions", requireOrganization, getOrganizationPermissions);
router.get("/:id/audit-logs", requireOrganization, getOrganizationAuditLogs);
router.patch("/:id", requireOrganization, requireRole("admin"), validate(updateOrgSchema), updateOrganization);
router.delete("/:id", requireOrganization, requireRole("admin"), deleteOrganization);

// Member management
router.get("/:id/members", requireOrganization, getOrganizationMembers);
router.patch("/:id/members/:memberId/role", requireOrganization, requireRole("admin"), validate(changeMemberRoleSchema), changeMemberRole);
router.delete("/:id/members/:memberId", requireOrganization, requireRole("admin"), removeMember);

// Invitations (scoped to org)
router.get("/:id/invitations", requireOrganization, requireRole("admin", "manager"), getPendingInvitations);

export default router;
