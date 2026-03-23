/**
 * Display statistics about golf course image coverage
 *
 * Usage:
 *   npx tsx automation-golf-images/stats.ts [--region=REGION]
 */

import { readFileSync, readdirSync } from "fs";
import { join } from "path";

const CONTENT_DIR = join(__dirname, "..", "content", "courses");

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
  images?: any[];
}

interface RegionStats {
  total: number;
  withImages: number;
  withoutImages: number;
  noWebsite: number;
  courses: {
    slug: string;
    name: string;
    hasImages: boolean;
    imageCount: number;
    hasWebsite: boolean;
  }[];
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

function analyzeByRegion(regionFilter?: string): Map<string, RegionStats> {
  const allCourses = loadAllCourses();
  const regionMap = new Map<string, RegionStats>();

  for (const { course, regionSlug } of allCourses) {
    if (regionFilter && regionSlug !== regionFilter) continue;

    if (!regionMap.has(regionSlug)) {
      regionMap.set(regionSlug, {
        total: 0,
        withImages: 0,
        withoutImages: 0,
        noWebsite: 0,
        courses: [],
      });
    }

    const stats = regionMap.get(regionSlug)!;
    const hasImages = course.images !== undefined && course.images.length > 0;
    const hasWebsite = course.contact?.website !== null && course.contact?.website !== undefined;

    stats.total++;
    if (hasImages) {
      stats.withImages++;
    } else {
      stats.withoutImages++;
    }
    if (!hasWebsite) {
      stats.noWebsite++;
    }

    stats.courses.push({
      slug: course.slug,
      name: course.name,
      hasImages,
      imageCount: course.images?.length || 0,
      hasWebsite,
    });
  }

  return regionMap;
}

function printStats(regionFilter?: string) {
  const regionStats = analyzeByRegion(regionFilter);

  console.log("=".repeat(80));
  console.log("  GOLF COURSE IMAGE COVERAGE STATISTICS");
  console.log("=".repeat(80));

  let totalCourses = 0;
  let totalWithImages = 0;
  let totalWithoutImages = 0;
  let totalNoWebsite = 0;

  const regions = Array.from(regionStats.entries()).sort((a, b) => a[0].localeCompare(b[0]));

  console.log("\nBREAKDOWN BY REGION:");
  console.log("-".repeat(80));
  console.log(
    `${"Region".padEnd(20)} ${"Total".padEnd(8)} ${"With".padEnd(8)} ${"Without".padEnd(10)} ${"No Web".padEnd(10)} Coverage`,
  );
  console.log("-".repeat(80));

  for (const [regionSlug, stats] of regions) {
    totalCourses += stats.total;
    totalWithImages += stats.withImages;
    totalWithoutImages += stats.withoutImages;
    totalNoWebsite += stats.noWebsite;

    const coverage = stats.total > 0 ? ((stats.withImages / stats.total) * 100).toFixed(1) : "0.0";

    console.log(
      `${regionSlug.padEnd(20)} ${String(stats.total).padEnd(8)} ${String(stats.withImages).padEnd(8)} ${String(stats.withoutImages).padEnd(10)} ${String(stats.noWebsite).padEnd(10)} ${coverage}%`,
    );
  }

  console.log("-".repeat(80));
  const overallCoverage =
    totalCourses > 0 ? ((totalWithImages / totalCourses) * 100).toFixed(1) : "0.0";
  console.log(
    `${"TOTAL".padEnd(20)} ${String(totalCourses).padEnd(8)} ${String(totalWithImages).padEnd(8)} ${String(totalWithoutImages).padEnd(10)} ${String(totalNoWebsite).padEnd(10)} ${overallCoverage}%`,
  );

  console.log("\n\nSUMMARY:");
  console.log("-".repeat(80));
  console.log(`Total courses:              ${totalCourses}`);
  console.log(`Courses with images:        ${totalWithImages} (${overallCoverage}%)`);
  console.log(`Courses without images:     ${totalWithoutImages}`);
  console.log(`Courses without website:    ${totalNoWebsite}`);
  console.log(
    `Courses ready to scrape:    ${totalWithoutImages - totalNoWebsite} (have website but no images)`,
  );

  // Show courses with images if filtering by region
  if (regionFilter && regionStats.has(regionFilter)) {
    const stats = regionStats.get(regionFilter)!;
    const withImages = stats.courses.filter((c) => c.hasImages);

    if (withImages.length > 0) {
      console.log(`\n\nCOURSES WITH IMAGES IN ${regionFilter.toUpperCase()}:`);
      console.log("-".repeat(80));
      console.log(`${"Course".padEnd(45)} Images`);
      console.log("-".repeat(80));

      for (const course of withImages.sort((a, b) => a.name.localeCompare(b.name))) {
        console.log(`${course.name.slice(0, 44).padEnd(45)} ${course.imageCount}`);
      }
    }
  }

  console.log("\n");
}

// Parse CLI args
const args = process.argv.slice(2);
const REGION_FILTER = args.find((a) => a.startsWith("--region="))?.split("=")[1];

printStats(REGION_FILTER);
