import nodemailer from "nodemailer";
import type { Transporter } from "nodemailer";

/**
 * SMTP Email Service for golfkart.no
 *
 * Sends emails via Dedia.no SMTP server
 * Configuration via environment variables
 */

let transporter: Transporter | null = null;

/**
 * Get or create SMTP transporter
 */
function getTransporter(): Transporter {
  if (transporter) {
    return transporter;
  }

  // Validate SMTP configuration
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
    throw new Error(
      "SMTP credentials not configured. Please set SMTP_HOST, SMTP_USER, and SMTP_PASS in environment variables.",
    );
  }

  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || "587"),
    secure: process.env.SMTP_SECURE === "true", // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
    // Optional: Configure connection timeout
    connectionTimeout: 10000, // 10 seconds
    greetingTimeout: 10000,
  });

  console.log("[SMTP] Transporter created with host:", process.env.SMTP_HOST);

  return transporter;
}

/**
 * Verify SMTP connection
 */
export async function verifySmtpConnection(): Promise<boolean> {
  try {
    const smtp = getTransporter();
    await smtp.verify();
    console.log("[SMTP] Connection verified successfully");
    return true;
  } catch (error) {
    console.error("[SMTP] Connection verification failed:", error);
    return false;
  }
}

interface SendEmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  from?: string;
  replyTo?: string;
}

/**
 * Send email via SMTP
 */
export async function sendEmail(options: SendEmailOptions): Promise<{
  success: boolean;
  messageId?: string;
  error?: string;
}> {
  try {
    const smtp = getTransporter();

    // Default from address
    const fromName = process.env.SMTP_FROM_NAME || "golfkart.no";
    const fromEmail = process.env.SMTP_FROM || process.env.SMTP_USER;
    const fromAddress = options.from || `${fromName} <${fromEmail}>`;

    // Default reply-to
    const replyTo = options.replyTo || process.env.SMTP_USER;

    const mailOptions = {
      from: fromAddress,
      replyTo,
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text,
    };

    console.log("[SMTP] Sending email to:", options.to);

    const info = await smtp.sendMail(mailOptions);

    console.log("[SMTP] Email sent successfully. Message ID:", info.messageId);

    return {
      success: true,
      messageId: info.messageId,
    };
  } catch (error: unknown) {
    const typedError = error as Error;
    console.error("[SMTP] Failed to send email:", typedError);
    return {
      success: false,
      error: typedError.message,
    };
  }
}

/**
 * Check if SMTP is configured
 */
export function isSmtpConfigured(): boolean {
  return !!(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);
}

/**
 * Send contact form email to admin
 */
export async function sendContactFormEmail(data: {
  name: string;
  email: string;
  subject: string;
  message: string;
}): Promise<{ success: boolean; error?: string }> {
  const adminEmail = process.env.ADMIN_EMAIL || process.env.SMTP_USER;

  if (!adminEmail) {
    return {
      success: false,
      error: "Admin email not configured. Set ADMIN_EMAIL or SMTP_USER in environment variables.",
    };
  }

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>Ny kontaktforespørsel</title>
      </head>
      <body style="font-family: sans-serif; padding: 20px; background-color: #f5f5f5;">
        <div style="max-width: 600px; margin: 0 auto; background-color: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 5px rgba(0,0,0,0.1);">
          <h1 style="color: #333; border-bottom: 3px solid #22c55e; padding-bottom: 10px;">Ny kontaktforespørsel</h1>

          <div style="margin: 20px 0;">
            <p style="margin: 10px 0;"><strong>Fra:</strong> ${data.name}</p>
            <p style="margin: 10px 0;"><strong>E-post:</strong> <a href="mailto:${data.email}">${data.email}</a></p>
            <p style="margin: 10px 0;"><strong>Emne:</strong> ${data.subject}</p>
          </div>

          <div style="margin-top: 30px; padding: 20px; background-color: #f9fafb; border-left: 4px solid #22c55e; border-radius: 4px;">
            <h3 style="margin-top: 0; color: #555;">Melding:</h3>
            <p style="white-space: pre-wrap; line-height: 1.6; color: #333;">${data.message}</p>
          </div>

          <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">

          <p style="font-size: 13px; color: #6b7280; margin: 10px 0;">
            Du kan svare direkte på denne e-posten for å kontakte avsenderen.
          </p>
          <p style="font-size: 13px; color: #6b7280; margin: 10px 0;">
            Sendt via golfkart.no kontaktskjema
          </p>
        </div>
      </body>
    </html>
  `;

  const text = `
Ny kontaktforespørsel fra golfkart.no

Fra: ${data.name}
E-post: ${data.email}
Emne: ${data.subject}

Melding:
${data.message}

---
Du kan svare direkte på denne e-posten for å kontakte avsenderen.
  `;

  return sendEmail({
    to: adminEmail,
    subject: `Kontaktskjema: ${data.subject}`,
    html,
    text,
    replyTo: data.email, // Allow direct reply to the sender
  });
}
