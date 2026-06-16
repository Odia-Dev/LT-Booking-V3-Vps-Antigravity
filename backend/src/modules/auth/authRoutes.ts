import { Router } from "express";
import { sendOtp, verifyOtp, adminLogin, logout, getMe } from "./authController";
import { authMiddleware } from "../../middleware/auth";

const router = Router();

router.post("/send-otp", sendOtp);
router.post("/verify-otp", verifyOtp);
router.post("/login", adminLogin);
router.post("/logout", logout);
router.get("/me", authMiddleware as any, getMe);

export default router;
