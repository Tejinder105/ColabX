import { API_BASE } from '@/lib/api';

export type ApiKeyResultStatus = 'on_track' | 'at_risk' | 'off_track';

export interface ApiObjective {
    id: string;
    orgId: string;
    partnerId: string | null;
    teamId?: string | null;
    partnerName: string | null;
    teamName?: string | null;
    title: string;
    description: string | null;
    startDate: string;
    endDate: string;
    createdBy: string | null;
    createdAt: string;
}

export interface CreateObjectiveInput {
    partnerId?: string;
    teamId?: string;
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
        teamId?: string | null;
        partnerName: string | null;
        teamName?: string | null;
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

export interface ApiPartnerPerformanceSummary {
    partner: unknown;
    score: ApiPartnerScore | null;
    activeObjectives: ApiObjective[];
    completionRate: number;
    objectiveCount: number;
}

export interface ApiTeamPerformanceSummary {
    team: unknown;
    objectives: ApiObjective[];
    completionRate: number;
    activeObjectives: number;
    atRiskObjectives: number;
}

export interface UpdateObjectiveInput {
    title?: string;
    description?: string | null;
    partnerId?: string;
    teamId?: string | null;
    startDate?: string;
    endDate?: string;
}

export interface CreateKeyResultInput {
    title: string;
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

export async function getPartnerPerformance(
    orgId: string,
    partnerId: string
): Promise<ApiPartnerPerformanceSummary> {
    const response = await fetch(`${API_BASE}/okr/partners/${partnerId}/performance`, {
        method: 'GET',
        credentials: 'include',
        headers: buildHeaders(orgId),
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to fetch partner performance');
    }

    return response.json();
}

export async function getTeamPerformance(
    orgId: string,
    teamId: string
): Promise<ApiTeamPerformanceSummary> {
    const response = await fetch(`${API_BASE}/okr/teams/${teamId}/performance`, {
        method: 'GET',
        credentials: 'include',
        headers: buildHeaders(orgId),
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to fetch team performance');
    }

    return response.json();
}
