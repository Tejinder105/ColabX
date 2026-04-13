import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { API_BASE } from "@/lib/api";
import { useAuthStore } from "@/stores/authStore";

function buildHeaders(orgId: string): HeadersInit {
    return {
        "Content-Type": "application/json",
        "x-org-id": orgId,
    };
}

async function apiGet<T>(orgId: string, path: string): Promise<T> {
    const response = await fetch(`${API_BASE}${path}`, {
        method: "GET",
        credentials: "include",
        headers: buildHeaders(orgId),
    });
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Request failed");
    }
    return response.json();
}

async function apiPost<T>(orgId: string, path: string): Promise<T> {
    const response = await fetch(`${API_BASE}${path}`, {
        method: "POST",
        credentials: "include",
        headers: buildHeaders(orgId),
    });
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Request failed");
    }
    return response.json();
}

export interface Notification {
    notificationId: string;
    organizationId: string;
    recipientUserId: string;
    partnerId?: string;
    alertType: "missed_deadline" | "low_okr" | "pending_action";
    title: string;
    message: string;
    severity: "info" | "warning" | "critical";
    relatedEntityType?: string;
    relatedEntityId?: string;
    read: boolean;
    readAt?: string;
    sentViaEmail: boolean;
    emailSentAt?: string;
    createdAt: string;
}

export interface AlertsSummary {
    total: number;
    critical: number;
    warning: number;
    byType: {
        missed_deadline: number;
        low_okr: number;
        pending_action: number;
    };
}

/**
 * Hook to fetch notifications for current user
 */
export function useNotifications(unreadOnly = false, partnerId?: string) {
    const activeOrgId = useAuthStore((state) => state.activeOrgId);

    return useQuery({
        queryKey: ["notifications", activeOrgId, { unreadOnly, partnerId }],
        queryFn: async () => {
            if (!activeOrgId) throw new Error("No active organization");
            const params = new URLSearchParams();
            if (unreadOnly) params.append("unreadOnly", "true");
            if (partnerId) params.append("partnerId", partnerId);

            const response = await apiGet<{ notifications: Notification[] }>(
                activeOrgId,
                `/notifications?${params.toString()}`
            );
            return response.notifications;
        },
        enabled: !!activeOrgId,
        refetchInterval: 60000, // Refetch every 60 seconds
    });
}

/**
 * Hook to fetch alerts summary for dashboard
 */
export function useAlertsSummary(partnerId?: string) {
    const activeOrgId = useAuthStore((state) => state.activeOrgId);

    return useQuery({
        queryKey: ["alertsSummary", activeOrgId, { partnerId }],
        queryFn: async () => {
            if (!activeOrgId) throw new Error("No active organization");
            const params = new URLSearchParams();
            if (partnerId) params.append("partnerId", partnerId);

            const response = await apiGet<{ alerts: Notification[]; summary: AlertsSummary }>(
                activeOrgId,
                `/notifications/summary?${params.toString()}`
            );
            return {
                alerts: response.alerts,
                summary: response.summary,
            };
        },
        enabled: !!activeOrgId,
        refetchInterval: 60000,
    });
}

/**
 * Hook to mark notification as read
 */
export function useMarkNotificationAsRead() {
    const queryClient = useQueryClient();
    const activeOrgId = useAuthStore((state) => state.activeOrgId);

    return useMutation({
        mutationFn: async (notificationId: string) => {
            if (!activeOrgId) throw new Error("No active organization");
            await apiPost(activeOrgId, `/notifications/${notificationId}/read`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["notifications"] });
            queryClient.invalidateQueries({ queryKey: ["alertsSummary"] });
        },
    });
}

/**
 * Hook to check/generate alerts (admin only)
 */
export function useCheckAlerts() {
    const queryClient = useQueryClient();
    const activeOrgId = useAuthStore((state) => state.activeOrgId);

    return useMutation({
        mutationFn: async () => {
            if (!activeOrgId) throw new Error("No active organization");
            return await apiPost(activeOrgId, "/notifications/check");
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["notifications"] });
            queryClient.invalidateQueries({ queryKey: ["alertsSummary"] });
        },
    });
}
