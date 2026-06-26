import crypto from "crypto";
import { Request, Response } from "express";
import { prisma } from "../../config/db";
import { PaymentService } from "./paymentService";
import { PaymentRepository } from "./paymentRepository";
import { bookingNotificationEvents } from "../../services/bookingNotificationService";

const paymentService = new PaymentService();
const paymentRepository = new PaymentRepository();

export async function handleRazorpayWebhook(req: Request, res: Response): Promise<void> {
  try {
    const signature = req.headers["x-razorpay-signature"] as string;
    if (!signature) {
      res.status(400).json({ success: false, message: "Missing Razorpay signature header" });
      return;
    }

    const rawBody = (req as any).rawBody;
    if (!rawBody) {
      res.status(400).json({ success: false, message: "Missing raw request body buffer" });
      return;
    }

    // 1. Verify webhook signature
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET || "mock_webhook_secret";
    const expectedSignature = crypto
      .createHmac("sha256", secret)
      .update(rawBody)
      .digest("hex");

    if (expectedSignature !== signature) {
      res.status(400).json({ success: false, message: "Webhook signature verification failed" });
      return;
    }

    const payload = req.body;
    const eventId = payload.id;
    const eventType = payload.event;

    // Generate hash of raw payload for idempotency checking
    const payloadHash = crypto.createHash("sha256").update(rawBody).digest("hex");

    // 2. Extract transaction details based on event payload structure
    let orderId = "";
    let paymentId = "";
    let metadata: any = {};

    if (eventType === "payment.captured" || eventType === "payment.failed") {
      const paymentEntity = payload.payload?.payment?.entity;
      orderId = paymentEntity?.order_id;
      paymentId = paymentEntity?.id;
      metadata = {
        error_code: paymentEntity?.error_code,
        error_description: paymentEntity?.error_description,
      };
    } else if (eventType === "order.paid") {
      const orderEntity = payload.payload?.order?.entity;
      orderId = orderEntity?.id;
      // Extract payment ID if nested, or leave it empty for service updates
      paymentId = ""; 
    } else if (eventType === "refund.processed") {
      const refundEntity = payload.payload?.refund?.entity;
      paymentId = refundEntity?.payment_id;
      // Get order ID from payment record since refund payload does not include order ID
      if (paymentId) {
        const paymentRecord = await prisma.payment.findUnique({
          where: { razorpayPaymentId: paymentId },
        });
        if (paymentRecord) {
          orderId = paymentRecord.razorpayOrderId;
        }
      }
    }

    if (!orderId) {
      // Respond 200 to acknowledge webhook even if it's an unmapped payment event
      res.status(200).json({ success: true, message: "Webhook acknowledged but no active booking order mapping found" });
      return;
    }

    // Fetch local payment record
    const payment = await paymentRepository.getPaymentByOrderId(orderId);
    if (!payment) {
      res.status(200).json({ success: true, message: `No active transaction logged for Order ID ${orderId}` });
      return;
    }

    // 3. Idempotency Check: Verify if this payload has already been processed in audits
    const existingAudits = await prisma.paymentAudit.findMany({
      where: { paymentId: payment.id },
    });

    const isDuplicate = existingAudits.some((audit) => {
      const meta = audit.metadata as any;
      return meta && (meta.payload_hash === payloadHash || meta.eventId === eventId);
    });

    if (isDuplicate) {
      res.status(200).json({ success: true, message: "Duplicate webhook event ignored" });
      return;
    }

    // Audit context structure
    const auditMetadata = {
      eventId,
      eventType,
      payload_hash: payloadHash,
      metadata,
    };

    // 4. Update transaction status after cryptographically validating the signature
    let updatedPayment: any = null;

    if (eventType === "payment.captured" || eventType === "order.paid") {
      updatedPayment = await paymentRepository.updatePayment(
        payment.id,
        {
          status: "SUCCESS",
          razorpayPaymentId: paymentId || payment.razorpayPaymentId,
          gatewayResponse: payload,
        },
        {
          fromStatus: payment.status,
          toStatus: "SUCCESS",
          action: `WEBHOOK_${eventType.toUpperCase().replace(".", "_")}`,
          metadata: auditMetadata,
        }
      );

      // Update Booking status to CONFIRMED
      const updatedBooking = await prisma.booking.update({
        where: { id: payment.bookingId },
        data: {
          paymentStatus: "SUCCESS",
          bookingStatus: "CONFIRMED",
          paymentId: paymentId || payment.razorpayPaymentId || undefined,
        },
        include: {
          vehicle: true,
          variant: true,
        },
      });

      // Emit event notifications
      bookingNotificationEvents.emit("booking.payment_success", updatedBooking);
      bookingNotificationEvents.emit("booking.confirmed", updatedBooking);
    } else if (eventType === "payment.failed") {
      updatedPayment = await paymentRepository.updatePayment(
        payment.id,
        {
          status: "FAILED",
          razorpayPaymentId: paymentId || payment.razorpayPaymentId,
          gatewayResponse: payload,
        },
        {
          fromStatus: payment.status,
          toStatus: "FAILED",
          action: "WEBHOOK_PAYMENT_FAILED",
          metadata: auditMetadata,
        }
      );

      const updatedBooking = await prisma.booking.update({
        where: { id: payment.bookingId },
        data: {
          paymentStatus: "FAILED",
          paymentId: paymentId || undefined,
        },
        include: {
          vehicle: true,
          variant: true,
        },
      });

      // Emit event notification
      bookingNotificationEvents.emit("booking.payment_failed", updatedBooking);
    } else if (eventType === "refund.processed") {
      updatedPayment = await paymentRepository.updatePayment(
        payment.id,
        {
          status: "REFUNDED",
          gatewayResponse: payload,
        },
        {
          fromStatus: payment.status,
          toStatus: "REFUNDED",
          action: "WEBHOOK_REFUND_PROCESSED",
          metadata: auditMetadata,
        }
      );

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
    }

    res.status(200).json({
      success: true,
      message: "Webhook processed and recorded successfully",
      payment: updatedPayment || payment,
    });
  } catch (error: any) {
    console.error("Error processing webhook:", error);
    res.status(500).json({ success: false, message: error.message || "Internal server error" });
  }
}
