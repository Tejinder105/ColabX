import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/stores/authStore';
import { getPartners } from '@/services/partnersService';
import { getDeals } from '@/services/dealsService';
import {
    createObjective,
    createKeyResult,
    deleteObjective,
    getObjectives,
    getObjectiveById,
    getPartnerPerformance,
    getPartnerScore,
    getTeamPerformance,
    updateKeyResult,
    updateObjective,
    type CreateKeyResultInput,
    type CreateObjectiveInput,
    type ApiKeyResultStatus,
    type ApiObjectiveDetails,
    type UpdateKeyResultInput,
    type UpdateObjectiveInput,
} from '@/services/okrService';
import type {
    Objective,
    OKRKpiMetrics,
    PartnerPerformanceRecord,
    PerformanceChartData,
    KeyResult,
} from '@/types/okr';

interface OkrsDashboardData {
    kpis: OKRKpiMetrics;
    objectives: Objective[];
    partnerPerformance: PartnerPerformanceRecord[];
    performanceChartData: PerformanceChartData[];
}

type UiObjectiveStatus = Objective['status'];

function scoreFromKeyResults(keyResults: KeyResult[]): number {
    if (keyResults.length === 0) {
        return 0;
    }

    const total = keyResults.reduce((sum, item) => sum + item.progress, 0);
    return Math.min(100, Math.round(total / keyResults.length));
}

function mapStatus(progress: number, statuses: ApiKeyResultStatus[]): UiObjectiveStatus {
    if (progress >= 100) {
        return 'Completed';
    }

    if (statuses.includes('off_track')) {
        return 'Behind';
    }

    if (statuses.includes('at_risk')) {
        return 'At Risk';
    }

    return 'On Track';
}

function mapObjective(details: ApiObjectiveDetails): Objective {
    const keyResults: KeyResult[] = details.keyResults.map((item, index) => {
        const progress = item.targetValue > 0
            ? Math.min(100, Math.round((item.currentValue / item.targetValue) * 100))
            : 0;

        return {
            id: item.keyResultId,
            title: item.title || `Key Result ${index + 1}`,
            targetValue: item.targetValue,
            currentValue: item.currentValue,
            progress,
        };
    });

    const progress = details.progressPercent
        ? Math.min(100, Math.round(details.progressPercent))
        : scoreFromKeyResults(keyResults);

    const status = mapStatus(
        progress,
        details.keyResults.map((item) => item.status)
    );

    return {
        id: details.objective.objectiveId,
        title: details.objective.title,
        owner: details.objective.partnerName ?? details.objective.teamName ?? 'Unassigned',
        progress,
        deadline: details.objective.endDate,
        status,
        keyResults,
    };
}

function getLastSixMonths(): string[] {
    const months: string[] = [];
    const now = new Date();

    for (let i = 5; i >= 0; i -= 1) {
        const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
        months.push(date.toLocaleString('en-US', { month: 'short' }));
    }

    return months;
}

export function useOkrsDashboard() {
    const activeOrgId = useAuthStore((state) => state.activeOrgId);
    const activeRole = useAuthStore((state) => state.activeOrg?.role);
    const canViewAllPartners = activeRole === 'admin' || activeRole === 'manager';

    return useQuery<OkrsDashboardData>({
        queryKey: ['okrs-dashboard', activeOrgId, activeRole],
        queryFn: async () => {
            const [{ objectives }, dealsResponse, partnersResponse] = await Promise.all([
                getObjectives(activeOrgId!),
                getDeals(activeOrgId!),
                canViewAllPartners ? getPartners(activeOrgId!) : Promise.resolve({ partners: [] }),
            ]);
            const { deals } = dealsResponse;
            const { partners } = partnersResponse;

            const objectiveDetails = await Promise.all(
                objectives.map((objective) => getObjectiveById(activeOrgId!, objective.objectiveId))
            );
            const mappedObjectives = objectiveDetails.map(mapObjective);

            const partnerScores = await Promise.all(
                partners.map(async (partner) => {
                    const scoreResponse = await getPartnerScore(activeOrgId!, partner.partnerId);
                    return {
                        partnerId: partner.partnerId,
                        score: scoreResponse.score?.score ?? 0,
                    };
                })
            );
            const scoreMap = new Map(partnerScores.map((item) => [item.partnerId, item.score]));

            const partnerPerformance: PartnerPerformanceRecord[] = partners.map((partner) => {
                const partnerDeals = deals.filter((deal) => deal.partnerId === partner.partnerId);
                const wonDeals = partnerDeals.filter((deal) => deal.stage === 'won');

                const revenue = wonDeals.reduce((sum, item) => sum + (item.value ?? 0), 0);
                const dealsClosed = wonDeals.length;

                return {
                    id: partner.partnerId,
                    partnerName: partner.name,
                    score: Math.round(scoreMap.get(partner.partnerId) ?? 0),
                    revenue,
                    dealsClosed,
                };
            });

            const averagePartnerScore = partnerPerformance.length > 0
                ? Math.round(
                    partnerPerformance.reduce((sum, item) => sum + item.score, 0) /
                    partnerPerformance.length
                )
                : 0;

            const months = getLastSixMonths();
            const chartBuckets = new Map<string, { revenue: number; total: number; won: number }>();
            months.forEach((month) => {
                chartBuckets.set(month, { revenue: 0, total: 0, won: 0 });
            });

            for (const deal of deals) {
                const month = new Date(deal.createdAt).toLocaleString('en-US', { month: 'short' });
                const bucket = chartBuckets.get(month);
                if (!bucket) {
                    continue;
                }

                bucket.total += 1;
                if (deal.stage === 'won') {
                    bucket.won += 1;
                    bucket.revenue += deal.value ?? 0;
                }
            }

            const performanceChartData: PerformanceChartData[] = months.map((month) => {
                const bucket = chartBuckets.get(month)!;
                const score = bucket.total > 0
                    ? Math.round((bucket.won / bucket.total) * 100)
                    : 0;

                return {
                    month,
                    score,
                    revenue: bucket.revenue,
                };
            });

            const completedObjectives = mappedObjectives.filter((objective) => objective.status === 'Completed').length;
            const activeObjectives = mappedObjectives.length - completedObjectives;
            const atRiskObjectives = mappedObjectives.filter(
                (objective) => objective.status === 'At Risk' || objective.status === 'Behind'
            ).length;

            return {
                kpis: {
                    activeObjectives,
                    completedObjectives,
                    atRiskObjectives,
                    averagePartnerScore,
                },
                objectives: mappedObjectives,
                partnerPerformance,
                performanceChartData,
            };
        },
        enabled: !!activeOrgId,
        staleTime: 1000 * 60,
    });
}

export function useCreateObjectiveMutation() {
    const queryClient = useQueryClient();
    const activeOrgId = useAuthStore((state) => state.activeOrgId);

    return useMutation({
        mutationFn: (input: CreateObjectiveInput) => createObjective(activeOrgId!, input),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['okrs-dashboard', activeOrgId] });
        },
    });
}

export function useUpdateObjectiveMutation() {
    const queryClient = useQueryClient();
    const activeOrgId = useAuthStore((state) => state.activeOrgId);

    return useMutation({
        mutationFn: ({ objectiveId, input }: { objectiveId: string; input: UpdateObjectiveInput }) =>
            updateObjective(activeOrgId!, objectiveId, input),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['okrs-dashboard', activeOrgId] });
        },
    });
}

export function useDeleteObjectiveMutation() {
    const queryClient = useQueryClient();
    const activeOrgId = useAuthStore((state) => state.activeOrgId);

    return useMutation({
        mutationFn: (objectiveId: string) => deleteObjective(activeOrgId!, objectiveId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['okrs-dashboard', activeOrgId] });
        },
    });
}

export function useCreateKeyResultMutation() {
    const queryClient = useQueryClient();
    const activeOrgId = useAuthStore((state) => state.activeOrgId);

    return useMutation({
        mutationFn: ({ objectiveId, input }: { objectiveId: string; input: CreateKeyResultInput }) =>
            createKeyResult(activeOrgId!, objectiveId, input),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['okrs-dashboard', activeOrgId] });
        },
    });
}

export function useUpdateKeyResultMutation() {
    const queryClient = useQueryClient();
    const activeOrgId = useAuthStore((state) => state.activeOrgId);

    return useMutation({
        mutationFn: ({ keyResultId, input }: { keyResultId: string; input: UpdateKeyResultInput }) =>
            updateKeyResult(activeOrgId!, keyResultId, input),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['okrs-dashboard', activeOrgId] });
        },
    });
}

export function usePartnerScore(partnerId: string | null | undefined) {
    const activeOrgId = useAuthStore((state) => state.activeOrgId);

    return useQuery({
        queryKey: ['partner-score', activeOrgId, partnerId],
        queryFn: () => getPartnerScore(activeOrgId!, partnerId!),
        enabled: !!partnerId && !!activeOrgId,
        staleTime: 1000 * 60 * 5, // 5 minutes
    });
}

export function usePartnerPerformance(partnerId: string | null | undefined) {
    const activeOrgId = useAuthStore((state) => state.activeOrgId);

    return useQuery({
        queryKey: ['partner-performance', activeOrgId, partnerId],
        queryFn: () => getPartnerPerformance(activeOrgId!, partnerId!),
        enabled: !!partnerId && !!activeOrgId,
        staleTime: 1000 * 60 * 5,
    });
}

export function useTeamPerformance(teamId: string | null | undefined) {
    const activeOrgId = useAuthStore((state) => state.activeOrgId);

    return useQuery({
        queryKey: ['team-performance', activeOrgId, teamId],
        queryFn: () => getTeamPerformance(activeOrgId!, teamId!),
        enabled: !!teamId && !!activeOrgId,
        staleTime: 1000 * 60 * 5,
    });
}
