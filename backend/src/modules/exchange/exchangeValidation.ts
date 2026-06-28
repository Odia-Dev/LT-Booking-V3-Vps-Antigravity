import { z } from "zod";

export const createExchangeInquirySchema = z.object({
  name: z.string().min(2, "Name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(10, "Valid phone number is required"),
  brand: z.string().min(1, "Brand is required"),
  model: z.string().min(1, "Model is required"),
  year: z.number().int().min(1900, "Valid year required").max(new Date().getFullYear() + 1),
  kmDriven: z.number().int().min(0, "KM driven must be positive"),
  fuelType: z.string().min(1, "Fuel type is required"),
  expectedValue: z.number().optional(),
  registrationNumber: z.string().min(4, "Valid registration number required"),
  notes: z.string().optional(),
});

export const updateExchangeInquirySchema = z.object({
  status: z.enum(["NEW", "EVALUATING", "OFFER_MADE", "ACCEPTED", "REJECTED", "CLOSED"]).optional(),
  assignedExecutive: z.string().optional(),
  valuation: z.number().optional(),
  notes: z.string().optional(),
});
