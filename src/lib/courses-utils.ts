/**
 * Pure course utilities with no fs/react dependencies.
 * Kept separate from courses.ts so leaf modules (e.g. vtg.ts) can import
 * them without creating import cycles.
 */

/**
 * Calculate average rating from multiple rating sources
 */
export function calculateAverageRating(
  ratings: Record<
    string,
    { rating: number | null; reviewCount: number | null; maxRating: number | null }
  >,
): { averageRating: number; totalReviews: number } | null {
  const entries = Object.values(ratings).filter((r) => r.rating !== null);
  if (entries.length === 0) return null;

  let weightedScore = 0;
  let totalReviews = 0;

  for (const rating of entries) {
    if (!rating.rating) continue;
    const normalized = (rating.rating / (rating.maxRating || 5)) * 5;

    if (rating.reviewCount && rating.reviewCount > 0) {
      weightedScore += normalized * rating.reviewCount;
      totalReviews += rating.reviewCount;
    } else {
      weightedScore += normalized;
      totalReviews += 1;
    }
  }

  if (totalReviews === 0) return null;

  return {
    averageRating: weightedScore / totalReviews,
    totalReviews,
  };
}
