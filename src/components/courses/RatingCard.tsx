"use client";

import { StarRating } from "./StarRating";

interface Rating {
  id: string;
  source: string;
  rating: number | null;
  reviewCount: number | null;
  maxRating: number | null;
  url: string | null;
}

interface RatingCardProps {
  rating: Rating;
}

export function RatingCard({ rating }: RatingCardProps) {
  const normalizedRating = rating.rating ? (rating.rating / (rating.maxRating || 5)) * 5 : 0;
  const hasUrl = !!rating.url;

  const handleClick = () => {
    if (hasUrl) {
      // Open reviews in a popup window
      window.open(
        rating.url,
        '_blank',
        'width=800,height=600,scrollbars=yes,resizable=yes'
      );
    }
  };

  return (
    <div
      className={`rounded-lg border border-border-subtle bg-background-surface p-4 shadow-sm ${hasUrl ? 'cursor-pointer hover:border-primary hover:shadow-md transition-all' : ''}`}
      onClick={handleClick}
      role={hasUrl ? "button" : undefined}
      tabIndex={hasUrl ? 0 : undefined}
      onKeyDown={(e) => {
        if (hasUrl && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault();
          handleClick();
        }
      }}
    >
      <div className="flex items-center justify-between">
        <div>
          <div className="font-semibold text-text-primary">
            {rating.source === "hole19" && "Hole19"}
            {rating.source === "18birdies" && "18Birdies"}
            {rating.source === "top100" && "Top 100 Golf Courses"}
            {rating.source === "google" && "Google"}
            {rating.source === "facebook" && "Facebook"}
            {!["hole19", "18birdies", "top100", "google", "facebook"].includes(rating.source) && rating.source}
          </div>
          {rating.reviewCount && rating.reviewCount > 0 && (
            <div className="text-xs text-text-tertiary">
              ({rating.reviewCount} anmeldelse{rating.reviewCount === 1 ? "" : "r"})
            </div>
          )}
        </div>
        <div className="text-right">
          <div className="flex items-center gap-1">
            <StarRating rating={normalizedRating} size={16} />
          </div>
          <div className="font-semibold text-text-primary">
            {normalizedRating.toFixed(1)} / 5
          </div>
        </div>
      </div>
    </div>
  );
}
