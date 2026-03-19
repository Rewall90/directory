"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import type { Course } from "@/types/course";
import type { DisplayPhoto } from "../page";
import { getLocalizedName, getLocalizedDescription } from "@/lib/i18n-courses";

interface RatingData {
  averageRating: number;
  totalReviews: number;
}

interface SiteReviewData {
  averageRating: number;
  reviewCount: number;
}

interface CourseHeroProps {
  course: Course;
  ratingData: RatingData | null;
  siteReviews: SiteReviewData | null;
  photos: DisplayPhoto[];
  googlePlaceId?: string | null;
  locale: "nb" | "en";
}

function StarIcon({ filled }: { filled: boolean }) {
  return (
    <svg viewBox="0 0 24 24" className={`h-4 w-4 ${filled ? "fill-v3d-gold" : "fill-gray-300"}`}>
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
    </svg>
  );
}

export function CourseHero({
  course,
  ratingData,
  siteReviews,
  photos,
  googlePlaceId,
  locale,
}: CourseHeroProps) {
  const t = useTranslations("courseHero");
  const heroPhoto = photos[0];
  const accentPhoto = photos[1];
  const googleReviewsUrl = googlePlaceId
    ? `https://search.google.com/local/reviews?placeid=${googlePlaceId}`
    : null;
  const localizedName = getLocalizedName(course, locale);
  const localizedDescription = getLocalizedDescription(course, locale);

  return (
    <section className="mx-auto grid max-w-[1200px] gap-16 px-8 py-16 md:grid-cols-2 md:items-center">
      {/* Left: Content */}
      <div className="pr-8">
        {/* Eyebrow */}
        {course.course.yearBuilt && (
          <div className="mb-6 flex items-center gap-3 text-sm font-semibold uppercase tracking-widest text-v3d-gold">
            <span className="h-px w-10 bg-v3d-gold" />
            {t("established", { year: course.course.yearBuilt })}
          </div>
        )}

        {/* Title */}
        <h1 className="mb-6 font-serif text-4xl font-medium leading-tight text-v3d-text-dark md:text-5xl">
          {localizedName}
        </h1>

        {/* Subtitle */}
        {localizedDescription && (
          <p className="mb-8 text-xl font-light text-v3d-text-muted">
            {localizedDescription.split(".")[0]}.
          </p>
        )}

        {/* Rating Boxes */}
        <div className="flex flex-col gap-3">
          {/* Google Rating */}
          {ratingData && (
            <a
              href={googleReviewsUrl || "#"}
              target="_blank"
              rel="noopener noreferrer"
              className={`flex items-center gap-4 rounded-lg border border-v3d-border bg-v3d-warm p-6 transition-all ${
                googleReviewsUrl
                  ? "cursor-pointer hover:border-v3d-gold hover:shadow-md"
                  : "cursor-default"
              }`}
              onClick={(e) => !googleReviewsUrl && e.preventDefault()}
            >
              <div className="font-serif text-4xl font-semibold text-v3d-forest">
                {ratingData.averageRating.toFixed(1)}
              </div>
              <div className="border-l border-v3d-border pl-4">
                <div className="mb-1 flex gap-0.5">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <StarIcon key={star} filled={star <= Math.round(ratingData.averageRating)} />
                  ))}
                </div>
                <div className="flex items-center gap-1 text-sm text-v3d-text-muted">
                  {t("googleReviews", { count: ratingData.totalReviews })}
                  {googleReviewsUrl && (
                    <svg
                      className="h-3.5 w-3.5 text-v3d-gold"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                      />
                    </svg>
                  )}
                </div>
              </div>
            </a>
          )}

          {/* Site Reviews */}
          <a
            href="#anmeldelser"
            className="flex items-center gap-4 rounded-lg border border-v3d-border bg-v3d-warm p-6 transition-all hover:border-v3d-forest hover:shadow-md"
          >
            {siteReviews ? (
              <>
                <div className="font-serif text-4xl font-semibold text-v3d-forest">
                  {siteReviews.averageRating.toFixed(1)}
                </div>
                <div className="border-l border-v3d-border pl-4">
                  <div className="mb-1 flex gap-0.5">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <StarIcon key={star} filled={star <= Math.round(siteReviews.averageRating)} />
                    ))}
                  </div>
                  <div className="flex items-center gap-1 text-sm text-v3d-text-muted">
                    {siteReviews.reviewCount === 1
                      ? t("siteReviewSingular", { count: siteReviews.reviewCount })
                      : t("siteReviews", { count: siteReviews.reviewCount })}
                    <svg
                      className="h-3.5 w-3.5 text-v3d-forest"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex w-full items-center justify-between">
                <span className="text-sm text-v3d-text-muted">{t("writeFirstReview")}</span>
                <svg
                  className="h-4 w-4 text-v3d-forest"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </div>
            )}
          </a>
        </div>
      </div>

      {/* Right: Images */}
      <div className="relative">
        {/* Main Image */}
        <div className="relative flex aspect-[4/3] items-center justify-center overflow-hidden rounded-lg border border-dashed border-v3d-border bg-gradient-to-br from-v3d-forest-soft to-v3d-accent">
          {heroPhoto ? (
            <Image
              src={heroPhoto.url}
              alt={heroPhoto.alt}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 600px"
              priority
            />
          ) : (
            <span className="text-sm text-v3d-text-muted">{t("mainImagePlaceholder")}</span>
          )}
        </div>

        {/* Accent Image */}
        <div className="absolute -bottom-8 -left-8 hidden aspect-[16/10] w-3/5 items-center justify-center overflow-hidden rounded-lg border border-v3d-border bg-v3d-warm shadow-lg md:flex">
          {accentPhoto ? (
            <Image
              src={accentPhoto.url}
              alt={accentPhoto.alt}
              fill
              className="object-cover"
              sizes="360px"
            />
          ) : (
            <span className="text-xs text-v3d-text-light">{t("accentImagePlaceholder")}</span>
          )}
        </div>
      </div>
    </section>
  );
}
