/**
 * Locale utility functions for handling Norwegian and English content
 */

/**
 * Get the localized name for a course
 * Falls back to Norwegian name if English translation is not available
 */
export function getLocalizedName(
  name: string,
  nameEn: string | null | undefined,
  locale: string
): string {
  if (locale === "en" && nameEn) {
    return nameEn;
  }
  return name;
}

/**
 * Get the localized slug for a course
 * Falls back to Norwegian slug if English slug is not available
 */
export function getLocalizedSlug(
  slug: string,
  slugEn: string | null | undefined,
  locale: string
): string {
  if (locale === "en" && slugEn) {
    return slugEn;
  }
  return slug;
}

/**
 * Check if the current locale is English
 */
export function isEnglishLocale(locale: string): boolean {
  return locale === "en";
}

/**
 * Check if the current locale is Norwegian
 */
export function isNorwegianLocale(locale: string): boolean {
  return locale === "nb" || locale === "no";
}
