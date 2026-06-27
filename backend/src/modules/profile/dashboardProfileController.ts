import { Response } from "express";
import { prisma } from "../../config/db";
import { AuthenticatedRequest } from "../../middleware/auth";
import { z } from "zod";

const updateDashboardProfileSchema = z.object({
  name: z.string().min(1, "Name cannot be empty").optional(),
  city: z.string().optional().nullable(),
  state: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
  preferredBranchId: z.string().optional().nullable(),
  communicationPreferences: z.object({
    email: z.boolean().optional(),
    sms: z.boolean().optional(),
    whatsapp: z.boolean().optional(),
  }).optional().nullable(),
});

export async function getDashboardProfile(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    if (!req.admin?.id) {
      res.status(401).json({ success: false, message: "Unauthorized access" });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { id: req.admin.id },
      include: {
        preferredBranch: true,
      },
    });

    if (!user) {
      res.status(404).json({ success: false, message: "User not found" });
      return;
    }

    res.status(200).json({
      success: true,
      profile: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        city: user.city,
        state: user.state,
        address: user.address,
        preferredBranchId: user.preferredBranchId,
        preferredBranch: (user as any).preferredBranch || null,
        communicationPreferences: user.communicationPreferences || { email: true, sms: true, whatsapp: true },
      },
    });
  } catch (error: any) {
    console.error("getDashboardProfile error:", error);
    res.status(500).json({ success: false, message: error.message || "Failed to retrieve profile" });
  }
}

export async function updateDashboardProfile(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    if (!req.admin?.id) {
      res.status(401).json({ success: false, message: "Unauthorized access" });
      return;
    }

    // Prevent direct payload modification of email or phone
    if ("email" in req.body || "phone" in req.body) {
      res.status(400).json({
        success: false,
        message: "Modifying registered email or verified phone is not allowed.",
      });
      return;
    }

    const parseResult = updateDashboardProfileSchema.safeParse(req.body);
    if (!parseResult.success) {
      res.status(400).json({ success: false, errors: parseResult.error.errors });
      return;
    }

    const updateData: any = {};
    if (parseResult.data.name !== undefined) updateData.name = parseResult.data.name;
    if (parseResult.data.city !== undefined) updateData.city = parseResult.data.city;
    if (parseResult.data.state !== undefined) updateData.state = parseResult.data.state;
    if (parseResult.data.address !== undefined) updateData.address = parseResult.data.address;
    if (parseResult.data.preferredBranchId !== undefined) updateData.preferredBranchId = parseResult.data.preferredBranchId;
    if (parseResult.data.communicationPreferences !== undefined) {
      updateData.communicationPreferences = parseResult.data.communicationPreferences;
    }

    const updatedUser = await prisma.user.update({
      where: { id: req.admin.id },
      data: updateData,
      include: {
        preferredBranch: true,
      },
    });

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      profile: {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        phone: updatedUser.phone,
        city: updatedUser.city,
        state: updatedUser.state,
        address: updatedUser.address,
        preferredBranchId: updatedUser.preferredBranchId,
        preferredBranch: (updatedUser as any).preferredBranch || null,
        communicationPreferences: updatedUser.communicationPreferences || { email: true, sms: true, whatsapp: true },
      },
    });
  } catch (error: any) {
    console.error("updateDashboardProfile error:", error);
    const msg = error.message && !error.message.includes("Prisma") ? error.message : "Failed to update profile settings.";
    res.status(400).json({ success: false, message: msg });
  }
}
