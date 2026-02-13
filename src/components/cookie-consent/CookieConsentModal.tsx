"use client";

import React, { useState, useEffect } from "react";
import { useCookieConsent } from "./useCookieConsent";
import type { CookieConsent } from "./types";
import { COOKIE_CATEGORIES } from "./types";

export function CookieConsentModal() {
  const { showModal, closeModal, updateConsent, preferences, rejectAll, acceptAll } =
    useCookieConsent();
  const [selectedCategories, setSelectedCategories] = useState<CookieConsent>({
    necessary: true,
    functional: false,
    analytics: false,
    performance: false,
    advertising: false,
  });
  const [showMoreInfo, setShowMoreInfo] = useState(false);

  // Update local state when preferences change
  useEffect(() => {
    if (preferences) {
      setSelectedCategories(preferences.categories);
    }
  }, [preferences]);

  if (!showModal) return null;

  const handleCategoryToggle = (categoryId: keyof CookieConsent) => {
    if (categoryId === "necessary") return; // Can't toggle necessary cookies

    setSelectedCategories((prev) => ({
      ...prev,
      [categoryId]: !prev[categoryId],
    }));
  };

  const handleSavePreferences = () => {
    updateConsent(selectedCategories);
  };

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto"
      aria-labelledby="cookie-modal-title"
      role="dialog"
      aria-modal="true"
    >
      <div className="flex min-h-screen items-center justify-center px-4 pb-20 pt-4 text-center sm:block sm:p-0">
        {/* Background overlay */}
        <div
          className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
          aria-hidden="true"
          onClick={closeModal}
        ></div>

        {/* Modal panel */}
        <div className="border-border-default inline-block transform overflow-hidden rounded-lg border bg-background text-left align-bottom shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-2xl sm:align-middle">
          <div className="bg-background px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
            <div className="sm:flex sm:items-start">
              <div className="mt-3 w-full text-center sm:mt-0 sm:text-left">
                <div className="mb-4 flex items-center justify-between">
                  <h3
                    className="text-2xl font-semibold leading-6 text-text-primary"
                    id="cookie-modal-title"
                  >
                    Tilpass samtykkepreferanser
                  </h3>
                  <button
                    onClick={closeModal}
                    className="hover:bg-background-elevated rounded-full p-1 text-text-tertiary transition-colors duration-200 hover:text-text-secondary focus:outline-none focus:ring-2 focus:ring-primary"
                    aria-label="Lukk modal"
                  >
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>

                <div className="mt-2">
                  <p className="mb-4 text-sm text-text-secondary">
                    Vi bruker informasjonskapsler for å hjelpe deg med å navigere effektivt og
                    utføre visse funksjoner. Du finner detaljert informasjon om alle
                    informasjonskapsler under hver samtykkekategori nedenfor. Informasjonskapslene
                    som er kategorisert som «Nødvendige» lagres i nettleseren din da de er
                    avgjørende for å aktivere de grunnleggende funksjonene til nettstedet.
                    {showMoreInfo && (
                      <span>
                        <br />
                        <br />
                        Vi bruker også tredjeparts informasjonskapsler som hjelper oss med å
                        analysere hvordan du bruker denne nettsiden, lagrer innstillingene dine og
                        angir innhold og annonser som er relevante for deg. Disse
                        informasjonskapslene vil kun bli lagret i nettleseren din med ditt
                        forhåndssamtykke.
                        <br />
                        <br />
                        Du kan velge å aktivere eller deaktivere noen eller alle disse
                        informasjonskapslene, men deaktivering av noen av dem kan påvirke
                        nettleseropplevelsen din.
                      </span>
                    )}
                  </p>

                  <button
                    onClick={() => setShowMoreInfo(!showMoreInfo)}
                    className="mb-4 rounded px-2 py-1 text-sm text-primary underline transition-colors duration-200 hover:no-underline focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    {showMoreInfo ? "Vis mindre" : "Vis mer"}
                  </button>

                  <div className="max-h-96 space-y-4 overflow-y-auto pr-2">
                    {COOKIE_CATEGORIES.map((category) => (
                      <div
                        key={category.id}
                        className="border-border-default bg-background-elevated rounded-lg border p-4 transition-colors duration-200 hover:border-primary"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <h4 className="flex items-center gap-2 text-base font-medium text-text-primary">
                              <span>{category.name}</span>
                            </h4>
                          </div>
                          <div className="ml-3">
                            {category.required ? (
                              <span className="bg-primary/10 rounded-full px-2 py-1 text-sm font-medium text-primary">
                                Alltid aktiv
                              </span>
                            ) : (
                              <button
                                type="button"
                                className={`${
                                  selectedCategories[category.id as keyof CookieConsent]
                                    ? "bg-primary"
                                    : "bg-border-default"
                                } relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2`}
                                role="switch"
                                aria-checked={
                                  selectedCategories[category.id as keyof CookieConsent]
                                }
                                onClick={() =>
                                  handleCategoryToggle(category.id as keyof CookieConsent)
                                }
                              >
                                <span
                                  aria-hidden="true"
                                  className={`${
                                    selectedCategories[category.id as keyof CookieConsent]
                                      ? "translate-x-5"
                                      : "translate-x-0"
                                  } pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}
                                />
                              </button>
                            )}
                          </div>
                        </div>
                        <details className="mt-2">
                          <summary className="cursor-pointer text-sm font-medium text-text-secondary transition-colors duration-200 hover:text-text-primary">
                            Les mer om denne kategorien
                          </summary>
                          <div className="mt-2 text-sm text-text-secondary">
                            <p className="mb-3">{category.description}</p>
                            {category.cookies && category.cookies.length > 0 && (
                              <div className="space-y-3">
                                {category.cookies.map((cookie, index) => (
                                  <div
                                    key={index}
                                    className="border-border-default rounded border bg-background p-3"
                                  >
                                    <div className="grid grid-cols-1 gap-2 text-xs sm:grid-cols-3">
                                      <div>
                                        <span className="font-medium text-text-primary">
                                          Informasjonskapsel:
                                        </span>
                                        <div className="bg-background-elevated mt-1 rounded px-2 py-1 font-mono text-text-secondary">
                                          {cookie.name}
                                        </div>
                                      </div>
                                      <div>
                                        <span className="font-medium text-text-primary">
                                          Varighet:
                                        </span>
                                        <div className="text-text-secondary">{cookie.duration}</div>
                                      </div>
                                      {cookie.provider && (
                                        <div>
                                          <span className="font-medium text-text-primary">
                                            Leverandør:
                                          </span>
                                          <div className="text-text-secondary">
                                            {cookie.provider}
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                    <div className="mt-2">
                                      <span className="font-medium text-text-primary">
                                        Beskrivelse:
                                      </span>
                                      <div className="mt-1 text-text-secondary">
                                        {cookie.description}
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </details>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-background-elevated flex flex-row-reverse gap-3 px-4 py-3 sm:px-6">
            <button
              type="button"
              onClick={acceptAll}
              className="inline-flex w-full justify-center rounded-md border border-transparent bg-primary px-4 py-2 text-base font-medium text-white shadow-sm transition-colors duration-200 hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 sm:ml-3 sm:w-auto sm:text-sm"
            >
              Aksepter alt
            </button>
            <button
              type="button"
              onClick={handleSavePreferences}
              className="border-border-default hover:bg-background-elevated inline-flex w-full justify-center rounded-md border bg-background px-4 py-2 text-base font-medium text-text-primary shadow-sm transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 sm:ml-3 sm:w-auto sm:text-sm"
            >
              Lagre mine preferanser
            </button>
            <button
              type="button"
              onClick={rejectAll}
              className="border-border-default hover:bg-background-elevated mt-3 inline-flex w-full justify-center rounded-md border bg-background px-4 py-2 text-base font-medium text-text-secondary shadow-sm transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 sm:mt-0 sm:w-auto sm:text-sm"
            >
              Avvis
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
