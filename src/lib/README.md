# Library Documentation

This directory contains core business logic, utilities, and constants for the golf course directory.

## Directory Structure

```
lib/
├── constants/         # Configuration and constant values
│   ├── map-config.ts     # Map zoom levels, clustering, tile config
│   └── norway-regions.ts # Region slug/name mappings
├── utils/            # Utility functions
│   ├── logger.ts         # Centralized logging utility
│   ├── map-filters.ts    # Map filter optimizations
│   ├── type-guards.ts    # TypeScript type guard functions
│   ├── locale-helpers.ts # Locale/translation utilities
│   └── url-helpers.ts    # URL building functions
├── courses.ts        # Course data loading (main API)
└── weather.ts        # MET Norway weather API integration
```

---

## Core APIs

### `courses.ts` - Course Data Loading

Main API for loading golf course data from JSON files.

#### Key Functions

**`getAllCourses(): Course[]`**
- Loads all 168 courses from JSON files
- Cached with React's `cache()` for performance
- Returns full course data structure

**`getCourse(slug: string): Course | null`**
- Load a single course by slug (Norwegian or English)
- Supports both filename lookup and `slug_en` field search
- Returns `null` if not found

**`getCoursesByRegion(regionSlug: string): Course[]`**
- Load all courses in a specific region (e.g., "oslo", "rogaland")
- Returns empty array if region doesn't exist

**`getAllCoursesForMap(): MapCourse[]`**
- Optimized for map display (simplified data structure)
- Only includes courses with valid coordinates
- Includes current pricing and ratings
- Never throws - returns empty array on error

#### Example Usage

```typescript
import { getAllCourses, getCourse, getAllCoursesForMap } from "@/lib/courses";

// Get all courses
const courses = getAllCourses();
console.log(`Total courses: ${courses.length}`); // 168

// Get single course
const osloCourse = getCourse("oslo-golfklubb");
if (osloCourse) {
  console.log(osloCourse.name); // "Oslo Golfklubb"
}

// Get courses for map
const mapCourses = getAllCoursesForMap();
// Returns: [{ slug, name, coordinates, holes, par, ... }]
```

---

## Utilities

### `utils/logger.ts` - Centralized Logging

Environment-aware logging that's silent in production.

#### API

```typescript
import { logger } from "@/lib/utils/logger";

// Error logging (shows in dev, ready for Sentry in prod)
logger.error("Failed to load course", error);

// Warning logging
logger.warn("Missing translation key", { key: "map.title" });

// Info logging (development only)
logger.info("User clicked marker", { courseId: 123 });

// Debug logging (development only)
logger.debug("Rendering map", { zoom: 13, center: [65, 13] });
```

#### Integration Guide

To add Sentry error tracking:

```typescript
// In logger.ts, update the error method:
error: (message: string, error?: unknown) => {
  if (isDev) {
    console.error(message, error);
  } else {
    // Production error tracking
    Sentry.captureException(error, {
      tags: { message },
    });
  }
}
```

---

### `utils/map-filters.ts` - Filter Optimization

Efficient filter extraction for map sidebar.

```typescript
import { extractFilterOptions } from "@/lib/utils/map-filters";

const { regions, cities } = extractFilterOptions(courses);
// regions: ["Akershus", "Oslo", "Rogaland", ...] (sorted)
// cities: ["Bergen", "Oslo", "Stavanger", ...] (sorted)

// Performance: O(n) instead of O(2n)
// Sorts using Norwegian locale
```

---

### `utils/type-guards.ts` - Type Safety

TypeScript type guard functions for runtime validation.

```typescript
import { hasValidCoordinates, isNonEmptyString, isValidNumber } from "@/lib/utils/type-guards";

// Validate course coordinates
if (hasValidCoordinates(course)) {
  // TypeScript knows course.coordinates exists and is valid
  const { lat, lng } = course.coordinates;
}

// String validation
if (isNonEmptyString(value)) {
  // TypeScript knows value is string
  console.log(value.toUpperCase());
}

// Number validation (excludes NaN and Infinity)
if (isValidNumber(value)) {
  console.log(value.toFixed(2));
}
```

---

### `utils/locale-helpers.ts` - Localization

Handle Norwegian/English content gracefully.

```typescript
import {
  getLocalizedName,
  getLocalizedSlug,
  isEnglishLocale,
} from "@/lib/utils/locale-helpers";

// Get localized course name
const name = getLocalizedName(course.name, course.name_en, locale);
// locale="en" + name_en="Oslo Golf Club" → "Oslo Golf Club"
// locale="nb" → "Oslo Golfklubb"

// Get localized slug
const slug = getLocalizedSlug(course.slug, course.slug_en, locale);

// Check locale
if (isEnglishLocale(locale)) {
  // Show English content
}
```

---

### `utils/url-helpers.ts` - URL Building

Consistent URL generation across the app.

```typescript
import { buildCourseUrl, buildMapUrl, buildDirectionsUrl } from "@/lib/utils/url-helpers";

// Course detail page
const url = buildCourseUrl("oslo", "oslo-golfklubb", "en");
// Returns: "/en/oslo/oslo-golfklubb"

// Map page
const mapUrl = buildMapUrl("nb");
// Returns: "/kart"

// Google Maps directions
const directionsUrl = buildDirectionsUrl(59.9139, 10.7522);
// Returns: "https://www.google.com/maps/dir/?api=1&destination=59.9139,10.7522"
```

---

## Constants

### `constants/map-config.ts` - Map Configuration

All map-related constants in one place.

```typescript
import { MAP_CONFIG, TILE_CONFIG, MAP_UI_CONFIG } from "@/lib/constants/map-config";

// Zoom levels
MAP_CONFIG.NORWAY_CENTER;     // [65, 13]
MAP_CONFIG.INITIAL_ZOOM;      // 5
MAP_CONFIG.DETAIL_ZOOM;       // 13
MAP_CONFIG.MIN_ZOOM;          // 3
MAP_CONFIG.MAX_ZOOM;          // 18

// Clustering
MAP_CONFIG.CLUSTER.MAX_RADIUS;        // 80 pixels
MAP_CONFIG.CLUSTER.DISABLE_AT_ZOOM;   // 13

// Tile layer
TILE_CONFIG.URL;              // CartoDB Voyager tiles
TILE_CONFIG.ATTRIBUTION;      // OpenStreetMap + CARTO
TILE_CONFIG.MAX_ZOOM;         // 20

// UI constants
MAP_UI_CONFIG.COORDINATE_PRECISION;   // 4 decimal places
MAP_UI_CONFIG.CONTROLS_Z_INDEX;       // 1000
```

---

## Best Practices

### Error Handling

Always use the logger for errors:

```typescript
// ❌ Don't
console.error("Failed to load course");

// ✅ Do
import { logger } from "@/lib/utils/logger";
logger.error("Failed to load course", error);
```

### Type Safety

Use type guards instead of type assertions:

```typescript
// ❌ Don't
const lat = course.coordinates!.lat;

// ✅ Do
import { hasValidCoordinates } from "@/lib/utils/type-guards";
if (hasValidCoordinates(course)) {
  const { lat, lng } = course.coordinates;
}
```

### Localization

Use helper functions for consistent locale handling:

```typescript
// ❌ Don't
const name = locale === "en" && course.name_en ? course.name_en : course.name;

// ✅ Do
import { getLocalizedName } from "@/lib/utils/locale-helpers";
const name = getLocalizedName(course.name, course.name_en, locale);
```

### URL Building

Use URL helpers instead of string concatenation:

```typescript
// ❌ Don't
const url = `${locale === "en" ? "/en" : ""}/${region}/${slug}`;

// ✅ Do
import { buildCourseUrl } from "@/lib/utils/url-helpers";
const url = buildCourseUrl(region, slug, locale);
```

---

## Performance Optimizations

### Caching

All major data loading functions use React's `cache()`:

```typescript
export const getAllCourses = cache((): Course[] => {
  // Expensive operation - only runs once per request
});
```

### Single-Pass Algorithms

Use optimized utilities when processing arrays:

```typescript
// ❌ Don't (O(2n))
const regions = Array.from(new Set(courses.map(c => c.region)));
const cities = Array.from(new Set(courses.map(c => c.city)));

// ✅ Do (O(n))
import { extractFilterOptions } from "@/lib/utils/map-filters";
const { regions, cities } = extractFilterOptions(courses);
```

---

## Migration Guide

If you're updating old code:

### Replace console.error/warn

```typescript
// Before
console.error("Failed:", error);
console.warn("Warning:", data);

// After
import { logger } from "@/lib/utils/logger";
logger.error("Failed", error);
logger.warn("Warning", data);
```

### Replace type assertions

```typescript
// Before
const course = JSON.parse(content) as Course;

// After
const course = parseJSONCourse(filePath, content);
if (!course) return null;
```

### Replace inline locale checks

```typescript
// Before
const name = locale === "en" && course.name_en ? course.name_en : course.name;

// After
import { getLocalizedName } from "@/lib/utils/locale-helpers";
const name = getLocalizedName(course.name, course.name_en, locale);
```

---

## Testing

When writing tests for code using these utilities:

```typescript
import { logger } from "@/lib/utils/logger";
import { hasValidCoordinates } from "@/lib/utils/type-guards";

describe("Course validation", () => {
  it("should detect valid coordinates", () => {
    const course = {
      coordinates: { lat: 59.9139, lng: 10.7522 },
      // ... other fields
    };

    expect(hasValidCoordinates(course)).toBe(true);
  });

  it("should reject NaN coordinates", () => {
    const course = {
      coordinates: { lat: NaN, lng: 10.7522 },
      // ... other fields
    };

    expect(hasValidCoordinates(course)).toBe(false);
  });
});
```

---

## Contributing

When adding new utilities:

1. **Add JSDoc comments** with examples
2. **Export from appropriate utility file** (don't create new files unless needed)
3. **Add to this README** with usage examples
4. **Write tests** for edge cases
5. **Update existing code** to use the new utility

---

## Questions?

For more details, see:
- `src/types/course.ts` - Full Course type definition
- `content/courses/` - Course JSON file structure
- `CLAUDE.md` - Project architecture overview
