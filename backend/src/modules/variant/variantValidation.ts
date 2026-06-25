import { z } from "zod";

export const createVariantSchema = z.object({
  vehicleId: z.string().uuid("Invalid vehicle ID format"),
  name: z.string().min(1, "Variant name is required"),
  price: z.number().positive("Price must be a positive number"),
  fuelType: z.string().min(1, "Fuel type is required"),
  transmission: z.string().min(1, "Transmission is required"),
  seating: z.number().int().positive("Seating capacity must be a positive integer"),
  status: z.enum(["ACTIVE", "INACTIVE", "ARCHIVED"]).optional(),
  bookingAmount: z.number().positive().optional(),
  engineSize: z.union([z.string(), z.number()]).optional(),
  waitingPeriodWeeks: z.number().int().nonnegative().optional(),
});

export const updateVariantSchema = createVariantSchema.partial();

export const updateVariantStatusSchema = z.object({
  status: z.enum(["ACTIVE", "INACTIVE", "ARCHIVED"]),
});
