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
 * A club's vtg data is usable when the club confirmed offers the course
 * AND we have at least a price or a signup link to show.
 */
export function hasUsableVtgData(vtg: VtgInfo | null | undefined): boolean {
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
    price: hasData ? vtg!.price : null,
    priceYouth: hasData ? vtg!.priceYouth : null,
    seasonInfo: hasData ? vtg!.seasonInfo : null,
    signupUrl: (hasData && vtg!.signupUrl) || course.contact?.website || null,
    lastChecked: vtg?.lastChecked ?? null,
  };
}
