/**
 * Homepage schema composable
 * Combines all necessary schemas for the homepage
 * Creates a complete entity graph for optimal SEO
 */

import type { Schema } from "../types/schema.types";
import type { RegionData } from "../types/site-config.types";
import { SITE_CONFIG } from "../config/site-config";

// Import generators
import { generateOrganizationSchema } from "../generators/organization";
import { generateWebSiteSchema } from "../generators/website";
import { generateHomePageSchema } from "../generators/webpage";
import { generateHomeBreadcrumb } from "../generators/breadcrumb";
import { generateRegionListSchema } from "../generators/itemlist";

/**
 * Get all schemas for the homepage
 * Returns an array of schema objects to be rendered as separate JSON-LD blocks
 *
 * @param data - Homepage data
 * @returns Array of schema objects
 *
 * @example
 * ```tsx
 * import { getHomepageSchemas, JsonLdMultiple } from '@/lib/schema';
 *
 * export default function HomePage() {
 *   const regions = [...]; // Your region data
 *   const schemas = getHomepageSchemas({
 *     regions,
 *     totalCourses: 169
 *   });
 *
 *   return (
 *     <>
 *       <JsonLdMultiple schemas={schemas} />
 *       {/* Rest of page content *\/}
 *     </>
 *   );
 * }
 * ```
 */
export function getHomepageSchemas(data: {
  /**
   * List of regions to display
   */
  regions: RegionData[];
  /**
   * Total number of courses across all regions
   */
  totalCourses: number;
  /**
   * Page locale ("nb" or "en")
   */
  locale?: string;
}): Schema[] {
  const schemas: Schema[] = [];

  // 1. Organization - Who owns/operates this site
  schemas.push(generateOrganizationSchema());

  // 2. WebSite - The website itself with search capability
  schemas.push(generateWebSiteSchema());

  // 3. WebPage - This specific page (homepage)
  schemas.push(generateHomePageSchema(data.totalCourses, data.locale));

  // 4. BreadcrumbList - Navigation (just "Home" for homepage)
  schemas.push(generateHomeBreadcrumb(data.locale));

  // 5. ItemList - List of regions displayed on homepage
  schemas.push(generateRegionListSchema(data.regions));

  // 6. Map - Interactive map feature for discovery
  schemas.push({
    "@context": "https://schema.org",
    "@type": "Map",
    "@id": `${SITE_CONFIG.baseUrl}/#map`,
    name:
      data.locale === "en"
        ? "Golf Courses in Norway - Interactive Map"
        : "Norges Golfbaner - Interaktivt Kart",
    description:
      data.locale === "en"
        ? `Interactive map showing ${data.totalCourses} golf courses across Norway`
        : `Interaktivt kart som viser ${data.totalCourses} golfbaner i hele Norge`,
    mapType: "https://schema.org/VenueMap",
    url: `${SITE_CONFIG.baseUrl}${data.locale === "en" ? "/en" : ""}/kart`,
    isPartOf: { "@id": `${SITE_CONFIG.baseUrl}/#website` },
  } as unknown as Schema);

  return schemas;
}

/**
 * Entity relationships created by this composable:
 *
 * Organization (@id: https://golfkart.no/#organization)
 *     ↑
 *     | publisher
 * WebSite (@id: https://golfkart.no/#website)
 *     ↑
 *     | isPartOf
 * WebPage (@id: https://golfkart.no/#webpage)
 *     ↑
 *     | breadcrumb
 * BreadcrumbList (@id: https://golfkart.no/#breadcrumb)
 *
 * ItemList (@id: https://golfkart.no/#regionlist)
 *     ↓
 * Each region (ListItem) → links to region page URL
 *
 * This creates a complete knowledge graph that Google can understand:
 * - golfkart.no Organization owns the Website
 * - The Website contains this WebPage
 * - The page has a Breadcrumb trail
 * - The page displays an ItemList of regions
 * - Each region links to its own page
 */
