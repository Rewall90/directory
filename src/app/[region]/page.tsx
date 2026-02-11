import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
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

export async function generateMetadata({ params }: RegionPageProps): Promise<Metadata> {
  const { region } = await params;
  const displayName = resolveDisplayName(region);

  // Fetch course count for the title
  const courseCount = await prisma.course.count({
    where: {
      region: {
        equals: displayName,
        mode: "insensitive",
      },
    },
  });

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

  // Fetch courses from database
  const courses = await prisma.course.findMany({
    where: {
      region: {
        equals: displayName,
        mode: "insensitive",
      },
    },
    include: {
      ratings: true,
    },
    orderBy: {
      name: "asc",
    },
  });

  // Generate schema.org markup for the region page
  const schemas = getRegionPageSchemas({
    region: {
      name: displayName,
      slug: region,
      courseCount: courses.length,
    },
    courses: courses.map((course) => ({
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

        {courses.length === 0 ? (
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
              {courses.length} golfban{courses.length !== 1 ? "er" : "e"} i {displayName}
            </p>

            {/* Course List */}
            <div className="grid gap-8 md:grid-cols-2">
              {courses.map((course) => (
                <CourseCard key={course.id} course={course} />
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
  const regions = await prisma.course.groupBy({
    by: ["region"],
  });

  return regions
    .map((entry) => {
      const slug = toRegionSlug(entry.region);
      return { region: slug };
    })
    .filter(
      (param, index, all) =>
        all.findIndex((candidate) => candidate.region === param.region) === index,
    );
}
