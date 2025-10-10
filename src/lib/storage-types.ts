/**
 * Storage and file upload related types
 */

export interface UploadResult {
  url: string;
  pathname: string;
  downloadUrl: string;
  size: number;
  uploadedAt: Date;
}

export interface FileValidationError {
  field: string;
  message: string;
  code: "INVALID_TYPE" | "FILE_TOO_LARGE" | "INVALID_DIMENSIONS" | "UPLOAD_FAILED";
}

export type ImageType = "hero" | "gallery" | "logo" | "facility" | "thumbnail";

export interface UploadOptions {
  maxSizeMB?: number;
  allowedTypes?: string[];
  optimize?: boolean;
  generateThumbnail?: boolean;
}

export interface ImageMetadata {
  width?: number;
  height?: number;
  format?: string;
  size: number;
}

export interface CourseImageUpload {
  courseSlug: string;
  imageType: ImageType;
  file: File;
  metadata?: Partial<ImageMetadata>;
}

// Environment configuration
export interface StorageConfig {
  blobReadWriteToken: string;
  maxImageSizeMB: number;
  maxDocumentSizeMB: number;
  enableFileUpload: boolean;
  enableImageOptimization: boolean;
}

/**
 * Get storage configuration from environment variables
 */
export function getStorageConfig(): StorageConfig {
  return {
    blobReadWriteToken: process.env.BLOB_READ_WRITE_TOKEN || "",
    maxImageSizeMB: parseInt(process.env.MAX_IMAGE_SIZE_MB || "10", 10),
    maxDocumentSizeMB: parseInt(process.env.MAX_DOCUMENT_SIZE_MB || "50", 10),
    enableFileUpload: process.env.ENABLE_FILE_UPLOAD !== "false",
    enableImageOptimization: process.env.ENABLE_IMAGE_OPTIMIZATION !== "false",
  };
}

/**
 * Check if blob storage is configured
 */
export function isBlobStorageConfigured(): boolean {
  return !!process.env.BLOB_READ_WRITE_TOKEN;
}
