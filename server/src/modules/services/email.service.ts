import dotenv from "dotenv";
import { Resend } from "resend";

dotenv.config();

const getResend = () => new Resend(process.env.RESEND_API_KEY || 'no-key');
const from = process.env.EMAIL_FROM || "NitroPicks <onboarding@resend.dev>";

export const sendPassResetToken = async (userEmail: string, url: string) => {
  try {
    const { error } = await getResend().emails.send({
      from,
      to: [userEmail],
      subject: "Password Reset Token",
      html: `
        <p>
          Please click this <a href="${url}">reset link</a>
          to reset your password. This link is valid for 15 minutes.
        </p>
      `,
    });

    if (error) {
      console.error("Password reset email failed:", error);
    } else {
      console.log("Password reset email sent to:", userEmail);
    }
  } catch (err) {
    console.error("Password reset email failed:", err);
  }
};

export const sendEmailVerifOTP = async (userEmail: string, url: string) => {
  try {
    const { error } = await getResend().emails.send({
      from,
      to: [userEmail],
      subject: "Email Verification",
      html: `
        <h2>Email Verification</h2>
        <p>Click below to verify your account:</p>
        <a href="${url}">Verify</a>
      `,
    });

    if (error) {
      console.error("Verification email failed:", error);
    } else {
      console.log("Verification email sent to:", userEmail);
    }
  } catch (err) {
    console.error("Verification email failed:", err);
  }
};

export const sendSupportEmail = async (fromName: string, replyTo: string, subject: string, message: string) => {
  try {
    const supportEmail = process.env.SUPPORT_EMAIL || process.env.EMAIL_FROM || "support@nitropicks.xyz";
    const { error } = await getResend().emails.send({
      from,
      to: [supportEmail],
      replyTo: replyTo,
      subject: `[Support] ${subject}`,
      html: `
        <h2>Support Request from ${fromName}</h2>
        <p><strong>From:</strong> ${fromName} (${replyTo})</p>
        <p><strong>Subject:</strong> ${subject}</p>
        <hr />
        <p>${message.replace(/\n/g, '<br />')}</p>
      `,
    });

    if (error) {
      console.error("Support email failed:", error);
    } else {
      console.log("Support email sent from:", replyTo);
    }
  } catch (err) {
    console.error("Support email failed:", err);
  }
};
