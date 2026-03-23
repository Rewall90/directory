import { readFileSync, readdirSync } from "fs";
import { join } from "path";
import type { GolfImageTarget } from "./types";

const CONTENT_DIR = join(__dirname, "..", "content", "courses");

// SEO priority by region (based on search volume)
const SEO_PRIORITY: Record<string, number> = {
  oslo: 100,
  akershus: 95,
  rogaland: 90, // Stavanger area
  vestland: 85, // Bergen area
  trondelag: 80, // Trondheim
  viken: 75,
  innlandet: 70,
  agder: 70,
  vestfold: 65,
  telemark: 65,
  more_og_romsdal: 60,
  nordland: 55,
  troms: 50,
  finnmark: 45,
};

interface CourseData {
  slug: string;
  name: string;
  region: string;
  contact: {
    website: string | null;
  };
  course: {
    holes: number;
  };
  ratings?: {
    google?: {
      rating: number;
      reviewCount: number;
    };
  };
  images?: any[];
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/æ/g, "ae")
    .replace(/ø/g, "o")
    .replace(/å/g, "a")
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

function loadAllCourses(): { course: CourseData; regionSlug: string }[] {
  const courses: { course: CourseData; regionSlug: string }[] = [];

  try {
    const regionDirs = readdirSync(CONTENT_DIR, { withFileTypes: true });

    for (const dir of regionDirs) {
      if (!dir.isDirectory()) continue;

      const regionSlug = dir.name;
      const regionPath = join(CONTENT_DIR, regionSlug);
      const files = readdirSync(regionPath).filter((f) => f.endsWith(".json"));

      for (const file of files) {
        try {
          const courseData = JSON.parse(
            readFileSync(join(regionPath, file), "utf-8"),
          ) as CourseData;
          courses.push({ course: courseData, regionSlug });
        } catch (err) {
          console.warn(`Failed to parse ${regionSlug}/${file}:`, err);
        }
      }
    }
  } catch (err) {
    console.error("Failed to load courses:", err);
    throw err;
  }

  return courses;
}

function getCoursePriority(course: CourseData, regionSlug: string): number {
  const seoPriority = SEO_PRIORITY[regionSlug] || 50;

  // Rating bonus (0-50 points)
  const ratingBonus = course.ratings?.google?.rating ? course.ratings.google.rating * 10 : 0;

  // Review count bonus (0-50 points, capped)
  const reviewBonus = course.ratings?.google?.reviewCount
    ? Math.min(course.ratings.google.reviewCount / 10, 50)
    : 0;

  // 18-hole courses get priority over 9-hole
  const holesBonus = course.course.holes === 18 ? 20 : 0;

  return seoPriority + ratingBonus + reviewBonus + holesBonus;
}

/**
 * Build a priority-sorted list of golf courses that need image scraping.
 *
 * A course needs images if:
 * - It has a website AND
 * - images field is undefined (never checked)
 */
export function buildQueue(limit: number, regionFilter?: string): GolfImageTarget[] {
  const allCourses = loadAllCourses();
  const targets: GolfImageTarget[] = [];

  for (const { course, regionSlug } of allCourses) {
    // Apply region filter if specified
    if (regionFilter && regionSlug !== regionFilter) {
      continue;
    }

    const hasWebsite =
      course.contact?.website !== null &&
      course.contact?.website !== undefined &&
      course.contact.website.trim() !== "";

    // Only scrape if images field is completely missing (undefined)
    // undefined = never checked, [] = checked but nothing found, [...] = has images
    const needsImages = course.images === undefined;

    if (!hasWebsite || !needsImages) continue;

    const priority = getCoursePriority(course, regionSlug);

    targets.push({
      region: course.region, // Norwegian name
      regionSlug, // Directory name
      courseSlug: course.slug,
      courseName: course.name,
      website: course.contact.website!,
      holes: course.course.holes,
      priority,
    });
  }

  // Sort by priority (highest first)
  targets.sort((a, b) => b.priority - a.priority);

  return targets.slice(0, limit);
}
