import type { Response } from "express";
import type { AuthRequest } from "../middlewares/authMiddleware.js";
import {
    createCommunication,
    getPartnerCommunications,
    createDocument,
    getPartnerDocuments,
    getOrgDocuments,
    getDocumentById,
    updateDocumentVisibility,
    deleteDocument,
    getPartnerActivities,
} from "./collaboration.service.js";

// ── Communications ──────────────────────────────────────────────────────────

// POST /api/partners/:partnerId/communications
export async function createCommunicationHandler(
    req: AuthRequest,
    res: Response
): Promise<void> {
    try {
        if (!req.org || !req.user || !req.partner) {
            res.status(401).json({ error: "Unauthorized" });
            return;
        }

        const created = await createCommunication(
            req.org.id,
            req.partner.id,
            req.user.id,
            req.body.message
        );
        res.status(201).json({ communication: created });
    } catch (error) {
        console.error("Create communication error:", error);
        res.status(500).json({ error: "Failed to create communication" });
    }
}

// GET /api/partners/:partnerId/communications
export async function getPartnerCommunicationsHandler(
    req: AuthRequest,
    res: Response
): Promise<void> {
    try {
        if (!req.partner) {
            res.status(404).json({ error: "Partner not found" });
            return;
        }

        const communications = await getPartnerCommunications(req.partner.id);
        res.json({ communications });
    } catch (error) {
        console.error("Get communications error:", error);
        res.status(500).json({ error: "Failed to fetch communications" });
    }
}

// ── Documents ───────────────────────────────────────────────────────────────

// POST /api/partners/:partnerId/documents
export async function createDocumentHandler(
    req: AuthRequest,
    res: Response
): Promise<void> {
    try {
        if (!req.org || !req.user || !req.partner) {
            res.status(401).json({ error: "Unauthorized" });
            return;
        }

        const created = await createDocument(
            req.org.id,
            req.partner.id,
            req.user.id,
            req.body
        );
        res.status(201).json({ document: created });
    } catch (error) {
        console.error("Create document error:", error);
        res.status(500).json({ error: "Failed to create document" });
    }
}

// GET /api/partners/:partnerId/documents
export async function getPartnerDocumentsHandler(
    req: AuthRequest,
    res: Response
): Promise<void> {
    try {
        if (!req.partner) {
            res.status(404).json({ error: "Partner not found" });
            return;
        }

        const documents = await getPartnerDocuments(req.partner.id);
        res.json({ documents });
    } catch (error) {
        console.error("Get documents error:", error);
        res.status(500).json({ error: "Failed to fetch documents" });
    }
}

// GET /api/documents
export async function getOrgDocumentsHandler(
    req: AuthRequest,
    res: Response
): Promise<void> {
    try {
        if (!req.org) {
            res.status(403).json({ error: "Access denied" });
            return;
        }

        const documents = await getOrgDocuments(req.org.id);
        res.json({ documents });
    } catch (error) {
        console.error("Get org documents error:", error);
        res.status(500).json({ error: "Failed to fetch documents" });
    }
}

// PATCH /api/documents/:documentId/visibility
export async function updateDocumentVisibilityHandler(
    req: AuthRequest,
    res: Response
): Promise<void> {
    try {
        if (!req.org) {
            res.status(403).json({ error: "Access denied" });
            return;
        }

        const documentId = req.params.documentId as string;
        const existing = await getDocumentById(documentId, req.org.id);

        if (!existing) {
            res.status(404).json({ error: "Document not found" });
            return;
        }

        const updated = await updateDocumentVisibility(documentId, req.body.visibility);
        res.json({ document: updated });
    } catch (error) {
        console.error("Update document visibility error:", error);
        res.status(500).json({ error: "Failed to update document visibility" });
    }
}

// DELETE /api/documents/:documentId
export async function deleteDocumentHandler(
    req: AuthRequest,
    res: Response
): Promise<void> {
    try {
        if (!req.org) {
            res.status(403).json({ error: "Access denied" });
            return;
        }

        const documentId = req.params.documentId as string;
        const existing = await getDocumentById(documentId, req.org.id);

        if (!existing) {
            res.status(404).json({ error: "Document not found" });
            return;
        }

        const deleted = await deleteDocument(documentId);
        res.json({ document: deleted });
    } catch (error) {
        console.error("Delete document error:", error);
        res.status(500).json({ error: "Failed to delete document" });
    }
}

// ── Activities ──────────────────────────────────────────────────────────────

// GET /api/partners/:partnerId/activities
export async function getPartnerActivitiesHandler(
    req: AuthRequest,
    res: Response
): Promise<void> {
    try {
        if (!req.partner) {
            res.status(404).json({ error: "Partner not found" });
            return;
        }

        const activities = await getPartnerActivities(req.partner.id);
        res.json({ activities });
    } catch (error) {
        console.error("Get activities error:", error);
        res.status(500).json({ error: "Failed to fetch activities" });
    }
}
