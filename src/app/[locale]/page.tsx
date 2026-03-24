import type { Metadata } from "next";
import Link from "next/link";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { HeroSection } from "./_components/HeroSection";
import { RegionGrid } from "@/components/home/RegionGrid";
import { HomePageMap } from "./_components/HomePageMap";
import { NORWAY_MAP_REGIONS } from "@/lib/constants/norway-map-regions";
import { getHomepageSchemas, JsonLdMultiple } from "@/lib/schema";
import {
  getRegionsWithCounts,
  getTotalCourseCount,
  getAggregateRatingStats,
  getPopularCourses,
  getFeaturedCourses,
  getAllCoursesForMap,
} from "@/lib/courses";
import { PopularCourses } from "@/components/home/PopularCourses";
import { FeaturedCourses } from "@/components/home/FeaturedCourses";
import { buildMapUrl } from "@/lib/utils/url-helpers";

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations("metadata");

  return {
    title: t("title"),
    description: t("description"),
    openGraph: {
      locale: locale === "en" ? "en_GB" : "nb_NO",
    },
    alternates: {
      canonical: `https://golfkart.no${locale === "en" ? "/en" : ""}`,
      languages: {
        nb: "https://golfkart.no",
        en: "https://golfkart.no/en",
        "x-default": "https://golfkart.no",
      },
    },
  };
}

export default async function HomePage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("home");

  // Get dynamic data from JSON files
  const regionsWithCounts = getRegionsWithCounts();
  const totalCourses = getTotalCourseCount();
  const ratingStats = getAggregateRatingStats();
  const popularCourses = getPopularCourses(4);
  const featuredCourses = getFeaturedCourses(4);
  const coursesForMap = getAllCoursesForMap();

  // Merge with polygon data for interactive map
  const regions = regionsWithCounts.map((region) => {
    const mapRegion = NORWAY_MAP_REGIONS.find((r) => r.slug === region.slug);
    return {
      name: region.name,
      slug: region.slug,
      courseCount: region.count,
      polygonIds: mapRegion?.polygonIds || [],
    };
  });

  // Generate all schema.org markup for the homepage
  const schemas = getHomepageSchemas({
    regions,
    totalCourses,
    locale,
  });

  return (
    <>
      {/* JSON-LD structured data for SEO */}
      <JsonLdMultiple schemas={schemas} />

      <HeroSection
        courseCount={totalCourses}
        totalReviews={ratingStats.totalReviews}
        averageRating={ratingStats.averageRating}
      />

      <PopularCourses courses={popularCourses} />

      <FeaturedCourses courses={featuredCourses} />

      <section id="kart" className="bg-gradient-to-br from-green-900 to-green-950 py-16 md:py-20">
        <div className="container mx-auto max-w-[1170px] px-4">
          <div className="flex flex-col gap-8 lg:flex-row lg:items-stretch lg:gap-12">
            {/* Left: Text column */}
            <div className="flex flex-col justify-center lg:w-[340px] lg:flex-shrink-0">
              <span className="mb-4 inline-flex w-fit items-center gap-1.5 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-semibold tracking-wide text-white/85 backdrop-blur-sm">
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
                {t("mapBadge")}
              </span>

              <h2
                className="mb-3 text-3xl font-bold md:text-4xl"
                style={{ color: "hsl(132, 50%, 90%)" }}
              >
                {t("mapTitle")}
              </h2>

              <p
                className="mb-8 text-base font-light leading-relaxed"
                style={{ color: "hsl(132, 30%, 70%)" }}
              >
                {t("mapDescription", {
                  count: totalCourses,
                  regions: regions.length,
                })}
              </p>

              {/* Stats row */}
              <div className="mb-8 flex gap-6">
                <div className="text-center">
                  <div className="text-2xl font-bold" style={{ color: "hsl(160, 60%, 70%)" }}>
                    {totalCourses}
                  </div>
                  <div
                    className="text-xs font-medium uppercase tracking-wider"
                    style={{ color: "hsl(132, 20%, 55%)" }}
                  >
                    {t("mapStatCourses")}
                  </div>
                </div>
                <div className="w-px bg-white/15" />
                <div className="text-center">
                  <div className="text-2xl font-bold" style={{ color: "hsl(160, 60%, 70%)" }}>
                    {regions.length}
                  </div>
                  <div
                    className="text-xs font-medium uppercase tracking-wider"
                    style={{ color: "hsl(132, 20%, 55%)" }}
                  >
                    {t("mapStatRegions")}
                  </div>
                </div>
                <div className="w-px bg-white/15" />
                <div className="text-center">
                  <div className="text-2xl font-bold" style={{ color: "hsl(160, 60%, 70%)" }}>
                    {ratingStats.averageRating.toFixed(1)}
                  </div>
                  <div
                    className="text-xs font-medium uppercase tracking-wider"
                    style={{ color: "hsl(132, 20%, 55%)" }}
                  >
                    {t("mapStatRating")} &#9733;
                  </div>
                </div>
              </div>

              {/* CTA */}
              <Link
                href={buildMapUrl(locale)}
                className="inline-flex w-fit items-center gap-2 rounded-lg border-2 px-6 py-3 font-semibold transition-colors hover:bg-white/10"
                style={{
                  color: "hsl(160, 60%, 75%)",
                  borderColor: "hsl(160, 40%, 40%)",
                }}
              >
                {t("mapCta")}
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                >
                  <path d="M5 12h14m-7-7l7 7-7 7" />
                </svg>
              </Link>
            </div>

            {/* Right: Map */}
            <div className="min-h-[300px] flex-1 md:min-h-[400px]">
              <HomePageMap courses={coursesForMap} locale={locale} />
              {/* Noscript fallback: crawlable link for search engines and JS-disabled users */}
              <noscript>
                <div className="flex h-[300px] items-center justify-center rounded-xl bg-white/10 md:h-[400px]">
                  <p className="text-center text-white/80">
                    <Link href={buildMapUrl(locale)} className="text-white underline">
                      {t("mapCta")}
                    </Link>
                  </p>
                </div>
              </noscript>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-background py-16">
        <RegionGrid title={t("exploreRegions")} regions={regions} />
      </section>
    </>
  );
}
