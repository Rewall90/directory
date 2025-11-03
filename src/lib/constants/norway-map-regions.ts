/**
 * Norway Region Mapping for AmCharts Map
 * Maps current 2024 Norway county structure to norwayLow geodata polygon IDs
 *
 * Some regions (Innlandet, Agder, Vestland) map to multiple polygons
 * because norwayLow uses the pre-2020 county structure
 */

export interface RegionMapping {
  name: string;           // Display name (2024 county name)
  slug: string;           // URL slug
  polygonIds: string[];   // norwayLow polygon IDs (can be multiple for merged counties)
}

export const NORWAY_MAP_REGIONS: RegionMapping[] = [
  // Direct mappings (1 region → 1 polygon)
  { name: "Østfold", slug: "ostfold", polygonIds: ["NO-01"] },
  { name: "Akershus", slug: "akershus", polygonIds: ["NO-02"] },
  { name: "Oslo", slug: "oslo", polygonIds: ["NO-03"] },
  { name: "Buskerud", slug: "buskerud", polygonIds: ["NO-06"] },
  { name: "Vestfold", slug: "vestfold", polygonIds: ["NO-07"] },
  { name: "Telemark", slug: "telemark", polygonIds: ["NO-08"] },
  { name: "Rogaland", slug: "rogaland", polygonIds: ["NO-11"] },
  { name: "Møre og Romsdal", slug: "more-og-romsdal", polygonIds: ["NO-15"] },
  { name: "Nordland", slug: "nordland", polygonIds: ["NO-18"] },
  { name: "Troms", slug: "troms", polygonIds: ["NO-19"] },
  { name: "Finnmark", slug: "finnmark", polygonIds: ["NO-20"] },
  { name: "Trøndelag", slug: "trondelag", polygonIds: ["NO-23"] },

  // Merged regions (1 region → multiple polygons)
  // These were merged in 2020 reform, but norwayLow has them as separate polygons
  {
    name: "Innlandet",
    slug: "innlandet",
    polygonIds: ["NO-04", "NO-05"] // Hedmark + Oppland
  },
  {
    name: "Agder",
    slug: "agder",
    polygonIds: ["NO-09", "NO-10"] // Aust-Agder + Vest-Agder
  },
  {
    name: "Vestland",
    slug: "vestland",
    polygonIds: ["NO-12", "NO-14"] // Hordaland + Sogn og Fjordane
  },
];

/**
 * Create a reverse mapping from polygon ID to region
 * Used for click handlers to find which region a polygon belongs to
 */
export const POLYGON_TO_REGION = new Map<string, RegionMapping>(
  NORWAY_MAP_REGIONS.flatMap(region =>
    region.polygonIds.map(polygonId => [polygonId, region] as const)
  )
);

/**
 * Get region by slug
 */
export function getRegionBySlug(slug: string): RegionMapping | undefined {
  return NORWAY_MAP_REGIONS.find(r => r.slug === slug);
}

/**
 * Get region by polygon ID
 */
export function getRegionByPolygonId(polygonId: string): RegionMapping | undefined {
  return POLYGON_TO_REGION.get(polygonId);
}
