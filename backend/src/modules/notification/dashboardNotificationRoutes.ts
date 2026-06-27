import { Router } from "express";
import { getDashboardNotifications, markNotificationAsRead } from "./dashboardNotificationController";
import { authMiddleware } from "../../middleware/auth";

const router = Router();

router.get("/", authMiddleware as any, getDashboardNotifications as any);
router.patch("/:id/read", authMiddleware as any, markNotificationAsRead as any);

export default router;
