import { Resend } from "resend";

/**
 * Email Service for golfkart.no
 *
 * Sends transactional emails via Resend API
 * Configuration via RESEND_API_KEY environment variable
 */

let resendClient: Resend | null = null;

function getResend(): Resend {
  if (resendClient) return resendClient;

  if (!process.env.RESEND_API_KEY) {
    throw new Error("RESEND_API_KEY is not configured in environment variables.");
  }

  resendClient = new Resend(process.env.RESEND_API_KEY);
  return resendClient;
}

/**
 * Check if email service is configured
 */
export function isEmailConfigured(): boolean {
  return !!process.env.RESEND_API_KEY;
}

interface EmailAttachment {
  filename: string;
  content: string; // base64 content (without data URL prefix)
  contentType: string;
}

interface SendEmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  from?: string;
  replyTo?: string;
  attachments?: EmailAttachment[];
}

/**
 * Send email via Resend
 */
export async function sendEmail(options: SendEmailOptions): Promise<{
  success: boolean;
  messageId?: string;
  error?: string;
}> {
  try {
    const resend = getResend();

    const fromAddress = options.from || `golfkart.no <petter@golfkart.no>`;

    console.log("[Email] Sending email to:", options.to);

    const { data, error } = await resend.emails.send({
      from: fromAddress,
      to: Array.isArray(options.to) ? options.to : [options.to],
      subject: options.subject,
      html: options.html,
      text: options.text,
      replyTo: options.replyTo,
      attachments: options.attachments?.map((att) => ({
        filename: att.filename,
        content: Buffer.from(att.content, "base64"),
        contentType: att.contentType,
      })),
    });

    if (error) {
      console.error("[Email] Resend API error:", error);
      return { success: false, error: error.message };
    }

    console.log("[Email] Email sent successfully. ID:", data?.id);
    return { success: true, messageId: data?.id };
  } catch (error: unknown) {
    const typedError = error as Error;
    console.error("[Email] Failed to send email:", typedError);
    return { success: false, error: typedError.message };
  }
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
  const adminEmail = process.env.ADMIN_EMAIL || "petter@golfkart.no";

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
    replyTo: data.email,
  });
}

/**
 * Send review notification email to admin
 * Includes a copy-pasteable JSON snippet for quick approval
 */
interface ReviewImage {
  name: string;
  type: string;
  data: string; // base64 data URL
}

export async function sendReviewNotificationEmail(data: {
  courseSlug: string;
  courseName: string;
  author: string;
  rating: number;
  text: string;
  images?: ReviewImage[];
}): Promise<{ success: boolean; error?: string }> {
  const adminEmail = process.env.ADMIN_EMAIL || "petter@golfkart.no";

  const date = new Date().toISOString().split("T")[0];
  const stars = "\u2605".repeat(data.rating) + "\u2606".repeat(5 - data.rating);
  const hasImages = data.images && data.images.length > 0;

  const jsonSnippet = JSON.stringify(
    {
      author: data.author,
      rating: data.rating,
      text: data.text,
      date,
      ...(hasImages && {
        images: data.images!.map((img, i) => `/reviews/${data.courseSlug}/${i + 1}-${img.name}`),
      }),
    },
    null,
    2,
  );

  const imageNote = hasImages
    ? `<div style="margin-top: 15px; padding: 15px; background-color: #fffbeb; border: 1px solid #fde68a; border-radius: 4px;">
        <p style="margin: 0; color: #92400e; font-size: 13px;">
          <strong>${data.images!.length} bilde${data.images!.length > 1 ? "r" : ""} vedlagt.</strong>
          Lagre bildene i <code>public/reviews/${data.courseSlug}/</code>
        </p>
      </div>`
    : "";

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>Ny anmeldelse</title>
      </head>
      <body style="font-family: sans-serif; padding: 20px; background-color: #f5f5f5;">
        <div style="max-width: 600px; margin: 0 auto; background-color: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 5px rgba(0,0,0,0.1);">
          <h1 style="color: #333; border-bottom: 3px solid #d4a843; padding-bottom: 10px;">Ny anmeldelse</h1>

          <div style="margin: 20px 0;">
            <p style="margin: 10px 0;"><strong>Bane:</strong> ${data.courseName}</p>
            <p style="margin: 10px 0;"><strong>Fra:</strong> ${data.author}</p>
            <p style="margin: 10px 0;"><strong>Vurdering:</strong> <span style="color: #d4a843; font-size: 18px;">${stars}</span> (${data.rating}/5)</p>
            <p style="margin: 10px 0;"><strong>Dato:</strong> ${date}</p>
          </div>

          <div style="margin-top: 20px; padding: 20px; background-color: #f9fafb; border-left: 4px solid #d4a843; border-radius: 4px;">
            <h3 style="margin-top: 0; color: #555;">Anmeldelse:</h3>
            <p style="white-space: pre-wrap; line-height: 1.6; color: #333;">${data.text}</p>
          </div>

          ${imageNote}

          <div style="margin-top: 30px; padding: 20px; background-color: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 4px;">
            <h3 style="margin-top: 0; color: #166534;">For godkjenning — kopier til content/reviews/${data.courseSlug}.json:</h3>
            <pre style="background-color: #f8fafc; padding: 15px; border-radius: 4px; overflow-x: auto; font-size: 13px; line-height: 1.5;">${jsonSnippet}</pre>
          </div>

          <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
          <p style="font-size: 13px; color: #6b7280;">Sendt via golfkart.no anmeldelsessystem</p>
        </div>
      </body>
    </html>
  `;

  const text = `
Ny anmeldelse på golfkart.no

Bane: ${data.courseName}
Fra: ${data.author}
Vurdering: ${stars} (${data.rating}/5)
Dato: ${date}

Anmeldelse:
${data.text}
${hasImages ? `\n${data.images!.length} bilde(r) vedlagt. Lagre i public/reviews/${data.courseSlug}/\n` : ""}
---
JSON for godkjenning (legg til i content/reviews/${data.courseSlug}.json):

${jsonSnippet}
  `;

  // Prepare image attachments
  const attachments = data.images?.map((img, i) => ({
    filename: `${i + 1}-${img.name}`,
    content: img.data.split(",")[1] || img.data,
    contentType: img.type,
  }));

  return sendEmail({
    to: adminEmail,
    subject: `Ny anmeldelse: ${data.courseName} (${data.rating}/5)${hasImages ? ` [${data.images!.length} bilder]` : ""}`,
    html,
    text,
    attachments,
  });
}
