import { describe, it, expect } from "vitest";
import {
  toVtgClub,
  hasUsableVtgData,
  selectVtgRegions,
  vtgPriceRange,
  groupClubsByRegion,
  type VtgClub,
} from "./vtg";
import type { Course } from "@/types/course";

/** Minimal course factory — only fields the vtg logic reads */
function makeCourse(overrides: Record<string, unknown> = {}): Course {
  return {
    slug: "test-klubb",
    name: "Test Golfklubb",
    region: "Rogaland",
    city: "Stavanger",
    address: { street: null, postalCode: "", area: null },
    course: { holes: 18, par: 72 },
    contact: { website: "https://example.no" },
    ratings: {},
    vtg: null,
    ...overrides,
  } as unknown as Course;
}

const fullVtg = {
  offered: true,
  price: 1295,
  priceYouth: 795,
  signupUrl: "https://example.no/vtg",
  seasonInfo: "Kurs hver uke mai–august",
  lastChecked: "2026-06-12",
};

describe("hasUsableVtgData", () => {
  it("is true when offered with a price", () => {
    expect(hasUsableVtgData({ ...fullVtg, signupUrl: null })).toBe(true);
  });

  it("is true when offered with a signup URL but no price", () => {
    expect(hasUsableVtgData({ ...fullVtg, price: null, priceYouth: null })).toBe(true);
  });

  it("is false when offered but has neither price nor signup URL", () => {
    expect(hasUsableVtgData({ ...fullVtg, price: null, priceYouth: null, signupUrl: null })).toBe(
      false,
    );
  });

  it("is false when offered is false or null", () => {
    expect(hasUsableVtgData({ ...fullVtg, offered: false })).toBe(false);
    expect(hasUsableVtgData({ ...fullVtg, offered: null })).toBe(false);
  });

  it("is false for null/undefined vtg", () => {
    expect(hasUsableVtgData(null)).toBe(false);
    expect(hasUsableVtgData(undefined)).toBe(false);
  });
});

describe("toVtgClub", () => {
  it("maps a course with full vtg data", () => {
    const club = toVtgClub(makeCourse({ vtg: fullVtg }), "rogaland");
    expect(club).toMatchObject<Partial<VtgClub>>({
      slug: "test-klubb",
      name: "Test Golfklubb",
      regionSlug: "rogaland",
      city: "Stavanger",
      price: 1295,
      signupUrl: "https://example.no/vtg",
      hasData: true,
    });
  });

  it("maps a course with no vtg data, falling back to club website", () => {
    const club = toVtgClub(makeCourse({ vtg: null }), "rogaland");
    expect(club.hasData).toBe(false);
    expect(club.price).toBe(null);
    expect(club.signupUrl).toBe("https://example.no"); // contact.website fallback
  });

  it("falls back to club website when vtg is usable but signupUrl is null", () => {
    const club = toVtgClub(makeCourse({ vtg: { ...fullVtg, signupUrl: null } }), "rogaland");
    expect(club.hasData).toBe(true); // usable via price
    expect(club.signupUrl).toBe("https://example.no"); // contact.website fallback
  });

  it("has null signupUrl when there is no vtg data and no club website", () => {
    const club = toVtgClub(makeCourse({ vtg: null, contact: { website: null } }), "rogaland");
    expect(club.hasData).toBe(false);
    expect(club.signupUrl).toBe(null);
  });

  it("computes rating from the ratings object", () => {
    const club = toVtgClub(
      makeCourse({
        vtg: fullVtg,
        ratings: { google: { rating: 4.5, reviewCount: 212, maxRating: 5 } },
      }),
      "rogaland",
    );
    expect(club.rating).toBeCloseTo(4.5);
    expect(club.reviewCount).toBe(212);
  });
});

describe("selectVtgRegions (the ≥3-club gate)", () => {
  const club = (regionSlug: string, hasData: boolean): VtgClub =>
    toVtgClub(makeCourse({ vtg: hasData ? fullVtg : null }), regionSlug);

  it("includes regions with 3+ clubs with usable data", () => {
    const clubs = [club("rogaland", true), club("rogaland", true), club("rogaland", true)];
    expect(selectVtgRegions(clubs)).toEqual(["rogaland"]);
  });

  it("excludes regions with fewer than 3 clubs with data", () => {
    const clubs = [
      club("oslo", true),
      club("oslo", true),
      club("oslo", false),
      club("oslo", false),
    ];
    expect(selectVtgRegions(clubs)).toEqual([]);
  });

  it("returns empty for no data at all (day-one state)", () => {
    expect(selectVtgRegions([club("rogaland", false)])).toEqual([]);
  });
});

describe("vtgPriceRange", () => {
  it("returns min and max across clubs with prices", () => {
    const clubs = [
      toVtgClub(makeCourse({ vtg: { ...fullVtg, price: 995 } }), "r"),
      toVtgClub(makeCourse({ vtg: { ...fullVtg, price: 1795 } }), "r"),
      toVtgClub(makeCourse({ vtg: null }), "r"), // no price — ignored
    ];
    expect(vtgPriceRange(clubs)).toEqual({ min: 995, max: 1795 });
  });

  it("returns null when no club has a price", () => {
    expect(vtgPriceRange([toVtgClub(makeCourse({ vtg: null }), "r")])).toBe(null);
  });
});

describe("groupClubsByRegion", () => {
  it("sorts clubs with data first within a region, then by name; regions alphabetical", () => {
    const clubs = [
      toVtgClub(makeCourse({ name: "Stavanger GK", region: "Rogaland", vtg: null }), "rogaland"),
      toVtgClub(makeCourse({ name: "Oslo GK", region: "Oslo", vtg: fullVtg }), "oslo"),
      toVtgClub(makeCourse({ name: "Sola GK", region: "Rogaland", vtg: fullVtg }), "rogaland"),
      toVtgClub(makeCourse({ name: "Randaberg GK", region: "Rogaland", vtg: null }), "rogaland"),
    ];
    const groups = groupClubsByRegion(clubs);
    expect(groups.map((g) => g.regionSlug)).toEqual(["oslo", "rogaland"]);
    expect(groups[0].regionName).toBe("Oslo");
    expect(groups[1].clubs.map((c) => c.name)).toEqual([
      "Sola GK", // has data — first
      "Randaberg GK", // no data, alphabetical
      "Stavanger GK",
    ]);
  });
});
