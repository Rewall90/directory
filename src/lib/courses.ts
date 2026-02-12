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
 * Load single course by slug
 */
export const getCourse = cache((slug: string): Course | null => {
  const regions = getRegions();

  for (const region of regions) {
    const filePath = path.join(COURSES_DIR, region, `${slug}.json`);
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, "utf-8");
      return JSON.parse(content) as Course;
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
