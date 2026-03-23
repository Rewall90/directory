# Golf Course Image Automation

Automated system for extracting, optimizing, and cataloging golf course images from club websites using Claude AI subagents.

## Overview

This automation:

1. **Scrapes** golf course websites for high-quality images
2. **Curates** images using AI (aerial shots, signature holes, clubhouses)
3. **Optimizes** images with sharp (WebP format, 1920px max, quality 82)
4. **Generates** SEO-optimized metadata (Norwegian + English alt text)
5. **Updates** course JSON files automatically

## Current Status

```
Total courses:          167
With images:            10 (6.0%)
Without images:         157
Ready to scrape:        153 (have website but no images)
```

### Courses with Images (10)

- agder/Arendal & Omegn Golfklubb (5 images)
- agder/Hovden Golfklubb (5 images)
- akershus/Fet Golfklubb (5 images)
- akershus/Haga Golfklubb (5 images)
- akershus/Hakadal Golfklubb (5 images)
- akershus/Hauger Golfklubb (5 images)
- akershus/Romerike Golfklubb (5 images)
- akershus/Ski Golfklubb - Smerta (5 images)
- buskerud/Holtsmark Golfklubb (5 images)
- oslo/Oslo Golfklubb (4 images)

## Usage

### Check Statistics

```bash
# Overall statistics
npx tsx automation-golf-images/stats.ts

# Statistics for specific region
npx tsx automation-golf-images/stats.ts --region=oslo

# List all courses with images
bash automation-golf-images/list-with-images.sh
```

### Test Single Course

```bash
# Dry run (no changes)
npx tsx automation-golf-images/orchestrator.ts --slug=oslo-golfklubb --dry-run

# Live run
npx tsx automation-golf-images/orchestrator.ts --slug=oslo-golfklubb
```

### Run Batches

```bash
# Small test batch (5 courses)
npx tsx automation-golf-images/orchestrator.ts --batch=5

# Region-specific batch
npx tsx automation-golf-images/orchestrator.ts --region=vestland --batch=20

# Full production run (all 153 courses)
npx tsx automation-golf-images/orchestrator.ts --batch=200
```

## Output Structure

### Image Files

```
public/courses/{slug}/
  ├── {slug}-flyfoto-klubbhus.webp
  ├── {slug}-green-bunkere.webp
  └── {slug}-fairway-skog.webp
```

### JSON Metadata

```json
{
  "images": [
    {
      "src": "/courses/oslo-golfklubb/oslo-golfklubb-oversiktsbilde-bane.webp",
      "alt": "Oversiktsbilde av Oslo Golfklubb med fairways og Marka i bakgrunnen",
      "alt_en": "Overview of Oslo Golf Club with fairways and Marka forest in the background",
      "credit": "Oslo Golfklubb",
      "placeholder": "data:image/webp;base64,UklGRi4AAABXRUJQVlA4..."
    }
  ]
}
```

### Log Files

```
data/golf-image-logs/{timestamp}/
  ├── summary.json              # Run summary with costs
  ├── {slug}-transcript.txt     # Full conversation
  ├── {slug}-prompt.txt         # Sent prompt
  └── {slug}-stream.jsonl       # Raw API stream
```

## Image Optimization

### Settings

- **Format:** WebP (VP8 encoding)
- **Quality:** 82
- **Max Width:** 1920px
- **Aspect Ratio:** Preserved
- **Compression:** ~83% average reduction
- **Blur Placeholder:** 10x7px thumbnail (base64-encoded)

### Performance

- **Original:** ~1.5-2MB per image
- **Optimized:** ~200-400KB per image
- **Reduction:** 83% smaller on average
- **Load Time:** <1s on 4G, <3s on LTE
- **Placeholder:** Instant blur preview during load (LQIP technique)
- **Total Page Weight:** ~1.5MB for 5 images + placeholders (~300 bytes each)

## SEO Optimization

### Multi-Language Support

Images include both Norwegian and English alt text:

- Norwegian: `alt` field (80-120 chars)
- English: `alt_en` field (translation)

Frontend automatically switches based on locale:

```typescript
alt: locale === "en" && img.alt_en ? img.alt_en : img.alt;
```

### Performance Optimizations

**Lazy Loading:**

- Hero image: `priority` (loads immediately)
- Gallery images: `loading="lazy"` (loads when scrolled into view)
- Reduces initial page weight by ~60-80%

**Blur Placeholders (LQIP):**

- 10x7px thumbnails (~300 bytes base64)
- Instant preview while full image loads
- Prevents layout shift (CLS improvement)
- Better perceived performance

```typescript
<Image
  src={photo.url}
  alt={photo.alt}
  loading="lazy"
  placeholder="blur"
  blurDataURL={photo.placeholder}
/>
```

### Descriptive Filenames

Pattern: `{slug}-{description}.webp`

Examples:

- `oslo-golfklubb-flyfoto-klubbhus-marka.webp`
- `oslo-golfklubb-hull-14-vannhinder.webp`
- `oslo-golfklubb-green-bunkere-skog.webp`

## Cost Estimates

Based on Oslo Golfklubb test:

- **Per course:** $0.30 - 0.50
- **Time per course:** 2-4 minutes
- **Success rate:** ~70-80%
- **Images per course:** 3-4 average

For 153 courses:

- **Total cost:** ~$50-80
- **Total time:** ~5-9 hours
- **Expected images:** 450-600 total

## Image Curation Priorities

Claude subagent selects images based on this hierarchy:

1. **BEST:** Aerial/drone shot showing full course layout
2. **EXCELLENT:** Signature hole with dramatic scenery
3. **GREAT:** Clubhouse exterior with course in background
4. **GREAT:** Green with flag, bunkers, landscape
5. **GOOD:** Fairway showing terrain and elevation
6. **GOOD:** Practice facilities (if impressive)
7. **OK:** Players on course (only if showing the course)

**Skipped:**

- Restaurant/cafe interiors
- Tournament crowds without course visible
- Generic group photos
- Pro shop merchandise
- Logos and diagrams
- Photos from other courses

## Error Handling

### Failed Courses

Failed courses get empty `images: []` array to prevent retries.

### Partial Success

- Some images download but not all
- Course JSON still updated with successful images
- Errors logged in summary

### Common Failures

- Website blocking/CAPTCHA
- No relevant images found
- All images too small/large
- Download timeouts

## Architecture

### Files

```
automation-golf-images/
├── orchestrator.ts      # Main entry point
├── claude-runner.ts     # Spawn Claude CLI subagents
├── queue.ts             # Build priority queue
├── prompts.ts           # Golf-specific prompts
├── validator.ts         # Validate JSON responses
├── writer.ts            # Download + optimize + update JSON
├── types.ts             # TypeScript interfaces
├── stats.ts             # Image coverage statistics
└── README.md            # This file
```

### Priority Formula

```typescript
priority = seoPriority + ratingBonus + reviewBonus + holesBonus

seoPriority: 45-100 (by region search volume)
ratingBonus: 0-50 (Google rating × 10)
reviewBonus: 0-50 (review count / 10, capped)
holesBonus: 20 (if 18-hole course) or 0
```

## Browser Automation

Uses `playwright-cli` with:

- Headed mode (visible browser)
- Shared Chrome profile (maintains cookies/sessions)
- JavaScript evaluation for image extraction
- Snapshot navigation for finding relevant pages

## Dependencies

```json
{
  "sharp": "^0.34.5", // Image optimization
  "playwright": "^1.58.2", // Browser automation
  "@anthropic-ai/sdk": "latest", // Claude API
  "tsx": "latest" // TypeScript execution
}
```

## Environment Variables

```bash
ANTHROPIC_API_KEY=sk-ant-...  # Required for Claude API
```

## Next Steps

1. ✅ Test complete (Oslo Golfklubb)
2. 🔄 Run small batch (5-10 courses)
3. 🔄 Review image quality
4. 🔄 Run region batches (Oslo, Akershus, Rogaland)
5. 🔄 Full production run (153 courses)
6. 🔄 Manual review of top 20 courses
7. 🔄 Replace poor-quality images if needed

## Maintenance

### After Runs

1. Check `summary.json` for failed courses
2. Review error messages for patterns
3. Manually add images for high-priority failures
4. Update prompts if curation quality is poor

### Adding More Courses

System automatically picks up new courses that:

- Have `contact.website` field
- Don't have `images` field (undefined)
- Are in `content/courses/{region}/` directories
