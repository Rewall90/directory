import { HeroSection } from "@/components/home/HeroSection";
import { RegionGrid } from "@/components/home/RegionGrid";
import { InteractiveMap } from "@/components/home/InteractiveMap";
import { NORWAY_MAP_REGIONS } from "@/lib/constants/norway-map-regions";

// Current course counts from database (as of 2024)
const regions = [
  { ...NORWAY_MAP_REGIONS.find(r => r.slug === "akershus")!, courseCount: 24 },
  { ...NORWAY_MAP_REGIONS.find(r => r.slug === "ostfold")!, courseCount: 19 },
  { ...NORWAY_MAP_REGIONS.find(r => r.slug === "buskerud")!, courseCount: 10 },
  { ...NORWAY_MAP_REGIONS.find(r => r.slug === "oslo")!, courseCount: 3 },
  { ...NORWAY_MAP_REGIONS.find(r => r.slug === "innlandet")!, courseCount: 9 },
  { ...NORWAY_MAP_REGIONS.find(r => r.slug === "vestfold")!, courseCount: 5 },
  { ...NORWAY_MAP_REGIONS.find(r => r.slug === "telemark")!, courseCount: 5 },
  { ...NORWAY_MAP_REGIONS.find(r => r.slug === "agder")!, courseCount: 9 },
  { ...NORWAY_MAP_REGIONS.find(r => r.slug === "rogaland")!, courseCount: 13 },
  { ...NORWAY_MAP_REGIONS.find(r => r.slug === "vestland")!, courseCount: 21 },
  { ...NORWAY_MAP_REGIONS.find(r => r.slug === "more-og-romsdal")!, courseCount: 14 },
  { ...NORWAY_MAP_REGIONS.find(r => r.slug === "trondelag")!, courseCount: 15 },
  { ...NORWAY_MAP_REGIONS.find(r => r.slug === "nordland")!, courseCount: 9 },
  { ...NORWAY_MAP_REGIONS.find(r => r.slug === "troms")!, courseCount: 3 },
  { ...NORWAY_MAP_REGIONS.find(r => r.slug === "finnmark")!, courseCount: 4 },
];

export default function HomePage() {
  const totalCourses = regions.reduce((sum, region) => sum + region.courseCount, 0);

  return (
    <>
      <HeroSection
        title="golfkart.no - Finn golfbaner i Norge"
        description={[
          "Utforsk 169 golfbaner i hele Norge – med oppdatert informasjon om fasiliteter, tjenester og brukeranmeldelser.",
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
        <RegionGrid title="Utforsk regioner" regions={regions} />
      </section>
    </>
  );
}
