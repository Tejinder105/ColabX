import { authClient } from '@/utils/auth-client';
import { API_BASE } from '@/lib/api';

// Types
export interface Organization {
    id: string;
    name: string;
    slug: string;
    role: string;
    joinedAt: string;
}

export interface OrgDetails {
    id: string;
    name: string;
    slug: string;
}

export interface User {
    id: string;
    email: string;
    name: string;
    image: string | null;
}

export interface CurrentUserResponse {
    user: User;
    organizations: Organization[];
    orgCount: number;
}

export interface OrgMember {
    id: string;
    userId: string;
    role: string;
    joinedAt: string;
    userName: string;
    userEmail: string;
    userImage: string | null;
}

export interface Invitation {
    id: string;
    email: string;
    role: string;
    expiresAt: string;
    createdAt: string;
}

export interface OrgPermission {
    feature: string;
    admin: boolean;
    manager: boolean;
    partner: boolean;
}

export interface OrgAuditLog {
    id: string;
    action: string;
    entityType: string;
    entityId: string;
    createdAt: string;
    userId: string;
    userName: string | null;
    userEmail: string | null;
}

export interface OrgIntegrityReport {
    internalUsersInMultipleOrgs: unknown[];
    partnersInTeams: unknown[];
    partnersLeadingTeams: unknown[];
    partnersAssignedToMultipleTeams: Array<{ partnerId: string; assignmentCount: number }>;
    teamsWithoutLead: unknown[];
}

export interface CreateOrgInput {
    name: string;
}

export interface InviteInput {
    orgId: string;
    email: string;
    role?: 'admin' | 'manager' | 'member' | 'partner';
    partnerType?: string;
    partnerIndustry?: string;
}

export interface InviteValidationResponse {
    valid: boolean;
    invitation?: {
        email: string;
        role: string;
        organization: {
            id: string;
            name: string;
            slug: string;
        };
    };
}

// Helper to build request headers, injecting x-org-id for org-scoped requests
function buildHeaders(orgId?: string | null): HeadersInit {
    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
    };
    if (orgId) {
        headers['x-org-id'] = orgId;
    }
    return headers;
}

// Get current user with organizations
export async function getCurrentUser(): Promise<CurrentUserResponse> {
    const response = await fetch(`${API_BASE}/me`, {
        method: 'GET',
        credentials: 'include',
        headers: buildHeaders(),
    });

    if (!response.ok) {
        throw new Error('Failed to fetch user data');
    }

    return response.json();
}

// Get user's organizations
export async function getOrganizations(): Promise<{ organizations: Organization[] }> {
    const response = await fetch(`${API_BASE}/org`, {
        method: 'GET',
        credentials: 'include',
        headers: buildHeaders(),
    });

    if (!response.ok) {
        throw new Error('Failed to fetch organizations');
    }

    return response.json();
}

// Create organization
export async function createOrganization(
    input: CreateOrgInput
): Promise<{ organization: OrgDetails }> {
    const response = await fetch(`${API_BASE}/org`, {
        method: 'POST',
        credentials: 'include',
        headers: buildHeaders(),
        body: JSON.stringify(input),
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create organization');
    }

    return response.json();
}

// Get organization by ID (requires x-org-id header)
export async function getOrganizationById(
    orgId: string
): Promise<{ organization: OrgDetails; role: string }> {
    const response = await fetch(`${API_BASE}/org/${orgId}`, {
        method: 'GET',
        credentials: 'include',
        headers: buildHeaders(orgId),
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to fetch organization');
    }

    return response.json();
}

// Get organization members (requires x-org-id header)
export async function getOrganizationMembers(
    orgId: string
): Promise<{ members: OrgMember[] }> {
    const response = await fetch(`${API_BASE}/org/${orgId}/members`, {
        method: 'GET',
        credentials: 'include',
        headers: buildHeaders(orgId),
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to fetch members');
    }

    return response.json();
}

// Change member role (admin only, requires x-org-id header)
export async function changeMemberRole(
    orgId: string,
    memberId: string,
    role: 'admin' | 'manager' | 'member' | 'partner'
): Promise<{ member: OrgMember }> {
    const response = await fetch(`${API_BASE}/org/${orgId}/members/${memberId}/role`, {
        method: 'PATCH',
        credentials: 'include',
        headers: buildHeaders(orgId),
        body: JSON.stringify({ role }),
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to change member role');
    }

    return response.json();
}

// Remove member (admin only, requires x-org-id header)
export async function removeMember(
    orgId: string,
    memberId: string
): Promise<{ success: boolean }> {
    const response = await fetch(`${API_BASE}/org/${orgId}/members/${memberId}`, {
        method: 'DELETE',
        credentials: 'include',
        headers: buildHeaders(orgId),
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to remove member');
    }

    return response.json();
}

// Get pending invitations (admin/manager only, requires x-org-id header)
export async function getPendingInvitations(
    orgId: string
): Promise<{ invitations: Invitation[] }> {
    const response = await fetch(`${API_BASE}/org/${orgId}/invitations`, {
        method: 'GET',
        credentials: 'include',
        headers: buildHeaders(orgId),
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to fetch invitations');
    }

    return response.json();
}

// Get role permissions matrix (requires x-org-id header)
export async function getOrganizationPermissions(
    orgId: string
): Promise<{ permissions: OrgPermission[] }> {
    const response = await fetch(`${API_BASE}/org/${orgId}/permissions`, {
        method: 'GET',
        credentials: 'include',
        headers: buildHeaders(orgId),
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to fetch permissions');
    }

    return response.json();
}

// Get organization audit logs (requires x-org-id header)
export async function getOrganizationAuditLogs(
    orgId: string,
    limit = 200
): Promise<{ logs: OrgAuditLog[] }> {
    const response = await fetch(`${API_BASE}/org/${orgId}/audit-logs?limit=${limit}`, {
        method: 'GET',
        credentials: 'include',
        headers: buildHeaders(orgId),
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to fetch audit logs');
    }

    return response.json();
}

// Get organization integrity report (requires x-org-id header)
export async function getOrganizationIntegrityReport(
    orgId: string
): Promise<OrgIntegrityReport> {
    const response = await fetch(`${API_BASE}/org/${orgId}/integrity-report`, {
        method: 'GET',
        credentials: 'include',
        headers: buildHeaders(orgId),
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to fetch integrity report');
    }

    return response.json();
}

// Validate invitation
export async function validateInvite(
    token: string
): Promise<InviteValidationResponse> {
    const response = await fetch(`${API_BASE}/invite/${token}`, {
        method: 'GET',
        credentials: 'include',
        headers: buildHeaders(),
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Invalid invitation');
    }

    return response.json();
}

// Accept invitation
export async function acceptInvite(
    token: string
): Promise<{ success: boolean; organization: OrgDetails }> {
    const response = await fetch(`${API_BASE}/invite/${token}/accept`, {
        method: 'POST',
        credentials: 'include',
        headers: buildHeaders(),
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to accept invitation');
    }

    return response.json();
}

// Create invitation
export async function createInvite(
    input: InviteInput
): Promise<{ invitation: { token: string } }> {
    const response = await fetch(`${API_BASE}/invite`, {
        method: 'POST',
        credentials: 'include',
        headers: buildHeaders(input.orgId),
        body: JSON.stringify(input),
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create invitation');
    }

    return response.json();
}

// Update organization (admin only)
export async function updateOrganization(
    orgId: string,
    input: { name: string }
): Promise<{ organization: OrgDetails }> {
    const response = await fetch(`${API_BASE}/org/${orgId}`, {
        method: 'PATCH',
        credentials: 'include',
        headers: buildHeaders(orgId),
        body: JSON.stringify(input),
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update organization');
    }

    return response.json();
}

// Delete organization (admin only)
export async function deleteOrganization(
    orgId: string
): Promise<{ success: boolean }> {
    const response = await fetch(`${API_BASE}/org/${orgId}`, {
        method: 'DELETE',
        credentials: 'include',
        headers: buildHeaders(orgId),
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete organization');
    }

    return response.json();
}

// Logout
export async function logout(): Promise<void> {
    await authClient.signOut();
}
