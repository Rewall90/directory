import type { MapCourse } from "@/lib/courses";

/**
 * Extract unique regions and cities from courses in a single pass
 *
 * Performance optimization that uses a single loop instead of separate
 * Array.map() calls for regions and cities. Results are sorted
 * alphabetically using Norwegian locale.
 *
 * Time complexity: O(n) instead of O(2n)
 * Space complexity: O(r + c) where r = unique regions, c = unique cities
 *
 * @param courses - Array of courses to extract filter options from
 * @returns Object with sorted arrays of unique regions and cities
 *
 * @example
 * ```ts
 * const { regions, cities } = extractFilterOptions(courses);
 * // regions: ["Akershus", "Oslo", "Rogaland", ...]
 * // cities: ["Bergen", "Oslo", "Stavanger", ...]
 * ```
 */
export function extractFilterOptions(courses: MapCourse[]) {
  const regionSet = new Set<string>();
  const citySet = new Set<string>();

  for (const course of courses) {
    regionSet.add(course.region);
    citySet.add(course.city);
  }

  return {
    regions: Array.from(regionSet).sort((a, b) => a.localeCompare(b, "no")),
    cities: Array.from(citySet).sort((a, b) => a.localeCompare(b, "no")),
  };
}
