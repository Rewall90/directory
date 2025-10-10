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
 * Get all MDX files from a specific content type directory
 */
export function getAllMDXFiles(contentType: string): string[] {
  const contentTypePath = path.join(contentDirectory, contentType);

  if (!fs.existsSync(contentTypePath)) {
    return [];
  }

  const files = fs.readdirSync(contentTypePath);
  return files.filter((file) => file.endsWith(".mdx"));
}

/**
 * Get all slugs for a specific content type
 */
export function getAllSlugs(contentType: string): string[] {
  const files = getAllMDXFiles(contentType);
  return files.map((file) => file.replace(/\.mdx$/, ""));
}

/**
 * Get MDX content by slug and content type
 */
export function getMDXBySlug(contentType: string, slug: string): MDXContent | null {
  try {
    const filePath = path.join(contentDirectory, contentType, `${slug}.mdx`);

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
 * Get all MDX content for a specific content type
 */
export function getAllMDX(contentType: string): MDXContent[] {
  const slugs = getAllSlugs(contentType);

  return slugs
    .map((slug) => getMDXBySlug(contentType, slug))
    .filter((content): content is MDXContent => content !== null)
    .sort((a, b) => {
      // Sort by publishedAt date if available, newest first
      const dateA = a.frontMatter.publishedAt ? new Date(a.frontMatter.publishedAt).getTime() : 0;
      const dateB = b.frontMatter.publishedAt ? new Date(b.frontMatter.publishedAt).getTime() : 0;
      return dateB - dateA;
    });
}
