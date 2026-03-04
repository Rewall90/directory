# English Translation Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add English language support to golfkart.no at `/en/` targeting UK golfers, following Google SEO best practices.

**Architecture:** next-intl with App Router `[locale]` segment. Norwegian at root (no prefix), English at `/en/`. All UI strings in message files, course data gets `_en` fields in JSON, hreflang in HTML `<head>`.

**Tech Stack:** next-intl 4.x, Next.js 16 (App Router), TypeScript, Tailwind CSS + DaisyUI

**Design Doc:** `docs/plans/2026-03-04-english-translation-design.md`

---

## Task 1: Install next-intl and create i18n configuration

**Files:**

- Modify: `package.json`
- Create: `src/i18n/routing.ts`
- Create: `src/i18n/request.ts`
- Create: `src/i18n/navigation.ts`
- Modify: `next.config.ts`

**Step 1: Install next-intl**

```bash
pnpm add next-intl
```

**Step 2: Create routing config**

Create `src/i18n/routing.ts`:

```typescript
import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["nb", "en"],
  defaultLocale: "nb",
  localePrefix: "as-needed",
});
```

**Step 3: Create request config**

Create `src/i18n/request.ts`:

```typescript
import { getRequestConfig } from "next-intl/server";
import { hasLocale } from "next-intl";
import { routing } from "./routing";

export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;
  const locale = hasLocale(routing.locales, requested) ? requested : routing.defaultLocale;

  return {
    locale,
    messages: (await import(`../../messages/${locale}.json`)).default,
  };
});
```

**Step 4: Create navigation helpers**

Create `src/i18n/navigation.ts`:

```typescript
import { createNavigation } from "next-intl/navigation";
import { routing } from "./routing";

export const { Link, redirect, usePathname, useRouter, getPathname } = createNavigation(routing);
```

**Step 5: Update next.config.ts**

Add the next-intl plugin wrapper. Read the existing config first and wrap it:

```typescript
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

// ... existing config ...

export default withNextIntl(nextConfig);
```

**Step 6: Commit**

```bash
git add -A && git commit -m "feat: install next-intl and create i18n configuration"
```

---

## Task 2: Create proxy/middleware and message files

**Files:**

- Create: `src/proxy.ts` (or `src/middleware.ts` if proxy.ts not supported)
- Create: `messages/nb.json`
- Create: `messages/en.json`

**Step 1: Create middleware**

Create `src/middleware.ts` (use middleware.ts for safety — proxy.ts may not be supported yet in all Next.js 16 builds):

```typescript
import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

export default createMiddleware(routing);

export const config = {
  matcher: "/((?!api|trpc|_next|_vercel|.*\\..*).*)",
};
```

**Step 2: Create Norwegian message file**

Create `messages/nb.json` — extract ALL hardcoded Norwegian strings from the codebase. This is the most critical file. Structure by component/page:

```json
{
  "Metadata": {
    "siteTitle": "Finn Golfbaner i Norge – Kart, Info og Brukeranmeldelser",
    "siteDescription": "Søk og finn golfbaner i hele Norge. Se kart, les omtaler og få nyttig info om baner i ditt område."
  },
  "Header": {
    "regions": "Fylke",
    "about": "Om oss",
    "contact": "Kontakt",
    "switchLanguage": "English"
  },
  "Footer": {
    "aboutTitle": "Om golfkart.no",
    "tagline": "Din komplette guide til golfbaner i Norge",
    "navigation": "Navigasjon",
    "regions": "Fylke",
    "blog": "Blogg",
    "about": "Om oss",
    "contact": "Kontakt",
    "legal": "Juridisk",
    "privacy": "Personvern",
    "terms": "Bruksvilkår",
    "copyright": "© {year} golfkart.no. Alle rettigheter reservert."
  },
  "Home": {
    "metaTitle": "golfkart.no - Finn golfbaner i Norge",
    "metaDescription": "Utforsk {count} golfbaner i hele Norge – med oppdatert informasjon om fasiliteter, tjenester og brukeranmeldelser.",
    "heading": "Norges Golfbaner",
    "exploreRegions": "Utforsk fylker"
  },
  "Hero": {
    "title": "Finn Din Golfbane",
    "subtitle": "Golf Directory tilbyr en komplett oversikt over golfbaner i Norge, med detaljert informasjon og vurderinger.",
    "nearMe": "Se baner nær meg",
    "finding": "Finner golfbaner i nærheten...",
    "permissionDenied": "Tillatelse nektet",
    "positionError": "Kunne ikke hente posisjon",
    "retry": "Prøv på nytt",
    "nearbyCourses": "Golfbaner i nærheten",
    "searchAgain": "Søk på nytt",
    "holes": "{count} hull",
    "par": "Par {par}",
    "noGeoSupport": "Nettleseren din støtter ikke geolokasjon.",
    "fetchError": "Kunne ikke hente golfbaner i nærheten",
    "noneNearby": "Ingen golfbaner funnet i nærheten (innen 50 km)",
    "genericError": "En feil oppstod ved henting av golfbaner",
    "permissionRequired": "Du må gi tillatelse til stedstjenester for å se golfbaner i nærheten.",
    "positionUnavailable": "Kunne ikke bestemme din posisjon.",
    "timeout": "Tidsavbrudd ved henting av posisjon.",
    "positionGenericError": "En feil oppstod ved henting av posisjon."
  },
  "Region": {
    "metaTitle": "Golfbaner i {region} - {count} Klubber",
    "metaDescription": "Finn alle golfbaner og golfklubber i {region}. Se informasjon om {count} klubber med kart, priser, åpningstider og fasiliteter.",
    "breadcrumbHome": "Hjem",
    "breadcrumbRegions": "Fylke",
    "heading": "Golfbaner i {region}",
    "noCoursesTitle": "Vi har ingen golfbaner registrert i {region} ennå.",
    "noCoursesDescription": "Vi jobber med å legge til flere baner i denne regionen.",
    "backToHome": "← Tilbake til forsiden",
    "courseCount": "{count} golfbaner i {region}",
    "courseCountSingular": "{count} golfbane i {region}"
  },
  "RegionGrid": {
    "title": "FYLKE / REGION"
  },
  "CourseCard": {
    "reviewSingular": "anmeldelse",
    "reviewPlural": "anmeldelser",
    "holes": "{count} hull",
    "par": "Par {par}",
    "viewCourse": "Se Bane"
  },
  "CourseDetail": {
    "metaTitle": "{name} - Golf i {region}",
    "breadcrumbHome": "Hjem",
    "contact": "Kontakt",
    "bookTeeTime": "Book starttid",
    "bookOnline": "Book online",
    "bookByEmail": "Book via e-post",
    "bookByPhone": "Ring for booking",
    "bookByContact": "Kontakt for booking",
    "established": "Etablert {year}",
    "googleReviews": "{count} anmeldelser på Google"
  },
  "Pricing": {
    "title": "Priser {year}",
    "greenfee": "Greenfee",
    "membership": "Medlemskap",
    "equipment": "Utstyr",
    "standard": "Standard",
    "holes18": "18 hull",
    "holes9": "9 hull",
    "discounted": "Rabattert",
    "junior": "Junior (under 18)"
  },
  "Facilities": {
    "title": "Fasiliteter",
    "drivingRange": "Driving Range",
    "puttingGreen": "Putting Green",
    "chippingArea": "Chipping Area",
    "practiceBunker": "Practice Bunker",
    "trainingFacilities": "Treningsfasiliteter",
    "clubhouse": "Klubbhus",
    "proShop": "Pro Shop",
    "restaurant": "Restaurant",
    "lockerRoom": "Garderoberom",
    "conferenceRoom": "Konferanserom",
    "clubRental": "Klubb-leie",
    "golfCartRental": "Golfbil-leie",
    "trolleyRental": "Tralle-leie",
    "golfLessons": "Golf-timer",
    "teachingPro": "Teaching Pro",
    "simulator": "Simulator",
    "services": "Tjenester",
    "winter": "Vinter"
  },
  "About": {
    "metaTitle": "Om oss - golfkart.no",
    "metaDescription": "Norges mest komplette oversikt over golfbaner. Over 160 golfbaner fra hele Norge, fordelt på alle fylker.",
    "title": "Om golfkart.no",
    "subtitle": "Norges mest komplette oversikt over golfbaner"
  },
  "Contact": {
    "metaTitle": "Kontakt oss - golfkart.no",
    "metaDescription": "Ta kontakt med golfkart.no. Vi vil gjerne høre fra deg om spørsmål, tilbakemeldinger eller oppdatert informasjon om golfbaner.",
    "title": "Kontakt oss",
    "sendMessage": "Send oss en melding",
    "directContact": "Direkte kontakt",
    "generalInquiries": "Generelle henvendelser",
    "addUpdateCourse": "Legg til eller oppdater bane",
    "technicalSupport": "Teknisk support",
    "aboutSection": "Om golfkart.no"
  },
  "Privacy": {
    "metaTitle": "Personvernerklæring - golfkart.no",
    "title": "Personvernerklæring"
  },
  "Terms": {
    "metaTitle": "Bruksvilkår - golfkart.no",
    "title": "Bruksvilkår"
  },
  "Blog": {
    "metaTitle": "Blogg - golfkart.no",
    "metaDescription": "Les våre blogginnlegg om golfbaner, tips og nyheter fra golfverdenen i Norge",
    "title": "Blogg",
    "subtitle": "Les våre artikler om golfbaner, tips og nyheter fra golfverdenen",
    "noPostsYet": "Ingen blogginnlegg tilgjengelig ennå."
  }
}
```

**Step 3: Create English message file**

Create `messages/en.json` — full English translation of all keys:

```json
{
  "Metadata": {
    "siteTitle": "Find Golf Courses in Norway – Map, Info & Reviews",
    "siteDescription": "Search and find golf courses across Norway. See maps, read reviews and get useful info about courses in your area."
  },
  "Header": {
    "regions": "Regions",
    "about": "About",
    "contact": "Contact",
    "switchLanguage": "Norsk"
  },
  "Footer": {
    "aboutTitle": "About golfkart.no",
    "tagline": "Your complete guide to golf courses in Norway",
    "navigation": "Navigation",
    "regions": "Regions",
    "blog": "Blog",
    "about": "About",
    "contact": "Contact",
    "legal": "Legal",
    "privacy": "Privacy Policy",
    "terms": "Terms of Use",
    "copyright": "© {year} golfkart.no. All rights reserved."
  },
  "Home": {
    "metaTitle": "golfkart.no - Find Golf Courses in Norway",
    "metaDescription": "Explore {count} golf courses across Norway – with up-to-date information on facilities, services and user reviews.",
    "heading": "Golf Courses in Norway",
    "exploreRegions": "Explore regions"
  },
  "Hero": {
    "title": "Find Your Golf Course",
    "subtitle": "Golf Directory offers a complete overview of golf courses in Norway, with detailed information and ratings.",
    "nearMe": "See courses near me",
    "finding": "Finding nearby golf courses...",
    "permissionDenied": "Permission denied",
    "positionError": "Could not get position",
    "retry": "Try again",
    "nearbyCourses": "Nearby golf courses",
    "searchAgain": "Search again",
    "holes": "{count} holes",
    "par": "Par {par}",
    "noGeoSupport": "Your browser does not support geolocation.",
    "fetchError": "Could not fetch nearby golf courses",
    "noneNearby": "No golf courses found nearby (within 50 km)",
    "genericError": "An error occurred while fetching golf courses",
    "permissionRequired": "You must allow location services to see nearby golf courses.",
    "positionUnavailable": "Could not determine your position.",
    "timeout": "Timed out while getting position.",
    "positionGenericError": "An error occurred while getting position."
  },
  "Region": {
    "metaTitle": "Golf Courses in {region}, Norway - {count} Clubs",
    "metaDescription": "Find all golf courses and golf clubs in {region}, Norway. See information about {count} clubs with maps, prices, opening hours and facilities.",
    "breadcrumbHome": "Home",
    "breadcrumbRegions": "Regions",
    "heading": "Golf Courses in {region}",
    "noCoursesTitle": "We have no golf courses registered in {region} yet.",
    "noCoursesDescription": "We are working on adding more courses in this region.",
    "backToHome": "← Back to home",
    "courseCount": "{count} golf courses in {region}",
    "courseCountSingular": "{count} golf course in {region}"
  },
  "RegionGrid": {
    "title": "REGION"
  },
  "CourseCard": {
    "reviewSingular": "review",
    "reviewPlural": "reviews",
    "holes": "{count} holes",
    "par": "Par {par}",
    "viewCourse": "View Course"
  },
  "CourseDetail": {
    "metaTitle": "{name} - Golf in {region}, Norway",
    "breadcrumbHome": "Home",
    "contact": "Contact",
    "bookTeeTime": "Book tee time",
    "bookOnline": "Book online",
    "bookByEmail": "Book by email",
    "bookByPhone": "Call to book",
    "bookByContact": "Contact to book",
    "established": "Established {year}",
    "googleReviews": "{count} reviews on Google"
  },
  "Pricing": {
    "title": "Prices {year}",
    "greenfee": "Green Fee",
    "membership": "Membership",
    "equipment": "Equipment",
    "standard": "Standard",
    "holes18": "18 holes",
    "holes9": "9 holes",
    "discounted": "Discounted",
    "junior": "Junior (under 18)"
  },
  "Facilities": {
    "title": "Facilities",
    "drivingRange": "Driving Range",
    "puttingGreen": "Putting Green",
    "chippingArea": "Chipping Area",
    "practiceBunker": "Practice Bunker",
    "trainingFacilities": "Training Facilities",
    "clubhouse": "Clubhouse",
    "proShop": "Pro Shop",
    "restaurant": "Restaurant",
    "lockerRoom": "Locker Room",
    "conferenceRoom": "Conference Room",
    "clubRental": "Club Rental",
    "golfCartRental": "Golf Cart Rental",
    "trolleyRental": "Trolley Rental",
    "golfLessons": "Golf Lessons",
    "teachingPro": "Teaching Pro",
    "simulator": "Simulator",
    "services": "Services",
    "winter": "Winter"
  },
  "About": {
    "metaTitle": "About - golfkart.no",
    "metaDescription": "Norway's most complete overview of golf courses. Over 160 golf courses from all of Norway, across all regions.",
    "title": "About golfkart.no",
    "subtitle": "Norway's most complete overview of golf courses"
  },
  "Contact": {
    "metaTitle": "Contact Us - golfkart.no",
    "metaDescription": "Get in touch with golfkart.no. We would love to hear from you about questions, feedback or updated golf course information.",
    "title": "Contact Us",
    "sendMessage": "Send us a message",
    "directContact": "Direct contact",
    "generalInquiries": "General inquiries",
    "addUpdateCourse": "Add or update a course",
    "technicalSupport": "Technical support",
    "aboutSection": "About golfkart.no"
  },
  "Privacy": {
    "metaTitle": "Privacy Policy - golfkart.no",
    "title": "Privacy Policy"
  },
  "Terms": {
    "metaTitle": "Terms of Use - golfkart.no",
    "title": "Terms of Use"
  },
  "Blog": {
    "metaTitle": "Blog - golfkart.no",
    "metaDescription": "Read our blog posts about golf courses, tips and news from the golf world in Norway",
    "title": "Blog",
    "subtitle": "Read our articles about golf courses, tips and news from the golf world",
    "noPostsYet": "No blog posts available yet."
  }
}
```

**Note:** The message files above cover the primary UI strings. During implementation, you will discover additional strings in sub-components (PricingTabs, ReviewSection, StatsBar, StorySection, WeatherWidget, etc.) that also need keys. Add them as you refactor each component. The About, Contact, Privacy, and Terms pages have extensive body content — those full texts should be added to the message files or kept as separate MDX content per locale.

**Step 4: Commit**

```bash
git add -A && git commit -m "feat: add middleware and i18n message files"
```

---

## Task 3: Restructure routes under [locale]

This is the most structural change. Move all pages under a `[locale]` dynamic segment.

**Files:**

- Create: `src/app/[locale]/layout.tsx`
- Move: `src/app/page.tsx` → `src/app/[locale]/page.tsx`
- Move: `src/app/[region]/` → `src/app/[locale]/[region]/`
- Move: `src/app/om-oss/` → `src/app/[locale]/about/`
- Move: `src/app/kontakt-oss/` → `src/app/[locale]/contact/`
- Move: `src/app/personvern/` → `src/app/[locale]/privacy/`
- Move: `src/app/vilkar/` → `src/app/[locale]/terms/`
- Move: `src/app/(content)/blogg/` → `src/app/[locale]/blog/`
- Modify: `src/app/layout.tsx` (root — minimal, delegates to [locale] layout)

**Step 1: Create the [locale] layout**

Create `src/app/[locale]/layout.tsx` — move most of the current root layout content here:

```typescript
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
// ... import existing fonts, analytics, etc. from current layout.tsx

type Props = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params;

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  setRequestLocale(locale);

  return (
    <NextIntlClientProvider>
      {/* Move Header, Footer, and main content wrapper from current root layout here */}
      {children}
    </NextIntlClientProvider>
  );
}
```

**Step 2: Simplify root layout**

Update `src/app/layout.tsx` to be a minimal HTML shell:

```typescript
// Root layout — minimal shell, [locale] layout handles the rest
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return children;
}
```

The `[locale]/layout.tsx` will contain the `<html>` and `<body>` tags with `lang={locale}`.

**Step 3: Move page files**

Move all page files into the `[locale]` directory. The routes will be:

```
src/app/[locale]/page.tsx                    — Homepage
src/app/[locale]/[region]/page.tsx           — Region listing
src/app/[locale]/[region]/[course]/page.tsx  — Course detail
src/app/[locale]/[region]/[course]/_components/  — Course sub-components
src/app/[locale]/blog/page.tsx               — Blog index
src/app/[locale]/blog/[slug]/page.tsx        — Blog post
src/app/[locale]/about/page.tsx              — About (was om-oss)
src/app/[locale]/contact/page.tsx            — Contact (was kontakt-oss)
src/app/[locale]/privacy/page.tsx            — Privacy (was personvern)
src/app/[locale]/terms/page.tsx              — Terms (was vilkar)
```

**Step 4: Update every page to accept locale param**

Every page needs:

1. `params` updated to include `locale`
2. `setRequestLocale(locale)` called at the top
3. `generateStaticParams()` updated to include both locales

Example for homepage:

```typescript
import { setRequestLocale } from "next-intl/server";
import { getTranslations } from "next-intl/server";

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function HomePage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("Home");
  // ... rest of page
}
```

**Step 5: Update internal links**

Replace all `<Link href="/om-oss">` style links with locale-aware links. Use the custom `Link` from `@/i18n/navigation` or construct paths with locale awareness.

For Norwegian: `/om-oss` stays as `/om-oss` (middleware rewrites internally)
For English: links should go to `/en/about`

**Important:** The static page slugs differ by language. You need a mapping:

```typescript
// src/lib/constants/page-slugs.ts
export const PAGE_SLUGS = {
  about: { nb: "om-oss", en: "about" },
  contact: { nb: "kontakt-oss", en: "contact" },
  privacy: { nb: "personvern", en: "privacy" },
  terms: { nb: "vilkar", en: "terms" },
  blog: { nb: "blogg", en: "blog" },
} as const;
```

**However**, since we're using the `[locale]` segment pattern, the actual page files live at fixed paths (`about/page.tsx`, not `om-oss/page.tsx`). The middleware handles rewriting Norwegian paths. You'll need custom pathname mappings in the routing config:

```typescript
// src/i18n/routing.ts
export const routing = defineRouting({
  locales: ["nb", "en"],
  defaultLocale: "nb",
  localePrefix: "as-needed",
  pathnames: {
    "/": "/",
    "/about": {
      nb: "/om-oss",
      en: "/about",
    },
    "/contact": {
      nb: "/kontakt-oss",
      en: "/contact",
    },
    "/privacy": {
      nb: "/personvern",
      en: "/privacy",
    },
    "/terms": {
      nb: "/vilkar",
      en: "/terms",
    },
    "/blog": {
      nb: "/blogg",
      en: "/blog",
    },
    "/blog/[slug]": {
      nb: "/blogg/[slug]",
      en: "/blog/[slug]",
    },
    "/[region]": "/[region]",
    "/[region]/[course]": "/[region]/[course]",
  },
});
```

**Step 6: Test that the build still works**

```bash
pnpm build
```

Fix any import errors or missing params. This step will likely require iteration.

**Step 7: Commit**

```bash
git add -A && git commit -m "feat: restructure routes under [locale] with next-intl"
```

---

## Task 4: Refactor Header with language switcher

**Files:**

- Modify: `src/components/layout/Header.tsx`

**Step 1: Add translations and language switcher**

Replace hardcoded strings with `useTranslations()`. Add a language toggle link.

```typescript
"use client";

import { useTranslations, useLocale } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";

export default function Header() {
  const t = useTranslations("Header");
  const locale = useLocale();
  const pathname = usePathname();

  return (
    // ... existing header structure
    // Replace "Fylke" with {t('regions')}
    // Replace "Om oss" with {t('about')}
    // Replace "Kontakt" with {t('contact')}
    // Add language switcher:
    <Link href={pathname} locale={locale === "nb" ? "en" : "nb"}>
      {t("switchLanguage")}
    </Link>
  );
}
```

**Step 2: Commit**

```bash
git add src/components/layout/Header.tsx && git commit -m "feat: add i18n to Header with language switcher"
```

---

## Task 5: Refactor Footer

**Files:**

- Modify: `src/components/layout/Footer.tsx`

**Step 1: Replace all hardcoded strings with translations**

Use `useTranslations('Footer')` and replace every Norwegian string. Update internal links to use the locale-aware `Link` from `@/i18n/navigation`.

**Step 2: Commit**

```bash
git add src/components/layout/Footer.tsx && git commit -m "feat: add i18n to Footer"
```

---

## Task 6: Refactor Homepage and HeroSection

**Files:**

- Modify: `src/app/[locale]/page.tsx`
- Modify: `src/app/_components/HeroSection.tsx` (or wherever it moved)

**Step 1: Update homepage**

Add locale param handling, `setRequestLocale()`, and replace hardcoded metadata and text with `getTranslations('Home')`.

**Step 2: Update HeroSection**

This is a client component with ~15 hardcoded strings. Use `useTranslations('Hero')` and replace all strings.

**Step 3: Commit**

```bash
git add -A && git commit -m "feat: add i18n to Homepage and HeroSection"
```

---

## Task 7: Refactor Region page

**Files:**

- Modify: `src/app/[locale]/[region]/page.tsx`

**Step 1: Update region page**

- Add locale to params
- Use `getTranslations('Region')` for all text
- Update `generateStaticParams()` to include both locales
- Update `generateMetadata()` with translated title/description (include "Norway" in English)
- Update breadcrumbs with translated labels
- Add hreflang to metadata `alternates`

**Step 2: Commit**

```bash
git add -A && git commit -m "feat: add i18n to Region page"
```

---

## Task 8: Refactor CourseCard component

**Files:**

- Modify: `src/components/courses/CourseCard.tsx`

**Step 1: Add translations**

Replace "hull", "Par", "anmeldelse/anmeldelser", "Se Bane" with `useTranslations('CourseCard')` calls.

Also need to make the course link locale-aware — English cards should link to `slug_en` when available.

**Step 2: Commit**

```bash
git add -A && git commit -m "feat: add i18n to CourseCard"
```

---

## Task 9: Refactor Course detail page and sub-components

**Files:**

- Modify: `src/app/[locale]/[region]/[course]/page.tsx`
- Modify: `src/app/[locale]/[region]/[course]/_components/CourseHero.tsx`
- Modify: `src/app/[locale]/[region]/[course]/_components/PricingTabs.tsx`
- Modify: `src/app/[locale]/[region]/[course]/_components/FeaturesGrid.tsx`
- Modify: `src/app/[locale]/[region]/[course]/_components/ContactSection.tsx`
- Modify: `src/app/[locale]/[region]/[course]/_components/StatsBar.tsx`
- Modify: `src/app/[locale]/[region]/[course]/_components/StorySection.tsx`
- Modify: `src/app/[locale]/[region]/[course]/_components/ReviewSection.tsx`
- Modify: `src/app/[locale]/[region]/[course]/_components/NearbyCoursesGrid.tsx`
- Modify: `src/app/[locale]/[region]/[course]/_components/WeatherWidget.tsx`

**Step 1: Update course detail page**

- Add locale param handling
- Use `getTranslations('CourseDetail')` for breadcrumbs, booking labels
- Update `generateStaticParams()` — for English locale, use `slug_en`
- Update `generateMetadata()` with hreflang alternates
- Display localized course fields (description, terrain, etc.) based on locale
- Update structured data (JSON-LD) with localized name/description/URL

**Step 2: Update each sub-component**

Each component needs its Norwegian strings replaced with translation calls. Key components:

- **PricingTabs** (~40 strings) — pricing labels, tab names, category names
- **FeaturesGrid** (~15 strings) — facility names
- **CourseHero** — "Etablert" label, review count text
- **StatsBar** — stat labels
- **StorySection** — section headers
- **ReviewSection** — review form labels
- **ContactSection** — contact labels
- **WeatherWidget** — weather labels
- **NearbyCoursesGrid** — section title

**Step 3: Course data display helper**

Create a helper to get the right field based on locale:

```typescript
// src/lib/i18n-courses.ts
import type { Course } from "@/types/course";

type Locale = "nb" | "en";

export function getLocalizedField(course: Course, field: string, locale: Locale): string | null {
  if (locale === "en") {
    const enField = `${field}_en` as keyof Course;
    if (course[enField]) return course[enField] as string;
  }
  return course[field as keyof Course] as string | null;
}

export function getLocalizedSlug(course: Course, locale: Locale): string {
  return locale === "en" && course.slug_en ? course.slug_en : course.slug;
}

export function getLocalizedName(course: Course, locale: Locale): string {
  return locale === "en" && course.name_en ? course.name_en : course.name;
}
```

**Step 4: Commit**

```bash
git add -A && git commit -m "feat: add i18n to Course detail page and sub-components"
```

---

## Task 10: Refactor static pages (About, Contact, Privacy, Terms)

**Files:**

- Modify: `src/app/[locale]/about/page.tsx`
- Modify: `src/app/[locale]/contact/page.tsx`
- Modify: `src/app/[locale]/privacy/page.tsx`
- Modify: `src/app/[locale]/terms/page.tsx`

**Step 1: About and Contact pages**

These have moderate amounts of text. Extract all strings to message files and use translations.

**Step 2: Privacy and Terms pages**

These are extensive legal documents (80-100+ strings each). Two approaches:

Option A: Add all legal text to message files (many keys but simple)
Option B: Create separate MDX files per locale for legal content

**Recommended: Option A** for consistency. Add detailed keys like `Privacy.section1Title`, `Privacy.section1Content`, etc.

**Step 3: Add hreflang to all static page metadata**

Each page's `generateMetadata()` needs:

```typescript
alternates: {
  canonical: currentUrl,
  languages: {
    'nb': norwegianUrl,
    'en': englishUrl,
    'x-default': norwegianUrl,
  }
}
```

**Step 4: Commit**

```bash
git add -A && git commit -m "feat: add i18n to static pages (about, contact, privacy, terms)"
```

---

## Task 11: Refactor blog pages

**Files:**

- Modify: `src/app/[locale]/blog/page.tsx`
- Modify: `src/app/[locale]/blog/[slug]/page.tsx`
- Modify: blog content loading functions

**Step 1: Update blog index and post pages**

Replace Norwegian UI strings with translations.

**Step 2: Update blog content loading**

Blog posts need to load from locale-specific directories:

```
content/blog/nb/beste-golfbaner-norge.mdx
content/blog/en/best-golf-courses-norway.mdx
```

Update the MDX loading function to accept a locale parameter.

**Step 3: Commit**

```bash
git add -A && git commit -m "feat: add i18n to blog pages"
```

---

## Task 12: Add hreflang tags and update sitemap

**Files:**

- Modify: `src/app/[locale]/layout.tsx` (or create a HreflangTags component)
- Modify: `src/app/sitemap.ts`

**Step 1: Add hreflang to page metadata**

For pages using `generateMetadata()`, add the `alternates.languages` field. For the layout level, you may need a shared utility that generates the correct hreflang URLs for any given page.

```typescript
// src/lib/hreflang.ts
export function getAlternates(norwegianPath: string, englishPath: string) {
  const baseUrl = "https://golfkart.no";
  return {
    canonical: undefined, // set per page
    languages: {
      nb: `${baseUrl}${norwegianPath}`,
      en: `${baseUrl}${englishPath}`,
      "x-default": `${baseUrl}${norwegianPath}`,
    },
  };
}
```

**Step 2: Update sitemap.ts**

Generate entries for both languages. Each entry must include its own `<loc>` — no xhtml:link needed since we're using HTML `<link>` tags for hreflang.

```typescript
// src/app/sitemap.ts
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const courses = await getAllCourses();
  const entries: MetadataRoute.Sitemap = [];

  // Norwegian static pages
  entries.push(
    { url: "https://golfkart.no/", lastModified: new Date() },
    { url: "https://golfkart.no/om-oss", lastModified: new Date() },
    // ... more Norwegian pages
  );

  // English static pages
  entries.push(
    { url: "https://golfkart.no/en/", lastModified: new Date() },
    { url: "https://golfkart.no/en/about", lastModified: new Date() },
    // ... more English pages
  );

  // Norwegian + English course pages
  for (const course of courses) {
    const regionSlug = toRegionSlug(course.region);
    entries.push({
      url: `https://golfkart.no/${regionSlug}/${course.slug}`,
      lastModified: new Date(),
    });
    entries.push({
      url: `https://golfkart.no/en/${regionSlug}/${course.slug_en || course.slug}`,
      lastModified: new Date(),
    });
  }

  return entries;
}
```

**Step 3: Commit**

```bash
git add -A && git commit -m "feat: add hreflang tags and update sitemap for both languages"
```

---

## Task 13: Update Course type definitions

**Files:**

- Modify: `src/types/course.ts`

**Step 1: Add `_en` fields to Course interface**

Add optional English fields for all translatable text:

```typescript
// Add to Course interface:
slug_en?: string;
name_en?: string;
description_en?: string | null;

// Inside course nested object:
// course.terrain_en?: string | null;

// Inside season:
// season.winterUse_en?: string | null;

// Inside booking:
// booking.notes_en?: string | null;

// Inside visitors:
// visitors.dressCode_en?: string | null;
// visitors.roundTimeNotes_en?: string | null;

// Inside pricing entries:
// greenFeeDescription_en?: string | null;
// notes_en?: string | null;

// Inside membership pricing entries:
// name_en?: string;
// description_en?: string | null;
// restrictions_en?: string | null;
```

**Step 2: Commit**

```bash
git add src/types/course.ts && git commit -m "feat: add English field types to Course interface"
```

---

## Task 14: Create course translation script

**Files:**

- Create: `scripts/translate-courses.ts`

**Step 1: Write the translation script**

This script reads each course JSON, extracts Norwegian text fields, sends them to an LLM for translation, and writes the `_en` fields back.

```typescript
// scripts/translate-courses.ts
import fs from "fs";
import path from "path";
import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic();
const COURSES_DIR = path.join(process.cwd(), "content/courses");

// Fields to translate
const TRANSLATABLE_FIELDS = [
  "name",
  "description",
  "course.terrain",
  "season.winterUse",
  "booking.notes",
  "visitors.dressCode",
  "visitors.roundTimeNotes",
];

async function translateCourse(coursePath: string) {
  const course = JSON.parse(fs.readFileSync(coursePath, "utf-8"));

  // Skip if already translated
  if (course.slug_en) {
    console.log(`Skipping ${course.slug} (already translated)`);
    return;
  }

  // Collect Norwegian text fields
  const textsToTranslate: Record<string, string> = {};
  // ... extract fields ...

  // Call LLM for translation
  const response = await anthropic.messages.create({
    model: "claude-sonnet-4-5-20250929",
    max_tokens: 2000,
    messages: [
      {
        role: "user",
        content: `Translate the following Norwegian golf course data to English.
Keep proper nouns (club names, place names) recognizable.
Use standard golf terminology.
Generate a URL-safe English slug from the translated name.
Return JSON only.

${JSON.stringify(textsToTranslate, null, 2)}`,
      },
    ],
  });

  // Parse response and write _en fields back
  // ... write to JSON file ...
}

async function main() {
  // Walk all course JSON files
  // Translate each one
  // Report progress
}

main();
```

**Step 2: Run the script**

```bash
npx tsx scripts/translate-courses.ts
```

**Step 3: Review and commit translations**

```bash
git add content/courses/ && git commit -m "feat: add English translations to all course JSON files"
```

---

## Task 15: Create blog translation script

**Files:**

- Create: `scripts/translate-blog.ts`
- Create: `content/blog/en/` directory

**Step 1: Write the blog translation script**

Similar to course translation — reads Norwegian MDX, translates frontmatter + body content, writes to `content/blog/en/`.

**Step 2: Run and commit**

```bash
npx tsx scripts/translate-blog.ts
git add content/blog/en/ && git commit -m "feat: add English blog post translations"
```

---

## Task 16: Create translation validation script

**Files:**

- Create: `scripts/validate-translations.ts`

**Step 1: Write validation script**

Checks at build time:

1. Every course JSON has all required `_en` fields
2. No `_en` field is empty or identical to Norwegian original
3. Every `slug_en` is unique across all courses
4. Every Norwegian blog post has an English counterpart

**Step 2: Add to build pipeline**

Add to `package.json`:

```json
{
  "scripts": {
    "validate:translations": "tsx scripts/validate-translations.ts",
    "prebuild": "pnpm validate:translations"
  }
}
```

**Step 3: Commit**

```bash
git add -A && git commit -m "feat: add translation validation script"
```

---

## Task 17: Update structured data and og:locale

**Files:**

- Modify: `src/app/[locale]/[region]/[course]/page.tsx` (JSON-LD section)
- Modify: `src/app/[locale]/layout.tsx` (og:locale)

**Step 1: Localize structured data**

In the course detail page, update the JSON-LD `GolfCourse` schema:

```typescript
const structuredData = {
  "@context": "https://schema.org",
  "@type": "GolfCourse",
  name: locale === "en" ? course.name_en || course.name : course.name,
  description: locale === "en" ? course.description_en || course.description : course.description,
  url: `https://golfkart.no${locale === "en" ? "/en" : ""}/${regionSlug}/${locale === "en" ? course.slug_en || course.slug : course.slug}`,
  // ... rest of schema stays the same (address, geo, phone, etc.)
};
```

**Step 2: Add og:locale to metadata**

In `generateMetadata()` functions:

```typescript
openGraph: {
  locale: locale === 'en' ? 'en_GB' : 'nb_NO',
  // ... rest of OG tags
}
```

**Step 3: Commit**

```bash
git add -A && git commit -m "feat: localize structured data and og:locale"
```

---

## Task 18: Final testing and build verification

**Step 1: Full build test**

```bash
pnpm build
```

Fix any build errors. Common issues:

- Missing `setRequestLocale()` calls in pages
- Incorrect params types (missing locale)
- Broken imports after file moves
- Missing translation keys

**Step 2: Manual route testing**

Verify these routes work:

```
/                                    → Norwegian homepage
/en/                                 → English homepage
/rogaland                            → Norwegian region page
/en/rogaland                         → English region page
/rogaland/stavanger-golfklubb        → Norwegian course page
/en/rogaland/stavanger-golf-club     → English course page
/om-oss                              → Norwegian about
/en/about                            → English about
/blogg                               → Norwegian blog
/en/blog                             → English blog
```

**Step 3: Verify SEO elements**

For each page, check:

- [ ] hreflang tags present and bidirectional
- [ ] Canonical is self-referencing
- [ ] `lang` attribute matches locale
- [ ] Title is in correct language
- [ ] All visible text is in correct language
- [ ] Structured data uses correct language
- [ ] og:locale is correct
- [ ] Language switcher links to correct alternate page

**Step 4: Final commit**

```bash
git add -A && git commit -m "fix: resolve build issues and verify i18n implementation"
```

---

## Task 19: Post-launch — Google Search Console setup

**After deploying to production:**

1. Go to Google Search Console
2. Add URL-prefix property: `https://golfkart.no/en/`
3. Submit sitemap at `https://golfkart.no/sitemap.xml`
4. Monitor the Coverage report for both languages
5. Check the "Hreflang tags" section for errors

---

## Task Order and Dependencies

```
Task 1  (next-intl config)
  ↓
Task 2  (middleware + messages)
  ↓
Task 3  (restructure routes) ← Most complex, do carefully
  ↓
Task 13 (Course types) ← Can be done in parallel with Tasks 4-12
  ↓
Tasks 4-12 (Component refactoring) ← Can be done in any order
  ↓
Task 14 (Course translation script)
  ↓
Task 15 (Blog translation script)
  ↓
Task 16 (Validation script)
  ↓
Task 17 (Structured data + og:locale)
  ↓
Task 18 (Testing + build verification)
  ↓
Task 19 (Search Console — post-deploy)
```
