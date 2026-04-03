import { Router } from "express";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import { validate } from "../middlewares/validate.js";
import { createInviteSchema } from "../schemas/validationSchemas.js";
import {
    createInvitation,
    validateInvitation,
    acceptInvitation,
} from "../controllers/inviteController.js";

const router = Router();

// Create invitation (requires auth + validation)
router.post("/", authMiddleware, validate(createInviteSchema), createInvitation);

// Validate invitation (no auth required)
router.get("/:token", validateInvitation);

// Accept invitation (requires auth)
router.post("/:token/accept", authMiddleware, acceptInvitation);

export default router;
