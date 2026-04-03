import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '@/stores/authStore';
import { getReportsDashboard } from '@/services/reportsService';
import type { DashboardAnalytics } from '@/types/report';

export function useReportsDashboard() {
    const activeOrgId = useAuthStore((state) => state.activeOrgId);

    return useQuery<DashboardAnalytics>({
        queryKey: ['reports-dashboard', activeOrgId],
        queryFn: async () => {
            const response = await getReportsDashboard(activeOrgId!);
            return response.analytics;
        },
        enabled: !!activeOrgId,
        staleTime: 1000 * 60,
    });
}