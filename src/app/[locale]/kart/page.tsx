import { setRequestLocale, getTranslations } from "next-intl/server";
import { getAllCoursesForMap } from "@/lib/courses";
import { MapPage } from "./MapPage";
import type { Metadata } from "next";
import { logger } from "@/lib/utils/logger";

export const dynamic = "force-static";

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "map" });

  let actualCount = 0;
  try {
    const courses = getAllCoursesForMap();
    actualCount = courses.length;
  } catch (error) {
    logger.error("Failed to load courses for metadata", error);
    // Build continues with fallback
  }

  const baseUrl = "https://golfkart.no";
  const path = "/kart";

  const description =
    actualCount > 0
      ? t("description", { count: actualCount })
      : t("descriptionFallback");

  return {
    title: t("title"),
    description,
    alternates: {
      canonical: `${baseUrl}${locale === "en" ? "/en" : ""}${path}`,
      languages: {
        nb: `${baseUrl}${path}`,
        en: `${baseUrl}/en${path}`,
        "x-default": `${baseUrl}${path}`,
      },
    },
    openGraph: {
      title: t("title"),
      description,
      url: `${baseUrl}${locale === "en" ? "/en" : ""}${path}`,
      type: "website",
    },
  };
}

export default async function KartPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const courses = getAllCoursesForMap();

  return <MapPage courses={courses} locale={locale} />;
}
