"use client";

import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { toRegionSlug } from "@/lib/constants/norway-regions";

interface SearchResultProps {
  name: string;
  city: string;
  region: string;
  holes: number;
  par: number | null;
  slug: string;
  slugEn?: string | null;
  isActive?: boolean;
}

export function SearchResult({
  name,
  city,
  region,
  holes,
  par,
  slug,
  slugEn,
  isActive = false,
}: SearchResultProps) {
  const t = useTranslations("search");
  const locale = useLocale();
  const localizedSlug = locale === "en" && slugEn ? slugEn : slug;

  return (
    <Link
      href={`/${toRegionSlug(region)}/${localizedSlug}`}
      className={`block px-4 py-3 transition-colors ${
        isActive
          ? "bg-primary-lighter text-primary-dark"
          : "text-text-primary hover:bg-background-hover"
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <div className="truncate font-semibold">{name}</div>
          <div className="text-sm text-text-secondary">
            {city}, {region}
          </div>
        </div>
        <div className="flex shrink-0 flex-col items-end text-sm text-text-tertiary">
          <span>{t("holes", { count: holes })}</span>
          {par && <span className="text-xs">{t("par", { value: par })}</span>}
        </div>
      </div>
    </Link>
  );
}
