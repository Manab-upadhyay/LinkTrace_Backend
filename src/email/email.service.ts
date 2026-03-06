import nodemailer from "nodemailer";
import dotenv from "dotenv";
import dns from "dns";

dotenv.config();

// Railway sometimes fails on IPv6 connections to Gmail. Force IPv4.
dns.setDefaultResultOrder("ipv4first");

// ── Transporter (Gmail SMTP) ──
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true, // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS, // Gmail App Password
  },
  tls: {
    rejectUnauthorized: false
  },
  // Force IPv4 in Node.js
  family: 4
} as any);


// ── Verify connection on startup ──
transporter.verify().then(() => {
  console.log("📧 Email service ready");
}).catch((err) => {
  console.error("📧 Email service error:", err.message);
});

// ── Generic send helper ──
interface SendMailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export async function sendMail({ to, subject, html, text }: SendMailOptions) {
  const info = await transporter.sendMail({
    from: `"LinkTrace" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    html,
    text: text ?? "",
  });
  return info;
}

// ── Pre-built templates ──

export async function sendWelcomeEmail(to: string, name: string) {
  return sendMail({
    to,
    subject: "Welcome to LinkTrace! 🚀",
    html: `
      <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 520px; margin: auto; padding: 32px; border-radius: 12px; background: #f9fafb;">
        <h2 style="color: #111827;">Hey ${name} 👋</h2>
        <p style="color: #374151; line-height: 1.6;">
          Welcome aboard! Your LinkTrace account is ready. Start shortening links, tracking clicks, and analyzing your audience.
        </p>
        <a href="http://localhost:5173/dashboard"
           style="display: inline-block; margin-top: 16px; padding: 12px 24px; background: #6366f1; color: #fff; border-radius: 8px; text-decoration: none; font-weight: 600;">
          Go to Dashboard →
        </a>
        <p style="margin-top: 24px; font-size: 12px; color: #9ca3af;">
          If you didn't create this account, you can safely ignore this email.
        </p>
      </div>
    `,
  });
}

export async function sendPasswordResetEmail(to: string, resetToken: string) {
  const resetLink = `http://localhost:5173/reset-password?token=${resetToken}`;
  return sendMail({
    to,
    subject: "Reset your LinkTrace password",
    html: `
      <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 520px; margin: auto; padding: 32px; border-radius: 12px; background: #f9fafb;">
        <h2 style="color: #111827;">Password Reset</h2>
        <p style="color: #374151; line-height: 1.6;">
          We received a request to reset your password. Click the button below to choose a new one. This link expires in 15 minutes.
        </p>
        <a href="${resetLink}"
           style="display: inline-block; margin-top: 16px; padding: 12px 24px; background: #6366f1; color: #fff; border-radius: 8px; text-decoration: none; font-weight: 600;">
          Reset Password
        </a>
        <p style="margin-top: 24px; font-size: 12px; color: #9ca3af;">
          If you didn't request this, just ignore this email — your password won't change.
        </p>
      </div>
    `,
  });
}
export async function SendOtp(to:string, otp:string){
  return sendMail({
    to,
    subject: "OTP for LinkTrace",
    html: `
      <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 520px; margin: auto; padding: 32px; border-radius: 12px; background: #f9fafb;">
        <h2 style="color: #111827;">OTP for LinkTrace</h2>
        <p style="color: #374151; line-height: 1.6;">
          Your OTP is ${otp}. It will expire in 15 minutes.
        </p>
        <p style="margin-top: 24px; font-size: 12px; color: #9ca3af;">
          If you didn't request this, just ignore this email — your password won't change.
        </p>
      </div>
    `,
  });
}
