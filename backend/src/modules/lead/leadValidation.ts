import { z } from "zod";

export const createLeadSchema = z.object({
  name: z.string().min(1, "Customer name is required").max(100),
  email: z.string().email("Invalid email format"),
  phone: z.string().min(10, "Phone number must be at least 10 digits").max(20),
  type: z.enum(["TEST_DRIVE", "SERVICE", "FINANCE", "EXCHANGE", "GENERAL"]),
  source: z.enum(["ORGANIC", "GOOGLE_ADS", "META_ADS", "REFERRAL", "DIRECT"]).optional(),
  notes: z.string().optional().nullable(),
  preferredDate: z.preprocess((val) => {
    if (typeof val === "string" && val.trim() !== "") {
      const d = new Date(val);
      return isNaN(d.getTime()) ? undefined : d;
    }
    return val;
  }, z.date().optional().nullable()),
  preferredTime: z.string().optional().nullable(),
  branchId: z.string().optional().nullable(),
  variantId: z.string().optional().nullable(),
  // Extra fields
  campaign: z.string().optional(),
  medium: z.string().optional(),
  message: z.string().optional(),
  interestedModel: z.string().optional(),
  preferredContactTime: z.string().optional(),
  assignedExecutive: z.string().optional(),
});

export const updateLeadSchema = createLeadSchema.partial().extend({
  status: z.enum(["NEW", "IN_PROGRESS", "COMPLETED", "CANCELLED"]).optional(),
  priority: z.enum(["HIGH", "MEDIUM", "LOW"]).optional(),
});

export const updateLeadStatusSchema = z.object({
  status: z.enum(["NEW", "IN_PROGRESS", "COMPLETED", "CANCELLED"]),
});

export const assignLeadSchema = z.object({
  executiveName: z.string().min(1, "Executive name is required"),
});
