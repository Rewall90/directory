// One-off image optimizer for North Cape Golf Club / Banak Links.
// Source images are already small (890x500) — re-encode to WebP and generate LQIP.
import sharp from "sharp";
import { writeFile, mkdir } from "node:fs/promises";
import { statSync } from "node:fs";
import { resolve, join } from "node:path";

const SRC_DIR = "C:/Users/Petter/AppData/Local/Temp/banak";
const OUT_DIR = resolve("public/courses/north-cape-golf-club");

const jobs = [
  {
    src: join(SRC_DIR, "Fairway-hull-6-og-klubbhus-main.jpg"),
    out: "north-cape-golf-club-banak-links-hull-6-flyfoto.webp",
  },
  {
    src: join(SRC_DIR, "Klubbhuset-ovenfra-main.jpg"),
    out: "north-cape-golf-club-klubbhus-porsangerfjorden.webp",
  },
  {
    src: join(SRC_DIR, "03MOpl085rNb-main.jpg"),
    out: "north-cape-golf-club-green-finnmarksvidda.webp",
  },
  {
    src: join(SRC_DIR, "lAJeIJ0UvDQj-main.jpg"),
    out: "north-cape-golf-club-anno-1997-midnattssol.webp",
  },
];

await mkdir(OUT_DIR, { recursive: true });

const placeholders = {};

for (const job of jobs) {
  const inBytes = statSync(job.src).size;
  const buf = await sharp(job.src).rotate().webp({ quality: 82, effort: 6 }).toBuffer();
  await writeFile(join(OUT_DIR, job.out), buf);

  const lqip = await sharp(job.src).rotate().resize({ width: 12 }).webp({ quality: 35 }).toBuffer();
  placeholders[job.out] = `data:image/webp;base64,${lqip.toString("base64")}`;

  const meta = await sharp(buf).metadata();
  console.log(
    `${job.out}  ${meta.width}x${meta.height}  ${(inBytes / 1024).toFixed(0)}KB -> ${(buf.length / 1024).toFixed(0)}KB  (-${Math.round((1 - buf.length / inBytes) * 100)}%)`,
  );
}

console.log("\nPLACEHOLDERS_JSON_START");
console.log(JSON.stringify(placeholders, null, 2));
console.log("PLACEHOLDERS_JSON_END");
