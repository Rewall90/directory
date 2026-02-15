const fs = require("fs");
const path = require("path");

const files = [];
function walk(d) {
  for (const f of fs.readdirSync(d)) {
    const fp = path.join(d, f);
    if (fs.statSync(fp).isDirectory()) walk(fp);
    else if (f.endsWith(".json")) files.push(fp);
  }
}
walk(path.join("content", "courses"));

const keys = [
  "greenFee18",
  "greenFee9",
  "greenFeeJunior",
  "greenFeeTwilight",
  "cartRental",
  "clubRental",
  "pullCartRental",
];
const clubs = [];

for (const f of files.sort()) {
  const d = JSON.parse(fs.readFileSync(f, "utf-8"));
  const p26 = (d.pricing && d.pricing["2026"]) || {};
  let nullCount = 0;
  const missing = [];
  for (const k of keys) {
    if (p26[k] === null || p26[k] === undefined) {
      nullCount++;
      missing.push(k);
    }
  }
  const website = d.contact && d.contact.website;
  if (nullCount >= 4 && website) {
    const region = f.split(path.sep).slice(-2, -1)[0];
    clubs.push({
      nullCount,
      name: d.name,
      website,
      file: region + "/" + path.basename(f),
      missing: missing.join(","),
    });
  }
}

clubs.sort((a, b) => b.nullCount - a.nullCount);
console.log(`Found ${clubs.length} clubs with 4+ null fields in pricing.2026:\n`);
for (const c of clubs.slice(0, 50)) {
  console.log(`${c.nullCount}/7 null | ${c.name} | ${c.website} | ${c.file}`);
}
