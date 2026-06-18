import { z } from "zod";

export const createVariantSchema = z.object({
  vehicleId: z.string().uuid("Invalid vehicle ID format"),
  name: z.string().min(1, "Variant name is required"),
  price: z.number().nonnegative("Price must be a positive number"),
  fuelType: z.enum(["Petrol", "Diesel", "Hybrid", "Electric"]),
  transmission: z.enum(["Manual", "Automatic"]),
  seating: z.number().int().positive("Seating capacity must be a positive integer"),
  status: z.enum(["ACTIVE", "INACTIVE", "ARCHIVED"]).optional(),
});

export const updateVariantSchema = createVariantSchema.partial();
