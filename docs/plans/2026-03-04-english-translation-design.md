# English Translation Design — golfkart.no/en/

**Date:** 2026-03-04
**Status:** Approved
**Goal:** Add English language support targeting UK golfers searching for golf courses in Norway.

## Background

Google Keyword Planner analysis (March 2026) showed:

- **UK (English):** 37 keyword ideas, "lofoten links norway" at 1K-10K/mo, HIGH competition, +900% growth
- **Sweden:** 15 keywords, moderate per-capita interest
- **Germany:** 10 keywords, very low interest
- **Denmark:** 7 keywords, lowest interest

English is the only viable translation. Primary audience: UK golfers.

## URL Structure

Norwegian stays at root (no URL changes to existing pages). English at `/en/`.

| Language            | Example URL                                   |
| ------------------- | --------------------------------------------- |
| Norwegian (default) | `golfkart.no/rogaland/stavanger-golfklubb`    |
| English             | `golfkart.no/en/rogaland/stavanger-golf-club` |

Static page slug mapping:

| Norwegian       | English           |
| --------------- | ----------------- |
| `/om-oss`       | `/en/about`       |
| `/kontakt-oss`  | `/en/contact`     |
| `/personvern`   | `/en/privacy`     |
| `/vilkar`       | `/en/terms`       |
| `/blogg`        | `/en/blog`        |
| `/blogg/[slug]` | `/en/blog/[slug]` |

English course pages use translated slugs stored as `slug_en` in each course JSON.

## Google SEO Requirements (verified against official docs)

### hreflang — HTML `<link>` tags only

One implementation method is sufficient per Google. HTML `<head>` tags chosen for simplicity.

```html
<!-- On every Norwegian page -->
<link rel="canonical" href="https://golfkart.no/rogaland/stavanger-gk" />
<link rel="alternate" hreflang="nb" href="https://golfkart.no/rogaland/stavanger-gk" />
<link rel="alternate" hreflang="en" href="https://golfkart.no/en/rogaland/stavanger-gc" />
<link rel="alternate" hreflang="x-default" href="https://golfkart.no/rogaland/stavanger-gk" />

<!-- On every English page -->
<link rel="canonical" href="https://golfkart.no/en/rogaland/stavanger-gc" />
<link rel="alternate" hreflang="nb" href="https://golfkart.no/rogaland/stavanger-gk" />
<link rel="alternate" hreflang="en" href="https://golfkart.no/en/rogaland/stavanger-gc" />
<link rel="alternate" hreflang="x-default" href="https://golfkart.no/rogaland/stavanger-gk" />
```

Rules:

- `hreflang="nb"` (Norwegian Bokmal, ISO 639-1)
- `hreflang="en"` (generic English — not `en-GB` since we have one English version)
- `x-default` → Norwegian (the `.no` domain default)
- Self-referencing on every page
- Bidirectional — every NB↔EN pair
- Canonical is always self-referencing (never cross-language)
- Fully-qualified URLs with `https://`

### What Google requires on every English page

| Element                 | Requirement                                                                              |
| ----------------------- | ---------------------------------------------------------------------------------------- |
| **All visible content** | Must be in English — Google detects language from visible text, not code                 |
| **Title tag**           | Fully English, include "Norway" (e.g., "Stavanger Golf Club - Golf in Rogaland, Norway") |
| **Meta description**    | Fully English, unique per page                                                           |
| **Alt text**            | Translated to English (same image URLs)                                                  |
| **Breadcrumbs**         | Translated (e.g., "Home > Regions > Oslo")                                               |
| **Structured data**     | GolfCourse type, description/name in English, URL = English page URL                     |
| **og:locale**           | `en_GB` (not a Google signal but good for social)                                        |
| **HTML lang**           | `lang="en"` (Google ignores but needed for a11y)                                         |

### What NOT to do (per Google)

- No auto-redirects based on browser language or IP
- No IP-based content adaptation
- No `Content-Language` HTTP header (Google ignores it)
- No `notranslate` meta tag
- No cross-language canonical (English canonical must not point to Norwegian)
- No partial translations (boilerplate-only translation treated as duplicate)

### .no ccTLD trade-off

Google docs state ccTLDs provide strong geo-targeting "at the expense of results in other locales." The `.no` domain will work against UK rankings. This is accepted as a pragmatic trade-off — content quality and low Lofoten keyword competition outweigh the domain disadvantage. hreflang partially mitigates.

## Architecture

### i18n Library: next-intl

- App Router support with `[locale]` dynamic segment
- Middleware rewrites `/rogaland/...` → internally `/nb/rogaland/...` (URL unchanged)
- `/en/...` routes directly to English locale
- API routes excluded from locale middleware

### File structure

```
src/app/
  [locale]/
    page.tsx                    — Homepage
    [region]/
      page.tsx                  — Region listing
      [course]/
        page.tsx                — Course detail
    blog/
      page.tsx                  — Blog index
      [slug]/
        page.tsx                — Blog post
    about/page.tsx              — About (was om-oss)
    contact/page.tsx            — Contact (was kontakt-oss)
    privacy/page.tsx            — Privacy (was personvern)
    terms/page.tsx              — Terms (was vilkar)
  api/                          — API routes (no locale)
  layout.tsx                    — Root layout (sets lang from locale)
  sitemap.ts                    — Both languages
```

### UI strings — message files

```
messages/
  nb.json    — Norwegian UI strings (extracted from hardcoded text)
  en.json    — English UI strings
```

Components use `useTranslations()` (client) or `getTranslations()` (server) from next-intl.

### Course JSON — add `_en` fields

Same JSON files, new English fields added alongside Norwegian:

```json
{
  "slug": "stavanger-golfklubb",
  "slug_en": "stavanger-golf-club",
  "name": "Stavanger Golfklubb",
  "name_en": "Stavanger Golf Club",
  "description": "En av Rogalands fineste baner...",
  "description_en": "One of Rogaland's finest courses..."
}
```

Fields translated: `name`, `description`, `course.terrain`, `season.winterUse`, `booking.notes`, `visitors.dressCode`, `visitors.roundTimeNotes`, pricing descriptions, membership category names/descriptions.

Fields unchanged: slug (original kept), coordinates, numbers, phone, email, URLs, addresses, prices.

### Blog — parallel English MDX

```
content/
  blog/
    lofoten-golf.mdx           — Norwegian
    en/
      lofoten-golf.mdx         — English (AI-translated)
```

### Translation scripts

1. `scripts/translate-courses.ts` — Reads all 168 course JSONs, sends text fields to LLM, writes `_en` fields back. Run once, commit results.
2. `scripts/translate-blog.ts` — Reads Norwegian MDX, translates, writes to `content/blog/en/`. Run once, commit results.
3. `scripts/validate-translations.ts` — Build-time validation:
   - Every course has all required `_en` fields
   - No `_en` field empty or identical to Norwegian
   - Every `slug_en` is unique
   - Every Norwegian page has English counterpart

### Language switcher

Simple link in header — no dropdown (only 2 languages):

- On Norwegian pages: link to `/en/` equivalent
- On English pages: link to Norwegian equivalent
- No cookies, no redirect, just an `<a>` tag

### Structured data per language

```json
// English page
{
  "@type": "GolfCourse",
  "name": "Stavanger Golf Club",
  "description": "One of Rogaland's finest courses...",
  "url": "https://golfkart.no/en/rogaland/stavanger-golf-club"
}

// Norwegian page
{
  "@type": "GolfCourse",
  "name": "Stavanger Golfklubb",
  "description": "En av Rogalands fineste baner...",
  "url": "https://golfkart.no/rogaland/stavanger-golfklubb"
}
```

### Google Search Console

After launch:

1. Keep existing domain property `golfkart.no`
2. Add URL-prefix property `https://golfkart.no/en/` to track English performance separately
3. Submit sitemap

## Scope

- All 168 golf courses
- All blog posts
- All static pages (about, contact, privacy, terms)
- All components with UI text

## Components requiring refactoring

All text-bearing components need `t()` function calls:

- HeroSection, Header, Footer
- CourseCard, CourseHero, StatsBar, StorySection
- WeatherWidget, StarRating
- PricingTabs, ContactSection, ReviewSection
- FeaturesGrid, NearbyCoursesGrid
- All page-level metadata

## Sources (Google official docs)

- [Managing Multi-Regional and Multilingual Sites](https://developers.google.com/search/docs/specialty/international/managing-multi-regional-sites)
- [Localized Versions of your Pages](https://developers.google.com/search/docs/specialty/international/localized-versions)
- [How to Specify a Canonical](https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls)
- [URL Structure Best Practices](https://developers.google.com/search/docs/crawling-indexing/url-structure)
- [Meta Tags Google Supports](https://developers.google.com/search/docs/crawling-indexing/special-tags)
- [Title Links in Search](https://developers.google.com/search/docs/appearance/title-link)
- [Image SEO](https://developers.google.com/search/docs/appearance/google-images)
- [Breadcrumb Structured Data](https://developers.google.com/search/docs/appearance/structured-data/breadcrumb)
- [LocalBusiness Structured Data](https://developers.google.com/search/docs/appearance/structured-data/local-business)
- [Locale-Adaptive Pages](https://developers.google.com/search/docs/specialty/international/locale-adaptive-pages)
- [International Targeting Deprecated](https://support.google.com/webmasters/answer/12474899)
