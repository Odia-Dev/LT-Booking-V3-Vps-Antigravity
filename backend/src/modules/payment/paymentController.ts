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

    // Validate: RBAC (Ensure user owns this booking if logged in; allow guest checkouts)
    if (req.admin) {
      const { role, id } = req.admin;
      if (role === "CUSTOMER" && booking.customerId !== id) {
        res.status(403).json({ success: false, message: "Access denied" });
        return;
      }
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

export async function verifyPayment(req: Request, res: Response): Promise<void> {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      res.status(400).json({ success: false, message: "Missing required signature verification fields" });
      return;
    }

    const isValid = await paymentService.verifySignature(
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature
    );

    if (isValid) {
      const payment = await paymentService.markSuccess(
        razorpay_order_id,
        razorpay_payment_id,
        req.body
      );
      res.status(200).json({
        success: true,
        message: "Payment verified successfully",
        payment,
      });
    } else {
      await paymentService.markFailed(razorpay_order_id, razorpay_payment_id, {
        error: "Signature mismatch verification failure",
        payload: req.body,
      });
      res.status(400).json({ success: false, message: "Invalid payment signature" });
    }
  } catch (error: any) {
    console.error("Error verifying payment:", error);
    res.status(500).json({ success: false, message: error.message || "Internal server error" });
  }
}

export async function initiateRefund(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    if (!req.admin) {
      res.status(401).json({ success: false, message: "Authentication required" });
      return;
    }

    if (req.admin.role !== "ADMIN") {
      res.status(403).json({ success: false, message: "Forbidden: Only administrators can initiate refunds" });
      return;
    }

    const { id } = req.params;

    const { AdminInitiateRefundSchema } = require("./refundValidation");
    const parseResult = AdminInitiateRefundSchema.safeParse(req.body);
    if (!parseResult.success) {
      res.status(400).json({ success: false, errors: parseResult.error.errors });
      return;
    }

    const { amount, reason } = parseResult.data;

    const payment = await paymentService.requestRefund(id, amount, reason);

    res.status(200).json({
      success: true,
      message: "Refund request initiated successfully",
      payment,
    });
  } catch (error: any) {
    console.error("Error initiating refund:", error);
    res.status(500).json({ success: false, message: error.message || "Internal server error" });
  }
}

export async function getRefundHistory(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const { id } = req.params;

    const payment = await paymentRepository.getPaymentById(id);
    if (!payment) {
      res.status(404).json({ success: false, message: "Payment record not found" });
      return;
    }

    // RBAC: Check access
    if (!hasAccessToPayment(req, payment)) {
      res.status(403).json({ success: false, message: "Access denied" });
      return;
    }

    const audits = await prisma.paymentAudit.findMany({
      where: {
        paymentId: id,
        toStatus: {
          in: ["REFUNDED", "PARTIAL_REFUND", "REFUND_PROCESSING", "REFUND_REQUESTED"],
        },
      },
      orderBy: { createdAt: "desc" },
    });

    res.status(200).json({
      success: true,
      refunds: audits,
    });
  } catch (error: any) {
    console.error("Error retrieving refund history:", error);
    res.status(500).json({ success: false, message: error.message || "Internal server error" });
  }
}
