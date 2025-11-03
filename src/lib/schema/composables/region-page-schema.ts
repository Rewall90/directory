/**
 * Region page schema composable
 * Combines all necessary schemas for region listing pages
 * Appropriate for directory sites showing collections of golf courses
 */

import type { Schema } from "../types/schema.types";
import type { RegionData } from "../types/site-config.types";

// Import generators
import { generateOrganizationSchema } from "../generators/organization";
import { generateRegionPageSchema } from "../generators/webpage";
import { generateRegionBreadcrumb } from "../generators/breadcrumb";
import { generateCourseListSchema } from "../generators/itemlist";
import { generateRegionPlaceSchema } from "../generators/place";

/**
 * Get all schemas for a region page
 * Returns an array of schema objects to be rendered as separate JSON-LD blocks
 *
 * @param data - Region page data
 * @returns Array of schema objects
 *
 * @example
 * ```tsx
 * import { getRegionPageSchemas, JsonLdMultiple } from '@/lib/schema';
 *
 * export default function RegionPage({ region, courses }) {
 *   const schemas = getRegionPageSchemas({
 *     region: { name: "Akershus", slug: "akershus", courseCount: 24 },
 *     courses: [...], // Array of courses
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
export function getRegionPageSchemas(data: {
  /**
   * Region information
   */
  region: RegionData;
  /**
   * List of courses in this region
   */
  courses: Array<{ name: string; slug: string; description?: string }>;
}): Schema[] {
  const schemas: Schema[] = [];

  // 1. Organization - YOUR directory as the site owner
  schemas.push(generateOrganizationSchema());

  // 2. WebPage - This specific page on YOUR site
  schemas.push(generateRegionPageSchema(data.region.name, data.region.slug, data.courses.length));

  // 3. BreadcrumbList - Navigation structure
  schemas.push(generateRegionBreadcrumb(data.region.name, data.region.slug));

  // 4. ItemList - The main content: list of courses in this region
  // This is the KEY schema for directories - it shows you're curating a collection
  schemas.push(generateCourseListSchema(data.courses, data.region.slug, data.region.name));

  // 5. Place (AdministrativeArea) - The region as a geographic entity
  // This helps with local SEO and entity recognition
  schemas.push(generateRegionPlaceSchema(data.region, data.courses));

  return schemas;
}

/**
 * Entity relationships created by this composable:
 *
 * Organization (@id: https://golfkart.no/#organization)
 *     ↓ owns
 * WebPage (@id: https://golfkart.no/{region}#webpage)
 *     ↓ breadcrumb
 * BreadcrumbList (@id: https://golfkart.no/{region}#breadcrumb)
 *
 * ItemList (@id: https://golfkart.no/{region}#courselist)
 *     ↓ contains
 * Each course (ListItem) → links to course detail page
 *
 * Place/AdministrativeArea (@id: https://golfkart.no/{region})
 *     ↓ containsPlace
 * Each course (PlaceReference) → entity link to course
 *
 * This creates a directory-appropriate knowledge graph:
 * - YOUR organization owns the directory
 * - The region page lists courses (ItemList - perfect for directories)
 * - The region is identified as a geographic entity
 * - Courses are linked but NOT claimed to be owned by you
 */
