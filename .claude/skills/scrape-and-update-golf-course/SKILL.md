# Scrape and Update Golf Course

Scrapes a golf course website using Playwright and updates the course JSON data file with extracted information.

## Invocation

```
/scrape-course <course-slug>
```

Example:

```
/scrape-course oslo-golfklubb
/scrape-course stavanger-golfklubb
```

## Workflow

### Step 1: Find Course JSON File

Search for the course JSON file in `content/courses/`:

```bash
find content/courses -name "*{slug}*.json"
```

Or use glob pattern:

```
content/courses/**/{slug}.json
```

Read the JSON file to get:

- Current course data
- Website URL from `contact.website`

If no website URL exists, ask the user to provide one.

### Step 2: Run Playwright Scraper

Execute the scraping script to fetch website content:

```bash
npx tsx scripts/scrape-course.ts "{website_url}"
```

The script will:

1. Scrape the main page
2. Find and scrape relevant subpages (pricing, contact, facilities, etc.)
3. Output formatted text content for analysis

Save the output to a temporary file for analysis:

```bash
npx tsx scripts/scrape-course.ts "{website_url}" > /tmp/scraped-{slug}.txt
```

### Step 3: Extract Structured Data

Read the scraped content and extract relevant information.

**Priority fields to extract:**

| Priority | Category    | Fields                                                                       |
| -------- | ----------- | ---------------------------------------------------------------------------- |
| 1        | Pricing     | greenFeeWeekday, greenFeeWeekend, greenFeeJunior, greenFeeSenior, cartRental |
| 2        | Contact     | phone, email, website                                                        |
| 3        | Facilities  | drivingRange, simulator, restaurant, proShop, clubRental                     |
| 4        | Course      | holes, par, lengthMeters, terrain                                            |
| 5        | Description | Marketing text, history                                                      |

**Norwegian pattern recognition:**

| Pattern                                | Meaning        |
| -------------------------------------- | -------------- |
| `kr 750`, `750,-`, `NOK 750`, `750 kr` | 750 NOK        |
| `Hverdag`, `Hverdager`, `Man-Fre`      | Weekday        |
| `Helg`, `Lør-Søn`, `Weekend`           | Weekend        |
| `Medlemskap`                           | Membership     |
| `Greenfee`, `Green fee`                | Green fee      |
| `Driving range`, `Treningsområde`      | Practice range |
| `Simulator`, `Innendørs golf`          | Golf simulator |
| `Golfbil`, `Golfcart`                  | Golf cart      |
| `Tralle`, `Trolley`                    | Pull cart      |

**Phone patterns:**

- `+47 XX XX XX XX`
- `XX XX XX XX`
- `XXXX XXXX`

**Email patterns:**

- Standard email regex
- Common patterns: `post@`, `kontakt@`, `booking@`

### Step 4: Show Diff to User

Present a table showing proposed changes:

```
| Field | Current Value | New Value | Action |
|-------|---------------|-----------|--------|
| greenFeeWeekday | 750 | 850 | UPDATE |
| greenFeeWeekend | 950 | 1050 | UPDATE |
| simulator | null | true | ADD |
| phone | +47 22 51 05 60 | +47 22 51 05 60 | NO CHANGE |
```

Explain any significant changes and ask for user confirmation.

### Step 5: Merge and Write JSON

**CRITICAL: Merge, don't overwrite**

- Only update fields with non-null scraped values
- Preserve existing data that wasn't found in scrape
- Pricing is keyed by year - add/update current year entry (2026)
- Update `meta.scrapedAt` and `meta.updatedAt` timestamps
- Append to `sources` array with scrape details

**Merge strategy:**

```typescript
// For pricing - add new year, don't overwrite all pricing
pricing: {
  ...existingPricing,
  "2026": newPricingData
}

// For other fields - only update if new value is not null
phone: newPhone ?? existingPhone

// For sources - append
sources: [
  ...existingSources,
  {
    type: "website_scrape",
    url: websiteUrl,
    dataObtained: ["pricing", "contact", "facilities"],
    pagesScraped: numberOfPages,
    scrapedAt: new Date().toISOString()
  }
]

// Update meta
meta: {
  ...existingMeta,
  scrapedAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
}
```

Write the merged JSON back to the same file:

```
content/courses/{region}/{slug}.json
```

### Step 6: Verification

After writing, verify the JSON is valid:

```bash
node -e "JSON.parse(require('fs').readFileSync('content/courses/{region}/{slug}.json', 'utf8')); console.log('Valid JSON')"
```

## Error Handling

- **No website URL**: Ask user to provide one, or search for it online
- **Website unreachable**: Inform user, suggest checking URL manually
- **No data extracted**: Show raw scraped content, ask user what to extract
- **Invalid JSON after merge**: Roll back, show error, ask for manual intervention

## Example Session

```
User: /scrape-course oslo-golfklubb

Claude: Found Oslo Golfklubb
        File: content/courses/oslo/oslo-golfklubb.json
        Website: https://www.oslogk.no

        Running Playwright scraper...
        [Executes scraping script]

        Scraped 5 pages successfully.

        Extracted data:
        | Field | Current | New | Change |
        |-------|---------|-----|--------|
        | greenFeeWeekday (2026) | null | 900 | ADD |
        | greenFeeWeekend (2026) | null | 1100 | ADD |
        | greenFeeJunior (2026) | null | 450 | ADD |
        | restaurant | true | true | NO CHANGE |
        | simulator | true | true | NO CHANGE |

        Confirm update? (yes/no)

User: yes

Claude: Updated content/courses/oslo/oslo-golfklubb.json
        - Added 2026 pricing with 3 fields
        - Updated meta.scrapedAt timestamp
        - Added source entry

        JSON validated successfully.
```

## Prerequisites

Ensure Playwright is installed globally:

```bash
npm install -g playwright
npx playwright install chromium
```

If the scraping script fails with "browser not found", run the install command above.

## Files Reference

| File                                   | Purpose                    |
| -------------------------------------- | -------------------------- |
| `scripts/scrape-course.ts`             | Playwright scraping script |
| `src/types/course.ts`                  | Course TypeScript types    |
| `content/courses/{region}/{slug}.json` | Course data files          |
