import { z } from "zod";

export const CreateOrderSchema = z.object({
  bookingId: z.string().uuid("Invalid booking ID"),
});
