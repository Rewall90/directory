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
      className="transition-colors hover:text-white"
      style={{ color: "hsl(132, 30%, 70%)" }}
    >
      {t("cookieSettings")}
    </button>
  );
}
