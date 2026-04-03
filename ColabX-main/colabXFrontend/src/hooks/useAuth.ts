import { useQuery } from '@tanstack/react-query';
import { getCurrentUser, getOrganizations } from '@/services/orgService';
import type { CurrentUserResponse, Organization } from '@/services/orgService';

// Hook to get current user with organizations
export function useCurrentUser() {
    return useQuery<CurrentUserResponse>({
        queryKey: ['currentUser'],
        queryFn: getCurrentUser,
        retry: false,
        staleTime: 1000 * 60 * 5, // 5 minutes
    });
}

// Hook to get organizations list
export function useOrganizations() {
    return useQuery<{ organizations: Organization[] }>({
        queryKey: ['organizations'],
        queryFn: getOrganizations,
        retry: false,
        staleTime: 1000 * 60 * 5, // 5 minutes
    });
}
