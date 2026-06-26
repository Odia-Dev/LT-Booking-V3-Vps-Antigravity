import { z } from "zod";

export const AdminInitiateRefundSchema = z.object({
  amount: z.number().positive("Refund amount must be positive").optional(),
  reason: z.string().max(500, "Reason cannot exceed 500 characters").optional(),
});
