"use client";

import React from "react";
import { useTranslations } from "next-intl";
import { useCookieConsent } from "./useCookieConsent";

export function CookieConsentBanner() {
  const { showBanner, acceptAll, rejectAll, openModal } = useCookieConsent();
  const t = useTranslations("cookieConsent");

  if (!showBanner) return null;

  return (
    <div className="animate-slide-up border-border-default fixed bottom-4 left-4 z-50 max-w-sm rounded-lg border bg-background p-4 shadow-xl sm:max-w-md">
      <div className="space-y-4">
        <div>
          <h2 className="mb-2 text-lg font-semibold text-text-primary">{t("bannerTitle")}</h2>
          <p className="text-sm text-text-secondary">{t("bannerText")}</p>
        </div>

        <div className="flex flex-col gap-2">
          <button
            onClick={acceptAll}
            className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-white transition-colors duration-200 hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-primary"
            aria-label={t("acceptAllAriaLabel")}
          >
            {t("acceptAll")}
          </button>

          <div className="flex gap-2">
            <button
              onClick={openModal}
              className="border-border-default hover:bg-background-elevated flex-1 rounded-md border bg-background px-3 py-2 text-sm font-medium text-text-secondary transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary"
              aria-label={t("customizeAriaLabel")}
            >
              {t("customize")}
            </button>

            <button
              onClick={rejectAll}
              className="border-border-default hover:bg-background-elevated flex-1 rounded-md border bg-background px-3 py-2 text-sm font-medium text-text-secondary transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary"
              aria-label={t("rejectAriaLabel")}
            >
              {t("reject")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
