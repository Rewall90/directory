/**
 * ItemList schema generator
 * Creates structured lists of items (regions, courses, search results)
 * Helps Google understand collections and their order
 */

import type { ItemListSchema, ListItem } from "../types/schema.types";
import type { ListItemData, RegionData } from "../types/site-config.types";
import { createRegionListId, createCourseListId, createFullUrl } from "../utils/create-id";

/**
 * Generate ItemList schema from generic list items
 *
 * @param items - Array of list items
 * @param options - Configuration options
 * @returns ItemListSchema object
 */
export function generateItemListSchema(
  items: ListItemData[],
  options: {
    /**
     * List identifier for @id generation
     */
    listId: string;
    /**
     * Optional list name
     */
    name?: string;
    /**
     * Optional list description
     */
    description?: string;
  },
): ItemListSchema {
  // Convert items to schema.org ListItem format
  const listItems: ListItem[] = items.map((item, index) => ({
    "@type": "ListItem",
    position: index + 1, // Position starts at 1
    item: {
      "@type": "Thing",
      name: item.name,
      url: item.url.startsWith("http") ? item.url : createFullUrl(item.url),
      ...(item.description && { description: item.description }),
      ...(item.image && {
        image: item.image.startsWith("http") ? item.image : createFullUrl(item.image),
      }),
    },
  }));

  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "@id": options.listId,
    ...(options.name && { name: options.name }),
    ...(options.description && { description: options.description }),
    numberOfItems: items.length,
    itemListElement: listItems,
  };
}

/**
 * Helper: Generate ItemList for regions on homepage
 *
 * @param regions - Array of region data
 * @returns ItemListSchema object
 *
 * @example
 * ```ts
 * const regions = [
 *   { name: "Akershus", slug: "akershus", courseCount: 24 },
 *   { name: "Oslo", slug: "oslo", courseCount: 3 }
 * ];
 * const schema = generateRegionListSchema(regions);
 * ```
 */
export function generateRegionListSchema(regions: RegionData[]): ItemListSchema {
  const items: ListItemData[] = regions.map((region) => ({
    name: region.name,
    url: `/${region.slug}`,
    description: region.description || `Golfbaner i ${region.name}`,
  }));

  return generateItemListSchema(items, {
    listId: createRegionListId("/"),
    name: "Golfregioner i Norge",
    description: "Oversikt over alle regioner med golfbaner i Norge",
  });
}

/**
 * Helper: Generate ItemList for courses on region page
 *
 * @param courses - Array of course data
 * @param regionSlug - Region slug for URL construction
 * @param regionName - Region name for description
 * @returns ItemListSchema object
 *
 * @example
 * ```ts
 * const courses = [
 *   { name: "Oslo Golfklubb", slug: "oslo-golfklubb" },
 *   { name: "Lørenskog Golfklubb", slug: "lorenskog-golfklubb" }
 * ];
 * const schema = generateCourseListSchema(courses, "akershus", "Akershus");
 * ```
 */
export function generateCourseListSchema(
  courses: Array<{ name: string; slug: string; description?: string }>,
  regionSlug: string,
  regionName: string,
): ItemListSchema {
  const items: ListItemData[] = courses.map((course) => ({
    name: course.name,
    url: `/${regionSlug}/${course.slug}`,
    description: course.description,
  }));

  return generateItemListSchema(items, {
    listId: createCourseListId(`/${regionSlug}`),
    name: `Golfbaner i ${regionName}`,
    description: `Liste over golfbaner i ${regionName}`,
  });
}

/**
 * Helper: Generate ItemList for search results
 *
 * @param results - Array of search result items
 * @param searchQuery - Optional search query for context
 * @returns ItemListSchema object
 */
export function generateSearchResultsListSchema(
  results: ListItemData[],
  searchQuery?: string,
): ItemListSchema {
  const name = searchQuery ? `Søkeresultater for "${searchQuery}"` : "Søkeresultater";
  const description = searchQuery
    ? `Golfbaner som matcher "${searchQuery}"`
    : "Søkeresultater for golfbaner";

  return generateItemListSchema(results, {
    listId: createCourseListId("/search"),
    name,
    description,
  });
}
