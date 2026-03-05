/**
 * WebPage schema generator
 * Represents individual pages on the website
 * Provides page-specific metadata for search engines
 */

import type { WebPageSchema } from "../types/schema.types";
import type { PageMetadata } from "../types/site-config.types";
import {
  createWebPageId,
  createFullUrl,
  getWebsiteReference,
  getBreadcrumbReference,
} from "../utils/create-id";

/**
 * Generate WebPage schema for any page
 *
 * @param metadata - Page metadata (title, description, url, etc.)
 * @param options - Optional configuration
 * @returns WebPageSchema object
 *
 * @example
 * ```ts
 * const pageSchema = generateWebPageSchema({
 *   title: "golfkart.no - Finn golfbaner i Norge",
 *   description: "Utforsk 169 golfbaner...",
 *   url: "/",
 * });
 * ```
 */
export function generateWebPageSchema(
  metadata: PageMetadata,
  options?: {
    /**
     * Include breadcrumb reference
     * Set to false if page doesn't have breadcrumb schema
     */
    includeBreadcrumb?: boolean;
    /**
     * Language of the page content ("nb" for Norwegian, "en" for English)
     */
    locale?: string;
  },
): WebPageSchema {
  const { includeBreadcrumb = true, locale } = options || {};

  // Ensure we have a full URL
  const fullUrl = metadata.url.startsWith("http") ? metadata.url : createFullUrl(metadata.url);

  const schema: WebPageSchema = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "@id": createWebPageId(metadata.url),

    // Basic information
    name: metadata.title,
    description: metadata.description,
    url: fullUrl,

    // Link to parent website (entity relationship)
    isPartOf: getWebsiteReference(),

    // Language
    inLanguage: locale === "en" ? "en" : "nb",

    // Image (if provided)
    ...(metadata.image && {
      image: metadata.image.startsWith("http") ? metadata.image : createFullUrl(metadata.image),
    }),

    // Publishing dates (if provided)
    ...(metadata.datePublished && { datePublished: metadata.datePublished }),
    ...(metadata.dateModified && { dateModified: metadata.dateModified }),
  };

  // Add breadcrumb reference if enabled
  if (includeBreadcrumb) {
    schema.breadcrumb = getBreadcrumbReference(metadata.url);
  }

  return schema;
}

/**
 * Helper: Generate homepage WebPage schema
 *
 * @param courseCount - Total number of courses (for description)
 * @returns WebPageSchema object
 */
export function generateHomePageSchema(courseCount: number, locale?: string): WebPageSchema {
  return generateWebPageSchema(
    {
      title:
        locale === "en"
          ? "golfkart.no - Find Golf Courses in Norway"
          : "golfkart.no - Finn golfbaner i Norge",
      description:
        locale === "en"
          ? `Explore ${courseCount} golf courses across Norway – with updated information about facilities, services and user reviews.`
          : `Utforsk ${courseCount} golfbaner i hele Norge – med oppdatert informasjon om fasiliteter, tjenester og brukeranmeldelser.`,
      url: "/",
    },
    { locale },
  );
}

/**
 * Helper: Generate region page WebPage schema
 *
 * @param regionName - Name of the region
 * @param regionSlug - URL slug of the region
 * @param courseCount - Number of courses in the region
 * @returns WebPageSchema object
 */
export function generateRegionPageSchema(
  regionName: string,
  regionSlug: string,
  courseCount: number,
  locale?: string,
): WebPageSchema {
  return generateWebPageSchema(
    {
      title:
        locale === "en"
          ? `Golf Courses in ${regionName} | golfkart.no`
          : `Golfbaner i ${regionName} | golfkart.no`,
      description:
        locale === "en"
          ? `Explore ${courseCount} golf courses in ${regionName}. Find information about facilities, services and reviews.`
          : `Utforsk ${courseCount} golfbaner i ${regionName}. Finn informasjon om fasiliteter, tjenester og anmeldelser.`,
      url: `/${regionSlug}`,
    },
    { locale },
  );
}

/**
 * Helper: Generate search page WebPage schema
 *
 * @returns WebPageSchema object
 */
export function generateSearchPageSchema(locale?: string): WebPageSchema {
  return generateWebPageSchema(
    {
      title:
        locale === "en"
          ? "Search for Golf Courses | golfkart.no"
          : "Søk etter golfbaner | golfkart.no",
      description:
        locale === "en"
          ? "Search and find golf courses in Norway. Filter by region, facilities and services."
          : "Søk og finn golfbaner i Norge. Filtrer etter region, fasiliteter og tjenester.",
      url: "/search",
    },
    { locale },
  );
}
