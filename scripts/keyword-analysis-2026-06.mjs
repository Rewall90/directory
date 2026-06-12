#!/usr/bin/env node
// Keyword analysis from fresh GSC export (last 3 months, 2026-06-05).
// Focus: (1) striking-distance opportunities, (2) page-family / fylke performance.

import fs from "node:fs";
import path from "node:path";

const DIR = "gsc-export/2026-06-05";
const OUT = "docs/keyword-analysis-2026-06.md";

const parseCsv = (file) => {
  const text = fs.readFileSync(path.join(DIR, file), "utf8").replace(/﻿/, "");
  const lines = text.split(/\r?\n/).filter(Boolean);
  const header = lines.shift().split(",");
  return lines.map((line) => {
    const cols = [];
    let cur = "";
    let q = false;
    for (const c of line) {
      if (c === '"') q = !q;
      else if (c === "," && !q) {
        cols.push(cur);
        cur = "";
      } else cur += c;
    }
    cols.push(cur);
    const o = {};
    header.forEach((h, i) => (o[h] = cols[i]));
    return o;
  });
};

const num = (s) => Number(String(s).replace("%", ""));

const queries = parseCsv("Queries.csv").map((r) => ({
  q: r["Top queries"],
  clicks: num(r.Clicks),
  imps: num(r.Impressions),
  ctr: num(r.CTR),
  pos: num(r.Position),
}));

const pages = parseCsv("Pages.csv").map((r) => ({
  url: r["Top pages"],
  path: new URL(r["Top pages"]).pathname,
  clicks: num(r.Clicks),
  imps: num(r.Impressions),
  ctr: num(r.CTR),
  pos: num(r.Position),
}));

const total = (arr) => ({
  clicks: arr.reduce((s, r) => s + r.clicks, 0),
  imps: arr.reduce((s, r) => s + r.imps, 0),
});

// --- Headlines ---
const tQ = total(queries);
const tP = total(pages);

// --- Striking distance: position 5-20, impressions >= 50 ---
const ctrAtPos = {
  1: 28,
  2: 15,
  3: 11,
  4: 8,
  5: 6,
  6: 4.5,
  7: 3.5,
  8: 3,
  9: 2.5,
  10: 2,
  11: 1.5,
  12: 1.2,
  13: 1.0,
  14: 0.9,
  15: 0.8,
  16: 0.7,
  17: 0.6,
  18: 0.5,
  19: 0.45,
  20: 0.4,
};
const top3Ctr = ctrAtPos[3];

const striking = queries
  .filter((r) => r.pos >= 5 && r.pos <= 20 && r.imps >= 50)
  .map((r) => {
    const potentialClicks = Math.round((r.imps * top3Ctr) / 100);
    const upliftClicks = potentialClicks - r.clicks;
    return { ...r, potentialClicks, upliftClicks };
  })
  .sort((a, b) => b.upliftClicks - a.upliftClicks);

// --- Page family classification ---
// Norwegian fylker (regions) — pages first path segment for golf course pages
const FYLKE_SLUGS = new Set([
  "oslo",
  "viken",
  "innlandet",
  "vestfold",
  "telemark",
  "ostfold",
  "akershus",
  "buskerud",
  "agder",
  "rogaland",
  "vestland",
  "more-og-romsdal",
  "trondelag",
  "nordland",
  "troms",
  "finnmark",
  "troms-og-finnmark",
  "vestfold-og-telemark",
]);

const classifyPath = (p) => {
  if (p === "/" || p === "") return "home (NO)";
  if (p === "/en" || p === "/en/") return "home (EN)";
  if (p === "/kart" || p === "/kart/") return "kart (NO)";
  if (p === "/en/kart" || p === "/en/kart/") return "kart (EN)";
  if (p.startsWith("/blog/")) return "blog (NO)";
  if (p.startsWith("/en/blog/")) return "blog (EN)";
  if (p.startsWith("/en/")) {
    const segs = p
      .replace(/^\/en\//, "")
      .split("/")
      .filter(Boolean);
    if (segs.length === 1) return "fylke pages (EN)";
    if (segs.length === 2) return "course pages (EN)";
    return "other (EN)";
  }
  const segs = p.split("/").filter(Boolean);
  if (segs.length === 1) {
    if (FYLKE_SLUGS.has(segs[0])) return "fylke pages (NO)";
    return "other (NO)";
  }
  if (segs.length === 2) return "course pages (NO)";
  return "other (NO)";
};

const families = {};
for (const r of pages) {
  const fam = classifyPath(r.path);
  if (!families[fam]) families[fam] = { fam, count: 0, clicks: 0, imps: 0, ctrSum: 0, posSum: 0 };
  families[fam].count += 1;
  families[fam].clicks += r.clicks;
  families[fam].imps += r.imps;
  families[fam].ctrSum += r.ctr * r.imps;
  families[fam].posSum += r.pos * r.imps;
}
const familyRows = Object.values(families)
  .map((f) => ({
    fam: f.fam,
    pages: f.count,
    clicks: f.clicks,
    imps: f.imps,
    ctr: f.imps ? f.ctrSum / f.imps : 0,
    pos: f.imps ? f.posSum / f.imps : 0,
  }))
  .sort((a, b) => b.imps - a.imps);

// --- Fylke rollup (NO course pages + fylke hub) ---
const fylker = {};
for (const r of pages) {
  if (r.path.startsWith("/en/")) continue;
  const segs = r.path.split("/").filter(Boolean);
  if (segs.length < 1) continue;
  if (!FYLKE_SLUGS.has(segs[0])) continue;
  if (segs.length > 2) continue;
  const f = segs[0];
  if (!fylker[f])
    fylker[f] = { fylke: f, hub: null, coursePages: 0, clicks: 0, imps: 0, ctrSum: 0, posSum: 0 };
  if (segs.length === 1) fylker[f].hub = r;
  else fylker[f].coursePages += 1;
  fylker[f].clicks += r.clicks;
  fylker[f].imps += r.imps;
  fylker[f].ctrSum += r.ctr * r.imps;
  fylker[f].posSum += r.pos * r.imps;
}
const fylkeRows = Object.values(fylker)
  .map((f) => ({
    fylke: f.fylke,
    hubClicks: f.hub?.clicks ?? 0,
    hubImps: f.hub?.imps ?? 0,
    hubPos: f.hub?.pos ?? null,
    coursePages: f.coursePages,
    totalClicks: f.clicks,
    totalImps: f.imps,
    ctr: f.imps ? f.ctrSum / f.imps : 0,
    pos: f.imps ? f.posSum / f.imps : 0,
  }))
  .sort((a, b) => b.totalImps - a.totalImps);

// --- Brand vs non-brand ---
const isBrand = (q) => /golfkart/i.test(q);
const brand = queries.filter((q) => isBrand(q.q));
const nonbrand = queries.filter((q) => !isBrand(q.q));

// --- Low-CTR high-imp pages ---
const lowCtrPages = pages
  .filter((p) => p.imps >= 500 && p.ctr < 1.5)
  .sort((a, b) => b.imps - a.imps);

// --- Dormant pages: 0 clicks, ≥100 imps ---
const dormantPages = pages
  .filter((p) => p.clicks === 0 && p.imps >= 100)
  .sort((a, b) => b.imps - a.imps);

// --- Format helpers ---
const pct = (n) => n.toFixed(1) + "%";
const num0 = (n) => Math.round(n).toLocaleString("no-NO");

let md = `# Keyword analysis — golfkart.no\n\n`;
md += `**Source:** GSC export, last 3 months (2026-03-05 → 2026-06-05). **Pulled:** 2026-06-05.\n\n`;

md += `## Headline\n\n`;
md += `| Metric | Value |\n|---|---|\n`;
md += `| Total clicks (top 1000 queries) | ${num0(tQ.clicks)} |\n`;
md += `| Total impressions (top 1000 queries) | ${num0(tQ.imps)} |\n`;
md += `| Avg CTR | ${pct((tQ.clicks / Math.max(tQ.imps, 1)) * 100)} |\n`;
md += `| Tracked queries | ${queries.length.toLocaleString("no-NO")} (GSC cap 1000) |\n`;
md += `| Tracked pages | ${pages.length.toLocaleString("no-NO")} |\n\n`;

md += `### Brand vs non-brand\n\n`;
const tB = total(brand);
const tN = total(nonbrand);
md += `| Bucket | Queries | Clicks | Impressions | CTR |\n|---|--:|--:|--:|--:|\n`;
md += `| Brand ("golfkart*") | ${brand.length} | ${num0(tB.clicks)} | ${num0(tB.imps)} | ${pct((tB.clicks / Math.max(tB.imps, 1)) * 100)} |\n`;
md += `| Non-brand | ${nonbrand.length} | ${num0(tN.clicks)} | ${num0(tN.imps)} | ${pct((tN.clicks / Math.max(tN.imps, 1)) * 100)} |\n\n`;

md += `## 1. Striking-distance opportunities\n\n`;
md += `Queries currently ranking position 5–20 with ≥50 impressions in the last 3 months. "Uplift if top-3" uses a generic CTR curve (28/15/11% at pos 1/2/3) — directional, not a forecast.\n\n`;
md += `**Total potential extra clicks if everything below moved to top 3:** ~${num0(striking.reduce((s, r) => s + Math.max(0, r.upliftClicks), 0))}\n\n`;
md += `### Top 40 by potential uplift\n\n`;
md += `| # | Query | Imp | Clicks | CTR | Pos | Top-3 potential | Uplift |\n|--:|---|--:|--:|--:|--:|--:|--:|\n`;
striking.slice(0, 40).forEach((r, i) => {
  md += `| ${i + 1} | ${r.q} | ${num0(r.imps)} | ${r.clicks} | ${r.ctr.toFixed(1)}% | ${r.pos.toFixed(1)} | ${r.potentialClicks} | +${r.upliftClicks} |\n`;
});
md += `\n`;

md += `## 2. Page-family performance\n\n`;
md += `| Family | Pages | Clicks | Impressions | CTR | Avg pos |\n|---|--:|--:|--:|--:|--:|\n`;
for (const f of familyRows) {
  md += `| ${f.fam} | ${f.pages} | ${num0(f.clicks)} | ${num0(f.imps)} | ${pct(f.ctr)} | ${f.pos.toFixed(1)} |\n`;
}
md += `\n`;

md += `## 3. Fylke (region) performance — Norwegian pages\n\n`;
md += `| Fylke | Course pages | Hub clicks | Hub imps | Total clicks | Total imps | CTR | Avg pos |\n|---|--:|--:|--:|--:|--:|--:|--:|\n`;
for (const c of fylkeRows) {
  md += `| ${c.fylke} | ${c.coursePages} | ${c.hubClicks} | ${num0(c.hubImps)} | ${num0(c.totalClicks)} | ${num0(c.totalImps)} | ${pct(c.ctr)} | ${c.pos.toFixed(1)} |\n`;
}
md += `\n`;

md += `## 4. Low-CTR pages with significant impressions (≥500 imps, <1.5% CTR)\n\n`;
md += `Likely title/meta rewrite targets.\n\n`;
md += `| URL | Imps | Clicks | CTR | Pos |\n|---|--:|--:|--:|--:|\n`;
for (const p of lowCtrPages.slice(0, 40)) {
  md += `| ${p.path} | ${num0(p.imps)} | ${p.clicks} | ${p.ctr.toFixed(2)}% | ${p.pos.toFixed(1)} |\n`;
}
md += `\n`;

md += `## 5. Dormant pages (0 clicks, ≥100 impressions)\n\n`;
md += `Indexed and shown but not earning. Title/snippet, position, or intent mismatch.\n\n`;
md += `| URL | Imps | Pos |\n|---|--:|--:|\n`;
for (const p of dormantPages.slice(0, 30)) {
  md += `| ${p.path} | ${num0(p.imps)} | ${p.pos.toFixed(1)} |\n`;
}
md += `\n`;

fs.mkdirSync("docs", { recursive: true });
fs.writeFileSync(OUT, md);
console.log(`Wrote ${OUT} (${md.length.toLocaleString()} bytes)`);
console.log(`- ${queries.length} queries, ${pages.length} pages`);
console.log(`- ${striking.length} striking-distance queries (pos 5-20, imps>=50)`);
console.log(`- ${familyRows.length} page families, ${fylkeRows.length} fylker`);
console.log(`- ${lowCtrPages.length} low-CTR high-imp pages, ${dormantPages.length} dormant pages`);
