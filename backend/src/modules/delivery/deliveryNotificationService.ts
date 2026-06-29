import { prisma } from "../../config/db";
import {
  MockEmailService,
  MockSmsService,
  MockWhatsAppService,
} from "../../services/bookingNotificationService";

// Partial shape of a delivery with relations for notification dispatch
interface DeliveryForNotification {
  id: string;
  bookingId: string;
  customerId?: string | null;
  scheduledDate: Date | null;
  branch?: { name: string; phone?: string | null; email?: string | null } | null;
}

export class DeliveryNotificationService {
  private emailService = new MockEmailService();
  private smsService = new MockSmsService();
  private whatsAppService = new MockWhatsAppService();

  // --------------------------------------------------------------------------
  // Internal: dispatch on all channels + log to DB
  // --------------------------------------------------------------------------
  private async dispatch(
    delivery: DeliveryForNotification,
    title: string,
    content: string,
    type: string
  ): Promise<void> {
    try {
      let email: string | null | undefined = undefined;
      let phone: string | null | undefined = undefined;

      if (delivery.customerId) {
        const customer = await prisma.user.findUnique({
          where: { id: delivery.customerId },
          select: { email: true, phone: true },
        });
        if (customer) {
          email = customer.email;
          phone = customer.phone;
        }
      }

      if (!email || !phone) {
        const booking = await prisma.booking.findUnique({
          where: { id: delivery.bookingId },
          select: { guestEmail: true, guestPhone: true },
        });
        if (booking) {
          email = email || booking.guestEmail;
          phone = phone || booking.guestPhone;
        }
      }

      if (!email && !phone) return;

      // 1. Email
      if (email) {
        await this.emailService.sendEmail(email, title, content);
        await prisma.notificationLog.create({
          data: {
            deliveryId: delivery.id,
            bookingId: delivery.bookingId,
            recipient: email,
            channel: "EMAIL",
            type,
            status: "SUCCESS",
            content,
          },
        });
      }

      // 2. SMS
      if (phone) {
        const smsBody = `${title}: ${content}`;
        await this.smsService.sendSms(phone, smsBody);
        await prisma.notificationLog.create({
          data: {
            deliveryId: delivery.id,
            bookingId: delivery.bookingId,
            recipient: phone,
            channel: "SMS",
            type,
            status: "SUCCESS",
            content: smsBody,
          },
        });

        // 3. WhatsApp
        await this.whatsAppService.sendWhatsApp(phone, "delivery_update", [title, content]);
        await prisma.notificationLog.create({
          data: {
            deliveryId: delivery.id,
            bookingId: delivery.bookingId,
            recipient: phone,
            channel: "WHATSAPP",
            type,
            status: "SUCCESS",
            content: smsBody,
          },
        });
      }

      // 4. Portal Alert (Notification model → shows in /dashboard/notifications)
      if (delivery.customerId) {
        await prisma.notification.create({
          data: {
            userId: delivery.customerId,
            title,
            content,
            type: "DELIVERY",
            isRead: false,
          },
        });
      }
    } catch (err) {
      console.error(`[DeliveryNotificationService] Failed dispatching "${type}":`, err);
    }
  }

  // --------------------------------------------------------------------------
  // Trigger: Vehicle Allocated
  // --------------------------------------------------------------------------
  async notifyVehicleAllocated(delivery: DeliveryForNotification): Promise<void> {
    const bookingRef = delivery.bookingId.slice(0, 8).toUpperCase();
    await this.dispatch(
      delivery,
      "Vehicle Allocated",
      `Great news! A vehicle has been allocated for your booking #${bookingRef}. Our team is now preparing your vehicle for handover.`,
      "DELIVERY_VEHICLE_ALLOCATED"
    );
  }

  // --------------------------------------------------------------------------
  // Trigger: Insurance Issued
  // --------------------------------------------------------------------------
  async notifyInsuranceComplete(delivery: DeliveryForNotification): Promise<void> {
    const bookingRef = delivery.bookingId.slice(0, 8).toUpperCase();
    await this.dispatch(
      delivery,
      "Insurance Issued",
      `The motor insurance policy has been successfully issued for your vehicle under booking #${bookingRef}.`,
      "DELIVERY_INSURANCE_COMPLETE"
    );
  }

  // --------------------------------------------------------------------------
  // Trigger: RTO Registration Completed
  // --------------------------------------------------------------------------
  async notifyRtoComplete(delivery: DeliveryForNotification): Promise<void> {
    const bookingRef = delivery.bookingId.slice(0, 8).toUpperCase();
    await this.dispatch(
      delivery,
      "RTO Registration Completed",
      `Vehicle RTO registration formalities have been completed for booking #${bookingRef}. Your vehicle is legally road-ready.`,
      "DELIVERY_RTO_COMPLETE"
    );
  }

  // --------------------------------------------------------------------------
  // Trigger: Delivery Scheduled
  // --------------------------------------------------------------------------
  async notifyDeliveryScheduled(delivery: DeliveryForNotification): Promise<void> {
    const dateStr = delivery.scheduledDate
      ? new Date(delivery.scheduledDate).toLocaleDateString("en-IN", {
          day: "2-digit",
          month: "short",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        })
      : "a date to be confirmed";
    const branchName = delivery.branch?.name || "our dealership branch";
    await this.dispatch(
      delivery,
      "Delivery Scheduled",
      `Your vehicle handover has been scheduled on ${dateStr} at ${branchName}. Please bring your original identity documents on the day.`,
      "DELIVERY_SCHEDULED"
    );
  }

  // --------------------------------------------------------------------------
  // Trigger: Delivery Reminder (1-day-before reminder)
  // --------------------------------------------------------------------------
  async notifyDeliveryReminder(delivery: DeliveryForNotification): Promise<void> {
    const dateStr = delivery.scheduledDate
      ? new Date(delivery.scheduledDate).toLocaleDateString("en-IN", {
          day: "2-digit",
          month: "short",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        })
      : "tomorrow";
    const branchPhone = delivery.branch?.phone;
    const contactLine = branchPhone
      ? ` For queries, contact us at ${branchPhone}.`
      : "";
    await this.dispatch(
      delivery,
      "Handover Reminder",
      `Friendly reminder: Your vehicle delivery is scheduled for ${dateStr}. Please bring your original identity papers.${contactLine}`,
      "DELIVERY_REMINDER"
    );
  }

  // --------------------------------------------------------------------------
  // Trigger: Vehicle Delivered
  // --------------------------------------------------------------------------
  async notifyVehicleDelivered(delivery: DeliveryForNotification): Promise<void> {
    await this.dispatch(
      delivery,
      "Vehicle Delivered 🎉",
      "Congratulations! Your brand new vehicle keys have been handed over. Welcome to the Laxmi Toyota family! Thank you for choosing us.",
      "DELIVERY_COMPLETED"
    );
  }
}
