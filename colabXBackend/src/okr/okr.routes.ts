import { Router } from "express";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import { requireOrganization, requireRole } from "../middlewares/requireOrganization.js";
import { validate } from "../middlewares/validate.js";
import {
    requireObjective,
    requireKeyResult,
    requireObjectiveAccess,
    requireKeyResultAccess,
} from "./okr.middleware.js";
import { requirePartner, requirePartnerOwnerOrAdminManager } from "../partners/partners.middleware.js";
import { requireTeam, requireTeamAccess } from "../teams/teams.middleware.js";
import {
    createObjectiveSchema,
    updateObjectiveSchema,
    createKeyResultSchema,
    updateKeyResultSchema,
} from "./okr.validation.js";
import {
    createObjectiveHandler,
    getOrgObjectivesHandler,
    getObjectiveByIdHandler,
    updateObjectiveHandler,
    deleteObjectiveHandler,
    createKeyResultHandler,
    getKeyResultsHandler,
    updateKeyResultHandler,
    getPartnerScoreHandler,
    getPartnerPerformanceHandler,
    getTeamPerformanceHandler,
} from "./okr.controller.js";

const router = Router();

// All OKR routes require authentication
router.use(authMiddleware);

// ── Objectives CRUD ────────────────────────────────────────────────────────

router.post(
    "/objectives",
    requireOrganization,
    requireRole("admin", "manager"),
    validate(createObjectiveSchema),
    createObjectiveHandler
);

router.get(
    "/objectives",
    requireOrganization,
    getOrgObjectivesHandler
);

router.get(
    "/objectives/:objectiveId",
    requireOrganization,
    requireObjective,
    requireObjectiveAccess,
    getObjectiveByIdHandler
);

router.patch(
    "/objectives/:objectiveId",
    requireOrganization,
    requireObjective,
    requireRole("admin", "manager"),
    validate(updateObjectiveSchema),
    updateObjectiveHandler
);

router.delete(
    "/objectives/:objectiveId",
    requireOrganization,
    requireObjective,
    requireRole("admin", "manager"),
    deleteObjectiveHandler
);

// ── Key Results ────────────────────────────────────────────────────────────

router.post(
    "/objectives/:objectiveId/key-results",
    requireOrganization,
    requireObjective,
    requireRole("admin", "manager"),
    validate(createKeyResultSchema),
    createKeyResultHandler
);

router.get(
    "/objectives/:objectiveId/key-results",
    requireOrganization,
    requireObjective,
    requireObjectiveAccess,
    getKeyResultsHandler
);

router.patch(
    "/key-results/:keyResultId",
    requireOrganization,
    requireKeyResult,
    requireKeyResultAccess,
    validate(updateKeyResultSchema),
    updateKeyResultHandler
);

// ── Partner Score ──────────────────────────────────────────────────────────

router.get(
    "/partners/:partnerId/score",
    requireOrganization,
    requirePartner,
    requirePartnerOwnerOrAdminManager,
    getPartnerScoreHandler
);

router.get(
    "/partners/:partnerId/performance",
    requireOrganization,
    requirePartner,
    requirePartnerOwnerOrAdminManager,
    getPartnerPerformanceHandler
);

router.get(
    "/teams/:teamId/performance",
    requireOrganization,
    requireTeam,
    requireRole("admin", "manager"),
    requireTeamAccess,
    getTeamPerformanceHandler
);

export default router;
