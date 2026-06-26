import { z } from "zod";

export const CreateBookingSchema = z.object({
  customerId: z.string().uuid("Invalid customer ID"),
  leadId: z.string().uuid("Invalid lead ID").nullable().optional(),
  testDriveId: z.string().uuid("Invalid test drive ID").nullable().optional(),
  vehicleId: z.string().uuid("Invalid vehicle ID"),
  variantId: z.string().uuid("Invalid variant ID"),
  branchId: z.string().uuid("Invalid branch ID"),
  bookingAmount: z.number().positive("Booking amount must be positive"),
  assignedExecutive: z.string().min(1, "Assigned executive cannot be empty").nullable().optional(),
  notes: z.string().max(1000, "Notes cannot exceed 1000 characters").nullable().optional(),
  paymentGateway: z.enum(["RAZORPAY", "ICICI"]).nullable().optional(),
  paymentId: z.string().min(1).nullable().optional(),
  orderId: z.string().min(1).nullable().optional(),
});

export const UpdateBookingSchema = z.object({
  customerId: z.string().uuid("Invalid customer ID").optional(),
  leadId: z.string().uuid("Invalid lead ID").nullable().optional(),
  testDriveId: z.string().uuid("Invalid test drive ID").nullable().optional(),
  vehicleId: z.string().uuid("Invalid vehicle ID").optional(),
  variantId: z.string().uuid("Invalid variant ID").optional(),
  branchId: z.string().uuid("Invalid branch ID").optional(),
  bookingAmount: z.number().positive("Booking amount must be positive").optional(),
  assignedExecutive: z.string().min(1).nullable().optional(),
  notes: z.string().max(1000).nullable().optional(),
  paymentGateway: z.enum(["RAZORPAY", "ICICI"]).nullable().optional(),
  paymentId: z.string().min(1).nullable().optional(),
  orderId: z.string().min(1).nullable().optional(),
  bookingStatus: z.enum([
    "INITIATED",
    "PAYMENT_PENDING",
    "PAYMENT_SUCCESS",
    "CONFIRMED",
    "VEHICLE_ALLOCATED",
    "DELIVERED",
    "CLOSED",
    "CANCELLED",
    "REFUNDED",
    "EXPIRED"
  ]).optional(),
  paymentStatus: z.enum(["PENDING", "SUCCESS", "FAILED", "REFUNDED"]).optional(),
});

export const BookingStatusSchema = z.object({
  bookingStatus: z.enum([
    "INITIATED",
    "PAYMENT_PENDING",
    "PAYMENT_SUCCESS",
    "CONFIRMED",
    "VEHICLE_ALLOCATED",
    "DELIVERED",
    "CLOSED",
    "CANCELLED",
    "REFUNDED",
    "EXPIRED"
  ]),
});

export const PaymentStatusSchema = z.object({
  paymentStatus: z.enum(["PENDING", "SUCCESS", "FAILED", "REFUNDED"]),
});

export const CreatePublicBookingSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(10, "Phone number must be at least 10 digits"),
  city: z.string().min(1, "City is required").nullable().optional(),
  state: z.string().min(1, "State is required").nullable().optional(),
  vehicleId: z.string().uuid("Invalid vehicle ID"),
  variantId: z.string().uuid("Invalid variant ID"),
  branchId: z.string().uuid("Invalid branch ID"),
  bookingAmount: z.number().positive("Booking amount must be positive"),
  notes: z.string().max(1000).nullable().optional(),
  campaign: z.string().optional(),
  medium: z.string().optional(),
  source: z.string().optional(),
  referrer: z.string().optional(),
  landingPageUrl: z.string().optional(),
});

export const SearchFiltersSchema = z.object({
  status: z.string().optional(),
  paymentStatus: z.string().optional(),
  branchId: z.string().uuid().optional(),
  vehicleId: z.string().uuid().optional(),
  customerId: z.string().uuid().optional(),
  search: z.string().optional(),
  startDate: z.string().datetime({ precision: null }).optional(),
  endDate: z.string().datetime({ precision: null }).optional(),
  page: z.string().regex(/^\d+$/).transform(Number).optional(),
  limit: z.string().regex(/^\d+$/).transform(Number).optional(),
});
