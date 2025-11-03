import { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";
import { toRegionSlug } from "@/lib/constants/norway-regions";
import { SITE_CONFIG } from "@/lib/schema";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = SITE_CONFIG.baseUrl;

  // Get all regions from database
  const regions = await prisma.course.groupBy({
    by: ["region"],
  });

  // Get all courses from database
  const courses = await prisma.course.findMany({
    select: {
      slug: true,
      region: true,
      updatedAt: true,
    },
  });

  // Homepage
  const homepage = {
    url: baseUrl,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 1.0,
  };

  // Regions overview page
  const regionsPage = {
    url: `${baseUrl}/regions`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.9,
  };

  // Region pages
  const regionPages = regions.map((entry) => {
    const slug = toRegionSlug(entry.region);
    return {
      url: `${baseUrl}/${slug}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.8,
    };
  });

  // Course pages
  const coursePages = courses.map((course) => {
    const regionSlug = toRegionSlug(course.region);
    return {
      url: `${baseUrl}/${regionSlug}/${course.slug}`,
      lastModified: course.updatedAt,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    };
  });

  return [homepage, regionsPage, ...regionPages, ...coursePages];
}
