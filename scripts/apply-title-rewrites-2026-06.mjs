#!/usr/bin/env node
// Applies Variant A (greenfee/holes anchor) seo_title + seo_description
// overrides for the 25 worst-CTR Norwegian course pages from the 2026-06 GSC pull.
//
// Best-practice constraints:
//  - Title ≤60 chars (no brand suffix on course pages — root layout uses static title)
//  - Meta ≤155 chars, includes a CTA, unique per page
//  - Front-load brand name (matches the dominant landing query)
//  - Lead with concrete value the club's own site usually buries (holes + greenfee)

import fs from "node:fs";
import path from "node:path";

const COURSES_DIR = "content/courses";

// Path → override mapping. URL paths normalized without trailing slash.
const OVERRIDES = {
  "/rogaland/sola-golfklubb": {
    seo_title: "Sola Golfklubb — 18 hull, greenfee fra 700 kr",
    seo_description:
      "18-hulls bane (par 72) i Sola grunnlagt 1993. Greenfee fra 700 kr ukedag, 900 kr helg. Sesong April–Oktober. Se baneinfo, omtaler og kontakt.",
  },
  "/more-og-romsdal/aalesund-golfklubb-solnor-gaard": {
    // Original Variant A was 72 chars; shortened the brand to the most-searched form.
    seo_title: "Ålesund Golfklubb — 18 hull, greenfee fra 500 kr",
    seo_description:
      "18-hulls bane (par 72) i Ålesund grunnlagt 1995. Greenfee fra 500 kr ukedag. Sesong April–oktober. Se baneinfo, omtaler og kontakt.",
  },
  "/akershus/haga-golfklubb": {
    seo_title: "Haga Golfklubb — 27 hull, greenfee fra 1100 kr",
    // Drop the "1356" postal-code typo that's in the city field.
    seo_description:
      "27-hulls bane i Bekkestua grunnlagt 2003. Greenfee fra 1100 kr helg. Se baneinfo, omtaler og kontakt.",
  },
  "/akershus/losby-golfklubb": {
    seo_title: "Losby Golfklubb — 27 hull i Finstadjordet: greenfee og kart",
    seo_description:
      "27-hulls bane i Finstadjordet, Lørenskog. Se baneinfo, greenfee, omtaler og kontakt.",
  },
  "/vestfold/solum-golfklubb": {
    seo_title: "Solum Golfklubb — 18 hull, greenfee fra 550 kr",
    seo_description:
      "18-hulls bane (par 72) i Holmestrand grunnlagt 2003. Greenfee fra 550 kr ukedag. Sesong Mars–Desember. Se baneinfo, omtaler og kontakt.",
  },
  "/vestland/bergen-golfklubb": {
    seo_title: "Bergen Golfklubb — 9 hull, greenfee fra 575 kr",
    seo_description:
      "9-hulls bane (par 34) i Bergen grunnlagt 1937. Greenfee fra 575 kr ukedag, 675 kr helg. Sesong April–Oktober. Se baneinfo, omtaler og kontakt.",
  },
  "/buskerud/tyrifjord-golfklubb": {
    seo_title: "Tyrifjord Golfklubb — 18 hull i Krokkleiva: greenfee og kart",
    seo_description:
      "18-hulls bane (par 72) i Krokkleiva grunnlagt 1996. Sesong April–Oktober. Se baneinfo, greenfee, omtaler og kontakt.",
  },
  "/akershus/baerum-golfklubb": {
    seo_title: "Bærum Golfklubb — 18 hull i Lommedalen: greenfee og kart",
    seo_description:
      "18-hulls bane i Lommedalen, Bærum. Se baneinfo, greenfee, omtaler og kontakt.",
  },
  "/oslo/groruddalen-golfklubb": {
    seo_title: "Groruddalen Golfklubb — 9 hull, greenfee fra 300 kr",
    seo_description:
      "9-hulls bane (par 27) i Oslo grunnlagt 1988. Greenfee fra 300 kr ukedag, 350 kr helg. Sesong Mai–Oktober. Se baneinfo, omtaler og kontakt.",
  },
  "/vestfold/sandefjord-golfklubb": {
    seo_title: "Sandefjord Golfklubb — 18 hull, greenfee fra 650 kr",
    seo_description:
      "18-hulls bane (par 72) i Sandefjord grunnlagt 2008. Greenfee fra 650 kr ukedag. Sesong Februar–Oktober. Se baneinfo, omtaler og kontakt.",
  },
  "/vestfold/sande-golfklubb": {
    // Original Variant A was 61 chars; shortened the city repeat.
    seo_title: "Sande Golfklubb — 9 hull i Vestfold: greenfee og kart",
    seo_description:
      "9-hulls bane (par 36) i Sande, Vestfold, grunnlagt 1999. Sesong April–November. Se baneinfo, greenfee, omtaler og kontakt.",
  },
  "/trondelag/byneset-golfklubb": {
    seo_title: "Byneset Golfklubb — 27 hull, greenfee fra 700 kr",
    seo_description:
      "27-hulls bane (par 72) i Trondheim grunnlagt 1995. Greenfee fra 700 kr ukedag. Sesong April–November. Se baneinfo, omtaler og kontakt.",
  },
  "/ostfold/onsoy-golfklubb": {
    seo_title: "Onsøy Golfklubb — 18 hull, greenfee fra 695 kr",
    seo_description:
      "18-hulls bane (par 72) i Manstad grunnlagt 1987. Greenfee fra 695 kr ukedag, 745 kr helg. Se baneinfo, omtaler og kontakt.",
  },
  "/vestfold/hof-golfklubb": {
    seo_title: "Hof Golfklubb — 9 hull, greenfee fra 400 kr",
    seo_description:
      "9-hulls bane (par 33) i Hof, Vestfold, grunnlagt 1996. Greenfee fra 400 kr ukedag. Sesong April–November. Se baneinfo, omtaler og kontakt.",
  },
  "/ostfold/moss-rygge-golfklubb": {
    seo_title: "Moss & Rygge Golfklubb — 18 hull, greenfee fra 750 kr",
    seo_description:
      "18-hulls bane (par 72) i Dilling, Rygge, grunnlagt 2004. Greenfee fra 750 kr ukedag, 800 kr helg. Sesong April–November. Se baneinfo og omtaler.",
  },
  "/trondelag/klaebu-golfklubb": {
    seo_title: "Klæbu Golfklubb — 9 hull, greenfee fra 400 kr",
    seo_description:
      "9-hulls bane (par 32) i Klæbu grunnlagt 2001. Greenfee fra 400 kr ukedag. Sesong Mai–Oktober. Se baneinfo, omtaler og kontakt.",
  },
  "/innlandet/hafjell-golfklubb": {
    seo_title: "Hafjell Golfklubb — 9 hull i Øyer: greenfee og kart",
    seo_description:
      "9-hulls bane (par 67) i Øyer ved Hafjell, grunnlagt 2002. Sesong mai–oktober. Se baneinfo, greenfee, omtaler og kontakt.",
  },
  "/ostfold/askim-golfklubb": {
    seo_title: "Askim Golfklubb — 18 hull, greenfee fra 400 kr",
    seo_description:
      "18-hulls bane (par 69) i Askim grunnlagt 1997. Greenfee fra 400 kr ukedag. Sesong April–November. Se baneinfo, omtaler og kontakt.",
  },
  "/trondelag/trondheim-golfklubb": {
    seo_title: "Trondheim Golfklubb — 9 hull, greenfee fra 350 kr",
    seo_description:
      "9-hulls bane (par 36) i Trondheim grunnlagt 1950. Greenfee fra 350 kr ukedag. Sesong Mai–Oktober. Se baneinfo, omtaler og kontakt.",
  },
  "/vestfold/tjome-golfklubb": {
    seo_title: "Tjøme Golfklubb — 18 hull i Tjøme: greenfee og kart",
    seo_description:
      "18-hulls bane (par 72) på Tjøme grunnlagt 1989. Sesong April–November. Se baneinfo, greenfee, omtaler og kontakt.",
  },
  "/more-og-romsdal/volda-golfklubb": {
    seo_title: "Volda Golfklubb — 9 hull, greenfee fra 400 kr",
    seo_description:
      "9-hulls bane (par 35) i Volda grunnlagt 1998. Greenfee fra 400 kr ukedag. Sesong Mai–Oktober. Se baneinfo, omtaler og kontakt.",
  },
  "/akershus/krokhol-golfklubb": {
    seo_title: "Krokhol Golfklubb — 9 hull i Siggerud: greenfee og kart",
    seo_description:
      "9-hulls bane (par 36) i Siggerud, Ski, grunnlagt 2004. Sesong Mai–Oktober. Se baneinfo, greenfee, omtaler og kontakt.",
  },
  "/nordland/bodo-golfklubb": {
    seo_title: "Bodø Golfklubb — 9 hull, greenfee fra 420 kr",
    seo_description:
      "9-hulls bane (par 27) i Tverlandet, Bodø, grunnlagt 2005. Greenfee fra 420 kr ukedag. Sesong Mai–Oktober. Se baneinfo og omtaler.",
  },
  "/buskerud/drammen-golfklubb": {
    seo_title: "Drammen Golfklubb — 18 hull i Drammen: greenfee og kart",
    seo_description:
      "18-hulls bane (par 71) i Drammen grunnlagt 1997. Se baneinfo, greenfee, omtaler og kontakt.",
  },
  "/akershus/lommedalen-golfklubb": {
    seo_title: "Lommedalen Golfklubb — 9 hull, par 67 i Bærum",
    seo_description:
      "9-hulls bane (par 67) i Lommedalen, Bærum, grunnlagt 2003. Se baneinfo, greenfee, omtaler og kontakt.",
  },
};

// --- Length check ---
const warns = [];
for (const [url, o] of Object.entries(OVERRIDES)) {
  if (o.seo_title.length > 60)
    warns.push(`${url}  title ${o.seo_title.length} chars: ${o.seo_title}`);
  if (o.seo_description.length > 155)
    warns.push(`${url}  meta ${o.seo_description.length} chars: ${o.seo_description}`);
}
if (warns.length) {
  console.warn("⚠️  Length warnings:");
  for (const w of warns) console.warn("  - " + w);
  process.exit(1);
}

// --- Apply ---
const stats = { applied: 0, missing: 0 };
for (const [urlPath, override] of Object.entries(OVERRIDES)) {
  const segs = urlPath.split("/").filter(Boolean);
  const [region, courseSlug] = segs;
  const filePath = path.join(COURSES_DIR, region, `${courseSlug}.json`);
  if (!fs.existsSync(filePath)) {
    console.error(`Missing: ${filePath}`);
    stats.missing += 1;
    continue;
  }
  const d = JSON.parse(fs.readFileSync(filePath, "utf8"));
  d.seo_title = override.seo_title;
  d.seo_description = override.seo_description;
  fs.writeFileSync(filePath, JSON.stringify(d, null, 2) + "\n");
  stats.applied += 1;
}

console.log(`\n✅ Applied ${stats.applied} overrides (${stats.missing} missing files)`);
console.log("\nFinal SERP rendering (title — meta):");
for (const [url, o] of Object.entries(OVERRIDES)) {
  console.log(`  ${url}`);
  console.log(`    T(${o.seo_title.length}): ${o.seo_title}`);
  console.log(`    M(${o.seo_description.length}): ${o.seo_description}`);
}
