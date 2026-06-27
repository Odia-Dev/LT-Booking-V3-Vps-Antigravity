import { Response } from "express";
import { prisma } from "../../config/db";
import { AuthenticatedRequest } from "../../middleware/auth";

export async function getDashboardNotifications(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    if (!req.admin?.id) {
      res.status(401).json({ success: false, message: "Unauthorized access" });
      return;
    }

    const userId = req.admin.id;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const search = (req.query.search as string) || "";
    const type = req.query.type as string;
    const status = req.query.status as string; // 'read', 'unread', or 'all'

    const where: any = { userId };

    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { content: { contains: search, mode: "insensitive" } },
      ];
    }

    if (type) {
      where.type = type;
    }

    if (status === "unread") {
      where.isRead = false;
    } else if (status === "read") {
      where.isRead = true;
    }

    const [notifications, total] = await Promise.all([
      prisma.notification.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.notification.count({ where }),
    ]);

    res.status(200).json({
      success: true,
      data: notifications,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    console.error("getDashboardNotifications error:", error);
    res.status(500).json({ success: false, message: error.message || "Failed to retrieve notifications" });
  }
}

export async function markNotificationAsRead(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    if (!req.admin?.id) {
      res.status(401).json({ success: false, message: "Unauthorized access" });
      return;
    }

    const { id } = req.params;

    const notification = await prisma.notification.findUnique({
      where: { id },
    });

    if (!notification) {
      res.status(404).json({ success: false, message: "Notification not found" });
      return;
    }

    if (notification.userId !== req.admin.id) {
      res.status(403).json({ success: false, message: "Forbidden: Access denied" });
      return;
    }

    const updated = await prisma.notification.update({
      where: { id },
      data: { isRead: true },
    });

    res.status(200).json({ success: true, notification: updated });
  } catch (error: any) {
    console.error("markNotificationAsRead error:", error);
    res.status(500).json({ success: false, message: error.message || "Failed to update notification" });
  }
}
