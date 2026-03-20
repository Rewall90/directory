import fs from "fs";
import path from "path";
import { cache } from "react";
import type { Course, RegionWithCount } from "@/types/course";
import { getCountyNameFromSlug } from "@/lib/constants/norway-regions";

const COURSES_DIR = path.join(process.cwd(), "content/courses");

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
      return JSON.parse(content) as Course;
    }
  }

  // If not found by filename, search by slug_en field
  for (const region of regions) {
    const regionDir = path.join(COURSES_DIR, region);
    const files = fs.readdirSync(regionDir).filter((f) => f.endsWith(".json"));

    for (const file of files) {
      const content = fs.readFileSync(path.join(regionDir, file), "utf-8");
      const course = JSON.parse(content) as Course;
      if (course.slug_en === slug) {
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
      const content = fs.readFileSync(path.join(regionDir, file), "utf-8");
      courses.push(JSON.parse(content) as Course);
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

  return files.map((file) => {
    const content = fs.readFileSync(path.join(regionDir, file), "utf-8");
    return JSON.parse(content) as Course;
  });
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
