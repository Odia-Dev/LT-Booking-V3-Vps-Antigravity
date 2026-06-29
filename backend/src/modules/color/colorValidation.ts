import { z } from "zod";

// Validates hex color codes like #000000 or #fff
const hexColorRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;

export const createColorSchema = z.object({
  vehicleId: z.string().uuid("Invalid vehicle ID format"),
  name: z.string().min(1, "Color name is required").max(100, "Color name too long"),
  colorCode: z
    .string()
    .regex(hexColorRegex, "Color code must be a valid hex color (e.g. #1C1C1E)"),
  status: z.enum(["ACTIVE", "INACTIVE", "ARCHIVED"]).optional(),
  image: z.string().optional().or(z.literal("")),
});

export const updateColorSchema = createColorSchema.partial();
