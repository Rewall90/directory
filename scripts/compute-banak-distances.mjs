import fs from "node:fs";
import path from "node:path";

const dir = "content/courses/finnmark";
const banak = { lat: 70.0646, lng: 24.9872 };

function hav(a, b, c, d) {
  const R = 6371;
  const t = (x) => (x * Math.PI) / 180;
  const dl = t(c - a);
  const dn = t(d - b);
  const x = Math.sin(dl / 2) ** 2 + Math.cos(t(a)) * Math.cos(t(c)) * Math.sin(dn / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(x));
}

for (const f of fs.readdirSync(dir).filter((x) => x.endsWith(".json"))) {
  const j = JSON.parse(fs.readFileSync(path.join(dir, f), "utf8"));
  if (!j.coordinates) {
    console.log(`${f.padEnd(40)}  NO COORDS  city: ${j.city}`);
    continue;
  }
  const d = hav(banak.lat, banak.lng, j.coordinates.lat, j.coordinates.lng);
  console.log(`${f.padEnd(40)}  ${j.slug.padEnd(35)}  ${(Math.round(d * 10) / 10).toFixed(1)} km`);
}
