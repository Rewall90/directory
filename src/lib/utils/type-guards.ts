import type { Course } from "@/types/course";

/**
 * Type guard to check if a course has valid coordinates
 * Ensures coordinates exist and are valid numbers
 */
export function hasValidCoordinates(
  course: Course
): course is Course & { coordinates: { lat: number; lng: number } } {
  return (
    course.coordinates != null &&
    typeof course.coordinates.lat === "number" &&
    typeof course.coordinates.lng === "number" &&
    !Number.isNaN(course.coordinates.lat) &&
    !Number.isNaN(course.coordinates.lng)
  );
}

/**
 * Type guard to check if a value is a non-empty string
 */
export function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

/**
 * Type guard to check if a value is a valid number (not NaN or Infinity)
 */
export function isValidNumber(value: unknown): value is number {
  return typeof value === "number" && !Number.isNaN(value) && Number.isFinite(value);
}
