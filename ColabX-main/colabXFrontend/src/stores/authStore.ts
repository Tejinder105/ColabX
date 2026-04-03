import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface Organization {
    id: string;
    name: string;
    slug: string;
    role: string;
    joinedAt: string;
}

interface AuthState {
    // Active organization
    activeOrgId: string | null;
    activeOrg: Organization | null;

    // UI states
    isOnboarding: boolean;

    // Actions
    setActiveOrg: (org: Organization) => void;
    setActiveOrgId: (orgId: string | null) => void;
    setIsOnboarding: (value: boolean) => void;
    clearAuth: () => void;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            activeOrgId: null,
            activeOrg: null,
            isOnboarding: false,

            setActiveOrg: (org) =>
                set({ activeOrg: org, activeOrgId: org.id, isOnboarding: false }),

            setActiveOrgId: (orgId) =>
                set({ activeOrgId: orgId }),

            setIsOnboarding: (value) =>
                set({ isOnboarding: value }),

            clearAuth: () =>
                set({ activeOrgId: null, activeOrg: null, isOnboarding: false }),
        }),
        {
            name: 'colabx-auth',
            partialize: (state) => ({
                activeOrgId: state.activeOrgId,
                activeOrg: state.activeOrg,
            }),
        }
    )
);
