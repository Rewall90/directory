import { mkdirSync, readFileSync, writeFileSync } from "fs";
import { join, extname } from "path";
import sharp from "sharp";
import type { ImageMetadata } from "./types";

const PUBLIC_DIR = join(__dirname, "..", "public", "courses");
const CONTENT_DIR = join(__dirname, "..", "content", "courses");

const TIMEOUT_MS = 15_000;
const MIN_SIZE = 5 * 1024; // 5KB
const MAX_SIZE = 10 * 1024 * 1024; // 10MB

/**
 * Download images from URLs, optimize with sharp, and save to public/courses/{slug}/
 * Returns array of image objects with src, alt, alt_en, credit, placeholder fields for the course JSON.
 */
export async function downloadAndOptimizeImages(
  imageMetadata: ImageMetadata[],
  courseSlug: string,
): Promise<
  Array<{
    src: string;
    alt: string;
    alt_en: string;
    credit: string;
    placeholder: string;
  }>
> {
  const dir = join(PUBLIC_DIR, courseSlug);
  mkdirSync(dir, { recursive: true });

  const imageObjects: Array<{
    src: string;
    alt: string;
    alt_en: string;
    credit: string;
    placeholder: string;
  }> = [];

  for (const metadata of imageMetadata) {
    try {
      // Download image
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

      const response = await fetch(metadata.url, {
        signal: controller.signal,
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        },
      });
      clearTimeout(timer);

      if (!response.ok) {
        console.log(`    Skip ${metadata.url.slice(0, 80)}: HTTP ${response.status}`);
        continue;
      }

      const contentType = (response.headers.get("content-type") || "")
        .split(";")[0]
        .trim()
        .toLowerCase();

      if (!contentType.startsWith("image/")) {
        console.log(`    Skip ${metadata.url.slice(0, 80)}: not an image (${contentType})`);
        continue;
      }

      const buffer = Buffer.from(await response.arrayBuffer());

      if (buffer.length < MIN_SIZE) {
        console.log(`    Skip ${metadata.url.slice(0, 80)}: too small (${buffer.length} bytes)`);
        continue;
      }

      if (buffer.length > MAX_SIZE) {
        console.log(
          `    Skip ${metadata.url.slice(0, 80)}: too large (${(buffer.length / 1024 / 1024).toFixed(1)}MB)`,
        );
        continue;
      }

      // Optimize with sharp: resize to max 1920px width, convert to WebP
      const outputFilename = `${metadata.filename}.webp`;
      const outputPath = join(dir, outputFilename);

      // Process image with sharp
      const sharpInstance = sharp(buffer);

      // Save optimized image
      await sharpInstance
        .clone()
        .resize({ width: 1920, withoutEnlargement: true })
        .webp({ quality: 82 })
        .toFile(outputPath);

      // Generate blur placeholder (10x7px thumbnail as base64)
      const placeholderBuffer = await sharpInstance
        .clone()
        .resize(10, 7, { fit: "inside" })
        .webp({ quality: 20 })
        .toBuffer();

      const placeholderBase64 = `data:image/webp;base64,${placeholderBuffer.toString("base64")}`;

      const relativePath = `/courses/${courseSlug}/${outputFilename}`;

      imageObjects.push({
        src: relativePath,
        alt: metadata.alt,
        alt_en: metadata.alt_en,
        credit: metadata.credit,
        placeholder: placeholderBase64,
      });

      console.log(
        `    Downloaded & optimized: ${outputFilename} (original: ${(buffer.length / 1024).toFixed(0)}KB)`,
      );

      // Cap at 5 images
      if (imageObjects.length >= 5) break;
    } catch (err: any) {
      const msg = err?.name === "AbortError" ? "timeout" : err?.message || "unknown error";
      console.log(`    Skip ${metadata.url.slice(0, 80)}: ${msg}`);
      continue;
    }
  }

  return imageObjects;
}

/**
 * Write image objects to a course's JSON file.
 * Only writes if the course currently has no images.
 */
export function mergeImages(
  regionSlug: string,
  courseSlug: string,
  imageObjects: Array<{
    src: string;
    alt: string;
    alt_en: string;
    credit: string;
    placeholder: string;
  }>,
): { success: boolean; error?: string } {
  const courseFile = join(CONTENT_DIR, regionSlug, `${courseSlug}.json`);

  let courseData: any;
  try {
    courseData = JSON.parse(readFileSync(courseFile, "utf-8"));
  } catch {
    return { success: false, error: `Could not read ${courseFile}` };
  }

  // Only write if course currently has no images
  if (courseData.images && courseData.images.length > 0) {
    return {
      success: false,
      error: `Course "${courseSlug}" already has ${courseData.images.length} images`,
    };
  }

  courseData.images = imageObjects;

  writeFileSync(courseFile, JSON.stringify(courseData, null, 2) + "\n", "utf-8");
  return { success: true };
}
