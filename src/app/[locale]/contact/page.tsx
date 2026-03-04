import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { ContactForm } from "./_components/ContactForm";

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "contact" });

  return {
    title: t("metaTitle"),
    description: t("metaDescription"),
    alternates: {
      canonical: "/contact",
    },
  };
}

export default async function ContactPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("contact");
  return (
    <div className="bg-background py-12">
      <div className="container mx-auto max-w-[1170px] px-4">
        <h1 className="mb-6 text-3xl font-bold text-text-primary">{t("pageTitle")}</h1>

        <div className="grid gap-8 lg:grid-cols-2">
          {/* Contact Form */}
          <div className="rounded-lg bg-background-surface p-6 shadow-sm">
            <h2 className="mb-4 text-2xl font-semibold text-text-primary">{t("formTitle")}</h2>
            <p className="mb-6 text-text-secondary">{t("formSubtitle")}</p>
            <ContactForm />
          </div>

          {/* Contact Information */}
          <div className="space-y-6">
            <div className="rounded-lg bg-background-surface p-6 shadow-sm">
              <h2 className="mb-4 text-xl font-semibold text-text-primary">
                {t("directContactTitle")}
              </h2>
              <p className="mb-6 text-text-secondary">{t("directContactSubtitle")}</p>

              <div className="space-y-4">
                <div>
                  <h3 className="mb-2 font-semibold text-text-primary">{t("generalInquiries")}</h3>
                  <a href="mailto:kontakt@golfkart.no" className="text-primary hover:underline">
                    kontakt@golfkart.no
                  </a>
                </div>

                <div>
                  <h3 className="mb-2 font-semibold text-text-primary">{t("addOrUpdateCourse")}</h3>
                  <p className="mb-1 text-sm text-text-secondary">{t("addOrUpdateCourseDesc")}</p>
                  <a href="mailto:baner@golfkart.no" className="text-primary hover:underline">
                    baner@golfkart.no
                  </a>
                </div>

                <div>
                  <h3 className="mb-2 font-semibold text-text-primary">{t("technicalSupport")}</h3>
                  <a href="mailto:support@golfkart.no" className="text-primary hover:underline">
                    support@golfkart.no
                  </a>
                </div>
              </div>
            </div>

            <div className="rounded-lg bg-background-surface p-6 shadow-sm">
              <h2 className="mb-4 text-xl font-semibold text-text-primary">
                {t("aboutSectionTitle")}
              </h2>
              <p className="text-text-secondary">{t("aboutSectionText")}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
