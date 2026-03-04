"use client";

import React, { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { useCookieConsent } from "./useCookieConsent";
import type { CookieConsent } from "./types";
import { COOKIE_CATEGORIES } from "./types";

const CATEGORY_NAME_KEYS: Record<string, string> = {
  necessary: "categoryNecessary",
  functional: "categoryFunctional",
  analytics: "categoryAnalytics",
  performance: "categoryPerformance",
  advertising: "categoryAdvertising",
};

const CATEGORY_DESC_KEYS: Record<string, string> = {
  necessary: "categoryNecessaryDesc",
  functional: "categoryFunctionalDesc",
  analytics: "categoryAnalyticsDesc",
  performance: "categoryPerformanceDesc",
  advertising: "categoryAdvertisingDesc",
};

export function CookieConsentModal() {
  const { showModal, closeModal, updateConsent, preferences, rejectAll, acceptAll } =
    useCookieConsent();
  const t = useTranslations("cookieConsent");
  const [selectedCategories, setSelectedCategories] = useState<CookieConsent>({
    necessary: true,
    functional: false,
    analytics: false,
    performance: false,
    advertising: false,
  });
  const [showMoreInfo, setShowMoreInfo] = useState(false);

  useEffect(() => {
    if (preferences) {
      setSelectedCategories(preferences.categories);
    }
  }, [preferences]);

  if (!showModal) return null;

  const handleCategoryToggle = (categoryId: keyof CookieConsent) => {
    if (categoryId === "necessary") return;

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
        <div
          className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
          aria-hidden="true"
          onClick={closeModal}
        ></div>

        <div className="border-border-default inline-block transform overflow-hidden rounded-lg border bg-background text-left align-bottom shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-2xl sm:align-middle">
          <div className="bg-background px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
            <div className="sm:flex sm:items-start">
              <div className="mt-3 w-full text-center sm:mt-0 sm:text-left">
                <div className="mb-4 flex items-center justify-between">
                  <h3
                    className="text-2xl font-semibold leading-6 text-text-primary"
                    id="cookie-modal-title"
                  >
                    {t("modalTitle")}
                  </h3>
                  <button
                    onClick={closeModal}
                    className="hover:bg-background-elevated rounded-full p-1 text-text-tertiary transition-colors duration-200 hover:text-text-secondary focus:outline-none focus:ring-2 focus:ring-primary"
                    aria-label={t("closeModal")}
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
                    {t("modalIntro")}
                    {showMoreInfo && (
                      <span>
                        <br />
                        <br />
                        {t("modalIntroExtra")}
                      </span>
                    )}
                  </p>

                  <button
                    onClick={() => setShowMoreInfo(!showMoreInfo)}
                    className="mb-4 rounded px-2 py-1 text-sm text-primary underline transition-colors duration-200 hover:no-underline focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    {showMoreInfo ? t("showLess") : t("showMore")}
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
                              <span>
                                {CATEGORY_NAME_KEYS[category.id]
                                  ? t(CATEGORY_NAME_KEYS[category.id])
                                  : category.name}
                              </span>
                            </h4>
                          </div>
                          <div className="ml-3">
                            {category.required ? (
                              <span className="bg-primary/10 rounded-full px-2 py-1 text-sm font-medium text-primary">
                                {t("alwaysActive")}
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
                            {t("readMore")}
                          </summary>
                          <div className="mt-2 text-sm text-text-secondary">
                            <p className="mb-3">
                              {CATEGORY_DESC_KEYS[category.id]
                                ? t(CATEGORY_DESC_KEYS[category.id])
                                : category.description}
                            </p>
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
                                          {t("cookieLabel")}
                                        </span>
                                        <div className="bg-background-elevated mt-1 rounded px-2 py-1 font-mono text-text-secondary">
                                          {cookie.name}
                                        </div>
                                      </div>
                                      <div>
                                        <span className="font-medium text-text-primary">
                                          {t("durationLabel")}
                                        </span>
                                        <div className="text-text-secondary">{cookie.duration}</div>
                                      </div>
                                      {cookie.provider && (
                                        <div>
                                          <span className="font-medium text-text-primary">
                                            {t("providerLabel")}
                                          </span>
                                          <div className="text-text-secondary">
                                            {cookie.provider}
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                    <div className="mt-2">
                                      <span className="font-medium text-text-primary">
                                        {t("descriptionLabel")}
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
              {t("acceptAll")}
            </button>
            <button
              type="button"
              onClick={handleSavePreferences}
              className="border-border-default hover:bg-background-elevated inline-flex w-full justify-center rounded-md border bg-background px-4 py-2 text-base font-medium text-text-primary shadow-sm transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 sm:ml-3 sm:w-auto sm:text-sm"
            >
              {t("savePreferences")}
            </button>
            <button
              type="button"
              onClick={rejectAll}
              className="border-border-default hover:bg-background-elevated mt-3 inline-flex w-full justify-center rounded-md border bg-background px-4 py-2 text-base font-medium text-text-secondary shadow-sm transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 sm:mt-0 sm:w-auto sm:text-sm"
            >
              {t("reject")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
