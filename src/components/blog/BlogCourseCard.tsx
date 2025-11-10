"use client";

import Link from "next/link";
import Image from "next/image";

interface BlogCourseCardProps {
  name: string;
  city: string;
  region: string;
  rating: number;
  reviewCount: number;
  courseUrl: string;
  holes?: number;
  par?: number;
  imageUrl?: string;
  imageAlt?: string;
}

export function BlogCourseCard({
  name,
  city,
  region,
  rating,
  reviewCount,
  courseUrl,
  holes,
  par,
  imageUrl,
  imageAlt,
}: BlogCourseCardProps) {
  return (
    <Link
      href={courseUrl}
      className="border-border-default group my-4 block rounded-lg border bg-background-surface p-6 shadow-sm transition hover:shadow-md"
    >
      <div className="flex items-start justify-between gap-4">
        {/* Image Thumbnail (if provided) */}
        {imageUrl && (
          <div className="flex-shrink-0">
            <Image
              src={imageUrl}
              alt={imageAlt || name}
              width={120}
              height={120}
              className="rounded-lg object-cover"
            />
          </div>
        )}

        {/* Left: Course Information */}
        <div className="flex-1">
          {/* Course Name */}
          <h3 className="mb-2 text-xl font-semibold text-text-primary group-hover:text-primary">
            {name}
          </h3>

          {/* Location */}
          <address className="mb-3 not-italic text-text-secondary">
            {city} • {region}
          </address>

          {/* Rating + Course Details */}
          <div className="flex flex-wrap items-center gap-2 text-sm text-text-secondary">
            {/* Star Rating */}
            <div className="flex items-center gap-1.5">
              <div className="flex items-center gap-0.5">
                {[1, 2, 3, 4, 5].map((star) => (
                  <svg
                    key={star}
                    className={`h-4 w-4 ${
                      star <= Math.round(rating) ? "text-yellow-500" : "text-gray-300"
                    }`}
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <span className="font-medium">{rating.toFixed(1)}</span>
              <span className="text-text-tertiary">
                • {reviewCount} anmeldelse{reviewCount !== 1 ? "r" : ""}
              </span>
            </div>

            {/* Course Details */}
            {holes && (
              <>
                <span className="text-text-tertiary">•</span>
                <span>{holes} hull</span>
              </>
            )}

            {par && (
              <>
                <span className="text-text-tertiary">•</span>
                <span>Par {par}</span>
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
