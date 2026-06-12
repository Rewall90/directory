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
import type { VtgInfo } from "../src/types/course";

const COURSES_DIR = path.join(process.cwd(), "content", "courses");

// Typed against VtgInfo so a renamed/removed field is flagged in the editor.
// (scripts/ is excluded from tsconfig, so `tsc --noEmit` won't catch it.)
const KNOWN_KEYS: ReadonlySet<keyof VtgInfo> = new Set<keyof VtgInfo>([
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
const warnings: ValidationError[] = [];

/** Local YYYY-MM-DD for "today", comparable lexicographically with ISO dates. */
function todayIsoLocal(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/** True if value is YYYY-MM-DD AND a real calendar date (rejects 2026-99-99). */
function isValidIsoDate(value: string): boolean {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return false;
  const [, y, m, d] = match.map(Number);
  const date = new Date(Date.UTC(y, m - 1, d));
  return date.getUTCFullYear() === y && date.getUTCMonth() === m - 1 && date.getUTCDate() === d;
}

/** True if value parses as an http(s) URL with a non-empty host. */
function isValidHttpUrl(value: string): boolean {
  let url: URL;
  try {
    url = new URL(value);
  } catch {
    return false;
  }
  return (url.protocol === "http:" || url.protocol === "https:") && url.hostname.length > 0;
}

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
        if (!KNOWN_KEYS.has(key as keyof VtgInfo)) {
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
        (typeof block.signupUrl !== "string" || !isValidHttpUrl(block.signupUrl))
      ) {
        errors.push({
          file: where,
          message: "vtg.signupUrl must be null or a valid http(s) URL with a host",
        });
      }

      if (
        block.seasonInfo !== null &&
        (typeof block.seasonInfo !== "string" || block.seasonInfo.trim().length === 0)
      ) {
        errors.push({
          file: where,
          message: "vtg.seasonInfo must be null or a non-empty string",
        });
      }

      if (typeof block.lastChecked !== "string" || !isValidIsoDate(block.lastChecked)) {
        errors.push({
          file: where,
          message: "vtg.lastChecked must be a valid ISO calendar date (YYYY-MM-DD)",
        });
      } else if (block.lastChecked > todayIsoLocal()) {
        errors.push({
          file: where,
          message: `vtg.lastChecked must not be in the future (got ${block.lastChecked})`,
        });
      }

      // Cross-field sanity check: a club that doesn't offer VTG (or where we
      // don't know) shouldn't have a price or signup URL — likely a confused
      // extraction. Warning only, does not fail the run.
      if (block.offered !== true && (block.price !== null || block.signupUrl !== null)) {
        warnings.push({
          file: where,
          message:
            "vtg.offered is not true but price/signupUrl is set — possible confused extraction",
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
  console.log(`\nResults: ${errors.length} errors, ${warnings.length} warnings\n`);

  if (warnings.length > 0) {
    console.error("WARNINGS:");
    warnings.forEach((w) => console.error(`  ! [${w.file}] ${w.message}`));
  }

  if (errors.length > 0) {
    console.log("ERRORS:");
    errors.forEach((e) => console.log(`  ✗ [${e.file}] ${e.message}`));
    process.exit(1);
  }

  console.log("VTG data valid.");
}

main();
