import type { Metadata } from "next";
import { Link } from "@/i18n/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "about" });

  return {
    title: t("metaTitle"),
    description: t("metaDescription"),
    openGraph: {
      locale: locale === "en" ? "en_GB" : "nb_NO",
    },
    alternates: {
      canonical: `https://golfkart.no${locale === "en" ? "/en" : ""}/about`,
      languages: {
        nb: "https://golfkart.no/about",
        en: "https://golfkart.no/en/about",
        "x-default": "https://golfkart.no/about",
      },
    },
  };
}

export default async function AboutPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("about");
  return (
    <div className="bg-background">
      {/* Hero Section */}
      <section className="border-b border-border-subtle bg-background-surface py-12 md:py-20">
        <div className="container mx-auto max-w-[1170px] px-4">
          <h1 className="mb-4 text-4xl font-bold text-text-primary md:text-5xl">
            {t("pageTitle")}
          </h1>
          <p className="text-xl text-text-secondary md:text-2xl">{t("subtitle")}</p>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-12 md:py-16">
        <div className="container mx-auto max-w-[1170px] px-4">
          <div className="grid gap-12 lg:grid-cols-3">
            {/* Main Column */}
            <div className="space-y-8 lg:col-span-2">
              {/* Mission */}
              <div>
                <h2 className="mb-4 text-2xl font-semibold text-text-primary">
                  {t("visionTitle")}
                </h2>
                <p className="mb-4 text-lg leading-relaxed text-text-secondary">
                  {t("visionText")}
                </p>
              </div>

              {/* What We Offer */}
              <div>
                <h2 className="mb-6 text-2xl font-semibold text-text-primary">
                  {t("whatWeOfferTitle")}
                </h2>
                <div className="space-y-6">
                  <div className="flex gap-4">
                    <div className="flex-shrink-0">
                      <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary text-2xl text-white">
                        📍
                      </div>
                    </div>
                    <div>
                      <h3 className="mb-2 text-lg font-semibold text-text-primary">
                        {t("offerCompleteTitle")}
                      </h3>
                      <p className="text-text-secondary">{t("offerCompleteText")}</p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="flex-shrink-0">
                      <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary text-2xl text-white">
                        📊
                      </div>
                    </div>
                    <div>
                      <h3 className="mb-2 text-lg font-semibold text-text-primary">
                        {t("offerDetailedTitle")}
                      </h3>
                      <p className="text-text-secondary">{t("offerDetailedText")}</p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="flex-shrink-0">
                      <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary text-2xl text-white">
                        💰
                      </div>
                    </div>
                    <div>
                      <h3 className="mb-2 text-lg font-semibold text-text-primary">
                        {t("offerPricesTitle")}
                      </h3>
                      <p className="text-text-secondary">{t("offerPricesText")}</p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="flex-shrink-0">
                      <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary text-2xl text-white">
                        ⭐
                      </div>
                    </div>
                    <div>
                      <h3 className="mb-2 text-lg font-semibold text-text-primary">
                        {t("offerRatingsTitle")}
                      </h3>
                      <p className="text-text-secondary">{t("offerRatingsText")}</p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="flex-shrink-0">
                      <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary text-2xl text-white">
                        🏢
                      </div>
                    </div>
                    <div>
                      <h3 className="mb-2 text-lg font-semibold text-text-primary">
                        {t("offerFacilitiesTitle")}
                      </h3>
                      <p className="text-text-secondary">{t("offerFacilitiesText")}</p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="flex-shrink-0">
                      <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary text-2xl text-white">
                        ☀️
                      </div>
                    </div>
                    <div>
                      <h3 className="mb-2 text-lg font-semibold text-text-primary">
                        {t("offerWeatherTitle")}
                      </h3>
                      <p className="text-text-secondary">{t("offerWeatherText")}</p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="flex-shrink-0">
                      <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary text-2xl text-white">
                        🗺️
                      </div>
                    </div>
                    <div>
                      <h3 className="mb-2 text-lg font-semibold text-text-primary">
                        {t("offerMapTitle")}
                      </h3>
                      <p className="text-text-secondary">{t("offerMapText")}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Why Us */}
              <div>
                <h2 className="mb-4 text-2xl font-semibold text-text-primary">{t("whyUsTitle")}</h2>
                <div className="space-y-4">
                  <p className="text-lg leading-relaxed text-text-secondary">{t("whyUsText1")}</p>
                  <p className="text-lg leading-relaxed text-text-secondary">{t("whyUsText2")}</p>
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Stats Card */}
              <div className="rounded-lg bg-background-surface p-6 shadow-sm">
                <h3 className="mb-4 text-lg font-semibold text-text-primary">{t("statsTitle")}</h3>
                <div className="space-y-4">
                  <div className="border-b border-border-subtle pb-3">
                    <div className="text-3xl font-bold text-primary">{t("statsCoursesCount")}</div>
                    <div className="text-sm text-text-secondary">{t("statsCoursesLabel")}</div>
                  </div>
                  <div className="border-b border-border-subtle pb-3">
                    <div className="text-3xl font-bold text-primary">{t("statsRegionsCount")}</div>
                    <div className="text-sm text-text-secondary">{t("statsRegionsLabel")}</div>
                  </div>
                  <div className="border-b border-border-subtle pb-3">
                    <div className="text-3xl font-bold text-primary">{t("statsWeatherCount")}</div>
                    <div className="text-sm text-text-secondary">{t("statsWeatherLabel")}</div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-primary">{t("statsContentCount")}</div>
                    <div className="text-sm text-text-secondary">{t("statsContentLabel")}</div>
                  </div>
                </div>
              </div>

              {/* Contact CTA */}
              <div className="rounded-lg bg-primary p-6 text-white shadow-sm">
                <h3 className="mb-2 text-lg font-semibold">{t("missingCourseTitle")}</h3>
                <p className="mb-4 text-sm text-primary-content">{t("missingCourseText")}</p>
                <Link
                  href="/contact"
                  className="hover:bg-background-elevated inline-block rounded-lg bg-white px-4 py-2 text-sm font-semibold text-primary transition-colors"
                >
                  {t("missingCourseCta")}
                </Link>
              </div>

              {/* Features Card */}
              <div className="rounded-lg bg-background-surface p-6 shadow-sm">
                <h3 className="mb-4 text-lg font-semibold text-text-primary">
                  {t("comingSoonTitle")}
                </h3>
                <ul className="space-y-3 text-sm text-text-secondary">
                  <li className="flex items-start gap-2">
                    <span className="text-primary">→</span>
                    <span>{t("comingSoonSearch")}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary">→</span>
                    <span>{t("comingSoonReviews")}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary">→</span>
                    <span>{t("comingSoonFavorites")}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary">→</span>
                    <span>{t("comingSoonRecommendations")}</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
