# JSON File-Based Storage Design

**Date:** 2026-02-12
**Status:** Approved
**Goal:** Replace PostgreSQL database with local JSON files for simpler AI-driven content management

---

## Overview

Migrate from Prisma/PostgreSQL to local JSON files. This simplifies the stack, enables direct AI editing, and provides free version control via git.

### Current State

- 168 golf courses across 17 regions
- PostgreSQL via Vercel Postgres
- Prisma ORM with 12 interconnected models
- 65+ ad-hoc TypeScript scripts for updates
- Weather updated via cron twice daily

### Target State

- One JSON file per course
- No database dependency
- AI edits files directly
- Git provides version history
- Weather fetched client-side

---

## JSON Schema

### File Structure

```
/content/courses/
  /agder/
    arendal-og-omegn-golfklubb.json
    kristiansand-golfklubb.json
  /akershus/
    asker-golfklubb.json
    baerum-golfklubb.json
  /oslo/
    bogstad-golfklubb.json
  ...
```

### Course File Schema

```json
{
  "slug": "asker-golfklubb",
  "name": "Asker Golfklubb",
  "formerName": null,
  "region": "Akershus",
  "city": "Asker",
  "municipality": "Asker",
  "country": "Norway",

  "address": {
    "street": "Vardåsveien 1",
    "postalCode": "1395",
    "area": null
  },

  "coordinates": {
    "lat": 59.8372,
    "lng": 10.4102,
    "accuracy": "rooftop"
  },

  "course": {
    "holes": 18,
    "par": 71,
    "lengthMeters": 5842,
    "lengthYards": 6390,
    "terrain": "Parkland",
    "courseType": "Full course",
    "designer": "Jeremy Turner",
    "yearBuilt": 1969,
    "yearRedesigned": null,
    "waterHazards": true,
    "signatureHole": "Hull 7 - Par 3 over vannet",
    "par3Count": 4,
    "par4Count": 10,
    "par5Count": 4
  },

  "description": "En vakker parkbane med modne trær og naturlige vannhindre...",

  "contact": {
    "phone": "+47 66 78 17 10",
    "email": "post@askergolf.no",
    "website": "https://askergolf.no",
    "facebook": "https://facebook.com/askergolf",
    "instagram": null,
    "golfbox": true
  },

  "phoneNumbers": [
    { "number": "+47 66 78 17 10", "type": "main", "primary": true },
    { "number": "+47 66 78 17 15", "type": "restaurant", "primary": false }
  ],

  "season": {
    "start": "April",
    "end": "Oktober",
    "winterUse": "Skiløyper og akebakke"
  },

  "visitors": {
    "welcome": true,
    "walkingAllowed": true,
    "nearbyCity": "Oslo",
    "distanceFromCenter": "25 km fra Oslo sentrum"
  },

  "facilities": {
    "drivingRange": true,
    "drivingRangeLength": 250,
    "drivingRangeNotes": "Overdekket, oppvarmet",
    "puttingGreen": true,
    "chippingArea": true,
    "practiceBunker": true,
    "clubhouse": true,
    "clubhouseName": "Klubbhuset",
    "proShop": true,
    "restaurant": true,
    "restaurantName": "Asker Golf Restaurant",
    "clubRental": true,
    "clubRentalNotes": "Titleist sett",
    "cartRental": true,
    "pullCartRental": true,
    "golfLessons": true,
    "teachingPro": true,
    "clubFitting": true,
    "lockerRooms": true,
    "showers": true,
    "conferenceRoom": true,
    "eventVenue": true,
    "eventCapacity": 120,
    "simulator": true,
    "simulatorType": "TrackMan",
    "bunkers": 42
  },

  "pricing": {
    "2025": {
      "currency": "NOK",
      "greenFeeWeekday": 750,
      "greenFeeWeekend": 850,
      "greenFeeSenior": 600,
      "greenFeeJunior": 300,
      "greenFeeDescription": "Greenfee inkluderer driving range...",
      "cartRental": 500,
      "pullCartRental": 100,
      "clubRental": 350,
      "specialOfferPrice": null,
      "specialOfferIncludes": null,
      "notes": "Rabatt for NGF-medlemmer"
    }
  },

  "membershipPricing": {
    "2025": [
      { "category": "full", "price": 12000, "description": "Fullt medlemskap", "ageRange": null },
      { "category": "junior", "price": 3000, "description": "Junior", "ageRange": "0-18" },
      { "category": "senior", "price": 8000, "description": "Senior", "ageRange": "67+" }
    ]
  },

  "ratings": {
    "google": { "rating": 4.5, "reviewCount": 234, "maxRating": 5, "url": "https://g.co/..." },
    "facebook": { "rating": 4.3, "reviewCount": 89, "maxRating": 5 }
  },

  "courseRatings": [
    { "teeColor": "Hvit", "gender": "men", "courseRating": 71.2, "slopeRating": 128, "par": 71 },
    { "teeColor": "Gul", "gender": "men", "courseRating": 69.5, "slopeRating": 124, "par": 71 },
    { "teeColor": "Rød", "gender": "women", "courseRating": 72.8, "slopeRating": 130, "par": 71 }
  ],

  "nearbyCourses": [
    { "slug": "baerum-golfklubb", "distanceKm": 8.2 },
    { "slug": "oslo-golfklubb", "distanceKm": 12.5 },
    { "slug": "groruddalen-golfklubb", "distanceKm": 15.1 },
    { "slug": "losby-golfklubb", "distanceKm": 22.3 }
  ],

  "additionalFeatures": [
    { "feature": "Footgolf", "description": "9 hull footgolf-bane" },
    { "feature": "Disc golf", "description": "18 hull disc golf" }
  ],

  "meta": {
    "dataQuality": "high",
    "completenessPercentage": 95,
    "scrapedAt": "2025-01-15T10:30:00Z",
    "updatedAt": "2025-02-10T12:00:00Z"
  }
}
```

---

## Data Loading Library

### File: `src/lib/courses.ts`

```typescript
import fs from "fs";
import path from "path";
import { cache } from "react";
import type { Course } from "@/types/course";

const COURSES_DIR = path.join(process.cwd(), "content/courses");

// Get all region folder names
export const getRegions = cache(async (): Promise<string[]> => {
  return fs
    .readdirSync(COURSES_DIR)
    .filter((f) => fs.statSync(path.join(COURSES_DIR, f)).isDirectory());
});

// Load single course by slug
export const getCourse = cache(async (slug: string): Promise<Course | null> => {
  const regions = await getRegions();

  for (const region of regions) {
    const filePath = path.join(COURSES_DIR, region, `${slug}.json`);
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, "utf-8");
      return JSON.parse(content);
    }
  }
  return null;
});

// Load all courses
export const getAllCourses = cache(async (): Promise<Course[]> => {
  const courses: Course[] = [];
  const regions = await getRegions();

  for (const region of regions) {
    const regionDir = path.join(COURSES_DIR, region);
    const files = fs.readdirSync(regionDir).filter((f) => f.endsWith(".json"));

    for (const file of files) {
      const content = fs.readFileSync(path.join(regionDir, file), "utf-8");
      courses.push(JSON.parse(content));
    }
  }

  return courses;
});

// Load courses by region
export const getCoursesByRegion = cache(async (regionSlug: string): Promise<Course[]> => {
  const regionDir = path.join(COURSES_DIR, regionSlug);

  if (!fs.existsSync(regionDir)) {
    return [];
  }

  const files = fs.readdirSync(regionDir).filter((f) => f.endsWith(".json"));

  return files.map((file) => {
    const content = fs.readFileSync(path.join(regionDir, file), "utf-8");
    return JSON.parse(content);
  });
});

// Get regions with course counts
export const getRegionsWithCounts = cache(
  async (): Promise<{ name: string; slug: string; count: number }[]> => {
    const regions = await getRegions();

    return regions.map((region) => {
      const regionDir = path.join(COURSES_DIR, region);
      const count = fs.readdirSync(regionDir).filter((f) => f.endsWith(".json")).length;
      return { name: getDisplayName(region), slug: region, count };
    });
  },
);
```

---

## API Routes

### Search API: `src/app/api/courses/route.ts`

```typescript
import { NextRequest, NextResponse } from "next/server";
import { getAllCourses } from "@/lib/courses";

let coursesCache: Course[] | null = null;

async function getCoursesCache() {
  if (!coursesCache) {
    coursesCache = await getAllCourses();
  }
  return coursesCache;
}

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get("q")?.toLowerCase();
  const courses = await getCoursesCache();

  if (!query) {
    return NextResponse.json(
      courses.slice(0, 10).map((c) => ({
        slug: c.slug,
        name: c.name,
        city: c.city,
        region: c.region,
        holes: c.course.holes,
      })),
    );
  }

  const results = courses
    .filter(
      (course) =>
        course.name.toLowerCase().includes(query) ||
        course.city.toLowerCase().includes(query) ||
        course.region.toLowerCase().includes(query) ||
        course.municipality?.toLowerCase().includes(query) ||
        course.formerName?.toLowerCase().includes(query),
    )
    .slice(0, 15)
    .map((c) => ({
      slug: c.slug,
      name: c.name,
      city: c.city,
      region: c.region,
      holes: c.course.holes,
    }));

  return NextResponse.json(results);
}
```

### Nearby API: `src/app/api/courses/nearby/route.ts`

```typescript
import { NextRequest, NextResponse } from "next/server";
import { getAllCourses } from "@/lib/courses";
import { calculateDistance, getBoundingBox } from "@/lib/geolocation";

let coursesCache: Course[] | null = null;

export async function GET(request: NextRequest) {
  const lat = parseFloat(request.nextUrl.searchParams.get("lat") || "");
  const lng = parseFloat(request.nextUrl.searchParams.get("lng") || "");
  const radiusKm = parseInt(request.nextUrl.searchParams.get("radius") || "50");
  const limit = parseInt(request.nextUrl.searchParams.get("limit") || "3");

  if (isNaN(lat) || isNaN(lng)) {
    return NextResponse.json({ success: false, error: "Invalid coordinates" }, { status: 400 });
  }

  if (!coursesCache) {
    coursesCache = await getAllCourses();
  }

  const userLocation = { latitude: lat, longitude: lng };
  const bbox = getBoundingBox(userLocation, radiusKm);

  const nearby = coursesCache
    .filter(
      (c) =>
        c.coordinates &&
        c.coordinates.lat >= bbox.minLat &&
        c.coordinates.lat <= bbox.maxLat &&
        c.coordinates.lng >= bbox.minLng &&
        c.coordinates.lng <= bbox.maxLng,
    )
    .map((course) => ({
      slug: course.slug,
      name: course.name,
      city: course.city,
      region: course.region,
      holes: course.course.holes,
      distance: calculateDistance(userLocation, {
        latitude: course.coordinates.lat,
        longitude: course.coordinates.lng,
      }),
    }))
    .filter((c) => c.distance <= radiusKm)
    .sort((a, b) => a.distance - b.distance)
    .slice(0, limit);

  return NextResponse.json({ success: true, courses: nearby });
}
```

---

## Weather Handling

Weather will be fetched client-side for always-fresh data.

### Weather API: `src/app/api/weather/route.ts`

```typescript
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const lat = request.nextUrl.searchParams.get("lat");
  const lng = request.nextUrl.searchParams.get("lng");

  // Fetch from weather provider (existing logic)
  const weather = await fetchWeather(lat, lng);

  return NextResponse.json(weather);
}
```

### Weather Widget: `src/components/courses/WeatherWidget.tsx`

```typescript
'use client';

import { useEffect, useState } from 'react';

interface WeatherData {
  temp: number;
  condition: string;
  humidity: number;
  windSpeed: number;
}

export function WeatherWidget({ lat, lng }: { lat: number; lng: number }) {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/weather?lat=${lat}&lng=${lng}`)
      .then(res => res.json())
      .then(data => {
        setWeather(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [lat, lng]);

  if (loading) return <WeatherSkeleton />;
  if (!weather) return null;

  return (
    <div className="rounded-lg bg-background-surface p-6 shadow-sm">
      {/* Weather display */}
    </div>
  );
}
```

---

## Migration Steps

### Step 1: Export Database to JSON

```typescript
// scripts/export-to-json.ts
import { prisma } from "@/lib/prisma";
import fs from "fs";
import path from "path";
import { toRegionSlug } from "@/lib/constants/norway-regions";

async function exportCourses() {
  const courses = await prisma.course.findMany({
    include: {
      facilities: true,
      pricing: true,
      ratings: true,
      phoneNumbers: true,
      courseRatings: true,
      membershipPricing: true,
      additionalFeatures: true,
      nearbyCourses: {
        include: { nearbyCourse: { select: { slug: true } } },
        orderBy: { distanceKm: "asc" },
        take: 4,
      },
    },
  });

  const outputDir = "content/courses";

  for (const course of courses) {
    const regionSlug = toRegionSlug(course.region);
    const dir = path.join(outputDir, regionSlug);
    fs.mkdirSync(dir, { recursive: true });

    const json = transformCourse(course);

    fs.writeFileSync(path.join(dir, `${course.slug}.json`), JSON.stringify(json, null, 2));
  }

  console.log(`✅ Exported ${courses.length} courses`);
}

function transformCourse(course: any): any {
  return {
    slug: course.slug,
    name: course.name,
    formerName: course.formerName,
    region: course.region,
    city: course.city,
    municipality: course.municipality,
    country: course.country,

    address: {
      street: course.addressStreet,
      postalCode: course.postalCode,
      area: course.addressArea,
    },

    coordinates:
      course.latitude && course.longitude
        ? {
            lat: course.latitude,
            lng: course.longitude,
            accuracy: course.coordinateAccuracy,
          }
        : null,

    course: {
      holes: course.holes,
      par: course.par,
      lengthMeters: course.lengthMeters,
      lengthYards: course.lengthYards,
      terrain: course.terrain,
      courseType: course.courseType,
      designer: course.designer,
      yearBuilt: course.yearBuilt,
      yearRedesigned: course.yearRedesigned,
      waterHazards: course.waterHazards,
      signatureHole: course.signatureHole,
      par3Count: course.par3Count,
      par4Count: course.par4Count,
      par5Count: course.par5Count,
    },

    description: course.description,

    contact: {
      phone: course.phone,
      email: course.email,
      website: course.website,
      facebook: course.facebook,
      instagram: course.instagram,
      golfbox: course.golfbox,
    },

    phoneNumbers: course.phoneNumbers.map((p: any) => ({
      number: p.phoneNumber,
      type: p.type,
      primary: p.isPrimary,
    })),

    season: {
      start: course.seasonStart,
      end: course.seasonEnd,
      winterUse: course.winterUse,
    },

    visitors: {
      welcome: course.visitorsWelcome,
      walkingAllowed: course.walkingAllowed,
      nearbyCity: course.nearbyCity,
      distanceFromCenter: course.distanceFromCenter,
    },

    facilities: course.facilities
      ? {
          drivingRange: course.facilities.drivingRange,
          drivingRangeLength: course.facilities.drivingRangeLength,
          // ... all facility fields
        }
      : null,

    pricing: groupByYear(course.pricing),
    membershipPricing: groupByYear(course.membershipPricing),

    ratings: Object.fromEntries(
      course.ratings.map((r: any) => [
        r.source.toLowerCase(),
        { rating: r.rating, reviewCount: r.reviewCount, maxRating: r.maxRating, url: r.url },
      ]),
    ),

    courseRatings: course.courseRatings.map((r: any) => ({
      teeColor: r.teeColor,
      gender: r.gender,
      courseRating: r.courseRating,
      slopeRating: r.slopeRating,
      par: r.par,
    })),

    nearbyCourses: course.nearbyCourses.map((n: any) => ({
      slug: n.nearbyCourse.slug,
      distanceKm: n.distanceKm,
    })),

    additionalFeatures: course.additionalFeatures.map((f: any) => ({
      feature: f.feature,
      description: f.description,
    })),

    meta: {
      dataQuality: course.dataQuality,
      completenessPercentage: course.completenessPercentage,
      scrapedAt: course.scrapedAt?.toISOString(),
      updatedAt: course.updatedAt?.toISOString(),
    },
  };
}

exportCourses();
```

### Step 2: Create Types

```typescript
// src/types/course.ts
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
  course: CourseDetails;
  description: string | null;
  contact: Contact;
  phoneNumbers: PhoneNumber[];
  season: Season;
  visitors: Visitors;
  facilities: Facilities | null;
  pricing: Record<string, Pricing>;
  membershipPricing: Record<string, MembershipTier[]>;
  ratings: Record<string, Rating>;
  courseRatings: CourseRating[];
  nearbyCourses: NearbyCourse[];
  additionalFeatures: Feature[];
  meta: Meta;
}

// ... remaining type definitions
```

### Step 3-7: Implementation

See sections above for detailed implementation of:

- Data loading library
- API routes
- Weather handling
- Page component updates

### Step 8: Remove Database

```bash
# Remove dependencies
pnpm remove @prisma/client @vercel/postgres prisma

# Delete database files
rm -rf prisma/
rm src/lib/prisma.ts

# Remove from .env
# DATABASE_URL=...

# Delete update scripts
rm -f update-*.ts import-*.ts check-*.ts verify-*.ts
```

---

## AI Editing Workflow

After migration, course updates work like this:

### Update Pricing

```
You: "Update Asker green fee to 800 kr"
AI: Edit content/courses/akershus/asker-golfklubb.json
    Change: "greenFeeWeekday": 750 → 800
```

### Add New Course

```
You: "Add Nordfjord Golfklubb in Vestland"
AI: Write content/courses/vestland/nordfjord-golfklubb.json
```

### Bulk Updates

```
You: "Increase all Oslo green fees by 50 kr"
AI: Edit content/courses/oslo/bogstad-golfklubb.json
    Edit content/courses/oslo/oslo-golfklubb.json
    Edit content/courses/oslo/groruddalen-golfklubb.json
```

### Benefits

- Direct file editing (no scripts)
- Instant visibility of changes
- Git history for all edits
- Easy rollback with git revert

---

## Files to Create/Modify

### New Files

- `content/courses/{region}/{slug}.json` (168 files)
- `src/types/course.ts`
- `src/lib/courses.ts`
- `src/app/api/weather/route.ts`
- `scripts/export-to-json.ts`

### Modified Files

- `src/app/page.tsx`
- `src/app/[region]/page.tsx`
- `src/app/[region]/[course]/page.tsx`
- `src/app/sitemap.ts`
- `src/app/api/courses/route.ts`
- `src/app/api/courses/nearby/route.ts`
- `src/components/courses/WeatherWidget.tsx`
- `package.json`
- `.env`

### Deleted Files

- `prisma/` directory
- `src/lib/prisma.ts`
- `vercel.json` (cron config)
- All `update-*.ts`, `import-*.ts`, `check-*.ts` scripts

---

## Success Criteria

1. All 168 courses exported to JSON files
2. All pages render correctly from JSON
3. Search works with in-memory filtering
4. Nearby API works with in-memory calculation
5. Weather fetches client-side
6. No database dependencies remain
7. AI can edit course files directly
