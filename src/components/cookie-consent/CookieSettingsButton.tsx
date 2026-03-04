"use client";

import React from "react";
import { useTranslations } from "next-intl";
import { useCookieConsent } from "./useCookieConsent";

export function CookieSettingsButton() {
  const { openModal } = useCookieConsent();
  const t = useTranslations("footer");

  return (
    <button onClick={openModal} className="text-text-secondary hover:text-primary">
      {t("cookieSettings")}
    </button>
  );
}
