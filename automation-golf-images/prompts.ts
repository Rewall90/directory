import type { GolfImageTarget } from "./types";

// Dedicated Chrome profile for scraping — same pattern as badstukart
const CHROME_PROFILE = `C:\\Users\\Petter\\Desktop\\prosjekter\\golf_directory\\golf-directory\\data\\chrome-profile`;

/**
 * Build the prompt sent to a Claude subagent for extracting image URLs from a golf course website.
 */
export function buildImagePrompt(target: GolfImageTarget): string {
  return `You are an image URL extractor for Golfkart.no - a Norwegian golf course directory.

**YOUR TASK:** Visit the website for "${target.courseName}" and extract image URLs with complete metadata. Return them as JSON.
**YOU MUST NOT** edit or write any files. Only return data.

## CRITICAL RULES

1. **EVERY playwright-cli command MUST use --headed and --profile flags.**
   The ONLY valid way to open a browser is:
   \`playwright-cli -s=${target.courseSlug} open URL --headed --profile="${CHROME_PROFILE}"\`
   NEVER remove --headed. NEVER remove --profile.

2. **NEVER edit or write any files.** Only return data as JSON.

3. **METADATA IS MANDATORY:** For each image you must generate:
   - Descriptive filename (English, lowercase, hyphens, NO extension)
   - Norwegian alt text (80-120 characters, SEO-optimized)
   - English alt text (translation of Norwegian)
   - Photo credit (course name or photographer if evident)

**TOOLS YOU WILL USE:**
- Bash tool for playwright-cli commands

**TARGET GOLF COURSE:**
- Name: ${target.courseName}
- Slug: ${target.courseSlug}
- Region: ${target.region}
- Holes: ${target.holes}
- Website: ${target.website}

---

**STEP 1: Open the website**

\`\`\`
playwright-cli -s=${target.courseSlug} open ${target.website} --headed --profile="${CHROME_PROFILE}"
\`\`\`

Wait 3 seconds for page load:
\`\`\`
playwright-cli -s=${target.courseSlug} eval "async () => { await new Promise(r => setTimeout(r, 3000)); return document.title; }"
\`\`\`

**STEP 2: Extract image URLs with context**

Run this JavaScript to extract all substantial images WITH their surrounding context:

\`\`\`
playwright-cli -s=${target.courseSlug} eval "() => {
  const results = [];
  const imgs = Array.from(document.querySelectorAll('img'));
  for (const img of imgs) {
    if (img.naturalWidth < 600 || img.naturalHeight < 400) continue;
    const src = (img.src || '').toLowerCase();
    if (!img.src.startsWith('http')) continue;
    if (['logo','icon','favicon','sprite','avatar','placeholder','button'].some(w => src.includes(w))) continue;
    const alt = img.alt || '';
    const closest = img.closest('section,article,div');
    const heading = closest ? (closest.querySelector('h1,h2,h3') || {}).textContent || '' : '';
    results.push({ url: img.src, alt, heading: heading.trim().slice(0,100), w: img.naturalWidth, h: img.naturalHeight });
  }

  // Also check CSS background images on hero/banner elements
  const bgSelectors = ['[class*=hero]', '[class*=banner]', '[class*=header]', '[class*=cover]', '[class*=bane]', '[class*=course]', 'section:first-of-type'];
  for (const sel of bgSelectors) {
    try {
      const els = document.querySelectorAll(sel);
      els.forEach(el => {
        const bg = getComputedStyle(el).backgroundImage;
        const match = bg.match(/url\\\\(['\"]?(https?:\\\\/\\\\/[^'\\\"\\\\)]+)['\"]?\\\\)/);
        if (match) results.push({ url: match[1], alt: 'bg-image', heading: sel, w: 0, h: 0 });
      });
    } catch {}
  }

  return JSON.stringify(results.slice(0, 20));
}"
\`\`\`

**STEP 3: Look for golf-specific pages**

Take a snapshot to find navigation links:
\`\`\`
playwright-cli -s=${target.courseSlug} snapshot
\`\`\`

Read the snapshot from .playwright-cli/ and look for links to pages about:
- The course itself: "banen", "golfbane", "the course", "om banen"
- Gallery pages: "gallery", "galleri", "bilder", "photos", "foto"
- About pages with course photos: "om klubben", "about us", "om oss"

**SKIP these pages** (rarely have course photos):
- "medlemskap", "membership" (focus on pricing, not the course)
- "priser", "pricing", "greenfee" (just price lists)
- "booking", "bestill" (booking forms only)

If you find relevant pages, navigate there and extract images with the same eval script from Step 2.

**Max pages to visit: 3** (main page + up to 2 sub pages)

**STEP 4: If too few images found, try srcset and data-src**

If you found fewer than 3 images, run this additional extraction:
\`\`\`
playwright-cli -s=${target.courseSlug} eval "() => {
  const imgs = Array.from(document.querySelectorAll('img[data-src], img[data-lazy-src], img[srcset]'));
  const urls = [];
  imgs.forEach(img => {
    const dataSrc = img.getAttribute('data-src') || img.getAttribute('data-lazy-src') || '';
    if (dataSrc.startsWith('http')) urls.push(dataSrc);
    const srcset = img.getAttribute('srcset') || '';
    const parts = srcset.split(',').map(s => s.trim().split(/\\\\s+/)[0]).filter(s => s.startsWith('http'));
    if (parts.length > 0) urls.push(parts[parts.length - 1]); // largest
  });
  const filtered = [...new Set(urls)].filter(u => {
    const l = u.toLowerCase();
    return !['logo','icon','favicon','sprite','avatar','button'].some(w => l.includes(w));
  });
  return JSON.stringify(filtered.slice(0, 10));
}"
\`\`\`

---

**STEP 5: CURATE — Select the best 3-5 images for a golf course directory listing**

This is the most important step. You now have a list of image URLs with context.
**You must select the best 3-5 images** for someone browsing a golf course directory.

**Image priority (pick in this order):**
1. **BEST:** Aerial/drone shot showing full course layout with fairways, greens, landscape
2. **EXCELLENT:** Signature hole with dramatic scenery (fjord, mountains, ocean, forest)
3. **GREAT:** Clubhouse exterior with course in background
4. **GREAT:** Green with flag, bunkers visible, natural landscape
5. **GOOD:** Fairway showing terrain, trees, elevation changes
6. **GOOD:** Practice facilities (driving range, putting green) if impressive
7. **OK:** Players on course (ONLY if it shows the course itself, not just people)

**SKIP these — they do NOT belong in a golf course listing:**
- Restaurant/cafe interior photos (unless they show course views)
- Tournament/event crowd photos without course visible
- Trophy ceremonies, prize giving photos
- Generic group photos without showing the course
- Pro shop merchandise or equipment closeups
- Artistic/abstract images that don't show the actual course
- Stock photos with text overlays or marketing banners
- Photos from OTHER courses (verify URL path carefully!)
- Logos, icons, diagrams, course maps (unless aerial photos)

**Use the context to decide:** Look at:
- Alt text: Does it mention "bane", "course", "fairway", "green", "hull", "hole"?
- URL path: Does it contain golf-related terms?
- Nearby heading: Is it in a section about the course?
- Image size: Larger images (>1200px) are usually better quality

**Be selective:** Better to return 2-3 great images than 5 mediocre ones.

---

**STEP 6: GENERATE METADATA FOR EACH SELECTED IMAGE**

For EACH image you select, you must generate complete metadata:

**1. Descriptive filename** (English, lowercase, hyphens, NO extension):
   - Pattern: \`{courseSlug}-{description}\`
   - Example: \`oslo-golfklubb-flyfoto-klubbhus-marka\`
   - Description should identify:
     - Viewpoint: flyfoto/aerial, green, fairway, clubhouse, hole-X
     - Key features visible in the image

**2. Norwegian alt text** (80-120 characters, SEO-optimized):
   - MUST include the course name
   - Describe what's visible
   - Include location/region if relevant
   - Mention key features (bunkere, vannhinder, fjell, skog, utsikt)
   - Example: "Flyfoto av Oslo Golfklubb med klubbhus, bunkere og Marka i bakgrunnen"
   - Example: "Hull 14 på Oslo Golfklubb med utsikt over Bogstadvannet"

**3. English alt text** (translation of Norwegian, same quality):
   - MUST be a translation, not a rewrite
   - Include the course name
   - Example: "Aerial view of Oslo Golf Club with clubhouse, bunkers and Marka forest in the background"
   - Example: "Hole 14 at Oslo Golf Club overlooking Lake Bogstad"

**4. Photo credit**:
   - Default to course name: "${target.courseName}"
   - Or photographer name if clearly stated on the website

---

**FINAL STEP: Return your results as a JSON object**

After curating and generating metadata, output EXACTLY this JSON structure:

\`\`\`json
{
  "courseSlug": "${target.courseSlug}",
  "region": "${target.regionSlug}",
  "images": [
    {
      "url": "https://example.com/course-aerial.jpg",
      "filename": "oslo-golfklubb-flyfoto-klubbhus",
      "alt": "Flyfoto av Oslo Golfklubb med klubbhus og fairways i skogsterreng",
      "alt_en": "Aerial view of Oslo Golf Club with clubhouse and fairways in forest terrain",
      "credit": "Oslo Golfklubb"
    },
    {
      "url": "https://example.com/hole14.jpg",
      "filename": "oslo-golfklubb-hull-14-vannhinderalt": "Hull 14 på Oslo Golfklubb med vannhinder og grønn ved Bogstadvannet",
      "alt_en": "Hole 14 at Oslo Golf Club with water hazard and green by Lake Bogstad",
      "credit": "Oslo Golfklubb"
    }
  ],
  "error": null
}
\`\`\`

**Rules for the JSON:**
- images must be an array of objects with url, filename, alt, alt_en, credit fields
- filename should NOT include file extension (.jpg, .webp, etc.)
- Order them: best/most representative image first (ideally aerial shot)
- Max 5 images (3-4 is better than 5 mediocre ones)
- Deduplicate URLs
- Set images to empty array [] if no golf-relevant images found
- Set error to a string describing what went wrong (or null if success)

**IMPORTANT:** Close the browser session when done:
\`\`\`
playwright-cli -s=${target.courseSlug} close
\`\`\`
`;
}
