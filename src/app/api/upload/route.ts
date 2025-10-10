import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import {
  uploadCourseImage,
  validateFileType,
  validateFileSize,
  ALLOWED_IMAGE_TYPES,
  MAX_IMAGE_SIZE,
} from "@/lib/blob";
import { isBlobStorageConfigured } from "@/lib/storage-types";

export async function POST(request: NextRequest) {
  try {
    // Check if blob storage is configured
    if (!isBlobStorageConfigured()) {
      return NextResponse.json(
        {
          success: false,
          error: "Blob storage is not configured. Please set BLOB_READ_WRITE_TOKEN.",
        },
        { status: 500 },
      );
    }

    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const courseSlug = formData.get("courseSlug") as string | null;
    const imageType = (formData.get("imageType") as string) || "gallery";

    // Validate inputs
    if (!file) {
      return NextResponse.json({ success: false, error: "No file provided" }, { status: 400 });
    }

    if (!courseSlug) {
      return NextResponse.json(
        { success: false, error: "Course slug is required" },
        { status: 400 },
      );
    }

    // Validate image type
    const validImageTypes = ["hero", "gallery", "logo", "facility"];
    if (!validImageTypes.includes(imageType)) {
      return NextResponse.json(
        {
          success: false,
          error: `Invalid image type. Allowed: ${validImageTypes.join(", ")}`,
        },
        { status: 400 },
      );
    }

    // Validate file type
    try {
      validateFileType(file, ALLOWED_IMAGE_TYPES);
    } catch (error) {
      return NextResponse.json(
        {
          success: false,
          error: error instanceof Error ? error.message : "Invalid file type",
        },
        { status: 400 },
      );
    }

    // Validate file size
    try {
      validateFileSize(file, MAX_IMAGE_SIZE);
    } catch (error) {
      return NextResponse.json(
        {
          success: false,
          error: error instanceof Error ? error.message : "File too large",
        },
        { status: 400 },
      );
    }

    // Upload to blob storage
    const result = await uploadCourseImage(
      courseSlug,
      file,
      imageType as "hero" | "gallery" | "logo" | "facility",
    );

    return NextResponse.json({
      success: true,
      data: {
        url: result.url,
        pathname: result.pathname,
        contentType: result.contentType,
      },
    });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Upload failed",
      },
      { status: 500 },
    );
  }
}

// Example GET endpoint to list uploaded files
export async function GET(request: NextRequest) {
  try {
    if (!isBlobStorageConfigured()) {
      return NextResponse.json(
        {
          success: false,
          error: "Blob storage is not configured",
        },
        { status: 500 },
      );
    }

    const { searchParams } = new URL(request.url);
    const courseSlug = searchParams.get("courseSlug");

    if (!courseSlug) {
      return NextResponse.json(
        { success: false, error: "Course slug is required" },
        { status: 400 },
      );
    }

    // This would use the getCourseImages function from blob.ts
    // For now, return a placeholder response
    return NextResponse.json({
      success: true,
      message: "List course images endpoint",
      courseSlug,
      note: "Implement getCourseImages() to list actual files",
    });
  } catch (error) {
    console.error("List error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to list files",
      },
      { status: 500 },
    );
  }
}
