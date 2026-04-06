import { Router } from "express";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import { requireOrganization, requireRole } from "../middlewares/requireOrganization.js";
import { validate } from "../middlewares/validate.js";
import { requirePartner, requirePartnerOwnerOrAdminManager } from "../partners/partners.middleware.js";
import {
    createCommunicationSchema,
    createDocumentSchema,
    updateDocumentVisibilitySchema,
} from "./collaboration.validation.js";
import {
    createCommunicationHandler,
    getPartnerCommunicationsHandler,
    createDocumentHandler,
    getPartnerDocumentsHandler,
    getOrgDocumentsHandler,
    updateDocumentVisibilityHandler,
    deleteDocumentHandler,
    getPartnerActivitiesHandler,
} from "./collaboration.controller.js";
import {
    getNotificationsHandler,
    markNotificationAsReadHandler,
    getAlertsSummaryHandler,
    checkAlertsHandler,
} from "./notifications.controller.js";

const router = Router();

// All collaboration routes require authentication
router.use(authMiddleware);

// Communications ─>

// GET /api/partners/:partnerId/communications
router.get(
    "/partners/:partnerId/communications",
    requireOrganization,
    requirePartner,
    requirePartnerOwnerOrAdminManager,
    getPartnerCommunicationsHandler
);

// POST /api/partners/:partnerId/communications
router.post(
    "/partners/:partnerId/communications",
    requireOrganization,
    requirePartner,
    requirePartnerOwnerOrAdminManager,
    validate(createCommunicationSchema),
    createCommunicationHandler
);

// Documents ->

// GET /api/partners/:partnerId/documents
router.get(
    "/partners/:partnerId/documents",
    requireOrganization,
    requirePartner,
    requirePartnerOwnerOrAdminManager,
    getPartnerDocumentsHandler
);

// GET /api/documents
router.get(
    "/documents",
    requireOrganization,
    getOrgDocumentsHandler
);

// POST /api/partners/:partnerId/documents
router.post(
    "/partners/:partnerId/documents",
    requireOrganization,
    requirePartner,
    requireRole("admin", "manager"),
    validate(createDocumentSchema),
    createDocumentHandler
);

// DELETE /api/documents/:documentId
router.delete(
    "/documents/:documentId",
    requireOrganization,
    requireRole("admin", "manager"),
    deleteDocumentHandler
);

// PATCH /api/documents/:documentId/visibility
router.patch(
    "/documents/:documentId/visibility",
    requireOrganization,
    requireRole("admin", "manager"),
    validate(updateDocumentVisibilitySchema),
    updateDocumentVisibilityHandler
);

// Activities ─> 

// GET /api/partners/:partnerId/activities
router.get(
    "/partners/:partnerId/activities",
    requireOrganization,
    requirePartner,
    requirePartnerOwnerOrAdminManager,
    getPartnerActivitiesHandler
);

// Notifications ─>

// GET /api/notifications
router.get(
    "/notifications",
    requireOrganization,
    getNotificationsHandler
);

// POST /api/notifications/:id/read
router.post(
    "/notifications/:id/read",
    requireOrganization,
    markNotificationAsReadHandler
);

// GET /api/notifications/summary
router.get(
    "/notifications/summary",
    requireOrganization,
    getAlertsSummaryHandler
);

// POST /api/notifications/check (admin only)
router.post(
    "/notifications/check",
    requireOrganization,
    requireRole("admin"),
    checkAlertsHandler
);

export default router;
