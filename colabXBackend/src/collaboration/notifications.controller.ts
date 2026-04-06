import type { Response } from "express";
import type { AuthRequest } from "../middlewares/authMiddleware.js";
import {
    getUserNotifications,
    markAsRead,
    getAlertsSummary,
    checkMissedDeadlines,
    checkLowOKRProgress,
    checkPendingActions,
} from "./notifications.service.js";

/**
 * GET /api/notifications
 * Get unread notifications for the current user in the current org
 */
export async function getNotificationsHandler(req: AuthRequest, res: Response) {
    try {
        if (!req.user || !req.org) {
            res.status(403).json({ error: "Access denied" });
            return;
        }

        const unreadOnly = req.query.unreadOnly === "true";
        const partnerId = req.query.partnerId as string | undefined;

        const notifications = await getUserNotifications(
            req.user.id,
            req.org.id,
            partnerId,
            unreadOnly
        );

        res.json({ notifications });
    } catch (error) {
        console.error("Get notifications error:", error);
        res.status(500).json({ error: "Failed to fetch notifications" });
    }
}

/**
 * POST /api/notifications/:id/read
 * Mark a notification as read
 */
export async function markNotificationAsReadHandler(req: AuthRequest, res: Response) {
    try {
        if (!req.user || !req.org) {
            res.status(403).json({ error: "Access denied" });
            return;
        }

        const notificationId = req.params.id as string;
        if (!notificationId) {
            res.status(400).json({ error: "Notification ID is required" });
            return;
        }

        await markAsRead(notificationId);

        res.json({ success: true });
    } catch (error) {
        console.error("Mark as read error:", error);
        res.status(500).json({ error: "Failed to update notification" });
    }
}

/**
 * GET /api/notifications/summary
 * Get alerts summary for dashboard
 */
export async function getAlertsSummaryHandler(req: AuthRequest, res: Response) {
    try {
        if (!req.user || !req.org) {
            res.status(403).json({ error: "Access denied" });
            return;
        }

        const partnerId = req.query.partnerId as string | undefined;

        const { alerts, summary } = await getAlertsSummary(
            req.user.id,
            req.org.id,
            partnerId
        );

        res.json({ alerts, summary });
    } catch (error) {
        console.error("Get alerts summary error:", error);
        res.status(500).json({ error: "Failed to fetch alerts summary" });
    }
}

/**
 * POST /api/notifications/check
 * Manually trigger alert checking (admin only)
 * In production, this would be run by a scheduled job
 */
export async function checkAlertsHandler(req: AuthRequest, res: Response) {
    try {
        if (!req.user || !req.org || !req.membership || req.membership.role !== "admin") {
            res.status(403).json({ error: "Admin access required" });
            return;
        }

        await checkMissedDeadlines(req.org.id);
        await checkLowOKRProgress(req.org.id);
        await checkPendingActions(req.org.id);

        res.json({ success: true, message: "Alerts checked and created" });
    } catch (error) {
        console.error("Check alerts error:", error);
        res.status(500).json({ error: "Failed to check alerts" });
    }
}
