import { z } from "zod";

export const CreateDeliverySchema = z.object({
  bookingId: z.string().uuid("Invalid Booking ID format"),
  customerId: z.string().uuid("Invalid Customer ID format"),
  vehicleId: z.string().uuid("Invalid Vehicle ID format"),
  variantId: z.string().uuid("Invalid Variant ID format"),
  branchId: z.string().uuid("Invalid Branch ID format"),
  assignedExecutive: z.string().optional().nullable(),
  scheduledDate: z.string().datetime("Invalid scheduled date format").optional().nullable(),
  notes: z.string().optional().nullable(),
});

export const UpdateDeliverySchema = z.object({
  assignedExecutive: z.string().optional().nullable(),
  scheduledDate: z.string().datetime("Invalid scheduled date format").optional().nullable(),
  notes: z.string().optional().nullable(),
});

export const UpdateStatusSchema = z.object({
  status: z.enum(["SCHEDULED", "PREPARED", "READY", "DELIVERED", "CANCELLED"], {
    errorMap: () => ({ message: "Invalid delivery status. Must be SCHEDULED, PREPARED, READY, DELIVERED, or CANCELLED" }),
  }),
  comment: z.string().optional().nullable(),
});

export const UpdateChecklistSchema = z.object({
  paymentCleared: z.boolean().optional(),
  insuranceIssued: z.boolean().optional(),
  rtoCompleted: z.boolean().optional(),
  pdiCompleted: z.boolean().optional(),
  accessoriesInstalled: z.boolean().optional(),
  fuelFilled: z.boolean().optional(),
  cleaningCompleted: z.boolean().optional(),
  documentationPrepared: z.boolean().optional(),
  deliveryKitPrepared: z.boolean().optional(),
  customerOrientationCompleted: z.boolean().optional(),
});
