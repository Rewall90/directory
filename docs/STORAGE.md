# Storage & File Upload System

This document describes the file storage and upload system for the Golf Directory application using Vercel Blob Storage.

## Overview

The storage system handles:

- Course images (hero, gallery, logos, facility photos)
- File uploads with validation
- Image optimization and serving
- Secure blob storage management

## Setup

### 1. Environment Configuration

Add to your `.env` file:

```env
BLOB_READ_WRITE_TOKEN="your-vercel-blob-token"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

Get your Vercel Blob token from: https://vercel.com/dashboard/stores

### 2. Next.js Image Configuration

Already configured in `next.config.ts` to allow images from Vercel Blob Storage:

```typescript
images: {
  remotePatterns: [
    {
      protocol: "https",
      hostname: "**.public.blob.vercel-storage.com",
    },
    {
      protocol: "https",
      hostname: "**.blob.vercel-storage.com",
    },
  ],
}
```

## Storage Structure

Files are organized by course:

```
courses/
  ├── {course-slug}/
  │   ├── hero/
  │   │   └── {timestamp}.{ext}
  │   ├── gallery/
  │   │   └── {timestamp}.{ext}
  │   ├── logo/
  │   │   └── {timestamp}.{ext}
  │   └── facility/
  │       └── {timestamp}.{ext}
```

## Usage

### Uploading Files

#### Basic Upload

```typescript
import { uploadFile } from "@/lib/blob";

const result = await uploadFile("my-file.jpg", file, {
  access: "public",
  contentType: "image/jpeg",
});

console.log(result.url); // https://...blob.vercel-storage.com/...
```

#### Course Image Upload

```typescript
import { uploadCourseImage } from "@/lib/blob";

const result = await uploadCourseImage(
  "oslo-golf-club", // course slug
  file, // File or Blob
  "hero", // image type: "hero" | "gallery" | "logo" | "facility"
);
```

### File Validation

```typescript
import {
  validateFileType,
  validateFileSize,
  ALLOWED_IMAGE_TYPES,
  MAX_IMAGE_SIZE,
} from "@/lib/blob";

// Validate image type
validateFileType(file, ALLOWED_IMAGE_TYPES);

// Validate file size (10MB max for images)
validateFileSize(file, MAX_IMAGE_SIZE);
```

### Listing Files

```typescript
import { getCourseImages } from "@/lib/blob";

const { blobs } = await getCourseImages("oslo-golf-club");

blobs.forEach((blob) => {
  console.log(blob.url);
  console.log(blob.pathname);
  console.log(blob.size);
});
```

### Deleting Files

```typescript
import { deleteFile, deleteCourseImages } from "@/lib/blob";

// Delete single file
await deleteFile("https://...blob.vercel-storage.com/...");

// Delete all course images
await deleteCourseImages("oslo-golf-club");
```

## API Endpoints

### Upload Endpoint

`POST /api/upload`

Upload a course image:

```typescript
const formData = new FormData();
formData.append("file", fileInput.files[0]);
formData.append("courseSlug", "oslo-golf-club");
formData.append("imageType", "hero");

const response = await fetch("/api/upload", {
  method: "POST",
  body: formData,
});

const data = await response.json();
console.log(data.url); // Blob URL
```

### List Files Endpoint

`GET /api/upload?courseSlug=oslo-golf-club`

List all images for a course.

## Utility Functions

### File Validation

```typescript
import { validateFiles } from "@/lib/storage-utils";

const errors = validateFiles(files, {
  maxFiles: 10,
  allowedTypes: ["image/jpeg", "image/png"],
  maxSizeBytes: 10 * 1024 * 1024, // 10MB
});

if (errors.length > 0) {
  console.error("Validation errors:", errors);
}
```

### Image Metadata

```typescript
import { getImageMetadata } from "@/lib/storage-utils";

const metadata = await getImageMetadata(file);
console.log(metadata.width, metadata.height);
```

### Filename Utilities

```typescript
import { generateUniqueFilename, sanitizeFilename, getFileExtension } from "@/lib/storage-utils";

// Generate unique filename
const unique = generateUniqueFilename("photo.jpg", "course-hero");
// Result: "course-hero-photo-1696234567890-abc123.jpg"

// Sanitize filename
const safe = sanitizeFilename("My Photo (2024).jpg");
// Result: "my-photo-2024-.jpg"

// Get extension
const ext = getFileExtension("photo.jpg"); // "jpg"
```

## Displaying Images

Use Next.js Image component for optimized loading:

```typescript
import Image from "next/image";

<Image
  src={blobUrl}
  alt="Course photo"
  width={800}
  height={600}
  className="rounded-lg"
/>
```

## Configuration

### Environment Variables

| Variable                    | Description                               | Required |
| --------------------------- | ----------------------------------------- | -------- |
| `BLOB_READ_WRITE_TOKEN`     | Vercel Blob access token                  | Yes      |
| `NEXT_PUBLIC_APP_URL`       | Application base URL                      | Yes      |
| `MAX_IMAGE_SIZE_MB`         | Max image size in MB (default: 10)        | No       |
| `MAX_DOCUMENT_SIZE_MB`      | Max document size in MB (default: 50)     | No       |
| `ENABLE_FILE_UPLOAD`        | Enable file uploads (default: true)       | No       |
| `ENABLE_IMAGE_OPTIMIZATION` | Enable image optimization (default: true) | No       |

### Allowed File Types

**Images:**

- JPEG/JPG (`image/jpeg`)
- PNG (`image/png`)
- WebP (`image/webp`)
- GIF (`image/gif`)

### Size Limits

- **Images**: 10MB (configurable via `MAX_IMAGE_SIZE_MB`)
- **Documents**: 50MB (configurable via `MAX_DOCUMENT_SIZE_MB`)

## Best Practices

1. **Always validate files** before uploading
2. **Use descriptive filenames** that include course slug and image type
3. **Implement error handling** for failed uploads
4. **Delete unused files** to save storage costs
5. **Use Next.js Image component** for automatic optimization
6. **Set appropriate access levels** (public for course images)

## Security

- File type validation prevents malicious uploads
- File size limits prevent abuse
- Vercel Blob provides secure token-based authentication
- All uploads require valid `BLOB_READ_WRITE_TOKEN`

## Troubleshooting

### "Blob storage is not configured" error

Ensure `BLOB_READ_WRITE_TOKEN` is set in your `.env` file.

### Images not loading

1. Check that the blob URL is correct
2. Verify `remotePatterns` in `next.config.ts`
3. Ensure the blob has `public` access

### Upload fails with "File too large"

Check file size against `MAX_IMAGE_SIZE` or `MAX_DOCUMENT_SIZE` limits.

## Additional Resources

- [Vercel Blob Documentation](https://vercel.com/docs/storage/vercel-blob)
- [Next.js Image Optimization](https://nextjs.org/docs/app/building-your-application/optimizing/images)
