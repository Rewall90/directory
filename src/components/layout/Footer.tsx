import { getTranslations, getLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { FooterLanguageSwitcher } from "@/components/layout/FooterLanguageSwitcher";
import { getRegionsWithCounts, getTopRatedCourses } from "@/lib/courses";
import { JsonLd, generateOrganizationSchema } from "@/lib/schema";
import { SITE_CONFIG } from "@/lib/schema/config/site-config";
import { getLocalizedName, getLocalizedSlug } from "@/lib/utils/locale-helpers";

export async function Footer() {
  const t = await getTranslations("footer");
  const locale = await getLocale();
  const regions = getRegionsWithCounts();
  const topCourses = getTopRatedCourses(5);
  const totalCourses = regions.reduce((sum, r) => sum + r.count, 0);

  return (
    <footer className="bg-gradient-to-br from-green-900 to-green-950">
      <div className="mx-auto max-w-[1170px] px-4 py-12">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 md:grid-cols-[1.5fr_2fr_1fr_1fr_1fr]">
          {/* Brand */}
          <div className="sm:order-1 md:order-none">
            <p className="mb-3 text-xl font-bold text-white">golfkart.no</p>
            <p className="mb-3 text-sm leading-relaxed text-white/75">{t("aboutDescription")}</p>
            <a
              href={`mailto:${SITE_CONFIG.contact.email}`}
              className="mb-5 inline-block py-1 text-sm text-white/75 underline decoration-white/40 underline-offset-2 transition-colors hover:text-white"
            >
              {SITE_CONFIG.contact.email}
            </a>
            <div className="flex flex-wrap gap-3">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/[0.06] px-3 py-1.5 text-xs text-white/75">
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="text-emerald-400"
                  aria-hidden="true"
                >
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 6v6l4 2" />
                </svg>
                {t("badgeCourses", { count: totalCourses })}
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/[0.06] px-3 py-1.5 text-xs text-white/75">
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="text-emerald-400"
                  aria-hidden="true"
                >
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
                {t("badgeRegions", { count: regions.length })}
              </span>
            </div>
          </div>

          {/* Regions Grid */}
          <nav
            className="sm:order-3 sm:col-span-2 md:order-none md:col-span-1"
            aria-labelledby="footer-regions-heading"
          >
            <h2
              id="footer-regions-heading"
              className="mb-4 text-xs font-bold uppercase tracking-wider text-white/70"
            >
              {t("regionsTitle")}
            </h2>
            <ul className="grid grid-cols-2 gap-x-6 gap-y-1 md:grid-cols-3">
              {regions.map((region) => (
                <li key={region.slug}>
                  <Link
                    href={`/${region.slug}`}
                    className="flex items-center justify-between py-1.5 text-[13px] text-white/80 transition-colors hover:text-white"
                  >
                    {region.name}
                    <span className="rounded-full bg-white/[0.06] px-2 py-0.5 text-[11px] text-white/75">
                      {region.count}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Popular Courses */}
          <nav className="sm:order-2 md:order-none" aria-labelledby="footer-courses-heading">
            <h2
              id="footer-courses-heading"
              className="mb-4 text-xs font-bold uppercase tracking-wider text-white/70"
            >
              {t("popularCoursesTitle")}
            </h2>
            <ul className="space-y-1">
              {topCourses.map((course) => {
                const slug = getLocalizedSlug(course.slug, course.slugEn, locale);
                const name = getLocalizedName(course.name, course.nameEn, locale);
                const ratingLabel = course.rating.toLocaleString(
                  locale === "en" ? "en-US" : "nb-NO",
                  { minimumFractionDigits: 1, maximumFractionDigits: 1 },
                );
                return (
                  <li key={course.slug}>
                    <Link
                      href={`/${course.regionSlug}/${slug}`}
                      className="flex items-center gap-2 py-1.5 text-sm text-white/75 transition-colors hover:text-white"
                    >
                      {name}
                      <span className="text-xs text-yellow-400" aria-hidden="true">
                        ★ {course.rating.toFixed(1)}
                      </span>
                      <span className="sr-only">{t("ratingSrLabel", { rating: ratingLabel })}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* Navigation */}
          <nav className="sm:order-4 md:order-none" aria-labelledby="footer-navigation-heading">
            <h2
              id="footer-navigation-heading"
              className="mb-4 text-xs font-bold uppercase tracking-wider text-white/70"
            >
              {t("navigationTitle")}
            </h2>
            <ul className="space-y-1">
              <li>
                <Link
                  href="/regions"
                  className="block py-1.5 text-sm text-white/75 transition-colors hover:text-white"
                >
                  {t("allCourses")}
                </Link>
              </li>
              <li>
                <Link
                  href="/kart"
                  className="block py-1.5 text-sm text-white/75 transition-colors hover:text-white"
                >
                  {t("map")}
                </Link>
              </li>
              <li>
                <Link
                  href="/vtg-kurs"
                  className="block py-1.5 text-sm text-white/75 transition-colors hover:text-white"
                >
                  {t("vtg")}
                </Link>
              </li>
              <li>
                <Link
                  href="/blog"
                  className="block py-1.5 text-sm text-white/75 transition-colors hover:text-white"
                >
                  {t("blog")}
                </Link>
              </li>
              <li>
                <Link
                  href="/about"
                  className="block py-1.5 text-sm text-white/75 transition-colors hover:text-white"
                >
                  {t("about")}
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="block py-1.5 text-sm text-white/75 transition-colors hover:text-white"
                >
                  {t("contact")}
                </Link>
              </li>
            </ul>
          </nav>

          {/* Legal */}
          <nav className="sm:order-5 md:order-none" aria-labelledby="footer-legal-heading">
            <h2
              id="footer-legal-heading"
              className="mb-4 text-xs font-bold uppercase tracking-wider text-white/70"
            >
              {t("legalTitle")}
            </h2>
            <ul className="space-y-1">
              <li>
                <Link
                  href="/privacy"
                  className="block py-1.5 text-sm text-white/75 transition-colors hover:text-white"
                >
                  {t("privacy")}
                </Link>
              </li>
              <li>
                <Link
                  href="/terms"
                  className="block py-1.5 text-sm text-white/75 transition-colors hover:text-white"
                >
                  {t("terms")}
                </Link>
              </li>
            </ul>
          </nav>
        </div>

        {/* Bottom Bar */}
        <div className="mt-10 flex flex-col items-center justify-between gap-3 border-t border-white/10 pt-6 sm:flex-row">
          <p className="text-sm text-white/70">
            {t("copyright", { year: new Date().getFullYear() })}
          </p>
          <FooterLanguageSwitcher />
        </div>
      </div>

      {/* Organization JSON-LD — single site-wide source for Organization schema */}
      <JsonLd schema={generateOrganizationSchema()} />
    </footer>
  );
}
