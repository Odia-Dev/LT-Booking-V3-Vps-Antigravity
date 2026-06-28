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

export const uploadFinanceDocumentSchema = z.object({
  documentType: z.enum([
    "AADHAAR",
    "PAN",
    "BANK_STATEMENT",
    "SALARY_SLIP",
    "ITR",
    "FORM_16",
    "GST_DOCUMENTS",
    "BUSINESS_PROOF",
    "SANCTION_LETTER",
    "OTHER"
  ]),
  remarks: z.string().optional().nullable(),
  expiryDate: z.preprocess((val) => {
    if (typeof val === "string" && val.trim() !== "") {
      const d = new Date(val);
      return isNaN(d.getTime()) ? undefined : d;
    }
    return val;
  }, z.date().optional().nullable()),
});
