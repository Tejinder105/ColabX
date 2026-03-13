import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
    createOrganization,
    validateInvite,
    acceptInvite,
    getOrganizationById,
    getOrganizationMembers,
    updateOrganization,
    deleteOrganization,
    changeMemberRole,
    removeMember,
    getPendingInvitations,
    createInvite,
    type CreateOrgInput,
    type InviteInput,
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

// Hook to fetch org details
export function useOrgDetails(orgId: string | null | undefined) {
    return useQuery({
        queryKey: ['org', orgId],
        queryFn: () => getOrganizationById(orgId!),
        enabled: !!orgId,
        staleTime: 1000 * 60 * 5,
    });
}

// Hook to fetch org members
export function useOrgMembers(orgId: string | null | undefined) {
    return useQuery({
        queryKey: ['org', orgId, 'members'],
        queryFn: () => getOrganizationMembers(orgId!),
        enabled: !!orgId,
        staleTime: 1000 * 60 * 2,
    });
}

// Hook to fetch pending invitations
export function usePendingInvitations(orgId: string | null | undefined) {
    return useQuery({
        queryKey: ['org', orgId, 'invitations'],
        queryFn: () => getPendingInvitations(orgId!),
        enabled: !!orgId,
        staleTime: 1000 * 60 * 2,
    });
}

// Hook to update org name
export function useUpdateOrgMutation() {
    const queryClient = useQueryClient();
    const activeOrg = useAuthStore((state) => state.activeOrg);
    const setActiveOrg = useAuthStore((state) => state.setActiveOrg);

    return useMutation({
        mutationFn: ({ orgId, name }: { orgId: string; name: string }) =>
            updateOrganization(orgId, { name }),
        onSuccess: (data, variables) => {
            queryClient.invalidateQueries({ queryKey: ['org', variables.orgId] });
            queryClient.invalidateQueries({ queryKey: ['organizations'] });
            // Update active org name in store
            if (activeOrg) {
                setActiveOrg({
                    ...activeOrg,
                    name: data.organization.name,
                    slug: data.organization.slug,
                });
            }
        },
    });
}

// Hook to delete org
export function useDeleteOrgMutation() {
    const queryClient = useQueryClient();
    const clearAuth = useAuthStore((state) => state.clearAuth);

    return useMutation({
        mutationFn: (orgId: string) => deleteOrganization(orgId),
        onSuccess: () => {
            queryClient.clear();
            clearAuth();
        },
    });
}

// Hook to change a member's role
export function useChangeMemberRoleMutation() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({
            orgId,
            memberId,
            role,
        }: {
            orgId: string;
            memberId: string;
            role: 'admin' | 'manager' | 'partner';
        }) => changeMemberRole(orgId, memberId, role),
        onSuccess: (_data, variables) => {
            queryClient.invalidateQueries({ queryKey: ['org', variables.orgId, 'members'] });
        },
    });
}

// Hook to remove a member from org
export function useRemoveMemberMutation() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ orgId, memberId }: { orgId: string; memberId: string }) =>
            removeMember(orgId, memberId),
        onSuccess: (_data, variables) => {
            queryClient.invalidateQueries({ queryKey: ['org', variables.orgId, 'members'] });
        },
    });
}

// Hook to send an invitation
export function useCreateInviteMutation() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (input: InviteInput) => createInvite(input),
        onSuccess: (_data, variables) => {
            queryClient.invalidateQueries({ queryKey: ['org', variables.orgId, 'invitations'] });
        },
    });
}
