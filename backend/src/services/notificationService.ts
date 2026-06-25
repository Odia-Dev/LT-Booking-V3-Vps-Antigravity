import { Lead, TestDrive } from "@prisma/client";

export class NotificationService {
  static async sendEmailNotification(lead: Lead): Promise<void> {
    console.log(`[Notification] Sending Email to Customer: ${lead.email}`);
    console.log(`Subject: Thank you for your enquiry - Laxmi Toyota`);
    console.log(`Body: Hello ${lead.name},\nThank you for reaching out regarding ${lead.type}. Our team will contact you shortly.`);
  }

  static async sendAdminNotification(lead: Lead): Promise<void> {
    console.log(`[Notification] Admin Alert: New Lead Received!`);
    console.log(`Details: Name: ${lead.name} | Phone: ${lead.phone} | Type: ${lead.type}`);
  }

  static async triggerWebhook(lead: Lead): Promise<void> {
    const webhookUrl = process.env.LEAD_WEBHOOK_URL;
    if (!webhookUrl) {
      console.log(`[Webhook] No LEAD_WEBHOOK_URL configured. Skipping webhook trigger.`);
      return;
    }

    console.log(`[Webhook] Triggering webhook for Lead ${lead.id} to ${webhookUrl}...`);
    try {
      const res = await fetch(webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ event: "lead.created", data: lead }),
      });
      console.log(`[Webhook] Webhook response status: ${res.status}`);
    } catch (err) {
      console.error(`[Webhook] Webhook trigger failed:`, err);
    }
  }

  static async triggerWhatsAppHook(lead: Lead): Promise<void> {
    // Future integration hook for WhatsApp API (e.g. Twilio, Meta Cloud API)
    console.log(`[WhatsApp Hook] Pre-integration trigger for lead: ${lead.phone}`);
    console.log(`Draft Message: Dear ${lead.name}, thanks for your Laxmi Toyota enquiry. Status: Registered.`);
  }

  // --- Extended Test Drive Notifications ---

  static async sendTestDriveEmailConfirmation(testDrive: any): Promise<void> {
    const email = testDrive.customer?.email || testDrive.lead?.email;
    const name = testDrive.customer?.name || testDrive.lead?.name || "Customer";
    if (!email) {
      console.log(`[Notification] No email address found for Test Drive ${testDrive.testDriveId}. Skipping Email.`);
      return;
    }

    console.log(`[Notification - Email] Sending Test Drive Confirmation to: ${email}`);
    console.log(`Subject: Confirmed: Your Toyota Test Drive Booking - ${testDrive.testDriveId}`);
    console.log(`Body: Hello ${name}, your test drive appointment has been registered for a ${testDrive.vehicle?.name || "Toyota"} (${testDrive.variant?.name || "Trim"}) on ${new Date(testDrive.preferredDate).toDateString()} during the ${testDrive.preferredTime} slot at our ${testDrive.branch?.name || "dealership"} branch.`);
  }

  static async sendTestDriveSMS(testDrive: any): Promise<void> {
    const phone = testDrive.customer?.phone || testDrive.lead?.phone;
    if (!phone) {
      console.log(`[Notification] No phone number found for Test Drive ${testDrive.testDriveId}. Skipping SMS.`);
      return;
    }

    console.log(`[Notification - SMS Hook] Triggering SMS via Gateway to: ${phone}`);
    console.log(`SMS Content: Laxmi Toyota: Test Drive ${testDrive.testDriveId} is confirmed for ${new Date(testDrive.preferredDate).toDateString()} (${testDrive.preferredTime}). Please bring a valid Driver's License.`);
  }

  static async sendTestDriveWhatsApp(testDrive: any): Promise<void> {
    const phone = testDrive.customer?.phone || testDrive.lead?.phone;
    if (!phone) {
      console.log(`[Notification] No phone number found for Test Drive ${testDrive.testDriveId}. Skipping WhatsApp.`);
      return;
    }

    console.log(`[Notification - WhatsApp Hook] Triggering WhatsApp message to: ${phone}`);
    console.log(`WhatsApp Template Name: test_drive_confirmation`);
    console.log(`WhatsApp Template Params: name=${testDrive.customer?.name || "Customer"}, id=${testDrive.testDriveId}, date=${new Date(testDrive.preferredDate).toDateString()}`);
  }

  static async sendTestDrivePushNotification(testDrive: any): Promise<void> {
    const customerId = testDrive.customerId;
    console.log(`[Notification - Push Hook] Triggering Push Notification to Customer User: ${customerId}`);
    console.log(`Push Title: Test Drive Scheduled!`);
    console.log(`Push Body: Your test drive booking ${testDrive.testDriveId} has been successfully scheduled. Click to view showroom location map.`);
  }
}
