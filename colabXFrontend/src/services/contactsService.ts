import { API_BASE } from '@/lib/api';

export interface ApiContact {
    contactId: string;
    organizationId: string;
    partnerId: string;
    name: string;
    email: string;
    phone: string | null;
    role: string | null;
    isPrimary: boolean;
    createdByUserId: string | null;
    createdAt: string;
    updatedAt: string;
}

export interface CreateContactInput {
    name: string;
    email: string;
    phone?: string;
    role?: string;
    isPrimary?: boolean;
}

export interface UpdateContactInput {
    name?: string;
    email?: string;
    phone?: string | null;
    role?: string | null;
    isPrimary?: boolean;
}

function buildHeaders(orgId: string): HeadersInit {
    return {
        'Content-Type': 'application/json',
        'x-org-id': orgId,
    };
}

// GET /api/partners/:partnerId/contacts
export async function getPartnerContacts(
    orgId: string,
    partnerId: string
): Promise<{ contacts: ApiContact[] }> {
    const response = await fetch(`${API_BASE}/partners/${partnerId}/contacts`, {
        method: 'GET',
        credentials: 'include',
        headers: buildHeaders(orgId),
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to fetch contacts');
    }

    return response.json();
}

// POST /api/partners/:partnerId/contacts
export async function createContact(
    orgId: string,
    partnerId: string,
    input: CreateContactInput
): Promise<{ contact: ApiContact }> {
    const response = await fetch(`${API_BASE}/partners/${partnerId}/contacts`, {
        method: 'POST',
        credentials: 'include',
        headers: buildHeaders(orgId),
        body: JSON.stringify(input),
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create contact');
    }

    return response.json();
}

// PATCH /api/contacts/:contactId
export async function updateContact(
    orgId: string,
    contactId: string,
    input: UpdateContactInput
): Promise<{ contact: ApiContact }> {
    const response = await fetch(`${API_BASE}/contacts/${contactId}`, {
        method: 'PATCH',
        credentials: 'include',
        headers: buildHeaders(orgId),
        body: JSON.stringify(input),
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update contact');
    }

    return response.json();
}

// DELETE /api/contacts/:contactId
export async function deleteContact(
    orgId: string,
    contactId: string
): Promise<{ contact: ApiContact }> {
    const response = await fetch(`${API_BASE}/contacts/${contactId}`, {
        method: 'DELETE',
        credentials: 'include',
        headers: buildHeaders(orgId),
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete contact');
    }

    return response.json();
}
