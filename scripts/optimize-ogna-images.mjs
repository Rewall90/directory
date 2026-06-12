// One-off image optimizer for Ogna Golfklubb.
// Resizes to max 2000px wide, encodes WebP q80, generates 12x base64 LQIP.
import sharp from "sharp";
import { writeFile, mkdir } from "node:fs/promises";
import { statSync } from "node:fs";
import { resolve, join } from "node:path";

const DESKTOP = "C:\\Users\\Petter\\Desktop";
const OUT_DIR = resolve("public/courses/ogna-golfklubb");

const jobs = [
  {
    src: join(DESKTOP, "IMG_1615-1-scaled.jpg"),
    out: "ogna-golfklubb-flyfoto-jaerkysten.webp",
  },
  {
    src: join(DESKTOP, "Sponsorturnering-2025 (1).png"),
    out: "ogna-golfklubb-klubbhus-flyfoto.webp",
  },
  {
    src: join(DESKTOP, "Ogna-golfklubb-05-scaled.jpg"),
    out: "ogna-golfklubb-driving-range-og-klubbhus.webp",
  },
  {
    src: join(DESKTOP, "klubbhuslogo (1).jpg"),
    out: "ogna-golfklubb-jaeren-sparebank-golf-arena.webp",
  },
];

await mkdir(OUT_DIR, { recursive: true });

const placeholders = {};

for (const job of jobs) {
  const inBytes = statSync(job.src).size;
  const buf = await sharp(job.src)
    .rotate()
    .resize({ width: 2000, withoutEnlargement: true })
    .webp({ quality: 80, effort: 6 })
    .toBuffer();
  const outPath = join(OUT_DIR, job.out);
  await writeFile(outPath, buf);

  const lqip = await sharp(job.src).rotate().resize({ width: 12 }).webp({ quality: 35 }).toBuffer();
  const dataUri = `data:image/webp;base64,${lqip.toString("base64")}`;
  placeholders[job.out] = dataUri;

  const inKB = (inBytes / 1024).toFixed(0);
  const outKB = (buf.length / 1024).toFixed(0);
  const meta = await sharp(buf).metadata();
  console.log(
    `${job.out}  ${meta.width}x${meta.height}  ${inKB}KB -> ${outKB}KB  (-${Math.round((1 - buf.length / inBytes) * 100)}%)`,
  );
}

console.log("\nPLACEHOLDERS_JSON_START");
console.log(JSON.stringify(placeholders, null, 2));
console.log("PLACEHOLDERS_JSON_END");
