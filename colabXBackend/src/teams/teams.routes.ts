import { Router } from "express";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import { requireOrganization, requireRole } from "../middlewares/requireOrganization.js";
import { validate } from "../middlewares/validate.js";
import { requireTeam, requireTeamAccess } from "./teams.middleware.js";
import {
    createTeamSchema,
    updateTeamSchema,
    addTeamMemberSchema,
    updateTeamMemberRoleSchema,
    assignTeamPartnerSchema,
} from "./teams.validation.js";
import {
    createTeamHandler,
    getOrgTeamsHandler,
    getTeamByIdHandler,
    updateTeamHandler,
    deleteTeamHandler,
    addTeamMemberHandler,
    getTeamMembersHandler,
    updateTeamMemberRoleHandler,
    removeTeamMemberHandler,
    assignTeamPartnerHandler,
    removeTeamPartnerHandler,
    getTeamPartnersHandler,
    getTeamDealsHandler,
    getTeamObjectivesHandler,
    getTeamActivityHandler,
} from "./teams.controller.js";

const router = Router();

// All team routes require authentication
router.use(authMiddleware);

// Team CRUD
router.post(
    "/",
    requireOrganization,
    requireRole("admin"),
    validate(createTeamSchema),
    createTeamHandler
);

router.get("/", requireOrganization, requireRole("admin", "manager"), getOrgTeamsHandler);

router.get(
    "/:teamId",
    requireOrganization,
    requireTeam,
    requireRole("admin", "manager"),
    requireTeamAccess,
    getTeamByIdHandler
);

router.patch(
    "/:teamId",
    requireOrganization,
    requireTeam,
    requireRole("admin"),
    validate(updateTeamSchema),
    updateTeamHandler
);

router.delete(
    "/:teamId",
    requireOrganization,
    requireTeam,
    requireRole("admin"),
    deleteTeamHandler
);

// Team member management
router.post(
    "/:teamId/members",
    requireOrganization,
    requireTeam,
    requireRole("admin"),
    validate(addTeamMemberSchema),
    addTeamMemberHandler
);

router.get(
    "/:teamId/members",
    requireOrganization,
    requireTeam,
    requireRole("admin", "manager"),
    requireTeamAccess,
    getTeamMembersHandler
);

router.patch(
    "/:teamId/members/:userId/role",
    requireOrganization,
    requireTeam,
    requireRole("admin"),
    validate(updateTeamMemberRoleSchema),
    updateTeamMemberRoleHandler
);

router.delete(
    "/:teamId/members/:userId",
    requireOrganization,
    requireTeam,
    requireRole("admin"),
    removeTeamMemberHandler
);

// Team-related data
router.post(
    "/:teamId/partners",
    requireOrganization,
    requireTeam,
    requireRole("admin", "manager"),
    requireTeamAccess,
    validate(assignTeamPartnerSchema),
    assignTeamPartnerHandler
);

router.get(
    "/:teamId/partners",
    requireOrganization,
    requireTeam,
    requireRole("admin", "manager"),
    requireTeamAccess,
    getTeamPartnersHandler
);

router.delete(
    "/:teamId/partners/:partnerId",
    requireOrganization,
    requireTeam,
    requireRole("admin", "manager"),
    requireTeamAccess,
    removeTeamPartnerHandler
);

router.get(
    "/:teamId/deals",
    requireOrganization,
    requireTeam,
    requireRole("admin", "manager"),
    requireTeamAccess,
    getTeamDealsHandler
);

router.get(
    "/:teamId/objectives",
    requireOrganization,
    requireTeam,
    requireRole("admin", "manager"),
    requireTeamAccess,
    getTeamObjectivesHandler
);

router.get(
    "/:teamId/activity",
    requireOrganization,
    requireTeam,
    requireRole("admin", "manager"),
    requireTeamAccess,
    getTeamActivityHandler
);

export default router;
