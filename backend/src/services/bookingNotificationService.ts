import { EventEmitter } from "events";
import { prisma } from "../config/db";
import { Booking } from "@prisma/client";

// 1. Interfaces for Notification Channels
export interface IEmailService {
  sendEmail(to: string, subject: string, body: string): Promise<void>;
}

export interface ISmsService {
  sendSms(to: string, message: string): Promise<void>;
}

export interface IWhatsAppService {
  sendWhatsApp(to: string, templateName: string, parameters: string[]): Promise<void>;
}

// 2. Mocks / Stubs implementations of the channels
export class MockEmailService implements IEmailService {
  async sendEmail(to: string, subject: string, body: string): Promise<void> {
    console.log(`[MockEmailService] Dispatching Email to: ${to}`);
    console.log(`Subject: ${subject}`);
    console.log(`Body:\n${body}`);
  }
}

export class MockSmsService implements ISmsService {
  async sendSms(to: string, message: string): Promise<void> {
    console.log(`[MockSmsService] Dispatching SMS to: ${to}`);
    console.log(`Message: ${message}`);
  }
}

export class MockWhatsAppService implements IWhatsAppService {
  async sendWhatsApp(to: string, templateName: string, parameters: string[]): Promise<void> {
    console.log(`[MockWhatsAppService] Dispatching WhatsApp message to: ${to}`);
    console.log(`Template: ${templateName} | Parameters: ${parameters.join(", ")}`);
  }
}

// 3. Event-driven Booking Notification Handler
class BookingNotificationEmitter extends EventEmitter {}

export const bookingNotificationEvents = new BookingNotificationEmitter();

export class BookingNotificationService {
  private emailService: IEmailService;
  private smsService: ISmsService;
  private whatsAppService: IWhatsAppService;

  constructor(
    emailService: IEmailService = new MockEmailService(),
    smsService: ISmsService = new MockSmsService(),
    whatsAppService: IWhatsAppService = new MockWhatsAppService()
  ) {
    this.emailService = emailService;
    this.smsService = smsService;
    this.whatsAppService = whatsAppService;
    this.setupListeners();
  }

  private setupListeners() {
    bookingNotificationEvents.on("booking.created", async (booking: any) => {
      await this.handleBookingCreated(booking);
    });

    bookingNotificationEvents.on("booking.confirmed", async (booking: any) => {
      await this.handleBookingConfirmed(booking);
    });

    bookingNotificationEvents.on("booking.cancelled", async (booking: any) => {
      await this.handleBookingCancelled(booking);
    });

    bookingNotificationEvents.on("booking.payment_success", async (booking: any) => {
      await this.handlePaymentSuccessful(booking);
    });

    bookingNotificationEvents.on("booking.payment_failed", async (booking: any) => {
      await this.handlePaymentFailed(booking);
    });

    bookingNotificationEvents.on("booking.refund_processed", async (booking: any) => {
      await this.handleRefundProcessed(booking);
    });
  }

  private async logNotification(data: {
    bookingId: string;
    recipient: string;
    channel: string;
    type: string;
    status: string;
    content: string;
    errorMessage?: string;
  }) {
    try {
      await prisma.notificationLog.create({
        data: {
          bookingId: data.bookingId,
          recipient: data.recipient,
          channel: data.channel,
          type: data.type,
          status: data.status,
          content: data.content,
          errorMessage: data.errorMessage || null
        }
      });
    } catch (err) {
      console.error("[BookingNotificationService] Failed to write notification log:", err);
    }
  }

  // --- Handlers ---
  private async handleBookingCreated(booking: any) {
    const customer = booking.customer || await prisma.user.findUnique({ where: { id: booking.customerId } });
    if (!customer) return;

    const vehicleName = booking.vehicle?.name || "your selected vehicle";
    const variantName = booking.variant?.name || "";

    const emailBody = `Hello ${customer.name},\n\nYour booking request for the Toyota ${vehicleName} ${variantName} has been initiated successfully under Reference: ${booking.bookingId}.\n\nBooking Reservation Amount: INR ${booking.bookingAmount.toLocaleString()}.\n\nThank you,\nLaxmi Toyota`;
    const emailSubject = `Initiated: Toyota Booking Reservation - ${booking.bookingId}`;

    try {
      if (customer.email) {
        await this.emailService.sendEmail(customer.email, emailSubject, emailBody);
        await this.logNotification({
          bookingId: booking.id,
          recipient: customer.email,
          channel: "EMAIL",
          type: "BOOKING_CREATED",
          status: "SENT",
          content: emailBody
        });
      }

      if (customer.phone) {
        const smsContent = `Laxmi Toyota: Booking request ${booking.bookingId} is initiated for ${vehicleName}. Booking Amount: INR ${booking.bookingAmount.toLocaleString()}. Thank you!`;
        await this.smsService.sendSms(customer.phone, smsContent);
        await this.logNotification({
          bookingId: booking.id,
          recipient: customer.phone,
          channel: "SMS",
          type: "BOOKING_CREATED",
          status: "SENT",
          content: smsContent
        });

        await this.whatsAppService.sendWhatsApp(customer.phone, "booking_created", [
          customer.name || "Customer",
          booking.bookingId,
          vehicleName
        ]);
        await this.logNotification({
          bookingId: booking.id,
          recipient: customer.phone,
          channel: "WHATSAPP",
          type: "BOOKING_CREATED",
          status: "SENT",
          content: `WhatsApp: Template booking_created triggered for ${booking.bookingId}`
        });
      }
    } catch (err: any) {
      console.error("[BookingNotificationService] Error executing booking.created triggers:", err);
    }
  }

  private async handleBookingConfirmed(booking: any) {
    const customer = booking.customer || await prisma.user.findUnique({ where: { id: booking.customerId } });
    if (!customer) return;

    const vehicleName = booking.vehicle?.name || "your Toyota";
    const emailBody = `Hello ${customer.name},\n\nWe are pleased to inform you that your booking reservation ${booking.bookingId} for the Toyota ${vehicleName} has been Confirmed by the dealership.\n\nOur coordinator will follow up on allocation timeline shortly.\n\nThank you,\nLaxmi Toyota`;
    const emailSubject = `Confirmed: Toyota Booking Reservation - ${booking.bookingId}`;

    try {
      if (customer.email) {
        await this.emailService.sendEmail(customer.email, emailSubject, emailBody);
        await this.logNotification({
          bookingId: booking.id,
          recipient: customer.email,
          channel: "EMAIL",
          type: "BOOKING_CONFIRMED",
          status: "SENT",
          content: emailBody
        });
      }

      if (customer.phone) {
        const smsContent = `Laxmi Toyota: Good news! Your booking reservation ${booking.bookingId} has been Confirmed by the dealership.`;
        await this.smsService.sendSms(customer.phone, smsContent);
        await this.logNotification({
          bookingId: booking.id,
          recipient: customer.phone,
          channel: "SMS",
          type: "BOOKING_CONFIRMED",
          status: "SENT",
          content: smsContent
        });

        await this.whatsAppService.sendWhatsApp(customer.phone, "booking_confirmed", [
          customer.name || "Customer",
          booking.bookingId,
          vehicleName
        ]);
        await this.logNotification({
          bookingId: booking.id,
          recipient: customer.phone,
          channel: "WHATSAPP",
          type: "BOOKING_CONFIRMED",
          status: "SENT",
          content: `WhatsApp: Template booking_confirmed triggered for ${booking.bookingId}`
        });
      }
    } catch (err: any) {
      console.error("[BookingNotificationService] Error executing booking.confirmed triggers:", err);
    }
  }

  private async handleBookingCancelled(booking: any) {
    const customer = booking.customer || await prisma.user.findUnique({ where: { id: booking.customerId } });
    if (!customer) return;

    const emailBody = `Hello ${customer.name},\n\nYour booking reservation ${booking.bookingId} has been Cancelled in our system.\n\nIf this was done in error or you require refund details, please contact your showroom branch coordinator.\n\nThank you,\nLaxmi Toyota`;
    const emailSubject = `Cancelled: Toyota Booking Reservation - ${booking.bookingId}`;

    try {
      if (customer.email) {
        await this.emailService.sendEmail(customer.email, emailSubject, emailBody);
        await this.logNotification({
          bookingId: booking.id,
          recipient: customer.email,
          channel: "EMAIL",
          type: "BOOKING_CANCELLED",
          status: "SENT",
          content: emailBody
        });
      }

      if (customer.phone) {
        const smsContent = `Laxmi Toyota: Your booking reservation ${booking.bookingId} has been Cancelled. Contact showroom for refunds/re-booking.`;
        await this.smsService.sendSms(customer.phone, smsContent);
        await this.logNotification({
          bookingId: booking.id,
          recipient: customer.phone,
          channel: "SMS",
          type: "BOOKING_CANCELLED",
          status: "SENT",
          content: smsContent
        });
      }
    } catch (err: any) {
      console.error("[BookingNotificationService] Error executing booking.cancelled triggers:", err);
    }
  }

  private async handlePaymentSuccessful(booking: any) {
    const customer = booking.customer || await prisma.user.findUnique({ where: { id: booking.customerId } });
    if (!customer) return;

    const emailBody = `Hello ${customer.name},\n\nWe have successfully received the reservation payment of INR ${booking.bookingAmount.toLocaleString()} for your booking ${booking.bookingId}.\n\nYour payment status is updated to Successful.\n\nThank you,\nLaxmi Toyota`;
    const emailSubject = `Payment Successful: Toyota Booking Reservation - ${booking.bookingId}`;

    try {
      if (customer.email) {
        await this.emailService.sendEmail(customer.email, emailSubject, emailBody);
        await this.logNotification({
          bookingId: booking.id,
          recipient: customer.email,
          channel: "EMAIL",
          type: "PAYMENT_SUCCESSFUL",
          status: "SENT",
          content: emailBody
        });
      }

      if (customer.phone) {
        const smsContent = `Laxmi Toyota: Payment of INR ${booking.bookingAmount.toLocaleString()} for booking ${booking.bookingId} was Successful.`;
        await this.smsService.sendSms(customer.phone, smsContent);
        await this.logNotification({
          bookingId: booking.id,
          recipient: customer.phone,
          channel: "SMS",
          type: "PAYMENT_SUCCESSFUL",
          status: "SENT",
          content: smsContent
        });

        await this.whatsAppService.sendWhatsApp(customer.phone, "payment_success", [
          customer.name || "Customer",
          booking.bookingId,
          booking.bookingAmount.toString()
        ]);
        await this.logNotification({
          bookingId: booking.id,
          recipient: customer.phone,
          channel: "WHATSAPP",
          type: "PAYMENT_SUCCESSFUL",
          status: "SENT",
          content: `WhatsApp: Template payment_success triggered for ${booking.bookingId}`
        });
      }
    } catch (err: any) {
      console.error("[BookingNotificationService] Error executing booking.payment_success triggers:", err);
    }
  }

  private async handlePaymentFailed(booking: any) {
    const customer = booking.customer || await prisma.user.findUnique({ where: { id: booking.customerId } });
    if (!customer) return;

    const emailBody = `Hello ${customer.name},\n\nWe noticed a failed payment attempt for booking reservation reference ${booking.bookingId}.\n\nPlease try again using the payment link or contact the showroom branch coordinator.\n\nThank you,\nLaxmi Toyota`;
    const emailSubject = `Payment Failed: Toyota Booking Reservation - ${booking.bookingId}`;

    try {
      if (customer.email) {
        await this.emailService.sendEmail(customer.email, emailSubject, emailBody);
        await this.logNotification({
          bookingId: booking.id,
          recipient: customer.email,
          channel: "EMAIL",
          type: "PAYMENT_FAILED",
          status: "SENT",
          content: emailBody
        });
      }

      if (customer.phone) {
        const smsContent = `Laxmi Toyota: Payment failed for booking reservation ${booking.bookingId}. Please retry.`;
        await this.smsService.sendSms(customer.phone, smsContent);
        await this.logNotification({
          bookingId: booking.id,
          recipient: customer.phone,
          channel: "SMS",
          type: "PAYMENT_FAILED",
          status: "SENT",
          content: smsContent
        });

        await this.whatsAppService.sendWhatsApp(customer.phone, "payment_failed", [
          customer.name || "Customer",
          booking.bookingId
        ]);
        await this.logNotification({
          bookingId: booking.id,
          recipient: customer.phone,
          channel: "WHATSAPP",
          type: "PAYMENT_FAILED",
          status: "SENT",
          content: `WhatsApp: Template payment_failed triggered for ${booking.bookingId}`
        });
      }
    } catch (err: any) {
      console.error("[BookingNotificationService] Error executing booking.payment_failed triggers:", err);
    }
  }

  private async handleRefundProcessed(booking: any) {
    const customer = booking.customer || await prisma.user.findUnique({ where: { id: booking.customerId } });
    if (!customer) return;

    const emailBody = `Hello ${customer.name},\n\nWe have processed a refund of INR ${booking.bookingAmount.toLocaleString()} for your booking reservation ${booking.bookingId}.\n\nThe funds should be credited back to your original payment source within 5-7 business days.\n\nThank you,\nLaxmi Toyota`;
    const emailSubject = `Refund Processed: Toyota Booking Reservation - ${booking.bookingId}`;

    try {
      if (customer.email) {
        await this.emailService.sendEmail(customer.email, emailSubject, emailBody);
        await this.logNotification({
          bookingId: booking.id,
          recipient: customer.email,
          channel: "EMAIL",
          type: "REFUND_PROCESSED",
          status: "SENT",
          content: emailBody
        });
      }

      if (customer.phone) {
        const smsContent = `Laxmi Toyota: Refund of INR ${booking.bookingAmount.toLocaleString()} has been processed for booking ${booking.bookingId}.`;
        await this.smsService.sendSms(customer.phone, smsContent);
        await this.logNotification({
          bookingId: booking.id,
          recipient: customer.phone,
          channel: "SMS",
          type: "REFUND_PROCESSED",
          status: "SENT",
          content: smsContent
        });

        await this.whatsAppService.sendWhatsApp(customer.phone, "refund_processed", [
          customer.name || "Customer",
          booking.bookingId,
          booking.bookingAmount.toString()
        ]);
        await this.logNotification({
          bookingId: booking.id,
          recipient: customer.phone,
          channel: "WHATSAPP",
          type: "REFUND_PROCESSED",
          status: "SENT",
          content: `WhatsApp: Template refund_processed triggered for ${booking.bookingId}`
        });
      }
    } catch (err: any) {
      console.error("[BookingNotificationService] Error executing booking.refund_processed triggers:", err);
    }
  }
}

// Instantiate the service listener
export const bookingNotificationServiceInstance = new BookingNotificationService();
