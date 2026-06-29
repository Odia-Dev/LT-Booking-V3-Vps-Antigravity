import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { loginSchema, forgotPasswordSchema, resetPasswordSchema } from "./authValidation";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { sendPasswordResetEmail } from "../../services/email/emailService";

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || "fallback_secret_key";
const JWT_EXPIRES_IN = "24h";

// Helper to set cookie
const setAuthCookie = (res: Response, token: string) => {
  res.cookie("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
  });
};

export const login = async (req: Request, res: Response) => {
  try {
    const parseResult = loginSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({ success: false, errors: parseResult.error.format() });
    }

    const { email, password } = parseResult.data;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }

    if (user.role === "CUSTOMER" && !user.isVerified) {
      return res.status(403).json({ success: false, message: "Account not verified. Please check your email." });
    }

    if (!user.passwordHash) {
      return res.status(401).json({ success: false, message: "Invalid credentials or account not set up" });
    }

    const isValidPassword = await bcrypt.compare(password, user.passwordHash);
    if (!isValidPassword) {
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { userId: user.id, role: user.role },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    setAuthCookie(res, token);

    res.status(200).json({
      success: true,
      message: "Logged in successfully",
      data: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      }
    });
  } catch (error: any) {
    console.error("Login error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const logout = (req: Request, res: Response) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
  });
  res.status(200).json({ success: true, message: "Logged out successfully" });
};

export const getMe = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.userId;
    if (!userId) {
      return res.status(401).json({ success: false, message: "Not authenticated" });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        phone: true,
        name: true,
        role: true,
        isVerified: true,
      }
    });

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    res.status(200).json({ success: true, data: user });
  } catch (error: any) {
    console.error("GetMe error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const verifyEmail = async (req: Request, res: Response) => {
  try {
    const { token, password } = req.body;
    if (!token) return res.status(400).json({ success: false, message: "Token is required" });
    if (!password || password.length < 6) return res.status(400).json({ success: false, message: "Password must be at least 6 characters" });

    const user = await prisma.user.findUnique({ where: { verificationToken: token } });
    
    if (!user || !user.verificationTokenExpires || user.verificationTokenExpires < new Date()) {
      return res.status(400).json({ success: false, message: "Invalid or expired token" });
    }

    const hash = await bcrypt.hash(password, 10);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        isVerified: true,
        passwordHash: hash,
        verificationToken: null,
        verificationTokenExpires: null,
      }
    });

    res.status(200).json({ success: true, message: "Account activated and password set successfully. You can now login." });
  } catch (error: any) {
    console.error("Verify email error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const forgotPassword = async (req: Request, res: Response) => {
  try {
    const parseResult = forgotPasswordSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({ success: false, errors: parseResult.error.format() });
    }

    const user = await prisma.user.findUnique({ where: { email: parseResult.data.email } });
    if (!user) {
      // Return 200 to avoid email enumeration
      return res.status(200).json({ success: true, message: "If the email exists, a reset link will be sent." });
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpires = new Date(Date.now() + 30 * 60 * 1000); // 30 mins

    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetPasswordToken: resetToken,
        resetPasswordExpires: resetTokenExpires
      }
    });

    await sendPasswordResetEmail(user.email!, user.name || "Customer", resetToken);

    res.status(200).json({ success: true, message: "If the email exists, a reset link will be sent." });
  } catch (error: any) {
    console.error("Forgot password error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const resetPassword = async (req: Request, res: Response) => {
  try {
    const parseResult = resetPasswordSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({ success: false, errors: parseResult.error.format() });
    }

    const { token, password } = parseResult.data;

    let user = await prisma.user.findUnique({ where: { resetPasswordToken: token } });
    
    if (user && user.resetPasswordExpires && user.resetPasswordExpires > new Date()) {
      const hash = await bcrypt.hash(password, 10);
      await prisma.user.update({
        where: { id: user.id },
        data: {
          passwordHash: hash,
          resetPasswordToken: null,
          resetPasswordExpires: null
        }
      });
      return res.status(200).json({ success: true, message: "Password reset successfully. You can now login." });
    }
    
    return res.status(400).json({ success: false, message: "Invalid or expired token" });

  } catch (error: any) {
    console.error("Reset password error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};
