import { Router } from "express";
import { getDashboardAnalytics } from "./analyticsController";
import { authMiddleware, requireRole } from "../../middleware/auth";

const router = Router();

// /api/admin/analytics
router.get("/admin/analytics", authMiddleware, requireRole(["ADMIN", "EXECUTIVE"]), getDashboardAnalytics);

export default router;
