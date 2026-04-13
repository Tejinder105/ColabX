import { API_BASE } from '@/lib/api';

export type ApiDealStage = 'lead' | 'proposal' | 'negotiation' | 'won' | 'lost';

export interface ApiDeal {
    dealId: string;
    organizationId: string;
    partnerId: string;
    partnerName: string | null;
    teamId: string | null;
    teamName?: string | null;
    title: string;
    description: string | null;
    value: number | null;
    stage: ApiDealStage;
    createdByUserId: string | null;
    createdAt: string;
    updatedAt: string;
    assigneeCount: number;
}

export interface ApiDealAssignment {
    dealAssignmentId: string;
    dealId: string;
    userId: string;
    assignedAt: string;
    userName: string;
    userEmail: string;
    userImage: string | null;
}

export interface ApiDealDetailsResponse {
    deal: {
        dealId: string;
        organizationId: string;
        partnerId: string;
        teamId: string | null;
        title: string;
        description: string | null;
        value: number | null;
        stage: ApiDealStage;
        createdByUserId: string | null;
        createdAt: string;
        updatedAt: string;
    };
    partner: {
        partnerId: string;
        name: string;
    } | null;
    team: {
        teamId: string;
        name: string;
        description: string | null;
        lead?: {
            userId: string;
            name: string | null;
            email: string | null;
        } | null;
    } | null;
    assignments: ApiDealAssignment[];
    tasks: ApiDealTask[];
    documents: ApiDealDocument[];
    activities: Array<{ activityLogId: string; action: string; userName: string | null; createdAt: string }>;
}

export interface ApiDealsResponse {
    deals: ApiDeal[];
}

export interface CreateDealInput {
    partnerId: string;
    teamId?: string;
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

export interface ApiDealTask {
    dealTaskId: string;
    dealId: string;
    title: string;
    description: string | null;
    assigneeUserId: string | null;
    assigneeName?: string | null;
    status: 'todo' | 'in_progress' | 'done';
    dueDate: string | null;
    createdByUserId?: string | null;
    createdAt: string;
    updatedAt: string;
    completedAt?: string | null;
}

export interface CreateDealTaskInput {
    title: string;
    description?: string;
    assigneeUserId?: string;
    dueDate?: string;
}

export interface UpdateDealTaskInput {
    title?: string;
    description?: string | null;
    assigneeUserId?: string | null;
    status?: 'todo' | 'in_progress' | 'done';
    dueDate?: string | null;
}

export interface ApiDealDocument {
    dealDocumentId: string;
    dealId: string;
    fileName: string;
    fileUrl: string;
    visibility: 'shared' | 'internal';
    uploadedByUserId: string;
    uploaderName?: string | null;
    uploaderEmail?: string | null;
    uploadedAt: string;
}

export interface CreateDealDocumentInput {
    fileName: string;
    fileUrl: string;
    visibility?: 'shared' | 'internal';
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

export async function deleteDeal(
    orgId: string,
    dealId: string
): Promise<{ success: boolean }> {
    const response = await fetch(`${API_BASE}/deals/${dealId}`, {
        method: 'DELETE',
        credentials: 'include',
        headers: buildHeaders(orgId),
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete deal');
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
    dealMessageId: string;
    dealId: string;
    senderUserId: string;
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

export async function getDealTasks(
    orgId: string,
    dealId: string
): Promise<{ tasks: ApiDealTask[] }> {
    const response = await fetch(`${API_BASE}/deals/${dealId}/tasks`, {
        method: 'GET',
        credentials: 'include',
        headers: buildHeaders(orgId),
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to fetch tasks');
    }

    return response.json();
}

export async function createDealTask(
    orgId: string,
    dealId: string,
    input: CreateDealTaskInput
): Promise<{ task: ApiDealTask }> {
    const response = await fetch(`${API_BASE}/deals/${dealId}/tasks`, {
        method: 'POST',
        credentials: 'include',
        headers: buildHeaders(orgId),
        body: JSON.stringify(input),
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create task');
    }

    return response.json();
}

export async function updateDealTask(
    orgId: string,
    dealId: string,
    taskId: string,
    input: UpdateDealTaskInput
): Promise<{ task: ApiDealTask }> {
    const response = await fetch(`${API_BASE}/deals/${dealId}/tasks/${taskId}`, {
        method: 'PATCH',
        credentials: 'include',
        headers: buildHeaders(orgId),
        body: JSON.stringify(input),
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update task');
    }

    return response.json();
}

export async function deleteDealTask(
    orgId: string,
    dealId: string,
    taskId: string
): Promise<{ success: boolean }> {
    const response = await fetch(`${API_BASE}/deals/${dealId}/tasks/${taskId}`, {
        method: 'DELETE',
        credentials: 'include',
        headers: buildHeaders(orgId),
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete task');
    }

    return response.json();
}

export async function getDealDocuments(
    orgId: string,
    dealId: string
): Promise<{ documents: ApiDealDocument[] }> {
    const response = await fetch(`${API_BASE}/deals/${dealId}/documents`, {
        method: 'GET',
        credentials: 'include',
        headers: buildHeaders(orgId),
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to fetch deal documents');
    }

    return response.json();
}

export async function createDealDocument(
    orgId: string,
    dealId: string,
    input: CreateDealDocumentInput
): Promise<{ document: ApiDealDocument }> {
    const response = await fetch(`${API_BASE}/deals/${dealId}/documents`, {
        method: 'POST',
        credentials: 'include',
        headers: buildHeaders(orgId),
        body: JSON.stringify(input),
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to upload deal document');
    }

    return response.json();
}

export async function deleteDealDocument(
    orgId: string,
    dealId: string,
    documentId: string
): Promise<{ success: boolean }> {
    const response = await fetch(`${API_BASE}/deals/${dealId}/documents/${documentId}`, {
        method: 'DELETE',
        credentials: 'include',
        headers: buildHeaders(orgId),
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete deal document');
    }

    return response.json();
}
