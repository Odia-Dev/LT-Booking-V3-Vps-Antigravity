import { z } from "zod";

export const updateProfileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").optional(),
  email: z.string().email("Invalid email format").optional().or(z.literal("")),
  phone: z.string().min(10, "Phone number must be at least 10 digits").regex(/^\+?[1-9]\d{1,14}$/, "Invalid phone format").optional(),
  city: z.string().min(2, "City name must be at least 2 characters").optional(),
  state: z.string().min(2, "State name must be at least 2 characters").optional(),
});
