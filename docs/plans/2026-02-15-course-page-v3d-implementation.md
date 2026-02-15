# Course Page V3d Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Replace the existing course page with the v3d editorial design featuring Playfair Display + Outfit fonts, cream/gold/forest green palette, and tabbed pricing.

**Architecture:** Create 7 new React components in `_components/`, add v3d-specific CSS variables and Tailwind colors, then refactor `page.tsx` to use the new components. Server-side rendering for most components, client component only for PricingTabs.

**Tech Stack:** Next.js 16, React, Tailwind CSS, next/font/google

---

## Task 1: Add V3d Fonts

**Files:**

- Modify: `src/app/layout.tsx`

**Step 1: Add Playfair Display and Outfit fonts**

Add imports and font configurations alongside existing Manrope font:

```tsx
import { Manrope, Playfair_Display, Outfit } from "next/font/google";

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
  weight: ["200", "300", "400", "600", "700"],
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
});
```

**Step 2: Add font variables to html className**

Update the html tag to include all font variables:

```tsx
<html
  lang="nb"
  data-theme="golf"
  className={`${manrope.variable} ${playfair.variable} ${outfit.variable} bg-background text-text-primary`}
>
```

**Step 3: Verify fonts load**

Run: `pnpm dev`

Open browser DevTools, check that `--font-playfair` and `--font-outfit` CSS variables are set on `<html>`.

**Step 4: Commit**

```bash
git add src/app/layout.tsx
git commit -m "feat: add Playfair Display and Outfit fonts for v3d design"
```

---

## Task 2: Add V3d Color Palette and CSS Variables

**Files:**

- Modify: `src/app/globals.css`
- Modify: `tailwind.config.mjs`

**Step 1: Add v3d CSS variables to globals.css**

Add after the existing `:root` block (before `[data-theme="dark"]`):

```css
/* V3d Editorial Theme - Course Pages */
.v3d {
  --v3d-cream: #fdfcf9;
  --v3d-warm: #f7f5f0;
  --v3d-accent: #e8e4db;
  --v3d-forest: #1e5631;
  --v3d-forest-light: #2d7a45;
  --v3d-forest-soft: #d4e5d8;
  --v3d-gold: #b8860b;
  --v3d-gold-light: #daa520;
  --v3d-border: #e0ddd5;
  --v3d-text-dark: #1a1a1a;
  --v3d-text-body: #3d3d3d;
  --v3d-text-muted: #767676;
  --v3d-text-light: #9a9a9a;

  --font-serif: var(--font-playfair);
  --font-sans: var(--font-outfit);
}
```

**Step 2: Add v3d colors to Tailwind config**

In `tailwind.config.mjs`, add inside `theme.extend.colors`:

```js
// V3d Editorial Theme
v3d: {
  cream: "var(--v3d-cream)",
  warm: "var(--v3d-warm)",
  accent: "var(--v3d-accent)",
  forest: "var(--v3d-forest)",
  "forest-light": "var(--v3d-forest-light)",
  "forest-soft": "var(--v3d-forest-soft)",
  gold: "var(--v3d-gold)",
  "gold-light": "var(--v3d-gold-light)",
  border: "var(--v3d-border)",
  "text-dark": "var(--v3d-text-dark)",
  "text-body": "var(--v3d-text-body)",
  "text-muted": "var(--v3d-text-muted)",
  "text-light": "var(--v3d-text-light)",
},
```

**Step 3: Add font-serif to Tailwind fontFamily**

In `tailwind.config.mjs`, update `theme.extend.fontFamily`:

```js
fontFamily: {
  sans: ["var(--font-sans)", "system-ui", "sans-serif"],
  serif: ["var(--font-serif)", "Georgia", "serif"],
  mono: ["var(--font-mono)", "monospace"],
},
```

**Step 4: Verify Tailwind compiles**

Run: `pnpm build`

Expected: Build succeeds with no errors.

**Step 5: Commit**

```bash
git add src/app/globals.css tailwind.config.mjs
git commit -m "feat: add v3d color palette and font variables"
```

---

## Task 3: Create CourseHero Component

**Files:**

- Create: `src/app/[region]/[course]/_components/CourseHero.tsx`

**Step 1: Create the CourseHero component**

```tsx
import type { Course, PlacePhoto } from "@/types/course";

interface RatingData {
  averageRating: number;
  totalReviews: number;
}

interface CourseHeroProps {
  course: Course;
  ratingData: RatingData | null;
  photos: PlacePhoto[];
}

function StarIcon({ filled }: { filled: boolean }) {
  return (
    <svg viewBox="0 0 24 24" className={`h-4 w-4 ${filled ? "fill-v3d-gold" : "fill-gray-300"}`}>
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
    </svg>
  );
}

export function CourseHero({ course, ratingData, photos }: CourseHeroProps) {
  const heroPhoto = photos[0];
  const accentPhoto = photos[1];

  return (
    <section className="mx-auto grid max-w-[1200px] gap-16 px-8 pb-16 pt-32 md:grid-cols-2 md:items-center">
      {/* Left: Content */}
      <div className="pr-8">
        {/* Eyebrow */}
        {course.course.yearBuilt && (
          <div className="text-v3d-gold mb-6 flex items-center gap-3 text-sm font-semibold uppercase tracking-widest">
            <span className="bg-v3d-gold h-px w-10" />
            Etablert {course.course.yearBuilt}
          </div>
        )}

        {/* Title */}
        <h1 className="text-v3d-text-dark mb-6 font-serif text-4xl font-medium leading-tight md:text-5xl">
          {course.name}
        </h1>

        {/* Subtitle */}
        {course.description && (
          <p className="text-v3d-text-muted mb-8 text-xl font-light">
            {course.description.split(".")[0]}.
          </p>
        )}

        {/* Rating Box */}
        {ratingData && (
          <div className="border-v3d-border bg-v3d-warm flex items-center gap-4 rounded-lg border p-6">
            <div className="text-v3d-forest font-serif text-4xl font-semibold">
              {ratingData.averageRating.toFixed(1)}
            </div>
            <div className="border-v3d-border border-l pl-4">
              <div className="mb-1 flex gap-0.5">
                {[1, 2, 3, 4, 5].map((star) => (
                  <StarIcon key={star} filled={star <= Math.round(ratingData.averageRating)} />
                ))}
              </div>
              <div className="text-v3d-text-muted text-sm">
                {ratingData.totalReviews.toLocaleString("no-NO")} anmeldelser på Google
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Right: Images */}
      <div className="relative">
        {/* Main Image */}
        <div className="border-v3d-border from-v3d-forest-soft to-v3d-accent flex aspect-[4/3] items-center justify-center overflow-hidden rounded-lg border border-dashed bg-gradient-to-br">
          {heroPhoto ? (
            <img src={heroPhoto.url} alt={course.name} className="h-full w-full object-cover" />
          ) : (
            <span className="text-v3d-text-muted text-sm">[ Hovedbilde – 800x600 ]</span>
          )}
        </div>

        {/* Accent Image */}
        <div className="border-v3d-border bg-v3d-warm absolute -bottom-8 -left-8 hidden aspect-[16/10] w-3/5 items-center justify-center overflow-hidden rounded-lg border shadow-lg md:flex">
          {accentPhoto ? (
            <img
              src={accentPhoto.url}
              alt={`${course.name} klubbhus`}
              className="h-full w-full object-cover"
            />
          ) : (
            <span className="text-v3d-text-light text-xs">[ Sekundærbilde – klubbhus ]</span>
          )}
        </div>
      </div>
    </section>
  );
}
```

**Step 2: Verify component compiles**

Run: `pnpm tsc --noEmit`

Expected: No type errors.

**Step 3: Commit**

```bash
git add "src/app/[region]/[course]/_components/CourseHero.tsx"
git commit -m "feat: add CourseHero component for v3d design"
```

---

## Task 4: Create StatsBar Component

**Files:**

- Create: `src/app/[region]/[course]/_components/StatsBar.tsx`

**Step 1: Create the StatsBar component**

```tsx
import type { Course } from "@/types/course";

interface StatsBarProps {
  course: Course;
}

const formatter = new Intl.NumberFormat("no-NO");

export function StatsBar({ course }: StatsBarProps) {
  const stats = [
    { value: course.course.holes, label: "Hull" },
    { value: course.course.par, label: "Par" },
    {
      value: course.course.lengthMeters
        ? `${formatter.format(course.course.lengthMeters)} m`
        : null,
      label: "Lengde",
    },
    { value: course.course.yearBuilt, label: "Bygget" },
    { value: course.course.terrain || course.course.courseType, label: "Banetype" },
    {
      value:
        course.season.start && course.season.end
          ? `${course.season.start}–${course.season.end}`
          : null,
      label: "Sesong",
    },
  ].filter((stat) => stat.value != null);

  if (stats.length === 0) return null;

  return (
    <div className="bg-v3d-forest mt-16 py-8 text-white">
      <div className="mx-auto flex max-w-[1200px] flex-wrap justify-between gap-6 px-8">
        {stats.map((stat, index) => (
          <div
            key={stat.label}
            className="text-center"
            style={{ animationDelay: `${index * 0.05}s` }}
          >
            <div className="mb-1 font-serif text-3xl font-semibold">{stat.value}</div>
            <div className="text-xs uppercase tracking-widest opacity-80">{stat.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
```

**Step 2: Verify component compiles**

Run: `pnpm tsc --noEmit`

Expected: No type errors.

**Step 3: Commit**

```bash
git add "src/app/[region]/[course]/_components/StatsBar.tsx"
git commit -m "feat: add StatsBar component for v3d design"
```

---

## Task 5: Create StorySection Component

**Files:**

- Create: `src/app/[region]/[course]/_components/StorySection.tsx`

**Step 1: Create the StorySection component**

```tsx
import type { Course, PlacePhoto } from "@/types/course";

interface StorySectionProps {
  course: Course;
  photos: PlacePhoto[];
}

export function StorySection({ course, photos }: StorySectionProps) {
  if (!course.description) return null;

  // Split description into lead (first sentence) and rest
  const sentences = course.description.split(/(?<=\.)\s+/);
  const lead = sentences[0];
  const rest = sentences.slice(1).join(" ");

  // Get gallery photos (skip first 2 used in hero)
  const galleryPhotos = photos.slice(2, 5);

  return (
    <section className="mx-auto max-w-[1200px] px-8 py-20">
      <div className="grid gap-16 md:grid-cols-2">
        {/* Left: Story Content */}
        <div>
          {/* Section Header */}
          <div className="mb-8 flex items-baseline gap-4">
            <span className="text-v3d-accent font-serif text-6xl font-normal">01</span>
            <h2 className="text-v3d-text-dark font-serif text-2xl font-medium">Historien</h2>
          </div>

          {/* Lead Paragraph */}
          <p className="border-v3d-gold text-v3d-text-dark mb-8 border-l-[3px] pl-6 text-xl font-light leading-relaxed">
            {lead}
          </p>

          {/* Rest of Description */}
          {rest && (
            <div className="text-v3d-text-body space-y-6 text-lg leading-relaxed">
              {rest.split(/\n\n/).map((paragraph, i) => (
                <p key={i}>{paragraph}</p>
              ))}
            </div>
          )}
        </div>

        {/* Right: Gallery */}
        <div className="grid grid-cols-2 gap-4">
          {/* Large image spanning 2 columns */}
          <div className="border-v3d-border bg-v3d-warm col-span-2 flex aspect-[2/1] items-center justify-center overflow-hidden rounded-lg border border-dashed">
            {galleryPhotos[0] ? (
              <img
                src={galleryPhotos[0].url}
                alt="Banen fra luften"
                className="h-full w-full object-cover"
              />
            ) : (
              <span className="text-v3d-text-light text-xs">
                [ Galleribilde 1 – Banen fra luften ]
              </span>
            )}
          </div>

          {/* Two smaller images */}
          <div className="border-v3d-border bg-v3d-warm flex aspect-square items-center justify-center overflow-hidden rounded-lg border border-dashed">
            {galleryPhotos[1] ? (
              <img src={galleryPhotos[1].url} alt="Hull" className="h-full w-full object-cover" />
            ) : (
              <span className="text-v3d-text-light text-xs">[ Hull 14 ]</span>
            )}
          </div>
          <div className="border-v3d-border bg-v3d-warm flex aspect-square items-center justify-center overflow-hidden rounded-lg border border-dashed">
            {galleryPhotos[2] ? (
              <img
                src={galleryPhotos[2].url}
                alt="Klubbhuset"
                className="h-full w-full object-cover"
              />
            ) : (
              <span className="text-v3d-text-light text-xs">[ Klubbhuset ]</span>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
```

**Step 2: Verify component compiles**

Run: `pnpm tsc --noEmit`

Expected: No type errors.

**Step 3: Commit**

```bash
git add "src/app/[region]/[course]/_components/StorySection.tsx"
git commit -m "feat: add StorySection component for v3d design"
```

---

## Task 6: Create FeaturesGrid Component

**Files:**

- Create: `src/app/[region]/[course]/_components/FeaturesGrid.tsx`

**Step 1: Create the FeaturesGrid component**

```tsx
import type { Facilities } from "@/types/course";

interface FeaturesGridProps {
  facilities: Facilities | null;
  winterUse: string | null;
}

interface FeatureGroup {
  icon: string;
  title: string;
  items: string[];
}

function buildFeatureGroups(facilities: Facilities | null): FeatureGroup[] {
  if (!facilities) return [];

  const groups: FeatureGroup[] = [];

  // Training
  const training: string[] = [];
  if (facilities.drivingRange) {
    const length = facilities.drivingRangeLength ? ` (${facilities.drivingRangeLength} m)` : "";
    training.push(`Driving Range${length}`);
  }
  if (facilities.puttingGreen) training.push("Putting Green");
  if (facilities.chippingArea) training.push("Chipping Area");
  if (facilities.practiceBunker) training.push("Practice Bunker");
  if (training.length) {
    groups.push({ icon: "🏌️", title: "Treningsfasiliteter", items: training });
  }

  // Clubhouse
  const clubhouse: string[] = [];
  if (facilities.clubhouse) clubhouse.push(facilities.clubhouseName || "Klubbhus");
  if (facilities.proShop) clubhouse.push("Pro Shop");
  if (facilities.restaurant) {
    clubhouse.push(
      facilities.restaurantName ? `Restaurant – ${facilities.restaurantName}` : "Restaurant",
    );
  }
  if (facilities.lockerRooms) clubhouse.push("Garderoberom");
  if (facilities.conferenceRoom) clubhouse.push("Konferanserom");
  if (clubhouse.length) {
    groups.push({ icon: "🏠", title: "Klubbhus", items: clubhouse });
  }

  // Services
  const services: string[] = [];
  if (facilities.clubRental) services.push("Klubb-leie");
  if (facilities.cartRental) services.push("Golfbil-leie");
  if (facilities.pullCartRental) services.push("Tralle-leie");
  if (facilities.golfLessons) services.push("Golf-timer");
  if (facilities.teachingPro) services.push("Teaching Pro");
  if (facilities.simulator) {
    services.push(
      facilities.simulatorType ? `Simulator – ${facilities.simulatorType}` : "Simulator",
    );
  }
  if (services.length) {
    groups.push({ icon: "⛳", title: "Tjenester", items: services });
  }

  return groups;
}

export function FeaturesGrid({ facilities, winterUse }: FeaturesGridProps) {
  const groups = buildFeatureGroups(facilities);

  if (groups.length === 0) return null;

  return (
    <section className="mx-auto max-w-[1200px] px-8 py-20">
      {/* Section Header */}
      <div className="mb-8 flex items-baseline gap-4">
        <span className="text-v3d-accent font-serif text-6xl font-normal">02</span>
        <h2 className="text-v3d-text-dark font-serif text-2xl font-medium">Fasiliteter</h2>
      </div>

      {/* Feature Cards */}
      <div className="grid gap-8 md:grid-cols-3">
        {groups.map((group, index) => (
          <div
            key={group.title}
            className="bg-v3d-warm hover:border-v3d-forest-soft rounded-lg border border-transparent p-8 transition-all hover:-translate-y-1 hover:shadow-lg"
          >
            {/* Icon */}
            <div className="bg-v3d-forest-soft mb-5 flex h-12 w-12 items-center justify-center rounded-xl text-2xl">
              {group.icon}
            </div>

            {/* Title */}
            <h3 className="text-v3d-text-dark mb-3 font-serif text-xl font-medium">
              {group.title}
            </h3>

            {/* Items */}
            <ul className="text-v3d-text-muted space-y-2">
              {group.items.map((item) => (
                <li
                  key={item}
                  className="border-v3d-border flex items-center gap-2 border-b pb-2 last:border-b-0"
                >
                  <span className="text-v3d-forest">✓</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* Winter Use Note */}
      {winterUse && (
        <div className="border-v3d-border mt-8 border-t pt-6">
          <h3 className="text-v3d-text-dark mb-3 font-semibold">Vinter</h3>
          <div className="text-v3d-text-muted flex gap-2">
            <span className="text-v3d-forest">✓</span>
            <span>{winterUse}</span>
          </div>
        </div>
      )}
    </section>
  );
}
```

**Step 2: Verify component compiles**

Run: `pnpm tsc --noEmit`

Expected: No type errors.

**Step 3: Commit**

```bash
git add "src/app/[region]/[course]/_components/FeaturesGrid.tsx"
git commit -m "feat: add FeaturesGrid component for v3d design"
```

---

## Task 7: Create PricingTabs Component (Client)

**Files:**

- Create: `src/app/[region]/[course]/_components/PricingTabs.tsx`

**Step 1: Create the PricingTabs client component**

```tsx
"use client";

import { useState } from "react";
import type { Pricing, MembershipTier, MembershipStatus } from "@/types/course";

interface PricingTabsProps {
  pricing: Pricing | null;
  pricingYear: string | null;
  memberships: MembershipTier[];
  membershipStatus: MembershipStatus | null;
}

const formatter = new Intl.NumberFormat("no-NO");

type TabId = "greenfee" | "medlemskap" | "utstyr";

export function PricingTabs({
  pricing,
  pricingYear,
  memberships,
  membershipStatus,
}: PricingTabsProps) {
  const [activeTab, setActiveTab] = useState<TabId>("greenfee");

  // Determine which tabs to show
  const hasGreenfee =
    pricing && (pricing.greenFee18 || pricing.greenFeeWeekday || pricing.greenFee9);
  const hasMembership = memberships.length > 0 || membershipStatus;
  const hasEquipment =
    pricing && (pricing.cartRental || pricing.pullCartRental || pricing.clubRental);

  if (!hasGreenfee && !hasMembership && !hasEquipment) return null;

  const tabs: { id: TabId; label: string; show: boolean }[] = [
    { id: "greenfee", label: "Greenfee", show: !!hasGreenfee },
    { id: "medlemskap", label: "Medlemskap", show: !!hasMembership },
    { id: "utstyr", label: "Utstyr", show: !!hasEquipment },
  ];

  const visibleTabs = tabs.filter((t) => t.show);

  return (
    <section className="mx-auto max-w-[1200px] px-8 py-20">
      <div className="bg-v3d-warm -mx-8 rounded-2xl px-8 py-12 md:px-16">
        {/* Section Header */}
        <div className="mb-8 flex items-baseline gap-4">
          <span className="text-v3d-accent font-serif text-6xl font-normal">03</span>
          <h2 className="text-v3d-text-dark font-serif text-2xl font-medium">
            Priser {pricingYear || new Date().getFullYear()}
          </h2>
        </div>

        {/* Tabs */}
        <div className="border-v3d-border mb-8 flex gap-2 border-b pb-2">
          {visibleTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`relative rounded-t-md px-6 py-3 text-sm font-medium transition-all ${
                activeTab === tab.id
                  ? "bg-v3d-forest-soft text-v3d-forest"
                  : "text-v3d-text-muted hover:text-v3d-text-dark"
              }`}
            >
              {tab.label}
              {activeTab === tab.id && (
                <span className="bg-v3d-forest absolute -bottom-2 left-0 right-0 h-0.5" />
              )}
            </button>
          ))}
        </div>

        {/* Greenfee Panel */}
        {activeTab === "greenfee" && pricing && (
          <div className="grid gap-8 md:grid-cols-2">
            {/* Standard */}
            <div className="border-v3d-border bg-v3d-cream rounded-xl border p-8">
              <h3 className="border-v3d-border mb-6 border-b pb-4 font-serif text-xl font-medium">
                Standard
              </h3>
              <div className="space-y-3">
                {(pricing.greenFee18 || pricing.greenFeeWeekday) && (
                  <div className="border-v3d-border flex justify-between border-b pb-3">
                    <span className="text-v3d-text-muted">18 hull</span>
                    <span className="text-v3d-forest font-semibold">
                      {formatter.format(pricing.greenFee18 ?? pricing.greenFeeWeekday ?? 0)} kr
                    </span>
                  </div>
                )}
                {pricing.greenFee9 && (
                  <div className="border-v3d-border flex justify-between border-b pb-3">
                    <span className="text-v3d-text-muted">9 hull</span>
                    <span className="text-v3d-forest font-semibold">
                      {formatter.format(pricing.greenFee9)} kr
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Discounted */}
            <div className="border-v3d-border bg-v3d-cream rounded-xl border p-8">
              <h3 className="border-v3d-border mb-6 border-b pb-4 font-serif text-xl font-medium">
                Rabattert
              </h3>
              <div className="space-y-3">
                {pricing.greenFeeJunior && (
                  <div className="border-v3d-border flex justify-between border-b pb-3">
                    <span className="text-v3d-text-muted">Junior (under 18)</span>
                    <span className="text-v3d-forest font-semibold">
                      {formatter.format(pricing.greenFeeJunior)} kr
                    </span>
                  </div>
                )}
                {pricing.greenFeeTwilight && (
                  <div className="border-v3d-border flex justify-between border-b pb-3">
                    <span className="text-v3d-text-muted">
                      Kveld
                      {pricing.twilightStartTime ? ` (etter ${pricing.twilightStartTime})` : ""}
                    </span>
                    <span className="text-v3d-forest font-semibold">
                      {formatter.format(pricing.greenFeeTwilight)} kr
                    </span>
                  </div>
                )}
                {pricing.greenFeeSenior && (
                  <div className="border-v3d-border flex justify-between border-b pb-3">
                    <span className="text-v3d-text-muted">Senior</span>
                    <span className="text-v3d-forest font-semibold">
                      {formatter.format(pricing.greenFeeSenior)} kr
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Medlemskap Panel */}
        {activeTab === "medlemskap" && (
          <div className="grid gap-8 md:grid-cols-2">
            {/* Membership Prices */}
            {memberships.length > 0 && (
              <div className="border-v3d-border bg-v3d-cream rounded-xl border p-8">
                <h3 className="border-v3d-border mb-6 border-b pb-4 font-serif text-xl font-medium">
                  Medlemskap
                </h3>
                <div className="space-y-3">
                  {memberships.map((m, i) => (
                    <div
                      key={i}
                      className="border-v3d-border flex justify-between border-b pb-3 last:border-b-0"
                    >
                      <span className="text-v3d-text-muted">{m.name || m.category}</span>
                      <span className="text-v3d-forest font-semibold">
                        {formatter.format(m.totalAnnual ?? m.price)} kr/år
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Status */}
            {membershipStatus && (
              <div className="border-v3d-border bg-v3d-cream rounded-xl border p-8">
                <h3 className="border-v3d-border mb-6 border-b pb-4 font-serif text-xl font-medium">
                  Status
                </h3>
                <div className="space-y-3">
                  {membershipStatus.waitingListSize && (
                    <div className="border-v3d-border flex justify-between border-b pb-3">
                      <span className="text-v3d-text-muted">Venteliste</span>
                      <span className="text-v3d-forest font-semibold">
                        ~{formatter.format(membershipStatus.waitingListSize)} personer
                      </span>
                    </div>
                  )}
                  <div className="border-v3d-border flex justify-between border-b pb-3">
                    <span className="text-v3d-text-muted">Opptak</span>
                    <span className="text-v3d-forest font-semibold">
                      {membershipStatus.status === "open"
                        ? "Åpent"
                        : membershipStatus.status === "waitlist"
                          ? "Venteliste"
                          : "Stengt"}
                    </span>
                  </div>
                  {membershipStatus.waitingListYears && (
                    <div className="flex justify-between">
                      <span className="text-v3d-text-muted">Ventetid</span>
                      <span className="text-v3d-forest font-semibold">
                        Ca. {membershipStatus.waitingListYears} år
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Utstyr Panel */}
        {activeTab === "utstyr" && pricing && (
          <div className="grid gap-8 md:grid-cols-2">
            <div className="border-v3d-border bg-v3d-cream rounded-xl border p-8">
              <h3 className="border-v3d-border mb-6 border-b pb-4 font-serif text-xl font-medium">
                Utleie
              </h3>
              <div className="space-y-3">
                {pricing.cartRental && (
                  <div className="border-v3d-border flex justify-between border-b pb-3">
                    <span className="text-v3d-text-muted">Golfbil (18 hull)</span>
                    <span className="text-v3d-forest font-semibold">
                      {formatter.format(pricing.cartRental)} kr
                    </span>
                  </div>
                )}
                {pricing.pullCartRental && (
                  <div className="border-v3d-border flex justify-between border-b pb-3">
                    <span className="text-v3d-text-muted">Tralle</span>
                    <span className="text-v3d-forest font-semibold">
                      {formatter.format(pricing.pullCartRental)} kr
                    </span>
                  </div>
                )}
                {pricing.clubRental && (
                  <div className="flex justify-between">
                    <span className="text-v3d-text-muted">Klubber (sett)</span>
                    <span className="text-v3d-forest font-semibold">
                      {formatter.format(pricing.clubRental)} kr
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
```

**Step 2: Verify component compiles**

Run: `pnpm tsc --noEmit`

Expected: No type errors.

**Step 3: Commit**

```bash
git add "src/app/[region]/[course]/_components/PricingTabs.tsx"
git commit -m "feat: add PricingTabs client component for v3d design"
```

---

## Task 8: Create ContactSection Component

**Files:**

- Create: `src/app/[region]/[course]/_components/ContactSection.tsx`

**Step 1: Create the ContactSection component**

```tsx
import type { Course } from "@/types/course";
import { WeatherWidget } from "./WeatherWidget";

interface ContactSectionProps {
  course: Course;
}

export function ContactSection({ course }: ContactSectionProps) {
  const addressLines = [
    [course.address.street, course.address.area].filter(Boolean).join(", "),
    `${course.address.postalCode} ${course.city}`,
  ].filter(Boolean);

  const primaryPhone = course.phoneNumbers[0];

  return (
    <section className="mx-auto max-w-[1200px] px-8 py-20">
      {/* Section Header */}
      <div className="mb-8 flex items-baseline gap-4">
        <span className="text-v3d-accent font-serif text-6xl font-normal">04</span>
        <h2 className="text-v3d-text-dark font-serif text-2xl font-medium">Finn oss</h2>
      </div>

      <div className="grid gap-12 md:grid-cols-[1.5fr_1fr]">
        {/* Left: Map */}
        <div className="border-v3d-border bg-v3d-warm overflow-hidden rounded-xl border">
          {/* Map Embed */}
          {course.coordinates ? (
            <iframe
              src={`https://www.google.com/maps?q=${course.coordinates.lat},${course.coordinates.lng}&hl=no&z=14&output=embed`}
              className="h-[300px] w-full border-0"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          ) : (
            <div className="from-v3d-warm to-v3d-accent text-v3d-text-light flex h-[300px] items-center justify-center bg-gradient-to-br">
              [ Google Maps embed ]
            </div>
          )}

          {/* Address */}
          <div className="p-6">
            <div className="mb-4">
              <strong className="text-v3d-text-dark block font-serif text-xl font-medium">
                {course.address.street || course.name}
              </strong>
              {addressLines.map((line, i) => (
                <span key={i} className="text-v3d-text-body block">
                  {line}
                </span>
              ))}
            </div>

            {course.coordinates && (
              <a
                href={`https://www.google.com/maps/dir/?api=1&destination=${course.coordinates.lat},${course.coordinates.lng}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-v3d-forest inline-flex items-center gap-2 font-medium transition-all hover:gap-3"
              >
                Få veibeskrivelse →
              </a>
            )}
          </div>
        </div>

        {/* Right: Contact Cards + Weather */}
        <div className="space-y-4">
          {/* Contact Card */}
          <div className="border-v3d-border bg-v3d-warm rounded-xl border p-6">
            <h3 className="text-v3d-text-dark mb-6 font-serif text-xl font-medium">Kontakt oss</h3>

            <div className="space-y-4">
              {/* Phone */}
              {primaryPhone && (
                <div className="border-v3d-border flex items-center gap-4 border-b pb-4">
                  <div className="bg-v3d-forest-soft flex h-10 w-10 items-center justify-center rounded-lg">
                    📱
                  </div>
                  <div>
                    <small className="text-v3d-text-light block text-xs uppercase tracking-wider">
                      Telefon
                    </small>
                    <a href={`tel:${primaryPhone.number}`} className="text-v3d-forest font-medium">
                      {primaryPhone.number}
                    </a>
                  </div>
                </div>
              )}

              {/* Email */}
              {course.contact.email && (
                <div className="border-v3d-border flex items-center gap-4 border-b pb-4">
                  <div className="bg-v3d-forest-soft flex h-10 w-10 items-center justify-center rounded-lg">
                    ✉️
                  </div>
                  <div>
                    <small className="text-v3d-text-light block text-xs uppercase tracking-wider">
                      E-post
                    </small>
                    <a
                      href={`mailto:${course.contact.email}`}
                      className="text-v3d-forest font-medium"
                    >
                      {course.contact.email}
                    </a>
                  </div>
                </div>
              )}

              {/* Website */}
              {course.contact.website && (
                <div className="flex items-center gap-4">
                  <div className="bg-v3d-forest-soft flex h-10 w-10 items-center justify-center rounded-lg">
                    🌐
                  </div>
                  <div>
                    <small className="text-v3d-text-light block text-xs uppercase tracking-wider">
                      Nettside
                    </small>
                    <a
                      href={course.contact.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-v3d-forest font-medium"
                    >
                      {course.contact.website.replace(/^https?:\/\//, "")}
                    </a>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Weather Widget */}
          {course.coordinates && (
            <div className="from-v3d-forest to-v3d-forest-light rounded-xl bg-gradient-to-br p-6 text-white">
              <h4 className="mb-4 text-xs uppercase tracking-widest opacity-80">Været på banen</h4>
              <WeatherWidget lat={course.coordinates.lat} lng={course.coordinates.lng} />
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
```

**Step 2: Verify component compiles**

Run: `pnpm tsc --noEmit`

Expected: No type errors.

**Step 3: Commit**

```bash
git add "src/app/[region]/[course]/_components/ContactSection.tsx"
git commit -m "feat: add ContactSection component for v3d design"
```

---

## Task 9: Create NearbyCoursesGrid Component

**Files:**

- Create: `src/app/[region]/[course]/_components/NearbyCoursesGrid.tsx`

**Step 1: Create the NearbyCoursesGrid component**

```tsx
import Link from "next/link";
import type { Course } from "@/types/course";
import { toRegionSlug } from "@/lib/constants/norway-regions";
import { calculateAverageRating } from "@/lib/courses";

interface NearbyCoursesGridProps {
  courses: Array<{
    course: Course;
    distanceKm: number | null;
  }>;
}

export function NearbyCoursesGrid({ courses }: NearbyCoursesGridProps) {
  if (courses.length === 0) return null;

  return (
    <section className="mx-auto max-w-[1200px] px-8 py-20">
      {/* Section Header */}
      <div className="mb-8 flex items-baseline gap-4">
        <span className="text-v3d-accent font-serif text-6xl font-normal">05</span>
        <h2 className="text-v3d-text-dark font-serif text-2xl font-medium">Nærliggende baner</h2>
      </div>

      {/* Course Cards */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {courses.map(({ course, distanceKm }) => {
          const ratingData = calculateAverageRating(course.ratings);

          return (
            <Link
              key={course.slug}
              href={`/${toRegionSlug(course.region)}/${course.slug}`}
              className="border-v3d-border bg-v3d-warm group overflow-hidden rounded-xl border transition-all hover:-translate-y-1 hover:shadow-lg"
            >
              {/* Image Placeholder */}
              <div className="bg-v3d-accent text-v3d-text-light flex h-[120px] items-center justify-center text-xs">
                [ Bilde ]
              </div>

              {/* Content */}
              <div className="p-5">
                <h3 className="text-v3d-text-dark group-hover:text-v3d-forest mb-1 font-serif text-lg font-medium">
                  {course.name}
                </h3>
                <div className="text-v3d-text-muted flex gap-3 text-sm">
                  <span>{course.course.holes} hull</span>
                  {ratingData && <span>⭐ {ratingData.averageRating.toFixed(1)}</span>}
                  {distanceKm && (
                    <span className="text-v3d-forest font-semibold">
                      {distanceKm.toFixed(1)} km
                    </span>
                  )}
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
```

**Step 2: Verify component compiles**

Run: `pnpm tsc --noEmit`

Expected: No type errors.

**Step 3: Commit**

```bash
git add "src/app/[region]/[course]/_components/NearbyCoursesGrid.tsx"
git commit -m "feat: add NearbyCoursesGrid component for v3d design"
```

---

## Task 10: Update WeatherWidget Styling

**Files:**

- Modify: `src/app/[region]/[course]/_components/WeatherWidget.tsx`

**Step 1: Read current WeatherWidget**

Check the current implementation to understand what needs updating.

**Step 2: Update to v3d styling**

The widget should output white text (since it's inside a green container). Update the component to use v3d-compatible styling with white text and remove any background colors (parent provides the background).

Key changes:

- Remove background color classes
- Use white text colors
- Use font-serif for temperature

**Step 3: Verify component compiles**

Run: `pnpm tsc --noEmit`

Expected: No type errors.

**Step 4: Commit**

```bash
git add "src/app/[region]/[course]/_components/WeatherWidget.tsx"
git commit -m "refactor: update WeatherWidget for v3d design"
```

---

## Task 11: Refactor page.tsx to Use V3d Components

**Files:**

- Modify: `src/app/[region]/[course]/page.tsx`

**Step 1: Add v3d class wrapper and import new components**

At the top, add imports for the new components:

```tsx
import { CourseHero } from "./_components/CourseHero";
import { StatsBar } from "./_components/StatsBar";
import { StorySection } from "./_components/StorySection";
import { FeaturesGrid } from "./_components/FeaturesGrid";
import { PricingTabs } from "./_components/PricingTabs";
import { ContactSection } from "./_components/ContactSection";
import { NearbyCoursesGrid } from "./_components/NearbyCoursesGrid";
```

**Step 2: Replace page JSX with new structure**

Replace the return statement with:

```tsx
return (
  <div className="v3d bg-v3d-cream text-v3d-text-body font-sans">
    {/* JSON-LD Structured Data */}
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
    />

    {/* Navigation - keep existing */}
    <nav className="border-v3d-border bg-v3d-cream/95 fixed left-0 right-0 top-0 z-50 border-b backdrop-blur-sm">
      <div className="mx-auto flex max-w-[1200px] items-center justify-between px-8 py-4">
        <div className="text-v3d-text-muted text-sm">
          <Link href="/" className="hover:text-v3d-forest">
            Hjem
          </Link>
          <span className="mx-2">/</span>
          <Link href={`/${toRegionSlug(course.region)}`} className="hover:text-v3d-forest">
            {course.region}
          </Link>
          <span className="mx-2">/</span>
          <span className="text-v3d-text-dark">{course.name}</span>
        </div>
        <div className="flex gap-4">
          <button className="border-v3d-border text-v3d-text-dark hover:border-v3d-forest hover:text-v3d-forest rounded border px-6 py-3 text-sm font-medium transition-colors">
            Kontakt
          </button>
          {bookingAction.type === "url" && bookingAction.value && (
            <a
              href={bookingAction.value}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-v3d-forest hover:bg-v3d-forest-light rounded px-6 py-3 text-sm font-medium text-white transition-colors"
            >
              Book starttid
            </a>
          )}
        </div>
      </div>
    </nav>

    {/* Hero */}
    <CourseHero course={course} ratingData={ratingData} photos={photos} />

    {/* Stats Bar */}
    <StatsBar course={course} />

    {/* Story Section */}
    <StorySection course={course} photos={photos} />

    {/* Features Grid */}
    <FeaturesGrid facilities={course.facilities} winterUse={course.season.winterUse} />

    {/* Pricing Tabs */}
    <PricingTabs
      pricing={pricing}
      pricingYear={pricingYear}
      memberships={memberships}
      membershipStatus={course.membershipStatus}
    />

    {/* Contact Section */}
    <ContactSection course={course} />

    {/* Nearby Courses */}
    <NearbyCoursesGrid
      courses={nearbyCoursesData.map(({ nearbyCourse, distanceKm }) => ({
        course: nearbyCourse,
        distanceKm,
      }))}
    />
  </div>
);
```

**Step 3: Keep existing data-fetching logic**

Keep these functions and variables:

- `calculateAverageRating()`
- `getPlacePhotos()`
- `generateStaticParams()`
- `generateMetadata()`
- `pricing`, `pricingYear`, `memberships`, `ratingData`, etc.

**Step 4: Remove old helper functions that are no longer needed**

Functions that can be removed:

- `buildFacilityGroups()` - moved to FeaturesGrid
- `InfoRow` component - no longer used
- `getPhoneTypeLabel()` - no longer used

**Step 5: Verify build succeeds**

Run: `pnpm build`

Expected: Build succeeds, all 168 course pages generated.

**Step 6: Commit**

```bash
git add "src/app/[region]/[course]/page.tsx"
git commit -m "feat: refactor course page to use v3d components"
```

---

## Task 12: Visual Testing

**Files:**

- None (manual testing)

**Step 1: Run dev server**

Run: `pnpm dev`

**Step 2: Test Oslo Golfklubb page**

Open: `http://localhost:3000/oslo/oslo-golfklubb`

Verify:

- [ ] Hero section renders with fonts (Playfair Display for title)
- [ ] Stats bar is green with white text
- [ ] Story section has gold border-left on lead paragraph
- [ ] Facilities show 3 cards in a row
- [ ] Pricing tabs switch between Greenfee/Medlemskap/Utstyr
- [ ] Contact section has map + contact cards + weather
- [ ] Nearby courses show 4 cards

**Step 3: Test edge case - course with minimal data**

Open: `http://localhost:3000/vestfold/veierland-golfklubb`

Verify:

- [ ] Missing sections are hidden gracefully
- [ ] No JavaScript errors in console

**Step 4: Test responsive behavior**

Resize browser to mobile width (<640px):

- [ ] Stats bar wraps
- [ ] Grids collapse to 1 column
- [ ] Hero accent image is hidden

**Step 5: Commit cleanup if needed**

```bash
git add -A
git commit -m "fix: polish v3d course page styling"
```

---

## Task 13: Delete Unused Components

**Files:**

- Delete: `src/app/[region]/[course]/_components/ExpandableDescription.tsx`
- Delete: `src/app/[region]/[course]/_components/ExpandableFeatures.tsx`

**Step 1: Remove unused component files**

```bash
rm "src/app/[region]/[course]/_components/ExpandableDescription.tsx"
rm "src/app/[region]/[course]/_components/ExpandableFeatures.tsx"
```

**Step 2: Verify no import errors**

Run: `pnpm tsc --noEmit`

Expected: No type errors.

**Step 3: Commit**

```bash
git add -A
git commit -m "chore: remove unused ExpandableDescription and ExpandableFeatures components"
```

---

## Summary

| Task | Description          | Files                                             |
| ---- | -------------------- | ------------------------------------------------- |
| 1    | Add fonts            | layout.tsx                                        |
| 2    | Add colors           | globals.css, tailwind.config.mjs                  |
| 3    | CourseHero           | CourseHero.tsx                                    |
| 4    | StatsBar             | StatsBar.tsx                                      |
| 5    | StorySection         | StorySection.tsx                                  |
| 6    | FeaturesGrid         | FeaturesGrid.tsx                                  |
| 7    | PricingTabs          | PricingTabs.tsx                                   |
| 8    | ContactSection       | ContactSection.tsx                                |
| 9    | NearbyCoursesGrid    | NearbyCoursesGrid.tsx                             |
| 10   | Update WeatherWidget | WeatherWidget.tsx                                 |
| 11   | Refactor page.tsx    | page.tsx                                          |
| 12   | Visual testing       | -                                                 |
| 13   | Delete unused        | ExpandableDescription.tsx, ExpandableFeatures.tsx |

Total: 13 tasks, ~13 commits
