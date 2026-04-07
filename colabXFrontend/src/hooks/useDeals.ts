import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/stores/authStore';
import {
    createDeal,
    getDealById,
    getDeals,
    updateDeal,
    deleteDeal,
    assignUserToDeal,
    removeUserFromDeal,
    getDealMessages,
    createDealMessage,
    deleteDealMessage,
    getDealTasks,
    createDealTask,
    updateDealTask,
    deleteDealTask,
    getDealDocuments,
    createDealDocument,
    deleteDealDocument,
    type ApiDeal,
    type ApiDealStage,
    type CreateDealDocumentInput,
    type CreateDealInput,
    type CreateDealTaskInput,
    type UpdateDealInput,
    type UpdateDealTaskInput,
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

export function useDeleteDealMutation() {
    const queryClient = useQueryClient();
    const activeOrgId = useAuthStore((state) => state.activeOrgId);

    return useMutation({
        mutationFn: (dealId: string) => deleteDeal(activeOrgId!, dealId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['deals', activeOrgId] });
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

export function useAssignUserToDealMutation() {
    const queryClient = useQueryClient();
    const activeOrgId = useAuthStore((state) => state.activeOrgId);

    return useMutation({
        mutationFn: ({ dealId, userId }: { dealId: string; userId: string }) =>
            assignUserToDeal(activeOrgId!, dealId, userId),
        onSuccess: (_data, variables) => {
            queryClient.invalidateQueries({ queryKey: ['deals', activeOrgId] });
            queryClient.invalidateQueries({ queryKey: ['deal', activeOrgId, variables.dealId] });
        },
    });
}

export function useRemoveUserFromDealMutation() {
    const queryClient = useQueryClient();
    const activeOrgId = useAuthStore((state) => state.activeOrgId);

    return useMutation({
        mutationFn: ({ dealId, userId }: { dealId: string; userId: string }) =>
            removeUserFromDeal(activeOrgId!, dealId, userId),
        onSuccess: (_data, variables) => {
            queryClient.invalidateQueries({ queryKey: ['deals', activeOrgId] });
            queryClient.invalidateQueries({ queryKey: ['deal', activeOrgId, variables.dealId] });
        },
    });
}

// ── Deal Messages ───────────────────────────────────────────────────────────────

export function useDealMessages(dealId: string | undefined, enabled = true) {
    const activeOrgId = useAuthStore((state) => state.activeOrgId);

    return useQuery({
        queryKey: ['deal-messages', activeOrgId, dealId],
        queryFn: () => getDealMessages(activeOrgId!, dealId!),
        enabled: !!activeOrgId && !!dealId && enabled,
        staleTime: 1000 * 10, // 10 seconds - messages should be fresh
        refetchInterval: 1000 * 30, // Poll every 30 seconds for new messages
    });
}

export function useSendDealMessageMutation() {
    const queryClient = useQueryClient();
    const activeOrgId = useAuthStore((state) => state.activeOrgId);

    return useMutation({
        mutationFn: ({ dealId, content }: { dealId: string; content: string }) =>
            createDealMessage(activeOrgId!, dealId, content),
        onSuccess: (_data, variables) => {
            queryClient.invalidateQueries({ queryKey: ['deal-messages', activeOrgId, variables.dealId] });
        },
    });
}

export function useDeleteDealMessageMutation() {
    const queryClient = useQueryClient();
    const activeOrgId = useAuthStore((state) => state.activeOrgId);

    return useMutation({
        mutationFn: ({ dealId, messageId }: { dealId: string; messageId: string }) =>
            deleteDealMessage(activeOrgId!, dealId, messageId),
        onSuccess: (_data, variables) => {
            queryClient.invalidateQueries({ queryKey: ['deal-messages', activeOrgId, variables.dealId] });
        },
    });
}

export function useDealTasks(dealId: string | undefined, enabled = true) {
    const activeOrgId = useAuthStore((state) => state.activeOrgId);

    return useQuery({
        queryKey: ['deal-tasks', activeOrgId, dealId],
        queryFn: () => getDealTasks(activeOrgId!, dealId!),
        enabled: !!activeOrgId && !!dealId && enabled,
        staleTime: 1000 * 30,
    });
}

export function useCreateDealTaskMutation() {
    const queryClient = useQueryClient();
    const activeOrgId = useAuthStore((state) => state.activeOrgId);

    return useMutation({
        mutationFn: ({ dealId, input }: { dealId: string; input: CreateDealTaskInput }) =>
            createDealTask(activeOrgId!, dealId, input),
        onSuccess: (_data, variables) => {
            queryClient.invalidateQueries({ queryKey: ['deal-tasks', activeOrgId, variables.dealId] });
            queryClient.invalidateQueries({ queryKey: ['deal', activeOrgId, variables.dealId] });
        },
    });
}

export function useUpdateDealTaskMutation() {
    const queryClient = useQueryClient();
    const activeOrgId = useAuthStore((state) => state.activeOrgId);

    return useMutation({
        mutationFn: ({ dealId, taskId, input }: { dealId: string; taskId: string; input: UpdateDealTaskInput }) =>
            updateDealTask(activeOrgId!, dealId, taskId, input),
        onSuccess: (_data, variables) => {
            queryClient.invalidateQueries({ queryKey: ['deal-tasks', activeOrgId, variables.dealId] });
            queryClient.invalidateQueries({ queryKey: ['deal', activeOrgId, variables.dealId] });
        },
    });
}

export function useDeleteDealTaskMutation() {
    const queryClient = useQueryClient();
    const activeOrgId = useAuthStore((state) => state.activeOrgId);

    return useMutation({
        mutationFn: ({ dealId, taskId }: { dealId: string; taskId: string }) =>
            deleteDealTask(activeOrgId!, dealId, taskId),
        onSuccess: (_data, variables) => {
            queryClient.invalidateQueries({ queryKey: ['deal-tasks', activeOrgId, variables.dealId] });
            queryClient.invalidateQueries({ queryKey: ['deal', activeOrgId, variables.dealId] });
        },
    });
}

export function useDealDocuments(dealId: string | undefined, enabled = true) {
    const activeOrgId = useAuthStore((state) => state.activeOrgId);

    return useQuery({
        queryKey: ['deal-documents', activeOrgId, dealId],
        queryFn: () => getDealDocuments(activeOrgId!, dealId!),
        enabled: !!activeOrgId && !!dealId && enabled,
        staleTime: 1000 * 30,
    });
}

export function useCreateDealDocumentMutation() {
    const queryClient = useQueryClient();
    const activeOrgId = useAuthStore((state) => state.activeOrgId);

    return useMutation({
        mutationFn: ({ dealId, input }: { dealId: string; input: CreateDealDocumentInput }) =>
            createDealDocument(activeOrgId!, dealId, input),
        onSuccess: (_data, variables) => {
            queryClient.invalidateQueries({ queryKey: ['deal-documents', activeOrgId, variables.dealId] });
            queryClient.invalidateQueries({ queryKey: ['deal', activeOrgId, variables.dealId] });
        },
    });
}

export function useDeleteDealDocumentMutation() {
    const queryClient = useQueryClient();
    const activeOrgId = useAuthStore((state) => state.activeOrgId);

    return useMutation({
        mutationFn: ({ dealId, documentId }: { dealId: string; documentId: string }) =>
            deleteDealDocument(activeOrgId!, dealId, documentId),
        onSuccess: (_data, variables) => {
            queryClient.invalidateQueries({ queryKey: ['deal-documents', activeOrgId, variables.dealId] });
            queryClient.invalidateQueries({ queryKey: ['deal', activeOrgId, variables.dealId] });
        },
    });
}
