"use client";

import React from "react";
import { useCookieConsent } from "./useCookieConsent";

export function CookieSettingsButton() {
  const { openModal } = useCookieConsent();

  return (
    <button onClick={openModal} className="text-text-secondary hover:text-primary">
      Informasjonskapselinnstillinger
    </button>
  );
}
