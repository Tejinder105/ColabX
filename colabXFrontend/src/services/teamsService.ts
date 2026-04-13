import { API_BASE } from '@/lib/api';

// Types matching backend responses
export interface ApiTeam {
    teamId: string;
    organizationId: string;
    name: string;
    description: string | null;
    createdByUserId: string | null;
    createdAt: string;
    updatedAt: string;
    memberCount: number;
    partnerCount?: number;
    dealCount?: number;
    isActive?: boolean;
    lead?: ApiTeamMember | null;
}

export interface ApiTeamMember {
    teamMemberId: string;
    teamId: string;
    userId: string;
    role: 'lead' | 'member';
    joinedAt: string;
    userName: string;
    userEmail: string;
    userImage: string | null;
}

export interface CreateTeamInput {
    name: string;
    description?: string;
    leadUserId: string;
    memberIds?: string[];
}

export interface UpdateTeamInput {
    name?: string;
    description?: string;
}

// Team-related data types
export interface ApiTeamPartner {
    partnerId: string;
    name: string;
    type: 'reseller' | 'agent' | 'technology' | 'distributor';
    status: 'pending' | 'active' | 'inactive' | 'suspended';
    contactEmail?: string;
    industry?: string | null;
    onboardingDate?: string | null;
    userId?: string | null;
    createdByUserId?: string | null;
    assignedAt?: string;
    assignedByUserId?: string | null;
}

export interface ApiTeamPartnerAssignment {
    teamPartnerId: string;
    teamId: string;
    partnerId: string;
    assignedByUserId: string | null;
    assignedAt: string;
    teamName?: string;
}

export interface ApiTeamDeal {
    dealId: string;
    title: string;
    value: number | null;
    stage: 'lead' | 'proposal' | 'negotiation' | 'won' | 'lost';
    partnerName: string | null;
    partnerId?: string;
    teamId?: string | null;
    createdByUserId?: string | null;
    createdAt?: string;
    updatedAt?: string;
    assigneeCount?: number;
}

export interface ApiTeamObjective {
    objectiveId: string;
    title: string;
    startDate: string;
    endDate: string;
    partnerName: string | null;
    partnerId?: string | null;
    teamId?: string | null;
    progress: number;
    status: 'on_track' | 'at_risk' | 'off_track';
}

export interface ApiTeamActivity {
    activityLogId: string;
    action: string;
    entityType: string;
    entityId: string;
    createdAt: string;
    userId: string;
    userName: string | null;
}

// Build headers with mandatory x-org-id
function buildHeaders(orgId: string): HeadersInit {
    return {
        'Content-Type': 'application/json',
        'x-org-id': orgId,
    };
}

// GET /api/teams
export async function getTeams(orgId: string): Promise<{ teams: ApiTeam[] }> {
    const response = await fetch(`${API_BASE}/teams`, {
        method: 'GET',
        credentials: 'include',
        headers: buildHeaders(orgId),
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to fetch teams');
    }

    return response.json();
}

// GET /api/teams/:teamId
export async function getTeamById(
    orgId: string,
    teamId: string
): Promise<{ team: ApiTeam; members: ApiTeamMember[]; eligibleMembers?: unknown[]; leadCandidates?: unknown[] }> {
    const response = await fetch(`${API_BASE}/teams/${teamId}`, {
        method: 'GET',
        credentials: 'include',
        headers: buildHeaders(orgId),
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to fetch team');
    }

    return response.json();
}

// POST /api/teams
export async function createTeam(
    orgId: string,
    input: CreateTeamInput
): Promise<{ team: ApiTeam }> {
    const response = await fetch(`${API_BASE}/teams`, {
        method: 'POST',
        credentials: 'include',
        headers: buildHeaders(orgId),
        body: JSON.stringify(input),
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create team');
    }

    return response.json();
}

// PATCH /api/teams/:teamId
export async function updateTeam(
    orgId: string,
    teamId: string,
    input: UpdateTeamInput
): Promise<{ team: ApiTeam }> {
    const response = await fetch(`${API_BASE}/teams/${teamId}`, {
        method: 'PATCH',
        credentials: 'include',
        headers: buildHeaders(orgId),
        body: JSON.stringify(input),
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update team');
    }

    return response.json();
}

// DELETE /api/teams/:teamId
export async function deleteTeam(
    orgId: string,
    teamId: string
): Promise<{ success: boolean }> {
    const response = await fetch(`${API_BASE}/teams/${teamId}`, {
        method: 'DELETE',
        credentials: 'include',
        headers: buildHeaders(orgId),
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete team');
    }

    return response.json();
}

// GET /api/teams/:teamId/members
export async function getTeamMembers(
    orgId: string,
    teamId: string
): Promise<{ members: ApiTeamMember[] }> {
    const response = await fetch(`${API_BASE}/teams/${teamId}/members`, {
        method: 'GET',
        credentials: 'include',
        headers: buildHeaders(orgId),
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to fetch team members');
    }

    return response.json();
}

// POST /api/teams/:teamId/members
export async function addTeamMember(
    orgId: string,
    teamId: string,
    userId: string,
    role: 'lead' | 'member'
): Promise<{ member: ApiTeamMember }> {
    const response = await fetch(`${API_BASE}/teams/${teamId}/members`, {
        method: 'POST',
        credentials: 'include',
        headers: buildHeaders(orgId),
        body: JSON.stringify({ userId, role }),
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to add team member');
    }

    return response.json();
}

// PATCH /api/teams/:teamId/members/:userId/role
export async function updateTeamMemberRole(
    orgId: string,
    teamId: string,
    userId: string,
    role: 'lead' | 'member'
): Promise<{ member: ApiTeamMember }> {
    const response = await fetch(`${API_BASE}/teams/${teamId}/members/${userId}/role`, {
        method: 'PATCH',
        credentials: 'include',
        headers: buildHeaders(orgId),
        body: JSON.stringify({ role }),
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update team member role');
    }

    return response.json();
}

// DELETE /api/teams/:teamId/members/:userId
export async function removeTeamMember(
    orgId: string,
    teamId: string,
    userId: string
): Promise<{ success: boolean }> {
    const response = await fetch(`${API_BASE}/teams/${teamId}/members/${userId}`, {
        method: 'DELETE',
        credentials: 'include',
        headers: buildHeaders(orgId),
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to remove team member');
    }

    return response.json();
}

// GET /api/teams/:teamId/partners
export async function getTeamPartners(
    orgId: string,
    teamId: string
): Promise<{ partners: ApiTeamPartner[] }> {
    const response = await fetch(`${API_BASE}/teams/${teamId}/partners`, {
        method: 'GET',
        credentials: 'include',
        headers: buildHeaders(orgId),
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to fetch team partners');
    }

    return response.json();
}

// POST /api/teams/:teamId/partners
export async function assignPartnerToTeam(
    orgId: string,
    teamId: string,
    partnerId: string
): Promise<{ assignment: ApiTeamPartnerAssignment }> {
    const response = await fetch(`${API_BASE}/teams/${teamId}/partners`, {
        method: 'POST',
        credentials: 'include',
        headers: buildHeaders(orgId),
        body: JSON.stringify({ partnerId }),
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to assign partner to team');
    }

    return response.json();
}

// DELETE /api/teams/:teamId/partners/:partnerId
export async function removePartnerFromTeam(
    orgId: string,
    teamId: string,
    partnerId: string
): Promise<{ success: boolean }> {
    const response = await fetch(`${API_BASE}/teams/${teamId}/partners/${partnerId}`, {
        method: 'DELETE',
        credentials: 'include',
        headers: buildHeaders(orgId),
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to remove partner from team');
    }

    return response.json();
}

// GET /api/teams/:teamId/deals
export async function getTeamDeals(
    orgId: string,
    teamId: string
): Promise<{ deals: ApiTeamDeal[] }> {
    const response = await fetch(`${API_BASE}/teams/${teamId}/deals`, {
        method: 'GET',
        credentials: 'include',
        headers: buildHeaders(orgId),
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to fetch team deals');
    }

    return response.json();
}

// GET /api/teams/:teamId/objectives
export async function getTeamObjectives(
    orgId: string,
    teamId: string
): Promise<{ objectives: ApiTeamObjective[] }> {
    const response = await fetch(`${API_BASE}/teams/${teamId}/objectives`, {
        method: 'GET',
        credentials: 'include',
        headers: buildHeaders(orgId),
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to fetch team objectives');
    }

    return response.json();
}

// GET /api/teams/:teamId/activity
export async function getTeamActivity(
    orgId: string,
    teamId: string
): Promise<{ activities: ApiTeamActivity[] }> {
    const response = await fetch(`${API_BASE}/teams/${teamId}/activity`, {
        method: 'GET',
        credentials: 'include',
        headers: buildHeaders(orgId),
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to fetch team activity');
    }

    return response.json();
}
