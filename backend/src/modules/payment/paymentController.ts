import { Request, Response } from "express";
import { prisma } from "../../config/db";
import { PaymentService } from "./paymentService";
import { PaymentRepository } from "./paymentRepository";
import { CreateOrderSchema } from "./paymentValidation";
import { AuthenticatedRequest } from "../../middleware/auth";

const paymentService = new PaymentService();
const paymentRepository = new PaymentRepository();

function hasAccessToPayment(req: AuthenticatedRequest, payment: any): boolean {
  if (!req.admin) return false;
  const { role, id, email } = req.admin;

  if (role === "ADMIN") return true;

  if (role === "SALES_EXECUTIVE" || role === "EXECUTIVE") {
    // Executive can access if they are assigned to the linked booking
    const executiveIdentifier = email || id;
    return (
      !!payment.booking &&
      !!payment.booking.assignedExecutive &&
      payment.booking.assignedExecutive === executiveIdentifier
    );
  }

  if (role === "CUSTOMER") {
    return payment.customerId === id;
  }

  return false;
}

export async function createOrder(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const parseResult = CreateOrderSchema.safeParse(req.body);
    if (!parseResult.success) {
      res.status(400).json({ success: false, errors: parseResult.error.errors });
      return;
    }

    const { bookingId } = parseResult.data;

    // Validate: Booking exists
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
    });

    if (!booking) {
      res.status(404).json({ success: false, message: "Booking not found" });
      return;
    }

    // Validate: RBAC (Ensure user owns this booking or is Admin/Executive)
    if (!req.admin) {
      res.status(401).json({ success: false, message: "Authentication required" });
      return;
    }
    const { role, id } = req.admin;
    if (role === "CUSTOMER" && booking.customerId !== id) {
      res.status(403).json({ success: false, message: "Access denied" });
      return;
    }

    // Validate: Booking status allows payment (INITIATED or PAYMENT_PENDING)
    const allowedStatuses = ["INITIATED", "PAYMENT_PENDING"];
    if (!allowedStatuses.includes(booking.bookingStatus)) {
      res.status(400).json({
        success: false,
        message: `Payment not allowed for booking status: ${booking.bookingStatus}`,
      });
      return;
    }

    // Validate: Booking is not already paid
    if (booking.paymentStatus === "SUCCESS") {
      res.status(400).json({ success: false, message: "Booking is already paid" });
      return;
    }

    // Validate: Amount matches booking amount (Ensures positive, valid booking amount)
    if (booking.bookingAmount <= 0) {
      res.status(400).json({ success: false, message: "Invalid booking amount" });
      return;
    }

    const orderData = await paymentService.createRazorpayOrder(bookingId);

    res.status(201).json({
      success: true,
      razorpay_order_id: orderData.orderId,
      amount: orderData.amount,
      currency: orderData.currency,
      key_id: process.env.RAZORPAY_KEY_ID || "mock_key_id",
    });
  } catch (error: any) {
    console.error("Error creating Razorpay order:", error);
    res.status(500).json({ success: false, message: error.message || "Internal server error" });
  }
}

export async function getPaymentById(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const { id } = req.params;

    const payment = await paymentRepository.getPaymentById(id);
    if (!payment) {
      res.status(404).json({ success: false, message: "Payment record not found" });
      return;
    }

    if (!hasAccessToPayment(req, payment)) {
      res.status(403).json({ success: false, message: "Access denied" });
      return;
    }

    res.status(200).json({ success: true, data: payment });
  } catch (error: any) {
    console.error("Error retrieving payment by ID:", error);
    res.status(500).json({ success: false, message: error.message || "Internal server error" });
  }
}

export async function getPaymentByOrderId(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const { orderId } = req.params;

    const payment = await paymentRepository.getPaymentByOrderId(orderId);
    if (!payment) {
      res.status(404).json({ success: false, message: "Payment record not found" });
      return;
    }

    if (!hasAccessToPayment(req, payment)) {
      res.status(403).json({ success: false, message: "Access denied" });
      return;
    }

    res.status(200).json({ success: true, data: payment });
  } catch (error: any) {
    console.error("Error retrieving payment by Order ID:", error);
    res.status(500).json({ success: false, message: error.message || "Internal server error" });
  }
}
