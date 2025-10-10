/**
 * Storage utility functions
 */

import type { FileValidationError, ImageMetadata } from "./storage-types";

/**
 * Format file size in human-readable format
 * @param bytes - File size in bytes
 * @returns Formatted string (e.g., "2.5 MB")
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes";

  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

/**
 * Generate a unique filename with timestamp
 * @param originalName - Original file name
 * @param prefix - Optional prefix
 * @returns Unique filename
 */
export function generateUniqueFilename(originalName: string, prefix?: string): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 9);
  const extension = originalName.split(".").pop();
  const nameWithoutExt = originalName.replace(/\.[^/.]+$/, "");
  const sanitizedName = nameWithoutExt
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "-")
    .replace(/-+/g, "-")
    .substring(0, 50);

  const parts = [prefix, sanitizedName, timestamp, random].filter(Boolean);
  return `${parts.join("-")}.${extension}`;
}

/**
 * Extract MIME type from file
 * @param file - File or Blob
 * @returns MIME type or default
 */
export function getMimeType(file: File | Blob): string {
  return file.type || "application/octet-stream";
}

/**
 * Check if file is an image
 * @param file - File to check
 * @returns True if image
 */
export function isImage(file: File | Blob): boolean {
  const mimeType = getMimeType(file);
  return mimeType.startsWith("image/");
}

/**
 * Check if file is a PDF
 * @param file - File to check
 * @returns True if PDF
 */
export function isPDF(file: File | Blob): boolean {
  const mimeType = getMimeType(file);
  return mimeType === "application/pdf";
}

/**
 * Validate multiple files
 * @param files - Array of files to validate
 * @param options - Validation options
 * @returns Array of validation errors
 */
export function validateFiles(
  files: File[],
  options: {
    maxFiles?: number;
    allowedTypes?: string[];
    maxSizeBytes?: number;
  } = {},
): FileValidationError[] {
  const errors: FileValidationError[] = [];
  const { maxFiles = 10, allowedTypes, maxSizeBytes } = options;

  // Check file count
  if (files.length > maxFiles) {
    errors.push({
      field: "files",
      message: `Maximum ${maxFiles} files allowed. You selected ${files.length} files.`,
      code: "UPLOAD_FAILED",
    });
  }

  // Validate each file
  files.forEach((file, index) => {
    // Check file type
    if (allowedTypes && !allowedTypes.includes(file.type)) {
      errors.push({
        field: `file-${index}`,
        message: `Invalid file type: ${file.type}. Allowed types: ${allowedTypes.join(", ")}`,
        code: "INVALID_TYPE",
      });
    }

    // Check file size
    if (maxSizeBytes && file.size > maxSizeBytes) {
      errors.push({
        field: `file-${index}`,
        message: `File "${file.name}" is too large. Maximum size: ${formatFileSize(maxSizeBytes)}`,
        code: "FILE_TOO_LARGE",
      });
    }
  });

  return errors;
}

/**
 * Get image dimensions from file
 * @param file - Image file
 * @returns Promise with image metadata
 */
export async function getImageMetadata(file: File): Promise<ImageMetadata> {
  return new Promise((resolve, reject) => {
    if (!isImage(file)) {
      reject(new Error("File is not an image"));
      return;
    }

    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve({
        width: img.width,
        height: img.height,
        format: file.type,
        size: file.size,
      });
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Failed to load image"));
    };

    img.src = url;
  });
}

/**
 * Convert File to Base64 string
 * @param file - File to convert
 * @returns Promise with base64 string
 */
export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      if (typeof reader.result === "string") {
        resolve(reader.result);
      } else {
        reject(new Error("Failed to read file"));
      }
    };

    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

/**
 * Sanitize filename for safe storage
 * @param filename - Original filename
 * @returns Sanitized filename
 */
export function sanitizeFilename(filename: string): string {
  // Remove path separators and special characters
  return filename
    .replace(/[\/\\]/g, "")
    .replace(/[^a-zA-Z0-9._-]/g, "-")
    .replace(/-+/g, "-")
    .toLowerCase();
}

/**
 * Extract file extension
 * @param filename - Filename
 * @returns File extension (without dot)
 */
export function getFileExtension(filename: string): string {
  const parts = filename.split(".");
  return parts.length > 1 ? parts.pop()?.toLowerCase() || "" : "";
}
