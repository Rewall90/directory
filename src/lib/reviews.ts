import fs from "fs";
import path from "path";
import { cache } from "react";
import type { Review } from "@/types/course";

const REVIEWS_DIR = path.join(process.cwd(), "content/reviews");

/**
 * Load reviews for a course by slug
 * Returns empty array if no reviews file exists
 */
export const getReviews = cache((courseSlug: string): Review[] => {
  const filePath = path.join(REVIEWS_DIR, `${courseSlug}.json`);

  if (!fs.existsSync(filePath)) {
    return [];
  }

  const content = fs.readFileSync(filePath, "utf-8");
  return JSON.parse(content) as Review[];
});
