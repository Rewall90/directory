/**
 * Golf Course Image Scrape Orchestrator
 *
 * Finds golf courses with websites but no images, spawns Claude CLI subagents
 * to extract image URLs from their websites (with complete metadata), downloads
 * and optimizes images with sharp, and writes them to course JSON files.
 *
 * Usage:
 *   npx tsx automation-golf-images/orchestrator.ts [--dry-run] [--batch=10] [--slug=SLUG] [--region=REGION]
 */

import { mkdirSync, writeFileSync } from "fs";
import { join } from "path";
import { spawn } from "child_process";
import { buildQueue } from "./queue";
import { runClaude } from "./claude-runner";
import { buildImagePrompt } from "./prompts";
import { validateResult } from "./validator";
import { downloadAndOptimizeImages, mergeImages } from "./writer";
import type { GolfImageTarget, ImageOutcome } from "./types";

// Parse CLI args
const args = process.argv.slice(2);
const DRY_RUN = args.includes("--dry-run");
const BATCH_SIZE = parseInt(args.find((a) => a.startsWith("--batch="))?.split("=")[1] || "10");
const SLUG_FILTER = args.find((a) => a.startsWith("--slug="))?.split("=")[1];
const REGION_FILTER = args.find((a) => a.startsWith("--region="))?.split("=")[1];

// Concurrency is always 1 — same Chrome profile constraint as badstukart
const CONCURRENCY = 1;

// Create a timestamped log directory for this run
const RUN_ID = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
const LOG_DIR = join(__dirname, "..", "data", "golf-image-logs", RUN_ID);

/**
 * Process a single golf course: extract URLs → validate → download → optimize → write to JSON.
 */
async function scrapeOne(target: GolfImageTarget): Promise<ImageOutcome> {
  const prompt = buildImagePrompt(target);

  // Run Claude subprocess
  const { result, raw, error, cost_usd, duration_ms } = await runClaude(
    prompt,
    target.courseSlug,
    LOG_DIR,
  );

  if (error && !result) {
    return {
      target,
      status: "failed",
      imageMetadata: [],
      downloadedPaths: [],
      errors: [error],
      cost_usd,
      duration_ms,
    };
  }

  if (!result) {
    return {
      target,
      status: "failed",
      imageMetadata: [],
      downloadedPaths: [],
      errors: ["No result extracted from Claude output"],
      cost_usd,
      duration_ms,
    };
  }

  // Check subagent error
  if (result.error) {
    console.log(`  Subagent error: ${result.error}`);
  }

  // Validate
  const validation = validateResult(result, target);

  if (!validation.valid) {
    return {
      target,
      status: "failed",
      imageMetadata: [],
      downloadedPaths: [],
      errors: validation.errors,
      cost_usd,
      duration_ms,
    };
  }

  const cleanedMetadata = validation.cleaned.images;

  if (cleanedMetadata.length === 0) {
    return {
      target,
      status: "failed",
      imageMetadata: [],
      downloadedPaths: [],
      errors: [result.error || "No images found on website", ...validation.errors],
      cost_usd,
      duration_ms,
    };
  }

  // Download and optimize images
  console.log(`  Downloading & optimizing ${cleanedMetadata.length} images...`);
  const imageObjects = await downloadAndOptimizeImages(cleanedMetadata, target.courseSlug);

  if (imageObjects.length === 0) {
    return {
      target,
      status: "failed",
      imageMetadata: cleanedMetadata,
      downloadedPaths: [],
      errors: ["All downloads/optimizations failed", ...validation.errors],
      cost_usd,
      duration_ms,
    };
  }

  // Write to course JSON
  const writeResult = mergeImages(target.regionSlug, target.courseSlug, imageObjects);

  if (!writeResult.success) {
    return {
      target,
      status: "partial",
      imageMetadata: cleanedMetadata,
      downloadedPaths: imageObjects.map((i) => i.src),
      errors: [writeResult.error!, ...validation.errors],
      cost_usd,
      duration_ms,
    };
  }

  return {
    target,
    status: "success",
    imageMetadata: cleanedMetadata,
    downloadedPaths: imageObjects.map((i) => i.src),
    errors: validation.errors,
    cost_usd,
    duration_ms,
  };
}

/**
 * Run the scrape pool sequentially (concurrency=1).
 */
async function runPool(targets: GolfImageTarget[]): Promise<ImageOutcome[]> {
  const outcomes: ImageOutcome[] = [];

  for (let i = 0; i < targets.length; i++) {
    const target = targets[i];
    console.log(
      `\n[${i + 1}/${targets.length}] Scraping images: ${target.courseName} (${target.region})`,
    );
    console.log(`  Website: ${target.website}`);

    const outcome = await scrapeOne(target);
    outcomes.push(outcome);

    // Mark failed courses with empty images array so they don't retry
    if (outcome.status === "failed") {
      mergeImages(target.regionSlug, target.courseSlug, []);
    }

    const symbol =
      outcome.status === "success" ? "✓ OK" : outcome.status === "partial" ? "~ PARTIAL" : "✗ FAIL";
    console.log(`  Result: ${symbol} (${outcome.downloadedPaths.length} images)`);
    if (outcome.errors.length > 0) {
      console.log(`  Errors: ${outcome.errors.join("; ")}`);
    }
    if (outcome.cost_usd > 0) {
      console.log(`  Cost: $${outcome.cost_usd.toFixed(4)}`);
    }
  }

  return outcomes;
}

/**
 * Try to close any orphaned playwright-cli sessions.
 */
async function cleanupSessions(targets: GolfImageTarget[]): Promise<void> {
  for (const target of targets) {
    try {
      const child = spawn("playwright-cli", ["-s=" + target.courseSlug, "close"], {
        shell: true,
        stdio: "ignore",
      });
      await new Promise<void>((resolve) => {
        child.on("close", () => resolve());
        setTimeout(() => {
          child.kill();
          resolve();
        }, 5000);
      });
    } catch {
      // Ignore
    }
  }
}

/**
 * Print summary table.
 */
function printSummary(outcomes: ImageOutcome[]): void {
  console.log("\n" + "=".repeat(90));
  console.log("  GOLF COURSE IMAGE SCRAPE SUMMARY");
  console.log("=".repeat(90));

  const success = outcomes.filter((o) => o.status === "success").length;
  const partial = outcomes.filter((o) => o.status === "partial").length;
  const failed = outcomes.filter((o) => o.status === "failed").length;
  const totalCost = outcomes.reduce((sum, o) => sum + o.cost_usd, 0);
  const totalTime = outcomes.reduce((sum, o) => sum + o.duration_ms, 0);
  const totalImages = outcomes.reduce((sum, o) => sum + o.downloadedPaths.length, 0);

  console.log(`\nResults: ${success} success, ${partial} partial, ${failed} failed`);
  console.log(`Total images downloaded: ${totalImages}`);
  console.log(`Total cost: $${totalCost.toFixed(4)}`);
  console.log(`Total time: ${Math.round(totalTime / 1000)}s`);

  console.log(
    `\n${"Course".padEnd(40)} ${"Region".padEnd(15)} ${"Status".padEnd(10)} ${"URLs".padEnd(6)} ${"Saved".padEnd(6)} Cost`,
  );
  console.log("-".repeat(90));

  for (const o of outcomes) {
    const urls = String(o.imageMetadata.length).padEnd(6);
    const saved = String(o.downloadedPaths.length).padEnd(6);
    const cost = o.cost_usd > 0 ? `$${o.cost_usd.toFixed(3)}` : " - ";

    console.log(
      `${o.target.courseName.slice(0, 39).padEnd(40)} ${o.target.region.padEnd(15)} ${o.status.padEnd(10)} ${urls} ${saved} ${cost}`,
    );
  }

  console.log();
}

// === Main ===

async function main(): Promise<void> {
  console.log("=".repeat(70));
  console.log("  GOLFKART.NO IMAGE SCRAPE ORCHESTRATOR");
  console.log("=".repeat(70));
  console.log(`Batch size: ${BATCH_SIZE}`);
  console.log(`Concurrency: ${CONCURRENCY}`);
  console.log(`Dry run: ${DRY_RUN}`);
  if (REGION_FILTER) console.log(`Region filter: ${REGION_FILTER}`);

  // Build queue
  console.log("\nBuilding image scrape queue...");
  let queue = buildQueue(SLUG_FILTER ? 999 : BATCH_SIZE, REGION_FILTER);

  // Filter by slug if specified
  if (SLUG_FILTER) {
    queue = queue.filter((t) => t.courseSlug === SLUG_FILTER);
    if (queue.length === 0) {
      console.log(`No course found with slug "${SLUG_FILTER}" in the image scrape queue.`);
      console.log(
        "Note: courses must have a website AND no existing images to appear in the queue.",
      );
      return;
    }
  }

  if (queue.length === 0) {
    console.log("No courses need image scraping. All done!");
    return;
  }

  console.log(`Found ${queue.length} courses needing images:\n`);
  console.log(
    `${"#".padEnd(4)} ${"Course".padEnd(40)} ${"Region".padEnd(15)} ${"Priority".padEnd(10)} Website`,
  );
  console.log("-".repeat(105));

  for (let i = 0; i < queue.length; i++) {
    const t = queue[i];
    console.log(
      `${String(i + 1).padEnd(4)} ${t.courseName.slice(0, 39).padEnd(40)} ${t.region.padEnd(15)} ${String(t.priority).padEnd(10)} ${t.website.slice(0, 40)}`,
    );
  }

  if (DRY_RUN) {
    console.log("\n--dry-run mode. Exiting without scraping.");
    return;
  }

  // Create log directory
  mkdirSync(LOG_DIR, { recursive: true });
  console.log(`\nLogs: ${LOG_DIR}`);

  // Run the scrape pool
  console.log("\nStarting image scrape...\n");
  const outcomes = await runPool(queue);

  // Cleanup orphaned browser sessions
  console.log("\nCleaning up browser sessions...");
  await cleanupSessions(queue);

  // Save run summary
  const summary = {
    run_id: RUN_ID,
    started: new Date().toISOString(),
    batch_size: BATCH_SIZE,
    total_cost_usd: outcomes.reduce((s, o) => s + o.cost_usd, 0),
    total_images: outcomes.reduce((s, o) => s + o.downloadedPaths.length, 0),
    results: outcomes.map((o) => ({
      course: o.target.courseSlug,
      region: o.target.regionSlug,
      status: o.status,
      image_metadata: o.imageMetadata,
      downloaded_paths: o.downloadedPaths,
      errors: o.errors,
      cost_usd: o.cost_usd,
      duration_ms: o.duration_ms,
    })),
  };
  writeFileSync(join(LOG_DIR, "summary.json"), JSON.stringify(summary, null, 2) + "\n", "utf-8");

  // Print summary
  printSummary(outcomes);
  console.log(`Logs saved to: ${LOG_DIR}`);
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
