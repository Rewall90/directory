"use client";

import React from "react";
import { useTranslations } from "next-intl";
import { useCookieConsent } from "./useCookieConsent";

export function CookieSettingsButton() {
  const { openModal } = useCookieConsent();
  const t = useTranslations("footer");

  return (
    <button
      onClick={openModal}
      className="text-sm text-white/65 transition-colors hover:text-white"
    >
      {t("cookieSettings")}
    </button>
  );
}
