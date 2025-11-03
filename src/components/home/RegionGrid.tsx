import Link from "next/link";

interface Region {
  name: string;
  slug: string;
  courseCount: number;
  polygonIds?: string[]; // Optional for compatibility
}

interface RegionGridProps {
  title?: string;
  regions: Region[];
}

export function RegionGrid({ title = "FYLKE / REGION", regions }: RegionGridProps) {
  return (
    <div className="container mx-auto max-w-[1170px] px-4">
      <h2 className="mb-6 text-2xl font-semibold text-text-primary">{title}</h2>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3 lg:grid-cols-4">
        {regions.map((region) => (
          <Link
            key={region.slug}
            href={`/${region.slug}`}
            className="border-border-default group flex items-center justify-between rounded-lg border bg-background-surface p-4 transition-all hover:border-primary hover:shadow-md"
          >
            <span className="text-base font-medium text-text-primary group-hover:text-primary">
              {region.name}
            </span>
            <span className="ml-3 rounded-full border-2 border-transparent bg-background-hover px-3 py-1 text-sm font-semibold text-text-secondary transition-all group-hover:border-primary group-hover:bg-primary group-hover:text-white">
              {region.courseCount}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
