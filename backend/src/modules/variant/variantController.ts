import { Request, Response } from "express";
import { VariantService } from "./variantService";
import { createVariantSchema, updateVariantSchema } from "./variantValidation";

const service = new VariantService();

export async function getVariants(req: Request, res: Response): Promise<void> {
  try {
    const { vehicleId } = req.params;
    const variants = await service.getVariantsByVehicleId(vehicleId);
    res.status(200).json({ success: true, variants });
  } catch (error: any) {
    console.error("getVariants error:", error);
    res.status(404).json({ success: false, message: error.message || "Failed to retrieve variants" });
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
    res.status(400).json({ success: false, message: error.message || "Failed to update variant" });
  }
}

export async function deleteVariant(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    await service.deleteVariant(id);
    res.status(200).json({ success: true, message: "Variant deleted successfully" });
  } catch (error: any) {
    console.error("deleteVariant error:", error);
    res.status(400).json({ success: false, message: error.message || "Failed to delete variant" });
  }
}
