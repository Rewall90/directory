import type { Metadata } from "next";
import { Link } from "@/i18n/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "privacy" });

  return {
    title: t("metaTitle"),
    description: t("metaDescription"),
    openGraph: {
      locale: locale === "en" ? "en_GB" : "nb_NO",
    },
    alternates: {
      canonical: `https://golfkart.no${locale === "en" ? "/en" : ""}/privacy`,
      languages: {
        nb: "https://golfkart.no/privacy",
        en: "https://golfkart.no/en/privacy",
        "x-default": "https://golfkart.no/privacy",
      },
    },
  };
}

export default async function PrivacyPolicyPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("privacy");

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

            <h3 className="mb-2 mt-4 text-lg font-semibold text-text-primary">
              {t("section2_1Title")}
            </h3>
            <p className="mb-3 leading-relaxed">{t("section2_1Intro")}</p>
            <ul className="ml-6 list-disc space-y-2">
              <li>{t("section2_1Item1")}</li>
              <li>{t("section2_1Item2")}</li>
              <li>{t("section2_1Item3")}</li>
              <li>{t("section2_1Item4")}</li>
              <li>{t("section2_1Item5")}</li>
              <li>{t("section2_1Item6")}</li>
            </ul>

            <h3 className="mb-2 mt-4 text-lg font-semibold text-text-primary">
              {t("section2_2Title")}
            </h3>
            <p className="leading-relaxed">{t("section2_2Text")}</p>

            <h3 className="mb-2 mt-4 text-lg font-semibold text-text-primary">
              {t("section2_3Title")}
            </h3>
            <p className="leading-relaxed">{t("section2_3Text")}</p>
          </section>

          <section>
            <h2 className="mb-4 text-2xl font-semibold text-text-primary">{t("section3Title")}</h2>
            <p className="mb-3 leading-relaxed">{t("section3Intro")}</p>
            <ul className="ml-6 list-disc space-y-2">
              <li>{t("section3Item1")}</li>
              <li>{t("section3Item2")}</li>
              <li>{t("section3Item3")}</li>
              <li>{t("section3Item4")}</li>
              <li>{t("section3Item5")}</li>
            </ul>
          </section>

          <section>
            <h2 className="mb-4 text-2xl font-semibold text-text-primary">{t("section4Title")}</h2>
            <p className="leading-relaxed">{t("section4Text")}</p>
          </section>

          <section>
            <h2 className="mb-4 text-2xl font-semibold text-text-primary">{t("section5Title")}</h2>
            <p className="mb-3 leading-relaxed">{t("section5Intro")}</p>
            <ul className="ml-6 list-disc space-y-2">
              <li>{t("section5Item1")}</li>
              <li>{t("section5Item2")}</li>
              <li>{t("section5Item3")}</li>
            </ul>
          </section>

          <section>
            <h2 className="mb-4 text-2xl font-semibold text-text-primary">{t("section6Title")}</h2>
            <p className="leading-relaxed">{t("section6Text")}</p>
          </section>

          <section>
            <h2 className="mb-4 text-2xl font-semibold text-text-primary">{t("section7Title")}</h2>
            <p className="mb-3 leading-relaxed">{t("section7Intro")}</p>
            <ul className="ml-6 list-disc space-y-2">
              <li>
                <strong>{t("section7RightAccess")}</strong> {t("section7RightAccessText")}
              </li>
              <li>
                <strong>{t("section7RightCorrection")}</strong> {t("section7RightCorrectionText")}
              </li>
              <li>
                <strong>{t("section7RightDeletion")}</strong> {t("section7RightDeletionText")}
              </li>
              <li>
                <strong>{t("section7RightRestriction")}</strong> {t("section7RightRestrictionText")}
              </li>
              <li>
                <strong>{t("section7RightPortability")}</strong> {t("section7RightPortabilityText")}
              </li>
              <li>
                <strong>{t("section7RightObjection")}</strong> {t("section7RightObjectionText")}
              </li>
            </ul>
            <p className="mt-4 leading-relaxed">
              {t.rich("section7ExerciseRights", {
                link: (chunks) => (
                  <Link href="/contact" className="text-primary hover:underline">
                    {chunks}
                  </Link>
                ),
              })}
            </p>
          </section>

          <section>
            <h2 className="mb-4 text-2xl font-semibold text-text-primary">{t("section8Title")}</h2>
            <p className="leading-relaxed">{t("section8Text")}</p>
          </section>

          <section>
            <h2 className="mb-4 text-2xl font-semibold text-text-primary">{t("section9Title")}</h2>
            <p className="leading-relaxed">{t("section9Text")}</p>
          </section>

          <section>
            <h2 className="mb-4 text-2xl font-semibold text-text-primary">{t("section10Title")}</h2>
            <p className="leading-relaxed">{t("section10Text")}</p>
          </section>

          <section>
            <h2 className="mb-4 text-2xl font-semibold text-text-primary">{t("section11Title")}</h2>
            <p className="leading-relaxed">
              {t.rich("section11Text", {
                link: (chunks) => (
                  <Link href="/contact" className="text-primary hover:underline">
                    {chunks}
                  </Link>
                ),
              })}
            </p>
          </section>

          <section className="border-t border-border-subtle pt-8">
            <p className="text-sm text-text-tertiary">
              {t.rich("acceptanceNotice", {
                link: (chunks) => (
                  <Link href="/terms" className="text-primary hover:underline">
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
