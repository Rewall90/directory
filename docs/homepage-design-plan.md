# Golf Directory Homepage Design Plan

**Reference:** GolfNow Course Directory (https://www.golfnow.com/course-directory/us)

**Goal:** Create a clean, professional landing page for browsing golf courses by region (Norway-focused)

---

## Visual Design Overview

The GolfNow course directory page uses a **clean, map-centric design** with clear navigation hierarchy. The page is simple and functional, focused on helping users quickly find courses by location.

### Color Scheme

- **Primary Link Color:** `#005F8F` (Deep blue)
- **Text Color:** `#222222` (Dark gray)
- **Background:** `#FFFFFF` (White)
- **Hero Overlay:** Semi-transparent for readability

### Typography

- **Headings:** Poppins, sans-serif
  - H1: 24px
- **Body Text:** Nunito Sans, sans-serif (or use Geist Sans from current setup)
  - Body: 16px
  - State links: 14px

---

## Page Structure (Top to Bottom)

### 1. Hero Section

**Height:** ~400-415px
**Design:**

- Full-width background image showing iconic Norwegian landscape or golf course
- Image should use `background-size: cover` and `background-position: center`
- Subtle dark overlay for text readability (optional)
- No text on hero (keeps it clean like GolfNow)

**Suggested images:**

- Norwegian golf course with mountain backdrop
- Scenic coastal golf course
- Iconic Norwegian landscape (fjords, mountains)

**Implementation:**

```tsx
<section className="relative h-[415px] w-full">
  <Image
    src="/images/norway-golf-hero.jpg"
    alt="Golf courses in Norway"
    fill
    className="object-cover object-center"
    priority
  />
</section>
```

---

### 2. Breadcrumb Navigation

**Position:** Below hero, inside container
**Design:** Simple text links separated by "/"

**Example:**

```
Course Directory / Norway
```

**Implementation:**

```tsx
<nav className="container mx-auto px-4 py-3">
  <div className="text-sm text-gray-600">
    <Link href="/courses">Course Directory</Link>
    <span className="mx-2">/</span>
    <span>Norway</span>
  </div>
</nav>
```

---

### 3. Country/Region Selector

**Position:** Below breadcrumb
**Design:**

- Label: "View Country / Territory"
- Dropdown select with full border
- Padding: 15px 20px 15px 15px
- Full width on mobile, auto-width on desktop

**For Norway Version:**

- Initially show "Norway" as default
- Could expand to other Nordic countries later

**Implementation:**

```tsx
<div className="container mx-auto mb-6 px-4">
  <label className="mb-2 block text-sm">View Country / Territory</label>
  <select className="w-full rounded border border-gray-300 px-4 py-3 md:w-auto">
    <option value="norway">Norway</option>
    <option value="sweden">Sweden</option>
    <option value="denmark">Denmark</option>
  </select>
</div>
```

---

### 4. Main Heading & Description

**Design:**

- H1: "Golf Courses in Norway"
- Two paragraphs of description
- Margin bottom: 20px between paragraphs

**Example text:**

```
Golf Directory offers a complete listing of golf courses across Norway,
with detailed information and ratings.

Our golf course directory contains detailed information about XXX golf courses.
```

**Implementation:**

```tsx
<div className="container mx-auto mb-8 px-4">
  <h1 className="mb-4 text-2xl font-bold">Golf Courses in Norway</h1>
  <p className="mb-5 text-gray-700">
    Golf Directory offers a complete listing of golf courses across Norway, with detailed
    information and ratings.
  </p>
  <p className="mb-5 text-gray-700">
    Our golf course directory contains detailed information about {courseCount} golf courses.
  </p>
</div>
```

---

### 5. Interactive Map Section

**Design:**

- SVG map of Norway showing regions/counties
- Interactive hover states (darker fill on hover)
- Click to navigate to region
- Centered on page
- Map color: Deep navy blue `#0A2F4A`
- Borders: White strokes between regions

**Size:**

- Responsive - scales to container
- Max width: ~700px for optimal viewing

**For Norway:**

- Show all 11 counties (fylker)
- Each county clickable to filter courses

**Implementation Options:**

**Option A: Use existing SVG Norway map**

```tsx
<div className="container mx-auto mb-12 px-4">
  <div className="flex justify-center">
    <svg viewBox="0 0 600 800" className="w-full max-w-2xl">
      {/* Norway regions as paths with hover/click handlers */}
    </svg>
  </div>
</div>
```

**Option B: Use library like react-simple-maps**

```bash
pnpm add react-simple-maps
```

**Option C: Create clickable image map** (simpler initial approach)

---

### 6. Region/County List Grid

**Design:**

- Title: "COUNTY / REGION" (uppercase, gray)
- 5-column grid on desktop
- 2-column grid on tablet
- 1-column on mobile
- Each item: Region name + course count in parentheses
- Links in blue (#005F8F)
- Hover: underline

**Norwegian Counties (example):**

- Oslo (45)
- Viken (123)
- Innlandet (67)
- Vestfold og Telemark (89)
- Agder (34)
- Rogaland (56)
- Vestland (78)
- Møre og Romsdal (45)
- Trøndelag (67)
- Nordland (23)
- Troms og Finnmark (12)

**Implementation:**

```tsx
<div className="container mx-auto mb-12 px-4">
  <h2 className="mb-4 text-xs font-semibold uppercase text-gray-500">County / Region</h2>

  <div className="grid grid-cols-1 gap-4 md:grid-cols-3 lg:grid-cols-5">
    {regions.map((region) => (
      <Link
        key={region.slug}
        href={`/courses/${region.slug}`}
        className="text-sm text-blue-700 hover:underline"
      >
        {region.name} <span className="text-gray-600">({region.count})</span>
      </Link>
    ))}
  </div>
</div>
```

---

## Wireframe

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│                    HERO IMAGE (415px)                       │
│              [Norwegian Golf Course Photo]                  │
│                                                             │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  Course Directory / Norway                                  │
│                                                             │
│  View Country / Territory                                   │
│  [Norway ▼]                                                 │
│                                                             │
│  Golf Courses in Norway                                     │
│                                                             │
│  Golf Directory offers a complete listing of golf           │
│  courses across Norway, with detailed information.          │
│                                                             │
│  Our golf course directory contains detailed                │
│  information about XXX golf courses.                        │
│                                                             │
│                        ┌───┐                                │
│                    ┌───┤   ├───┐                            │
│                ┌───┤   └───┘   ├───┐                        │
│                │   └───────────┘   │                        │
│                │                   │                        │
│                │   NORWAY MAP      │                        │
│                │   (Interactive)   │                        │
│                │                   │                        │
│                └───────┬───────────┘                        │
│                        │                                    │
│                                                             │
│  COUNTY / REGION                                            │
│  ┌──────────────┬──────────────┬──────────────┐            │
│  │ Oslo (45)    │ Viken (123)  │ Innlandet    │            │
│  │              │              │ (67)         │            │
│  ├──────────────┼──────────────┼──────────────┤            │
│  │ Vestfold og  │ Agder (34)   │ Rogaland     │            │
│  │ Telemark(89) │              │ (56)         │            │
│  ├──────────────┼──────────────┼──────────────┤            │
│  │ Vestland(78) │ Møre og      │ Trøndelag    │            │
│  │              │ Romsdal (45) │ (67)         │            │
│  └──────────────┴──────────────┴──────────────┘            │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## Responsive Behavior

### Desktop (1024px+)

- Container max-width: 1170px
- Hero: Full width, 415px height
- Map: Centered, max-width 700px
- Region grid: 5 columns

### Tablet (768px - 1023px)

- Hero: Full width, 350px height
- Map: 80% width, centered
- Region grid: 3 columns

### Mobile (< 768px)

- Hero: Full width, 300px height
- Map: Full width (with padding)
- Region grid: 1 column
- Stack all elements vertically

---

## Components to Build

### 1. `HeroSection.tsx`

**Purpose:** Display hero image
**Props:**

- `imageUrl: string`
- `alt: string`

### 2. `Breadcrumb.tsx`

**Purpose:** Show navigation breadcrumb
**Props:**

- `items: { label: string, href?: string }[]`

### 3. `RegionSelector.tsx`

**Purpose:** Country/region dropdown
**Props:**

- `regions: Region[]`
- `selected: string`
- `onChange: (value: string) => void`

### 4. `InteractiveMap.tsx`

**Purpose:** Clickable Norway map
**Props:**

- `regions: Region[]`
- `onRegionClick: (slug: string) => void`

### 5. `RegionGrid.tsx`

**Purpose:** Grid of region links with counts
**Props:**

- `regions: { name: string, slug: string, count: number }[]`

---

## Data Structure

### Region Type

```typescript
interface Region {
  id: string;
  slug: string;
  name: string;
  courseCount: number;
  coordinates?: {
    lat: number;
    lng: number;
  };
}
```

### Page Data Fetching

```typescript
// app/page.tsx (or wherever homepage lives)
async function getRegionsWithCounts() {
  const regions = await prisma.course.groupBy({
    by: ["region"],
    _count: {
      id: true,
    },
  });

  return regions.map((r) => ({
    name: r.region,
    slug: slugify(r.region),
    count: r._count.id,
  }));
}
```

---

## Implementation Steps

### Phase 1: Basic Layout

1. Create hero section component with placeholder image
2. Add breadcrumb navigation
3. Build region selector dropdown
4. Add heading and description text
5. Style with Tailwind to match design

### Phase 2: Region List

1. Fetch regions from database (group by region/county)
2. Create RegionGrid component
3. Implement responsive grid (5/3/1 columns)
4. Add links to region detail pages
5. Display course counts

### Phase 3: Interactive Map

1. Find or create SVG map of Norway with regions
2. Build InteractiveMap component
3. Add hover states and click handlers
4. Connect to region filtering
5. Style map to match design (navy blue, white borders)

### Phase 4: Polish

1. Add loading states
2. Optimize images
3. Add meta tags for SEO
4. Test responsive design
5. Add animations/transitions (subtle)

---

## File Structure

```
src/
  app/
    page.tsx                    # Homepage
  components/
    home/
      HeroSection.tsx          # Hero image
      Breadcrumb.tsx           # Navigation breadcrumb
      RegionSelector.tsx       # Dropdown selector
      InteractiveMap.tsx       # Norway map
      RegionGrid.tsx           # Region list grid
  lib/
    queries/
      regions.ts               # Database queries for regions
```

---

## DaisyUI Components to Use

- **Breadcrumbs:** Use `breadcrumbs` component
- **Select:** Use `select` component with `select-bordered`
- **Links:** Use default link styling with custom hover states
- **Container:** Use existing Tailwind container utilities

---

## Key Differences from GolfNow

1. **Scope:** Norway-focused instead of US
2. **Map:** Norway map showing 11 counties instead of 50 US states
3. **Branding:** Use Golf Directory branding and "golf" theme
4. **Language:** Norwegian region names (with English option)
5. **Additional features:**
   - Could add "Featured Courses" section
   - Could add search bar above hero
   - Could add filters (holes, par, etc.)

---

## Assets Needed

1. **Hero Image:** High-quality Norwegian golf course photo (1920x415px minimum)
2. **Norway SVG Map:** Vector map with county boundaries
3. **Favicon/Logo:** Golf Directory branding

---

## Database Considerations

- Ensure `region` field in Course model matches Norwegian county names
- Consider adding `municipality` for more granular filtering
- May need to standardize region names:
  - Oslo
  - Viken
  - Innlandet
  - Vestfold og Telemark
  - Agder
  - Rogaland
  - Vestland
  - Møre og Romsdal
  - Trøndelag
  - Nordland
  - Troms og Finnmark

---

## Next Steps

1. Review and approve this design plan
2. Gather necessary assets (hero image, map SVG)
3. Start with Phase 1 implementation
4. Iterate based on feedback
5. Add interactivity and polish
