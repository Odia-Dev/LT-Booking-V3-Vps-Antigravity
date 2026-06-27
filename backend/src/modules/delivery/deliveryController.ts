import { Response } from "express";
import { prisma } from "../../config/db";
import { AuthenticatedRequest } from "../../middleware/auth";
import { DeliveryService } from "./deliveryService";
import {
  CreateDeliverySchema,
  UpdateDeliverySchema,
  UpdateStatusSchema,
  UpdateChecklistSchema,
} from "./deliveryValidation";

const service = new DeliveryService();

function hasAccessToDelivery(req: AuthenticatedRequest, delivery: any): boolean {
  if (!req.admin) return false;
  const { role, id, email } = req.admin;

  if (role === "ADMIN") return true;

  if (role === "SALES_EXECUTIVE" || role === "EXECUTIVE") {
    return (
      delivery.assignedExecutive === id ||
      delivery.assignedExecutive === email ||
      (delivery.assignedExecutive && email && delivery.assignedExecutive.toLowerCase() === email.toLowerCase())
    );
  }

  if (role === "CUSTOMER") {
    return delivery.customerId === id;
  }

  return false;
}

export async function getDeliveries(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    if (!req.admin) {
      res.status(401).json({ success: false, message: "Authentication required" });
      return;
    }

    const { role, id, email } = req.admin;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const search = (req.query.search as string) || "";
    const branchId = req.query.branchId as string;
    const executive = req.query.executive as string;
    const status = req.query.status as string;

    const where: any = {};

    // 1. RBAC Filtering
    if (role === "CUSTOMER") {
      where.customerId = id;
    } else if (role === "SALES_EXECUTIVE" || role === "EXECUTIVE") {
      where.OR = [
        { assignedExecutive: id },
        { assignedExecutive: email },
      ];
      if (email) {
        where.OR.push({ assignedExecutive: { contains: email, mode: "insensitive" } });
      }
    } else {
      // Admin filters
      if (branchId) where.branchId = branchId;
      if (executive) {
        where.assignedExecutive = { contains: executive, mode: "insensitive" };
      }
    }

    // 2. Extra Filters
    if (status) {
      where.status = status;
    }

    // 3. Search Filter
    if (search) {
      where.OR = [
        ...(where.OR || []),
        { booking: { bookingId: { contains: search, mode: "insensitive" } } },
        { customer: { name: { contains: search, mode: "insensitive" } } },
        { customer: { phone: { contains: search, mode: "insensitive" } } },
        { customer: { email: { contains: search, mode: "insensitive" } } },
      ];
    }

    const [deliveries, total] = await Promise.all([
      prisma.delivery.findMany({
        where,
        include: {
          booking: true,
          customer: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
            },
          },
          vehicle: { select: { name: true } },
          variant: { select: { name: true } },
          branch: { select: { name: true, city: true } },
          checklist: true,
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.delivery.count({ where }),
    ]);

    res.status(200).json({
      success: true,
      data: deliveries,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    console.error("getDeliveries error:", error);
    res.status(500).json({ success: false, message: error.message || "Failed to retrieve deliveries" });
  }
}

export async function getDeliveryById(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    if (!req.admin) {
      res.status(401).json({ success: false, message: "Authentication required" });
      return;
    }

    const delivery = await service.getDeliveryById(req.params.id);
    if (!delivery) {
      res.status(404).json({ success: false, message: "Delivery record not found" });
      return;
    }

    if (!hasAccessToDelivery(req, delivery)) {
      res.status(403).json({ success: false, message: "Forbidden: Access denied" });
      return;
    }

    res.status(200).json({ success: true, data: delivery });
  } catch (error: any) {
    console.error("getDeliveryById error:", error);
    res.status(550).json({ success: false, message: "Internal server error" });
  }
}

export async function createDelivery(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    if (!req.admin || req.admin.role !== "ADMIN") {
      res.status(403).json({ success: false, message: "Forbidden: Admins only" });
      return;
    }

    const parseResult = CreateDeliverySchema.safeParse(req.body);
    if (!parseResult.success) {
      res.status(400).json({ success: false, errors: parseResult.error.errors });
      return;
    }

    const schedDate = parseResult.data.scheduledDate ? new Date(parseResult.data.scheduledDate) : undefined;

    const delivery = await service.createDelivery({
      bookingId: parseResult.data.bookingId,
      customerId: parseResult.data.customerId,
      vehicleId: parseResult.data.vehicleId,
      variantId: parseResult.data.variantId,
      branchId: parseResult.data.branchId,
      assignedExecutive: parseResult.data.assignedExecutive || undefined,
      scheduledDate: schedDate,
      notes: parseResult.data.notes || undefined,
    });

    res.status(201).json({ success: true, message: "Delivery scheduled successfully", data: delivery });
  } catch (error: any) {
    console.error("createDelivery error:", error);
    res.status(400).json({ success: false, message: error.message || "Failed to schedule delivery" });
  }
}

export async function updateDelivery(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    if (!req.admin) {
      res.status(401).json({ success: false, message: "Authentication required" });
      return;
    }

    if (req.admin.role === "CUSTOMER") {
      res.status(403).json({ success: false, message: "Forbidden: Customers cannot update delivery details" });
      return;
    }

    const delivery = await service.getDeliveryById(req.params.id);
    if (!delivery) {
      res.status(404).json({ success: false, message: "Delivery record not found" });
      return;
    }

    if (!hasAccessToDelivery(req, delivery)) {
      res.status(403).json({ success: false, message: "Forbidden: Access denied" });
      return;
    }

    const parseResult = UpdateDeliverySchema.safeParse(req.body);
    if (!parseResult.success) {
      res.status(400).json({ success: false, errors: parseResult.error.errors });
      return;
    }

    const updateData: any = {};
    if (parseResult.data.assignedExecutive !== undefined) {
      updateData.assignedExecutive = parseResult.data.assignedExecutive;
    }
    if (parseResult.data.scheduledDate !== undefined) {
      updateData.scheduledDate = parseResult.data.scheduledDate ? new Date(parseResult.data.scheduledDate) : null;
    }
    if (parseResult.data.notes !== undefined) {
      updateData.notes = parseResult.data.notes;
    }

    const updated = await prisma.delivery.update({
      where: { id: req.params.id },
      data: updateData,
    });

    res.status(200).json({ success: true, message: "Delivery details updated successfully", data: updated });
  } catch (error: any) {
    console.error("updateDelivery error:", error);
    res.status(400).json({ success: false, message: error.message || "Failed to update delivery details" });
  }
}

export async function updateDeliveryStatus(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    if (!req.admin) {
      res.status(401).json({ success: false, message: "Authentication required" });
      return;
    }

    if (req.admin.role === "CUSTOMER") {
      res.status(403).json({ success: false, message: "Forbidden: Customers cannot update status" });
      return;
    }

    const delivery = await service.getDeliveryById(req.params.id);
    if (!delivery) {
      res.status(404).json({ success: false, message: "Delivery record not found" });
      return;
    }

    if (!hasAccessToDelivery(req, delivery)) {
      res.status(403).json({ success: false, message: "Forbidden: Access denied" });
      return;
    }

    const parseResult = UpdateStatusSchema.safeParse(req.body);
    if (!parseResult.success) {
      res.status(400).json({ success: false, errors: parseResult.error.errors });
      return;
    }

    const performer = req.admin.email || "SYSTEM";
    const updated = await service.updateDeliveryStatus(
      req.params.id,
      parseResult.data.status,
      parseResult.data.comment || undefined,
      performer
    );

    res.status(200).json({ success: true, message: "Delivery status updated successfully", data: updated });
  } catch (error: any) {
    console.error("updateDeliveryStatus error:", error);
    res.status(400).json({ success: false, message: error.message || "Failed to update delivery status" });
  }
}

export async function updateDeliveryChecklist(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    if (!req.admin) {
      res.status(401).json({ success: false, message: "Authentication required" });
      return;
    }

    if (req.admin.role === "CUSTOMER") {
      res.status(403).json({ success: false, message: "Forbidden: Customers cannot modify checklist" });
      return;
    }

    const delivery = await service.getDeliveryById(req.params.id);
    if (!delivery) {
      res.status(404).json({ success: false, message: "Delivery record not found" });
      return;
    }

    if (!hasAccessToDelivery(req, delivery)) {
      res.status(403).json({ success: false, message: "Forbidden: Access denied" });
      return;
    }

    const parseResult = UpdateChecklistSchema.safeParse(req.body);
    if (!parseResult.success) {
      res.status(400).json({ success: false, errors: parseResult.error.errors });
      return;
    }

    const performer = req.admin.email || "SYSTEM";
    const updated = await service.updateChecklist(req.params.id, parseResult.data, performer);

    res.status(200).json({ success: true, message: "Delivery checklist updated successfully", data: updated });
  } catch (error: any) {
    console.error("updateDeliveryChecklist error:", error);
    res.status(400).json({ success: false, message: error.message || "Failed to update delivery checklist" });
  }
}

export async function deleteDelivery(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    if (!req.admin || req.admin.role !== "ADMIN") {
      res.status(403).json({ success: false, message: "Forbidden: Admins only" });
      return;
    }

    const delivery = await prisma.delivery.findUnique({ where: { id: req.params.id } });
    if (!delivery) {
      res.status(404).json({ success: false, message: "Delivery record not found" });
      return;
    }

    await prisma.delivery.delete({ where: { id: req.params.id } });

    res.status(200).json({ success: true, message: "Delivery record deleted successfully" });
  } catch (error: any) {
    console.error("deleteDelivery error:", error);
    res.status(500).json({ success: false, message: "Failed to delete delivery record" });
  }
}
