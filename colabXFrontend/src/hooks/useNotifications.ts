import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/services/apiClient";

export interface Notification {
    id: string;
    orgId: string;
    recipientId: string;
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
    return useQuery({
        queryKey: ["notifications", { unreadOnly, partnerId }],
        queryFn: async () => {
            const params = new URLSearchParams();
            if (unreadOnly) params.append("unreadOnly", "true");
            if (partnerId) params.append("partnerId", partnerId);

            const response = await api.get(`/notifications?${params.toString()}`);
            return response.data.notifications as Notification[];
        },
        refetchInterval: 60000, // Refetch every 60 seconds
    });
}

/**
 * Hook to fetch alerts summary for dashboard
 */
export function useAlertsSummary(partnerId?: string) {
    return useQuery({
        queryKey: ["alertsSummary", { partnerId }],
        queryFn: async () => {
            const params = new URLSearchParams();
            if (partnerId) params.append("partnerId", partnerId);

            const response = await api.get(`/notifications/summary?${params.toString()}`);
            return {
                alerts: response.data.alerts as Notification[],
                summary: response.data.summary as AlertsSummary,
            };
        },
        refetchInterval: 60000,
    });
}

/**
 * Hook to mark notification as read
 */
export function useMarkNotificationAsRead() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (notificationId: string) => {
            await api.post(`/notifications/${notificationId}/read`);
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

    return useMutation({
        mutationFn: async () => {
            const response = await api.post("/notifications/check");
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["notifications"] });
            queryClient.invalidateQueries({ queryKey: ["alertsSummary"] });
        },
    });
}
