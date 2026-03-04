import fs from "fs";
import path from "path";
import matter from "gray-matter";
import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic();
const BLOG_DIR = path.join(process.cwd(), "content", "blogg");
const BLOG_EN_DIR = path.join(BLOG_DIR, "en");

async function translateBlogPost(filePath: string, dryRun: boolean): Promise<boolean> {
  const fileContents = fs.readFileSync(filePath, "utf-8");
  const { data: frontMatter, content } = matter(fileContents);

  const slug = path.basename(filePath, ".mdx");

  // Check if English version already exists
  const enPath = path.join(BLOG_EN_DIR, `${slug}.mdx`);
  if (fs.existsSync(enPath)) {
    console.log(`  Skipped (already translated)`);
    return false;
  }

  if (dryRun) {
    console.log(`  Would translate: ${frontMatter.title}`);
    console.log(`  Content length: ${content.length} chars`);
    return false;
  }

  const response = await anthropic.messages.create({
    model: "claude-sonnet-4-5-20250929",
    max_tokens: 8000,
    messages: [
      {
        role: "user",
        content: `Translate this Norwegian golf blog post to English for UK golfers. Rules:
- Translate the title, description, seoDescription (if present), and full MDX content
- Keep all MDX formatting (headings, links, bold, lists, etc.) intact
- Keep proper nouns recognizable (club names, place names)
- Use British English spelling (colour, centre, etc.)
- Use standard golf terminology
- Generate a URL-safe English slug from the translated title
- Return a JSON object with these fields:
  - "slug_en": URL-safe English slug
  - "title": translated title
  - "description": translated description
  - "seoDescription": translated seoDescription (if original had one)
  - "content": translated MDX body content (everything after frontmatter)

Original frontmatter:
${JSON.stringify(frontMatter, null, 2)}

Original MDX content:
${content}`,
      },
    ],
  });

  const textContent = response.content.find((c) => c.type === "text");
  if (!textContent || textContent.type !== "text") {
    throw new Error("No text response from API");
  }

  let jsonStr = textContent.text.trim();
  if (jsonStr.startsWith("```")) {
    jsonStr = jsonStr.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "");
  }

  const translation = JSON.parse(jsonStr);

  // Build English frontmatter
  const enFrontMatter: Record<string, unknown> = {
    ...frontMatter,
    title: translation.title,
    description: translation.description,
  };
  if (translation.seoDescription) {
    enFrontMatter.seoDescription = translation.seoDescription;
  }

  // Write English MDX file
  const enContent = matter.stringify(translation.content, enFrontMatter);

  // Ensure en directory exists
  if (!fs.existsSync(BLOG_EN_DIR)) {
    fs.mkdirSync(BLOG_EN_DIR, { recursive: true });
  }

  // Use the English slug as the filename
  const enSlug = translation.slug_en || slug;
  const enFilePath = path.join(BLOG_EN_DIR, `${enSlug}.mdx`);
  fs.writeFileSync(enFilePath, enContent, "utf-8");

  return true;
}

async function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes("--dry-run");

  console.log(`Blog Translation Script${dryRun ? " (DRY RUN)" : ""}\n`);

  // Get all Norwegian blog posts
  const files = fs.readdirSync(BLOG_DIR).filter((f) => f.endsWith(".mdx"));
  console.log(`Found ${files.length} blog posts to translate\n`);

  let translated = 0;
  let skipped = 0;
  let errors = 0;

  for (let i = 0; i < files.length; i++) {
    const filePath = path.join(BLOG_DIR, files[i]);
    console.log(`[${i + 1}/${files.length}] ${files[i]}`);

    try {
      const wasTranslated = await translateBlogPost(filePath, dryRun);
      if (wasTranslated) {
        translated++;
        console.log(`  Translated`);
      } else {
        skipped++;
      }
    } catch (error) {
      errors++;
      console.error(`  Error: ${error instanceof Error ? error.message : String(error)}`);
    }

    // Rate limiting
    if (!dryRun && i < files.length - 1) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }

  console.log(`\nDone! Translated: ${translated}, Skipped: ${skipped}, Errors: ${errors}`);
}

main().catch(console.error);
