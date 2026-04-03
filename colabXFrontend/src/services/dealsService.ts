import { API_BASE } from '@/lib/api';

export type ApiDealStage = 'lead' | 'proposal' | 'negotiation' | 'won' | 'lost';

export interface ApiDeal {
    id: string;
    orgId: string;
    partnerId: string;
    partnerName: string | null;
    title: string;
    description: string | null;
    value: number | null;
    stage: ApiDealStage;
    createdBy: string | null;
    createdAt: string;
    updatedAt: string;
    assigneeCount: number;
}

export interface ApiDealAssignment {
    id: string;
    dealId: string;
    userId: string;
    assignedAt: string;
    userName: string;
    userEmail: string;
    userImage: string | null;
}

export interface ApiDealDetailsResponse {
    deal: {
        id: string;
        orgId: string;
        partnerId: string;
        title: string;
        description: string | null;
        value: number | null;
        stage: ApiDealStage;
        createdBy: string | null;
        createdAt: string;
        updatedAt: string;
    };
    partner: {
        id: string;
        name: string;
    } | null;
    assignments: ApiDealAssignment[];
    activities: Array<{ id: string; action: string; user: string; timestamp: string }>;
}

export interface ApiDealsResponse {
    deals: ApiDeal[];
}

export interface CreateDealInput {
    partnerId: string;
    title: string;
    description?: string;
    value?: number;
}

export interface UpdateDealInput {
    title?: string;
    description?: string | null;
    value?: number | null;
    stage?: ApiDealStage;
}

function buildHeaders(orgId: string): HeadersInit {
    return {
        'Content-Type': 'application/json',
        'x-org-id': orgId,
    };
}

export async function getDeals(orgId: string): Promise<ApiDealsResponse> {
    const response = await fetch(`${API_BASE}/deals`, {
        method: 'GET',
        credentials: 'include',
        headers: buildHeaders(orgId),
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to fetch deals');
    }

    return response.json();
}

export async function createDeal(
    orgId: string,
    input: CreateDealInput
): Promise<{ deal: ApiDeal }> {
    const response = await fetch(`${API_BASE}/deals`, {
        method: 'POST',
        credentials: 'include',
        headers: buildHeaders(orgId),
        body: JSON.stringify(input),
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create deal');
    }

    return response.json();
}

export async function getDealById(
    orgId: string,
    dealId: string
): Promise<ApiDealDetailsResponse> {
    const response = await fetch(`${API_BASE}/deals/${dealId}`, {
        method: 'GET',
        credentials: 'include',
        headers: buildHeaders(orgId),
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to fetch deal details');
    }

    return response.json();
}

export async function updateDeal(
    orgId: string,
    dealId: string,
    input: UpdateDealInput
): Promise<{ deal: ApiDeal }> {
    const response = await fetch(`${API_BASE}/deals/${dealId}`, {
        method: 'PATCH',
        credentials: 'include',
        headers: buildHeaders(orgId),
        body: JSON.stringify(input),
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update deal');
    }

    return response.json();
}

// ── Deal Assignment Operations ─────────────────────────────────────────────────

export async function getDealAssignments(
    orgId: string,
    dealId: string
): Promise<{ assignments: ApiDealAssignment[] }> {
    const response = await fetch(`${API_BASE}/deals/${dealId}/assign`, {
        method: 'GET',
        credentials: 'include',
        headers: buildHeaders(orgId),
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to fetch deal assignments');
    }

    return response.json();
}

export async function assignUserToDeal(
    orgId: string,
    dealId: string,
    userId: string
): Promise<{ assignment: ApiDealAssignment }> {
    const response = await fetch(`${API_BASE}/deals/${dealId}/assign`, {
        method: 'POST',
        credentials: 'include',
        headers: buildHeaders(orgId),
        body: JSON.stringify({ userId }),
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to assign user to deal');
    }

    return response.json();
}

export async function removeUserFromDeal(
    orgId: string,
    dealId: string,
    userId: string
): Promise<{ success: boolean }> {
    const response = await fetch(`${API_BASE}/deals/${dealId}/assign/${userId}`, {
        method: 'DELETE',
        credentials: 'include',
        headers: buildHeaders(orgId),
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to remove user from deal');
    }

    return response.json();
}

// ── Deal Message Operations ─────────────────────────────────────────────────────

export interface ApiDealMessage {
    id: string;
    dealId: string;
    senderId: string;
    content: string;
    createdAt: string;
    senderName: string;
    senderEmail: string;
    senderImage: string | null;
}

export async function getDealMessages(
    orgId: string,
    dealId: string
): Promise<{ messages: ApiDealMessage[] }> {
    const response = await fetch(`${API_BASE}/deals/${dealId}/messages`, {
        method: 'GET',
        credentials: 'include',
        headers: buildHeaders(orgId),
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to fetch deal messages');
    }

    return response.json();
}

export async function createDealMessage(
    orgId: string,
    dealId: string,
    content: string
): Promise<{ message: ApiDealMessage }> {
    const response = await fetch(`${API_BASE}/deals/${dealId}/messages`, {
        method: 'POST',
        credentials: 'include',
        headers: buildHeaders(orgId),
        body: JSON.stringify({ content }),
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to send message');
    }

    return response.json();
}

export async function deleteDealMessage(
    orgId: string,
    dealId: string,
    messageId: string
): Promise<{ success: boolean }> {
    const response = await fetch(`${API_BASE}/deals/${dealId}/messages/${messageId}`, {
        method: 'DELETE',
        credentials: 'include',
        headers: buildHeaders(orgId),
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete message');
    }

    return response.json();
}
