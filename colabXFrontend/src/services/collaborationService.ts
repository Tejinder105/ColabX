import { API_BASE } from '@/lib/api';

// ── Communications ──────────────────────────────────────────────────────────

export interface ApiCommunication {
    id: string;
    message: string;
    createdAt: string;
    senderId: string;
    senderName: string | null;
    senderEmail: string | null;
}

export interface CreateCommunicationInput {
    message: string;
}

// ── Documents ───────────────────────────────────────────────────────────────

export interface ApiDocument {
    id: string;
    partnerId?: string;
    partnerName?: string | null;
    fileName: string;
    fileUrl: string;
    visibility: string;
    uploadedAt: string;
    uploadedBy: string;
    uploaderName: string | null;
}

export interface CreateDocumentInput {
    fileName: string;
    fileUrl: string;
    visibility?: 'public' | 'private' | 'team';
}

// ── Activities ──────────────────────────────────────────────────────────────

export interface ApiActivity {
    id: string;
    action: string;
    createdAt: string;
    userId: string;
    userName: string | null;
}

function buildHeaders(orgId: string): HeadersInit {
    return {
        'Content-Type': 'application/json',
        'x-org-id': orgId,
    };
}

// ── Communications API ──────────────────────────────────────────────────────

// GET /api/partners/:partnerId/communications
export async function getPartnerCommunications(
    orgId: string,
    partnerId: string
): Promise<{ communications: ApiCommunication[] }> {
    const response = await fetch(`${API_BASE}/partners/${partnerId}/communications`, {
        method: 'GET',
        credentials: 'include',
        headers: buildHeaders(orgId),
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to fetch communications');
    }

    return response.json();
}

// POST /api/partners/:partnerId/communications
export async function createCommunication(
    orgId: string,
    partnerId: string,
    input: CreateCommunicationInput
): Promise<{ communication: ApiCommunication }> {
    const response = await fetch(`${API_BASE}/partners/${partnerId}/communications`, {
        method: 'POST',
        credentials: 'include',
        headers: buildHeaders(orgId),
        body: JSON.stringify(input),
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create communication');
    }

    return response.json();
}

// ── Documents API ───────────────────────────────────────────────────────────

// GET /api/partners/:partnerId/documents
export async function getPartnerDocuments(
    orgId: string,
    partnerId: string
): Promise<{ documents: ApiDocument[] }> {
    const response = await fetch(`${API_BASE}/partners/${partnerId}/documents`, {
        method: 'GET',
        credentials: 'include',
        headers: buildHeaders(orgId),
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to fetch documents');
    }

    return response.json();
}

// GET /api/documents
export async function getOrgDocuments(
    orgId: string
): Promise<{ documents: ApiDocument[] }> {
    const response = await fetch(`${API_BASE}/documents`, {
        method: 'GET',
        credentials: 'include',
        headers: buildHeaders(orgId),
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to fetch organization documents');
    }

    return response.json();
}

// POST /api/partners/:partnerId/documents
export async function createDocument(
    orgId: string,
    partnerId: string,
    input: CreateDocumentInput
): Promise<{ document: ApiDocument }> {
    const response = await fetch(`${API_BASE}/partners/${partnerId}/documents`, {
        method: 'POST',
        credentials: 'include',
        headers: buildHeaders(orgId),
        body: JSON.stringify(input),
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create document');
    }

    return response.json();
}

// DELETE /api/documents/:documentId
export async function deleteDocument(
    orgId: string,
    documentId: string
): Promise<{ document: ApiDocument }> {
    const response = await fetch(`${API_BASE}/documents/${documentId}`, {
        method: 'DELETE',
        credentials: 'include',
        headers: buildHeaders(orgId),
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete document');
    }

    return response.json();
}

// PATCH /api/documents/:documentId/visibility
export async function updateDocumentVisibility(
    orgId: string,
    documentId: string,
    visibility: 'public' | 'private' | 'team'
): Promise<{ document: ApiDocument }> {
    const response = await fetch(`${API_BASE}/documents/${documentId}/visibility`, {
        method: 'PATCH',
        credentials: 'include',
        headers: buildHeaders(orgId),
        body: JSON.stringify({ visibility }),
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update document visibility');
    }

    return response.json();
}

// ── Activities API ──────────────────────────────────────────────────────────

// GET /api/partners/:partnerId/activities
export async function getPartnerActivities(
    orgId: string,
    partnerId: string
): Promise<{ activities: ApiActivity[] }> {
    const response = await fetch(`${API_BASE}/partners/${partnerId}/activities`, {
        method: 'GET',
        credentials: 'include',
        headers: buildHeaders(orgId),
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to fetch activities');
    }

    return response.json();
}
