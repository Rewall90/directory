# Course Page V3d Design

**Date:** 2026-02-15
**Status:** Approved
**Approach:** Incremental Refactor (Approach A)

## Overview

Implement the club-page-v3d.html mockup design as the new course page template for all 168 golf courses. The design features an editorial aesthetic with Playfair Display + Outfit fonts, a warm cream/gold/forest green color palette, and tabbed pricing.

## Design Decisions

- **Color scheme:** Use v3d colors (cream/gold/forest green). No dark mode for course pages.
- **Approach:** Create new React components matching v3d structure, reuse existing data-fetching logic.

---

## 1. Project Structure & Fonts

### Font Setup

Add Playfair Display + Outfit via `next/font/google` in layout. Create CSS variables:

- `--font-serif: 'Playfair Display'`
- `--font-sans: 'Outfit'`

### Color Palette (Tailwind extend)

```css
cream: #fdfcf9       /* bg-cream */
warm: #f7f5f0        /* bg-warm */
accent: #e8e4db      /* bg-accent */
forest: #1e5631      /* primary */
forest-light: #2d7a45
forest-soft: #d4e5d8
gold: #b8860b
gold-light: #daa520
border: #e0ddd5
text-dark: #1a1a1a
text-body: #3d3d3d
text-muted: #767676
text-light: #9a9a9a
```

### File Structure

```
src/app/[region]/[course]/
  page.tsx                    # Main page (simplified orchestrator)
  _components/
    CourseHero.tsx           # NEW - Hero with rating + images
    StatsBar.tsx             # NEW - Green stats bar
    StorySection.tsx         # NEW - Description + gallery
    FeaturesGrid.tsx         # NEW - 3 facility cards
    PricingTabs.tsx          # NEW - Tabbed pricing (client component)
    ContactSection.tsx       # NEW - Map + contact + weather
    NearbyCoursesGrid.tsx    # NEW - 4-card grid
    WeatherWidget.tsx        # KEEP - Restyle to match v3d
    RatingCard.tsx           # KEEP - May restyle
```

---

## 2. Component Breakdown

### CourseHero (Server Component)

- Eyebrow: "Etablert {yearBuilt}"
- H1: Course name
- Subtitle: Description excerpt (first sentence)
- Rating box: Score + stars + review count
- Hero image placeholder (uses Google Places photos if available)
- Accent image overlay

### StatsBar (Server Component)

- Full-width forest green background
- 6 stats: Hull, Par, Lengde, Bygget, Banetype, Sesong
- White text, serif numbers

### StorySection (Server Component)

- Section number "01" + "Historien" title
- Lead paragraph (styled with gold border-left)
- Full description text
- 3-image gallery grid (placeholder or Google photos)

### FeaturesGrid (Server Component)

- Section number "02" + "Fasiliteter" title
- 3 cards: Treningsfasiliteter, Klubbhus, Tjenester
- Reuses existing `buildFacilityGroups()` logic
- Each card has icon, title, checklist with checkmarks

### PricingTabs (Client Component)

- Section number "03" + "Priser {year}" title
- 3 tabs: Greenfee, Medlemskap, Utstyr
- Tab switching with useState, active state indicator
- Greenfee panel: Standard + Rabattert cards
- Medlemskap panel: Prices + Status (waitlist info)
- Utstyr panel: Cart, trolley, clubs, range balls

### ContactSection (Server Component)

- Section number "04" + "Finn oss" title
- Left column: Map iframe embed + address + directions link
- Right column: Contact cards (phone, email, website) + WeatherWidget

### NearbyCoursesGrid (Server Component)

- Section number "05" + "Naerliggende baner" title
- 4 cards in a row
- Each card: image placeholder, name, holes, rating, distance

---

## 3. Data Mapping

### CourseHero

| Mockup Element | Data Source                              |
| -------------- | ---------------------------------------- |
| Eyebrow year   | `course.course.yearBuilt`                |
| Title          | `course.name`                            |
| Subtitle       | `course.description` (truncated)         |
| Rating score   | `calculateAverageRating(course.ratings)` |
| Review count   | `ratingData.totalReviews`                |
| Hero image     | `getPlacePhotos()` or placeholder        |

### StatsBar

| Stat     | Data Source                                 |
| -------- | ------------------------------------------- |
| Hull     | `course.course.holes`                       |
| Par      | `course.course.par`                         |
| Lengde   | `course.course.lengthMeters` + "m"          |
| Bygget   | `course.course.yearBuilt`                   |
| Banetype | `course.course.terrain` or `courseType`     |
| Sesong   | `course.season.start` – `course.season.end` |

### PricingTabs

| Tab        | Data Source                                                                            |
| ---------- | -------------------------------------------------------------------------------------- |
| Greenfee   | `course.pricing[latestYear]` → greenFee18, greenFee9, greenFeeJunior, greenFeeTwilight |
| Medlemskap | `course.membershipPricing[currentYear]` + `course.membershipStatus`                    |
| Utstyr     | `course.pricing[latestYear]` → cartRental, pullCartRental, clubRental                  |

### ContactSection

| Element    | Data Source                    |
| ---------- | ------------------------------ |
| Map iframe | `course.coordinates.lat/lng`   |
| Address    | `course.address.*`             |
| Phone      | `course.phoneNumbers[0]`       |
| Email      | `course.contact.email`         |
| Website    | `course.contact.website`       |
| Weather    | `WeatherWidget` with `lat/lng` |

### NearbyCoursesGrid

- Source: `course.nearbyCourses.slice(0, 4)`
- Fetch full data via `getCourse(slug)` for each
- Display: name, holes, rating, distance

---

## 4. Migration & Edge Cases

### What Gets Removed

- Current hero section styling
- Current two-column layout (replaced by v3d single-column editorial flow)
- Current pricing card layout (replaced by tabs)
- `ExpandableDescription.tsx` - content moves to StorySection
- `ExpandableFeatures.tsx` - replaced by FeaturesGrid

### What Gets Kept

- `WeatherWidget.tsx` - restyle to match v3d
- `RatingCard.tsx` - may keep for individual platform ratings
- All data-fetching logic in `page.tsx`
- SEO structured data (JSON-LD)
- `generateStaticParams()` for SSG
- Breadcrumb navigation

### Edge Cases

| Scenario           | Handling                              |
| ------------------ | ------------------------------------- |
| No photos          | Show placeholder div with course name |
| No pricing data    | Hide PricingTabs section entirely     |
| No membership data | Hide Medlemskap tab                   |
| No coordinates     | Hide map, show address only           |
| No description     | Show shorter StorySection or hide     |
| < 4 nearby courses | Show however many exist               |

### Responsive Behavior

- Grid collapses: 4 → 2 → 1 columns
- Stats bar wraps on mobile
- Pricing tabs remain horizontal, scroll if needed
- Hero image accent hides on mobile

---

## Reference

- Mockup file: `mockups/club-page-v3d.html`
- Current page: `src/app/[region]/[course]/page.tsx`
- Course type: `src/types/course.ts`
