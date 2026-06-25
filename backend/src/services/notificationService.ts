import { Lead } from "@prisma/client";

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
}
