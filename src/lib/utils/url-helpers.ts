/**
 * URL building utilities for consistent link generation
 */

/**
 * Build a course detail page URL
 * Handles both Norwegian and English locales
 */
export function buildCourseUrl(
  regionSlug: string,
  courseSlug: string,
  locale: string = "nb"
): string {
  const localePrefix = locale === "en" ? "/en" : "";
  return `${localePrefix}/${regionSlug}/${courseSlug}`;
}

/**
 * Build a region page URL
 * Handles both Norwegian and English locales
 */
export function buildRegionUrl(regionSlug: string, locale: string = "nb"): string {
  const localePrefix = locale === "en" ? "/en" : "";
  return `${localePrefix}/${regionSlug}`;
}

/**
 * Build the map page URL
 */
export function buildMapUrl(locale: string = "nb"): string {
  const localePrefix = locale === "en" ? "/en" : "";
  return `${localePrefix}/kart`;
}

/**
 * Build a Google Maps directions URL
 */
export function buildDirectionsUrl(lat: number, lng: number): string {
  return `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
}

/**
 * Build a Google Maps place URL
 */
export function buildPlaceUrl(lat: number, lng: number, placeName: string): string {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(placeName)}&query_place_id=${lat},${lng}`;
}
