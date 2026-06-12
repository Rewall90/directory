import type { Course, VtgInfo } from "@/types/course";
import { calculateAverageRating } from "@/lib/courses";

/** Club entry for VTG listing pages */
export interface VtgClub {
  slug: string;
  slug_en?: string;
  name: string;
  name_en?: string;
  regionSlug: string;
  regionName: string;
  city: string;
  rating: number | null;
  reviewCount: number | null;
  /** True when the club has scraped VTG data worth displaying */
  hasData: boolean;
  price: number | null;
  priceYouth: number | null;
  seasonInfo: string | null;
  /** Club's VTG page when scraped, otherwise club website (may be null) */
  signupUrl: string | null;
  lastChecked: string | null;
}

/**
 * A club's vtg data is usable when the club has confirmed it offers the course
 * AND we have at least a price or a signup link to show.
 */
export function hasUsableVtgData(vtg: VtgInfo | null | undefined): vtg is VtgInfo {
  if (!vtg || vtg.offered !== true) return false;
  return vtg.price !== null || vtg.priceYouth !== null || vtg.signupUrl !== null;
}

export function toVtgClub(course: Course, regionSlug: string): VtgClub {
  const vtg = course.vtg ?? null;
  const hasData = hasUsableVtgData(vtg);
  const avg = course.ratings ? calculateAverageRating(course.ratings) : null;

  return {
    slug: course.slug,
    slug_en: course.slug_en,
    name: course.name,
    name_en: course.name_en,
    regionSlug,
    regionName: course.region,
    city: course.city,
    rating: avg?.averageRating ?? null,
    reviewCount: avg?.totalReviews ?? null,
    hasData,
    price: hasData ? vtg.price : null,
    priceYouth: hasData ? vtg.priceYouth : null,
    seasonInfo: hasData ? vtg.seasonInfo : null,
    signupUrl: (hasData && vtg.signupUrl) || course.contact?.website || null,
    lastChecked: vtg?.lastChecked ?? null,
  };
}

/** Regions that qualify for their own /vtg-kurs/[region] page: ≥3 clubs with usable data */
export function selectVtgRegions(clubs: VtgClub[], minClubs = 3): string[] {
  const counts = new Map<string, number>();
  for (const c of clubs) {
    if (c.hasData) counts.set(c.regionSlug, (counts.get(c.regionSlug) ?? 0) + 1);
  }
  return [...counts.entries()]
    .filter(([, n]) => n >= minClubs)
    .map(([slug]) => slug)
    .sort();
}

export function vtgPriceRange(clubs: VtgClub[]): { min: number; max: number } | null {
  const prices = clubs.map((c) => c.price).filter((p): p is number => p !== null);
  if (prices.length === 0) return null;
  return { min: Math.min(...prices), max: Math.max(...prices) };
}

/** Group clubs by region for the hub page; clubs with data sort first, then by name */
export function groupClubsByRegion(
  clubs: VtgClub[],
): Array<{ regionSlug: string; regionName: string; clubs: VtgClub[] }> {
  const groups = new Map<string, VtgClub[]>();
  for (const c of clubs) {
    const list = groups.get(c.regionSlug) ?? [];
    list.push(c);
    groups.set(c.regionSlug, list);
  }
  return [...groups.entries()]
    .map(([regionSlug, list]) => ({
      regionSlug,
      regionName: list[0].regionName,
      clubs: [...list].sort(
        (a, b) => Number(b.hasData) - Number(a.hasData) || a.name.localeCompare(b.name, "no"),
      ),
    }))
    .sort((a, b) => a.regionName.localeCompare(b.regionName, "no"));
}
