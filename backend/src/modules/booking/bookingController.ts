import { Request, Response } from "express";
import { BookingService } from "./bookingService";
import {
  CreateBookingSchema,
  UpdateBookingSchema,
  BookingStatusSchema,
  PaymentStatusSchema,
  SearchFiltersSchema,
  CreatePublicBookingSchema,
} from "./bookingValidation";
import { AuthenticatedRequest } from "../../middleware/auth";

const service = new BookingService();

function hasAccessToBooking(req: AuthenticatedRequest, booking: any): boolean {
  if (!req.admin) return false;
  const { role, id, email } = req.admin;

  if (role === "ADMIN") return true;

  if (role === "SALES_EXECUTIVE" || role === "EXECUTIVE") {
    // Executive can access if they are assigned to it
    const executiveIdentifier = email || id;
    return !!booking.assignedExecutive && booking.assignedExecutive === executiveIdentifier;
  }

  if (role === "CUSTOMER") {
    return booking.customerId === id;
  }

  return false;
}

export async function getBookings(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    if (!req.admin) {
      res.status(401).json({ success: false, message: "Authentication required" });
      return;
    }

    const { role, id, email } = req.admin;

    // Parse filters
    const parseResult = SearchFiltersSchema.safeParse(req.query);
    if (!parseResult.success) {
      res.status(400).json({ success: false, errors: parseResult.error.errors });
      return;
    }

    const filters = { ...parseResult.data };

    // Enforce RBAC
    if (role === "CUSTOMER") {
      filters.customerId = id;
    } else if (role === "SALES_EXECUTIVE" || role === "EXECUTIVE") {
      // Sales executive reads only assigned bookings
      const executiveIdentifier = email || id;
      // We will handle filtering assigned bookings inside search logic
      (filters as any).assignedExecutive = executiveIdentifier;
    }

    // Call service (repository list)
    const result = await service.listBookings(filters);
    res.status(200).json({ success: true, ...result });
  } catch (error: any) {
    console.error("getBookings error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
}

export async function getBookingById(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    if (!req.admin) {
      res.status(401).json({ success: false, message: "Authentication required" });
      return;
    }

    const booking = await service.getBookingById(req.params.id);
    if (!hasAccessToBooking(req, booking)) {
      res.status(403).json({ success: false, message: "Forbidden: Access denied" });
      return;
    }

    res.status(200).json({ success: true, data: booking });
  } catch (error: any) {
    console.error("getBookingById error:", error);
    if (error.message && error.message.includes("not found")) {
      res.status(404).json({ success: false, message: "Booking record not found" });
    } else {
      res.status(500).json({ success: false, message: "Internal server error" });
    }
  }
}

export async function getBookingByBookingId(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    if (!req.admin) {
      res.status(401).json({ success: false, message: "Authentication required" });
      return;
    }

    const booking = await service.getBookingByBookingId(req.params.bookingId);
    if (!hasAccessToBooking(req, booking)) {
      res.status(403).json({ success: false, message: "Forbidden: Access denied" });
      return;
    }

    res.status(200).json({ success: true, data: booking });
  } catch (error: any) {
    console.error("getBookingByBookingId error:", error);
    if (error.message && error.message.includes("not found")) {
      res.status(404).json({ success: false, message: "Booking record not found" });
    } else {
      res.status(500).json({ success: false, message: "Internal server error" });
    }
  }
}

export async function createBooking(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    if (!req.admin) {
      res.status(401).json({ success: false, message: "Authentication required" });
      return;
    }

    const parseResult = CreateBookingSchema.safeParse(req.body);
    if (!parseResult.success) {
      res.status(400).json({ success: false, errors: parseResult.error.errors });
      return;
    }

    // Customers can only create bookings for themselves
    if (req.admin.role === "CUSTOMER" && parseResult.data.customerId !== req.admin.id) {
      res.status(403).json({ success: false, message: "Forbidden: Cannot create bookings for other customers" });
      return;
    }

    const newBooking = await service.createBooking(parseResult.data);
    res.status(201).json({ success: true, data: newBooking });
  } catch (error: any) {
    console.error("createBooking error:", error);
    const msg = error.message;
    if (msg && (msg.includes("already has an active booking") || msg.includes("Unique constraint failed"))) {
      res.status(409).json({ success: false, message: msg });
    } else if (msg && (msg.includes("does not exist") || msg.includes("inactive"))) {
      res.status(400).json({ success: false, message: msg });
    } else {
      res.status(500).json({ success: false, message: "Internal server error" });
    }
  }
}

export async function updateBooking(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    if (!req.admin) {
      res.status(401).json({ success: false, message: "Authentication required" });
      return;
    }

    const { role } = req.admin;
    if (role === "CUSTOMER") {
      res.status(403).json({ success: false, message: "Forbidden: Customers cannot update booking parameters" });
      return;
    }

    const booking = await service.getBookingById(req.params.id);
    if (!hasAccessToBooking(req, booking)) {
      res.status(403).json({ success: false, message: "Forbidden: Access denied" });
      return;
    }

    const parseResult = UpdateBookingSchema.safeParse(req.body);
    if (!parseResult.success) {
      res.status(400).json({ success: false, errors: parseResult.error.errors });
      return;
    }

    const updateData = { ...parseResult.data };

    // Enforce Sales Executive update rules (can only update notes, status, and assignment)
    if (role === "SALES_EXECUTIVE" || role === "EXECUTIVE") {
      delete updateData.customerId;
      delete updateData.vehicleId;
      delete updateData.variantId;
      delete updateData.branchId;
      delete updateData.bookingAmount;
      delete updateData.paymentGateway;
      delete updateData.paymentId;
      delete updateData.orderId;
    }

    const updated = await service.updateBooking(req.params.id, updateData);
    res.status(200).json({ success: true, data: updated });
  } catch (error: any) {
    console.error("updateBooking error:", error);
    const msg = error.message;
    if (msg && msg.includes("not found")) {
      res.status(404).json({ success: false, message: "Booking record not found" });
    } else if (msg && (msg.includes("already has another active booking") || msg.includes("Unique constraint failed"))) {
      res.status(409).json({ success: false, message: msg });
    } else if (msg && (msg.includes("does not exist") || msg.includes("inactive"))) {
      res.status(400).json({ success: false, message: msg });
    } else {
      res.status(500).json({ success: false, message: "Internal server error" });
    }
  }
}

export async function updateBookingStatus(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    if (!req.admin) {
      res.status(401).json({ success: false, message: "Authentication required" });
      return;
    }

    const { role } = req.admin;
    if (role === "CUSTOMER") {
      res.status(403).json({ success: false, message: "Forbidden: Access denied" });
      return;
    }

    const booking = await service.getBookingById(req.params.id);
    if (!hasAccessToBooking(req, booking)) {
      res.status(403).json({ success: false, message: "Forbidden: Access denied" });
      return;
    }

    const parseResult = BookingStatusSchema.safeParse(req.body);
    if (!parseResult.success) {
      res.status(400).json({ success: false, errors: parseResult.error.errors });
      return;
    }

    const updated = await service.updateBookingStatus(req.params.id, parseResult.data.bookingStatus);
    res.status(200).json({ success: true, data: updated });
  } catch (error: any) {
    console.error("updateBookingStatus error:", error);
    if (error.message && error.message.includes("not found")) {
      res.status(404).json({ success: false, message: "Booking record not found" });
    } else {
      res.status(500).json({ success: false, message: "Internal server error" });
    }
  }
}

export async function updatePaymentStatus(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    if (!req.admin) {
      res.status(401).json({ success: false, message: "Authentication required" });
      return;
    }

    const { role } = req.admin;
    if (role === "CUSTOMER") {
      res.status(403).json({ success: false, message: "Forbidden: Access denied" });
      return;
    }

    const booking = await service.getBookingById(req.params.id);
    if (!hasAccessToBooking(req, booking)) {
      res.status(403).json({ success: false, message: "Forbidden: Access denied" });
      return;
    }

    const parseResult = PaymentStatusSchema.safeParse(req.body);
    if (!parseResult.success) {
      res.status(400).json({ success: false, errors: parseResult.error.errors });
      return;
    }

    const updated = await service.updatePaymentStatus(req.params.id, parseResult.data.paymentStatus);
    res.status(200).json({ success: true, data: updated });
  } catch (error: any) {
    console.error("updatePaymentStatus error:", error);
    if (error.message && error.message.includes("not found")) {
      res.status(404).json({ success: false, message: "Booking record not found" });
    } else {
      res.status(500).json({ success: false, message: "Internal server error" });
    }
  }
}

export async function cancelBooking(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    if (!req.admin) {
      res.status(401).json({ success: false, message: "Authentication required" });
      return;
    }

    const booking = await service.getBookingById(req.params.id);
    if (!hasAccessToBooking(req, booking)) {
      res.status(403).json({ success: false, message: "Forbidden: Access denied" });
      return;
    }

    // Executives cannot cancel unless they are explicitly assigned and role dictates
    // Allow customer (who owns booking) or admin to cancel
    if (req.admin.role === "SALES_EXECUTIVE" || req.admin.role === "EXECUTIVE") {
      res.status(403).json({ success: false, message: "Forbidden: Sales Executives cannot cancel bookings directly" });
      return;
    }

    const cancelled = await service.cancelBooking(req.params.id);
    res.status(200).json({ success: true, data: cancelled });
  } catch (error: any) {
    console.error("cancelBooking error:", error);
    if (error.message && error.message.includes("not found")) {
      res.status(404).json({ success: false, message: "Booking record not found" });
    } else {
      res.status(500).json({ success: false, message: "Internal server error" });
    }
  }
}

export async function deleteBooking(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    if (!req.admin) {
      res.status(401).json({ success: false, message: "Authentication required" });
      return;
    }

    if (req.admin.role !== "ADMIN") {
      res.status(403).json({ success: false, message: "Forbidden: Only administrators can delete bookings" });
      return;
    }

    // For deleteBooking, since we don't have hard delete, we will soft delete (cancel) or use direct prisma deletion.
    // Let's implement physical delete from DB since the method is deleteBooking
    const booking = await service.getBookingById(req.params.id);
    await service.cancelBooking(req.params.id); // Or let's use direct delete:
    await require("../../config/db").prisma.booking.delete({ where: { id: req.params.id } });

    res.status(200).json({ success: true, message: "Booking record permanently deleted" });
  } catch (error: any) {
    console.error("deleteBooking error:", error);
    if (error.message && error.message.includes("not found")) {
      res.status(404).json({ success: false, message: "Booking record not found" });
    } else {
      res.status(500).json({ success: false, message: "Internal server error" });
    }
  }
}

export async function createPublicBooking(req: Request, res: Response): Promise<void> {
  try {
    const parseResult = CreatePublicBookingSchema.safeParse(req.body);
    if (!parseResult.success) {
      res.status(400).json({ success: false, errors: parseResult.error.errors });
      return;
    }

    const booking = await service.createPublicBooking(parseResult.data);
    res.status(201).json({
      success: true,
      message: "Booking request initiated successfully",
      booking: {
        id: booking.id,
        bookingId: booking.bookingId,
        bookingAmount: booking.bookingAmount,
        bookingStatus: booking.bookingStatus,
        paymentStatus: booking.paymentStatus,
      },
    });
  } catch (error: any) {
    console.error("createPublicBooking error:", error);
    const msg = error.message;
    if (msg && (msg.includes("already has an active booking") || msg.includes("Unique constraint failed"))) {
      res.status(409).json({ success: false, message: msg });
    } else if (msg && (msg.includes("does not exist") || msg.includes("inactive") || msg.includes("must be positive"))) {
      res.status(400).json({ success: false, message: msg });
    } else {
      res.status(500).json({ success: false, message: "Internal server error" });
    }
  }
}
