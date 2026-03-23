import type { ImageResult, GolfImageTarget } from "./types";

interface ValidationResult {
  valid: boolean;
  cleaned: ImageResult;
  errors: string[];
}

/**
 * Validate and clean image scrape results.
 */
export function validateResult(result: ImageResult, target: GolfImageTarget): ValidationResult {
  const errors: string[] = [];

  // Slug match check
  if (result.courseSlug !== target.courseSlug) {
    return {
      valid: false,
      cleaned: result,
      errors: [`Slug mismatch: got "${result.courseSlug}", expected "${target.courseSlug}"`],
    };
  }

  if (result.region !== target.regionSlug) {
    return {
      valid: false,
      cleaned: result,
      errors: [`Region mismatch: got "${result.region}", expected "${target.regionSlug}"`],
    };
  }

  // Images must be an array
  if (!Array.isArray(result.images)) {
    return {
      valid: false,
      cleaned: { ...result, images: [] },
      errors: ["images field is not an array"],
    };
  }

  // Validate each image metadata object
  const cleanedImages: any[] = [];
  for (const img of result.images) {
    if (typeof img !== "object" || !img) {
      errors.push("Invalid image metadata (not an object)");
      continue;
    }

    // Required fields
    if (!img.url || typeof img.url !== "string") {
      errors.push("Image missing valid url field");
      continue;
    }
    if (!img.filename || typeof img.filename !== "string") {
      errors.push("Image missing valid filename field");
      continue;
    }
    if (!img.alt || typeof img.alt !== "string") {
      errors.push("Image missing valid alt field");
      continue;
    }
    if (!img.alt_en || typeof img.alt_en !== "string") {
      errors.push("Image missing valid alt_en field");
      continue;
    }
    if (!img.credit || typeof img.credit !== "string") {
      errors.push("Image missing valid credit field");
      continue;
    }

    // URL validation
    if (img.url.length > 2048) {
      errors.push(`URL too long (${img.url.length} chars), skipping`);
      continue;
    }
    if (!img.url.startsWith("http://") && !img.url.startsWith("https://")) {
      errors.push(`Invalid URL protocol: ${img.url.slice(0, 80)}`);
      continue;
    }

    // Filename validation (should be descriptive slug without extension)
    if (img.filename.includes(".")) {
      errors.push(`Filename should not include extension: ${img.filename}`);
      // Remove extension for safety
      img.filename = img.filename.replace(/\.[^.]+$/, "");
    }

    // Skip duplicates
    if (!cleanedImages.find((i) => i.url === img.url)) {
      cleanedImages.push(img);
    }
  }

  // Cap at 5 images
  const capped = cleanedImages.slice(0, 5);
  if (cleanedImages.length > 5) {
    errors.push(`Capped from ${cleanedImages.length} to 5 images`);
  }

  return {
    valid: true,
    cleaned: { ...result, images: capped },
    errors,
  };
}
