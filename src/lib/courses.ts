import fs from "fs";
import path from "path";
import { cache } from "react";
import type { Course, RegionWithCount } from "@/types/course";
import { getCountyNameFromSlug } from "@/lib/constants/norway-regions";
import { logger } from "@/lib/utils/logger";

const COURSES_DIR = path.join(process.cwd(), "content/courses");

/**
 * Safely parse JSON course file with validation
 * Returns null if parsing fails or data is invalid
 */
function parseJSONCourse(filePath: string, content: string): Course | null {
  try {
    const course = JSON.parse(content) as Course;

    // Basic validation - check required fields
    if (!course.slug || !course.name || !course.region) {
      logger.warn(
        `Invalid course data in ${filePath}: missing required fields (slug, name, or region)`
      );
      return null;
    }

    return course;
  } catch (error) {
    logger.error(`Failed to parse course JSON in ${filePath}:`, error);
    return null;
  }
}

/**
 * Get all region folder names
 */
export const getRegions = cache((): string[] => {
  if (!fs.existsSync(COURSES_DIR)) {
    return [];
  }
  return fs
    .readdirSync(COURSES_DIR)
    .filter((f) => fs.statSync(path.join(COURSES_DIR, f)).isDirectory());
});

/**
 * Load single course by slug (supports both Norwegian slug and English slug_en)
 */
export const getCourse = cache((slug: string): Course | null => {
  const regions = getRegions();

  // First try to find by filename (Norwegian slug)
  for (const region of regions) {
    const filePath = path.join(COURSES_DIR, region, `${slug}.json`);
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, "utf-8");
      const course = parseJSONCourse(filePath, content);
      if (course) return course;
    }
  }

  // If not found by filename, search by slug_en field
  for (const region of regions) {
    const regionDir = path.join(COURSES_DIR, region);
    const files = fs.readdirSync(regionDir).filter((f) => f.endsWith(".json"));

    for (const file of files) {
      const filePath = path.join(regionDir, file);
      const content = fs.readFileSync(filePath, "utf-8");
      const course = parseJSONCourse(filePath, content);
      if (course && course.slug_en === slug) {
        return course;
      }
    }
  }

  return null;
});

/**
 * Load all courses
 */
export const getAllCourses = cache((): Course[] => {
  const courses: Course[] = [];
  const regions = getRegions();

  for (const region of regions) {
    const regionDir = path.join(COURSES_DIR, region);
    const files = fs.readdirSync(regionDir).filter((f) => f.endsWith(".json"));

    for (const file of files) {
      const filePath = path.join(regionDir, file);
      const content = fs.readFileSync(filePath, "utf-8");
      const course = parseJSONCourse(filePath, content);
      if (course) {
        courses.push(course);
      }
    }
  }

  return courses;
});

/**
 * Load courses by region slug
 */
export const getCoursesByRegion = cache((regionSlug: string): Course[] => {
  const regionDir = path.join(COURSES_DIR, regionSlug);

  if (!fs.existsSync(regionDir)) {
    return [];
  }

  const files = fs.readdirSync(regionDir).filter((f) => f.endsWith(".json"));

  return files
    .map((file) => {
      const filePath = path.join(regionDir, file);
      const content = fs.readFileSync(filePath, "utf-8");
      return parseJSONCourse(filePath, content);
    })
    .filter((course): course is Course => course !== null);
});

/**
 * Get regions with course counts for homepage
 */
export const getRegionsWithCounts = cache((): RegionWithCount[] => {
  const regions = getRegions();

  return regions
    .map((slug) => {
      const regionDir = path.join(COURSES_DIR, slug);
      const count = fs.readdirSync(regionDir).filter((f) => f.endsWith(".json")).length;
      const name = getCountyNameFromSlug(slug) || slug;
      return { name, slug, count };
    })
    .sort((a, b) => a.name.localeCompare(b.name, "no"));
});

/**
 * Get total course count
 */
export const getTotalCourseCount = cache((): number => {
  return getAllCourses().length;
});

/**
 * Get aggregate rating stats across all courses (for trust badge)
 */
export const getAggregateRatingStats = cache(
  (): { totalReviews: number; averageRating: number } => {
    const courses = getAllCourses();
    let totalReviews = 0;
    let weightedScore = 0;

    for (const course of courses) {
      const google = course.ratings?.google;
      if (google?.rating && google.reviewCount && google.reviewCount > 0) {
        totalReviews += google.reviewCount;
        weightedScore += google.rating * google.reviewCount;
      }
    }

    return {
      totalReviews,
      averageRating: totalReviews > 0 ? weightedScore / totalReviews : 0,
    };
  },
);

export interface PopularCourse {
  name: string;
  slug: string;
  city: string;
  regionSlug: string;
  rating: number;
  reviewCount: number;
  holes: number;
  imageSrc: string;
  imageAlt: string;
}

/**
 * Get most popular courses that have images, sorted by review count (for homepage)
 */
export const getPopularCourses = cache((limit = 4): PopularCourse[] => {
  const courses = getAllCourses();
  const regionSlugs = getRegions();

  const results: PopularCourse[] = [];

  for (const course of courses) {
    const google = course.ratings?.google;
    if (!google?.rating || !google.reviewCount || google.reviewCount === 0) continue;
    if (!course.images || course.images.length === 0) continue;

    const regionSlug =
      regionSlugs.find((r) => {
        const regionDir = path.join(COURSES_DIR, r);
        return fs.existsSync(path.join(regionDir, `${course.slug}.json`));
      }) || "";

    results.push({
      name: course.name,
      slug: course.slug,
      city: course.city,
      regionSlug,
      rating: google.rating,
      reviewCount: google.reviewCount,
      holes: course.course?.holes || 0,
      imageSrc: course.images[0].src,
      imageAlt: course.images[0].alt,
    });
  }

  return results.sort((a, b) => b.reviewCount - a.reviewCount).slice(0, limit);
});

/**
 * Get featured courses with images, excluding the popular ones (for homepage)
 */
export const getFeaturedCourses = cache((limit = 4): PopularCourse[] => {
  const popular = getPopularCourses(4);
  const popularSlugs = new Set(popular.map((c) => c.slug));

  const courses = getAllCourses();
  const regionSlugs = getRegions();

  const results: PopularCourse[] = [];

  for (const course of courses) {
    if (popularSlugs.has(course.slug)) continue;
    if (!course.images || course.images.length === 0) continue;

    const google = course.ratings?.google;

    const regionSlug =
      regionSlugs.find((r) => {
        const regionDir = path.join(COURSES_DIR, r);
        return fs.existsSync(path.join(regionDir, `${course.slug}.json`));
      }) || "";

    results.push({
      name: course.name,
      slug: course.slug,
      city: course.city,
      regionSlug,
      rating: google?.rating || 0,
      reviewCount: google?.reviewCount || 0,
      holes: course.course?.holes || 0,
      imageSrc: course.images[0].src,
      imageAlt: course.images[0].alt,
    });
  }

  return results.sort((a, b) => b.reviewCount - a.reviewCount).slice(0, limit);
});

/**
 * Calculate average rating from multiple rating sources
 */
export function calculateAverageRating(
  ratings: Record<
    string,
    { rating: number | null; reviewCount: number | null; maxRating: number | null }
  >,
): { averageRating: number; totalReviews: number } | null {
  const entries = Object.values(ratings).filter((r) => r.rating !== null);
  if (entries.length === 0) return null;

  let weightedScore = 0;
  let totalReviews = 0;

  for (const rating of entries) {
    if (!rating.rating) continue;
    const normalized = (rating.rating / (rating.maxRating || 5)) * 5;

    if (rating.reviewCount && rating.reviewCount > 0) {
      weightedScore += normalized * rating.reviewCount;
      totalReviews += rating.reviewCount;
    } else {
      weightedScore += normalized;
      totalReviews += 1;
    }
  }

  if (totalReviews === 0) return null;

  return {
    averageRating: weightedScore / totalReviews,
    totalReviews,
  };
}

/**
 * Lightweight course data for map display
 */
export interface MapCourse {
  slug: string;
  slug_en?: string;
  name: string;
  name_en?: string;
  region: string;
  regionSlug: string;
  city: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  holes: number;
  par: number | null;
  rating: number | null;
  reviewCount: number | null;
  greenFee18: number | null;
}

/**
 * Get all courses formatted for the interactive map
 *
 * Returns a simplified course structure optimized for map markers:
 * - Only includes courses with valid coordinates
 * - Includes both Norwegian and English names/slugs
 * - Includes current pricing and ratings
 * - Validates coordinate data with type predicates
 *
 * @returns Array of courses with map-specific data structure
 * @throws Never throws - returns empty array on error
 *
 * @example
 * ```ts
 * const courses = getAllCoursesForMap();
 * // Returns: [{ slug: "oslo-golfklubb", name: "Oslo Golfklubb", coordinates: {...}, ... }]
 * ```
 */
export const getAllCoursesForMap = cache((): MapCourse[] => {
  try {
    const courses = getAllCourses();
    const regions = getRegions();

    // Build a slug-to-region map once for efficiency
    const slugToRegion = new Map<string, string>();
    for (const region of regions) {
      const regionDir = path.join(COURSES_DIR, region);
      if (fs.existsSync(regionDir)) {
        const files = fs.readdirSync(regionDir).filter((f) => f.endsWith(".json"));
        for (const file of files) {
          const slug = file.replace(".json", "");
          slugToRegion.set(slug, region);
        }
      }
    }

    const currentYear = new Date().getFullYear().toString();

    return courses
      .filter(
        (c): c is Course & { coordinates: { lat: number; lng: number } } =>
          c.coordinates != null &&
          typeof c.coordinates.lat === "number" &&
          typeof c.coordinates.lng === "number" &&
          !Number.isNaN(c.coordinates.lat) &&
          !Number.isNaN(c.coordinates.lng)
      )
      .map((course) => {
        const regionSlug = slugToRegion.get(course.slug) || "";

        const google = course.ratings?.google;
        const pricing = course.pricing?.[currentYear] || course.pricing?.["2026"] || null;

        return {
          slug: course.slug,
          slug_en: course.slug_en,
          name: course.name,
          name_en: course.name_en,
          region: course.region,
          regionSlug,
          city: course.city,
          coordinates: {
            lat: course.coordinates.lat,
            lng: course.coordinates.lng,
          },
          holes: course.course?.holes || 18,
          par: course.course?.par || null,
          rating: google?.rating || null,
          reviewCount: google?.reviewCount || null,
          greenFee18: pricing?.greenFee18 || pricing?.greenFeeWeekday || null,
        };
      });
  } catch (error) {
    logger.error("Failed to load courses for map", error);
    return [];
  }
});
