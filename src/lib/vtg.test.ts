import { describe, it, expect } from "vitest";
import { toVtgClub, hasUsableVtgData, type VtgClub } from "./vtg";
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
