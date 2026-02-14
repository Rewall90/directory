# Google Places Photos Implementation Design

**Date:** 2026-02-14
**Status:** Approved
**Author:** Claude (with user collaboration)

## Overview

Add golf course photos to Golfkart.no club detail pages using Google Places API. Photos will display as a hero image plus 3-photo gallery, fetched at build time with ISR revalidation.

## Goals

- Display 1 hero + 3 gallery photos per course page
- Stay within Google's free tier ($200/month credit)
- Comply with Google ToS (no permanent URL storage, proper attribution)
- Hide photos section gracefully when no photos available

## Requirements Summary

| Requirement      | Decision                                |
| ---------------- | --------------------------------------- |
| Place ID storage | Pre-fetch and store in JSON files       |
| Photo layout     | Hero image + 3-photo gallery            |
| Missing photos   | Hide section entirely (no placeholders) |
| Caching strategy | Build-time + ISR revalidation (12h)     |
| Photo count      | Minimal: 1 hero + 3 gallery             |

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        BUILD TIME                           │
├─────────────────────────────────────────────────────────────┤
│  content/courses/*.json    →    generateStaticParams()      │
│  (with googlePlaceId)            ↓                          │
│                            fetchPlacePhotos()               │
│                                  ↓                          │
│                            Static HTML with photos          │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                        RUNTIME                              │
├─────────────────────────────────────────────────────────────┤
│  User visits page  →  Cached static page served instantly   │
│                                                             │
│  ISR (every 12h)   →  Background revalidation               │
│                       → Fresh photo URLs fetched            │
│                       → Page re-rendered with new URLs      │
└─────────────────────────────────────────────────────────────┘
```

## Data Model

### Course JSON Extension

Add `googlePlaceId` field to course JSON files:

```typescript
interface Course {
  // ... existing fields
  googlePlaceId?: string; // Permanent Google Place identifier
}
```

### Runtime Photo Type (not persisted)

```typescript
interface PlacePhoto {
  url: string; // Temporary URL from Google (expires ~1h+)
  attribution: string; // Required by Google ToS
  width: number;
  height: number;
}
```

## New Files

### 1. `src/lib/google-places.ts`

API wrapper for Google Places interactions:

```typescript
// Find Place ID from coordinates (used by migration script)
export async function findPlaceId(lat: number, lng: number): Promise<string | null>;

// Fetch fresh photo URLs for display
export async function getPlacePhotos(placeId: string, maxPhotos: number = 4): Promise<PlacePhoto[]>;
```

### 2. `src/components/courses/CoursePhotos.tsx`

Display component with:

- Hero image (first photo, full width)
- Gallery grid (3 remaining photos)
- Google attribution overlay on each image
- Responsive layout (stacks on mobile)

### 3. `scripts/fetch-place-ids.ts`

One-time migration script:

- Iterates all 168 course JSON files
- Uses coordinates to find Google Place ID
- Updates JSON files with `googlePlaceId` field
- Logs courses where no Place ID found

## Page Integration

In `src/app/[region]/[course]/page.tsx`:

```typescript
export const revalidate = 43200; // 12 hours in seconds

export default async function CoursePage({ params }) {
  const course = await getCourse(params.course);

  // Only fetch if Place ID exists
  const photos = course.googlePlaceId
    ? await getPlacePhotos(course.googlePlaceId, 4)
    : [];

  return (
    <>
      {photos.length > 0 && (
        <CoursePhotos
          photos={photos}
          courseName={course.name}
        />
      )}
      {/* ... existing page content */}
    </>
  );
}
```

## Error Handling

| Scenario                                  | Handling                                             |
| ----------------------------------------- | ---------------------------------------------------- |
| No Place ID in JSON                       | Skip photo fetch, render page without photos section |
| Place ID exists but API returns no photos | Hide photos section entirely                         |
| API error or timeout                      | Log error, render page without photos section        |
| Fewer than 4 photos available             | Display what's available (1-3 photos)                |
| Invalid/expired Place ID                  | Log warning, hide photos section                     |

No fallback images or placeholders. Either real photos or no photos section.

## Cost Analysis

### One-Time Migration (Place ID fetch)

- 168 courses × 1 Find Place request = 168 requests
- Cost: **Free** (under 1,000/month threshold)

### Ongoing Photo Fetches

- ISR revalidates every 12 hours = max 2 fetches per course per day
- Worst case (all pages visited daily): 168 × 2 = 336 requests/day
- Monthly worst case: ~10,000 requests = ~$70 (covered by $200 credit)

### Realistic Estimate

- Not all 168 pages visited daily
- Estimated: 2,000-3,000 requests/month
- Cost: **Free** (within first 1,000 free + $200 credit)

## Google ToS Compliance

1. **No permanent URL storage** - Photo URLs fetched fresh, never saved to JSON
2. **Attribution required** - Display attribution text on each photo
3. **Place ID storage allowed** - Place IDs are permanent and can be stored
4. **No caching beyond session** - ISR revalidation keeps URLs fresh

## Success Criteria

- [ ] All 168 courses have `googlePlaceId` in JSON (where available)
- [ ] Photos display on course pages with proper attribution
- [ ] Pages without photos render cleanly (no broken images)
- [ ] ISR revalidation working (verify with headers)
- [ ] API costs stay within free tier

## Out of Scope

- Photo upload/management UI
- Multiple photo sources (only Google Places)
- Photo editing or cropping
- User-submitted photos
- Photo CDN/optimization (use Google's URLs directly)
