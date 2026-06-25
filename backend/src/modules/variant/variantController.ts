import { Request, Response } from "express";
import { VariantService } from "./variantService";
import { createVariantSchema, updateVariantSchema, updateVariantStatusSchema } from "./variantValidation";

const service = new VariantService();

export async function listVariants(req: Request, res: Response): Promise<void> {
  try {
    const { search, fuelType, transmission, status, vehicleId, minPrice, maxPrice, page, limit } = req.query;

    const filters = {
      search: search ? String(search) : undefined,
      fuelType: fuelType ? String(fuelType) : undefined,
      transmission: transmission ? String(transmission) : undefined,
      status: status ? String(status) : undefined,
      vehicleId: vehicleId ? String(vehicleId) : undefined,
      minPrice: minPrice ? Number(minPrice) : undefined,
      maxPrice: maxPrice ? Number(maxPrice) : undefined,
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
    };

    const result = await service.listVariants(filters);
    res.status(200).json({ success: true, ...result });
  } catch (error: any) {
    console.error("listVariants error:", error);
    res.status(500).json({ success: false, message: error.message || "Failed to retrieve variants" });
  }
}

export async function getVariantById(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const variant = await service.getVariantById(id);
    res.status(200).json({ success: true, variant });
  } catch (error: any) {
    console.error("getVariantById error:", error);
    res.status(error.message === "Variant not found" ? 404 : 400).json({
      success: false,
      message: error.message || "Failed to retrieve variant",
    });
  }
}

export async function getVariantBySlug(req: Request, res: Response): Promise<void> {
  try {
    const { slug } = req.params;
    const variant = await service.getVariantBySlug(slug);
    res.status(200).json({ success: true, variant });
  } catch (error: any) {
    console.error("getVariantBySlug error:", error);
    res.status(error.message === "Variant not found" ? 404 : 400).json({
      success: false,
      message: error.message || "Failed to retrieve variant",
    });
  }
}

export async function getVariantsByVehicle(req: Request, res: Response): Promise<void> {
  try {
    const { vehicleId } = req.params;
    const { search, fuelType, transmission, status, minPrice, maxPrice, page, limit } = req.query;

    const filters = {
      search: search ? String(search) : undefined,
      fuelType: fuelType ? String(fuelType) : undefined,
      transmission: transmission ? String(transmission) : undefined,
      status: status ? String(status) : undefined,
      minPrice: minPrice ? Number(minPrice) : undefined,
      maxPrice: maxPrice ? Number(maxPrice) : undefined,
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
    };

    const result = await service.listVariantsByVehicle(vehicleId, filters);
    res.status(200).json({ success: true, ...result });
  } catch (error: any) {
    console.error("getVariantsByVehicle error:", error);
    res.status(error.message === "Vehicle not found" ? 404 : 400).json({
      success: false,
      message: error.message || "Failed to retrieve vehicle variants",
    });
  }
}

export async function createVariant(req: Request, res: Response): Promise<void> {
  try {
    const parseResult = createVariantSchema.safeParse(req.body);
    if (!parseResult.success) {
      res.status(400).json({ success: false, errors: parseResult.error.errors });
      return;
    }

    const variant = await service.createVariant(parseResult.data);
    res.status(201).json({ success: true, message: "Variant created successfully", variant });
  } catch (error: any) {
    console.error("createVariant error:", error);
    res.status(400).json({ success: false, message: error.message || "Failed to create variant" });
  }
}

export async function updateVariant(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const parseResult = updateVariantSchema.safeParse(req.body);
    if (!parseResult.success) {
      res.status(400).json({ success: false, errors: parseResult.error.errors });
      return;
    }

    const variant = await service.updateVariant(id, parseResult.data);
    res.status(200).json({ success: true, message: "Variant updated successfully", variant });
  } catch (error: any) {
    console.error("updateVariant error:", error);
    res.status(error.message === "Variant not found" ? 404 : 400).json({
      success: false,
      message: error.message || "Failed to update variant",
    });
  }
}

export async function updateVariantStatus(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const parseResult = updateVariantStatusSchema.safeParse(req.body);
    if (!parseResult.success) {
      res.status(400).json({ success: false, errors: parseResult.error.errors });
      return;
    }

    const variant = await service.updateStatus(id, parseResult.data.status);
    res.status(200).json({ success: true, message: "Variant status updated successfully", variant });
  } catch (error: any) {
    console.error("updateVariantStatus error:", error);
    res.status(error.message === "Variant not found" ? 404 : 400).json({
      success: false,
      message: error.message || "Failed to update variant status",
    });
  }
}

export async function deleteVariant(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    await service.deleteVariant(id);
    res.status(200).json({ success: true, message: "Variant deleted successfully" });
  } catch (error: any) {
    console.error("deleteVariant error:", error);
    res.status(error.message === "Variant not found" ? 404 : 400).json({
      success: false,
      message: error.message || "Failed to delete variant",
    });
  }
}
