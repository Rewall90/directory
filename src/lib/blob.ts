import { put, del, list, head, type PutBlobResult } from "@vercel/blob";

/**
 * Upload a file to Vercel Blob storage
 * @param filename - The name to save the file as
 * @param file - The file data (File, Blob, or Buffer)
 * @param options - Optional upload configuration
 * @returns Upload result with URL and metadata
 */
export async function uploadFile(
  filename: string,
  file: File | Blob | Buffer,
  options?: {
    access?: "public";
    contentType?: string;
    addRandomSuffix?: boolean;
  },
): Promise<PutBlobResult> {
  const { access = "public", contentType, addRandomSuffix = true } = options || {};

  return await put(filename, file, {
    access,
    contentType,
    addRandomSuffix,
  });
}

/**
 * Upload a course image
 * @param courseSlug - The course slug for organizing images
 * @param file - The image file
 * @param imageType - Type of image (hero, gallery, logo, etc.)
 * @returns Upload result with URL
 */
export async function uploadCourseImage(
  courseSlug: string,
  file: File | Blob,
  imageType: "hero" | "gallery" | "logo" | "facility" = "gallery",
): Promise<PutBlobResult> {
  const extension = file instanceof File ? file.name.split(".").pop() : "jpg";
  const filename = `courses/${courseSlug}/${imageType}/${Date.now()}.${extension}`;

  return await uploadFile(filename, file, {
    access: "public",
    contentType: file.type || "image/jpeg",
    addRandomSuffix: false,
  });
}

/**
 * Delete a file from Vercel Blob storage
 * @param url - The full URL of the blob to delete
 */
export async function deleteFile(url: string): Promise<void> {
  await del(url);
}

/**
 * Delete multiple files from Vercel Blob storage
 * @param urls - Array of blob URLs to delete
 */
export async function deleteFiles(urls: string[]): Promise<void> {
  await del(urls);
}

/**
 * List all blobs with optional prefix filter
 * @param prefix - Optional prefix to filter blobs (e.g., "courses/oslo-golf-club/")
 * @param options - Optional listing configuration
 * @returns List of blobs
 */
export async function listFiles(
  prefix?: string,
  options?: {
    limit?: number;
    cursor?: string;
  },
) {
  return await list({
    prefix,
    limit: options?.limit || 1000,
    cursor: options?.cursor,
  });
}

/**
 * Get metadata for a specific blob
 * @param url - The blob URL
 * @returns Blob metadata
 */
export async function getFileMetadata(url: string) {
  return await head(url);
}

/**
 * Get all images for a specific course
 * @param courseSlug - The course slug
 * @returns List of course image blobs
 */
export async function getCourseImages(courseSlug: string) {
  return await listFiles(`courses/${courseSlug}/`);
}

/**
 * Delete all images for a specific course
 * @param courseSlug - The course slug
 */
export async function deleteCourseImages(courseSlug: string): Promise<void> {
  const { blobs } = await getCourseImages(courseSlug);
  const urls = blobs.map((blob) => blob.url);

  if (urls.length > 0) {
    await deleteFiles(urls);
  }
}

/**
 * Validate file type for uploads
 * @param file - The file to validate
 * @param allowedTypes - Array of allowed MIME types
 * @returns True if valid, throws error if not
 */
export function validateFileType(file: File | Blob, allowedTypes: string[]): boolean {
  const fileType = file.type || "application/octet-stream";

  if (!allowedTypes.includes(fileType)) {
    throw new Error(`Invalid file type: ${fileType}. Allowed types: ${allowedTypes.join(", ")}`);
  }

  return true;
}

/**
 * Validate file size
 * @param file - The file to validate
 * @param maxSizeBytes - Maximum file size in bytes
 * @returns True if valid, throws error if not
 */
export function validateFileSize(file: File | Blob, maxSizeBytes: number): boolean {
  if (file.size > maxSizeBytes) {
    const maxSizeMB = maxSizeBytes / (1024 * 1024);
    const fileSizeMB = file.size / (1024 * 1024);
    throw new Error(
      `File size ${fileSizeMB.toFixed(2)}MB exceeds maximum allowed size of ${maxSizeMB}MB`,
    );
  }

  return true;
}

// Common validation configurations
export const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/gif",
];

export const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10MB
export const MAX_DOCUMENT_SIZE = 50 * 1024 * 1024; // 50MB
