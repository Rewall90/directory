"use client";

import { useTranslations } from "next-intl";
import { memo } from "react";

export const MapLoading = memo(function MapLoading() {
  const t = useTranslations("map");

  return (
    <div
      className="flex h-full items-center justify-center bg-base-200"
      role="status"
      aria-live="polite"
    >
      <span className="loading loading-spinner loading-lg" aria-hidden="true"></span>
      <p className="ml-4">{t("loading")}</p>
    </div>
  );
});
