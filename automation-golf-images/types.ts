/** A golf course identified for image scraping */
export interface GolfImageTarget {
  region: string; // Norwegian region/county name (e.g., "Oslo", "Rogaland")
  regionSlug: string; // Region slug for directory structure
  courseSlug: string;
  courseName: string;
  website: string; // Must have a website
  holes: number; // 9 or 18
  priority: number;
}

/** Image metadata returned by Claude subagent */
export interface ImageMetadata {
  url: string;
  filename: string; // Descriptive filename without extension (e.g., "oslo-golfklubb-flyfoto-klubbhus")
  alt: string; // Norwegian alt text
  alt_en: string; // English alt text
  credit: string; // Attribution
}

/** What the Claude subagent returns via stdout */
export interface ImageResult {
  courseSlug: string;
  region: string;
  images: ImageMetadata[];
  error: string | null;
}

export interface ImageOutcome {
  target: GolfImageTarget;
  status: "success" | "partial" | "failed";
  imageMetadata: ImageMetadata[];
  downloadedPaths: string[];
  errors: string[];
  cost_usd: number;
  duration_ms: number;
}
