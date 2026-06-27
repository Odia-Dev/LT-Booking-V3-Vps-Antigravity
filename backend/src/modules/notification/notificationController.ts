import { Response } from "express";
import { prisma } from "../../config/db";
import { AuthenticatedRequest } from "../../middleware/auth";

export async function getNotifications(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    if (!req.admin) {
      res.status(401).json({ success: false, message: "Authentication required" });
      return;
    }

    const { role, phone, email } = req.admin;
    const whereClause: any = {};

    if (role === "CUSTOMER") {
      const conditions: any[] = [];
      if (phone) {
        const cleanPhone = phone.replace("+91", "").trim();
        conditions.push({ recipient: phone });
        conditions.push({ recipient: cleanPhone });
        conditions.push({ recipient: { contains: cleanPhone } });
      }
      if (email) {
        conditions.push({ recipient: email });
      }

      if (conditions.length === 0) {
        res.status(200).json({ success: true, notifications: [] });
        return;
      }
      whereClause.OR = conditions;
    } else {
      // Admin/Executive can filter or view all
      if (req.query.recipient) {
        whereClause.recipient = req.query.recipient as string;
      }
      if (req.query.bookingId) {
        whereClause.bookingId = req.query.bookingId as string;
      }
    }

    const notifications = await prisma.notificationLog.findMany({
      where: whereClause,
      orderBy: { createdAt: "desc" },
      take: 100,
    });

    res.status(200).json({ success: true, notifications });
  } catch (error: any) {
    console.error("Error retrieving notifications:", error);
    res.status(500).json({ success: false, message: error.message || "Internal server error" });
  }
}
