"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { CookieSettingsButton } from "@/components/cookie-consent";

export function Footer() {
  const t = useTranslations("footer");
  return (
    <footer className="border-border-default bg-background-elevated border-t">
      <div className="container mx-auto max-w-[1170px] px-4 py-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {/* About Section */}
          <div>
            <h3 className="mb-3 text-sm font-semibold uppercase text-text-primary">
              {t("aboutTitle")}
            </h3>
            <p className="text-sm text-text-secondary">{t("aboutDescription")}</p>
          </div>

          {/* Navigation Links */}
          <div>
            <h3 className="mb-3 text-sm font-semibold uppercase text-text-primary">
              {t("navigationTitle")}
            </h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/regions" className="text-text-secondary hover:text-primary">
                  {t("regions")}
                </Link>
              </li>
              <li>
                <Link href="/blog" className="text-text-secondary hover:text-primary">
                  {t("blog")}
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-text-secondary hover:text-primary">
                  {t("about")}
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-text-secondary hover:text-primary">
                  {t("contact")}
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal Links */}
          <div>
            <h3 className="mb-3 text-sm font-semibold uppercase text-text-primary">
              {t("legalTitle")}
            </h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/privacy" className="text-text-secondary hover:text-primary">
                  {t("privacy")}
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-text-secondary hover:text-primary">
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
        <div className="mt-8 border-t border-border-subtle pt-6 text-center">
          <p className="text-sm text-text-tertiary">
            {t("copyright", { year: new Date().getFullYear() })}
          </p>
        </div>
      </div>
    </footer>
  );
}
