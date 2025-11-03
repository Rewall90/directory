/**
 * Regions overview page schema composable
 * Combines all necessary schemas for the /regions page
 */

import type { Schema } from "../types/schema.types";
import type { RegionData } from "../types/site-config.types";

// Import generators
import { generateOrganizationSchema } from "../generators/organization";
import { generateWebSiteSchema } from "../generators/website";
import { generateRegionsOverviewBreadcrumb } from "../generators/breadcrumb";
import { generateRegionListSchema } from "../generators/itemlist";

/**
 * Get all schemas for the regions overview page
 * Returns an array of schema objects to be rendered as separate JSON-LD blocks
 *
 * @param data - Regions overview page data
 * @returns Array of schema objects
 *
 * @example
 * ```tsx
 * import { getRegionsOverviewSchemas, JsonLdMultiple } from '@/lib/schema';
 *
 * export default function RegionsPage() {
 *   const regions = [...]; // Your region data
 *   const schemas = getRegionsOverviewSchemas({
 *     regions,
 *     totalCourses: 162
 *   });
 *
 *   return (
 *     <>
 *       <JsonLdMultiple schemas={schemas} />
 *       // Rest of page content
 *     </>
 *   );
 * }
 * ```
 */
export function getRegionsOverviewSchemas(data: {
  /**
   * List of regions to display
   */
  regions: RegionData[];
  /**
   * Total number of courses across all regions
   */
  totalCourses: number;
}): Schema[] {
  const schemas: Schema[] = [];

  // 1. Organization - Who owns/operates this site
  schemas.push(generateOrganizationSchema());

  // 2. WebSite - The website itself with search capability
  schemas.push(generateWebSiteSchema());

  // 3. BreadcrumbList - Navigation (Home > Fylke)
  schemas.push(generateRegionsOverviewBreadcrumb());

  // 4. ItemList - List of regions displayed on this page
  schemas.push(generateRegionListSchema(data.regions));

  return schemas;
}

/**
 * Entity relationships created by this composable:
 *
 * Organization (@id: https://golfkart.no/#organization)
 *     ↓ owns
 * WebSite (@id: https://golfkart.no/#website)
 *     ↑
 *     | breadcrumb
 * BreadcrumbList (@id: https://golfkart.no/regions#breadcrumb)
 *
 * ItemList (@id: https://golfkart.no/regions#regionlist)
 *     ↓
 * Each region (ListItem) → links to region page URL
 */
