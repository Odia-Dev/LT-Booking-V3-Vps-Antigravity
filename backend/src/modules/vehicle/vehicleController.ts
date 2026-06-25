import { Request, Response } from "express";
import { VehicleService } from "./vehicleService";
import { createVehicleSchema, updateVehicleSchema, updateVehicleStatusSchema } from "./vehicleValidation";

const service = new VehicleService();

export async function getVehicles(req: Request, res: Response): Promise<void> {
  try {
    const category = req.query.category as string;
    const search = req.query.search as string;
    const status = req.query.status as string;
    const page = req.query.page ? Number(req.query.page) : undefined;
    const limit = req.query.limit ? Number(req.query.limit) : undefined;

    // Use paginated listVehicles if pagination parameters exist
    if (page || limit) {
      const result = await service.listVehicles({ category, search, status, page, limit });
      res.status(200).json({ success: true, ...result });
      return;
    }

    const vehicles = await service.getVehicles({ category, search });
    res.status(200).json({ success: true, vehicles });
  } catch (error: any) {
    console.error("getVehicles error:", error);
    res.status(500).json({ success: false, message: "Failed to retrieve vehicles" });
  }
}

export async function getVehicleById(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const vehicle = await service.getVehicleById(id);
    res.status(200).json({ success: true, vehicle });
  } catch (error: any) {
    console.error("getVehicleById error:", error);
    res.status(error.message === "Vehicle not found" ? 404 : 400).json({
      success: false,
      message: error.message || "Failed to retrieve vehicle",
    });
  }
}

export async function getVehicleBySlug(req: Request, res: Response): Promise<void> {
  try {
    const { slug } = req.params;
    const vehicle = await service.getVehicleBySlug(slug);
    res.status(200).json({ success: true, vehicle });
  } catch (error: any) {
    console.error("getVehicleBySlug error:", error);
    res.status(error.message === "Vehicle not found" ? 404 : 400).json({
      success: false,
      message: error.message || "Vehicle not found",
    });
  }
}

export async function createVehicle(req: Request, res: Response): Promise<void> {
  try {
    const parseResult = createVehicleSchema.safeParse(req.body);
    if (!parseResult.success) {
      res.status(400).json({ success: false, errors: parseResult.error.errors });
      return;
    }

    const vehicle = await service.createVehicle(parseResult.data);
    res.status(201).json({ success: true, message: "Vehicle created successfully", vehicle });
  } catch (error: any) {
    console.error("createVehicle error:", error);
    res.status(400).json({ success: false, message: error.message || "Failed to create vehicle" });
  }
}

export async function updateVehicle(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const parseResult = updateVehicleSchema.safeParse(req.body);
    if (!parseResult.success) {
      res.status(400).json({ success: false, errors: parseResult.error.errors });
      return;
    }

    const vehicle = await service.updateVehicle(id, parseResult.data);
    res.status(200).json({ success: true, message: "Vehicle updated successfully", vehicle });
  } catch (error: any) {
    console.error("updateVehicle error:", error);
    res.status(error.message === "Vehicle not found" ? 404 : 400).json({
      success: false,
      message: error.message || "Failed to update vehicle",
    });
  }
}

export async function updateVehicleStatus(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const parseResult = updateVehicleStatusSchema.safeParse(req.body);
    if (!parseResult.success) {
      res.status(400).json({ success: false, errors: parseResult.error.errors });
      return;
    }

    const vehicle = await service.updateStatus(id, parseResult.data.status);
    res.status(200).json({ success: true, message: "Vehicle status updated successfully", vehicle });
  } catch (error: any) {
    console.error("updateVehicleStatus error:", error);
    res.status(error.message === "Vehicle not found" ? 404 : 400).json({
      success: false,
      message: error.message || "Failed to update status",
    });
  }
}

export async function deleteVehicle(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    await service.deleteVehicle(id);
    res.status(200).json({ success: true, message: "Vehicle deleted successfully" });
  } catch (error: any) {
    console.error("deleteVehicle error:", error);
    res.status(error.message === "Vehicle not found" ? 404 : 400).json({
      success: false,
      message: error.message || "Failed to delete vehicle",
    });
  }
}

export async function getPublicVehicles(req: Request, res: Response): Promise<void> {
  try {
    const category = req.query.category as string;
    const search = req.query.search as string;
    const vehicles = await service.getPublicVehicles({ category, search });
    res.status(200).json({ success: true, vehicles });
  } catch (error: any) {
    console.error("getPublicVehicles error:", error);
    res.status(500).json({ success: false, message: "Failed to retrieve public vehicles" });
  }
}

export async function getPublicVehicleBySlug(req: Request, res: Response): Promise<void> {
  try {
    const { slug } = req.params;
    const vehicle = await service.getPublicVehicleBySlug(slug);
    res.status(200).json({ success: true, vehicle });
  } catch (error: any) {
    console.error("getPublicVehicleBySlug error:", error);
    res.status(error.message === "Vehicle not found" ? 404 : 400).json({
      success: false,
      message: error.message || "Failed to retrieve public vehicle",
    });
  }
}
