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
  heroImage: z.string().optional().or(z.literal("")),
  thumbnail: z.string().optional().or(z.literal("")),
  gallery: z.array(z.string()).optional(),
  brochure: z.string().optional(),
  youtubeUrl: z.string().url("YouTube URL must be valid").optional().or(z.literal("")),
  startingPrice: z.number().nonnegative().optional(),
  bookingAmount: z.number().nonnegative().optional(),
  sortOrder: z.number().nonnegative().optional(),
  status: z.enum(statuses).optional(),
  seoTitle: z.string().optional(),
  seoDescription: z.string().optional(),
});

export const updateVehicleSchema = createVehicleSchema.partial();

export const updateVehicleStatusSchema = z.object({
  status: z.enum(statuses),
});
