import { Router } from "express";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import { requireOrganization, requireRole } from "../middlewares/requireOrganization.js";
import { validate } from "../middlewares/validate.js";
import { requirePartner } from "./partners.middleware.js";
import {
    createPartnerSchema,
    updatePartnerSchema,
} from "./partners.validation.js";
import {
    createPartnerHandler,
    getOrgPartnersHandler,
    getPartnerByIdHandler,
    updatePartnerHandler,
    deletePartnerHandler,
} from "./partners.controller.js";

const router = Router();

// All partner routes require authentication
router.use(authMiddleware);

// ── Partner CRUD ─────────────────────────────────────────────────────────────

router.post(
    "/",
    requireOrganization,
    requireRole("admin", "manager"),
    validate(createPartnerSchema),
    createPartnerHandler
);

router.get("/", requireOrganization, getOrgPartnersHandler);

router.get("/:partnerId", requireOrganization, requirePartner, getPartnerByIdHandler);

router.patch(
    "/:partnerId",
    requireOrganization,
    requirePartner,
    requireRole("admin", "manager"),
    validate(updatePartnerSchema),
    updatePartnerHandler
);

router.delete(
    "/:partnerId",
    requireOrganization,
    requirePartner,
    requireRole("admin", "manager"),
    deletePartnerHandler
);

export default router;
