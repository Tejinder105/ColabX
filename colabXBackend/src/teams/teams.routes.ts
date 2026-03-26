import { Router } from "express";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import { requireOrganization, requireRole } from "../middlewares/requireOrganization.js";
import { validate } from "../middlewares/validate.js";
import { requireTeam } from "./teams.middleware.js";
import {
    createTeamSchema,
    updateTeamSchema,
    addTeamMemberSchema,
    updateTeamMemberRoleSchema,
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
    requireRole("admin", "manager"),
    validate(createTeamSchema),
    createTeamHandler
);

router.get("/", requireOrganization, getOrgTeamsHandler);

router.get("/:teamId", requireOrganization, requireTeam, getTeamByIdHandler);

router.patch(
    "/:teamId",
    requireOrganization,
    requireTeam,
    requireRole("admin", "manager"),
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
    requireRole("admin", "manager"),
    validate(addTeamMemberSchema),
    addTeamMemberHandler
);

router.get(
    "/:teamId/members",
    requireOrganization,
    requireTeam,
    getTeamMembersHandler
);

router.patch(
    "/:teamId/members/:userId/role",
    requireOrganization,
    requireTeam,
    requireRole("admin", "manager"),
    validate(updateTeamMemberRoleSchema),
    updateTeamMemberRoleHandler
);

router.delete(
    "/:teamId/members/:userId",
    requireOrganization,
    requireTeam,
    requireRole("admin", "manager"),
    removeTeamMemberHandler
);

// Team-related data (partners, deals, objectives, activity)
router.get(
    "/:teamId/partners",
    requireOrganization,
    requireTeam,
    getTeamPartnersHandler
);

router.get(
    "/:teamId/deals",
    requireOrganization,
    requireTeam,
    getTeamDealsHandler
);

router.get(
    "/:teamId/objectives",
    requireOrganization,
    requireTeam,
    getTeamObjectivesHandler
);

router.get(
    "/:teamId/activity",
    requireOrganization,
    requireTeam,
    getTeamActivityHandler
);

export default router;
