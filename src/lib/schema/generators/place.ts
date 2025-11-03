/**
 * Place/AdministrativeArea schema generator
 * Represents geographic regions (counties) in Norway
 * Appropriate for directory sites listing locations
 */

import type { PlaceSchema } from "../types/schema.types";
import type { RegionData } from "../types/site-config.types";
import { createRegionId, getCourseReference } from "../utils/create-id";

/**
 * Generate Place schema for a Norwegian region (county)
 * This is appropriate for directory sites to describe geographic areas
 *
 * @param region - Region data
 * @param courses - Optional array of courses in this region (for containsPlace)
 * @returns PlaceSchema object
 *
 * @example
 * ```ts
 * const regionSchema = generateRegionPlaceSchema(
 *   { name: "Akershus", slug: "akershus", description: "..." },
 *   [{ name: "Oslo Golfklubb", slug: "oslo-golfklubb" }]
 * );
 * ```
 */
export function generateRegionPlaceSchema(
  region: RegionData,
  courses?: Array<{ name: string; slug: string }>,
): PlaceSchema {
  const schema: PlaceSchema = {
    "@context": "https://schema.org",
    "@type": "AdministrativeArea",
    "@id": createRegionId(region.slug),

    // Basic information
    name: region.name,
    description:
      region.description ||
      `Golfbaner i ${region.name}. Utforsk ${region.courseCount || "flere"} golfbaner i regionen.`,
    url: `https://golfkart.no/${region.slug}`,

    // Country reference
    containedInPlace: {
      "@type": "Country",
      name: "Norge",
    },
  };

  // Add references to courses if provided
  // This creates entity relationships: Region contains these golf courses
  if (courses && courses.length > 0) {
    schema.containsPlace = courses.map((course) =>
      getCourseReference(region.slug, course.slug, course.name),
    );
  }

  return schema;
}

/**
 * Generate basic Place schema without course references
 * Use this when you just need to identify the region as an entity
 *
 * @param region - Region data
 * @returns PlaceSchema object
 */
export function generateBasicRegionSchema(region: RegionData): PlaceSchema {
  return generateRegionPlaceSchema(region);
}
