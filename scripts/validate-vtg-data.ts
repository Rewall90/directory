/**
 * VTG Data Validator
 *
 * Walks all course JSON files and validates the optional `vtg` block
 * (see VtgInfo in src/types/course.ts). Run after every scraper session
 * so bad scraped data can't reach production.
 *
 * Usage:
 *   pnpm validate:vtg
 *
 * Exits non-zero if any vtg block is invalid.
 */

import fs from "fs";
import path from "path";

const COURSES_DIR = path.join(process.cwd(), "content", "courses");

const KNOWN_KEYS = new Set([
  "offered",
  "price",
  "priceYouth",
  "signupUrl",
  "seasonInfo",
  "lastChecked",
]);

interface ValidationError {
  file: string;
  message: string;
}

const errors: ValidationError[] = [];

function validateVtgBlocks() {
  console.log("Validating VTG data...\n");

  let totalCourses = 0;
  let coursesWithVtg = 0;

  const regions = fs.readdirSync(COURSES_DIR).filter((f) => {
    return fs.statSync(path.join(COURSES_DIR, f)).isDirectory();
  });

  for (const region of regions) {
    const regionDir = path.join(COURSES_DIR, region);
    const files = fs.readdirSync(regionDir).filter((f) => f.endsWith(".json"));

    for (const file of files) {
      totalCourses++;
      const filePath = path.join(regionDir, file);
      const where = `${region}/${file}`;

      let course: Record<string, unknown>;
      try {
        course = JSON.parse(fs.readFileSync(filePath, "utf-8"));
      } catch {
        errors.push({ file: where, message: "Invalid JSON" });
        continue;
      }

      const vtg = course.vtg;
      if (vtg === undefined || vtg === null) continue;
      coursesWithVtg++;

      if (typeof vtg !== "object" || Array.isArray(vtg)) {
        errors.push({ file: where, message: "vtg must be an object or null" });
        continue;
      }

      const block = vtg as Record<string, unknown>;

      for (const key of Object.keys(block)) {
        if (!KNOWN_KEYS.has(key)) {
          errors.push({ file: where, message: `vtg has unknown key: ${key}` });
        }
      }

      if (typeof block.offered !== "boolean" && block.offered !== null) {
        errors.push({ file: where, message: "vtg.offered must be boolean or null" });
      }

      for (const key of ["price", "priceYouth"] as const) {
        const value = block[key];
        if (value !== null && (typeof value !== "number" || value < 100 || value > 10000)) {
          errors.push({
            file: where,
            message: `vtg.${key} must be null or a plausible NOK amount (100–10000)`,
          });
        }
      }

      if (
        block.signupUrl !== null &&
        (typeof block.signupUrl !== "string" || !/^https?:\/\//.test(block.signupUrl))
      ) {
        errors.push({ file: where, message: "vtg.signupUrl must be null or an http(s) URL" });
      }

      if (block.seasonInfo !== null && typeof block.seasonInfo !== "string") {
        errors.push({ file: where, message: "vtg.seasonInfo must be string or null" });
      }

      if (typeof block.lastChecked !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(block.lastChecked)) {
        errors.push({
          file: where,
          message: "vtg.lastChecked must be an ISO date (YYYY-MM-DD)",
        });
      }
    }
  }

  console.log(`  Courses: ${coursesWithVtg}/${totalCourses} have VTG data`);
}

function main() {
  console.log("VTG Data Validation Report\n" + "=".repeat(40) + "\n");

  validateVtgBlocks();

  console.log("\n" + "=".repeat(40));
  console.log(`\nResults: ${errors.length} errors\n`);

  if (errors.length > 0) {
    console.log("ERRORS:");
    errors.forEach((e) => console.log(`  ✗ [${e.file}] ${e.message}`));
    process.exit(1);
  }

  console.log("VTG data valid.");
}

main();
