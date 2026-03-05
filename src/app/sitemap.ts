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
      alternates: { languages: { nb: BASE_URL, en: `${BASE_URL}/en` } },
    },
    {
      url: `${BASE_URL}/en`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.9,
      alternates: { languages: { nb: BASE_URL, en: `${BASE_URL}/en` } },
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
    const coursePath = `/${regionSlug}/${course.slug}`;
    return [
      {
        url: `${BASE_URL}${coursePath}`,
        lastModified,
        changeFrequency: "weekly" as const,
        priority: 0.7,
        alternates: langAlternates(coursePath),
      },
      {
        url: `${BASE_URL}/en${coursePath}`,
        lastModified,
        changeFrequency: "weekly" as const,
        priority: 0.6,
        alternates: langAlternates(coursePath),
      },
    ];
  });

  const blogDir = path.join(process.cwd(), "content/blogg");
  const blogPages: MetadataRoute.Sitemap = fs.existsSync(blogDir)
    ? fs
        .readdirSync(blogDir)
        .filter((file) => file.endsWith(".mdx"))
        .flatMap((file) => {
          const content = fs.readFileSync(path.join(blogDir, file), "utf-8");
          const { data } = matter(content);
          const slug = file.replace(".mdx", "");
          const lastModified = data.updatedAt || data.publishedAt || new Date();
          const blogPath = `/blog/${slug}`;
          return [
            {
              url: `${BASE_URL}${blogPath}`,
              lastModified,
              changeFrequency: "monthly" as const,
              priority: 0.6,
              alternates: langAlternates(blogPath),
            },
            {
              url: `${BASE_URL}/en${blogPath}`,
              lastModified,
              changeFrequency: "monthly" as const,
              priority: 0.5,
              alternates: langAlternates(blogPath),
            },
          ];
        })
    : [];

  return [...staticPages, ...regionPages, ...coursePages, ...blogPages];
}
