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
  waitingPeriod: z.string().optional(),
  specs: z.object({
    safetyFeatures: z.array(z.string()).optional(),
    comfortFeatures: z.array(z.string()).optional(),
    exteriorFeatures: z.array(z.string()).optional(),
    interiorFeatures: z.array(z.string()).optional(),
    technologyFeatures: z.array(z.string()).optional(),
    performanceFeatures: z.array(z.string()).optional(),
    length: z.string().optional(),
    width: z.string().optional(),
    height: z.string().optional(),
    wheelbase: z.string().optional(),
    groundClearance: z.string().optional(),
    bootSpace: z.string().optional(),
    fuelTank: z.string().optional(),
    tyres: z.string().optional(),
    brakes: z.string().optional(),
    suspension: z.string().optional(),
  }).optional(),
});

export const updateVariantSchema = createVariantSchema.partial();

export const updateVariantStatusSchema = z.object({
  status: z.enum(["ACTIVE", "INACTIVE", "ARCHIVED"]),
});
