import { API_BASE } from '@/lib/api';

export type ApiKeyResultStatus = 'on_track' | 'at_risk' | 'off_track';

export interface ApiObjective {
    id: string;
    orgId: string;
    partnerId: string;
    partnerName: string | null;
    title: string;
    description: string | null;
    startDate: string;
    endDate: string;
    createdBy: string | null;
    createdAt: string;
}

export interface CreateObjectiveInput {
    partnerId: string;
    title: string;
    description?: string;
    startDate: string;
    endDate: string;
}

export interface ApiKeyResult {
    id: string;
    objectiveId: string;
    targetValue: number;
    currentValue: number;
    status: ApiKeyResultStatus;
    createdAt: string;
    updatedAt: string;
}

export interface ApiObjectiveDetails {
    objective: {
        id: string;
        orgId: string;
        partnerId: string;
        partnerName: string | null;
        title: string;
        description: string | null;
        startDate: string;
        endDate: string;
        createdBy: string | null;
        createdByName: string | null;
        createdAt: string;
        updatedAt: string;
    };
    keyResults: ApiKeyResult[];
    progressPercent: number;
}

export interface ApiPartnerScore {
    id: string;
    partnerId: string;
    score: number;
    calculatedOn: string;
}

export interface UpdateObjectiveInput {
    title?: string;
    description?: string | null;
    partnerId?: string;
    startDate?: string;
    endDate?: string;
}

export interface CreateKeyResultInput {
    targetValue: number;
    currentValue?: number;
    status?: ApiKeyResultStatus;
}

export interface UpdateKeyResultInput {
    targetValue?: number;
    currentValue?: number;
    status?: ApiKeyResultStatus;
}

function buildHeaders(orgId: string): HeadersInit {
    return {
        'Content-Type': 'application/json',
        'x-org-id': orgId,
    };
}

export async function getObjectives(orgId: string): Promise<{ objectives: ApiObjective[] }> {
    const response = await fetch(`${API_BASE}/okr/objectives`, {
        method: 'GET',
        credentials: 'include',
        headers: buildHeaders(orgId),
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to fetch objectives');
    }

    return response.json();
}

export async function createObjective(
    orgId: string,
    input: CreateObjectiveInput
): Promise<{ objective: ApiObjective }> {
    const response = await fetch(`${API_BASE}/okr/objectives`, {
        method: 'POST',
        credentials: 'include',
        headers: buildHeaders(orgId),
        body: JSON.stringify(input),
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create objective');
    }

    return response.json();
}

export async function getObjectiveById(
    orgId: string,
    objectiveId: string
): Promise<ApiObjectiveDetails> {
    const response = await fetch(`${API_BASE}/okr/objectives/${objectiveId}`, {
        method: 'GET',
        credentials: 'include',
        headers: buildHeaders(orgId),
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to fetch objective details');
    }

    return response.json();
}

export async function updateObjective(
    orgId: string,
    objectiveId: string,
    input: UpdateObjectiveInput
): Promise<{ objective: ApiObjective }> {
    const response = await fetch(`${API_BASE}/okr/objectives/${objectiveId}`, {
        method: 'PATCH',
        credentials: 'include',
        headers: buildHeaders(orgId),
        body: JSON.stringify(input),
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update objective');
    }

    return response.json();
}

export async function deleteObjective(
    orgId: string,
    objectiveId: string
): Promise<{ success: boolean }> {
    const response = await fetch(`${API_BASE}/okr/objectives/${objectiveId}`, {
        method: 'DELETE',
        credentials: 'include',
        headers: buildHeaders(orgId),
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete objective');
    }

    return response.json();
}

export async function createKeyResult(
    orgId: string,
    objectiveId: string,
    input: CreateKeyResultInput
): Promise<{ keyResult: ApiKeyResult }> {
    const response = await fetch(`${API_BASE}/okr/objectives/${objectiveId}/key-results`, {
        method: 'POST',
        credentials: 'include',
        headers: buildHeaders(orgId),
        body: JSON.stringify(input),
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create key result');
    }

    return response.json();
}

export async function updateKeyResult(
    orgId: string,
    keyResultId: string,
    input: UpdateKeyResultInput
): Promise<{ keyResult: ApiKeyResult }> {
    const response = await fetch(`${API_BASE}/okr/key-results/${keyResultId}`, {
        method: 'PATCH',
        credentials: 'include',
        headers: buildHeaders(orgId),
        body: JSON.stringify(input),
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update key result');
    }

    return response.json();
}

export async function getPartnerScore(
    orgId: string,
    partnerId: string
): Promise<{ score: ApiPartnerScore | null }> {
    const response = await fetch(`${API_BASE}/okr/partners/${partnerId}/score`, {
        method: 'GET',
        credentials: 'include',
        headers: buildHeaders(orgId),
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to fetch partner score');
    }

    return response.json();
}
