import type { MetadataRoute } from "next";
import { getAllCourses, getRegions } from "@/lib/courses";
import { toRegionSlug } from "@/lib/constants/norway-regions";
import fs from "fs";
import path from "path";
import matter from "gray-matter";

const BASE_URL = "https://golfkart.no";

/** Helper to create alternates for a given path */
function langAlternates(pagePath: string) {
  return {
    languages: {
      nb: `${BASE_URL}${pagePath}`,
      en: `${BASE_URL}/en${pagePath}`,
      "x-default": `${BASE_URL}${pagePath}`,
    },
  };
}

export default function sitemap(): MetadataRoute.Sitemap {
  const courses = getAllCourses();
  const regions = getRegions();

  const staticPages: MetadataRoute.Sitemap = [
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
      alternates: { languages: { nb: BASE_URL, en: `${BASE_URL}/en`, "x-default": BASE_URL } },
    },
    {
      url: `${BASE_URL}/en`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.9,
      alternates: { languages: { nb: BASE_URL, en: `${BASE_URL}/en`, "x-default": BASE_URL } },
    },
    ...["/about", "/contact"].flatMap((p) => [
      {
        url: `${BASE_URL}${p}`,
        lastModified: new Date(),
        changeFrequency: "monthly" as const,
        priority: 0.5,
        alternates: langAlternates(p),
      },
      {
        url: `${BASE_URL}/en${p}`,
        lastModified: new Date(),
        changeFrequency: "monthly" as const,
        priority: 0.4,
        alternates: langAlternates(p),
      },
    ]),
    ...["/privacy", "/terms"].flatMap((p) => [
      {
        url: `${BASE_URL}${p}`,
        lastModified: new Date(),
        changeFrequency: "yearly" as const,
        priority: 0.3,
        alternates: langAlternates(p),
      },
      {
        url: `${BASE_URL}/en${p}`,
        lastModified: new Date(),
        changeFrequency: "yearly" as const,
        priority: 0.2,
        alternates: langAlternates(p),
      },
    ]),
    {
      url: `${BASE_URL}/regions`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.7,
      alternates: langAlternates("/regions"),
    },
    {
      url: `${BASE_URL}/en/regions`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.6,
      alternates: langAlternates("/regions"),
    },
  ];

  const regionPages: MetadataRoute.Sitemap = regions.flatMap((region) => [
    {
      url: `${BASE_URL}/${region}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.8,
      alternates: langAlternates(`/${region}`),
    },
    {
      url: `${BASE_URL}/en/${region}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.7,
      alternates: langAlternates(`/${region}`),
    },
  ]);

  const coursePages: MetadataRoute.Sitemap = courses.flatMap((course) => {
    const regionSlug = toRegionSlug(course.region);
    const lastModified = course.meta.updatedAt ? new Date(course.meta.updatedAt) : new Date();
    const nbPath = `/${regionSlug}/${course.slug}`;
    const enSlug = course.slug_en || course.slug;
    const enPath = `/${regionSlug}/${enSlug}`;
    const courseAlternates = {
      languages: {
        nb: `${BASE_URL}${nbPath}`,
        en: `${BASE_URL}/en${enPath}`,
        "x-default": `${BASE_URL}${nbPath}`,
      },
    };
    return [
      {
        url: `${BASE_URL}${nbPath}`,
        lastModified,
        changeFrequency: "weekly" as const,
        priority: 0.7,
        alternates: courseAlternates,
      },
      {
        url: `${BASE_URL}/en${enPath}`,
        lastModified,
        changeFrequency: "weekly" as const,
        priority: 0.6,
        alternates: courseAlternates,
      },
    ];
  });

  const blogDir = path.join(process.cwd(), "content/blogg");
  const blogEnDir = path.join(blogDir, "en");

  // Read Norwegian blog posts and pair with their English alternates
  const nbBlogFiles = fs.existsSync(blogDir)
    ? fs.readdirSync(blogDir).filter((file) => file.endsWith(".mdx"))
    : [];

  const blogPages: MetadataRoute.Sitemap = nbBlogFiles.flatMap((file) => {
    const content = fs.readFileSync(path.join(blogDir, file), "utf-8");
    const { data } = matter(content);
    const nbSlug = file.replace(".mdx", "");
    const enSlug = (data.alternateSlug as string) || nbSlug;
    const lastModified = data.updatedAt || data.publishedAt || new Date();

    const blogAlternates = {
      languages: {
        nb: `${BASE_URL}/blog/${nbSlug}`,
        en: `${BASE_URL}/en/blog/${enSlug}`,
        "x-default": `${BASE_URL}/blog/${nbSlug}`,
      },
    };

    return [
      {
        url: `${BASE_URL}/blog/${nbSlug}`,
        lastModified,
        changeFrequency: "monthly" as const,
        priority: 0.6,
        alternates: blogAlternates,
      },
    ];
  });

  // Read English blog posts separately
  const enBlogFiles = fs.existsSync(blogEnDir)
    ? fs.readdirSync(blogEnDir).filter((file) => file.endsWith(".mdx"))
    : [];

  const enBlogPages: MetadataRoute.Sitemap = enBlogFiles.map((file) => {
    const content = fs.readFileSync(path.join(blogEnDir, file), "utf-8");
    const { data } = matter(content);
    const enSlug = file.replace(".mdx", "");
    const nbSlug = (data.alternateSlug as string) || enSlug;
    const lastModified = data.updatedAt || data.publishedAt || new Date();

    return {
      url: `${BASE_URL}/en/blog/${enSlug}`,
      lastModified,
      changeFrequency: "monthly" as const,
      priority: 0.5,
      alternates: {
        languages: {
          nb: `${BASE_URL}/blog/${nbSlug}`,
          en: `${BASE_URL}/en/blog/${enSlug}`,
          "x-default": `${BASE_URL}/blog/${nbSlug}`,
        },
      },
    };
  });

  return [...staticPages, ...regionPages, ...coursePages, ...blogPages, ...enBlogPages];
}
