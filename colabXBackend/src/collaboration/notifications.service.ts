import { eq, and, desc } from "drizzle-orm";
import db from "../db/index.js";
import { notification } from "../schemas/collaborationSchema.js";
import { objective, keyResult } from "../okr/okr.schema.js";
import { deal, dealTask } from "../deals/deals.schema.js";
import { partner } from "../partners/partners.schema.js";

export type AlertType = "missed_deadline" | "low_okr" | "pending_action";
export type Severity = "info" | "warning" | "critical";

export interface CreateAlertInput {
    orgId: string;
    recipientId: string;
    partnerId?: string;
    alertType: AlertType;
    title: string;
    message: string;
    severity?: Severity;
    relatedEntityType?: string;
    relatedEntityId?: string;
}

/**
 * Create and store an alert notification
 */
export async function createAlert(input: CreateAlertInput) {
    const notificationId = crypto.randomUUID();
    
    await db.insert(notification).values({
        id: notificationId,
        orgId: input.orgId,
        recipientId: input.recipientId,
        partnerId: input.partnerId,
        alertType: input.alertType,
        title: input.title,
        message: input.message,
        severity: input.severity || "info",
        relatedEntityType: input.relatedEntityType,
        relatedEntityId: input.relatedEntityId,
    });

    return notificationId;
}

/**
 * Get unread notifications for a user/partner
 */
export async function getUserNotifications(
    userId: string,
    orgId: string,
    partnerId?: string,
    unreadOnly = false
) {
    let query = db
        .select()
        .from(notification)
        .where(and(
            eq(notification.recipientId, userId),
            eq(notification.orgId, orgId),
            unreadOnly ? eq(notification.read, false) : undefined,
            partnerId ? eq(notification.partnerId, partnerId) : undefined
        ))
        .orderBy(desc(notification.createdAt));

    const results = await query;
    return results;
}

/**
 * Mark notification as read
 */
export async function markAsRead(notificationId: string) {
    await db
        .update(notification)
        .set({ read: true, readAt: new Date() })
        .where(eq(notification.id, notificationId));
}

/**
 * Check for missed objective deadlines
 */
export async function checkMissedDeadlines(orgId: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Find overdue objectives
    const overdueObjectives = await db
        .select()
        .from(objective)
        .where(and(
            eq(objective.orgId, orgId),
            // endDate < today (in past)
        ));

    for (const obj of overdueObjectives) {
        const endDate = new Date(obj.endDate);
        endDate.setHours(0, 0, 0, 0);
        
        if (endDate < today) {
            // Find partners or teams managing this objective
            if (obj.partnerId) {
                const partnerRecord = await db
                    .select()
                    .from(partner)
                    .where(eq(partner.id, obj.partnerId))
                    .limit(1);

                if (partnerRecord.length > 0 && partnerRecord[0].userId) {
                    await createAlert({
                        orgId,
                        recipientId: partnerRecord[0].userId,
                        partnerId: obj.partnerId,
                        alertType: "missed_deadline",
                        title: "Objective Past Due",
                        message: `Your objective "${obj.title}" was due on ${obj.endDate} and is now overdue.`,
                        severity: "warning",
                        relatedEntityType: "objective",
                        relatedEntityId: obj.id,
                    });
                }
            }
        }
    }
}

/**
 * Check for low OKR progress (off-track key results)
 */
export async function checkLowOKRProgress(orgId: string) {
    // Find all off-track key results
    const offTrackKRs = await db
        .select({ kr: keyResult, obj: objective })
        .from(keyResult)
        .innerJoin(objective, eq(keyResult.objectiveId, objective.id))
        .where(and(
            eq(objective.orgId, orgId),
            eq(keyResult.status, "off_track")
        ));

    for (const { kr, obj } of offTrackKRs) {
        if (obj.partnerId) {
            const partnerRecord = await db
                .select()
                .from(partner)
                .where(eq(partner.id, obj.partnerId))
                .limit(1);

            if (partnerRecord.length > 0 && partnerRecord[0].userId) {
                await createAlert({
                    orgId,
                    recipientId: partnerRecord[0].userId,
                    partnerId: obj.partnerId,
                    alertType: "low_okr",
                    title: "Key Result Off Track",
                    message: `Key Result "${kr.title}" in objective "${obj.title}" is off track. Current: ${kr.currentValue}/${kr.targetValue}`,
                    severity: "warning",
                    relatedEntityType: "keyResult",
                    relatedEntityId: kr.id,
                });
            }
        }
    }
}

/**
 * Check for pending/overdue deal tasks
 */
export async function checkPendingActions(orgId: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Find overdue tasks that aren't done by joining with deal to get orgId
    const overdueTasks = await db
        .select({ task: dealTask, dealOrgId: deal.orgId })
        .from(dealTask)
        .innerJoin(deal, eq(dealTask.dealId, deal.id))
        .where(eq(deal.orgId, orgId));

    for (const { task } of overdueTasks) {
        if (task.status !== "done" && task.dueDate) {
            const dueDate = new Date(task.dueDate);
            dueDate.setHours(0, 0, 0, 0);
            
            if (dueDate < today && task.assigneeUserId) {
                await createAlert({
                    orgId,
                    recipientId: task.assigneeUserId,
                    alertType: "pending_action",
                    title: "Task Overdue",
                    message: `Task "${task.title}" was due on ${task.dueDate} and is now overdue.`,
                    severity: "critical",
                    relatedEntityType: "dealTask",
                    relatedEntityId: task.id,
                });
            }
        }
    }
}

/**
 * Get alerts summary for partner dashboard
 */
export async function getAlertsSummary(
    userId: string,
    orgId: string,
    partnerId?: string
) {
    const alerts = await getUserNotifications(userId, orgId, partnerId, true);
    
    const summary = {
        total: alerts.length,
        critical: alerts.filter((a: typeof alerts[number]) => a.severity === "critical").length,
        warning: alerts.filter((a: typeof alerts[number]) => a.severity === "warning").length,
        byType: {
            missed_deadline: alerts.filter((a: typeof alerts[number]) => a.alertType === "missed_deadline").length,
            low_okr: alerts.filter((a: typeof alerts[number]) => a.alertType === "low_okr").length,
            pending_action: alerts.filter((a: typeof alerts[number]) => a.alertType === "pending_action").length,
        },
    };

    return { alerts, summary };
}
