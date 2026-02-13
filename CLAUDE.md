# CLAUDE.md - Project Guide for AI Assistants

## Project Overview

**Golfkart.no** - A Norwegian golf course directory website built with Next.js. Contains information about 168 golf courses across Norway, organized by region (fylke).

## Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS + DaisyUI
- **Data Storage:** JSON files (no database)
- **Deployment:** Vercel
- **Package Manager:** pnpm

## Architecture

### Data Storage (JSON-based)

All course data is stored as JSON files in `content/courses/{region}/{slug}.json`.

**Key data loading functions** (`src/lib/courses.ts`):

- `getAllCourses()` - Returns all 168 courses
- `getCourse(slug)` - Get single course by slug
- `getCoursesByRegion(regionSlug)` - Get courses for a region
- `getRegions()` - Get all region slugs
- `getRegionsWithCounts()` - Regions with course counts
- `calculateAverageRating(ratings)` - Calculate weighted rating

**Course type definition:** `src/types/course.ts`

### Directory Structure

```
content/
  courses/
    {region}/           # e.g., oslo/, akershus/, rogaland/
      {slug}.json       # e.g., oslo-golfklubb.json

src/
  app/
    page.tsx                    # Homepage
    [region]/
      page.tsx                  # Region listing page
      [course]/
        page.tsx                # Course detail page
    api/
      courses/
        route.ts                # Search API
        nearby/
          route.ts              # Nearby courses API
      weather/
        route.ts                # Weather API
    sitemap.ts                  # Dynamic sitemap

  components/
    courses/
      WeatherWidget.tsx         # Client-side weather (fetches from /api/weather)
      CourseCard.tsx            # Course card for listings
      StarRating.tsx            # Star rating display

  lib/
    courses.ts                  # Data loading functions
    constants/
      norway-regions.ts         # Region name/slug mappings
    google-weather.ts           # Weather API integration
```

## JSON Course Structure

```typescript
interface Course {
  slug: string;
  name: string;
  region: string;           // Norwegian county name (e.g., "Oslo", "Rogaland")
  city: string;
  municipality: string;
  country: string;

  address: {
    street: string;
    postalCode: string;
    area: string | null;
  };

  coordinates: {
    lat: number;
    lng: number;
  } | null;

  course: {                 // Course details nested here
    holes: number;
    par: number | null;
    designer: string | null;
    yearBuilt: number | null;
    terrain: string | null;
    // ... more fields
  };

  contact: {
    phone: string | null;
    email: string | null;
    website: string | null;
    // ...
  };

  facilities: { ... } | null;
  pricing: Record<string, Pricing>;      // Keyed by year
  ratings: Record<string, Rating>;       // Keyed by source (google, facebook, etc.)
  // ...
}
```

## Important Patterns

### Data Access

- Course properties are nested: `course.course.holes` not `course.holes`
- Coordinates: `course.coordinates?.lat` not `course.latitude`
- Ratings is an object, not array: `Object.entries(course.ratings)`

### Static Generation

All pages use `generateStaticParams()` for SSG. Changes to course data require rebuild.

### Weather

Weather is fetched client-side via `/api/weather?lat=X&lng=Y` to ensure freshness.

## Common Tasks

### Adding/Updating Course Data

Edit the JSON file directly in `content/courses/{region}/{slug}.json`

### Adding a New Region

1. Create folder: `content/courses/{new-region}/`
2. Add course JSON files
3. Rebuild to generate pages

### Running Locally

```bash
pnpm install
pnpm dev
```

### Building

```bash
pnpm build
```

## Conventions

- **Language:** UI is in Norwegian
- **Slugs:** Lowercase with hyphens, Norwegian characters converted (æ→ae, ø→o, å→a)
- **Commits:** Use conventional commits (feat:, fix:, chore:, etc.)
- **No Prisma/Database:** All data is in JSON files

## API Endpoints

| Endpoint                          | Method | Description         |
| --------------------------------- | ------ | ------------------- |
| `/api/courses?q=search`           | GET    | Search courses      |
| `/api/courses/nearby?lat=X&lng=Y` | GET    | Find nearby courses |
| `/api/weather?lat=X&lng=Y`        | GET    | Get weather data    |

## Environment Variables

Required in `.env.local`:

- `GOOGLE_WEATHER_API_KEY` - For weather API

## Recent Migration (Feb 2026)

Migrated from PostgreSQL/Prisma to JSON file storage:

- Removed all database dependencies
- Course data exported to JSON files
- Weather changed from server-side cron to client-side fetching
- All pages now statically generated from JSON
