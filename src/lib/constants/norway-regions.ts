/**
 * Norway County Code Mapping
 * Maps ISO 3166-2:NO codes to Norwegian county names
 * Updated for 15 counties as of 2024 (Viken, Vestfold og Telemark, and Troms og Finnmark were dissolved)
 * Used for AmCharts GeoJSON integration
 */

export const NORWAY_COUNTIES = [
  { id: "NO-31", name: "Østfold", slug: "ostfold" },
  { id: "NO-32", name: "Akershus", slug: "akershus" },
  { id: "NO-03", name: "Oslo", slug: "oslo" },
  { id: "NO-33", name: "Buskerud", slug: "buskerud" },
  { id: "NO-34", name: "Innlandet", slug: "innlandet" },
  { id: "NO-39", name: "Vestfold", slug: "vestfold" },
  { id: "NO-40", name: "Telemark", slug: "telemark" },
  { id: "NO-42", name: "Agder", slug: "agder" },
  { id: "NO-11", name: "Rogaland", slug: "rogaland" },
  { id: "NO-46", name: "Vestland", slug: "vestland" },
  { id: "NO-15", name: "Møre og Romsdal", slug: "more-og-romsdal" },
  { id: "NO-50", name: "Trøndelag", slug: "trondelag" },
  { id: "NO-18", name: "Nordland", slug: "nordland" },
  { id: "NO-55", name: "Troms", slug: "troms" },
  { id: "NO-56", name: "Finnmark", slug: "finnmark" },
] as const;

export type NorwayCounty = (typeof NORWAY_COUNTIES)[number];

const DIACRITIC_REGEX = /[\u0300-\u036f]/g;
const NORWEGIAN_CHAR_MAP: Record<string, string> = {
  æ: "ae",
  ø: "o",
  å: "a",
};

/**
 * Convert a county name to a URL-friendly slug using Norwegian specific rules.
 */
export function toRegionSlug(value: string): string {
  return value
    .toLowerCase()
    .replace(/[æøå]/g, (char) => NORWEGIAN_CHAR_MAP[char])
    .normalize("NFD")
    .replace(DIACRITIC_REGEX, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-+/g, "-");
}

export const NORWAY_COUNTY_CODES = NORWAY_COUNTIES.reduce(
  (acc, county) => {
    acc[county.id] = county.name;
    return acc;
  },
  {} as Record<NorwayCounty["id"], NorwayCounty["name"]>,
);

/**
 * Get ISO county code from county name
 * @param countyName - Norwegian county name (e.g., "Oslo", "Viken")
 * @returns ISO code (e.g., "NO-03") or undefined if not found
 */
export function getCountyCode(countyName: string): string | undefined {
  const normalized = countyName.trim().toLowerCase();
  const county = NORWAY_COUNTIES.find((entry) => entry.name.toLowerCase() === normalized);
  return county?.id;
}

/**
 * Get county name from ISO code
 * @param code - ISO county code (e.g., "NO-03")
 * @returns Norwegian county name (e.g., "Oslo") or undefined if not found
 */
export function getCountyName(code: string): string | undefined {
  return NORWAY_COUNTY_CODES[code as NorwayCounty["id"]];
}

/**
 * Lookup the official county name by slug.
 */
export function getCountyNameFromSlug(slug: string): string | undefined {
  const normalized = toRegionSlug(slug);
  const county = NORWAY_COUNTIES.find((entry) => entry.slug === normalized);
  return county?.name;
}
