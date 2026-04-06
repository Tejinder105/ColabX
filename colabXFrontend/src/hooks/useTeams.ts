import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
    getTeams,
    getTeamById,
    createTeam,
    updateTeam,
    deleteTeam,
    addTeamMember,
    updateTeamMemberRole,
    removeTeamMember,
    getTeamPartners,
    assignPartnerToTeam,
    removePartnerFromTeam,
    getTeamDeals,
    getTeamObjectives,
    getTeamActivity,
    type CreateTeamInput,
    type UpdateTeamInput,
} from '@/services/teamsService';
import { useAuthStore } from '@/stores/authStore';

// Hook to list all teams in the active org
export function useTeams() {
    const activeOrgId = useAuthStore((state) => state.activeOrgId);

    return useQuery({
        queryKey: ['teams', activeOrgId],
        queryFn: () => getTeams(activeOrgId!),
        enabled: !!activeOrgId,
        staleTime: 1000 * 60 * 2, 
    });
}

// Hook to get a single team with its members
export function useTeam(teamId: string | undefined) {
    const activeOrgId = useAuthStore((state) => state.activeOrgId);

    return useQuery({
        queryKey: ['teams', activeOrgId, teamId],
        queryFn: () => getTeamById(activeOrgId!, teamId!),
        enabled: !!activeOrgId && !!teamId,
        staleTime: 1000 * 60 * 2,
    });
}

// Hook to create a team
export function useCreateTeamMutation() {
    const queryClient = useQueryClient();
    const activeOrgId = useAuthStore((state) => state.activeOrgId);

    return useMutation({
        mutationFn: (input: CreateTeamInput) => createTeam(activeOrgId!, input),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['teams', activeOrgId] });
        },
    });
}

// Hook to update a team
export function useUpdateTeamMutation(teamId: string) {
    const queryClient = useQueryClient();
    const activeOrgId = useAuthStore((state) => state.activeOrgId);

    return useMutation({
        mutationFn: (input: UpdateTeamInput) => updateTeam(activeOrgId!, teamId, input),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['teams', activeOrgId] });
            queryClient.invalidateQueries({ queryKey: ['teams', activeOrgId, teamId] });
        },
    });
}

// Hook to delete a team
export function useDeleteTeamMutation() {
    const queryClient = useQueryClient();
    const activeOrgId = useAuthStore((state) => state.activeOrgId);

    return useMutation({
        mutationFn: (teamId: string) => deleteTeam(activeOrgId!, teamId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['teams', activeOrgId] });
        },
    });
}

// Hook to add a team member
export function useAddTeamMemberMutation(teamId: string) {
    const queryClient = useQueryClient();
    const activeOrgId = useAuthStore((state) => state.activeOrgId);

    return useMutation({
        mutationFn: ({ userId, role }: { userId: string; role: 'lead' | 'member' }) =>
            addTeamMember(activeOrgId!, teamId, userId, role),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['teams', activeOrgId, teamId] });
        },
    });
}

// Hook to update a team member's role
export function useUpdateTeamMemberRoleMutation(teamId: string) {
    const queryClient = useQueryClient();
    const activeOrgId = useAuthStore((state) => state.activeOrgId);

    return useMutation({
        mutationFn: ({ userId, role }: { userId: string; role: 'lead' | 'member' }) =>
            updateTeamMemberRole(activeOrgId!, teamId, userId, role),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['teams', activeOrgId, teamId] });
        },
    });
}

// Hook to remove a team member
export function useRemoveTeamMemberMutation(teamId: string) {
    const queryClient = useQueryClient();
    const activeOrgId = useAuthStore((state) => state.activeOrgId);

    return useMutation({
        mutationFn: (userId: string) => removeTeamMember(activeOrgId!, teamId, userId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['teams', activeOrgId, teamId] });
        },
    });
}

// Hook to get team partners
export function useTeamPartners(teamId: string | undefined) {
    const activeOrgId = useAuthStore((state) => state.activeOrgId);

    return useQuery({
        queryKey: ['teams', activeOrgId, teamId, 'partners'],
        queryFn: () => getTeamPartners(activeOrgId!, teamId!),
        enabled: !!activeOrgId && !!teamId,
        staleTime: 1000 * 60 * 2,
    });
}

export function useAssignPartnerToTeamMutation() {
    const queryClient = useQueryClient();
    const activeOrgId = useAuthStore((state) => state.activeOrgId);

    return useMutation({
        mutationFn: ({ teamId, partnerId }: { teamId: string; partnerId: string }) =>
            assignPartnerToTeam(activeOrgId!, teamId, partnerId),
        onSuccess: (_data, variables) => {
            queryClient.invalidateQueries({ queryKey: ['teams', activeOrgId] });
            queryClient.invalidateQueries({ queryKey: ['teams', activeOrgId, variables.teamId] });
            queryClient.invalidateQueries({ queryKey: ['teams', activeOrgId, variables.teamId, 'partners'] });
            queryClient.invalidateQueries({ queryKey: ['partners', activeOrgId, variables.partnerId] });
        },
    });
}

export function useRemovePartnerFromTeamMutation() {
    const queryClient = useQueryClient();
    const activeOrgId = useAuthStore((state) => state.activeOrgId);

    return useMutation({
        mutationFn: ({ teamId, partnerId }: { teamId: string; partnerId: string }) =>
            removePartnerFromTeam(activeOrgId!, teamId, partnerId),
        onSuccess: (_data, variables) => {
            queryClient.invalidateQueries({ queryKey: ['teams', activeOrgId] });
            queryClient.invalidateQueries({ queryKey: ['teams', activeOrgId, variables.teamId] });
            queryClient.invalidateQueries({ queryKey: ['teams', activeOrgId, variables.teamId, 'partners'] });
            queryClient.invalidateQueries({ queryKey: ['partners', activeOrgId, variables.partnerId] });
        },
    });
}

// Hook to get team deals
export function useTeamDeals(teamId: string | undefined) {
    const activeOrgId = useAuthStore((state) => state.activeOrgId);

    return useQuery({
        queryKey: ['teams', activeOrgId, teamId, 'deals'],
        queryFn: () => getTeamDeals(activeOrgId!, teamId!),
        enabled: !!activeOrgId && !!teamId,
        staleTime: 1000 * 60 * 2,
    });
}

// Hook to get team objectives
export function useTeamObjectives(teamId: string | undefined) {
    const activeOrgId = useAuthStore((state) => state.activeOrgId);

    return useQuery({
        queryKey: ['teams', activeOrgId, teamId, 'objectives'],
        queryFn: () => getTeamObjectives(activeOrgId!, teamId!),
        enabled: !!activeOrgId && !!teamId,
        staleTime: 1000 * 60 * 2,
    });
}

// Hook to get team activity
export function useTeamActivity(teamId: string | undefined) {
    const activeOrgId = useAuthStore((state) => state.activeOrgId);

    return useQuery({
        queryKey: ['teams', activeOrgId, teamId, 'activity'],
        queryFn: () => getTeamActivity(activeOrgId!, teamId!),
        enabled: !!activeOrgId && !!teamId,
        staleTime: 1000 * 60 * 2,
    });
}
