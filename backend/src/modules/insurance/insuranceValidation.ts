import { z } from "zod";

export const createInsuranceInquirySchema = z.object({
  name: z.string().min(2, "Name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(10, "Valid phone number is required"),
  vehicleSelection: z.string().min(1, "Vehicle selection is required"),
  existingPolicyProvider: z.string().optional(),
  policyType: z.enum(["NEW", "RENEWAL"]),
  preferredContactTime: z.string().optional(),
  notes: z.string().optional(),
});

export const updateInsuranceInquirySchema = z.object({
  status: z.enum(["NEW", "IN_PROGRESS", "RESOLVED", "CLOSED"]).optional(),
  assignedExecutive: z.string().optional(),
  notes: z.string().optional(),
});
