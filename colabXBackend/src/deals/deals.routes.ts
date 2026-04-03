import { Router } from "express";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import { requireOrganization, requireRole } from "../middlewares/requireOrganization.js";
import { validate } from "../middlewares/validate.js";
import { requireDeal, requireDealAccess } from "./deals.middleware.js";
import {
    createDealSchema,
    updateDealSchema,
    assignUserSchema,
    createMessageSchema,
} from "./deals.validation.js";
import {
    createDealHandler,
    getOrgDealsHandler,
    getDealByIdHandler,
    updateDealHandler,
    deleteDealHandler,
    assignUserHandler,
    getDealAssignmentsHandler,
    removeAssignmentHandler,
    createMessageHandler,
    getDealMessagesHandler,
    deleteMessageHandler,
} from "./deals.controller.js";

const router = Router();

// All deal routes require authentication
router.use(authMiddleware);

// ── Deal CRUD ───────────────────────────────────────────────────────────────

router.post(
    "/",
    requireOrganization,
    requireRole("admin", "manager"),
    validate(createDealSchema),
    createDealHandler
);

router.get("/", requireOrganization, getOrgDealsHandler);

router.get("/:dealId", requireOrganization, requireDeal, requireDealAccess, getDealByIdHandler);

router.patch(
    "/:dealId",
    requireOrganization,
    requireDeal,
    requireRole("admin", "manager"),
    validate(updateDealSchema),
    updateDealHandler
);

router.delete(
    "/:dealId",
    requireOrganization,
    requireDeal,
    requireRole("admin", "manager"),
    deleteDealHandler
);

// ── Deal Assignments ────────────────────────────────────────────────────────

router.post(
    "/:dealId/assign",
    requireOrganization,
    requireDeal,
    requireRole("admin", "manager"),
    validate(assignUserSchema),
    assignUserHandler
);

router.get(
    "/:dealId/assign",
    requireOrganization,
    requireDeal,
    requireDealAccess,
    getDealAssignmentsHandler
);

router.delete(
    "/:dealId/assign/:userId",
    requireOrganization,
    requireDeal,
    requireRole("admin", "manager"),
    removeAssignmentHandler
);

// ── Deal Messages ───────────────────────────────────────────────────────────

router.post(
    "/:dealId/messages",
    requireOrganization,
    requireDeal,
    requireDealAccess,
    validate(createMessageSchema),
    createMessageHandler
);

router.get(
    "/:dealId/messages",
    requireOrganization,
    requireDeal,
    requireDealAccess,
    getDealMessagesHandler
);

router.delete(
    "/:dealId/messages/:messageId",
    requireOrganization,
    requireDeal,
    requireDealAccess,
    deleteMessageHandler
);

export default router;
