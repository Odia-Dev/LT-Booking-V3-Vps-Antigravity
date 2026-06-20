import { Request, Response } from "express";
import { ColorService } from "./colorService";
import { createColorSchema, updateColorSchema } from "./colorValidation";

const service = new ColorService();

export async function getColors(req: Request, res: Response): Promise<void> {
  try {
    const { vehicleId } = req.params;
    const colors = await service.getColorsByVehicleId(vehicleId);
    res.status(200).json({ success: true, colors });
  } catch (error: any) {
    console.error("getColors error:", error);
    res.status(404).json({ success: false, message: error.message || "Failed to retrieve colors" });
  }
}

export async function createColor(req: Request, res: Response): Promise<void> {
  try {
    const parseResult = createColorSchema.safeParse(req.body);
    if (!parseResult.success) {
      res.status(400).json({ success: false, errors: parseResult.error.errors });
      return;
    }

    const color = await service.createColor(parseResult.data);
    res.status(201).json({ success: true, message: "Color created successfully", color });
  } catch (error: any) {
    console.error("createColor error:", error);
    res.status(400).json({ success: false, message: error.message || "Failed to create color" });
  }
}

export async function updateColor(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const parseResult = updateColorSchema.safeParse(req.body);
    if (!parseResult.success) {
      res.status(400).json({ success: false, errors: parseResult.error.errors });
      return;
    }

    const color = await service.updateColor(id, parseResult.data);
    res.status(200).json({ success: true, message: "Color updated successfully", color });
  } catch (error: any) {
    console.error("updateColor error:", error);
    res.status(400).json({ success: false, message: error.message || "Failed to update color" });
  }
}

export async function deleteColor(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    await service.deleteColor(id);
    res.status(200).json({ success: true, message: "Color deleted successfully" });
  } catch (error: any) {
    console.error("deleteColor error:", error);
    res.status(400).json({ success: false, message: error.message || "Failed to delete color" });
  }
}
