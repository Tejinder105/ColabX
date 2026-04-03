import { API_BASE } from '@/lib/api';

// Types matching backend responses
export interface ApiPartner {
    id: string;
    orgId: string;
    name: string;
    type: 'reseller' | 'agent' | 'technology' | 'distributor';
    status: string;
    contactEmail: string | null;
    industry: string | null;
    onboardingDate: string | null;
    createdBy: string;
    createdAt: string;
    updatedAt: string;
}

export interface ApiPartnerDetail {
    id: string;
    orgId: string;
    name: string;
    type: 'reseller' | 'agent' | 'technology' | 'distributor';
    status: string;
    contactEmail: string | null;
    industry: string | null;
    onboardingDate: string | null;
    createdBy: string;
    createdAt: string;
    updatedAt: string;
}

export interface ApiPartnerTeam {
    id: string;
    name: string;
    memberCount: number;
}

export interface CreatePartnerInput {
    name: string;
    type: 'reseller' | 'agent' | 'technology' | 'distributor';
    contactEmail?: string;
    industry?: string;
    onboardingDate?: string;
}

export interface UpdatePartnerInput {
    name?: string;
    type?: 'reseller' | 'agent' | 'technology' | 'distributor';
    status?: string;
    contactEmail?: string;
    industry?: string;
    onboardingDate?: string | null;
}

function buildHeaders(orgId: string): HeadersInit {
    return {
        'Content-Type': 'application/json',
        'x-org-id': orgId,
    };
}

// GET /api/partners
export async function getPartners(orgId: string): Promise<{ partners: ApiPartner[] }> {
    const response = await fetch(`${API_BASE}/partners`, {
        method: 'GET',
        credentials: 'include',
        headers: buildHeaders(orgId),
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to fetch partners');
    }

    return response.json();
}

// GET /api/partners/:partnerId
export async function getPartnerById(
    orgId: string,
    partnerId: string
): Promise<{ partner: ApiPartnerDetail; teams: ApiPartnerTeam[] }> {
    const response = await fetch(`${API_BASE}/partners/${partnerId}`, {
        method: 'GET',
        credentials: 'include',
        headers: buildHeaders(orgId),
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to fetch partner');
    }

    return response.json();
}

// POST /api/partners
export async function createPartner(
    orgId: string,
    input: CreatePartnerInput
): Promise<{ partner: ApiPartnerDetail }> {
    const response = await fetch(`${API_BASE}/partners`, {
        method: 'POST',
        credentials: 'include',
        headers: buildHeaders(orgId),
        body: JSON.stringify(input),
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create partner');
    }

    return response.json();
}

// PATCH /api/partners/:partnerId
export async function updatePartner(
    orgId: string,
    partnerId: string,
    input: UpdatePartnerInput
): Promise<{ partner: ApiPartnerDetail }> {
    const response = await fetch(`${API_BASE}/partners/${partnerId}`, {
        method: 'PATCH',
        credentials: 'include',
        headers: buildHeaders(orgId),
        body: JSON.stringify(input),
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update partner');
    }

    return response.json();
}

// DELETE /api/partners/:partnerId (soft delete)
export async function deletePartner(
    orgId: string,
    partnerId: string
): Promise<{ partner: ApiPartnerDetail }> {
    const response = await fetch(`${API_BASE}/partners/${partnerId}`, {
        method: 'DELETE',
        credentials: 'include',
        headers: buildHeaders(orgId),
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete partner');
    }

    return response.json();
}

// ── Partner Deals ─────────────────────────────────────────────────────────────

export type ApiDealStage = 'lead' | 'proposal' | 'negotiation' | 'won' | 'lost';

export interface ApiPartnerDeal {
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

// GET /api/deals?partnerId=:partnerId
export async function getPartnerDeals(
    orgId: string,
    partnerId: string
): Promise<{ deals: ApiPartnerDeal[] }> {
    const response = await fetch(`${API_BASE}/deals?partnerId=${partnerId}`, {
        method: 'GET',
        credentials: 'include',
        headers: buildHeaders(orgId),
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to fetch partner deals');
    }

    return response.json();
}
