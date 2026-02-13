"use client";

import React from "react";
import { useCookieConsent } from "./useCookieConsent";

export function CookieConsentBanner() {
  const { showBanner, acceptAll, rejectAll, openModal } = useCookieConsent();

  if (!showBanner) return null;

  return (
    <div className="animate-slide-up border-border-default fixed bottom-4 left-4 z-50 max-w-sm rounded-lg border bg-background p-4 shadow-xl sm:max-w-md">
      <div className="space-y-4">
        <div>
          <h2 className="mb-2 text-lg font-semibold text-text-primary">
            Vi respekterer personvernet ditt
          </h2>
          <p className="text-sm text-text-secondary">
            Vi bruker informasjonskapsler for å forbedre nettleseropplevelsen din, vise personlig
            tilpassede annonser eller innhold, og analysere trafikken vår. Ved å klikke på «Godta
            alle», samtykker du til vår bruk av informasjonskapsler.
          </p>
        </div>

        <div className="flex flex-col gap-2">
          <button
            onClick={acceptAll}
            className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-white transition-colors duration-200 hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-primary"
            aria-label="Aksepter alle informasjonskapsler"
          >
            Aksepter alt
          </button>

          <div className="flex gap-2">
            <button
              onClick={openModal}
              className="border-border-default hover:bg-background-elevated flex-1 rounded-md border bg-background px-3 py-2 text-sm font-medium text-text-secondary transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary"
              aria-label="Tilpass samtykkepreferanser"
            >
              Tilpass
            </button>

            <button
              onClick={rejectAll}
              className="border-border-default hover:bg-background-elevated flex-1 rounded-md border bg-background px-3 py-2 text-sm font-medium text-text-secondary transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary"
              aria-label="Avvis alle informasjonskapsler"
            >
              Avvis
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
