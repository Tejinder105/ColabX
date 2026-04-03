import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
    getPartnerContacts,
    createContact,
    updateContact,
    deleteContact,
    type CreateContactInput,
    type UpdateContactInput,
} from '@/services/contactsService';
import { useAuthStore } from '@/stores/authStore';

export function usePartnerContacts(partnerId: string | undefined) {
    const activeOrgId = useAuthStore((state) => state.activeOrgId);
    return useQuery({
        queryKey: ['partnerContacts', activeOrgId, partnerId],
        queryFn: () => getPartnerContacts(activeOrgId!, partnerId!),
        enabled: !!activeOrgId && !!partnerId,
        staleTime: 1000 * 60 * 2,
    });
}

export function useCreateContactMutation(partnerId: string) {
    const queryClient = useQueryClient();
    const activeOrgId = useAuthStore((state) => state.activeOrgId);

    return useMutation({
        mutationFn: (input: CreateContactInput) => createContact(activeOrgId!, partnerId, input),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['partnerContacts', activeOrgId, partnerId] });
        },
    });
}

export function useUpdateContactMutation() {
    const queryClient = useQueryClient();
    const activeOrgId = useAuthStore((state) => state.activeOrgId);

    return useMutation({
        mutationFn: ({ contactId, input }: { contactId: string; input: UpdateContactInput }) =>
            updateContact(activeOrgId!, contactId, input),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['partnerContacts'] });
        },
    });
}

export function useDeleteContactMutation() {
    const queryClient = useQueryClient();
    const activeOrgId = useAuthStore((state) => state.activeOrgId);

    return useMutation({
        mutationFn: (contactId: string) => deleteContact(activeOrgId!, contactId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['partnerContacts'] });
        },
    });
}
