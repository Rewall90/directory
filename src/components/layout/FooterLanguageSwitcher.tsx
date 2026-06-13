"use client";

import { useTranslations, useLocale } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";

export function FooterLanguageSwitcher() {
  const t = useTranslations("footer");
  const locale = useLocale();
  const pathname = usePathname();

  return (
    <Link
      href={pathname}
      locale={locale === "nb" ? "en" : "nb"}
      lang={locale === "nb" ? "en" : "nb"}
      className="inline-block py-1.5 text-sm text-white/75 underline decoration-white/40 underline-offset-2 transition-colors hover:text-white"
    >
      {t("switchLanguage")}
    </Link>
  );
}
