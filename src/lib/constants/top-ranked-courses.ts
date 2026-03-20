/**
 * Top 20 ranked golf courses in Norway for 2026.
 * Based on Bayesian Average of Google Reviews.
 * See: /blog/beste-golfbaner-norge
 */
export const TOP_RANKED_COURSES: Record<string, number> = {
  // Top 10
  "stiklestad-golfklubb": 1,
  "trondheim-golfklubb": 2,
  "bjaavann-golfklubb": 3,
  "oustoen-country-club": 4,
  "molde-golfklubb": 5,
  "valdres-golfklubb": 6,
  "bodo-golfpark": 7,
  "lofoten-links": 8,
  "krokhol-golfklubb": 9,
  "tromso-golfklubb": 10,
  // #11–20
  "kongsvinger-golfklubb": 11,
  "fana-golfklubb": 12,
  "moss-rygge-golfklubb": 13,
  "onsoy-golfklubb": 14,
  "kjekstad-golfklubb": 15,
  "tyrifjord-golfklubb": 16,
  "bleik-golfstrombane": 17,
  "oslo-golfklubb": 18,
  "nordvegen-golfklubb": 19,
  "meland-golfklubb": 20,
};

export const RANKING_BLOG_SLUG = {
  nb: "beste-golfbaner-norge",
  en: "best-golf-courses-norway",
} as const;

export function getCourseRanking(slug: string): number | null {
  return TOP_RANKED_COURSES[slug] ?? null;
}

/**
 * Courses that have dedicated blog articles.
 * Maps course slug -> { nb: blogSlug, en: blogSlug }
 */
export const COURSE_BLOG_ARTICLES: Record<string, { nb: string; en: string }> = {
  "lofoten-links": {
    nb: "lofoten-links-norges-mest-spektakulaere-golfbane",
    en: "lofoten-links-norways-most-spectacular-golf-course",
  },
  "bodo-golfpark": {
    nb: "golf-i-nord-norge-midnattssol-og-arktisk-golf",
    en: "golf-in-northern-norway-midnight-sun-and-arctic-golf",
  },
  "tromso-golfklubb": {
    nb: "golf-i-nord-norge-midnattssol-og-arktisk-golf",
    en: "golf-in-northern-norway-midnight-sun-and-arctic-golf",
  },
  "hafjell-golfklubb": {
    nb: "golf-paa-hafjell-komplett-guide",
    en: "golf-at-hafjell-complete-guide",
  },
};

export function getCourseBlogArticle(slug: string, locale: "nb" | "en"): string | null {
  const entry = COURSE_BLOG_ARTICLES[slug];
  return entry ? entry[locale] : null;
}
