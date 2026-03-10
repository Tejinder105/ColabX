const API_BASE = 'http://localhost:3000/api';

// Types matching backend responses
export interface ApiTeam {
    id: string;
    orgId: string;
    name: string;
    description: string | null;
    createdBy: string;
    createdAt: string;
    updatedAt: string;
    memberCount: number;
}

export interface ApiTeamMember {
    id: string;
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
}

export interface UpdateTeamInput {
    name?: string;
    description?: string;
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
): Promise<{ team: ApiTeam; members: ApiTeamMember[] }> {
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
