import { Router } from "express";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import { requireOrganization, requireRole } from "../middlewares/requireOrganization.js";
import {
    getNotificationsHandler,
    markNotificationAsReadHandler,
    getAlertsSummaryHandler,
    checkAlertsHandler,
} from "./notifications.controller.js";

const router = Router();

/**
 * GET /api/notifications
 * Get notifications for current user
 */
router.get("/", authMiddleware, requireOrganization, getNotificationsHandler);

/**
 * POST /api/notifications/:id/read
 * Mark notification as read
 */
router.post("/:id/read", authMiddleware, requireOrganization, markNotificationAsReadHandler);

/**
 * GET /api/notifications/summary
 * Get alerts summary
 */
router.get("/summary", authMiddleware, requireOrganization, getAlertsSummaryHandler);

/**
 * POST /api/notifications/check
 * Trigger alert checking (admin only)
 */
router.post("/check", authMiddleware, requireOrganization, checkAlertsHandler);

export default router;
