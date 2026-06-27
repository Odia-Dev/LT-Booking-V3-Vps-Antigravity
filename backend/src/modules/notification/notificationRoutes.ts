import { Router } from "express";
import { getNotifications } from "./notificationController";
import { authMiddleware } from "../../middleware/auth";

const router = Router();

router.get("/", authMiddleware as any, getNotifications as any);

export default router;
