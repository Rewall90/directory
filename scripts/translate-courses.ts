import fs from "fs";
import path from "path";
import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic();
const COURSES_DIR = path.join(process.cwd(), "content", "courses");

interface TranslationInput {
  [fieldPath: string]: string;
}

interface TranslationOutput {
  slug_en: string;
  [fieldPath: string]: string;
}

function extractTranslatableFields(course: Record<string, unknown>): TranslationInput {
  const fields: TranslationInput = {};

  // Top-level fields
  if (course.name) fields["name"] = course.name as string;
  if (course.description) fields["description"] = course.description as string;

  // Course details
  const courseDetails = course.course as Record<string, unknown> | undefined;
  if (courseDetails?.terrain) fields["course.terrain"] = courseDetails.terrain as string;
  if (courseDetails?.courseType) fields["course.courseType"] = courseDetails.courseType as string;
  if (courseDetails?.designer) fields["course.designer"] = courseDetails.designer as string;
  if (courseDetails?.signatureHole)
    fields["course.signatureHole"] = courseDetails.signatureHole as string;
  if (courseDetails?.scenicHole) fields["course.scenicHole"] = courseDetails.scenicHole as string;
  if (courseDetails?.viewDescription)
    fields["course.viewDescription"] = courseDetails.viewDescription as string;

  // Season
  const season = course.season as Record<string, unknown> | undefined;
  if (season?.winterUse) fields["season.winterUse"] = season.winterUse as string;

  // Visitors
  const visitors = course.visitors as Record<string, unknown> | undefined;
  if (visitors?.dressCode) fields["visitors.dressCode"] = visitors.dressCode as string;

  // Pricing (each year)
  const pricing = course.pricing as Record<string, Record<string, unknown>> | undefined;
  if (pricing) {
    for (const [year, yearPricing] of Object.entries(pricing)) {
      if (yearPricing.greenFeeDescription) {
        fields[`pricing.${year}.greenFeeDescription`] = yearPricing.greenFeeDescription as string;
      }
      if (yearPricing.notes) {
        fields[`pricing.${year}.notes`] = yearPricing.notes as string;
      }
    }
  }

  // Membership pricing (each year, each tier)
  const membershipPricing = course.membershipPricing as
    | Record<string, Array<Record<string, unknown>>>
    | undefined;
  if (membershipPricing) {
    for (const [year, tiers] of Object.entries(membershipPricing)) {
      tiers.forEach((tier, index) => {
        if (tier.name) fields[`membershipPricing.${year}.${index}.name`] = tier.name as string;
        if (tier.description)
          fields[`membershipPricing.${year}.${index}.description`] = tier.description as string;
        if (tier.restrictions)
          fields[`membershipPricing.${year}.${index}.restrictions`] = tier.restrictions as string;
      });
    }
  }

  // Membership status
  const membershipStatus = course.membershipStatus as Record<string, unknown> | undefined;
  if (membershipStatus?.joiningFeeNote) {
    fields["membershipStatus.joiningFeeNote"] = membershipStatus.joiningFeeNote as string;
  }

  return fields;
}

function applyTranslations(course: Record<string, unknown>, translations: TranslationOutput): void {
  // Set slug_en and name_en at top level
  course.slug_en = translations.slug_en;
  if (translations.name) course.name_en = translations.name;
  if (translations.description) course.description_en = translations.description;

  // Course details
  const courseDetails = course.course as Record<string, unknown>;
  if (courseDetails) {
    if (translations["course.terrain"]) courseDetails.terrain_en = translations["course.terrain"];
    if (translations["course.courseType"])
      courseDetails.courseType_en = translations["course.courseType"];
    if (translations["course.designer"])
      courseDetails.designer_en = translations["course.designer"];
    if (translations["course.signatureHole"])
      courseDetails.signatureHole_en = translations["course.signatureHole"];
    if (translations["course.scenicHole"])
      courseDetails.scenicHole_en = translations["course.scenicHole"];
    if (translations["course.viewDescription"])
      courseDetails.viewDescription_en = translations["course.viewDescription"];
  }

  // Season
  const season = course.season as Record<string, unknown>;
  if (season && translations["season.winterUse"]) {
    season.winterUse_en = translations["season.winterUse"];
  }

  // Visitors
  const visitors = course.visitors as Record<string, unknown>;
  if (visitors && translations["visitors.dressCode"]) {
    visitors.dressCode_en = translations["visitors.dressCode"];
  }

  // Pricing
  const pricing = course.pricing as Record<string, Record<string, unknown>>;
  if (pricing) {
    for (const [year, yearPricing] of Object.entries(pricing)) {
      if (translations[`pricing.${year}.greenFeeDescription`]) {
        yearPricing.greenFeeDescription_en = translations[`pricing.${year}.greenFeeDescription`];
      }
      if (translations[`pricing.${year}.notes`]) {
        yearPricing.notes_en = translations[`pricing.${year}.notes`];
      }
    }
  }

  // Membership pricing
  const membershipPricing = course.membershipPricing as Record<
    string,
    Array<Record<string, unknown>>
  >;
  if (membershipPricing) {
    for (const [year, tiers] of Object.entries(membershipPricing)) {
      tiers.forEach((tier, index) => {
        if (translations[`membershipPricing.${year}.${index}.name`]) {
          tier.name_en = translations[`membershipPricing.${year}.${index}.name`];
        }
        if (translations[`membershipPricing.${year}.${index}.description`]) {
          tier.description_en = translations[`membershipPricing.${year}.${index}.description`];
        }
        if (translations[`membershipPricing.${year}.${index}.restrictions`]) {
          tier.restrictions_en = translations[`membershipPricing.${year}.${index}.restrictions`];
        }
      });
    }
  }

  // Membership status
  const membershipStatus = course.membershipStatus as Record<string, unknown>;
  if (membershipStatus && translations["membershipStatus.joiningFeeNote"]) {
    membershipStatus.joiningFeeNote_en = translations["membershipStatus.joiningFeeNote"];
  }
}

async function translateCourse(coursePath: string, dryRun: boolean): Promise<boolean> {
  const courseData = JSON.parse(fs.readFileSync(coursePath, "utf-8"));

  // Skip if already translated
  if (courseData.slug_en) {
    return false;
  }

  const fields = extractTranslatableFields(courseData);

  if (Object.keys(fields).length === 0) {
    return false;
  }

  if (dryRun) {
    console.log(`  Would translate ${Object.keys(fields).length} fields`);
    return false;
  }

  const response = await anthropic.messages.create({
    model: "claude-sonnet-4-5-20250929",
    max_tokens: 4000,
    messages: [
      {
        role: "user",
        content: `Translate these Norwegian golf course fields to English. Rules:
- Keep proper nouns (club names, city names, person names) recognizable
- Transliterate Norwegian characters: ae->ae, o->o, a->a for the slug
- Use standard English golf terminology (e.g., "hull" -> "hole", "bane" -> "course")
- Generate a URL-safe slug_en from the course name (lowercase, hyphens, no special chars)
- Return ONLY a valid JSON object with the same keys as input plus a "slug_en" key
- For the name field: keep the original club name structure but translate descriptive parts

Input:
${JSON.stringify(fields, null, 2)}`,
      },
    ],
  });

  // Extract JSON from response
  const textContent = response.content.find((c) => c.type === "text");
  if (!textContent || textContent.type !== "text") {
    throw new Error("No text response from API");
  }

  // Parse JSON - handle markdown code blocks
  let jsonStr = textContent.text.trim();
  if (jsonStr.startsWith("```")) {
    jsonStr = jsonStr.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "");
  }

  const translations: TranslationOutput = JSON.parse(jsonStr);

  // Apply translations to the course data
  applyTranslations(courseData, translations);

  // Write back
  fs.writeFileSync(coursePath, JSON.stringify(courseData, null, 2) + "\n", "utf-8");

  return true;
}

async function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes("--dry-run");
  const regionArg = args.find((a) => a.startsWith("--region="));
  const regionFilter = regionArg ? regionArg.split("=")[1] : null;

  console.log(`Course Translation Script${dryRun ? " (DRY RUN)" : ""}`);
  if (regionFilter) console.log(`Filtering to region: ${regionFilter}`);

  // Collect all course files
  const regions = fs.readdirSync(COURSES_DIR).filter((f) => {
    const stat = fs.statSync(path.join(COURSES_DIR, f));
    return stat.isDirectory() && (!regionFilter || f === regionFilter);
  });

  const courseFiles: string[] = [];
  for (const region of regions) {
    const regionDir = path.join(COURSES_DIR, region);
    const files = fs.readdirSync(regionDir).filter((f) => f.endsWith(".json"));
    for (const file of files) {
      courseFiles.push(path.join(regionDir, file));
    }
  }

  console.log(`Found ${courseFiles.length} course files\n`);

  let translated = 0;
  let skipped = 0;
  let errors = 0;

  for (let i = 0; i < courseFiles.length; i++) {
    const filePath = courseFiles[i];
    const fileName = path.basename(filePath);
    console.log(`[${i + 1}/${courseFiles.length}] ${fileName}...`);

    try {
      const wasTranslated = await translateCourse(filePath, dryRun);
      if (wasTranslated) {
        translated++;
        console.log(`  Translated`);
      } else {
        skipped++;
        console.log(`  - Skipped`);
      }
    } catch (error) {
      errors++;
      console.error(`  ERROR: ${error instanceof Error ? error.message : String(error)}`);
    }

    // Rate limiting
    if (!dryRun && i < courseFiles.length - 1) {
      await new Promise((resolve) => setTimeout(resolve, 500));
    }
  }

  console.log(`\nDone! Translated: ${translated}, Skipped: ${skipped}, Errors: ${errors}`);
}

main().catch(console.error);
