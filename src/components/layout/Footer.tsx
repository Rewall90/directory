"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { CookieSettingsButton } from "@/components/cookie-consent";

export function Footer() {
  const t = useTranslations("footer");
  return (
    <footer className="bg-gradient-to-br from-green-900 to-green-950">
      <div className="container mx-auto max-w-[1170px] px-4 py-10">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {/* About Section */}
          <div>
            <h3
              className="mb-3 text-sm font-semibold uppercase"
              style={{ color: "hsl(132, 50%, 85%)" }}
            >
              {t("aboutTitle")}
            </h3>
            <p className="text-sm" style={{ color: "hsl(132, 30%, 70%)" }}>
              {t("aboutDescription")}
            </p>
          </div>

          {/* Navigation Links */}
          <div>
            <h3
              className="mb-3 text-sm font-semibold uppercase"
              style={{ color: "hsl(132, 50%, 85%)" }}
            >
              {t("navigationTitle")}
            </h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="/regions"
                  className="transition-colors hover:text-white"
                  style={{ color: "hsl(132, 30%, 70%)" }}
                >
                  {t("regions")}
                </Link>
              </li>
              <li>
                <Link
                  href="/blog"
                  className="transition-colors hover:text-white"
                  style={{ color: "hsl(132, 30%, 70%)" }}
                >
                  {t("blog")}
                </Link>
              </li>
              <li>
                <Link
                  href="/about"
                  className="transition-colors hover:text-white"
                  style={{ color: "hsl(132, 30%, 70%)" }}
                >
                  {t("about")}
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="transition-colors hover:text-white"
                  style={{ color: "hsl(132, 30%, 70%)" }}
                >
                  {t("contact")}
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal Links */}
          <div>
            <h3
              className="mb-3 text-sm font-semibold uppercase"
              style={{ color: "hsl(132, 50%, 85%)" }}
            >
              {t("legalTitle")}
            </h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="/privacy"
                  className="transition-colors hover:text-white"
                  style={{ color: "hsl(132, 30%, 70%)" }}
                >
                  {t("privacy")}
                </Link>
              </li>
              <li>
                <Link
                  href="/terms"
                  className="transition-colors hover:text-white"
                  style={{ color: "hsl(132, 30%, 70%)" }}
                >
                  {t("terms")}
                </Link>
              </li>
              <li>
                <CookieSettingsButton />
              </li>
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-8 border-t border-white/10 pt-6 text-center">
          <p className="text-sm" style={{ color: "hsl(132, 20%, 55%)" }}>
            {t("copyright", { year: new Date().getFullYear() })}
          </p>
        </div>
      </div>
    </footer>
  );
}
