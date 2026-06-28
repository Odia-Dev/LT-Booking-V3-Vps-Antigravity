import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { createInsuranceInquirySchema, updateInsuranceInquirySchema } from "./insuranceValidation";

const prisma = new PrismaClient();

// POST /api/public/insurance
export const createInsuranceInquiry = async (req: Request, res: Response) => {
  try {
    const parseResult = createInsuranceInquirySchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({ success: false, errors: parseResult.error.format() });
    }

    const { name, email, phone, vehicleSelection, existingPolicyProvider, policyType, preferredContactTime, notes } = parseResult.data;

    // Check if customer is logged in to link inquiry
    const customerId = (req as any).user?.id; // Optional: user might be authenticated

    const inquiry = await prisma.insuranceInquiry.create({
      data: {
        name,
        email,
        phone,
        vehicleSelection,
        existingPolicyProvider,
        policyType,
        preferredContactTime,
        notes,
        customerId,
      },
    });

    res.status(201).json({ success: true, message: "Insurance inquiry created successfully", data: inquiry });
  } catch (error: any) {
    console.error("createInsuranceInquiry error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// GET /api/admin/insurance
export const getAdminInquiries = async (req: Request, res: Response) => {
  try {
    // Only Admin or Executives should access this
    const inquiries = await prisma.insuranceInquiry.findMany({
      orderBy: { createdAt: "desc" },
    });

    res.status(200).json({ success: true, data: inquiries });
  } catch (error: any) {
    console.error("getAdminInquiries error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// PATCH /api/admin/insurance/:id
export const updateInsuranceInquiry = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const parseResult = updateInsuranceInquirySchema.safeParse(req.body);

    if (!parseResult.success) {
      return res.status(400).json({ success: false, errors: parseResult.error.format() });
    }

    const inquiry = await prisma.insuranceInquiry.update({
      where: { id },
      data: parseResult.data,
    });

    res.status(200).json({ success: true, message: "Inquiry updated successfully", data: inquiry });
  } catch (error: any) {
    console.error("updateInsuranceInquiry error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// GET /api/insurance/my-inquiries (For Customer Dashboard)
export const getCustomerInquiries = async (req: Request, res: Response) => {
  try {
    const customerId = (req as any).user?.id;
    if (!customerId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const inquiries = await prisma.insuranceInquiry.findMany({
      where: { customerId },
      orderBy: { createdAt: "desc" },
    });

    res.status(200).json({ success: true, data: inquiries });
  } catch (error: any) {
    console.error("getCustomerInquiries error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};
