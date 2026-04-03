import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/stores/authStore';
import {
    createDeal,
    getDealById,
    getDeals,
    updateDeal,
    type ApiDeal,
    type ApiDealStage,
    type CreateDealInput,
    type UpdateDealInput,
} from '@/services/dealsService';
import type { Deal, DealStage, PipelineSummary } from '@/types/deal';

interface DealsDashboardData {
    deals: Deal[];
    pipelineSummary: PipelineSummary;
    rawDeals: ApiDeal[];
}

const EMPTY_PIPELINE: PipelineSummary = {
    leadCount: 0,
    proposalCount: 0,
    negotiationCount: 0,
    wonCount: 0,
    lostCount: 0,
};

export function mapApiDealStageToUi(stage: ApiDealStage): DealStage {
    switch (stage) {
        case 'lead':
            return 'Lead';
        case 'proposal':
            return 'Proposal';
        case 'negotiation':
            return 'Negotiation';
        case 'won':
            return 'Won';
        case 'lost':
            return 'Lost';
        default:
            return 'Lead';
    }
}

export function mapUiDealStageToApi(stage: DealStage): ApiDealStage {
    switch (stage) {
        case 'Lead':
            return 'lead';
        case 'Proposal':
            return 'proposal';
        case 'Negotiation':
            return 'negotiation';
        case 'Won':
            return 'won';
        case 'Lost':
            return 'lost';
        default:
            return 'lead';
    }
}

function toPipelineSummary(deals: ApiDeal[]): PipelineSummary {
    return deals.reduce<PipelineSummary>((summary, current) => {
        switch (current.stage) {
            case 'lead':
                summary.leadCount += 1;
                break;
            case 'proposal':
                summary.proposalCount += 1;
                break;
            case 'negotiation':
                summary.negotiationCount += 1;
                break;
            case 'won':
                summary.wonCount += 1;
                break;
            case 'lost':
                summary.lostCount += 1;
                break;
        }

        return summary;
    }, { ...EMPTY_PIPELINE });
}

function mapDealForUi(deal: ApiDeal): Deal {
    return {
        id: deal.id,
        name: deal.title,
        partnerName: deal.partnerName ?? 'Unknown Partner',
        value: deal.value ?? 0,
        stage: mapApiDealStageToUi(deal.stage),
        assignedTeam: `${deal.assigneeCount} assignee${deal.assigneeCount === 1 ? '' : 's'}`,
        createdAt: deal.createdAt,
        lastUpdated: deal.updatedAt,
        activity: [],
        documents: [],
        messages: [],
    };
}

export function useDealsDashboard() {
    const activeOrgId = useAuthStore((state) => state.activeOrgId);

    return useQuery<DealsDashboardData>({
        queryKey: ['deals', activeOrgId],
        queryFn: async () => {
            const { deals } = await getDeals(activeOrgId!);

            return {
                rawDeals: deals,
                deals: deals.map(mapDealForUi),
                pipelineSummary: toPipelineSummary(deals),
            };
        },
        enabled: !!activeOrgId,
        staleTime: 1000 * 60,
    });
}

export function useCreateDealMutation() {
    const queryClient = useQueryClient();
    const activeOrgId = useAuthStore((state) => state.activeOrgId);

    return useMutation({
        mutationFn: (input: CreateDealInput) => createDeal(activeOrgId!, input),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['deals', activeOrgId] });
        },
    });
}

export function useUpdateDealMutation() {
    const queryClient = useQueryClient();
    const activeOrgId = useAuthStore((state) => state.activeOrgId);

    return useMutation({
        mutationFn: ({ dealId, input }: { dealId: string; input: UpdateDealInput }) =>
            updateDeal(activeOrgId!, dealId, input),
        onSuccess: (_data, variables) => {
            queryClient.invalidateQueries({ queryKey: ['deals', activeOrgId] });
            queryClient.invalidateQueries({ queryKey: ['deal', activeOrgId, variables.dealId] });
        },
    });
}

export function useDealDetails(dealId: string | undefined, enabled = true) {
    const activeOrgId = useAuthStore((state) => state.activeOrgId);

    return useQuery({
        queryKey: ['deal', activeOrgId, dealId],
        queryFn: () => getDealById(activeOrgId!, dealId!),
        enabled: !!activeOrgId && !!dealId && enabled,
        staleTime: 1000 * 30,
    });
}
