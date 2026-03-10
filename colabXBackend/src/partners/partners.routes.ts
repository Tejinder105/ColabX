import { Router } from "express";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import { requireOrganization, requireRole } from "../middlewares/requireOrganization.js";
import { validate } from "../middlewares/validate.js";
import { requirePartner } from "./partners.middleware.js";
import {
    createPartnerSchema,
    updatePartnerSchema,
    assignTeamSchema,
    addPartnerUserSchema,
    updatePartnerUserRoleSchema,
} from "./partners.validation.js";
import {
    createPartnerHandler,
    getOrgPartnersHandler,
    getPartnerByIdHandler,
    updatePartnerHandler,
    deletePartnerHandler,
    assignTeamHandler,
    getPartnerTeamsHandler,
    removeTeamFromPartnerHandler,
    addPartnerUserHandler,
    getPartnerUsersHandler,
    updatePartnerUserRoleHandler,
    removePartnerUserHandler,
} from "./partners.controller.js";

const router = Router();

// All partner routes require authentication
router.use(authMiddleware);

// ── Partner CRUD ─────────────────────────────────────────────────────────────

router.post(
    "/",
    requireOrganization,
    requireRole("admin", "manager"),
    validate(createPartnerSchema),
    createPartnerHandler
);

router.get("/", requireOrganization, getOrgPartnersHandler);

router.get("/:partnerId", requireOrganization, requirePartner, getPartnerByIdHandler);

router.patch(
    "/:partnerId",
    requireOrganization,
    requirePartner,
    requireRole("admin", "manager"),
    validate(updatePartnerSchema),
    updatePartnerHandler
);

router.delete(
    "/:partnerId",
    requireOrganization,
    requirePartner,
    requireRole("admin", "manager"),
    deletePartnerHandler
);

// ── Partner–Team Assignment ──────────────────────────────────────────────────

router.post(
    "/:partnerId/teams",
    requireOrganization,
    requirePartner,
    requireRole("admin", "manager"),
    validate(assignTeamSchema),
    assignTeamHandler
);

router.get(
    "/:partnerId/teams",
    requireOrganization,
    requirePartner,
    getPartnerTeamsHandler
);

router.delete(
    "/:partnerId/teams/:teamId",
    requireOrganization,
    requirePartner,
    requireRole("admin", "manager"),
    removeTeamFromPartnerHandler
);

// ── Partner Users ─────────────────────────────────────────────────────────────

router.post(
    "/:partnerId/users",
    requireOrganization,
    requirePartner,
    requireRole("admin", "manager"),
    validate(addPartnerUserSchema),
    addPartnerUserHandler
);

router.get(
    "/:partnerId/users",
    requireOrganization,
    requirePartner,
    getPartnerUsersHandler
);

router.patch(
    "/:partnerId/users/:userId/role",
    requireOrganization,
    requirePartner,
    requireRole("admin", "manager"),
    validate(updatePartnerUserRoleSchema),
    updatePartnerUserRoleHandler
);

router.delete(
    "/:partnerId/users/:userId",
    requireOrganization,
    requirePartner,
    requireRole("admin", "manager"),
    removePartnerUserHandler
);

export default router;
