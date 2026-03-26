import { API_BASE } from '@/lib/api';
import type { DashboardAnalytics } from '@/types/report';

function buildHeaders(orgId: string): HeadersInit {
    return {
        'Content-Type': 'application/json',
        'x-org-id': orgId,
    };
}

export async function getReportsDashboard(orgId: string): Promise<{ analytics: DashboardAnalytics }> {
    const response = await fetch(`${API_BASE}/reports/dashboard`, {
        method: 'GET',
        credentials: 'include',
        headers: buildHeaders(orgId),
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to fetch reports dashboard');
    }

    return response.json();
}