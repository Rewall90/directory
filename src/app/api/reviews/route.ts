import { NextResponse } from "next/server";
import { sendReviewNotificationEmail, isEmailConfigured } from "@/lib/email-service";

interface ImagePayload {
  name: string;
  type: string;
  data: string; // base64 data URL
}

const MAX_IMAGES = 3;
const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB

export async function POST(request: Request) {
  try {
    if (!isEmailConfigured()) {
      console.error("[Reviews API] Email service is not configured");
      return NextResponse.json(
        { error: "E-postkonfigurasjon mangler. Vennligst prøv igjen senere." },
        { status: 500 },
      );
    }

    const body = await request.json();
    const { courseSlug, courseName, author, rating, text, images } = body;

    // Validate required fields
    if (!courseSlug || !author || !rating || !text) {
      return NextResponse.json({ error: "Alle felt er påkrevd." }, { status: 400 });
    }

    // Validate author length
    if (typeof author !== "string" || author.trim().length === 0 || author.length > 50) {
      return NextResponse.json({ error: "Navn må være mellom 1 og 50 tegn." }, { status: 400 });
    }

    // Validate rating
    if (typeof rating !== "number" || rating < 1 || rating > 5 || !Number.isInteger(rating)) {
      return NextResponse.json({ error: "Vurdering må være mellom 1 og 5." }, { status: 400 });
    }

    // Validate text
    if (typeof text !== "string" || text.trim().length === 0 || text.length > 1000) {
      return NextResponse.json(
        { error: "Anmeldelsen må være mellom 1 og 1000 tegn." },
        { status: 400 },
      );
    }

    // Validate images
    let validImages: ImagePayload[] = [];
    if (Array.isArray(images) && images.length > 0) {
      if (images.length > MAX_IMAGES) {
        return NextResponse.json({ error: `Maks ${MAX_IMAGES} bilder tillatt.` }, { status: 400 });
      }

      for (const img of images) {
        if (!img.data || !img.name || !img.type) continue;
        if (!img.type.startsWith("image/")) continue;

        // Check base64 size (roughly 4/3 of original)
        const base64Data = img.data.split(",")[1] || "";
        const sizeBytes = (base64Data.length * 3) / 4;
        if (sizeBytes > MAX_IMAGE_SIZE) {
          return NextResponse.json(
            { error: `${img.name} er for stort (maks 5 MB).` },
            { status: 400 },
          );
        }

        validImages.push(img);
      }
    }

    const result = await sendReviewNotificationEmail({
      courseSlug: courseSlug.trim(),
      courseName: courseName?.trim() || courseSlug,
      author: author.trim(),
      rating,
      text: text.trim(),
      images: validImages,
    });

    if (!result.success) {
      console.error("[Reviews API] Failed to send email:", result.error);
      return NextResponse.json(
        { error: "Kunne ikke sende anmeldelsen. Vennligst prøv igjen senere." },
        { status: 500 },
      );
    }

    console.log(
      "[Reviews API] Review notification sent for:",
      courseSlug,
      `(${validImages.length} images)`,
    );
    return NextResponse.json(
      { success: true, message: "Takk for din anmeldelse!" },
      { status: 200 },
    );
  } catch (error) {
    console.error("[Reviews API] Error:", error);
    return NextResponse.json(
      { error: "En feil oppstod. Vennligst prøv igjen senere." },
      { status: 500 },
    );
  }
}
