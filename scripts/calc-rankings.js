const fs = require("fs");
const path = require("path");

const coursesDir = path.join(__dirname, "..", "content", "courses");
const courses = [];

const regions = fs.readdirSync(coursesDir);
for (const region of regions) {
  const regionPath = path.join(coursesDir, region);
  if (fs.statSync(regionPath).isDirectory()) {
    const files = fs.readdirSync(regionPath).filter((f) => f.endsWith(".json"));
    for (const file of files) {
      try {
        const content = fs.readFileSync(path.join(regionPath, file), "utf8");
        if (!content.trim()) continue;
        const data = JSON.parse(content);
        if (data.ratings && data.ratings.google) {
          const google = data.ratings.google;
          const rating = google.rating || 0;
          const count = google.reviewCount || 0;
          // Bayesian average: (R*v + C*m) / (v + m) where C=4.38, m=25
          const score = (rating * count + 4.38 * 25) / (count + 25);
          courses.push({
            name: data.name,
            slug: data.slug,
            region: data.region,
            regionSlug: region,
            rating: rating,
            reviewCount: count,
            score: Math.round(score * 100) / 100,
          });
        }
      } catch (e) {
        console.error(`Error parsing ${file}: ${e.message}`);
      }
    }
  }
}

// Sort by score descending
courses.sort((a, b) => b.score - a.score);

// Print top 15
console.log("Top 15 Golf Courses (Feb 2026):");
console.log("================================");
courses.slice(0, 15).forEach((c, i) => {
  console.log(`${i + 1}. ${c.name} (${c.region})`);
  console.log(`   Rating: ${c.rating} | Reviews: ${c.reviewCount} | Score: ${c.score}`);
  console.log(`   Slug: ${c.regionSlug}/${c.slug}`);
});

// Output as JSON for easy copy
console.log("\n\nJSON for MDX:");
console.log(
  JSON.stringify(
    courses.slice(0, 10).map((c, i) => ({
      rank: i + 1,
      name: c.name,
      region: c.region,
      rating: c.rating,
      reviewCount: c.reviewCount,
      score: c.score,
      courseSlug: c.slug,
      regionSlug: c.regionSlug,
    })),
    null,
    2,
  ),
);
