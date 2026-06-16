import { Response } from "express";
import { ProfileService } from "./profileService";
import { updateProfileSchema } from "./profileValidation";
import { AuthenticatedRequest } from "../../middleware/auth";

const service = new ProfileService();

export async function getProfile(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    if (!req.admin?.id) {
      res.status(401).json({ success: false, message: "Unauthorized access" });
      return;
    }

    const profile = await service.getProfile(req.admin.id);
    res.status(200).json({
      success: true,
      profile: {
        id: profile.id,
        name: profile.name,
        email: profile.email,
        phone: profile.phone,
        city: profile.city,
        state: profile.state,
        role: profile.role,
      },
    });
  } catch (error: any) {
    console.error("getProfile error:", error);
    res.status(404).json({ success: false, message: error.message || "User profile not found" });
  }
}

export async function updateProfile(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    if (!req.admin?.id) {
      res.status(401).json({ success: false, message: "Unauthorized access" });
      return;
    }

    const parseResult = updateProfileSchema.safeParse(req.body);
    if (!parseResult.success) {
      res.status(400).json({ success: false, errors: parseResult.error.errors });
      return;
    }

    const profile = await service.updateProfile(req.admin.id, parseResult.data);
    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      profile: {
        id: profile.id,
        name: profile.name,
        email: profile.email,
        phone: profile.phone,
        city: profile.city,
        state: profile.state,
        role: profile.role,
      },
    });
  } catch (error: any) {
    console.error("updateProfile error:", error);
    const msg = error.message && !error.message.includes("Prisma") ? error.message : "Failed to update profile. Please try again.";
    res.status(400).json({ success: false, message: msg });
  }
}
