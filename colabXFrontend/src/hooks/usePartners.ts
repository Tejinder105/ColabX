import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
    getPartners,
    getPartnerById,
    createPartner,
    updatePartner,
    deletePartner,
    type CreatePartnerInput,
    type UpdatePartnerInput,
} from '@/services/partnersService';
import { useAuthStore } from '@/stores/authStore';

export function usePartners() {
    const activeOrgId = useAuthStore((state) => state.activeOrgId);
    return useQuery({
        queryKey: ['partners', activeOrgId],
        queryFn: () => getPartners(activeOrgId!),
        enabled: !!activeOrgId,
        staleTime: 1000 * 60 * 2,
    });
}

export function usePartner(partnerId: string | undefined) {
    const activeOrgId = useAuthStore((state) => state.activeOrgId);
    return useQuery({
        queryKey: ['partners', activeOrgId, partnerId],
        queryFn: () => getPartnerById(activeOrgId!, partnerId!),
        enabled: !!activeOrgId && !!partnerId,
        staleTime: 1000 * 60 * 2,
    });
}

export function useCreatePartnerMutation() {
    const queryClient = useQueryClient();
    const activeOrgId = useAuthStore((state) => state.activeOrgId);

    return useMutation({
        mutationFn: (input: CreatePartnerInput) => createPartner(activeOrgId!, input),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['partners', activeOrgId] });
        },
    });
}

export function useUpdatePartnerMutation(partnerId: string) {
    const queryClient = useQueryClient();
    const activeOrgId = useAuthStore((state) => state.activeOrgId);

    return useMutation({
        mutationFn: (input: UpdatePartnerInput) => updatePartner(activeOrgId!, partnerId, input),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['partners', activeOrgId] });
            queryClient.invalidateQueries({ queryKey: ['partners', activeOrgId, partnerId] });
        },
    });
}

export function useDeletePartnerMutation() {
    const queryClient = useQueryClient();
    const activeOrgId = useAuthStore((state) => state.activeOrgId);

    return useMutation({
        mutationFn: (partnerId: string) => deletePartner(activeOrgId!, partnerId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['partners', activeOrgId] });
        },
    });
}
