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

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${BASE_URL}/om-oss`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${BASE_URL}/kontakt-oss`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${BASE_URL}/personvern`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${BASE_URL}/vilkar`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.3,
    },
  ];

  // Region pages
  const regionPages: MetadataRoute.Sitemap = regions.map((region) => ({
    url: `${BASE_URL}/${region}`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  // Course pages
  const coursePages: MetadataRoute.Sitemap = courses.map((course) => ({
    url: `${BASE_URL}/${toRegionSlug(course.region)}/${course.slug}`,
    lastModified: course.meta.updatedAt ? new Date(course.meta.updatedAt) : new Date(),
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  // Blog pages
  const blogDir = path.join(process.cwd(), "content/blogg");
  const blogPages: MetadataRoute.Sitemap = fs.existsSync(blogDir)
    ? fs
        .readdirSync(blogDir)
        .filter((file) => file.endsWith(".mdx"))
        .map((file) => {
          const content = fs.readFileSync(path.join(blogDir, file), "utf-8");
          const { data } = matter(content);
          return {
            url: `${BASE_URL}/blogg/${file.replace(".mdx", "")}`,
            lastModified: data.updatedAt || data.publishedAt || new Date(),
            changeFrequency: "monthly" as const,
            priority: 0.6,
          };
        })
    : [];

  return [...staticPages, ...regionPages, ...coursePages, ...blogPages];
}
