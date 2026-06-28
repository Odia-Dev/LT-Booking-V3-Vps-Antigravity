function maskEmail(email?: string | null): string {
  if (!email) return "N/A";
  const parts = email.split("@");
  if (parts.length !== 2) return "***";
  const [local, domain] = parts;
  if (local.length <= 2) return `${local[0]}***@${domain}`;
  return `${local[0]}***${local[local.length - 1]}@${domain}`;
}

function maskPhone(phone?: string | null): string {
  if (!phone) return "N/A";
  if (phone.length <= 6) return "***";
  return `${phone.slice(0, 3)}***${phone.slice(-3)}`;
}

function maskName(name?: string | null): string {
  if (!name) return "Customer";
  if (name.length <= 2) return "*";
  return `${name[0]}***${name[name.length - 1]}`;
}

export class FinanceNotificationService {
  static async notifyStatusChange(financeApp: any, oldStatus: string, newStatus: string): Promise<void> {
    // Only notify on specific status transitions
    const notifyStatuses = ["DOCUMENT_PENDING", "SANCTION_APPROVED", "SANCTION_REJECTED", "DISBURSED"];
    if (oldStatus === newStatus || !notifyStatuses.includes(newStatus)) {
      return;
    }

    const email = financeApp.customer?.email;
    const phone = financeApp.customer?.phone;
    const name = financeApp.customer?.name;
    const financeId = financeApp.financeId;
    const amount = financeApp.loanAmount ? `₹${financeApp.loanAmount}` : "your requested amount";

    let subject = "";
    let message = "";
    let whatsappTemplate = "";

    switch (newStatus) {
      case "DOCUMENT_PENDING":
        subject = `Action Required: Documents needed for your Finance Application ${financeId}`;
        message = `Dear ${maskName(name)}, we require additional documents to process your finance application (${financeId}). Please log in to your dashboard to upload the requested files.`;
        whatsappTemplate = "finance_documents_required";
        break;
      case "SANCTION_APPROVED":
        subject = `Great News! Your Loan for ${financeId} is Approved`;
        message = `Dear ${maskName(name)}, congratulations! Your vehicle loan application for ${amount} has been sanctioned by the bank. Our executive will reach out to you with the next steps.`;
        whatsappTemplate = "finance_loan_approved";
        break;
      case "SANCTION_REJECTED":
        subject = `Update on your Finance Application ${financeId}`;
        message = `Dear ${maskName(name)}, unfortunately your vehicle loan application (${financeId}) could not be approved at this time. Please contact our finance team for alternative options.`;
        whatsappTemplate = "finance_loan_rejected";
        break;
      case "DISBURSED":
        subject = `Disbursement Completed for Finance Application ${financeId}`;
        message = `Dear ${maskName(name)}, your loan of ${amount} has been successfully disbursed by the bank. Congratulations on your upcoming vehicle delivery!`;
        whatsappTemplate = "finance_disbursed";
        break;
    }

    // 1. Email Channel
    if (email) {
      console.log(`[Notification - Email] Sending to: ${maskEmail(email)}`);
      console.log(`Subject: ${subject}`);
      console.log(`Body: ${message}`);
    }

    // 2. SMS Channel
    if (phone) {
      console.log(`[Notification - SMS Hook] Triggering SMS via Gateway to: ${maskPhone(phone)}`);
      console.log(`SMS Content: Laxmi Toyota: ${message}`);
    }

    // 3. WhatsApp Channel
    if (phone) {
      console.log(`[Notification - WhatsApp Hook] Triggering WhatsApp message to: ${maskPhone(phone)}`);
      console.log(`WhatsApp Template Name: ${whatsappTemplate}`);
      console.log(`WhatsApp Template Params: name=${maskName(name)}, id=${financeId}`);
    }
  }
}
