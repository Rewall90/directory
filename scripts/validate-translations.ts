import fs from "fs";
import path from "path";

const COURSES_DIR = path.join(process.cwd(), "content", "courses");
const BLOG_DIR = path.join(process.cwd(), "content", "blogg");
const MESSAGES_DIR = path.join(process.cwd(), "messages");

interface ValidationError {
  type: "error" | "warning";
  file: string;
  message: string;
}

const errors: ValidationError[] = [];

function validateCourseTranslations() {
  console.log("Validating course translations...\n");

  const slugEnSet = new Set<string>();
  let totalCourses = 0;
  let translatedCourses = 0;

  const regions = fs.readdirSync(COURSES_DIR).filter((f) => {
    return fs.statSync(path.join(COURSES_DIR, f)).isDirectory();
  });

  for (const region of regions) {
    const regionDir = path.join(COURSES_DIR, region);
    const files = fs.readdirSync(regionDir).filter((f) => f.endsWith(".json"));

    for (const file of files) {
      totalCourses++;
      const filePath = path.join(regionDir, file);
      const course = JSON.parse(fs.readFileSync(filePath, "utf-8"));

      // Check slug_en
      if (!course.slug_en) {
        errors.push({
          type: "error",
          file: `${region}/${file}`,
          message: "Missing slug_en",
        });
        continue;
      }

      translatedCourses++;

      // Check uniqueness
      if (slugEnSet.has(course.slug_en)) {
        errors.push({
          type: "error",
          file: `${region}/${file}`,
          message: `Duplicate slug_en: ${course.slug_en}`,
        });
      }
      slugEnSet.add(course.slug_en);

      // Check name_en
      if (!course.name_en) {
        errors.push({
          type: "error",
          file: `${region}/${file}`,
          message: "Missing name_en",
        });
      }

      // Check description_en if description exists
      if (course.description && !course.description_en) {
        errors.push({
          type: "warning",
          file: `${region}/${file}`,
          message: "Has description but missing description_en",
        });
      }

      // Check terrain_en
      if (course.course?.terrain && !course.course?.terrain_en) {
        errors.push({
          type: "warning",
          file: `${region}/${file}`,
          message: "Has terrain but missing terrain_en",
        });
      }

      // Check for untranslated fields (identical to Norwegian)
      if (course.name_en && course.name_en === course.name) {
        errors.push({
          type: "warning",
          file: `${region}/${file}`,
          message: "name_en is identical to name (possibly untranslated)",
        });
      }
      if (course.description_en && course.description_en === course.description) {
        errors.push({
          type: "warning",
          file: `${region}/${file}`,
          message: "description_en is identical to description (possibly untranslated)",
        });
      }
    }
  }

  console.log(`  Courses: ${translatedCourses}/${totalCourses} translated`);
}

function validateBlogTranslations() {
  console.log("\nValidating blog translations...\n");

  const nbPosts = fs.existsSync(BLOG_DIR)
    ? fs.readdirSync(BLOG_DIR).filter((f) => f.endsWith(".mdx"))
    : [];

  const enDir = path.join(BLOG_DIR, "en");
  const enPosts = fs.existsSync(enDir)
    ? fs.readdirSync(enDir).filter((f) => f.endsWith(".mdx"))
    : [];

  console.log(`  Norwegian posts: ${nbPosts.length}`);
  console.log(`  English posts: ${enPosts.length}`);

  if (enPosts.length < nbPosts.length) {
    errors.push({
      type: "warning",
      file: "content/blogg/en/",
      message: `Only ${enPosts.length}/${nbPosts.length} blog posts translated`,
    });
  }
}

function getNestedKeys(obj: Record<string, unknown>, prefix = ""): string[] {
  const keys: string[] = [];
  for (const [key, value] of Object.entries(obj)) {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    if (value && typeof value === "object" && !Array.isArray(value)) {
      keys.push(...getNestedKeys(value as Record<string, unknown>, fullKey));
    } else {
      keys.push(fullKey);
    }
  }
  return keys;
}

function validateMessageFiles() {
  console.log("\nValidating message files...\n");

  const nbPath = path.join(MESSAGES_DIR, "nb.json");
  const enPath = path.join(MESSAGES_DIR, "en.json");

  if (!fs.existsSync(nbPath) || !fs.existsSync(enPath)) {
    errors.push({
      type: "error",
      file: "messages/",
      message: "Missing nb.json or en.json",
    });
    return;
  }

  const nb = JSON.parse(fs.readFileSync(nbPath, "utf-8"));
  const en = JSON.parse(fs.readFileSync(enPath, "utf-8"));

  const nbKeys = new Set(getNestedKeys(nb));
  const enKeys = new Set(getNestedKeys(en));

  // Keys in nb but not in en
  for (const key of nbKeys) {
    if (!enKeys.has(key)) {
      errors.push({
        type: "error",
        file: "messages/en.json",
        message: `Missing key: ${key}`,
      });
    }
  }

  // Keys in en but not in nb
  for (const key of enKeys) {
    if (!nbKeys.has(key)) {
      errors.push({
        type: "warning",
        file: "messages/nb.json",
        message: `Extra key in en.json: ${key}`,
      });
    }
  }

  console.log(`  nb.json keys: ${nbKeys.size}`);
  console.log(`  en.json keys: ${enKeys.size}`);
}

function main() {
  console.log("Translation Validation Report\n" + "=".repeat(40) + "\n");

  validateCourseTranslations();
  validateBlogTranslations();
  validateMessageFiles();

  // Summary
  const errorCount = errors.filter((e) => e.type === "error").length;
  const warningCount = errors.filter((e) => e.type === "warning").length;

  console.log("\n" + "=".repeat(40));
  console.log(`\nResults: ${errorCount} errors, ${warningCount} warnings\n`);

  if (errors.length > 0) {
    console.log("Issues found:\n");

    // Print errors first
    const errs = errors.filter((e) => e.type === "error");
    if (errs.length > 0) {
      console.log("ERRORS:");
      errs.forEach((e) => console.log(`  \u2717 [${e.file}] ${e.message}`));
    }

    const warns = errors.filter((e) => e.type === "warning");
    if (warns.length > 0) {
      console.log("\nWARNINGS:");
      warns.forEach((e) => console.log(`  \u26A0 [${e.file}] ${e.message}`));
    }
  }

  // Exit with error code if there are actual errors
  if (errorCount > 0) {
    process.exit(1);
  }
}

main();
