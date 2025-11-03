import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { CourseCard } from "@/components/courses/CourseCard";
import { getCountyNameFromSlug, toRegionSlug } from "@/lib/constants/norway-regions";

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
  return (
    getCountyNameFromSlug(normalized) ??
    LEGACY_REGION_NAMES[normalized] ??
    slug
  );
}

export default async function RegionPage({ params }: RegionPageProps) {
  const { region } = await params;

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

  return (
    <div className="container mx-auto max-w-[1170px] px-4 py-16">
      {/* Breadcrumb */}
      <nav className="mb-6 text-sm text-text-secondary">
        <Link href="/" className="hover:text-primary">
          Hjem
        </Link>
        <span className="mx-2">/</span>
        <Link href="/regions" className="hover:text-primary">
          Regioner
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
            {courses.length} golfban{courses.length !== 1 ? "er" : "e"} i{" "}
            {displayName}
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
    .filter((param, index, all) =>
      all.findIndex((candidate) => candidate.region === param.region) === index,
    );
}
