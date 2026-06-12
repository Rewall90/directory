import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { getVtgClubs, getVtgRegions } from "@/lib/courses";
import { groupClubsByRegion, vtgPriceRange } from "@/lib/vtg";
import { VtgClubCard } from "@/components/vtg/VtgClubCard";
import { generateItemListSchema, createCourseListId, JsonLd } from "@/lib/schema";
import { getCountyNameFromSlug } from "@/lib/constants/norway-regions";

type Props = {
  params: Promise<{ locale: string; region: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, region } = await params;
  if (locale !== "nb" || !getVtgRegions().includes(region)) notFound();

  const t = await getTranslations({ locale, namespace: "vtg" });
  const regionName = getCountyNameFromSlug(region) ?? region;
  const clubsWithData = getVtgClubs().filter((club) => club.regionSlug === region && club.hasData);

  const title = t("regionMetaTitle", { region: regionName, count: clubsWithData.length });
  const description = t("regionMetaDescription", { region: regionName });

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
      locale: "nb_NO",
      url: `https://golfkart.no/vtg-kurs/${region}`,
    },
    alternates: {
      canonical: `https://golfkart.no/vtg-kurs/${region}`,
      // Norwegian-only page: no English alternate exists
      languages: {
        nb: `https://golfkart.no/vtg-kurs/${region}`,
        "x-default": `https://golfkart.no/vtg-kurs/${region}`,
      },
    },
  };
}

export default async function VtgRegionPage({ params }: Props) {
  const { locale, region } = await params;
  // Gate #2: direct requests to non-qualifying regions or non-Norwegian locales 404
  if (locale !== "nb" || !getVtgRegions().includes(region)) notFound();
  setRequestLocale(locale);
  const t = await getTranslations("vtg");

  const regionName = getCountyNameFromSlug(region) ?? region;
  // Reuse the hub's grouping for identical data-first sorting of this region's clubs
  const group = groupClubsByRegion(getVtgClubs()).find((g) => g.regionSlug === region);
  const regionClubs = group?.clubs ?? [];
  const clubsWithData = regionClubs.filter((club) => club.hasData);
  const range = vtgPriceRange(regionClubs);

  const priceSuffix = range ? t("regionPriceSuffix", { min: range.min, max: range.max }) : "";
  const lede = t("regionLede", {
    count: clubsWithData.length,
    region: regionName,
    priceSuffix,
  });

  const itemListSchema = generateItemListSchema(
    clubsWithData.map((club) => ({
      name: club.name,
      url: `/${club.regionSlug}/${club.slug}`,
    })),
    {
      listId: createCourseListId(`/vtg-kurs/${region}`),
      name: t("regionTitle", { region: regionName }),
      description: t("regionMetaDescription", { region: regionName }),
    },
  );

  // Latest lastChecked among this region's clubs with data; note is omitted when none.
  const latestChecked = clubsWithData.reduce<string | null>(
    (latest, club) =>
      club.lastChecked && (latest === null || club.lastChecked > latest)
        ? club.lastChecked
        : latest,
    null,
  );
  // Format from the ISO string parts directly — new Date("YYYY-MM-DD") parses as UTC
  // midnight, which can shift the month in non-UTC timezones.
  let updatedDate: string | null = null;
  if (latestChecked) {
    const [y, m] = latestChecked.split("-").map(Number);
    const monthName = new Intl.DateTimeFormat("nb-NO", {
      month: "long",
      timeZone: "UTC",
    }).format(new Date(Date.UTC(y, m - 1, 1)));
    updatedDate = `${monthName} ${y}`;
  }

  return (
    <>
      {/* JSON-LD structured data for SEO (no FAQ schema on region pages) */}
      <JsonLd schema={itemListSchema} />

      <div className="container mx-auto max-w-[1170px] px-4 py-16">
        {/* Breadcrumb */}
        <nav className="mb-6 text-sm text-text-secondary">
          <Link href="/" className="hover:text-primary">
            {t("breadcrumbHome")}
          </Link>
          <span className="mx-2">/</span>
          <Link href="/vtg-kurs" className="hover:text-primary">
            {t("breadcrumbVtg")}
          </Link>
          <span className="mx-2">/</span>
          <span className="text-text-primary">{regionName}</span>
        </nav>

        {/* Header */}
        <h1 className="mb-4 text-3xl font-bold text-text-primary">
          {t("regionTitle", { region: regionName })}
        </h1>
        <p className="max-w-2xl text-text-secondary">{lede}</p>
        <p className="mb-8 mt-3 max-w-2xl text-sm text-text-tertiary">
          {t("regionCoursePagesNote")}
        </p>

        {/* Club cards: all clubs in the region, clubs with data first */}
        <div className="space-y-2.5">
          {regionClubs.map((club) => (
            <VtgClubCard key={club.slug} club={club} />
          ))}
        </div>

        {/* Updated note */}
        {updatedDate && (
          <p className="mt-10 text-xs text-text-tertiary">
            {t("updatedNote", { date: updatedDate })}{" "}
            <Link href="/contact" className="text-primary hover:underline">
              {t("reportError")}
            </Link>
          </p>
        )}
      </div>
    </>
  );
}

// Gate #1: only qualifying regions (≥3 clubs with data), Norwegian locale only
export async function generateStaticParams() {
  return getVtgRegions().map((region) => ({ locale: "nb", region }));
}
