# Footer Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the minimal 3-column footer with an SEO-optimized mega footer that links all 15 regions, surfaces top-rated courses, and uses dynamic data from JSON files.

**Architecture:** Convert Footer from a client component to an async server component. Add `getTopRatedCourses()` data function. Embed Organization JSON-LD. Use Tailwind utilities exclusively (no inline styles).

**Tech Stack:** Next.js 16 (App Router), TypeScript, Tailwind CSS, next-intl (server-side `getTranslations`), schema.org JSON-LD

**Spec:** `docs/superpowers/specs/2026-03-24-footer-redesign-design.md`

---

### Task 1: Add `getTopRatedCourses()` to courses.ts

**Files:**

- Modify: `src/lib/courses.ts:170-217` (add after `PopularCourse` interface, before `getFeaturedCourses`)

- [ ] **Step 1: Add the `TopRatedCourse` interface and `getTopRatedCourses` function**

Add this after the `PopularCourse` interface (line 181) in `src/lib/courses.ts`:

```typescript
export interface TopRatedCourse {
  name: string;
  slug: string;
  regionSlug: string;
  rating: number;
}

/**
 * Get top-rated courses by Google rating (for footer)
 */
export const getTopRatedCourses = cache((limit = 5): TopRatedCourse[] => {
  const courses = getAllCourses();
  const regionSlugs = getRegions();

  const results: TopRatedCourse[] = [];

  for (const course of courses) {
    const google = course.ratings?.google;
    if (!google?.rating || !google.reviewCount || google.reviewCount < 10) continue;

    const regionSlug =
      regionSlugs.find((r) => {
        const regionDir = path.join(COURSES_DIR, r);
        return fs.existsSync(path.join(regionDir, `${course.slug}.json`));
      }) || "";

    results.push({
      name: course.name,
      slug: course.slug,
      regionSlug,
      rating: google.rating,
    });
  }

  return results.sort((a, b) => b.rating - a.rating).slice(0, limit);
});
```

Note: The `reviewCount < 10` filter ensures we only surface courses with meaningful ratings, not 5.0 from 1 review.

- [ ] **Step 2: Verify build compiles**

Run: `pnpm build 2>&1 | head -20`
Expected: No TypeScript errors related to `getTopRatedCourses`

- [ ] **Step 3: Commit**

```bash
git add src/lib/courses.ts
git commit -m "feat(footer): add getTopRatedCourses data function"
```

---

### Task 2: Add translation keys to nb.json and en.json

**Files:**

- Modify: `messages/nb.json` (footer section, lines 14-27)
- Modify: `messages/en.json` (footer section, lines 14-27)

- [ ] **Step 1: Add new keys to nb.json footer section**

Add these keys to the `"footer"` object in `messages/nb.json`, after the existing `"cookieSettings"` key:

```json
"regionsTitle": "Golfbaner etter fylke",
"popularCoursesTitle": "Populære golfbaner",
"allCourses": "Alle golfbaner",
"map": "Golfbanekart",
"allRegions": "Alle fylker →",
"badgeCourses": "{count} baner",
"badgeRegions": "{count} fylker",
"trustBadge": "{courses} baner · {regions} fylker"
```

- [ ] **Step 2: Add new keys to en.json footer section**

Add these keys to the `"footer"` object in `messages/en.json`, after the existing `"cookieSettings"` key:

```json
"regionsTitle": "Golf courses by region",
"popularCoursesTitle": "Popular golf courses",
"allCourses": "All golf courses",
"map": "Golf course map",
"allRegions": "All regions →",
"badgeCourses": "{count} courses",
"badgeRegions": "{count} regions",
"trustBadge": "{courses} courses · {regions} regions"
```

- [ ] **Step 3: Verify JSON validity**

Run: `node -e "JSON.parse(require('fs').readFileSync('messages/nb.json','utf8')); console.log('nb.json OK')" && node -e "JSON.parse(require('fs').readFileSync('messages/en.json','utf8')); console.log('en.json OK')"`
Expected: Both print OK

- [ ] **Step 4: Commit**

```bash
git add messages/nb.json messages/en.json
git commit -m "feat(footer): add translation keys for mega footer"
```

---

### Task 3: Update CookieSettingsButton styling

**Files:**

- Modify: `src/components/cookie-consent/CookieSettingsButton.tsx`

- [ ] **Step 1: Replace inline HSL style with Tailwind classes**

In `src/components/cookie-consent/CookieSettingsButton.tsx`, replace the button element:

Old:

```tsx
<button
  onClick={openModal}
  className="transition-colors hover:text-white"
  style={{ color: "hsl(132, 30%, 70%)" }}
>
```

New:

```tsx
<button
  onClick={openModal}
  className="text-sm text-white/65 transition-colors hover:text-white"
>
```

- [ ] **Step 2: Commit**

```bash
git add src/components/cookie-consent/CookieSettingsButton.tsx
git commit -m "refactor(footer): replace inline HSL with Tailwind in CookieSettingsButton"
```

---

### Task 4: Rewrite Footer.tsx as async server component

**Files:**

- Modify: `src/components/layout/Footer.tsx` (full rewrite, 117 → ~160 lines)

This is the main task. The footer becomes an async server component that fetches data at build time.

- [ ] **Step 1: Write the new Footer component**

Replace the entire content of `src/components/layout/Footer.tsx` with:

```tsx
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { CookieSettingsButton } from "@/components/cookie-consent";
import { getRegionsWithCounts, getTopRatedCourses } from "@/lib/courses";
import { generateOrganizationSchema } from "@/lib/schema";

export async function Footer() {
  const t = await getTranslations("footer");
  const regions = getRegionsWithCounts();
  const topCourses = getTopRatedCourses(5);
  const totalCourses = regions.reduce((sum, r) => sum + r.count, 0);

  return (
    <footer className="bg-gradient-to-br from-green-900 to-green-950">
      <div className="mx-auto max-w-[1170px] px-4 py-12">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 md:grid-cols-[1.5fr_2fr_1fr_1fr_1fr]">
          {/* Brand */}
          <div>
            <h2 className="mb-3 text-xl font-bold text-white">golfkart.no</h2>
            <p className="mb-5 text-sm leading-relaxed text-white/55">{t("aboutDescription")}</p>
            <div className="flex flex-wrap gap-3">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/[0.06] px-3 py-1.5 text-xs text-white/45">
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="text-emerald-400"
                >
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 6v6l4 2" />
                </svg>
                {t("badgeCourses", { count: totalCourses })}
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/[0.06] px-3 py-1.5 text-xs text-white/45">
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="text-emerald-400"
                >
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
                {t("badgeRegions", { count: regions.length })}
              </span>
            </div>
          </div>

          {/* Regions Grid */}
          <nav aria-label={t("regionsTitle")}>
            <h2 className="mb-4 text-xs font-bold uppercase tracking-wider text-white/50">
              {t("regionsTitle")}
            </h2>
            <div className="grid grid-cols-2 gap-x-6 gap-y-0.5 md:grid-cols-3">
              {regions.map((region) => (
                <Link
                  key={region.slug}
                  href={`/${region.slug}`}
                  className="flex items-center justify-between py-1 text-[13px] text-white/60 transition-colors hover:text-white"
                >
                  {region.name}
                  <span className="rounded-full bg-white/[0.06] px-2 py-0.5 text-[11px] text-white/30">
                    {region.count}
                  </span>
                </Link>
              ))}
            </div>
          </nav>

          {/* Popular Courses */}
          <nav aria-label={t("popularCoursesTitle")}>
            <h2 className="mb-4 text-xs font-bold uppercase tracking-wider text-white/50">
              {t("popularCoursesTitle")}
            </h2>
            <ul className="space-y-1">
              {topCourses.map((course) => (
                <li key={course.slug}>
                  <Link
                    href={`/${course.regionSlug}/${course.slug}`}
                    className="flex items-center gap-2 py-1 text-sm text-white/65 transition-colors hover:text-white"
                  >
                    {course.name}
                    <span className="text-xs text-yellow-400">★ {course.rating.toFixed(1)}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Navigation */}
          <nav aria-label={t("navigationTitle")}>
            <h2 className="mb-4 text-xs font-bold uppercase tracking-wider text-white/50">
              {t("navigationTitle")}
            </h2>
            <ul className="space-y-1">
              <li>
                <Link
                  href="/regions"
                  className="block py-1 text-sm text-white/65 transition-colors hover:text-white"
                >
                  {t("allCourses")}
                </Link>
              </li>
              <li>
                <Link
                  href="/kart"
                  className="block py-1 text-sm text-white/65 transition-colors hover:text-white"
                >
                  {t("map")}
                </Link>
              </li>
              <li>
                <Link
                  href="/blog"
                  className="block py-1 text-sm text-white/65 transition-colors hover:text-white"
                >
                  {t("blog")}
                </Link>
              </li>
              <li>
                <Link
                  href="/about"
                  className="block py-1 text-sm text-white/65 transition-colors hover:text-white"
                >
                  {t("about")}
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="block py-1 text-sm text-white/65 transition-colors hover:text-white"
                >
                  {t("contact")}
                </Link>
              </li>
            </ul>
          </nav>

          {/* Legal */}
          <nav aria-label={t("legalTitle")}>
            <h2 className="mb-4 text-xs font-bold uppercase tracking-wider text-white/50">
              {t("legalTitle")}
            </h2>
            <ul className="space-y-1">
              <li>
                <Link
                  href="/privacy"
                  className="block py-1 text-sm text-white/65 transition-colors hover:text-white"
                >
                  {t("privacy")}
                </Link>
              </li>
              <li>
                <Link
                  href="/terms"
                  className="block py-1 text-sm text-white/65 transition-colors hover:text-white"
                >
                  {t("terms")}
                </Link>
              </li>
              <li>
                <CookieSettingsButton />
              </li>
            </ul>
          </nav>
        </div>

        {/* Bottom Bar */}
        <div className="mt-10 flex flex-col items-center justify-between gap-3 border-t border-white/10 pt-6 sm:flex-row">
          <p className="text-sm text-white/35">
            {t("copyright", { year: new Date().getFullYear() })}
          </p>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/[0.04] px-4 py-1.5 text-xs text-white/40">
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
            {t("trustBadge", { courses: totalCourses, regions: regions.length })}
          </span>
        </div>
      </div>

      {/* Organization JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(generateOrganizationSchema()),
        }}
      />
    </footer>
  );
}
```

Key changes from the old footer:

- Removed `"use client"` directive
- `async function Footer()` instead of regular function
- `getTranslations("footer")` (server) instead of `useTranslations("footer")` (client)
- Dynamic data from `getRegionsWithCounts()` and `getTopRatedCourses(5)`
- 5-column grid with responsive breakpoints
- All Tailwind utilities, no inline `style={}` attributes
- `<nav aria-label>` wrappers for accessibility
- `<h2>` headings for semantic structure
- Organization JSON-LD embedded
- Trust badge with dynamic course/region counts

- [ ] **Step 2: Verify the build compiles and static generation works**

Run: `pnpm build 2>&1 | tail -30`
Expected: Build succeeds. All ~400+ static pages generate without errors. The footer renders on every page.

If there are TypeScript errors, fix them before proceeding.

- [ ] **Step 3: Visual verification with dev server**

Run: `pnpm dev`
Check in browser:

1. Homepage footer shows all 15 regions with correct counts
2. Top 5 courses show with star ratings
3. All links work (regions, courses, navigation, legal)
4. Cookie settings button opens the modal
5. Responsive: resize to mobile — grid collapses properly
6. View page source — Organization JSON-LD is present

- [ ] **Step 4: Commit**

```bash
git add src/components/layout/Footer.tsx
git commit -m "feat(footer): rewrite as SEO-rich mega footer with dynamic data

- Convert from client to async server component
- Add all 15 region links with course counts
- Add top 5 rated courses with star ratings
- Replace inline HSL with Tailwind utilities
- Add Organization JSON-LD structured data
- Add aria-label nav regions for accessibility
- Dynamic trust badge with course/region counts"
```

---

### Task 5: Final verification and cleanup

**Files:**

- Verify: All modified files from previous tasks

- [ ] **Step 1: Run full build**

Run: `pnpm build`
Expected: Clean build with no warnings or errors related to footer.

- [ ] **Step 2: Run linter**

Run: `pnpm lint`
Expected: No linting errors in modified files.

- [ ] **Step 3: Check page source for JSON-LD**

Run: `pnpm build && pnpm start`
Then in browser, view source on homepage and search for `"@type":"Organization"`. Confirm the JSON-LD is present.

- [ ] **Step 4: Spot-check internal links**

In browser, click through:

- 3 different region links in the footer → each should load the correct region page
- 2 course links → each should load the correct course detail page
- Map link → should load /kart
- Privacy/Terms → should load correct pages
- Cookie settings → should open the consent modal

- [ ] **Step 5: Check English locale**

Navigate to `/en` and verify:

- Footer headings are in English
- Region names are Norwegian (they're proper nouns)
- "Popular golf courses" / "Golf courses by region" headings show correctly
- Trust badge shows English text
