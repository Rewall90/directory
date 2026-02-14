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

import "dotenv/config";
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
