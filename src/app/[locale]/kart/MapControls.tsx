"use client";

import { useTranslations } from "next-intl";
import { MAP_CONFIG } from "@/lib/constants/map-config";

interface MapControlsProps {
  zoom: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onLocate?: () => void;
  showLocate?: boolean;
}

export function MapControls({
  zoom,
  onZoomIn,
  onZoomOut,
  onLocate,
  showLocate = true,
}: MapControlsProps) {
  const t = useTranslations("map");

  return (
    <div className="absolute right-4 top-4 z-[1000] flex flex-col gap-2">
      {/* Zoom In */}
      <button
        onClick={onZoomIn}
        disabled={zoom >= MAP_CONFIG.MAX_ZOOM}
        className="btn btn-sm btn-square bg-white shadow-lg hover:bg-base-200 disabled:opacity-50"
        aria-label="Zoom in"
        title="Zoom in"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
      </button>

      {/* Zoom Out */}
      <button
        onClick={onZoomOut}
        disabled={zoom <= MAP_CONFIG.MIN_ZOOM}
        className="btn btn-sm btn-square bg-white shadow-lg hover:bg-base-200 disabled:opacity-50"
        aria-label="Zoom out"
        title="Zoom out"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
        </svg>
      </button>

      {/* Locate Me */}
      {showLocate && onLocate && (
        <button
          onClick={onLocate}
          className="btn btn-sm btn-square bg-white shadow-lg hover:bg-base-200"
          aria-label={t("findMyLocation")}
          title={t("findMyLocation")}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
        </button>
      )}
    </div>
  );
}
