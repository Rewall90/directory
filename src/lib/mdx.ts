import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

const contentDirectory = path.join(process.cwd(), "content");

export interface MDXFrontMatter {
  title: string;
  description: string;
  author?: string;
  publishedAt?: string;
  tags?: string[];
  [key: string]: unknown;
}

export interface MDXContent {
  slug: string;
  frontMatter: MDXFrontMatter;
  content: string;
}

/**
 * Resolve the content directory path for a given content type and optional locale.
 * When locale is "en", appends /en to the path.
 * When locale is "nb" or undefined, uses the base path (no subdirectory).
 */
function resolveContentPath(contentType: string, locale?: string): string {
  if (locale && locale !== "nb") {
    return path.join(contentDirectory, contentType, locale);
  }
  return path.join(contentDirectory, contentType);
}

/**
 * Get all MDX files from a specific content type directory.
 * Optionally pass a locale ("en") to read from a locale subdirectory.
 */
export function getAllMDXFiles(contentType: string, locale?: string): string[] {
  const contentTypePath = resolveContentPath(contentType, locale);

  if (!fs.existsSync(contentTypePath)) {
    return [];
  }

  const files = fs.readdirSync(contentTypePath);
  return files.filter((file) => file.endsWith(".mdx"));
}

/**
 * Get all slugs for a specific content type.
 * Optionally pass a locale ("en") to read from a locale subdirectory.
 */
export function getAllSlugs(contentType: string, locale?: string): string[] {
  const files = getAllMDXFiles(contentType, locale);
  return files.map((file) => file.replace(/\.mdx$/, ""));
}

/**
 * Get MDX content by slug and content type.
 * Optionally pass a locale ("en") to read from a locale subdirectory.
 */
export function getMDXBySlug(
  contentType: string,
  slug: string,
  locale?: string,
): MDXContent | null {
  try {
    const dirPath = resolveContentPath(contentType, locale);
    const filePath = path.join(dirPath, `${slug}.mdx`);

    if (!fs.existsSync(filePath)) {
      return null;
    }

    const fileContents = fs.readFileSync(filePath, "utf8");
    const { data, content } = matter(fileContents);

    return {
      slug,
      frontMatter: data as MDXFrontMatter,
      content,
    };
  } catch (error) {
    console.error(`Error reading MDX file: ${contentType}/${slug}`, error);
    return null;
  }
}

/**
 * Get all MDX content for a specific content type.
 * Optionally pass a locale ("en") to read from a locale subdirectory.
 */
export function getAllMDX(contentType: string, locale?: string): MDXContent[] {
  const slugs = getAllSlugs(contentType, locale);

  return slugs
    .map((slug) => getMDXBySlug(contentType, slug, locale))
    .filter((content): content is MDXContent => content !== null)
    .sort((a, b) => {
      // Sort by publishedAt date if available, newest first
      const dateA = a.frontMatter.publishedAt ? new Date(a.frontMatter.publishedAt).getTime() : 0;
      const dateB = b.frontMatter.publishedAt ? new Date(b.frontMatter.publishedAt).getTime() : 0;
      return dateB - dateA;
    });
}
