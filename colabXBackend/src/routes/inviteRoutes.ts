import { Router } from "express";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import { requireOrganization, requireRole } from "../middlewares/requireOrganization.js";
import { validate } from "../middlewares/validate.js";
import { createInviteSchema } from "../schemas/validationSchemas.js";
import {
    createInvitation,
    validateInvitation,
    acceptInvitation,
} from "../controllers/inviteController.js";

const router = Router();

// Create invitation 
router.post("/", authMiddleware, requireOrganization, requireRole("admin", "manager"), validate(createInviteSchema), createInvitation);

// Validate invitation 
router.get("/:token", validateInvitation);

// Accept invitation 
router.post("/:token/accept", authMiddleware, acceptInvitation);

export default router;
