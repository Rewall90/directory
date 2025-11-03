/**
 * BreadcrumbList schema generator
 * Creates navigation breadcrumb markup for search results
 * Displays breadcrumb trail in Google search results
 */

import type { BreadcrumbListSchema, ListItem } from "../types/schema.types";
import type { BreadcrumbItem } from "../types/site-config.types";
import { SITE_CONFIG } from "../config/site-config";
import { createBreadcrumbId, createFullUrl } from "../utils/create-id";

/**
 * Generate BreadcrumbList schema from breadcrumb items
 *
 * @param items - Array of breadcrumb items (name and URL)
 * @param currentPageUrl - Current page URL (for @id)
 * @returns BreadcrumbListSchema object
 *
 * @example
 * ```ts
 * const breadcrumbs = [
 *   { name: "Hjem", url: "/" },
 *   { name: "Akershus", url: "/akershus" },
 *   { name: "Oslo Golfklubb", url: "/akershus/oslo-golfklubb" }
 * ];
 * const schema = generateBreadcrumbSchema(breadcrumbs, "/akershus/oslo-golfklubb");
 * ```
 */
export function generateBreadcrumbSchema(
  items: BreadcrumbItem[],
  currentPageUrl: string,
): BreadcrumbListSchema {
  // Convert breadcrumb items to schema.org ListItem format
  const listItems: ListItem[] = items.map((item, index) => ({
    "@type": "ListItem",
    position: index + 1, // Position starts at 1
    name: item.name,
    item: item.url.startsWith("http") ? item.url : createFullUrl(item.url),
  }));

  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "@id": createBreadcrumbId(currentPageUrl),
    itemListElement: listItems,
  };
}

/**
 * Helper: Generate homepage breadcrumb (just "Home")
 * Use this for the homepage itself
 *
 * @returns BreadcrumbListSchema object
 */
export function generateHomeBreadcrumb(): BreadcrumbListSchema {
  return generateBreadcrumbSchema([{ name: "Hjem", url: "/" }], "/");
}

/**
 * Helper: Generate region page breadcrumb
 * Format: Home > Region Name
 *
 * @param regionName - Display name of the region
 * @param regionSlug - URL slug of the region
 * @returns BreadcrumbListSchema object
 */
export function generateRegionBreadcrumb(
  regionName: string,
  regionSlug: string,
): BreadcrumbListSchema {
  return generateBreadcrumbSchema(
    [
      { name: "Hjem", url: "/" },
      { name: regionName, url: `/${regionSlug}` },
    ],
    `/${regionSlug}`,
  );
}

/**
 * Helper: Generate course page breadcrumb
 * Format: Home > Region Name > Course Name
 *
 * @param regionName - Display name of the region
 * @param regionSlug - URL slug of the region
 * @param courseName - Display name of the course
 * @param courseSlug - URL slug of the course
 * @returns BreadcrumbListSchema object
 */
export function generateCourseBreadcrumb(
  regionName: string,
  regionSlug: string,
  courseName: string,
  courseSlug: string,
): BreadcrumbListSchema {
  return generateBreadcrumbSchema(
    [
      { name: "Hjem", url: "/" },
      { name: regionName, url: `/${regionSlug}` },
      { name: courseName, url: `/${regionSlug}/${courseSlug}` },
    ],
    `/${regionSlug}/${courseSlug}`,
  );
}

/**
 * Helper: Generate search page breadcrumb
 * Format: Home > Søk
 *
 * @returns BreadcrumbListSchema object
 */
export function generateSearchBreadcrumb(): BreadcrumbListSchema {
  return generateBreadcrumbSchema(
    [
      { name: "Hjem", url: "/" },
      { name: "Søk", url: "/search" },
    ],
    "/search",
  );
}

/**
 * Helper: Generate regions overview page breadcrumb
 * Format: Home > Fylke
 *
 * @returns BreadcrumbListSchema object
 */
export function generateRegionsOverviewBreadcrumb(): BreadcrumbListSchema {
  return generateBreadcrumbSchema(
    [
      { name: "Hjem", url: "/" },
      { name: "Fylke", url: "/regions" },
    ],
    "/regions",
  );
}
