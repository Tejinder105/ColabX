import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
    getPartnerCommunications,
    createCommunication,
    getOrgDocuments,
    getPartnerDocuments,
    createDocument,
    deleteDocument,
    updateDocumentVisibility,
    getPartnerActivities,
    type CreateCommunicationInput,
    type CreateDocumentInput,
} from '@/services/collaborationService';
import { useAuthStore } from '@/stores/authStore';

// Communications Hooks - > 

export function usePartnerCommunications(partnerId: string | undefined) {
    const activeOrgId = useAuthStore((state) => state.activeOrgId);
    return useQuery({
        queryKey: ['partnerCommunications', activeOrgId, partnerId],
        queryFn: () => getPartnerCommunications(activeOrgId!, partnerId!),
        enabled: !!activeOrgId && !!partnerId,
        staleTime: 1000 * 60 * 2,
    });
}

export function useCreateCommunicationMutation(partnerId: string) {
    const queryClient = useQueryClient();
    const activeOrgId = useAuthStore((state) => state.activeOrgId);

    return useMutation({
        mutationFn: (input: CreateCommunicationInput) =>
            createCommunication(activeOrgId!, partnerId, input),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ['partnerCommunications', activeOrgId, partnerId],
            });
        },
    });
}

//  Documents Hooks ─────────────────────────────────────────────────────────

export function usePartnerDocuments(partnerId: string | undefined) {
    const activeOrgId = useAuthStore((state) => state.activeOrgId);
    return useQuery({
        queryKey: ['partnerDocuments', activeOrgId, partnerId],
        queryFn: () => getPartnerDocuments(activeOrgId!, partnerId!),
        enabled: !!activeOrgId && !!partnerId,
        staleTime: 1000 * 60 * 2,
    });
}

export function useCreateDocumentMutation(partnerId: string) {
    const queryClient = useQueryClient();
    const activeOrgId = useAuthStore((state) => state.activeOrgId);

    return useMutation({
        mutationFn: (input: CreateDocumentInput) =>
            createDocument(activeOrgId!, partnerId, input),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ['partnerDocuments', activeOrgId, partnerId],
            });
            queryClient.invalidateQueries({
                queryKey: ['orgDocuments', activeOrgId],
            });
        },
    });
}

export function useCreateDocumentForPartnerMutation() {
    const queryClient = useQueryClient();
    const activeOrgId = useAuthStore((state) => state.activeOrgId);

    return useMutation({
        mutationFn: ({ partnerId, input }: { partnerId: string; input: CreateDocumentInput }) =>
            createDocument(activeOrgId!, partnerId, input),
        onSuccess: (_result, variables) => {
            queryClient.invalidateQueries({
                queryKey: ['partnerDocuments', activeOrgId, variables.partnerId],
            });
            queryClient.invalidateQueries({
                queryKey: ['orgDocuments', activeOrgId],
            });
        },
    });
}

export function useOrgDocuments() {
    const activeOrgId = useAuthStore((state) => state.activeOrgId);
    return useQuery({
        queryKey: ['orgDocuments', activeOrgId],
        queryFn: () => getOrgDocuments(activeOrgId!),
        enabled: !!activeOrgId,
        staleTime: 1000 * 60,
    });
}

export function useDeleteDocumentMutation() {
    const queryClient = useQueryClient();
    const activeOrgId = useAuthStore((state) => state.activeOrgId);

    return useMutation({
        mutationFn: (documentId: string) => deleteDocument(activeOrgId!, documentId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['partnerDocuments'] });
            queryClient.invalidateQueries({ queryKey: ['orgDocuments', activeOrgId] });
        },
    });
}

export function useUpdateDocumentVisibilityMutation() {
    const queryClient = useQueryClient();
    const activeOrgId = useAuthStore((state) => state.activeOrgId);

    return useMutation({
        mutationFn: ({
            documentId,
            visibility,
        }: {
            documentId: string;
            visibility: 'public' | 'private' | 'team';
        }) => updateDocumentVisibility(activeOrgId!, documentId, visibility),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['partnerDocuments'] });
            queryClient.invalidateQueries({ queryKey: ['orgDocuments', activeOrgId] });
        },
    });
}

// Activities Hooks ->

export function usePartnerActivities(partnerId: string | undefined) {
    const activeOrgId = useAuthStore((state) => state.activeOrgId);
    return useQuery({
        queryKey: ['partnerActivities', activeOrgId, partnerId],
        queryFn: () => getPartnerActivities(activeOrgId!, partnerId!),
        enabled: !!activeOrgId && !!partnerId,
        staleTime: 1000 * 60 * 2,
    });
}
