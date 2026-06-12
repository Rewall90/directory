import { useTranslations, useLocale } from "next-intl";
import { Link } from "@/i18n/navigation";
import { VtgSignupButton } from "./VtgSignupButton";
import type { VtgClub } from "@/lib/vtg";

interface Props {
  club: VtgClub;
  sponsored?: boolean;
}

export function VtgClubCard({ club, sponsored = false }: Props) {
  const t = useTranslations("vtg");
  const locale = useLocale();
  const name = locale === "en" && club.name_en ? club.name_en : club.name;
  const courseSlug = locale === "en" && club.slug_en ? club.slug_en : club.slug;
  const numberLocale = locale === "en" ? "en-GB" : "nb-NO";

  const rating =
    club.rating !== null
      ? club.rating.toLocaleString(numberLocale, {
          minimumFractionDigits: 1,
          maximumFractionDigits: 1,
        })
      : null;
  const showMeta = rating !== null || club.seasonInfo !== null || !club.hasData;

  return (
    <div
      className={`rounded-lg border bg-background-surface p-5 shadow-sm ${
        sponsored ? "border-primary-light" : "border-border"
      }`}
    >
      {sponsored && (
        <div className="mb-1 text-[11px] uppercase tracking-wider text-text-tertiary">
          {t("sponsoredLabel")}
        </div>
      )}
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
        <div>
          <h3 className="text-lg font-semibold text-text-primary">
            <Link href={`/${club.regionSlug}/${courseSlug}`} className="hover:text-primary">
              {name}
            </Link>
          </h3>
          <p className="text-sm text-text-secondary">
            {club.city && club.city !== club.regionName ? `${club.city}, ` : ""}
            {club.regionName}
          </p>
          {showMeta && (
            <p className="mt-1 text-sm text-text-secondary">
              {rating !== null && (
                <>
                  <span className="text-accent" aria-hidden="true">
                    ★
                  </span>{" "}
                  {rating}
                  {club.reviewCount !== null && <> ({t("reviews", { count: club.reviewCount })})</>}
                </>
              )}
              {club.seasonInfo && (rating !== null ? ` · ${club.seasonInfo}` : club.seasonInfo)}
              {!club.hasData && (rating !== null ? ` · ${t("noPriceOnline")}` : t("noPriceOnline"))}
            </p>
          )}
        </div>
        <div className="shrink-0 sm:text-right">
          {club.price !== null && (
            <div className="text-base font-semibold text-text-primary">
              {club.price.toLocaleString(numberLocale)} kr
            </div>
          )}
          {club.priceYouth !== null && (
            <div className="text-xs text-text-tertiary">
              {t("youthPrice", { price: club.priceYouth.toLocaleString(numberLocale) })}
            </div>
          )}
          {club.signupUrl && (
            <div className="mt-2">
              <VtgSignupButton
                href={club.signupUrl}
                clubSlug={club.slug}
                region={club.regionSlug}
                label={club.hasData ? t("signupButton") : t("clubPageButton")}
                variant={club.hasData ? "primary" : "secondary"}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
