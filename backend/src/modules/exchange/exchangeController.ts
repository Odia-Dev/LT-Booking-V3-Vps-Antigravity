import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { createExchangeInquirySchema, updateExchangeInquirySchema } from "./exchangeValidation";
import path from "path";

const prisma = new PrismaClient();

// POST /api/public/exchange
export const createExchangeInquiry = async (req: Request, res: Response) => {
  try {
    // req.body could have strings from multipart/form-data, so we need to parse numbers
    const payload = {
      ...req.body,
      year: req.body.year ? parseInt(req.body.year, 10) : undefined,
      kmDriven: req.body.kmDriven ? parseInt(req.body.kmDriven, 10) : undefined,
      expectedValue: req.body.expectedValue ? parseFloat(req.body.expectedValue) : undefined,
    };

    const parseResult = createExchangeInquirySchema.safeParse(payload);
    if (!parseResult.success) {
      return res.status(400).json({ success: false, errors: parseResult.error.format() });
    }

    const customerId = (req as any).user?.id;
    const files = req.files as Express.Multer.File[];
    
    // Process uploaded image paths
    const images = files ? files.map(f => `/uploads/exchange/${f.filename}`) : [];

    const inquiry = await prisma.exchangeInquiry.create({
      data: {
        ...parseResult.data,
        images: images.length > 0 ? images : undefined,
        customerId,
      },
    });

    res.status(201).json({ success: true, message: "Exchange inquiry submitted successfully", data: inquiry });
  } catch (error: any) {
    console.error("createExchangeInquiry error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// GET /api/admin/exchange
export const getAdminInquiries = async (req: Request, res: Response) => {
  try {
    const inquiries = await prisma.exchangeInquiry.findMany({
      orderBy: { createdAt: "desc" },
    });
    res.status(200).json({ success: true, data: inquiries });
  } catch (error: any) {
    console.error("getAdminExchangeInquiries error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// PATCH /api/admin/exchange/:id
export const updateExchangeInquiry = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const parseResult = updateExchangeInquirySchema.safeParse(req.body);

    if (!parseResult.success) {
      return res.status(400).json({ success: false, errors: parseResult.error.format() });
    }

    const inquiry = await prisma.exchangeInquiry.update({
      where: { id },
      data: parseResult.data,
    });

    res.status(200).json({ success: true, message: "Exchange inquiry updated", data: inquiry });
  } catch (error: any) {
    console.error("updateExchangeInquiry error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// GET /api/exchange/my-inquiries (For Customer Dashboard)
export const getCustomerInquiries = async (req: Request, res: Response) => {
  try {
    const customerId = (req as any).user?.id || (req as any).admin?.id;
    if (!customerId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const inquiries = await prisma.exchangeInquiry.findMany({
      where: { customerId },
      orderBy: { createdAt: "desc" },
    });

    res.status(200).json({ success: true, data: inquiries });
  } catch (error: any) {
    console.error("getCustomerExchangeInquiries error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};
