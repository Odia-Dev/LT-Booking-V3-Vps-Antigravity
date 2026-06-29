import { Router } from "express";
import { login, logout, getMe, verifyEmail, forgotPassword, resetPassword } from "./authController";
import { authMiddleware } from "../../middleware/auth";

const router = Router();

router.post("/login", login);
router.post("/verify-email", verifyEmail);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);
router.post("/logout", logout);
router.get("/me", authMiddleware as any, getMe);

export default router;
