import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { getCoursesByRegion, getRegions } from "@/lib/courses";
import type { Course } from "@/types/course";
import { CourseCard } from "@/components/courses/CourseCard";
import { getCountyNameFromSlug, toRegionSlug } from "@/lib/constants/norway-regions";
import { getRegionPageSchemas, JsonLdMultiple } from "@/lib/schema";
import { routing } from "@/i18n/routing";

type Props = {
  params: Promise<{
    locale: string;
    region: string;
  }>;
};

const LEGACY_REGION_NAMES: Record<string, string> = {
  "vestfold-og-telemark": "Vestfold og Telemark",
  "troms-og-finnmark": "Troms og Finnmark",
  viken: "Viken",
};

function resolveDisplayName(slug: string): string {
  const normalized = toRegionSlug(slug);
  return getCountyNameFromSlug(normalized) ?? LEGACY_REGION_NAMES[normalized] ?? slug;
}

/**
 * Adapt JSON Course structure to the flat structure expected by CourseCard
 * This is a temporary adapter until CourseCard is migrated to use JSON types
 */
interface CardCourse {
  slug: string;
  slug_en?: string;
  name: string;
  name_en?: string;
  region: string;
  city: string;
  postalCode: string;
  addressStreet: string | null;
  addressArea: string | null;
  holes: number | null;
  par: number | null;
  ratings?: Array<{
    rating: number | null;
    reviewCount: number | null;
    maxRating: number | null;
  }>;
}

function adaptCourseForCard(course: Course): CardCourse {
  // Convert ratings object to array format expected by CourseCard
  const ratingsArray = Object.entries(course.ratings).map(([, rating]) => ({
    rating: rating.rating,
    reviewCount: rating.reviewCount,
    maxRating: rating.maxRating,
  }));

  return {
    slug: course.slug,
    slug_en: course.slug_en,
    name: course.name,
    name_en: course.name_en,
    region: course.region,
    city: course.city,
    addressStreet: course.address.street,
    addressArea: course.address.area,
    postalCode: course.address.postalCode,
    holes: course.course.holes,
    par: course.course.par,
    ratings: ratingsArray,
  };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, region } = await params;
  const t = await getTranslations({ locale, namespace: "region" });
  const displayName = resolveDisplayName(region);

  // Fetch courses for the region to get count
  const regionSlug = toRegionSlug(region);
  const courses = getCoursesByRegion(regionSlug);
  const courseCount = courses.length;

  const title = t("metaTitle", { region: displayName, count: courseCount });
  const description = t("metaDescription", { region: displayName, count: courseCount });

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
      locale: locale === "en" ? "en_GB" : "nb_NO",
      url: `https://golfkart.no${locale === "en" ? "/en" : ""}/${region}`,
    },
    alternates: {
      canonical: `https://golfkart.no${locale === "en" ? "/en" : ""}/${region}`,
      languages: {
        nb: `https://golfkart.no/${region}`,
        en: `https://golfkart.no/en/${region}`,
        "x-default": `https://golfkart.no/${region}`,
      },
    },
  };
}

export default async function RegionPage({ params }: Props) {
  const { locale, region } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("region");

  // Check if it's a valid region FIRST
  const normalized = toRegionSlug(region);
  const validRegion = getCountyNameFromSlug(normalized);
  const isLegacyRegion = LEGACY_REGION_NAMES[normalized];

  // If it's not a valid or legacy region, return 404 immediately
  if (!validRegion && !isLegacyRegion) {
    notFound();
  }

  const displayName = resolveDisplayName(region);

  // Fetch courses from JSON files
  const courses = getCoursesByRegion(normalized);

  // Sort courses alphabetically by name
  const sortedCourses = [...courses].sort((a, b) => a.name.localeCompare(b.name, "no"));

  // Generate schema.org markup for the region page
  const schemas = getRegionPageSchemas({
    region: {
      name: displayName,
      slug: region,
      courseCount: sortedCourses.length,
    },
    courses: sortedCourses.map((course) => ({
      name: course.name,
      slug: course.slug,
      description: course.description || undefined,
    })),
    locale,
  });

  return (
    <>
      {/* JSON-LD structured data for SEO */}
      <JsonLdMultiple schemas={schemas} />

      <div className="container mx-auto max-w-[1170px] px-4 py-16">
        {/* Breadcrumb */}
        <nav className="mb-6 text-sm text-text-secondary">
          <Link href="/" className="hover:text-primary">
            {t("breadcrumbHome")}
          </Link>
          <span className="mx-2">/</span>
          <Link href="/regions" className="hover:text-primary">
            {t("breadcrumbRegions")}
          </Link>
          <span className="mx-2">/</span>
          <span className="text-text-primary">{displayName}</span>
        </nav>

        {/* Region Header */}
        <h1 className="mb-4 text-3xl font-bold text-text-primary">
          {t("pageTitle", { region: displayName })}
        </h1>

        {sortedCourses.length === 0 ? (
          /* Empty State */
          <div className="mt-8 rounded-lg bg-background-surface p-12 text-center shadow-sm">
            <p className="mb-2 text-lg text-text-primary">
              {t("emptyTitle", { region: displayName })}
            </p>
            <p className="mb-6 text-text-secondary">{t("emptySubtitle")}</p>
            <Link href="/" className="inline-block text-primary hover:underline">
              {t("backToHome")}
            </Link>
          </div>
        ) : (
          <>
            <p className="mb-8 text-text-secondary">
              {sortedCourses.length !== 1
                ? t("courseCount", { count: sortedCourses.length, region: displayName })
                : t("courseCountSingular", { count: sortedCourses.length, region: displayName })}
            </p>

            {/* Course List */}
            <div className="grid gap-8 md:grid-cols-2">
              {sortedCourses.map((course) => (
                <CourseCard
                  key={course.slug}
                  course={adaptCourseForCard(course)}
                  locale={locale as "nb" | "en"}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </>
  );
}

// Generate static params for all regions at build time
export async function generateStaticParams() {
  const regions = getRegions();
  return routing.locales.flatMap((locale) => regions.map((region) => ({ locale, region })));
}
