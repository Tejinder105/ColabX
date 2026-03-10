import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
    createOrganization,
    validateInvite,
    acceptInvite,
    type CreateOrgInput,
} from '@/services/orgService';
import { useAuthStore } from '@/stores/authStore';

// Hook to create organization
export function useCreateOrgMutation() {
    const queryClient = useQueryClient();
    const setActiveOrg = useAuthStore((state) => state.setActiveOrg);

    return useMutation({
        mutationFn: (input: CreateOrgInput) => createOrganization(input),
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['currentUser'] });
            queryClient.invalidateQueries({ queryKey: ['organizations'] });

            // New org creator is always admin
            setActiveOrg({
                ...data.organization,
                role: 'admin',
                joinedAt: new Date().toISOString(),
            });
        },
    });
}

// Hook to validate invitation
export function useValidateInvite(token: string | undefined) {
    return useQuery({
        queryKey: ['invite', token],
        queryFn: () => validateInvite(token!),
        enabled: !!token,
        retry: false,
    });
}

// Hook to accept invitation
// mutationFn accepts { token, role } so the actual invite role is stored
export function useAcceptInviteMutation() {
    const queryClient = useQueryClient();
    const setActiveOrg = useAuthStore((state) => state.setActiveOrg);

    return useMutation({
        mutationFn: ({ token }: { token: string; role: string }) => acceptInvite(token),
        onSuccess: (data, variables) => {
            queryClient.invalidateQueries({ queryKey: ['currentUser'] });
            queryClient.invalidateQueries({ queryKey: ['organizations'] });

            setActiveOrg({
                ...data.organization,
                role: variables.role,
                joinedAt: new Date().toISOString(),
            });
        },
    });
}
