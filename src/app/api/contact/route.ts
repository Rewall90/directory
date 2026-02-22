import { NextResponse } from "next/server";
import { sendContactFormEmail, isEmailConfigured } from "@/lib/email-service";

export async function POST(request: Request) {
  try {
    // Check if SMTP is configured
    if (!isEmailConfigured()) {
      console.error("[Contact API] Email service is not configured");
      return NextResponse.json(
        { error: "E-postkonfigurasjon mangler. Vennligst kontakt administrator." },
        { status: 500 },
      );
    }

    // Parse request body
    const body = await request.json();
    const { name, email, subject, message } = body;

    // Validate required fields
    if (!name || !email || !subject || !message) {
      return NextResponse.json({ error: "Alle felt er påkrevd" }, { status: 400 });
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: "Ugyldig e-postadresse" }, { status: 400 });
    }

    // Validate field lengths
    if (name.length > 100) {
      return NextResponse.json({ error: "Navnet er for langt (maks 100 tegn)" }, { status: 400 });
    }

    if (subject.length > 200) {
      return NextResponse.json({ error: "Emnet er for langt (maks 200 tegn)" }, { status: 400 });
    }

    if (message.length > 5000) {
      return NextResponse.json(
        { error: "Meldingen er for lang (maks 5000 tegn)" },
        { status: 400 },
      );
    }

    // Send email
    const result = await sendContactFormEmail({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      subject: subject.trim(),
      message: message.trim(),
    });

    if (!result.success) {
      console.error("[Contact API] Failed to send email:", result.error);
      return NextResponse.json(
        { error: "Kunne ikke sende e-post. Vennligst prøv igjen senere." },
        { status: 500 },
      );
    }

    console.log("[Contact API] Email sent successfully");
    return NextResponse.json({ success: true, message: "Melding sendt!" }, { status: 200 });
  } catch (error) {
    console.error("[Contact API] Error:", error);
    return NextResponse.json(
      { error: "En feil oppstod. Vennligst prøv igjen senere." },
      { status: 500 },
    );
  }
}
