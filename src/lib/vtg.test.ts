import { describe, it, expect } from "vitest";
import {
  toVtgClub,
  hasUsableVtgData,
  selectVtgRegions,
  vtgPriceRange,
  groupClubsByRegion,
  latestLastChecked,
  formatMonthYear,
  matchesClubQuery,
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

  it("sorts Norwegian letters after Z within a group (Norwegian collation)", () => {
    const clubs = [
      toVtgClub(makeCourse({ name: "Ålesund Golfklubb", region: "Rogaland", vtg: null }), "r"),
      toVtgClub(makeCourse({ name: "Ziersborg GK", region: "Rogaland", vtg: null }), "r"),
    ];
    const groups = groupClubsByRegion(clubs);
    expect(groups[0].clubs.map((c) => c.name)).toEqual(["Ziersborg GK", "Ålesund Golfklubb"]);
  });
});

describe("latestLastChecked", () => {
  const clubWithData = (lastChecked: string): VtgClub =>
    toVtgClub(makeCourse({ vtg: { ...fullVtg, lastChecked } }), "r");

  it("picks the latest lastChecked among clubs with usable data", () => {
    const clubs = [
      clubWithData("2026-03-01"),
      clubWithData("2026-06-12"),
      clubWithData("2025-12-31"),
    ];
    expect(latestLastChecked(clubs)).toBe("2026-06-12");
  });

  it("ignores clubs without usable data even when their lastChecked is set", () => {
    // offered but no price/signup → not usable, despite a newer lastChecked
    const unusable = toVtgClub(
      makeCourse({
        vtg: {
          ...fullVtg,
          price: null,
          priceYouth: null,
          signupUrl: null,
          lastChecked: "2027-01-01",
        },
      }),
      "r",
    );
    expect(unusable.hasData).toBe(false);
    expect(unusable.lastChecked).toBe("2027-01-01");
    expect(latestLastChecked([clubWithData("2026-06-12"), unusable])).toBe("2026-06-12");
  });

  it("returns null when no club has usable data", () => {
    const noData = toVtgClub(makeCourse({ vtg: null }), "r");
    expect(latestLastChecked([noData])).toBe(null);
    expect(latestLastChecked([])).toBe(null);
  });
});

describe("matchesClubQuery", () => {
  // Mirrors how the hub page builds searchText: name + name_en + city + region, lowercased
  const searchText = "stavanger golfklubb stavanger golf club stavanger rogaland";

  it("matches everything on an empty or whitespace-only query", () => {
    expect(matchesClubQuery(searchText, "")).toBe(true);
    expect(matchesClubQuery(searchText, "   ")).toBe(true);
  });

  it("is case-insensitive", () => {
    expect(matchesClubQuery(searchText, "STAVANGER")).toBe(true);
    expect(matchesClubQuery(searchText, "GoLfKlUbB")).toBe(true);
  });

  it("matches on city and region name", () => {
    expect(matchesClubQuery("oslo golfklubb  bogstad oslo", "bogstad")).toBe(true);
    expect(matchesClubQuery(searchText, "rogaland")).toBe(true);
  });

  it("matches partial substrings", () => {
    expect(matchesClubQuery(searchText, "stava")).toBe(true);
    expect(matchesClubQuery(searchText, "golfklu")).toBe(true);
  });

  it("lowercases Norwegian characters on both sides", () => {
    expect(matchesClubQuery("Ålesund Golfklubb Ålesund Møre og Romsdal", "ålesund")).toBe(true);
    expect(matchesClubQuery("ålesund golfklubb ålesund møre og romsdal", "Ålesund")).toBe(true);
  });

  it("returns false when nothing matches", () => {
    expect(matchesClubQuery(searchText, "trondheim")).toBe(false);
  });

  it("matches multi-word queries out of order (every token a substring)", () => {
    expect(matchesClubQuery("oslo golfklubb oslo golf club bogstad oslo", "golfklubb oslo")).toBe(
      true,
    );
    expect(matchesClubQuery(searchText, "rogaland stava")).toBe(true);
  });

  it("returns false when one token in a multi-token query doesn't match", () => {
    expect(matchesClubQuery(searchText, "stavanger trondheim")).toBe(false);
  });

  it("ignores extra whitespace between tokens", () => {
    expect(matchesClubQuery(searchText, "  golfklubb   stavanger  ")).toBe(true);
  });
});

describe("formatMonthYear", () => {
  it("formats Norwegian month + year", () => {
    expect(formatMonthYear("2026-06-12", "nb")).toBe("juni 2026");
  });

  it("formats English month + year", () => {
    expect(formatMonthYear("2026-06-12", "en")).toBe("June 2026");
  });

  it("keeps the month stable on month-boundary dates regardless of timezone", () => {
    expect(formatMonthYear("2026-06-01", "nb")).toBe("juni 2026");
  });
});
