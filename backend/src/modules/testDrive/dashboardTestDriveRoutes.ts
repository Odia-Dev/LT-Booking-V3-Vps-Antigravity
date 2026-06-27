import { Router } from "express";
import { getTestDrives } from "./testDriveController";
import { authMiddleware } from "../../middleware/auth";

const router = Router();

router.get("/", authMiddleware as any, getTestDrives as any);

export default router;
