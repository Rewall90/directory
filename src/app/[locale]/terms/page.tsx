import type { Metadata } from "next";
import { Link } from "@/i18n/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "terms" });

  return {
    title: t("metaTitle"),
    description: t("metaDescription"),
  };
}

export default async function TermsOfServicePage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("terms");

  return (
    <div className="bg-background">
      {/* Breadcrumb */}
      <nav className="container mx-auto max-w-[1170px] px-4 py-4 text-sm text-text-tertiary">
        <Link href="/" className="hover:text-primary">
          {t("breadcrumbHome")}
        </Link>
        <span className="mx-2">/</span>
        <span className="text-text-primary">{t("breadcrumbCurrent")}</span>
      </nav>

      <div className="container mx-auto max-w-[800px] px-4 py-16">
        <h1 className="mb-8 text-4xl font-bold text-text-primary">{t("pageTitle")}</h1>

        <div className="space-y-8 text-text-secondary">
          <p className="text-sm text-text-tertiary">
            {t("lastUpdated", {
              date: new Date().toLocaleDateString(locale === "en" ? "en-GB" : "nb-NO", {
                day: "numeric",
                month: "long",
                year: "numeric",
              }),
            })}
          </p>

          <section>
            <h2 className="mb-4 text-2xl font-semibold text-text-primary">{t("section1Title")}</h2>
            <p className="leading-relaxed">{t("section1Text")}</p>
          </section>

          <section>
            <h2 className="mb-4 text-2xl font-semibold text-text-primary">{t("section2Title")}</h2>
            <p className="leading-relaxed">{t("section2Text")}</p>
          </section>

          <section>
            <h2 className="mb-4 text-2xl font-semibold text-text-primary">{t("section3Title")}</h2>
            <p className="mb-3 leading-relaxed">{t("section3Intro")}</p>
            <ul className="ml-6 list-disc space-y-2">
              <li>{t("section3Item1")}</li>
              <li>{t("section3Item2")}</li>
              <li>{t("section3Item3")}</li>
            </ul>
          </section>

          <section>
            <h2 className="mb-4 text-2xl font-semibold text-text-primary">{t("section4Title")}</h2>
            <p className="mb-3 leading-relaxed">
              {t("section4Intro", { notText: t("section4NotText") })}
            </p>

            <div className="rounded-lg border-2 border-red-300 bg-red-50 p-6 dark:border-red-800 dark:bg-red-950">
              <h3 className="mb-3 text-lg font-bold text-red-900 dark:text-red-200">
                🚫 {t("section4ProhibitedTitle")}
              </h3>
              <ul className="ml-6 list-disc space-y-3 text-red-900 dark:text-red-200">
                <li>
                  <strong>{t("section4Scraping")}</strong> {t("section4ScrapingText")}
                </li>
                <li>
                  <strong>{t("section4Download")}</strong> {t("section4DownloadText")}
                </li>
                <li>
                  <strong>{t("section4Api")}</strong> {t("section4ApiText")}
                </li>
                <li>
                  <strong>{t("section4Database")}</strong> {t("section4DatabaseText")}
                </li>
                <li>
                  <strong>{t("section4Competing")}</strong> {t("section4CompetingText")}
                </li>
                <li>
                  <strong>{t("section4Security")}</strong> {t("section4SecurityText")}
                </li>
                <li>
                  <strong>{t("section4Reverse")}</strong> {t("section4ReverseText")}
                </li>
              </ul>
            </div>

            <h3 className="mb-2 mt-6 text-lg font-semibold text-text-primary">
              {t("section4OtherTitle")}
            </h3>
            <ul className="ml-6 list-disc space-y-2">
              <li>{t("section4Other1")}</li>
              <li>{t("section4Other2")}</li>
              <li>{t("section4Other3")}</li>
              <li>{t("section4Other4")}</li>
              <li>{t("section4Other5")}</li>
              <li>{t("section4Other6")}</li>
              <li>{t("section4Other7")}</li>
            </ul>
          </section>

          <section>
            <h2 className="mb-4 text-2xl font-semibold text-text-primary">{t("section5Title")}</h2>
            <p className="mb-3 leading-relaxed">{t("section5Text1")}</p>
            <p className="leading-relaxed">{t("section5Text2")}</p>
          </section>

          <section>
            <h2 className="mb-4 text-2xl font-semibold text-text-primary">{t("section6Title")}</h2>
            <p className="mb-3 leading-relaxed">{t("section6Intro")}</p>
            <ul className="ml-6 list-disc space-y-2">
              <li>{t("section6Item1")}</li>
              <li>{t("section6Item2")}</li>
              <li>{t("section6Item3")}</li>
            </ul>
            <p className="mt-4 leading-relaxed">{t("section6Disclaimer")}</p>
          </section>

          <section>
            <h2 className="mb-4 text-2xl font-semibold text-text-primary">{t("section7Title")}</h2>
            <p className="leading-relaxed">{t("section7Text")}</p>
            <ul className="ml-6 mt-3 list-disc space-y-2">
              <li>{t("section7Item1")}</li>
              <li>{t("section7Item2")}</li>
              <li>{t("section7Item3")}</li>
              <li>{t("section7Item4")}</li>
            </ul>
          </section>

          <section>
            <h2 className="mb-4 text-2xl font-semibold text-text-primary">{t("section8Title")}</h2>
            <p className="leading-relaxed">{t("section8Text")}</p>
          </section>

          <section>
            <h2 className="mb-4 text-2xl font-semibold text-text-primary">{t("section9Title")}</h2>
            <p className="mb-3 leading-relaxed">{t("section9Intro")}</p>
            <ul className="ml-6 list-disc space-y-2">
              <li>{t("section9Item1")}</li>
              <li>{t("section9Item2")}</li>
              <li>{t("section9Item3")}</li>
              <li>{t("section9Item4")}</li>
            </ul>
            <p className="mt-4 leading-relaxed">{t("section9Closing")}</p>
          </section>

          <section>
            <h2 className="mb-4 text-2xl font-semibold text-text-primary">{t("section10Title")}</h2>
            <p className="leading-relaxed">{t("section10Text")}</p>
          </section>

          <section>
            <h2 className="mb-4 text-2xl font-semibold text-text-primary">{t("section11Title")}</h2>
            <p className="leading-relaxed">{t("section11Text")}</p>
          </section>

          <section>
            <h2 className="mb-4 text-2xl font-semibold text-text-primary">{t("section12Title")}</h2>
            <p className="leading-relaxed">
              {t.rich("section12Text", {
                link: (chunks) => (
                  <Link href="/contact" className="text-primary hover:underline">
                    {chunks}
                  </Link>
                ),
              })}
            </p>
          </section>

          <section className="bg-primary/5 rounded-lg border border-primary p-6">
            <h3 className="mb-3 text-lg font-semibold text-text-primary">
              ⚖️ {t("scrapingNoticeTitle")}
            </h3>
            <p className="text-sm leading-relaxed">{t("scrapingNoticeText")}</p>
          </section>

          <section className="border-t border-border-subtle pt-8">
            <p className="text-sm text-text-tertiary">
              {t.rich("acceptanceNotice", {
                link: (chunks) => (
                  <Link href="/privacy" className="text-primary hover:underline">
                    {chunks}
                  </Link>
                ),
              })}
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
