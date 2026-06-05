#!/usr/bin/env node
// Draft title + meta rewrites for the 25 worst-CTR Norwegian course pages.
// Read-only. Writes docs/title-rewrites-draft-2026-06.md.

import fs from 'node:fs';
import path from 'node:path';

const COURSES_DIR = 'content/courses';
const QUERIES_CSV = 'gsc-export/2026-06-05/Queries.csv';
const PAGES_CSV = 'gsc-export/2026-06-05/Pages.csv';
const OUT = 'docs/title-rewrites-draft-2026-06.md';

const parseCsv = (file) => {
  const text = fs.readFileSync(file, 'utf8').replace(/﻿/, '');
  const lines = text.split(/\r?\n/).filter(Boolean);
  const header = lines.shift().split(',');
  return lines.map((line) => {
    const cols = [];
    let cur = '';
    let q = false;
    for (const c of line) {
      if (c === '"') q = !q;
      else if (c === ',' && !q) { cols.push(cur); cur = ''; }
      else cur += c;
    }
    cols.push(cur);
    const o = {};
    header.forEach((h, i) => (o[h] = cols[i]));
    return o;
  });
};

const num = (s) => Number(String(s).replace('%', ''));

const pages = parseCsv(PAGES_CSV).map((r) => ({
  url: r['Top pages'],
  path: new URL(r['Top pages']).pathname,
  clicks: num(r.Clicks),
  imps: num(r.Impressions),
  ctr: num(r.CTR),
  pos: num(r.Position),
}));

const queries = parseCsv(QUERIES_CSV).map((r) => ({
  q: r['Top queries'],
  clicks: num(r.Clicks),
  imps: num(r.Impressions),
  ctr: num(r.CTR),
  pos: num(r.Position),
}));

// Index courses by region/slug
const courseIndex = {};
const regions = fs.readdirSync(COURSES_DIR).filter((f) => !f.startsWith('.'));
for (const region of regions) {
  const dir = path.join(COURSES_DIR, region);
  if (!fs.statSync(dir).isDirectory()) continue;
  for (const f of fs.readdirSync(dir)) {
    if (!f.endsWith('.json')) continue;
    const d = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'));
    courseIndex[`/${region}/${d.slug}`] = { region, course: d, filePath: path.join(dir, f) };
  }
}

// Pick Norwegian course pages with high impressions and low CTR
const candidates = pages
  .filter((p) => !p.path.startsWith('/en/'))
  .filter((p) => p.imps >= 700 && p.ctr < 1.5)
  .filter((p) => {
    const segs = p.path.split('/').filter(Boolean);
    return segs.length === 2; // course detail pages only
  })
  .sort((a, b) => b.imps * (2.5 - b.ctr) - a.imps * (2.5 - a.ctr))
  .slice(0, 25);

// --- Draft generators ---
const stripDot = (s) => s.replace(/\.+$/, '');

const proposeTitle = (course, region) => {
  // Best practice: front-load brand name, add concrete value prop the club site
  // doesn't lead with (holes + greenfee in same glance + city/region anchor).
  const name = course.name;
  const py = Object.keys(course.pricing).sort().pop();
  const p = py ? course.pricing[py] : null;
  const gfWeekday = p?.greenFeeWeekday;
  const gfWeekend = p?.greenFeeWeekend;
  const gfMin = [gfWeekday, gfWeekend].filter((v) => typeof v === 'number' && v > 0).sort((a, b) => a - b)[0];
  const holes = course.course?.holes;
  const city = course.city;

  // Variant A — greenfee/holes anchor (works when both known)
  let a;
  if (gfMin && holes) {
    a = `${name} — ${holes} hull, greenfee fra ${gfMin} kr`;
  } else if (holes) {
    a = `${name} — ${holes} hull i ${city}: greenfee og kart`;
  } else {
    a = `${name} — greenfee, baneinfo og omtaler`;
  }

  // Variant B — guide angle (works universally)
  const b = holes
    ? `${name} — ${holes} hull i ${city}: greenfee, kart, omtaler`
    : `${name} i ${city} — greenfee, baneinfo og omtaler`;

  return { a, b };
};

const proposeDesc = (course, region) => {
  const py = Object.keys(course.pricing).sort().pop();
  const p = py ? course.pricing[py] : null;
  const gfWeekday = p?.greenFeeWeekday;
  const gfWeekend = p?.greenFeeWeekend;
  const holes = course.course?.holes;
  const par = course.course?.par;
  const year = course.course?.yearBuilt;
  const city = course.city;
  const seasonStart = course.season?.start;
  const seasonEnd = course.season?.end;

  const bits = [];
  if (holes && par) bits.push(`${holes}-hulls bane (par ${par})`);
  else if (holes) bits.push(`${holes}-hulls bane`);
  bits.push(`i ${city}`);
  if (year) bits.push(`grunnlagt ${year}`);
  const head = bits.join(' ').replace(' i ', ' i ');

  const gf = [];
  if (typeof gfWeekday === 'number' && gfWeekday > 0) gf.push(`${gfWeekday} kr ukedag`);
  if (typeof gfWeekend === 'number' && gfWeekend > 0 && gfWeekend !== gfWeekday) gf.push(`${gfWeekend} kr helg`);
  const gfStr = gf.length ? ` Greenfee fra ${gf.join(', ')}.` : '';

  const season = seasonStart && seasonEnd ? ` Sesong ${seasonStart}–${seasonEnd}.` : '';
  const cta = ' Se baneinfo, omtaler og kontakt.';

  let desc = `${head}.${gfStr}${season}${cta}`.replace(/\s+/g, ' ').trim();
  if (desc.length > 155) {
    desc = `${head}.${gfStr} Se omtaler og kontakt.`.replace(/\s+/g, ' ').trim();
  }
  if (desc.length > 155) desc = desc.substring(0, 154) + '…';
  return desc;
};

// --- Render ---
let md = `# Title + meta rewrite drafts — tier 1 (golfkart.no)\n\n`;
md += `**Pulled:** 2026-06-05. **Source:** GSC last 3 months. **Scope:** 25 Norwegian course pages with high impressions and <1.5% CTR, weighted by impressions × CTR-gap.\n\n`;
md += `**Goal:** lift CTR from current 0.1–1.4% range toward 3–5% baseline. **Not** ranking changes.\n\n`;
md += `**Template behaviour:** no brand suffix on course pages (root layout has static title, not template). Final \`<title>\` = the string returned by \`generateMetadata\`. Budget ≤60 chars total. Meta ≤155 chars.\n\n`;
md += `**Current template:** \`\${name} - Golf i \${region}\` — e.g. "Sola Golfklubb - Golf i Rogaland" (32 chars). Repeats no value beyond the URL itself.\n\n`;
md += `---\n\n`;

let i = 0;
const drafts = [];
for (const p of candidates) {
  i += 1;
  const entry = courseIndex[p.path];
  if (!entry) {
    md += `## ${i}. \`${p.path}\` — NO MATCH in content dir\n\n`;
    continue;
  }
  const { region, course } = entry;
  const currentTitle = `${course.name} - Golf i ${course.region}`;
  const props = proposeTitle(course, region);
  const desc = proposeDesc(course, region);

  // Find top landing queries for this page (heuristic: queries containing name tokens)
  const tokens = course.name.toLowerCase().split(/[\s-]+/).filter((t) => t.length > 2);
  const relevantQs = queries
    .filter((q) => tokens.some((t) => q.q.toLowerCase().includes(t)))
    .sort((a, b) => b.imps - a.imps)
    .slice(0, 5);

  md += `## ${i}. \`${p.path}\`\n\n`;
  md += `**Performance:** ${p.imps.toLocaleString('no-NO')} imps · ${p.clicks} clicks · ${p.ctr.toFixed(2)}% CTR · pos ${p.pos.toFixed(1)}\n\n`;
  if (relevantQs.length) {
    md += `**Top landing queries (heuristic match by name tokens):**\n`;
    for (const q of relevantQs) {
      md += `- \`${q.q}\` — ${q.imps} imps, ${q.clicks} clicks, ${q.ctr.toFixed(1)}% CTR, pos ${q.pos.toFixed(1)}\n`;
    }
    md += `\n`;
  }
  md += `**Current title:** ${currentTitle} _(${currentTitle.length} chars)_\n\n`;
  md += `**Variant A (greenfee/holes anchor):** ${props.a} _(${props.a.length} chars)_\n\n`;
  md += `**Variant B (guide angle):** ${props.b} _(${props.b.length} chars)_\n\n`;
  md += `**Proposed meta:** ${desc} _(${desc.length} chars)_\n\n`;
  md += `---\n\n`;

  drafts.push({ path: p.path, filePath: entry.filePath, course, props, desc });
}

fs.mkdirSync('docs', { recursive: true });
fs.writeFileSync(OUT, md);
console.log(`Wrote ${OUT} — ${drafts.length} pages drafted`);
console.log(`\nManifest (path → variant lengths):`);
for (const d of drafts) {
  const aLen = d.props.a.length;
  const bLen = d.props.b.length;
  const aMark = aLen <= 60 ? '✓' : 'X';
  const bMark = bLen <= 60 ? '✓' : 'X';
  console.log(`  ${d.path.padEnd(50)}  A:${aLen}${aMark}  B:${bLen}${bMark}  meta:${d.desc.length}`);
}
