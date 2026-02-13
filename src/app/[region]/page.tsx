import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getCoursesByRegion, getRegions, calculateAverageRating } from "@/lib/courses";
import type { Course } from "@/types/course";
import { CourseCard } from "@/components/courses/CourseCard";
import { getCountyNameFromSlug, toRegionSlug } from "@/lib/constants/norway-regions";
import { getRegionPageSchemas, JsonLdMultiple } from "@/lib/schema";

interface RegionPageProps {
  params: Promise<{
    region: string;
  }>;
}

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
function adaptCourseForCard(course: Course) {
  // Convert ratings object to array format expected by CourseCard
  const ratingsArray = Object.entries(course.ratings).map(([source, rating]) => ({
    id: source,
    courseId: course.slug,
    source,
    rating: rating.rating,
    reviewCount: rating.reviewCount,
    maxRating: rating.maxRating,
    url: rating.url,
    likes: rating.likes,
    checkIns: rating.checkIns,
    createdAt: new Date(),
    updatedAt: new Date(),
  }));

  return {
    id: course.slug,
    slug: course.slug,
    name: course.name,
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

export async function generateMetadata({ params }: RegionPageProps): Promise<Metadata> {
  const { region } = await params;
  const displayName = resolveDisplayName(region);

  // Fetch courses for the region to get count
  const regionSlug = toRegionSlug(region);
  const courses = getCoursesByRegion(regionSlug);
  const courseCount = courses.length;

  const title = `Golfbaner i ${displayName} - ${courseCount} Klubber`;
  const description = `Finn alle golfbaner og golfklubber i ${displayName}. Se informasjon om ${courseCount} klubber med kart, priser, åpningstider og fasiliteter.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
      url: `https://golfkart.no/${region}`,
    },
    alternates: {
      canonical: `/${region}`,
    },
  };
}

export default async function RegionPage({ params }: RegionPageProps) {
  const { region } = await params;

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
  });

  return (
    <>
      {/* JSON-LD structured data for SEO */}
      <JsonLdMultiple schemas={schemas} />

      <div className="container mx-auto max-w-[1170px] px-4 py-16">
        {/* Breadcrumb */}
        <nav className="mb-6 text-sm text-text-secondary">
          <Link href="/" className="hover:text-primary">
            Hjem
          </Link>
          <span className="mx-2">/</span>
          <Link href="/regions" className="hover:text-primary">
            Fylke
          </Link>
          <span className="mx-2">/</span>
          <span className="text-text-primary">{displayName}</span>
        </nav>

        {/* Region Header */}
        <h1 className="mb-4 text-3xl font-bold text-text-primary">Golfbaner i {displayName}</h1>

        {sortedCourses.length === 0 ? (
          /* Empty State */
          <div className="mt-8 rounded-lg bg-background-surface p-12 text-center shadow-sm">
            <p className="mb-2 text-lg text-text-primary">
              Vi har ingen golfbaner registrert i {displayName} ennå.
            </p>
            <p className="mb-6 text-text-secondary">
              Vi jobber med å legge til flere baner i denne regionen.
            </p>
            <Link href="/" className="inline-block text-primary hover:underline">
              ← Tilbake til forsiden
            </Link>
          </div>
        ) : (
          <>
            <p className="mb-8 text-text-secondary">
              {sortedCourses.length} golfban{sortedCourses.length !== 1 ? "er" : "e"} i{" "}
              {displayName}
            </p>

            {/* Course List */}
            <div className="grid gap-8 md:grid-cols-2">
              {sortedCourses.map((course) => (
                <CourseCard key={course.slug} course={adaptCourseForCard(course) as any} />
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
  return regions.map((region) => ({ region }));
}
