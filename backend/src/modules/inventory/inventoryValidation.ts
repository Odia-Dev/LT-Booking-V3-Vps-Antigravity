import { z } from "zod";

export const createInventoryItemSchema = z.object({
  vin: z.string().min(5, "VIN is required"),
  engineNumber: z.string().optional(),
  chassisNumber: z.string().optional(),
  vehicleId: z.string().min(1, "Vehicle ID is required"),
  variantId: z.string().min(1, "Variant ID is required"),
  colorId: z.string().min(1, "Color ID is required"),
  branchId: z.string().min(1, "Branch ID is required"),
  status: z.enum(["AVAILABLE", "RESERVED", "SOLD", "TRANSFERRED"]).optional(),
  notes: z.string().optional(),
});

export const updateInventoryItemSchema = z.object({
  branchId: z.string().optional(),
  status: z.enum(["AVAILABLE", "RESERVED", "SOLD", "TRANSFERRED"]).optional(),
  notes: z.string().optional(),
});
