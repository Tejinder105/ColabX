import { Router } from "express";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import { requireOrganization, requireRole } from "../middlewares/requireOrganization.js";
import { validate } from "../middlewares/validate.js";
import { requirePartner } from "../partners/partners.middleware.js";
import {
    createContactSchema,
    updateContactSchema,
} from "./contacts.validation.js";
import {
    createContactHandler,
    getPartnerContactsHandler,
    updateContactHandler,
    deleteContactHandler,
} from "./contacts.controller.js";

const router = Router();

// All contact routes require authentication
router.use(authMiddleware);

// ── Partner Contact Routes ──────────────────────────────────────────────────

// GET /api/partners/:partnerId/contacts
router.get(
    "/partners/:partnerId/contacts",
    requireOrganization,
    requirePartner,
    getPartnerContactsHandler
);

// POST /api/partners/:partnerId/contacts
router.post(
    "/partners/:partnerId/contacts",
    requireOrganization,
    requirePartner,
    requireRole("admin", "manager"),
    validate(createContactSchema),
    createContactHandler
);

// ── Direct Contact Routes ───────────────────────────────────────────────────

// PATCH /api/contacts/:contactId
router.patch(
    "/contacts/:contactId",
    requireOrganization,
    requireRole("admin", "manager"),
    validate(updateContactSchema),
    updateContactHandler
);

// DELETE /api/contacts/:contactId
router.delete(
    "/contacts/:contactId",
    requireOrganization,
    requireRole("admin", "manager"),
    deleteContactHandler
);

export default router;
