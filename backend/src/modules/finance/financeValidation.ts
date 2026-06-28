import { z } from "zod";

export const createFinanceSchema = z.object({
  bookingId: z.string().min(1, "Booking ID is required"),
  customerId: z.string().min(1, "Customer ID is required"),
  branchId: z.string().min(1, "Branch ID is required"),
  vehicleId: z.string().min(1, "Vehicle ID is required"),
  bankName: z.string().optional().nullable(),
  loanAmount: z.number().optional().nullable(),
  downPayment: z.number().optional().nullable(),
  interestRate: z.number().optional().nullable(),
  loanTenure: z.number().optional().nullable(),
  emiAmount: z.number().optional().nullable(),
  status: z.enum([
    "INITIATED",
    "DOCUMENT_PENDING",
    "UNDER_REVIEW",
    "SANCTION_APPROVED",
    "SANCTION_REJECTED",
    "DISBURSEMENT_PENDING",
    "DISBURSED",
    "CLOSED"
  ]).optional(),
  assignedExecutive: z.string().optional().nullable(),
});

export const updateFinanceSchema = createFinanceSchema.partial();

export const updateFinanceStatusSchema = z.object({
  status: z.enum([
    "INITIATED",
    "DOCUMENT_PENDING",
    "UNDER_REVIEW",
    "SANCTION_APPROVED",
    "SANCTION_REJECTED",
    "DISBURSEMENT_PENDING",
    "DISBURSED",
    "CLOSED"
  ]),
});
