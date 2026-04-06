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
    createDealTaskSchema,
    updateDealTaskSchema,
    createDealDocumentSchema,
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
    createDealTaskHandler,
    getDealTasksHandler,
    updateDealTaskHandler,
    deleteDealTaskHandler,
    createDealDocumentHandler,
    getDealDocumentsHandler,
    deleteDealDocumentHandler,
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

router.post(
    "/:dealId/tasks",
    requireOrganization,
    requireDeal,
    requireRole("admin", "manager"),
    requireDealAccess,
    validate(createDealTaskSchema),
    createDealTaskHandler
);

router.get(
    "/:dealId/tasks",
    requireOrganization,
    requireDeal,
    requireDealAccess,
    getDealTasksHandler
);

router.patch(
    "/:dealId/tasks/:taskId",
    requireOrganization,
    requireDeal,
    requireRole("admin", "manager", "member"),
    requireDealAccess,
    validate(updateDealTaskSchema),
    updateDealTaskHandler
);

router.delete(
    "/:dealId/tasks/:taskId",
    requireOrganization,
    requireDeal,
    requireRole("admin", "manager"),
    requireDealAccess,
    deleteDealTaskHandler
);

router.post(
    "/:dealId/documents",
    requireOrganization,
    requireDeal,
    requireRole("admin", "manager", "member", "partner"),
    requireDealAccess,
    validate(createDealDocumentSchema),
    createDealDocumentHandler
);

router.get(
    "/:dealId/documents",
    requireOrganization,
    requireDeal,
    requireDealAccess,
    getDealDocumentsHandler
);

router.delete(
    "/:dealId/documents/:documentId",
    requireOrganization,
    requireDeal,
    requireRole("admin", "manager", "member", "partner"),
    requireDealAccess,
    deleteDealDocumentHandler
);

export default router;
