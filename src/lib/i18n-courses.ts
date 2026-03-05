import type { Course } from "@/types/course";

type Locale = "nb" | "en";

/**
 * Get a localized course field, preferring _en version for English locale
 */
export function getLocalizedField(
  course: Course,
  field: keyof Omit<Course, "slug_en" | "name_en" | "description_en">,
  locale: Locale,
): string | null {
  if (locale === "en") {
    const enField = `${field}_en` as keyof Course;
    const enValue = course[enField];
    if (enValue && typeof enValue === "string") return enValue;
  }
  const value = course[field];
  return typeof value === "string" ? value : null;
}

export function getLocalizedName(course: Course, locale: Locale): string {
  return locale === "en" && course.name_en ? course.name_en : course.name;
}

export function getLocalizedSlug(course: Course, locale: Locale): string {
  return locale === "en" && course.slug_en ? course.slug_en : course.slug;
}

export function getLocalizedDescription(course: Course, locale: Locale): string | null {
  return locale === "en" && course.description_en ? course.description_en : course.description;
}

/**
 * For nested course.terrain, course.courseType, etc.
 */
export function getLocalizedCourseField(
  course: Course,
  field: keyof Course["course"],
  locale: Locale,
): string | null {
  if (locale === "en") {
    const enField = `${field}_en` as keyof Course["course"];
    const enValue = course.course[enField];
    if (enValue && typeof enValue === "string") return enValue;
  }
  const value = course.course[field];
  return typeof value === "string" ? value : null;
}

export function getLocalizedSeasonField(
  course: Course,
  field: keyof Course["season"],
  locale: Locale,
): string | null {
  if (locale === "en") {
    const enField = `${field}_en` as keyof Course["season"];
    const enValue = course.season[enField];
    if (enValue && typeof enValue === "string") return enValue;
  }
  const value = course.season[field];
  return typeof value === "string" ? value : null;
}
