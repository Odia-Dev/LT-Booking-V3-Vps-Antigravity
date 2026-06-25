import { z } from "zod";

export const createBranchSchema = z.object({
  name: z.string().min(1, "Branch name is required").max(100, "Branch name too long"),
  code: z.string().min(2, "Branch code must be at least 2 characters").max(20, "Branch code too long"),
  address: z.string().min(5, "Address must be at least 5 characters"),
  city: z.string().min(2, "City name is required"),
  district: z.string().min(2, "District is required"),
  state: z.string().min(2, "State is required"),
  pincode: z.string().regex(/^\d{6}$/, "Pincode must be exactly 6 digits"),
  phone: z.string().min(10, "Phone number must be at least 10 digits"),
  email: z.string().email("Invalid email format"),
  googleMapsUrl: z.string().url("Invalid Google Maps URL format"),
  workingHours: z.string().optional(),
  latitude: z.number().optional().nullable(),
  longitude: z.number().optional().nullable(),
  managerName: z.string().optional().nullable(),
  managerPhone: z.string().optional().nullable(),
  salesManager: z.string().optional().nullable(),
  serviceManager: z.string().optional().nullable(),
  sortOrder: z.number().nonnegative().optional(),
  status: z.enum(["ACTIVE", "INACTIVE", "ARCHIVED"]).optional(),
});

export const updateBranchSchema = createBranchSchema.partial();
