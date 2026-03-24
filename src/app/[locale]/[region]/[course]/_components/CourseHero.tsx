"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
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
  ranking?: { position: number; blogSlug: string } | null;
  blogArticleSlug?: string | null;
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
  ranking,
  blogArticleSlug,
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

          {/* Top 10 Ranking Badge */}
          {ranking && (
            <Link
              href={`/blog/${ranking.blogSlug}`}
              className="border-v3d-gold/30 from-v3d-gold/5 to-v3d-gold/10 flex items-center gap-4 rounded-lg border bg-gradient-to-r p-6 transition-all hover:border-v3d-gold hover:shadow-md"
            >
              <div className="font-serif text-4xl font-semibold text-v3d-gold">
                #{ranking.position}
              </div>
              <div className="border-v3d-gold/30 border-l pl-4">
                <div className="text-sm font-medium text-v3d-text-dark">
                  {t("rankedBest", { rank: ranking.position })}
                </div>
                <div className="text-xs text-v3d-text-muted">{t("seeFullRanking")}</div>
              </div>
            </Link>
          )}

          {/* Blog Article Link */}
          {blogArticleSlug && (
            <Link
              href={`/blog/${blogArticleSlug}`}
              className="flex items-center gap-4 rounded-lg border border-v3d-border bg-v3d-warm p-6 transition-all hover:border-v3d-forest hover:shadow-md"
            >
              <div className="bg-v3d-forest/10 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg">
                <svg
                  className="h-5 w-5 text-v3d-forest"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                  />
                </svg>
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-sm font-medium text-v3d-text-dark">{t("readFullGuide")}</div>
                <div className="text-xs text-v3d-text-muted">{t("readFullGuideDescription")}</div>
              </div>
              <svg
                className="h-4 w-4 flex-shrink-0 text-v3d-forest"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </Link>
          )}
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
              placeholder={
                heroPhoto.credit && "placeholder" in heroPhoto && heroPhoto.placeholder
                  ? "blur"
                  : undefined
              }
              blurDataURL={
                heroPhoto.credit &&
                "placeholder" in heroPhoto &&
                typeof heroPhoto.placeholder === "string"
                  ? heroPhoto.placeholder
                  : undefined
              }
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
              loading="lazy"
              placeholder={
                "placeholder" in accentPhoto && accentPhoto.placeholder ? "blur" : undefined
              }
              blurDataURL={
                "placeholder" in accentPhoto && typeof accentPhoto.placeholder === "string"
                  ? accentPhoto.placeholder
                  : undefined
              }
            />
          ) : (
            <span className="text-xs text-v3d-text-light">{t("accentImagePlaceholder")}</span>
          )}
        </div>
      </div>
    </section>
  );
}
