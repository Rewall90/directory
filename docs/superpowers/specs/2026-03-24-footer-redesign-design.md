# Footer Redesign — SEO-Rich Mega Footer

## Overview

Replace the current minimal 3-column footer with a data-driven, SEO-optimized mega footer that links every region, surfaces top-rated courses, and embeds Organization structured data. The footer becomes a server component that fetches real data at build time.

## Goals

- Maximize internal linking for Google crawlability (25+ links on every page)
- Surface social proof via top-rated courses with star ratings
- Use real data (region counts, course ratings) instead of static text
- Eliminate inline HSL styles in favor of Tailwind utilities
- Add schema.org Organization JSON-LD for Google Knowledge Panel eligibility
- Maintain full i18n support (Norwegian + English)

## Component Architecture

```
Footer (server component — no "use client")
├── Data (fetched at build time via async component):
│   ├── getRegionsWithCounts()  → 15 regions with course counts
│   ├── getTopRatedCourses(5)   → top 5 courses by Google rating
│   └── getTranslations("footer") → server-side i18n
├── 5-column grid layout:
│   ├── Brand (1.5fr)
│   ├── Regions grid (2fr) — 3-col sub-grid, all 15 regions with counts
│   ├── Popular courses (1fr) — top 5 with star ratings
│   ├── Navigation (1fr)
│   └── Legal (1fr) — includes CookieSettingsButton (client island)
├── Bottom bar — copyright + dynamic trust badge
└── Organization JSON-LD <script type="application/ld+json">
```

### Data Functions

**Existing:** `getRegionsWithCounts()` in `src/lib/courses.ts` — returns regions with course counts. No changes needed.

**New:** `getTopRatedCourses(n: number)` in `src/lib/courses.ts`

- Loads all courses via `getAllCourses()`
- Filters to courses that have a `ratings.google` entry
- Sorts by `ratings.google.rating` descending
- Returns top `n` courses (name, slug, region slug, Google rating)
- Return type: `{ name: string; slug: string; regionSlug: string; rating: number }[]`

### Server Component Migration

The current footer is `"use client"` because it uses `useTranslations()`. The redesign:

- Uses `getTranslations("footer")` (async, server-side) from next-intl
- The component becomes `async function Footer()`
- `CookieSettingsButton` remains `"use client"` — it's already a separate client component and works as a client island inside the server-rendered footer

## Layout

### Desktop (md and above)

5-column grid: `grid-cols-[1.5fr_2fr_1fr_1fr_1fr]`

| Brand | Regions (3-col sub-grid) | Popular Courses | Navigation | Legal |
| ----- | ------------------------ | --------------- | ---------- | ----- |

### Tablet (sm to md)

2-column grid:

- Row 1: Brand | Popular Courses
- Row 2: Regions grid (full width span, 3-col sub-grid)
- Row 3: Navigation | Legal

### Mobile (below sm)

Single column stack: Brand → Regions (2-col sub-grid) → Popular Courses → Navigation → Legal

### Bottom Bar

Desktop: flex row, copyright left, trust badge right.
Mobile: stacked, both centered.

## Column Content

### 1. Brand

- Site name: `golfkart.no` — `text-xl font-bold text-white`
- Description from `t("aboutDescription")` — `text-sm text-white/55`
- Stat badges: dynamic course count + region count — small inline badges with icons

### 2. Regions Grid

- Heading: `t("regionsTitle")` — uppercase label style
- 3-column sub-grid (2-col on mobile) listing all 15 regions
- Each region: link text + course count badge (e.g., "Akershus 18")
- Links use `<Link href={/regions page or /${regionSlug}}>` from `@/i18n/navigation`
- Count badges: `text-xs text-white/30 bg-white/5 rounded-full px-2`

### 3. Popular Courses

- Heading: `t("popularCoursesTitle")` — uppercase label style
- Top 5 courses, each showing: course name + star rating (e.g., "★ 4.7")
- Links use `<Link href={/${regionSlug}/${courseSlug}}>`
- Rating: `text-xs text-yellow-400`

### 4. Navigation

- Heading: `t("navigationTitle")` — uppercase label style
- Links: Alle golfbaner (`/regions`), Golfbanekart (`/kart`), Blogg (`/blog`), Om oss (`/about`), Kontakt (`/contact`)

### 5. Legal

- Heading: `t("legalTitle")` — uppercase label style
- Links: Personvern (`/privacy`), Bruksvilkår (`/terms`)
- `<CookieSettingsButton />` (client component island)

### Bottom Bar

- Left: `© {year} golfkart.no. Alle rettigheter reservert.`
- Right: Trust badge — `{courses} baner · {regions} fylker` with star icon

## Styling

All Tailwind utilities, no inline styles.

- **Background:** `bg-gradient-to-br from-green-900 to-green-950`
- **Container:** `mx-auto max-w-[1170px] px-4 py-12` (increased from py-10)
- **Section headings:** `text-xs font-bold uppercase tracking-wider text-white/50 mb-4`
- **Links:** `text-sm text-white/65 hover:text-white transition-colors`
- **Muted text:** `text-white/35`
- **Dividers:** `border-white/10`
- **Region count badges:** `text-xs text-white/30 bg-white/[0.06] px-2 py-0.5 rounded-full`

## Translation Keys

### New keys in `footer` namespace

| Key                   | nb.json                              | en.json                                 |
| --------------------- | ------------------------------------ | --------------------------------------- |
| `regionsTitle`        | `Golfbaner etter fylke`              | `Golf courses by region`                |
| `popularCoursesTitle` | `Populære golfbaner`                 | `Popular golf courses`                  |
| `allCourses`          | `Alle golfbaner`                     | `All golf courses`                      |
| `map`                 | `Golfbanekart`                       | `Golf course map`                       |
| `allRegions`          | `Alle fylker`                        | `All regions`                           |
| `badgeCourses`        | `{count} baner`                      | `{count} courses`                       |
| `badgeRegions`        | `{count} fylker`                     | `{count} regions`                       |
| `trustBadge`          | `{courses} baner · {regions} fylker` | `{courses} courses · {regions} regions` |

### Unchanged keys

`aboutTitle`, `aboutDescription`, `navigationTitle`, `legalTitle`, `regions`, `blog`, `about`, `contact`, `privacy`, `terms`, `cookieSettings`, `copyright`

## SEO

### Internal Linking

The footer appears on all ~400+ static pages. It adds:

- 15 region links (one per Norwegian county)
- 5 top-rated course links
- 5 navigation links (including map)
- Total: 25 internal links per page pointing to the site's most valuable content

### Schema.org Organization JSON-LD

Embedded as `<script type="application/ld+json">` inside the footer:

```json
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "golfkart.no",
  "url": "https://golfkart.no",
  "description": "Din komplette guide til golfbaner i Norge",
  "areaServed": {
    "@type": "Country",
    "name": "Norway"
  }
}
```

### Link Attributes

- All internal links: standard `<Link>` from `@/i18n/navigation` — proper locale prefixing and hreflang built-in
- No `rel="nofollow"` on any internal link
- No `target="_blank"` — all links stay in-site

## Accessibility

- `<footer>` element with implicit `contentinfo` role
- Each link group wrapped in `<nav aria-label="...">` for screen readers
- Section headings use `<h2>` elements (visually styled small/uppercase)
- All links have sufficient color contrast (white/65 on dark green passes WCAG AA)
- `hover:text-white` provides clear interactive feedback

## Files Changed

| File                               | Change                                                         |
| ---------------------------------- | -------------------------------------------------------------- |
| `src/components/layout/Footer.tsx` | Full rewrite — server component, 5-column layout, dynamic data |
| `src/lib/courses.ts`               | Add `getTopRatedCourses(n)` function                           |
| `messages/nb.json`                 | Add 6 new footer translation keys                              |
| `messages/en.json`                 | Add 6 new footer translation keys                              |

## Out of Scope

- Social media links (none exist for golfkart.no currently)
- Newsletter signup
- Dark/light mode footer variants (footer is always dark green)
- Footer changes to blog or course detail page layouts (footer is shared globally)
