import { z } from "zod";

const categories = ["SUV", "MPV", "Hatchback", "Sedan"] as const;
const statuses = ["ACTIVE", "INACTIVE", "ARCHIVED", "UPCOMING"] as const;

export const createVehicleSchema = z.object({
  name: z.string().min(1, "Name is required"),
  slug: z.string().optional(),
  category: z.enum(categories, {
    errorMap: () => ({ message: "Category must be one of: SUV, MPV, Hatchback, Sedan" }),
  }),
  description: z.string().optional(),
  heroImage: z.string().url("Hero image must be a valid URL").optional().or(z.literal("")),
  status: z.enum(statuses).optional(),
  seoTitle: z.string().optional(),
  seoDescription: z.string().optional(),
});

export const updateVehicleSchema = createVehicleSchema.partial();
