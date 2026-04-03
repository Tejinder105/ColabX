import { Router } from "express";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import { requireOrganization, requireRole } from "../middlewares/requireOrganization.js";
import { validate } from "../middlewares/validate.js";
import { requireObjective, requireKeyResult } from "./okr.middleware.js";
import { requirePartner } from "../partners/partners.middleware.js";
import {
    createObjectiveSchema,
    updateObjectiveSchema,
    createKeyResultSchema,
    updateKeyResultSchema,
    recordMetricSchema,
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
    recordMetricHandler,
    getPartnerMetricsHandler,
    getPartnerScoreHandler,
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
    getKeyResultsHandler
);

router.patch(
    "/key-results/:keyResultId",
    requireOrganization,
    requireKeyResult,
    requireRole("admin", "manager"),
    validate(updateKeyResultSchema),
    updateKeyResultHandler
);

// ── Partner Performance Metrics ────────────────────────────────────────────

router.post(
    "/partners/:partnerId/metrics",
    requireOrganization,
    requirePartner,
    requireRole("admin", "manager"),
    validate(recordMetricSchema),
    recordMetricHandler
);

router.get(
    "/partners/:partnerId/metrics",
    requireOrganization,
    requirePartner,
    getPartnerMetricsHandler
);

// ── Partner Score ──────────────────────────────────────────────────────────

router.get(
    "/partners/:partnerId/score",
    requireOrganization,
    requirePartner,
    getPartnerScoreHandler
);

export default router;
