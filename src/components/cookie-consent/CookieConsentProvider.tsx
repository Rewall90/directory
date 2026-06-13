"use client";

import type { ReactNode } from "react";
import React, { createContext, useState, useEffect, useCallback } from "react";
import type { CookieConsentContextType, CookiePreferences, CookieConsent } from "./types";
import { cookieManager } from "./cookieManager";

export const CookieConsentContext = createContext<CookieConsentContextType | undefined>(undefined);

interface CookieConsentProviderProps {
  children: ReactNode;
}

export function CookieConsentProvider({ children }: CookieConsentProviderProps) {
  const [preferences, setPreferences] = useState<CookiePreferences | null>(null);
  const [showBanner, setShowBanner] = useState(false);
  const [showModal, setShowModal] = useState(false);

  // Initialize preferences on mount
  useEffect(() => {
    const storedPreferences = cookieManager.getPreferences();

    if (storedPreferences) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- pre-existing pattern, predates rule adoption
      setPreferences(storedPreferences);
      setShowBanner(false);
    } else {
      setShowBanner(true);
    }

    // Google consent mode default is set in the inline GA script in the root
    // layout, before gtag('config'), so the first hit is consent-gated.
  }, []);

  const hasConsent = useCallback(
    (category: keyof CookieConsent): boolean => {
      if (!preferences) return false;
      return preferences.categories[category];
    },
    [preferences],
  );

  const updateConsent = useCallback((categories: Partial<CookieConsent>) => {
    const newPreferences = cookieManager.savePreferences(categories);
    setPreferences(newPreferences);
    setShowBanner(false);
    setShowModal(false);
  }, []);

  const acceptAll = useCallback(() => {
    updateConsent({
      functional: true,
      analytics: true,
      performance: true,
      advertising: true,
    });
  }, [updateConsent]);

  const rejectAll = useCallback(() => {
    updateConsent({
      functional: false,
      analytics: false,
      performance: false,
      advertising: false,
    });
  }, [updateConsent]);

  const openModal = useCallback(() => {
    setShowModal(true);
  }, []);

  const closeModal = useCallback(() => {
    setShowModal(false);
  }, []);

  const contextValue: CookieConsentContextType = {
    preferences,
    hasConsent,
    updateConsent,
    acceptAll,
    rejectAll,
    showBanner,
    showModal,
    openModal,
    closeModal,
  };

  return (
    <CookieConsentContext.Provider value={contextValue}>{children}</CookieConsentContext.Provider>
  );
}
