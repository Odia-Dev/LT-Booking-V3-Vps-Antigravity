import { Router } from "express";
import { getProfile, updateProfile } from "./profileController";
import { authMiddleware } from "../../middleware/auth";

const router = Router();

router.get("/", authMiddleware as any, getProfile);
router.put("/", authMiddleware as any, updateProfile);

export default router;
