import { Router } from "express";
import { getDashboardProfile, updateDashboardProfile } from "./dashboardProfileController";
import { authMiddleware } from "../../middleware/auth";

const router = Router();

router.get("/", authMiddleware as any, getDashboardProfile as any);
router.patch("/", authMiddleware as any, updateDashboardProfile as any);

export default router;
