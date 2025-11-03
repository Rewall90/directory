import Link from "next/link";
import { toRegionSlug } from "@/lib/constants/norway-regions";
import type { Course, Rating } from "@prisma/client";
import { StarRating } from "./StarRating";

interface CourseCardProps {
  course: Course & {
    ratings?: Rating[];
  };
}

export function CourseCard({ course }: CourseCardProps) {
  // Calculate weighted average rating and total reviews
  const ratingData = calculateRating(course.ratings || []);

  // Build the course URL
  const courseUrl = `/${toRegionSlug(course.region)}/${course.slug}`;

  // Determine if we have a full address or placeholder
  const hasFullAddress =
    course.addressStreet && course.addressStreet !== "TBD";

  return (
    <Link
      href={courseUrl}
      className="group block rounded-lg border border-border-default bg-background-surface p-6 shadow-sm transition hover:shadow-md"
    >
      <div className="flex items-start justify-between gap-4">
        {/* Left: Course Information (grows to fill space) */}
        <div className="flex-1">
          {/* Course Name */}
          <h3 className="mb-2 text-xl font-semibold text-text-primary group-hover:text-primary">
            {course.name}
          </h3>

          {/* Address */}
          <address className="mb-3 not-italic text-text-secondary">
            {hasFullAddress ? (
              <>
                {course.addressStreet}
                {course.addressArea && `, ${course.addressArea}`}
                <br />
                {course.postalCode} {course.city}
              </>
            ) : (
              <>
                {course.city} • {course.region}
              </>
            )}
          </address>

          {/* Rating + Course Details */}
          <div className="flex flex-wrap items-center gap-2 text-sm text-text-secondary">
            {/* Star Rating */}
            {ratingData && (
              <div className="flex items-center gap-1.5">
                <StarRating rating={ratingData.averageRating} />
                <span className="font-medium">{ratingData.averageRating.toFixed(1)}</span>
                <span className="text-text-tertiary">
                  • {ratingData.totalReviews} anmeldelse
                  {ratingData.totalReviews !== 1 ? "r" : ""}
                </span>
              </div>
            )}

            {/* Separator if we have both rating and course details */}
            {ratingData && (course.holes || course.par) && (
              <span className="text-text-tertiary">•</span>
            )}

            {/* Holes */}
            {course.holes && (
              <span>
                {course.holes} hull
              </span>
            )}

            {/* Par */}
            {course.par && (
              <>
                <span className="text-text-tertiary">•</span>
                <span>Par {course.par}</span>
              </>
            )}
          </div>
        </div>

        {/* Right: Button */}
        <div className="flex-shrink-0">
          <span className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-6 py-3 font-semibold text-primary-content transition group-hover:bg-primary-light">
            Se Bane
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              className="h-4 w-4"
            >
              <path
                fillRule="evenodd"
                d="M3 10a.75.75 0 01.75-.75h10.638L10.23 5.29a.75.75 0 111.04-1.08l5.5 5.25a.75.75 0 010 1.08l-5.5 5.25a.75.75 0 11-1.04-1.08l4.158-3.96H3.75A.75.75 0 013 10z"
                clipRule="evenodd"
              />
            </svg>
          </span>
        </div>
      </div>
    </Link>
  );
}

/**
 * Calculate weighted average rating and total review count
 */
function calculateRating(ratings: Rating[]) {
  if (!ratings || ratings.length === 0) return null;

  let totalWeightedScore = 0;
  let totalReviews = 0;

  ratings.forEach((rating) => {
    if (rating.rating && rating.reviewCount) {
      // Normalize rating to 5-star scale
      const normalizedRating = (rating.rating / (rating.maxRating || 5)) * 5;
      totalWeightedScore += normalizedRating * rating.reviewCount;
      totalReviews += rating.reviewCount;
    } else if (rating.rating && !rating.reviewCount) {
      // If no review count, treat as 1 review
      const normalizedRating = (rating.rating / (rating.maxRating || 5)) * 5;
      totalWeightedScore += normalizedRating;
      totalReviews += 1;
    }
  });

  if (totalReviews === 0) return null;

  return {
    averageRating: totalWeightedScore / totalReviews,
    totalReviews,
  };
}
