import crypto from "crypto";
import Razorpay from "razorpay";
import { prisma } from "../../config/db";
import { PaymentRepository } from "./paymentRepository";
import { bookingNotificationEvents } from "../../services/bookingNotificationService";

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || "mock_key_id",
  key_secret: process.env.RAZORPAY_KEY_SECRET || "mock_key_secret",
});

export class PaymentService {
  private paymentRepository: PaymentRepository;

  constructor() {
    this.paymentRepository = new PaymentRepository();
  }

  async createRazorpayOrder(bookingId: string): Promise<any> {
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
    });

    if (!booking) {
      throw new Error(`Booking with ID ${bookingId} not found`);
    }

    // Check if payment already exists for this booking
    let payment = await this.paymentRepository.getPaymentByBookingId(bookingId);

    if (payment) {
      if (payment.status === "SUCCESS") {
        throw new Error("Booking is already paid successfully");
      }
      // If payment exists and is pending, we can reuse or create a new one.
      // Let's create a new order to avoid session conflicts in Razorpay.
    }

    // Razorpay amount is in paise (1 INR = 100 paise)
    const amountInPaise = Math.round(booking.bookingAmount * 100);

    const orderOptions = {
      amount: amountInPaise,
      currency: "INR",
      receipt: booking.bookingId,
      notes: {
        bookingId: booking.id,
        customerId: booking.customerId,
      },
    };

    const razorpayOrder = await razorpay.orders.create(orderOptions);

    // Create payment entry in our database
    payment = await this.paymentRepository.createPayment({
      bookingId: booking.id,
      customerId: booking.customerId,
      razorpayOrderId: razorpayOrder.id,
      amount: booking.bookingAmount,
      currency: "INR",
    });

    // Also update Booking status to PAYMENT_PENDING and attach orderId
    await prisma.booking.update({
      where: { id: bookingId },
      data: {
        bookingStatus: "PAYMENT_PENDING",
        orderId: razorpayOrder.id,
        paymentGateway: "RAZORPAY",
      },
    });

    return {
      orderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      paymentId: payment.id,
      bookingId: booking.bookingId,
    };
  }

  async verifySignature(
    razorpayOrderId: string,
    razorpayPaymentId: string,
    signature: string
  ): Promise<boolean> {
    const secret = process.env.RAZORPAY_KEY_SECRET || "mock_key_secret";
    const body = razorpayOrderId + "|" + razorpayPaymentId;
    const expectedSignature = crypto
      .createHmac("sha256", secret)
      .update(body)
      .digest("hex");

    return expectedSignature === signature;
  }

  async markSuccess(
    razorpayOrderId: string,
    razorpayPaymentId: string,
    gatewayResponse: any
  ): Promise<any> {
    const payment = await this.paymentRepository.getPaymentByOrderId(razorpayOrderId);
    if (!payment) {
      throw new Error(`Payment record not found for Order ID ${razorpayOrderId}`);
    }

    if (payment.status === "SUCCESS") {
      return payment;
    }

    const updatedPayment = await this.paymentRepository.updatePayment(
      payment.id,
      {
        status: "SUCCESS",
        razorpayPaymentId,
        gatewayResponse: gatewayResponse || {},
      },
      {
        fromStatus: payment.status,
        toStatus: "SUCCESS",
        action: "PAYMENT_VERIFIED",
        metadata: { razorpayPaymentId, gatewayResponse },
      }
    );

    // Update Booking status to CONFIRMED
    const updatedBooking = await prisma.booking.update({
      where: { id: payment.bookingId },
      data: {
        paymentStatus: "SUCCESS",
        bookingStatus: "CONFIRMED",
        paymentId: razorpayPaymentId,
      },
      include: {
        vehicle: true,
        variant: true,
      },
    });

    // Emit event notifications
    bookingNotificationEvents.emit("booking.payment_success", updatedBooking);
    bookingNotificationEvents.emit("booking.confirmed", updatedBooking);

    return updatedPayment;
  }

  async markFailed(
    razorpayOrderId: string,
    razorpayPaymentId: string | null,
    errorMetadata: any
  ): Promise<any> {
    const payment = await this.paymentRepository.getPaymentByOrderId(razorpayOrderId);
    if (!payment) {
      throw new Error(`Payment record not found for Order ID ${razorpayOrderId}`);
    }

    const updatedPayment = await this.paymentRepository.updatePayment(
      payment.id,
      {
        status: "FAILED",
        razorpayPaymentId: razorpayPaymentId || payment.razorpayPaymentId,
        gatewayResponse: errorMetadata || {},
      },
      {
        fromStatus: payment.status,
        toStatus: "FAILED",
        action: "PAYMENT_FAILED",
        metadata: { razorpayPaymentId, errorMetadata },
      }
    );

    // Update Booking status
    const updatedBooking = await prisma.booking.update({
      where: { id: payment.bookingId },
      data: {
        paymentStatus: "FAILED",
        paymentId: razorpayPaymentId || undefined,
      },
      include: {
        vehicle: true,
        variant: true,
      },
    });

    // Emit event notification
    bookingNotificationEvents.emit("booking.payment_failed", updatedBooking);

    return updatedPayment;
  }

  async markRefunded(razorpayOrderId: string, refundMetadata: any): Promise<any> {
    const payment = await this.paymentRepository.getPaymentByOrderId(razorpayOrderId);
    if (!payment) {
      throw new Error(`Payment record not found for Order ID ${razorpayOrderId}`);
    }

    const updatedPayment = await this.paymentRepository.updatePayment(
      payment.id,
      {
        status: "REFUNDED",
        gatewayResponse: refundMetadata || {},
      },
      {
        fromStatus: payment.status,
        toStatus: "REFUNDED",
        action: "PAYMENT_REFUNDED",
        metadata: refundMetadata,
      }
    );

    // Update Booking status
    const updatedBooking = await prisma.booking.update({
      where: { id: payment.bookingId },
      data: {
        paymentStatus: "REFUNDED",
        bookingStatus: "REFUNDED",
      },
      include: {
        vehicle: true,
        variant: true,
      },
    });

    // Emit event notification
    bookingNotificationEvents.emit("booking.refund_processed", updatedBooking);

    return updatedPayment;
  }

  async requestRefund(paymentId: string, amount?: number, reason?: string): Promise<any> {
    const payment = await this.paymentRepository.getPaymentById(paymentId);
    if (!payment) {
      throw new Error(`Payment record ${paymentId} not found`);
    }

    const eligibleStatuses = ["SUCCESS", "PARTIAL_REFUND"];
    if (!eligibleStatuses.includes(payment.status)) {
      throw new Error(`Payment is not eligible for refund. Current status: ${payment.status}`);
    }

    // Get previous refunds to check total remaining refundable balance
    const audits = await prisma.paymentAudit.findMany({
      where: { paymentId },
    });

    let totalRefunded = 0;
    audits.forEach((audit) => {
      if (audit.toStatus === "REFUNDED" || audit.toStatus === "PARTIAL_REFUND") {
        const meta = audit.metadata as any;
        if (meta && meta.amount) {
          totalRefunded += meta.amount;
        }
      }
    });

    const maxRefundable = payment.amount - totalRefunded;
    const refundAmount = amount !== undefined ? amount : maxRefundable;

    if (refundAmount <= 0) {
      throw new Error("No refundable balance remains on this payment");
    }

    if (refundAmount > maxRefundable) {
      throw new Error(`Requested refund (₹${refundAmount}) exceeds maximum refundable balance (₹${maxRefundable})`);
    }

    const targetPaymentStatus = refundAmount === maxRefundable ? "REFUNDED" : "PARTIAL_REFUND";

    // Update payment to REFUND_PROCESSING (do not automatically call Razorpay api yet)
    const updatedPayment = await this.paymentRepository.updatePayment(
      payment.id,
      {
        status: "REFUND_PROCESSING",
      },
      {
        fromStatus: payment.status,
        toStatus: "REFUND_PROCESSING",
        action: "ADMIN_INITIATED_REFUND",
        metadata: {
          requestedAmount: refundAmount,
          reason: reason || "Admin Request",
          targetStatus: targetPaymentStatus,
        },
      }
    );

    // Also update Booking status to REFUND_PROCESSING
    const updatedBooking = await prisma.booking.update({
      where: { id: payment.bookingId },
      data: {
        paymentStatus: "REFUND_PROCESSING",
      },
      include: {
        vehicle: true,
        variant: true,
      },
    });

    // Execute the mock interface call
    await this.executeMockRazorpayRefund(payment.id, refundAmount, reason);

    // Emit event notification since mock refund executes instantly
    bookingNotificationEvents.emit("booking.refund_processed", updatedBooking);

    return updatedPayment;
  }

  async executeMockRazorpayRefund(paymentId: string, amount: number, reason?: string): Promise<any> {
    console.log(`[MOCK RAZORPAY REFUND] Dispatching refund request to Razorpay for payment ${paymentId}, amount: ₹${amount}, reason: ${reason || "none"}`);
    
    // Simulate Razorpay API Response object
    return {
      id: `rfnd_${crypto.randomBytes(8).toString("hex")}`,
      entity: "refund",
      amount: amount * 100, // paise
      currency: "INR",
      payment_id: paymentId,
      notes: {
        reason: reason || "Admin Request",
      },
      created_at: Math.floor(Date.now() / 1000),
      status: "processed",
    };
  }
}
