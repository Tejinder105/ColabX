import type { Response } from "express";
import type { AuthRequest } from "../middlewares/authMiddleware.js";
import {
    createContact,
    getPartnerContacts,
    getContactById,
    updateContact,
    deleteContact,
} from "./contacts.service.js";

// POST /api/partners/:partnerId/contacts
export async function createContactHandler(
    req: AuthRequest,
    res: Response
): Promise<void> {
    try {
        if (!req.org || !req.user || !req.partner) {
            res.status(401).json({ error: "Unauthorized" });
            return;
        }

        const created = await createContact(
            req.org.organizationId,
            req.partner.partnerId,
            req.user.id,
            req.body
        );
        res.status(201).json({ contact: created });
    } catch (error) {
        console.error("Create contact error:", error);
        res.status(500).json({ error: "Failed to create contact" });
    }
}

// GET /api/partners/:partnerId/contacts
export async function getPartnerContactsHandler(
    req: AuthRequest,
    res: Response
): Promise<void> {
    try {
        if (!req.partner) {
            res.status(404).json({ error: "Partner not found" });
            return;
        }

        const contacts = await getPartnerContacts(req.partner.partnerId);
        res.json({ contacts });
    } catch (error) {
        console.error("Get contacts error:", error);
        res.status(500).json({ error: "Failed to fetch contacts" });
    }
}

// PATCH /api/contacts/:contactId
export async function updateContactHandler(
    req: AuthRequest,
    res: Response
): Promise<void> {
    try {
        if (!req.org) {
            res.status(403).json({ error: "Access denied" });
            return;
        }

        const contactId = req.params.contactId as string;
        const existing = await getContactById(contactId, req.org.organizationId);

        if (!existing) {
            res.status(404).json({ error: "Contact not found" });
            return;
        }

        const updates: Record<string, string | boolean | null> = {};
        if (req.body.name !== undefined) updates.name = req.body.name;
        if (req.body.email !== undefined) updates.email = req.body.email;
        if (req.body.phone !== undefined) updates.phone = req.body.phone;
        if (req.body.role !== undefined) updates.role = req.body.role;
        if (req.body.isPrimary !== undefined) updates.isPrimary = req.body.isPrimary;

        if (Object.keys(updates).length === 0) {
            res.status(400).json({ error: "No fields to update" });
            return;
        }

        const updated = await updateContact(contactId, updates);
        res.json({ contact: updated });
    } catch (error) {
        console.error("Update contact error:", error);
        res.status(500).json({ error: "Failed to update contact" });
    }
}

// DELETE /api/contacts/:contactId
export async function deleteContactHandler(
    req: AuthRequest,
    res: Response
): Promise<void> {
    try {
        if (!req.org) {
            res.status(403).json({ error: "Access denied" });
            return;
        }

        const contactId = req.params.contactId as string;
        const existing = await getContactById(contactId, req.org.organizationId);

        if (!existing) {
            res.status(404).json({ error: "Contact not found" });
            return;
        }

        const deleted = await deleteContact(contactId);
        res.json({ contact: deleted });
    } catch (error) {
        console.error("Delete contact error:", error);
        res.status(500).json({ error: "Failed to delete contact" });
    }
}
