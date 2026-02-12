import type { Metadata } from "next";
import { HeroSection } from "@/components/home/HeroSection";
import { RegionGrid } from "@/components/home/RegionGrid";
import { InteractiveMap } from "@/components/home/InteractiveMap";
import { NORWAY_MAP_REGIONS } from "@/lib/constants/norway-map-regions";
import { getHomepageSchemas, JsonLdMultiple } from "@/lib/schema";
import { getRegionsWithCounts, getTotalCourseCount } from "@/lib/courses";

export const metadata: Metadata = {
  alternates: {
    canonical: "/",
  },
};

export default function HomePage() {
  // Get dynamic data from JSON files
  const regionsWithCounts = getRegionsWithCounts();
  const totalCourses = getTotalCourseCount();

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
  });

  return (
    <>
      {/* JSON-LD structured data for SEO */}
      <JsonLdMultiple schemas={schemas} />

      <HeroSection
        title="golfkart.no - Finn golfbaner i Norge"
        description={[
          `Utforsk ${totalCourses} golfbaner i hele Norge – med oppdatert informasjon om fasiliteter, tjenester og brukeranmeldelser.`,
        ]}
        courseCount={totalCourses}
      />

      <section className="bg-background py-16">
        <div className="container mx-auto max-w-[1170px] px-4">
          <h2 className="mb-8 text-center text-3xl font-bold text-text-primary md:text-4xl">
            Norges Golfbaner
          </h2>
          <div className="flex justify-center">
            <InteractiveMap regions={regions} />
          </div>
        </div>
      </section>

      <section className="bg-background py-16">
        <RegionGrid title="Utforsk fylker" regions={regions} />
      </section>
    </>
  );
}
