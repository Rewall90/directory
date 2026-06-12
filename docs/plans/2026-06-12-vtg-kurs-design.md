# Design: VTG-kurs section

**Date:** 2026-06-12
**Status:** Approved
**Goal:** Rank on Google for "VTG-kurs", "golfkurs", and "golfkurs + sted" queries, and build the foundation for monetization via sponsored club placement and (later) per-lead deals with clubs.
**Mockup:** `mockups/vtg-kurs-mockup.html`

## Background

VTG (Veien til Golf) is the mandatory beginner course every new Norwegian golfer must take. It is sold by each of the ~168 individual clubs — there is no central booking platform or affiliate program. A club's VTG signup is worth far more than the course fee (new members pay annual dues), which makes clubs willing to pay for placement and leads. golfkart.no already has all 168 clubs as course pages, organized by region.

## Decisions made

| Decision         | Choice                                                                           |
| ---------------- | -------------------------------------------------------------------------------- |
| Data sourcing    | Scrape club websites (extend existing scraper); refresh per season               |
| Page structure   | Hub + region pages, phased rollout; **no per-club VTG pages**                    |
| Region page gate | Region page exists only when ≥3 clubs in the region have real VTG data           |
| Lead handling v1 | Link out to club signup pages + GA4 click tracking (no lead forms yet)           |
| Monetization v1  | "Sponset" placement (top of region, white card, discreet label), sold per season |

## Google policy research (why this structure)

- [Spam policies — doorway abuse](https://developers.google.com/search/docs/essentials/spam-policies): pages targeting cities/regions that funnel to one page, or boilerplate with swapped place names, are violations.
- [Helpful content guidance](https://developers.google.com/search/docs/fundamentals/creating-helpful-content): each page must be independently useful.
- Our region pages are legitimate because each lists **different real inventory** (clubs, prices, signup links, ratings) and gets a **data-generated unique intro** (club count, price range, distances from nearby cities computed from coordinates). The inventory gate guarantees no thin pages.
- **Validated 2026-06-12 by adversarial deep-research** (98 agents, 25 claims 3-vote-verified against primary Google sources, 22 confirmed): hub + gated county pages matches Google's "clearly defined, browseable hierarchy"; per-city and per-club pages would contradict Mueller's on-record doorway warnings; hub/county listing overlap is canonicalization, not spam. Standing obligation: scraped prices must stay fresh — staleness, not architecture, is the long-term policy risk ("scraping... where little value is provided" is a named abuse example).

## URL structure

```
/vtg-kurs                  hub (phase 1) — targets "VTG-kurs", "golfkurs", "nybegynnerkurs golf"
/vtg-kurs/[region]         region pages (phase 2) — target "golfkurs + by/fylke" — NORWEGIAN ONLY
/en/vtg-kurs               English hub only (for expats); NO English region pages
```

**Amendment 2026-06-12 (post deep-research validation):** region pages are generated for the `nb` locale only. English county pages would have near-zero search demand and be the thinnest pages on the site — contrary to the "no more pages than necessary" principle this design follows. `/en/vtg-kurs/[region]` URLs 404; region-page hreflang lists only `nb` + `x-default`. Full rollout is therefore ~13–16 nb pages + 1 en hub.

Club entries link to (a) the club's own signup/kurs page (external, tracked) and (b) the club's existing course page on golfkart.no.

## Data model

New optional `vtg` field on the Course type and in `content/courses/{region}/{slug}.json`:

```typescript
vtg: {
  offered: boolean | null;     // null = unknown
  price: number | null;        // adult, NOK
  priceYouth: number | null;
  signupUrl: string | null;    // club's VTG/kurs page
  seasonInfo: string | null;   // free text, e.g. "Kurs hver uke mai–august"
  lastChecked: string;         // ISO date, displayed on pages
} | null
```

Scraper rule: **when unsure, write null — never guess.** A missing price is acceptable; a wrong one destroys trust.

New loaders in `src/lib/courses.ts`:

- `getVtgClubs()` — all courses with their vtg data (null-safe)
- `getVtgRegions()` — regions where ≥3 clubs have `offered: true` and (price or signupUrl)

## Routes

```
src/app/[locale]/vtg-kurs/page.tsx              # hub, SSG
src/app/[locale]/vtg-kurs/[region]/page.tsx     # generateStaticParams() = getVtgRegions()
```

The gate lives in `generateStaticParams()`, so thin region pages cannot exist by construction. Both routes added to `sitemap.ts`.

## Page content

**Hub:** hand-written intro (what VTG is, the 3 parts, no exam, equipment loans) with price range computed from data; region jump-index (plain text links with counts); all clubs grouped by region as cards (name → course page, address, star rating, price, "Meld deg på" button); clubs without data still listed with a secondary "Klubbens kursside" link, no price shown; FAQ section (4–8 questions); "sist oppdatert" note with error-report link.

**Region page:** data-generated intro (club count, price range, nearest clubs to major cities from coordinates); fuller club cards (season info, next course date when scraped); links back to hub and to course pages.

**Visual style:** matches existing CourseCard (surface cards, address block, star rating). No badges/chips/emoji. Sponsored cards: white background, small uppercase "Sponset" label, placed first in their region.

## SEO technical

- FAQPage JSON-LD on hub FAQ; ItemList JSON-LD on club lists
- Metadata/OG per existing page patterns; hub and region pages in sitemap
- Internal links: nav/footer → hub; existing region pages → their VTG page; (phase 3) course pages → hub

## Click tracking

"Meld deg på" fires GA4 event `vtg_signup_click` with `club_slug` and `region` params via the existing gtag setup (G-ZM0PFETJNE). Small client component wraps the button; pages stay server-rendered. Per-club click counts become the sales pitch to clubs.

## Error & staleness handling

- No data → club still listed, no price, secondary link to club website. Never display guessed/zero prices.
- Every price shows "sist sjekket {måned år}" from `lastChecked`.
- Region below gate → clubs appear on hub only; no page generated.
- Hub must build and render correctly with zero VTG data (day-one state).

## Testing

- Unit tests for `getVtgClubs()` / `getVtgRegions()` (gate logic, null handling)
- JSON schema validation script for the `vtg` field, run after scraper runs
- Render/build test of hub with empty VTG data

## Rollout phases

1. **Phase 1:** vtg data model + scraper extension + hub page + GA4 tracking + sitemap. Ships with first scraper run's data.
2. **Phase 2:** region pages appear automatically as scraped coverage passes the gate.
3. **Phase 3 (separate, later):** VTG box on existing course pages; lead-capture forms once clubs are paying (GDPR work required at that point).

## Monetization path (context, not built in v1)

1. Launch free for all clubs; collect per-club click stats.
2. Pitch clubs featured "Sponset" placement (flat seasonal fee) using click data.
3. Later: per-lead pricing via on-site interest forms (phase 3).
