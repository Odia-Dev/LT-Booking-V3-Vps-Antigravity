import { Request, Response } from "express";
import { AuthService } from "./authService";
import { sendOtpSchema, verifyOtpSchema, adminLoginSchema } from "./authValidation";
import { AuthenticatedRequest } from "../../middleware/auth";

const service = new AuthService();

export async function sendOtp(req: Request, res: Response): Promise<void> {
  try {
    const parseResult = sendOtpSchema.safeParse(req.body);
    if (!parseResult.success) {
      res.status(400).json({ success: false, errors: parseResult.error.errors });
      return;
    }

    const { phone } = parseResult.data;
    const code = await service.sendOtp(phone);

    res.status(200).json({
      success: true,
      message: "OTP sent successfully",
      // Include code in response ONLY in development to facilitate testing/demo
      code: process.env.NODE_ENV !== "production" ? code : undefined,
    });
  } catch (error: any) {
    console.error("sendOtp error:", error);
    res.status(500).json({ success: false, message: error.message || "Internal server error" });
  }
}

export async function verifyOtp(req: Request, res: Response): Promise<void> {
  try {
    const parseResult = verifyOtpSchema.safeParse(req.body);
    if (!parseResult.success) {
      res.status(400).json({ success: false, errors: parseResult.error.errors });
      return;
    }

    const { phone, code } = parseResult.data;
    const { token, user } = await service.verifyOtp(phone, code);

    res.cookie("admin_session", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.status(200).json({
      success: true,
      message: "OTP verified, login successful",
      user: { id: user.id, phone: user.phone, role: user.role, name: user.name },
    });
  } catch (error: any) {
    console.error("verifyOtp error:", error);
    res.status(400).json({ success: false, message: error.message || "Invalid OTP verification attempt" });
  }
}

export async function adminLogin(req: Request, res: Response): Promise<void> {
  try {
    const parseResult = adminLoginSchema.safeParse(req.body);
    if (!parseResult.success) {
      res.status(400).json({ success: false, errors: parseResult.error.errors });
      return;
    }

    const { email, password } = parseResult.data;
    const { token, user } = await service.adminLogin(email, password);

    res.cookie("admin_session", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    });

    res.status(200).json({
      success: true,
      message: "Admin logged in successfully",
      user: { id: user.id, email: user.email, role: user.role, name: user.name },
    });
  } catch (error: any) {
    console.error("adminLogin error:", error);
    res.status(401).json({ success: false, message: error.message || "Invalid credentials" });
  }
}

export async function logout(req: Request, res: Response): Promise<void> {
  res.clearCookie("admin_session", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
  });
  res.status(200).json({ success: true, message: "Logged out successfully" });
}

export async function getMe(req: AuthenticatedRequest, res: Response): Promise<void> {
  if (!req.admin) {
    res.status(401).json({ success: false, message: "Not authenticated" });
    return;
  }
  res.status(200).json({ success: true, user: req.admin });
}
