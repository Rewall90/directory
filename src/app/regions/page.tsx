import { RegionGrid } from "@/components/home/RegionGrid";

// Mock data - same as homepage
const mockRegions = [
  { id: "NO-03", name: "Oslo", slug: "oslo", courseCount: 45 },
  { id: "NO-30", name: "Viken", slug: "viken", courseCount: 123 },
  { id: "NO-34", name: "Innlandet", slug: "innlandet", courseCount: 67 },
  {
    id: "NO-38",
    name: "Vestfold og Telemark",
    slug: "vestfold-og-telemark",
    courseCount: 89,
  },
  { id: "NO-42", name: "Agder", slug: "agder", courseCount: 34 },
  { id: "NO-11", name: "Rogaland", slug: "rogaland", courseCount: 56 },
  { id: "NO-46", name: "Vestland", slug: "vestland", courseCount: 78 },
  {
    id: "NO-15",
    name: "Møre og Romsdal",
    slug: "more-og-romsdal",
    courseCount: 45,
  },
  { id: "NO-50", name: "Trøndelag", slug: "trondelag", courseCount: 67 },
  { id: "NO-18", name: "Nordland", slug: "nordland", courseCount: 23 },
  {
    id: "NO-54",
    name: "Troms og Finnmark",
    slug: "troms-og-finnmark",
    courseCount: 12,
  },
];

export default function RegionsPage() {
  const totalCourses = mockRegions.reduce(
    (sum, r) => sum + r.courseCount,
    0,
  );

  return (
    <div className="container mx-auto max-w-[1170px] px-4 py-12">
      <h1 className="mb-4 text-center text-3xl font-bold text-text-primary">
        Golfbaner etter region
      </h1>
      <p className="mb-12 text-center text-text-secondary">
        Utforsk {totalCourses} golfbaner fordelt på {mockRegions.length}{" "}
        regioner i Norge
      </p>

      <RegionGrid regions={mockRegions} />
    </div>
  );
}
