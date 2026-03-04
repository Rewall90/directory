import type { MetadataRoute } from "next";
import { getAllCourses, getRegions } from "@/lib/courses";
import { toRegionSlug } from "@/lib/constants/norway-regions";
import fs from "fs";
import path from "path";
import matter from "gray-matter";

const BASE_URL = "https://golfkart.no";

export default function sitemap(): MetadataRoute.Sitemap {
  const courses = getAllCourses();
  const regions = getRegions();

  const staticPages: MetadataRoute.Sitemap = [
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${BASE_URL}/about`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${BASE_URL}/contact`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${BASE_URL}/privacy`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${BASE_URL}/terms`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${BASE_URL}/regions`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/en`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/en/about`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.4,
    },
    {
      url: `${BASE_URL}/en/contact`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.4,
    },
    {
      url: `${BASE_URL}/en/privacy`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.2,
    },
    {
      url: `${BASE_URL}/en/terms`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.2,
    },
    {
      url: `${BASE_URL}/en/regions`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.6,
    },
  ];

  const regionPages: MetadataRoute.Sitemap = regions.flatMap((region) => [
    {
      url: `${BASE_URL}/${region}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/en/${region}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.7,
    },
  ]);

  const coursePages: MetadataRoute.Sitemap = courses.flatMap((course) => {
    const regionSlug = toRegionSlug(course.region);
    const lastModified = course.meta.updatedAt ? new Date(course.meta.updatedAt) : new Date();
    return [
      {
        url: `${BASE_URL}/${regionSlug}/${course.slug}`,
        lastModified,
        changeFrequency: "weekly" as const,
        priority: 0.7,
      },
      {
        url: `${BASE_URL}/en/${regionSlug}/${course.slug}`,
        lastModified,
        changeFrequency: "weekly" as const,
        priority: 0.6,
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
          return [
            {
              url: `${BASE_URL}/blog/${slug}`,
              lastModified,
              changeFrequency: "monthly" as const,
              priority: 0.6,
            },
            {
              url: `${BASE_URL}/en/blog/${slug}`,
              lastModified,
              changeFrequency: "monthly" as const,
              priority: 0.5,
            },
          ];
        })
    : [];

  return [...staticPages, ...regionPages, ...coursePages, ...blogPages];
}
