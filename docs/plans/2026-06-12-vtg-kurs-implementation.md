# VTG-kurs Section Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build the `/vtg-kurs` hub page and gated `/vtg-kurs/[region]` pages that list VTG (beginner) courses for all 168 clubs, with GA4 click tracking — per the approved design in `docs/plans/2026-06-12-vtg-kurs-design.md`.

**Architecture:** New optional `vtg` field on the existing JSON course files; pure selection/gate logic in `src/lib/vtg.ts` (unit-tested); cached fs loaders in `src/lib/courses.ts`; two SSG routes under `src/app/[locale]/vtg-kurs/`; region pages exist only when ≥3 clubs in the region have real VTG data (gate lives in `generateStaticParams`). Visual style mirrors `CourseCard`/region pages. Mockup: `mockups/vtg-kurs-mockup.html`.

**Tech Stack:** Next.js 16 App Router, TypeScript, Tailwind + DaisyUI, next-intl (locales `nb` default / `en` prefixed), JSON file data, Vitest (added in Task 1), GA4 via existing gtag snippet in `src/app/[locale]/layout.tsx`.

**Conventions to follow:** conventional commits; `pnpm` (not npm); UI text via next-intl messages (run `pnpm validate:translations` after editing `messages/*.json`); `pnpm lint` must pass with zero warnings.

---

### Task 1: Add Vitest

**Files:**

- Modify: `package.json` (devDependency + script)
- Create: `vitest.config.ts`

**Step 1: Install**

```bash
cd /Users/petterlund/projects/golfkart-directory
pnpm add -D vitest
```

**Step 2: Create `vitest.config.ts`**

```typescript
import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  test: {
    include: ["src/**/*.test.ts"],
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
```

**Step 3: Add script to `package.json`**

In `"scripts"`, add: `"test": "vitest run"`

**Step 4: Verify the runner works (no tests yet)**

Run: `pnpm test`
Expected: exits reporting "No test files found" (this is fine — confirms vitest is wired up). If it exits non-zero on no tests, that's acceptable for now; Task 3 adds the first test.

**Step 5: Commit**

```bash
git add package.json pnpm-lock.yaml vitest.config.ts
git commit -m "chore: add vitest for unit testing"
```

---

### Task 2: Add `vtg` field to the Course type

**Files:**

- Modify: `src/types/course.ts`

**Step 1: Add the interface and field**

Add near the other sub-interfaces in `src/types/course.ts`:

```typescript
/**
 * VTG (Veien til Golf) beginner-course info, scraped from club websites.
 * Scraper rule: when unsure, write null — never guess.
 */
export interface VtgInfo {
  /** null = unknown (not yet scraped or not found on club site) */
  offered: boolean | null;
  /** Adult price in NOK */
  price: number | null;
  priceYouth: number | null;
  /** URL of the club's own VTG/kurs page */
  signupUrl: string | null;
  /** Free text, e.g. "Kurs hver uke mai–august" */
  seasonInfo: string | null;
  /** ISO date of last scrape/check, e.g. "2026-06-12" */
  lastChecked: string;
}
```

Then add to the `Course` interface (it's optional so all 168 existing JSON files stay valid):

```typescript
  vtg?: VtgInfo | null;
```

**Step 2: Verify types compile**

Run: `pnpm exec tsc --noEmit`
Expected: no errors.

**Step 3: Commit**

```bash
git add src/types/course.ts
git commit -m "feat: add VtgInfo type to Course"
```

---

### Task 3: Pure VTG selection logic (TDD)

The fs loaders are thin wrappers; all decision logic lives in pure functions that take `Course[]` so tests need no filesystem.

**Files:**

- Create: `src/lib/vtg.ts`
- Test: `src/lib/vtg.test.ts`

**Step 1: Write the failing tests**

```typescript
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
```

**Step 2: Run tests to verify they fail**

Run: `pnpm test`
Expected: FAIL — `Cannot find module './vtg'` (or similar).

**Step 3: Write the implementation**

Create `src/lib/vtg.ts`:

```typescript
import type { Course, VtgInfo } from "@/types/course";
import { calculateAverageRating } from "@/lib/courses-utils";

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
```

**Note on `courses-utils`:** `calculateAverageRating` currently lives in `src/lib/courses.ts`, which imports `fs` at module top — importing it from a vitest test is fine (node env), so you may instead simply `import { calculateAverageRating } from "@/lib/courses"`. Try that first; only extract it to a new `src/lib/courses-utils.ts` (and re-export from `courses.ts`) if importing `courses.ts` in tests causes problems (e.g. `react`'s `cache` import). If you extract, keep the re-export so existing imports don't break.

**Step 4: Run tests to verify they pass**

Run: `pnpm test`
Expected: PASS (8 tests).

**Step 5: Commit**

```bash
git add src/lib/vtg.ts src/lib/vtg.test.ts
git commit -m "feat: add pure VTG club selection logic"
```

---

### Task 4: Region gate logic (TDD)

**Files:**

- Modify: `src/lib/vtg.ts`
- Test: `src/lib/vtg.test.ts`

**Step 1: Add failing tests**

```typescript
import { selectVtgRegions, vtgPriceRange, groupClubsByRegion } from "./vtg";

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
```

**Step 2: Run tests to verify they fail**

Run: `pnpm test`
Expected: FAIL — `selectVtgRegions is not a function`.

**Step 3: Implement in `src/lib/vtg.ts`**

```typescript
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
```

(Write a quick test for `groupClubsByRegion` ordering too — data-first within a region, regions alphabetical.)

**Step 4: Run tests to verify they pass**

Run: `pnpm test`
Expected: PASS.

**Step 5: Commit**

```bash
git add src/lib/vtg.ts src/lib/vtg.test.ts
git commit -m "feat: add VTG region gate and price-range helpers"
```

---

### Task 5: Cached fs loaders

**Files:**

- Modify: `src/lib/courses.ts`

**Step 1: Add loaders (mirror existing `cache()` + fs patterns in this file)**

```typescript
import { toVtgClub, selectVtgRegions, type VtgClub } from "@/lib/vtg";

/**
 * All courses as VTG club entries, with their region slug.
 */
export const getVtgClubs = cache((): VtgClub[] => {
  const regions = getRegions();
  const clubs: VtgClub[] = [];
  for (const region of regions) {
    for (const course of getCoursesByRegion(region)) {
      clubs.push(toVtgClub(course, region));
    }
  }
  return clubs;
});

/**
 * Region slugs that qualify for a /vtg-kurs/[region] page (≥3 clubs with data).
 */
export const getVtgRegions = cache((): string[] => selectVtgRegions(getVtgClubs()));
```

**Step 2: Verify**

Run: `pnpm exec tsc --noEmit && pnpm lint`
Expected: clean. (Watch for import cycles: `vtg.ts` must NOT import from `courses.ts` if `courses.ts` imports from `vtg.ts` — if Task 3 ended up importing `calculateAverageRating` from `courses.ts`, extract it to `src/lib/courses-utils.ts` now and update both imports.)

**Step 3: Commit**

```bash
git add src/lib/courses.ts src/lib/vtg.ts
git commit -m "feat: add cached VTG club and region loaders"
```

---

### Task 6: Translations

**Files:**

- Modify: `messages/nb.json`, `messages/en.json`

**Step 1: Add a `vtg` namespace to `messages/nb.json`**

Copy intro/FAQ text from the approved mockup (`mockups/vtg-kurs-mockup.html`). Keys (structure must be identical in both files — `pnpm validate:translations` enforces this):

```json
"vtg": {
  "metaTitle": "VTG-kurs i Norge – priser og påmelding hos {count} klubber",
  "metaDescription": "Veien til Golf er nybegynnerkurset du må ta for å spille golf i Norge. Se priser og meld deg på kurs hos golfklubber over hele landet.",
  "breadcrumbHome": "Hjem",
  "breadcrumbVtg": "VTG-kurs",
  "title": "VTG-kurs i Norge",
  "ledeWithPrices": "Veien til Golf er nybegynnerkurset du må ta for å spille på norske golfbaner. Under finner du kursene hos {count} klubber over hele landet, med priser og påmelding. Prisene i {year} ligger mellom {min} og {max} kr.",
  "ledeNoPrices": "Veien til Golf er nybegynnerkurset du må ta for å spille på norske golfbaner. Under finner du klubbene som tilbyr kurs over hele landet.",
  "introTitle": "Slik fungerer Veien til Golf",
  "introP1": "Kurset er Norges Golfforbunds opplæringsprogram og består av tre deler:",
  "introStep1": "E-læring – teoridelen tar du hjemme, og den må være fullført før praksiskurset.",
  "introStep2": "Praktisk kurs – rundt 5 timer på klubben med grunnteknikk, slag og regler.",
  "introStep3": "Banespill – du spiller noen runder på banen, ofte sammen med en fadder fra klubben.",
  "introP2": "Det er ingen eksamen lenger. Når du er ferdig får du golfkort og kan spille på alle baner i Norge. De fleste klubber låner ut utstyr under kurset, så du trenger ikke kjøpe noe før du vet om golf er noe for deg.",
  "jumpToRegion": "Hopp til fylke:",
  "regionPageLink": "Egen side for {region}",
  "regionSubtitle": "{count, plural, one {# klubb} other {# klubber}} med VTG-kurs",
  "regionSubtitleWithPrice": "{count, plural, one {# klubb} other {# klubber}} med VTG-kurs, priser fra {min} kr",
  "sponsoredLabel": "Sponset",
  "signupButton": "Meld deg på",
  "clubPageButton": "Klubbens kursside",
  "noPriceOnline": "Klubben oppgir ikke pris på nett – se kurssiden deres",
  "youthPrice": "Ungdom {price} kr",
  "reviews": "{count} anmeldelser",
  "faqTitle": "Vanlige spørsmål",
  "faqQ1": "Hva koster et VTG-kurs?",
  "faqA1": "Mellom {min} og {max} kr hos klubbene i denne oversikten ({year}). Mange klubber har lavere pris for barn og ungdom, og noen inkluderer medlemskap det første året.",
  "faqQ2": "Må jeg være medlem av en golfklubb?",
  "faqA2": "Ja. For å få golfkort må du være medlem i en klubb tilknyttet Norges Golfforbund. Mange klubber tilbyr rabattert førsteårsmedlemskap sammen med kurset.",
  "faqQ3": "Hvor lang tid tar kurset?",
  "faqA3": "E-læringen tar et par timer hjemme. Praksisdelen er rundt 5 timer, ofte fordelt på to eller tre økter. Banespillet avtaler du med klubben etterpå.",
  "faqQ4": "Er det eksamen?",
  "faqA4": "Nei. Den gamle grønt kort-prøven er fjernet. Du fullfører e-læring, praksiskurs og banespill, og er klar til å spille.",
  "updatedNote": "Priser og kursinfo er hentet fra klubbenes egne nettsider. Sist oppdatert {date}.",
  "reportError": "Funnet en feil? Si ifra her.",
  "regionMetaTitle": "Golfkurs i {region} – VTG-kurs hos {count} klubber",
  "regionMetaDescription": "Skal du begynne med golf i {region}? Se priser og meld deg på VTG-kurs hos klubbene i fylket.",
  "regionTitle": "Golfkurs i {region}",
  "regionLede": "{count, plural, one {Én klubb} other {# klubber}} i {region} tilbyr Veien til Golf-kurs{priceSuffix}.",
  "regionPriceSuffix": ", med priser fra {min} til {max} kr",
  "regionCoursePagesNote": "Alle klubbene under har egen baneomtale på golfkart.no med anmeldelser, banefakta og veibeskrivelse.",
  "navLabel": "VTG-kurs"
}
```

**Step 2: Add the same keys translated to `messages/en.json`** (English: "Beginner golf courses (VTG)" etc. — translate faithfully, keep ICU params identical).

**Step 3: Validate**

Run: `pnpm validate:translations`
Expected: passes (key parity between nb and en).

**Step 4: Commit**

```bash
git add messages/nb.json messages/en.json
git commit -m "feat: add vtg translation namespace"
```

---

### Task 7: FAQPage schema generator (TDD)

**Files:**

- Create: `src/lib/schema/generators/faq.ts`
- Modify: `src/lib/schema/index.ts` (export)
- Test: `src/lib/schema/generators/faq.test.ts`

**Step 1: Write the failing test**

```typescript
import { describe, it, expect } from "vitest";
import { generateFAQPageSchema } from "./faq";

describe("generateFAQPageSchema", () => {
  it("produces valid FAQPage JSON-LD", () => {
    const schema = generateFAQPageSchema([
      { question: "Hva koster et VTG-kurs?", answer: "Mellom 995 og 1 795 kr." },
    ]);
    expect(schema).toEqual({
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: [
        {
          "@type": "Question",
          name: "Hva koster et VTG-kurs?",
          acceptedAnswer: { "@type": "Answer", text: "Mellom 995 og 1 795 kr." },
        },
      ],
    });
  });
});
```

**Step 2: Run test to verify it fails** — `pnpm test` → FAIL (module not found).

**Step 3: Implement `src/lib/schema/generators/faq.ts`**

Follow the style of `src/lib/schema/generators/itemlist.ts` (read it first):

```typescript
export interface FAQEntry {
  question: string;
  answer: string;
}

export function generateFAQPageSchema(entries: FAQEntry[]) {
  return {
    "@context": "https://schema.org" as const,
    "@type": "FAQPage" as const,
    mainEntity: entries.map((e) => ({
      "@type": "Question" as const,
      name: e.question,
      acceptedAnswer: { "@type": "Answer" as const, text: e.answer },
    })),
  };
}
```

Export it from `src/lib/schema/index.ts` alongside the other generators.

**Step 4: Run tests** — `pnpm test` → PASS.

**Step 5: Commit**

```bash
git add src/lib/schema/generators/faq.ts src/lib/schema/generators/faq.test.ts src/lib/schema/index.ts
git commit -m "feat: add FAQPage schema generator"
```

---

### Task 8: GA4 signup button (client component)

**Files:**

- Create: `src/components/vtg/VtgSignupButton.tsx`

**Step 1: Implement**

GA4 is loaded globally in `src/app/[locale]/layout.tsx` (gtag, id `G-ZM0PFETJNE`). The button is the only client-side piece; everything else stays server-rendered.

```tsx
"use client";

interface Props {
  href: string;
  clubSlug: string;
  region: string;
  label: string;
  variant?: "primary" | "secondary";
}

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

export function VtgSignupButton({ href, clubSlug, region, label, variant = "primary" }: Props) {
  const handleClick = () => {
    window.gtag?.("event", "vtg_signup_click", {
      club_slug: clubSlug,
      region,
    });
  };

  const className =
    variant === "primary"
      ? "inline-block rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-content hover:bg-primary-dark"
      : "inline-block rounded-md border border-border-default px-4 py-2 text-sm text-primary hover:border-primary";

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      onClick={handleClick}
      className={className}
    >
      {label}
    </a>
  );
}
```

**Step 2: Verify** — `pnpm exec tsc --noEmit && pnpm lint` → clean.

**Step 3: Commit**

```bash
git add src/components/vtg/VtgSignupButton.tsx
git commit -m "feat: add VTG signup button with GA4 click event"
```

---

### Task 9: VtgClubCard component

**Files:**

- Create: `src/components/vtg/VtgClubCard.tsx`

**Step 1: Implement (server component)**

Match the mockup and existing `CourseCard` style (surface card, name, address line, star). Use `StarRating` from `src/components/courses/StarRating.tsx` if its props fit (read it first); otherwise render `★ {rating}` inline like the mockup.

```tsx
import { useTranslations, useLocale } from "next-intl";
import { Link } from "@/i18n/navigation";
import { VtgSignupButton } from "./VtgSignupButton";
import type { VtgClub } from "@/lib/vtg";

interface Props {
  club: VtgClub;
  sponsored?: boolean;
}

export function VtgClubCard({ club, sponsored = false }: Props) {
  const t = useTranslations("vtg");
  const locale = useLocale();
  const name = locale === "en" && club.name_en ? club.name_en : club.name;
  const courseSlug = locale === "en" && club.slug_en ? club.slug_en : club.slug;

  return (
    <div
      className={`rounded-lg border p-5 shadow-sm ${
        sponsored ? "border-primary-light bg-white" : "border-border-default bg-background-surface"
      }`}
    >
      {sponsored && (
        <div className="mb-1 text-[11px] uppercase tracking-wider text-text-tertiary">
          {t("sponsoredLabel")}
        </div>
      )}
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
        <div>
          <h3 className="text-lg font-semibold text-text-primary">
            <Link href={`/${club.regionSlug}/${courseSlug}`} className="hover:text-primary">
              {name}
            </Link>
          </h3>
          <p className="text-sm text-text-secondary">
            {club.city ? `${club.city}, ` : ""}
            {club.regionName}
          </p>
          <p className="mt-1 text-sm text-text-secondary">
            {club.rating !== null && (
              <>
                <span className="text-accent">★</span> {club.rating.toFixed(1).replace(".", ",")}{" "}
                {club.reviewCount !== null && `(${t("reviews", { count: club.reviewCount })})`}
              </>
            )}
            {club.seasonInfo && (club.rating !== null ? ` · ${club.seasonInfo}` : club.seasonInfo)}
            {!club.hasData && t("noPriceOnline")}
          </p>
        </div>
        <div className="shrink-0 sm:text-right">
          {club.price !== null && (
            <div className="text-base font-semibold text-text-primary">
              {club.price.toLocaleString("nb-NO")} kr
            </div>
          )}
          {club.priceYouth !== null && (
            <div className="text-xs text-text-tertiary">
              {t("youthPrice", { price: club.priceYouth.toLocaleString("nb-NO") })}
            </div>
          )}
          {club.signupUrl && (
            <div className="mt-2">
              <VtgSignupButton
                href={club.signupUrl}
                clubSlug={club.slug}
                region={club.regionSlug}
                label={club.hasData ? t("signupButton") : t("clubPageButton")}
                variant={club.hasData ? "primary" : "secondary"}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
```

Note: `sponsored` is plumbed through now but nothing sets it yet — the sponsorship data source (e.g. a `sponsoredVtg: true` flag or a config list) is a later, trivial addition once a club actually pays. YAGNI.

**Step 2: Verify** — `pnpm exec tsc --noEmit && pnpm lint` → clean.

**Step 3: Commit**

```bash
git add src/components/vtg/VtgClubCard.tsx
git commit -m "feat: add VTG club card component"
```

---

### Task 10: Hub page `/vtg-kurs`

**Files:**

- Create: `src/app/[locale]/vtg-kurs/page.tsx`

**Step 1: Implement**

Follow the patterns of `src/app/[locale]/[region]/page.tsx` (read it first): `generateMetadata` with canonical + hreflang alternates, `setRequestLocale`, `getTranslations`, JSON-LD via `JsonLdMultiple`. Structure per the mockup: h1 + lede → intro article (ordered list) → region jump-index (anchor links / links to region pages) → region groups of `VtgClubCard` → FAQ → updated-note.

Key data wiring:

```tsx
import { getVtgClubs, getVtgRegions } from "@/lib/courses";
import { groupClubsByRegion, vtgPriceRange } from "@/lib/vtg";
import { generateFAQPageSchema, generateItemListSchema, JsonLdMultiple } from "@/lib/schema";

// inside the page component:
const clubs = getVtgClubs();
const groups = groupClubsByRegion(clubs);
const regionPages = new Set(getVtgRegions());
const range = vtgPriceRange(clubs);
const year = new Date().getFullYear();
```

- Lede: `range ? t("ledeWithPrices", { count: clubs.length, year, min: range.min, max: range.max }) : t("ledeNoPrices")` — **the page must render correctly with zero VTG data** (day-one state).
- Jump index: one line of links — `regionPages.has(slug)` → `<Link href={`/vtg-kurs/${slug}`}>` else anchor `#${slug}`.
- Each region group: `<h2 id={regionSlug}>` + (if region page exists) link `t("regionPageLink")` + subtitle + cards.
- FAQ JSON-LD: build entries from the same translated strings used in the visible FAQ (only include Q1 with numbers when `range` exists).
- ItemList JSON-LD via existing `generateItemListSchema` for clubs with data.
- Metadata canonical: `https://golfkart.no/vtg-kurs` (nb) / `https://golfkart.no/en/vtg-kurs` (en) with `languages` alternates — copy the exact pattern from the region page's `generateMetadata`.
- Updated-note date: latest `lastChecked` across clubs (or omit the note when no data).

**Step 2: Verify it renders**

```bash
pnpm dev
```

Open `http://localhost:3000/vtg-kurs` — expect the full page with all 168 clubs listed (all in "no data" state until Task 13 seeds data), intro and FAQ visible. Also check `http://localhost:3000/en/vtg-kurs`.

**Step 3: Lint + types** — `pnpm lint && pnpm exec tsc --noEmit` → clean.

**Step 4: Commit**

```bash
git add src/app/[locale]/vtg-kurs/page.tsx
git commit -m "feat: add VTG-kurs hub page"
```

---

### Task 11: Gated region pages `/vtg-kurs/[region]`

**Files:**

- Create: `src/app/[locale]/vtg-kurs/[region]/page.tsx`

**Step 1: Implement**

Same patterns as the hub, with one deliberate difference: **region pages are Norwegian-only**. VTG is a Norwegian-audience product; English county pages would have near-zero search demand and be the thinnest pages on the site (per the 2026-06-12 deep-research validation — "no more pages than necessary"). The English hub still exists for expats; English county pages do not.

The gate lives in BOTH places, and the locale restriction in both places too:

```tsx
import { notFound } from "next/navigation";
import { getVtgClubs, getVtgRegions } from "@/lib/courses";

// Gate #1: only qualifying regions, Norwegian locale only
export async function generateStaticParams() {
  return getVtgRegions().map((region) => ({ locale: "nb", region }));
}

// Gate #2: direct requests to non-qualifying regions or /en/ URLs 404
export default async function VtgRegionPage({ params }: Props) {
  const { locale, region } = await params;
  if (locale !== "nb" || !getVtgRegions().includes(region)) notFound();
  // ...
}
```

Metadata for region pages: canonical `https://golfkart.no/vtg-kurs/{region}` with NO `en` entry in `alternates.languages` (just `nb` + `x-default`) — there is no English version to point to.

Content per the mockup: breadcrumb (Hjem / VTG-kurs / {region}) → `regionTitle` h1 → data-generated lede (`regionLede` with `regionPriceSuffix` when the region has prices) → `regionCoursePagesNote` → full `VtgClubCard` list (clubs with data first — `groupClubsByRegion` already sorts) → updated-note. Region display name via `getCountyNameFromSlug` from `src/lib/constants/norway-regions.ts`. Metadata mirrors the hub's pattern with the region in title/description and canonical `/vtg-kurs/{region}`.

**Step 2: Verify**

With no seeded data yet, `getVtgRegions()` is empty: `http://localhost:3000/vtg-kurs/rogaland` must 404. (Positive case verified in Task 13 after seeding.)

**Step 3: Lint + types** — clean.

**Step 4: Commit**

```bash
git add "src/app/[locale]/vtg-kurs/[region]/page.tsx"
git commit -m "feat: add gated VTG region pages"
```

---

### Task 12: Sitemap + navigation links

**Files:**

- Modify: `src/app/sitemap.ts`
- Modify: `src/components/layout/Header.tsx`, `src/components/layout/Footer.tsx`

**Step 1: Sitemap**

In `src/app/sitemap.ts`, after `regionPages`, add (using the existing `langAlternates` helper):

```typescript
import { getVtgRegions } from "@/lib/courses";

const vtgPages: MetadataRoute.Sitemap = [
  {
    url: `${BASE_URL}/vtg-kurs`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: 0.8,
    alternates: langAlternates("/vtg-kurs"),
  },
  {
    url: `${BASE_URL}/en/vtg-kurs`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: 0.7,
    alternates: langAlternates("/vtg-kurs"),
  },
  // Region pages are Norwegian-only — no /en/ entries and no en hreflang
  ...getVtgRegions().map((region) => ({
    url: `${BASE_URL}/vtg-kurs/${region}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.7,
    alternates: {
      languages: {
        nb: `${BASE_URL}/vtg-kurs/${region}`,
        "x-default": `${BASE_URL}/vtg-kurs/${region}`,
      },
    },
  })),
];
```

Include `vtgPages` in the returned array.

**Step 2: Header + Footer links**

Read `Header.tsx` and `Footer.tsx` first and mirror how the existing `/kart` link is built (including its translation pattern — nav labels likely come from a `nav`/`header` namespace; add a key there and to both message files, then re-run `pnpm validate:translations`). Add a "VTG-kurs" link to both.

**Step 3: Verify** — `pnpm dev`, check nav link works; `pnpm lint` clean.

**Step 4: Commit**

```bash
git add src/app/sitemap.ts src/components/layout/Header.tsx src/components/layout/Footer.tsx messages/
git commit -m "feat: add VTG pages to sitemap and navigation"
```

---

### Task 13: Seed initial VTG data + verify gate end-to-end

**Files:**

- Modify: 4+ files in `content/courses/` (verified data only)

**Step 1: Seed verified clubs**

Add a `vtg` block to clubs whose prices were manually verified from their websites (June 2026 research — re-verify each URL before writing, prices change):

- `content/courses/akershus/baerum-golfklubb.json` — 1795 kr, https://bmgk.no/kurs--trening/nybegynnerkurs-vtg
- `content/courses/akershus/hauger-golfklubb.json` — 1790 kr (1190 under 16), https://hauger-golfklubb.no/pro-kurs/vtg-nybegynnerkurs
- `content/courses/akershus/...` (Soon GK is in Østfold/Akershus — find its actual file with `ls content/courses/*/ | grep -i soon`) — 895 kr, https://soongolf.no
- Plus enough Akershus clubs (≥3 total in one region) to open the first region page — check each club's website for their VTG page.

Format:

```json
"vtg": {
  "offered": true,
  "price": 1795,
  "priceYouth": 990,
  "signupUrl": "https://bmgk.no/kurs--trening/nybegynnerkurs-vtg",
  "seasonInfo": null,
  "lastChecked": "2026-06-12"
}
```

**Rule: only write data you verified on the club's site today. When unsure, use null.**

**Step 2: Verify the gate opens**

Run: `pnpm dev`

- `http://localhost:3000/vtg-kurs` — seeded clubs now show prices and primary buttons, and sort first in their region; lede shows the computed price range.
- `http://localhost:3000/vtg-kurs/akershus` — renders (if ≥3 Akershus clubs seeded).
- `http://localhost:3000/vtg-kurs/finnmark` — still 404.
- `http://localhost:3000/en/vtg-kurs/akershus` — 404 (region pages are Norwegian-only).

**Step 3: Commit**

```bash
git add content/courses/
git commit -m "data: seed verified VTG data for initial clubs"
```

---

### Task 14: Scraper extension + data validation script

**Files:**

- Modify: `scripts/scrape-course.ts` (keywords)
- Create: `scripts/validate-vtg-data.ts`
- Modify: `package.json` (script)

**Step 1: Add VTG keywords to the scraper**

In `scripts/scrape-course.ts`, add to `RELEVANT_PAGE_KEYWORDS`:

```typescript
  // VTG / beginner courses
  "vtg",
  "veien til golf",
  "nybegynner",
  "nybegynnerkurs",
  "golfkurs",
  "grønt kort",
```

(The scrape output is parsed by Claude via the repo's `scrape-and-update-golf-course` skill — update that skill's instructions, in `.claude/skills/` or wherever it lives in this repo (find it with `grep -ril "scrape-and-update" .claude/ docs/`), to also extract the `vtg` block with the null-when-unsure rule.)

**Step 2: Write the validation script `scripts/validate-vtg-data.ts`**

Walks all course JSONs and exits non-zero on invalid `vtg` blocks (run after every scraper session so bad data can't reach production):

```typescript
import fs from "fs";
import path from "path";

const COURSES_DIR = path.join(process.cwd(), "content/courses");
const errors: string[] = [];

for (const region of fs.readdirSync(COURSES_DIR)) {
  const dir = path.join(COURSES_DIR, region);
  if (!fs.statSync(dir).isDirectory()) continue;
  for (const file of fs.readdirSync(dir).filter((f) => f.endsWith(".json"))) {
    const fp = path.join(dir, file);
    const data = JSON.parse(fs.readFileSync(fp, "utf-8"));
    const vtg = data.vtg;
    if (vtg === undefined || vtg === null) continue;

    const where = `${region}/${file}`;
    if (typeof vtg.offered !== "boolean" && vtg.offered !== null)
      errors.push(`${where}: vtg.offered must be boolean or null`);
    for (const key of ["price", "priceYouth"]) {
      const v = vtg[key];
      if (v !== null && (typeof v !== "number" || v < 100 || v > 10000))
        errors.push(`${where}: vtg.${key} must be null or a plausible NOK amount (100–10000)`);
    }
    if (vtg.signupUrl !== null && !/^https?:\/\//.test(vtg.signupUrl ?? ""))
      errors.push(`${where}: vtg.signupUrl must be null or an http(s) URL`);
    if (typeof vtg.lastChecked !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(vtg.lastChecked))
      errors.push(`${where}: vtg.lastChecked must be an ISO date (YYYY-MM-DD)`);
  }
}

if (errors.length > 0) {
  console.error(`VTG data validation failed:\n${errors.join("\n")}`);
  process.exit(1);
}
console.log("VTG data valid.");
```

Add to `package.json` scripts: `"validate:vtg": "tsx scripts/validate-vtg-data.ts"`

**Step 3: Run it against the seeded data**

Run: `pnpm validate:vtg`
Expected: `VTG data valid.` — then temporarily corrupt one seeded price to `50`, re-run, expect failure + exit 1, restore it.

**Step 4: Commit**

```bash
git add scripts/scrape-course.ts scripts/validate-vtg-data.ts package.json
git commit -m "feat: extend scraper for VTG and add vtg data validation"
```

---

### Task 15: Full verification

**Step 1: Full test + lint + build**

```bash
pnpm test && pnpm lint && pnpm validate:translations && pnpm validate:vtg && pnpm build
```

Expected: all pass. The build output lists the generated routes — confirm `/vtg-kurs` and `/[locale]/vtg-kurs/[region]` appear, with only gated regions generated.

**Step 2: Manual checks (`pnpm dev` or `pnpm start` after build)**

- `/vtg-kurs` renders nb; `/en/vtg-kurs` renders en
- Click "Meld deg på" with DevTools console: `dataLayer` receives the `vtg_signup_click` event with club_slug + region (filter network tab on `collect?` to see the GA hit)
- View page source: FAQPage + ItemList JSON-LD present
- `/sitemap.xml` includes the new URLs (and contains NO `/en/vtg-kurs/[region]` entries)
- Non-gated region URL 404s; any `/en/vtg-kurs/[region]` URL 404s

**Step 3: Final commit & wrap-up**

Use superpowers:verification-before-completion before claiming done. Then follow superpowers:finishing-a-development-branch (merge/PR per repo habit — note repo deploys from `main` via Vercel, so pushing main publishes).

---

## Out of scope (explicitly deferred)

- Sponsored-placement data source & sales flow (flag exists on the card; nothing sets it)
- Lead-capture forms (GDPR work; phase 3)
- VTG box on the 168 course detail pages (phase 3)
- Distance-to-city computation for region intros (nice-to-have; regionLede ships without it)
- English-specific slugs for the VTG hub (same path both locales)
- English region pages (deliberately excluded — near-zero search demand, would be the thinnest pages on the site; revisit only if /en/vtg-kurs hub traffic warrants it)
