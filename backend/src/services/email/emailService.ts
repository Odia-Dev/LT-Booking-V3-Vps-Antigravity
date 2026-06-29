import { Resend } from "resend";
import { 
  getVerificationEmailTemplate, 
  getPasswordResetTemplate,
  getBookingConfirmationTemplate 
} from "./emailTemplates";

const resend = new Resend(process.env.RESEND_API_KEY || "re_test");
const fromEmail = process.env.EMAIL_FROM || "onboarding@resend.dev";
const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";

export const sendVerificationEmail = async (email: string, name: string, token: string) => {
  try {
    const link = `${frontendUrl}/verify-email?token=${token}`;
    await resend.emails.send({
      from: fromEmail,
      to: email,
      subject: "Laxmi Toyota - Verify Your Email",
      html: getVerificationEmailTemplate(name, link),
    });
  } catch (error) {
    console.error("Error sending verification email:", error);
  }
};

export const sendPasswordResetEmail = async (email: string, name: string, token: string) => {
  try {
    const link = `${frontendUrl}/reset-password?token=${token}`;
    await resend.emails.send({
      from: fromEmail,
      to: email,
      subject: "Laxmi Toyota - Reset Your Password",
      html: getPasswordResetTemplate(name, link),
    });
  } catch (error) {
    console.error("Error sending password reset email:", error);
  }
};

export const sendBookingConfirmationEmail = async (email: string, name: string, bookingId: string, vehicleName: string) => {
  try {
    await resend.emails.send({
      from: fromEmail,
      to: email,
      subject: "Laxmi Toyota - Booking Confirmed",
      html: getBookingConfirmationTemplate(name, bookingId, vehicleName),
    });
  } catch (error) {
    console.error("Error sending booking email:", error);
  }
};
