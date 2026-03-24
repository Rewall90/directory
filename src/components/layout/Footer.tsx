import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { CookieSettingsButton } from "@/components/cookie-consent";
import { getRegionsWithCounts, getTopRatedCourses } from "@/lib/courses";
import { generateOrganizationSchema } from "@/lib/schema";

export async function Footer() {
  const t = await getTranslations("footer");
  const regions = getRegionsWithCounts();
  const topCourses = getTopRatedCourses(5);
  const totalCourses = regions.reduce((sum, r) => sum + r.count, 0);

  return (
    <footer className="bg-gradient-to-br from-green-900 to-green-950">
      <div className="mx-auto max-w-[1170px] px-4 py-12">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 md:grid-cols-[1.5fr_2fr_1fr_1fr_1fr]">
          {/* Brand */}
          <div>
            <h2 className="mb-3 text-xl font-bold text-white">golfkart.no</h2>
            <p className="mb-5 text-sm leading-relaxed text-white/55">{t("aboutDescription")}</p>
            <div className="flex flex-wrap gap-3">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/[0.06] px-3 py-1.5 text-xs text-white/45">
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="text-emerald-400"
                >
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 6v6l4 2" />
                </svg>
                {t("badgeCourses", { count: totalCourses })}
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/[0.06] px-3 py-1.5 text-xs text-white/45">
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="text-emerald-400"
                >
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
                {t("badgeRegions", { count: regions.length })}
              </span>
            </div>
          </div>

          {/* Regions Grid */}
          <nav aria-label={t("regionsTitle")}>
            <h2 className="mb-4 text-xs font-bold uppercase tracking-wider text-white/50">
              {t("regionsTitle")}
            </h2>
            <div className="grid grid-cols-2 gap-x-6 gap-y-0.5 md:grid-cols-3">
              {regions.map((region) => (
                <Link
                  key={region.slug}
                  href={`/${region.slug}`}
                  className="flex items-center justify-between py-1 text-[13px] text-white/60 transition-colors hover:text-white"
                >
                  {region.name}
                  <span className="rounded-full bg-white/[0.06] px-2 py-0.5 text-[11px] text-white/30">
                    {region.count}
                  </span>
                </Link>
              ))}
            </div>
          </nav>

          {/* Popular Courses */}
          <nav aria-label={t("popularCoursesTitle")}>
            <h2 className="mb-4 text-xs font-bold uppercase tracking-wider text-white/50">
              {t("popularCoursesTitle")}
            </h2>
            <ul className="space-y-1">
              {topCourses.map((course) => (
                <li key={course.slug}>
                  <Link
                    href={`/${course.regionSlug}/${course.slug}`}
                    className="flex items-center gap-2 py-1 text-sm text-white/65 transition-colors hover:text-white"
                  >
                    {course.name}
                    <span className="text-xs text-yellow-400">★ {course.rating.toFixed(1)}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Navigation */}
          <nav aria-label={t("navigationTitle")}>
            <h2 className="mb-4 text-xs font-bold uppercase tracking-wider text-white/50">
              {t("navigationTitle")}
            </h2>
            <ul className="space-y-1">
              <li>
                <Link
                  href="/regions"
                  className="block py-1 text-sm text-white/65 transition-colors hover:text-white"
                >
                  {t("allCourses")}
                </Link>
              </li>
              <li>
                <Link
                  href="/kart"
                  className="block py-1 text-sm text-white/65 transition-colors hover:text-white"
                >
                  {t("map")}
                </Link>
              </li>
              <li>
                <Link
                  href="/blog"
                  className="block py-1 text-sm text-white/65 transition-colors hover:text-white"
                >
                  {t("blog")}
                </Link>
              </li>
              <li>
                <Link
                  href="/about"
                  className="block py-1 text-sm text-white/65 transition-colors hover:text-white"
                >
                  {t("about")}
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="block py-1 text-sm text-white/65 transition-colors hover:text-white"
                >
                  {t("contact")}
                </Link>
              </li>
            </ul>
          </nav>

          {/* Legal */}
          <nav aria-label={t("legalTitle")}>
            <h2 className="mb-4 text-xs font-bold uppercase tracking-wider text-white/50">
              {t("legalTitle")}
            </h2>
            <ul className="space-y-1">
              <li>
                <Link
                  href="/privacy"
                  className="block py-1 text-sm text-white/65 transition-colors hover:text-white"
                >
                  {t("privacy")}
                </Link>
              </li>
              <li>
                <Link
                  href="/terms"
                  className="block py-1 text-sm text-white/65 transition-colors hover:text-white"
                >
                  {t("terms")}
                </Link>
              </li>
              <li>
                <CookieSettingsButton />
              </li>
            </ul>
          </nav>
        </div>

        {/* Bottom Bar */}
        <div className="mt-10 flex flex-col items-center justify-between gap-3 border-t border-white/10 pt-6 sm:flex-row">
          <p className="text-sm text-white/35">
            {t("copyright", { year: new Date().getFullYear() })}
          </p>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/[0.04] px-4 py-1.5 text-xs text-white/40">
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
            {t("trustBadge", { courses: totalCourses, regions: regions.length })}
          </span>
        </div>
      </div>

      {/* Organization JSON-LD — also emitted by page-level composables on homepage/region pages.
          Retained here to cover about, contact, kart, privacy, terms, blog pages. */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(generateOrganizationSchema()),
        }}
      />
    </footer>
  );
}
