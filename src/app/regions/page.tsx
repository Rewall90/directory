import type { Metadata } from "next";
import { RegionGrid } from "@/components/home/RegionGrid";
import { NORWAY_MAP_REGIONS } from "@/lib/constants/norway-map-regions";
import { getRegionsOverviewSchemas, JsonLdMultiple } from "@/lib/schema";

export const metadata: Metadata = {
  title: "Golfbaner etter fylke - golfkart.no",
  description: "Utforsk 162 golfbaner fordelt på 15 fylker i Norge. Finn golfbaner i ditt fylke.",
  alternates: {
    canonical: "/regions",
  },
};

// Use actual fylker data matching the homepage, sorted alphabetically
const regions = [
  { ...NORWAY_MAP_REGIONS.find((r) => r.slug === "akershus")!, courseCount: 24 },
  { ...NORWAY_MAP_REGIONS.find((r) => r.slug === "ostfold")!, courseCount: 19 },
  { ...NORWAY_MAP_REGIONS.find((r) => r.slug === "buskerud")!, courseCount: 10 },
  { ...NORWAY_MAP_REGIONS.find((r) => r.slug === "oslo")!, courseCount: 3 },
  { ...NORWAY_MAP_REGIONS.find((r) => r.slug === "innlandet")!, courseCount: 9 },
  { ...NORWAY_MAP_REGIONS.find((r) => r.slug === "vestfold")!, courseCount: 5 },
  { ...NORWAY_MAP_REGIONS.find((r) => r.slug === "telemark")!, courseCount: 5 },
  { ...NORWAY_MAP_REGIONS.find((r) => r.slug === "agder")!, courseCount: 9 },
  { ...NORWAY_MAP_REGIONS.find((r) => r.slug === "rogaland")!, courseCount: 13 },
  { ...NORWAY_MAP_REGIONS.find((r) => r.slug === "vestland")!, courseCount: 21 },
  { ...NORWAY_MAP_REGIONS.find((r) => r.slug === "more-og-romsdal")!, courseCount: 14 },
  { ...NORWAY_MAP_REGIONS.find((r) => r.slug === "trondelag")!, courseCount: 15 },
  { ...NORWAY_MAP_REGIONS.find((r) => r.slug === "nordland")!, courseCount: 9 },
  { ...NORWAY_MAP_REGIONS.find((r) => r.slug === "troms")!, courseCount: 3 },
  { ...NORWAY_MAP_REGIONS.find((r) => r.slug === "finnmark")!, courseCount: 4 },
].sort((a, b) => a.name.localeCompare(b.name, "no"));

export default function RegionsPage() {
  const totalCourses = regions.reduce((sum, r) => sum + r.courseCount, 0);

  // Generate all schema.org markup for the regions overview page
  const schemas = getRegionsOverviewSchemas({
    regions,
    totalCourses,
  });

  return (
    <>
      {/* JSON-LD structured data for SEO */}
      <JsonLdMultiple schemas={schemas} />

      <div className="container mx-auto max-w-[1170px] px-4 py-12">
        <h1 className="mb-4 text-center text-3xl font-bold text-text-primary">
          Golfbaner etter fylke
        </h1>
        <p className="mb-12 text-center text-text-secondary">
          Utforsk {totalCourses} golfbaner fordelt på {regions.length} fylker i Norge
        </p>

        <RegionGrid regions={regions} />
      </div>
    </>
  );
}
