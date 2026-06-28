import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { createInventoryItemSchema, updateInventoryItemSchema } from "./inventoryValidation";

const prisma = new PrismaClient();

// POST /api/admin/inventory
export const addInventoryStock = async (req: Request, res: Response) => {
  try {
    const parseResult = createInventoryItemSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({ success: false, errors: parseResult.error.format() });
    }

    // Check if VIN already exists
    const existing = await prisma.inventoryItem.findUnique({ where: { vin: parseResult.data.vin } });
    if (existing) {
      return res.status(400).json({ success: false, message: "VIN already exists in inventory" });
    }

    const item = await prisma.inventoryItem.create({
      data: parseResult.data,
      include: {
        vehicle: true,
        variant: true,
        color: true,
        branch: true
      }
    });

    res.status(201).json({ success: true, message: "Inventory stock added", data: item });
  } catch (error: any) {
    console.error("addInventoryStock error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// GET /api/admin/inventory
export const getInventory = async (req: Request, res: Response) => {
  try {
    const { branchId, status, vehicleId } = req.query;
    
    let filters: any = {};
    if (branchId) filters.branchId = branchId as string;
    if (status) filters.status = status as string;
    if (vehicleId) filters.vehicleId = vehicleId as string;

    const inventory = await prisma.inventoryItem.findMany({
      where: filters,
      include: {
        vehicle: true,
        variant: true,
        color: true,
        branch: true
      },
      orderBy: { receivedAt: "desc" }
    });

    res.status(200).json({ success: true, data: inventory });
  } catch (error: any) {
    console.error("getInventory error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// GET /api/admin/inventory/alerts (Dashboard Alerts)
export const getInventoryAlerts = async (req: Request, res: Response) => {
  try {
    // 1. Aging Inventory: Vehicles in stock > 90 days
    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

    const agingInventory = await prisma.inventoryItem.findMany({
      where: {
        status: "AVAILABLE",
        receivedAt: { lt: ninetyDaysAgo }
      },
      include: { vehicle: true, branch: true }
    });

    // 2. Low Stock Alerts: Vehicles with < 3 available units
    const stockSummary = await prisma.inventoryItem.groupBy({
      by: ['vehicleId'],
      where: { status: "AVAILABLE" },
      _count: { id: true }
    });

    const lowStockVehicleIds = stockSummary.filter(s => s._count.id < 3).map(s => s.vehicleId);
    const lowStockVehicles = await prisma.vehicle.findMany({
      where: { id: { in: lowStockVehicleIds } }
    });

    const lowStockAlerts = lowStockVehicles.map(v => {
      const count = stockSummary.find(s => s.vehicleId === v.id)?._count.id || 0;
      return { vehicle: v.name, count };
    });

    res.status(200).json({
      success: true,
      data: {
        agingInventory,
        lowStockAlerts
      }
    });
  } catch (error: any) {
    console.error("getInventoryAlerts error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// PATCH /api/admin/inventory/:id
export const updateInventoryStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const parseResult = updateInventoryItemSchema.safeParse(req.body);

    if (!parseResult.success) {
      return res.status(400).json({ success: false, errors: parseResult.error.format() });
    }

    const item = await prisma.inventoryItem.update({
      where: { id },
      data: parseResult.data,
      include: {
        vehicle: true,
        variant: true,
        color: true,
        branch: true
      }
    });

    res.status(200).json({ success: true, message: "Inventory updated", data: item });
  } catch (error: any) {
    console.error("updateInventoryStatus error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// GET /api/public/inventory/status (Frontend: In Stock / Out of Stock / Limited)
export const getPublicInventoryStatus = async (req: Request, res: Response) => {
  try {
    const { vehicleId, variantId, colorId, branchId } = req.query;

    if (!vehicleId) {
      return res.status(400).json({ success: false, message: "Vehicle ID is required" });
    }

    let filters: any = {
      vehicleId: vehicleId as string,
      status: "AVAILABLE"
    };

    if (variantId) filters.variantId = variantId as string;
    if (colorId) filters.colorId = colorId as string;
    if (branchId) filters.branchId = branchId as string;

    const availableCount = await prisma.inventoryItem.count({ where: filters });

    let status = "OUT_OF_STOCK";
    if (availableCount >= 5) status = "IN_STOCK";
    else if (availableCount > 0) status = "LIMITED_STOCK";

    res.status(200).json({
      success: true,
      data: {
        availableQuantity: availableCount,
        statusLabel: status // IN_STOCK, LIMITED_STOCK, OUT_OF_STOCK
      }
    });
  } catch (error: any) {
    console.error("getPublicInventoryStatus error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};
