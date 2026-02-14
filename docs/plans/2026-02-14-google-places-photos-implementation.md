# Google Places Photos Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add golf course photos to club detail pages using Google Places API with ISR caching.

**Architecture:** Pre-store Google Place IDs in course JSON files. Fetch fresh photo URLs at build-time/ISR. Display as hero + 3-photo gallery with attribution.

**Tech Stack:** Next.js 16 App Router, Google Places API (New), TypeScript, Tailwind CSS

---

## Task 1: Add PlacePhoto Type and Extend Course Interface

**Files:**

- Modify: `src/types/course.ts:272-303`

**Step 1: Add PlacePhoto interface**

Add after line 260 (after `Source` interface):

```typescript
/**
 * Photo from Google Places API (runtime only, not persisted)
 */
export interface PlacePhoto {
  /** Temporary URL from Google (expires after ~1 hour) */
  url: string;
  /** Attribution HTML required by Google ToS */
  attributionHtml: string;
  /** Photo width in pixels */
  width: number;
  /** Photo height in pixels */
  height: number;
}
```

**Step 2: Add googlePlaceId to Course interface**

In the `Course` interface (around line 272-303), add after `coordinates`:

```typescript
export interface Course {
  slug: string;
  name: string;
  formerName: string | null;
  region: string;
  city: string;
  municipality: string;
  country: string;
  address: Address;
  coordinates: Coordinates | null;
  /** Google Place ID for fetching photos (optional) */
  googlePlaceId?: string;
  // ... rest of interface unchanged
```

**Step 3: Commit**

```bash
git add src/types/course.ts
git commit -m "feat(types): add PlacePhoto type and googlePlaceId field"
```

---

## Task 2: Create Google Places API Library

**Files:**

- Create: `src/lib/google-places.ts`

**Step 1: Create the Google Places API wrapper**

```typescript
/**
 * Google Places API (New) utility functions
 * For fetching place photos from Google Places API
 *
 * API Documentation: https://developers.google.com/maps/documentation/places/web-service/place-photos
 * Pricing: Place Photos $7 per 1,000 requests (first 1,000 free, $200/month credit)
 */

import type { PlacePhoto } from "@/types/course";

// Helper function to get API key (reads from env at runtime)
function getApiKey(): string | undefined {
  return process.env.GOOGLE_PLACES_API_KEY;
}

/**
 * Response structure from Google Places API (New) Place Details
 */
interface PlacesApiPhoto {
  name: string; // Format: "places/{place_id}/photos/{photo_reference}"
  widthPx: number;
  heightPx: number;
  authorAttributions: Array<{
    displayName: string;
    uri: string;
    photoUri: string;
  }>;
}

interface PlacesApiResponse {
  photos?: PlacesApiPhoto[];
}

/**
 * Search for a place by name and coordinates to get its Place ID
 * Used by migration script to populate googlePlaceId in JSON files
 *
 * @param name Golf club name (e.g., "Oslo Golfklubb")
 * @param lat Latitude
 * @param lng Longitude
 * @returns Place ID or null if not found
 */
export async function findPlaceId(name: string, lat: number, lng: number): Promise<string | null> {
  const apiKey = getApiKey();

  if (!apiKey) {
    console.error("GOOGLE_PLACES_API_KEY is not set");
    return null;
  }

  try {
    // Use Text Search (New) with location bias
    const url = "https://places.googleapis.com/v1/places:searchText";

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": apiKey,
        "X-Goog-FieldMask": "places.id,places.displayName",
      },
      body: JSON.stringify({
        textQuery: `${name} golf`,
        locationBias: {
          circle: {
            center: { latitude: lat, longitude: lng },
            radius: 5000, // 5km radius
          },
        },
        maxResultCount: 1,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Places API search error: ${response.status}`, errorText);
      return null;
    }

    const data = await response.json();

    if (data.places && data.places.length > 0) {
      return data.places[0].id;
    }

    return null;
  } catch (error) {
    console.error("Error searching for place:", error);
    return null;
  }
}

/**
 * Fetch photos for a place using Google Places API (New)
 *
 * @param placeId Google Place ID
 * @param maxPhotos Maximum number of photos to fetch (default 4)
 * @returns Array of PlacePhoto objects with temporary URLs
 */
export async function getPlacePhotos(
  placeId: string,
  maxPhotos: number = 4,
): Promise<PlacePhoto[]> {
  const apiKey = getApiKey();

  if (!apiKey) {
    console.error("GOOGLE_PLACES_API_KEY is not set");
    return [];
  }

  try {
    // Step 1: Get photo references from Place Details
    const detailsUrl = `https://places.googleapis.com/v1/places/${placeId}`;

    const detailsResponse = await fetch(detailsUrl, {
      method: "GET",
      headers: {
        "X-Goog-Api-Key": apiKey,
        "X-Goog-FieldMask": "photos",
      },
    });

    if (!detailsResponse.ok) {
      const errorText = await detailsResponse.text();
      console.error(`Places API details error: ${detailsResponse.status}`, errorText);
      return [];
    }

    const detailsData: PlacesApiResponse = await detailsResponse.json();

    if (!detailsData.photos || detailsData.photos.length === 0) {
      return [];
    }

    // Step 2: Get photo URLs (limited to maxPhotos)
    const photos: PlacePhoto[] = [];
    const photosToFetch = detailsData.photos.slice(0, maxPhotos);

    for (const photo of photosToFetch) {
      // Build photo URL with desired dimensions
      // Using 800px width for hero, smaller for gallery
      const photoUrl = `https://places.googleapis.com/v1/${photo.name}/media?key=${apiKey}&maxWidthPx=1200&maxHeightPx=800`;

      // Build attribution HTML from author attributions
      const attributionHtml =
        photo.authorAttributions
          ?.map(
            (attr) =>
              `<a href="${attr.uri}" target="_blank" rel="noopener">${attr.displayName}</a>`,
          )
          .join(", ") || "Google";

      photos.push({
        url: photoUrl,
        attributionHtml,
        width: photo.widthPx,
        height: photo.heightPx,
      });
    }

    return photos;
  } catch (error) {
    console.error("Error fetching place photos:", error);
    return [];
  }
}
```

**Step 2: Verify TypeScript compiles**

Run: `npx tsc --noEmit`
Expected: No errors

**Step 3: Commit**

```bash
git add src/lib/google-places.ts
git commit -m "feat(lib): add Google Places API wrapper for photos"
```

---

## Task 3: Create CoursePhotos Display Component

**Files:**

- Create: `src/components/courses/CoursePhotos.tsx`

**Step 1: Create the component**

```tsx
import Image from "next/image";
import type { PlacePhoto } from "@/types/course";

interface CoursePhotosProps {
  photos: PlacePhoto[];
  courseName: string;
}

/**
 * Displays course photos in hero + gallery layout
 * Hero: First photo, full width
 * Gallery: Remaining photos in 3-column grid
 *
 * Includes Google attribution as required by ToS
 */
export function CoursePhotos({ photos, courseName }: CoursePhotosProps) {
  if (photos.length === 0) {
    return null;
  }

  const [heroPhoto, ...galleryPhotos] = photos;

  return (
    <section className="mb-8">
      {/* Hero Photo */}
      <div className="relative aspect-[16/9] w-full overflow-hidden rounded-xl">
        <Image
          src={heroPhoto.url}
          alt={`${courseName} - hovedbilde`}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1200px"
          priority
        />
        {/* Attribution overlay */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent px-4 py-2">
          <p
            className="text-xs text-white/80"
            dangerouslySetInnerHTML={{
              __html: `Foto: ${heroPhoto.attributionHtml}`,
            }}
          />
        </div>
      </div>

      {/* Gallery Grid */}
      {galleryPhotos.length > 0 && (
        <div className="mt-3 grid grid-cols-3 gap-3">
          {galleryPhotos.map((photo, index) => (
            <div key={index} className="relative aspect-[4/3] overflow-hidden rounded-lg">
              <Image
                src={photo.url}
                alt={`${courseName} - bilde ${index + 2}`}
                fill
                className="object-cover transition-transform hover:scale-105"
                sizes="(max-width: 768px) 33vw, 300px"
              />
              {/* Small attribution tooltip on hover */}
              <div className="absolute inset-0 flex items-end bg-gradient-to-t from-black/40 to-transparent opacity-0 transition-opacity hover:opacity-100">
                <p
                  className="w-full truncate px-2 py-1 text-xs text-white/80"
                  dangerouslySetInnerHTML={{
                    __html: heroPhoto.attributionHtml,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
```

**Step 2: Verify component compiles**

Run: `npx tsc --noEmit`
Expected: No errors

**Step 3: Commit**

```bash
git add src/components/courses/CoursePhotos.tsx
git commit -m "feat(components): add CoursePhotos hero + gallery component"
```

---

## Task 4: Configure Next.js for Google Places Images

**Files:**

- Modify: `next.config.ts`

**Step 1: Read current config**

Read the current next.config.ts to understand existing structure.

**Step 2: Add Google Places domain to images config**

Add `places.googleapis.com` to the images.remotePatterns array:

```typescript
{
  protocol: "https",
  hostname: "places.googleapis.com",
  pathname: "/v1/**",
},
```

**Step 3: Commit**

```bash
git add next.config.ts
git commit -m "chore(config): allow Google Places images in Next.js"
```

---

## Task 5: Integrate Photos into Course Page

**Files:**

- Modify: `src/app/[region]/[course]/page.tsx`

**Step 1: Add ISR revalidation export**

At the top of the file (after imports), add:

```typescript
// Revalidate every 12 hours to keep photo URLs fresh
export const revalidate = 43200;
```

**Step 2: Import dependencies**

Add to imports section:

```typescript
import { getPlacePhotos } from "@/lib/google-places";
import { CoursePhotos } from "@/components/courses/CoursePhotos";
```

**Step 3: Fetch photos in page component**

In the `CoursePage` function, after getting the course data:

```typescript
// Fetch photos if Place ID exists
const photos = course.googlePlaceId ? await getPlacePhotos(course.googlePlaceId, 4) : [];
```

**Step 4: Add CoursePhotos to JSX**

Add the photos section after breadcrumbs, before the existing content:

```tsx
{
  photos.length > 0 && <CoursePhotos photos={photos} courseName={course.name} />;
}
```

**Step 5: Verify build works**

Run: `pnpm build`
Expected: Build succeeds (no photos shown yet, as no Place IDs exist)

**Step 6: Commit**

```bash
git add src/app/[region]/[course]/page.tsx
git commit -m "feat(course-page): integrate Google Places photos with ISR"
```

---

## Task 6: Create Place ID Migration Script

**Files:**

- Create: `scripts/fetch-place-ids.ts`

**Step 1: Create the migration script**

```typescript
/**
 * One-time migration script to fetch Google Place IDs for all courses
 *
 * Usage: npx tsx scripts/fetch-place-ids.ts
 *
 * This script:
 * 1. Reads all course JSON files
 * 2. Searches Google Places API to find Place ID
 * 3. Updates the JSON file with googlePlaceId field
 * 4. Logs progress and any courses that couldn't be matched
 */

import fs from "fs";
import path from "path";
import { findPlaceId } from "../src/lib/google-places";

const COURSES_DIR = path.join(process.cwd(), "content/courses");

interface CourseJson {
  slug: string;
  name: string;
  coordinates?: {
    lat: number;
    lng: number;
  } | null;
  googlePlaceId?: string;
  [key: string]: unknown;
}

async function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function main() {
  console.log("=== Google Place ID Migration ===\n");

  // Get all region directories
  const regions = fs
    .readdirSync(COURSES_DIR)
    .filter((f) => fs.statSync(path.join(COURSES_DIR, f)).isDirectory());

  let totalCourses = 0;
  let successCount = 0;
  let skippedCount = 0;
  let failedCount = 0;
  const failed: string[] = [];

  for (const region of regions) {
    const regionDir = path.join(COURSES_DIR, region);
    const files = fs.readdirSync(regionDir).filter((f) => f.endsWith(".json"));

    for (const file of files) {
      totalCourses++;
      const filePath = path.join(regionDir, file);
      const content = fs.readFileSync(filePath, "utf-8");
      const course: CourseJson = JSON.parse(content);

      // Skip if already has Place ID
      if (course.googlePlaceId) {
        console.log(`[SKIP] ${course.name} - already has Place ID`);
        skippedCount++;
        continue;
      }

      // Skip if no coordinates
      if (!course.coordinates?.lat || !course.coordinates?.lng) {
        console.log(`[SKIP] ${course.name} - no coordinates`);
        skippedCount++;
        continue;
      }

      console.log(`[FETCH] ${course.name}...`);

      const placeId = await findPlaceId(
        course.name,
        course.coordinates.lat,
        course.coordinates.lng,
      );

      if (placeId) {
        // Update JSON file
        course.googlePlaceId = placeId;
        fs.writeFileSync(filePath, JSON.stringify(course, null, 2) + "\n");
        console.log(`  ✓ Found: ${placeId}`);
        successCount++;
      } else {
        console.log(`  ✗ Not found`);
        failed.push(course.name);
        failedCount++;
      }

      // Rate limit: wait 200ms between requests
      await sleep(200);
    }
  }

  console.log("\n=== Summary ===");
  console.log(`Total courses: ${totalCourses}`);
  console.log(`Success: ${successCount}`);
  console.log(`Skipped: ${skippedCount}`);
  console.log(`Failed: ${failedCount}`);

  if (failed.length > 0) {
    console.log("\nCourses without Place ID:");
    failed.forEach((name) => console.log(`  - ${name}`));
  }
}

main().catch(console.error);
```

**Step 2: Add script to package.json**

In package.json scripts section, add:

```json
"fetch-place-ids": "tsx scripts/fetch-place-ids.ts"
```

**Step 3: Commit (but don't run yet)**

```bash
git add scripts/fetch-place-ids.ts package.json
git commit -m "feat(scripts): add Place ID migration script"
```

---

## Task 7: Run Migration and Test

**Step 1: Run the migration script**

Run: `pnpm fetch-place-ids`

Expected output:

- Progress for each course
- Summary showing success/fail counts
- List of any courses that couldn't be matched

**Step 2: Verify JSON files updated**

Run: `git status`

Expected: Multiple JSON files modified with new `googlePlaceId` field

**Step 3: Test locally**

Run: `pnpm dev`

Navigate to a course page that received a Place ID. Verify:

- Photos appear
- Attribution shows
- No console errors

**Step 4: Commit the updated JSON files**

```bash
git add content/courses/
git commit -m "data: add Google Place IDs to course files"
```

---

## Task 8: Final Verification

**Step 1: Run full build**

Run: `pnpm build`
Expected: Build succeeds

**Step 2: Test production build**

Run: `pnpm start`

Test several course pages:

- Course with photos: verify hero + gallery displays
- Course without Place ID: verify page renders cleanly (no photos section)

**Step 3: Verify ISR headers**

Check response headers for course pages:

```bash
curl -I http://localhost:3000/oslo/oslo-golfklubb
```

Look for: `Cache-Control` or `x-vercel-cache` headers

**Step 4: Final commit (if any fixes needed)**

```bash
git add .
git commit -m "fix: address any issues from testing"
```

---

## Success Criteria Checklist

- [ ] `PlacePhoto` type added to `src/types/course.ts`
- [ ] `googlePlaceId` field added to `Course` interface
- [ ] `src/lib/google-places.ts` created with `findPlaceId` and `getPlacePhotos`
- [ ] `src/components/courses/CoursePhotos.tsx` displays hero + gallery
- [ ] `next.config.ts` allows Google Places images
- [ ] Course page fetches and displays photos with ISR (12h)
- [ ] Migration script populates `googlePlaceId` in JSON files
- [ ] Photos show proper Google attribution
- [ ] Pages without photos render cleanly
- [ ] Build succeeds
