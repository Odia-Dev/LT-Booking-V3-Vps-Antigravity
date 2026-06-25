import { z } from "zod";

export const createTestDriveSchema = z.object({
  customerId: z.string().min(1, "Customer ID is required"),
  leadId: z.string().optional().nullable(),
  vehicleId: z.string().min(1, "Vehicle ID is required"),
  variantId: z.string().min(1, "Variant ID is required"),
  branchId: z.string().min(1, "Branch ID is required"),
  preferredDate: z.preprocess((val) => {
    if (typeof val === "string" && val.trim() !== "") {
      const d = new Date(val);
      return isNaN(d.getTime()) ? undefined : d;
    }
    return val;
  }, z.date({ required_error: "Preferred Date is required" })),
  preferredTime: z.string().min(1, "Preferred Time slot is required"),
  status: z.enum(["REQUESTED", "CONFIRMED", "COMPLETED", "BOOKED", "CANCELLED", "NO_SHOW"]).optional(),
  assignedExecutive: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
});

export const updateTestDriveSchema = createTestDriveSchema.partial();

export const updateTestDriveStatusSchema = z.object({
  status: z.enum(["REQUESTED", "CONFIRMED", "COMPLETED", "BOOKED", "CANCELLED", "NO_SHOW"]),
});

export const assignExecutiveSchema = z.object({
  executiveName: z.string().min(1, "Executive name is required"),
});
