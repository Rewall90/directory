import type { Metadata } from "next";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { getVtgClubs, getVtgRegions } from "@/lib/courses";
import { formatMonthYear, groupClubsByRegion, latestLastChecked, vtgPriceRange } from "@/lib/vtg";
import { VtgClubCard } from "@/components/vtg/VtgClubCard";
import { VtgClubFilter, type FilterableGroup } from "@/components/vtg/VtgClubFilter";
import {
  generateFAQPageSchema,
  generateItemListSchema,
  createCourseListId,
  JsonLdMultiple,
} from "@/lib/schema";
import { routing } from "@/i18n/routing";

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "vtg" });
  const clubCount = getVtgClubs().length;

  const title = t("metaTitle", { count: clubCount });
  const description = t("metaDescription");

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
      locale: locale === "en" ? "en_GB" : "nb_NO",
      url: `https://golfkart.no${locale === "en" ? "/en" : ""}/vtg-kurs`,
    },
    alternates: {
      canonical: `https://golfkart.no${locale === "en" ? "/en" : ""}/vtg-kurs`,
      languages: {
        nb: "https://golfkart.no/vtg-kurs",
        en: "https://golfkart.no/en/vtg-kurs",
        "x-default": "https://golfkart.no/vtg-kurs",
      },
    },
  };
}

export default async function VtgKursPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("vtg");

  const clubs = getVtgClubs();
  const groups = groupClubsByRegion(clubs);
  const regionPages = new Set(getVtgRegions());
  const range = vtgPriceRange(clubs);
  const year = new Date().getFullYear();

  const clubsWithData = clubs.filter((club) => club.hasData);

  // FAQ: Q1 contains the price range, so it is omitted entirely when no prices exist
  const faqEntries = [
    ...(range
      ? [
          {
            question: t("faqQ1"),
            answer: t("faqA1", { min: range.min, max: range.max, year: String(year) }),
          },
        ]
      : []),
    { question: t("faqQ2"), answer: t("faqA2") },
    { question: t("faqQ3"), answer: t("faqA3") },
    { question: t("faqQ4"), answer: t("faqA4") },
  ];

  const schemas = [
    generateFAQPageSchema(faqEntries),
    ...(clubsWithData.length > 0
      ? [
          generateItemListSchema(
            // Item URLs must match what the visible cards link to per locale
            clubsWithData.map((club) => ({
              name: club.name,
              url:
                locale === "en"
                  ? `/en/${club.regionSlug}/${club.slug_en || club.slug}`
                  : `/${club.regionSlug}/${club.slug}`,
            })),
            {
              listId: createCourseListId(locale === "en" ? "/en/vtg-kurs" : "/vtg-kurs"),
              name: t("title"),
              description: t("metaDescription"),
            },
          ),
        ]
      : []),
  ];

  // Latest lastChecked across clubs with data, formatted as month + year per locale.
  const latestChecked = latestLastChecked(clubs);
  const updatedDate = latestChecked
    ? formatMonthYear(latestChecked, locale === "en" ? "en" : "nb")
    : null;

  const lede = range
    ? t("ledeWithPrices", {
        count: clubs.length,
        year: String(year),
        min: range.min,
        max: range.max,
      })
    : t("ledeNoPrices");

  // Server-rendered region groups for the client-side filter: headings and
  // cards are built here (server-authored anchors/links), the client component
  // only toggles their visibility based on the query.
  const filterGroups: FilterableGroup[] = groups.map((group) => {
    const groupRange = vtgPriceRange(group.clubs);
    return {
      regionSlug: group.regionSlug,
      regionName: group.regionName,
      heading: (
        <>
          <h2
            id={group.regionSlug}
            className="scroll-mt-20 text-xl font-semibold text-text-primary"
          >
            {group.regionName}
          </h2>
          <p className="mb-3 mt-1 text-sm text-text-tertiary">
            {groupRange
              ? t("regionSubtitleWithPrice", {
                  count: group.clubs.length,
                  min: groupRange.min,
                })
              : t("regionSubtitle", { count: group.clubs.length })}
            {locale === "nb" && regionPages.has(group.regionSlug) && (
              <Link
                href={`/vtg-kurs/${group.regionSlug}`}
                className="ml-2 text-primary hover:underline"
              >
                {t("regionPageLink", { region: group.regionName })}
              </Link>
            )}
          </p>
        </>
      ),
      clubs: group.clubs.map((club) => ({
        slug: club.slug,
        searchText:
          `${club.name} ${club.name_en ?? ""} ${club.city} ${group.regionName}`.toLowerCase(),
        card: <VtgClubCard club={club} />,
      })),
    };
  });

  return (
    <>
      {/* JSON-LD structured data for SEO */}
      <JsonLdMultiple schemas={schemas} />

      <div className="container mx-auto max-w-[1170px] px-4 py-16">
        {/* Breadcrumb */}
        <nav className="mb-6 text-sm text-text-secondary">
          <Link href="/" className="hover:text-primary">
            {t("breadcrumbHome")}
          </Link>
          <span className="mx-2">/</span>
          <span className="text-text-primary">{t("breadcrumbVtg")}</span>
        </nav>

        {/* Header */}
        <h1 className="mb-4 text-3xl font-bold text-text-primary">{t("title")}</h1>
        <p className="max-w-2xl text-text-secondary">{lede}</p>

        {/* Intro article */}
        <article className="mb-9 mt-7 max-w-2xl text-[15px] text-text-secondary">
          <h2 className="mb-2 text-xl font-semibold text-text-primary">{t("introTitle")}</h2>
          <p className="mb-2">{t("introP1")}</p>
          <ol className="mb-3 list-decimal space-y-1 pl-6">
            <li>{t("introStep1")}</li>
            <li>{t("introStep2")}</li>
            <li>{t("introStep3")}</li>
          </ol>
          <p>{t("introP2")}</p>
        </article>

        {/* Region jump index */}
        <p className="mb-8 max-w-2xl text-sm text-text-secondary">
          <strong className="text-text-primary">{t("jumpToRegion")}</strong>{" "}
          {groups.map((group, index) => (
            <span key={group.regionSlug}>
              {index > 0 && " · "}
              {locale === "nb" && regionPages.has(group.regionSlug) ? (
                <Link
                  href={`/vtg-kurs/${group.regionSlug}`}
                  className="whitespace-nowrap text-primary hover:underline"
                >
                  {group.regionName} ({group.clubs.length})
                </Link>
              ) : (
                <a
                  href={`#${group.regionSlug}`}
                  className="whitespace-nowrap text-primary hover:underline"
                >
                  {group.regionName} ({group.clubs.length})
                </a>
              )}
            </span>
          ))}
        </p>

        {/* Club filter + region groups (cards are server-rendered, filtering is client-side) */}
        <VtgClubFilter groups={filterGroups} totalCount={clubs.length} />

        {/* FAQ */}
        <section className="mt-12 max-w-2xl">
          <h2 className="mb-3 text-xl font-semibold text-text-primary">{t("faqTitle")}</h2>
          {faqEntries.map((entry) => (
            <div key={entry.question}>
              <h3 className="mb-1 mt-4 font-semibold text-text-primary">{entry.question}</h3>
              <p className="text-sm text-text-secondary">{entry.answer}</p>
            </div>
          ))}
        </section>

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

// Generate static params for both locales at build time
export async function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}
