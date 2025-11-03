"use client";

import { useId } from "react";

interface StarRatingProps {
  rating: number; // 0-5
  maxRating?: number; // Default 5
  size?: number; // Size in pixels, default 14
  className?: string;
}

export function StarRating({
  rating,
  maxRating = 5,
  size = 14,
  className = "",
}: StarRatingProps) {
  // Generate a stable ID for this component instance
  const componentId = useId();

  // Normalize rating to 0-5 scale if maxRating is different
  const normalizedRating = (rating / maxRating) * 5;

  // Generate 5 stars
  const stars = Array.from({ length: 5 }, (_, index) => {
    const starNumber = index + 1;
    const fillPercentage = Math.min(
      Math.max(normalizedRating - index, 0),
      1,
    ) * 100;

    return (
      <Star
        key={index}
        fillPercentage={fillPercentage}
        size={size}
        starId={`star-${starNumber}`}
        componentId={componentId}
      />
    );
  });

  return (
    <div className={`inline-flex items-center gap-0.5 ${className}`}>
      {stars}
    </div>
  );
}

interface StarProps {
  fillPercentage: number; // 0-100
  size: number;
  starId: string;
  componentId: string;
}

function Star({ fillPercentage, size, starId, componentId }: StarProps) {
  // Create a stable gradient ID using componentId
  const gradientId = `star-gradient-${componentId}-${starId}`;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 14 14"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ display: "inline-block" }}
    >
      <defs>
        <linearGradient id={gradientId}>
          <stop
            offset={`${fillPercentage}%`}
            style={{ stopColor: "#16a34a", stopOpacity: 1 }}
          />
          <stop
            offset={`${fillPercentage}%`}
            style={{ stopColor: "#bac8c0", stopOpacity: 1 }}
          />
        </linearGradient>
      </defs>
      <path
        d="M8.6,5l4.2,0.4L9.7,8.3l1,4.2L7,10.3l-3.6,2.2l1-4.2L1.2,5.5L5.4,5l1.6-3.8L8.6,5z"
        fill={`url(#${gradientId})`}
        stroke="#16a34a"
        strokeWidth="1"
      />
    </svg>
  );
}
