import { Router } from "express";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import { requireOrganization } from "../middlewares/requireOrganization.js";
import { getReportsDashboardHandler } from "./reports.controller.js";

const router = Router();

router.use(authMiddleware);

router.get("/dashboard", requireOrganization, getReportsDashboardHandler);

export default router;