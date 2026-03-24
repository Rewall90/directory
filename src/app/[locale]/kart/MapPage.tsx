"use client";

import { useState, useMemo, useEffect, useCallback, useRef } from "react";
import { useTranslations } from "next-intl";
import type { MapCourse } from "@/lib/courses";
import { MAP_CONFIG } from "@/lib/constants/map-config";
import dynamic from "next/dynamic";
import { MapLoading } from "./MapLoading";
import { ErrorBoundary } from "@/components/error-boundary/ErrorBoundary";
import { extractFilterOptions } from "@/lib/utils/map-filters";
import { getLocalizedName } from "@/lib/utils/locale-helpers";

const DynamicMap = dynamic(() => import("./GolfMap").then((mod) => mod.GolfMap), {
  ssr: false,
  loading: () => <MapLoading />,
});

interface MapPageProps {
  courses: MapCourse[];
  locale: string;
}

export function MapPage({ courses, locale }: MapPageProps) {
  const t = useTranslations("map");
  const searchInputRef = useRef<HTMLInputElement>(null);

  const [selectedCourse, setSelectedCourse] = useState<MapCourse | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRegion, setSelectedRegion] = useState<string>("all");
  const [selectedCity, setSelectedCity] = useState<string>("all");
  const [minHoles, setMinHoles] = useState<number | null>(null);
  const [maxPrice, setMaxPrice] = useState<number | null>(null);

  // Map state
  const [mapCenter, setMapCenter] = useState<[number, number]>(MAP_CONFIG.NORWAY_CENTER);
  const [mapZoom, setMapZoom] = useState<number>(MAP_CONFIG.INITIAL_ZOOM);

  // Update map center and zoom when a course is selected
  useEffect(() => {
    if (selectedCourse) {
      setMapCenter([selectedCourse.coordinates.lat, selectedCourse.coordinates.lng]);
      setMapZoom(MAP_CONFIG.DETAIL_ZOOM);
    }
  }, [selectedCourse]);

  // Zoom handlers
  const handleZoomIn = useCallback(() => {
    setMapZoom((z) => Math.min(z + 1, MAP_CONFIG.MAX_ZOOM));
  }, []);

  const handleZoomOut = useCallback(() => {
    setMapZoom((z) => Math.max(z - 1, MAP_CONFIG.MIN_ZOOM));
  }, []);

  const handleCenterChange = useCallback((center: [number, number]) => {
    setMapCenter(center);
  }, []);

  const handleZoomChange = useCallback((zoom: number) => {
    setMapZoom(zoom);
  }, []);

  // Extract unique regions and cities (optimized - single pass)
  const { regions, cities } = useMemo(() => extractFilterOptions(courses), [courses]);

  // Filter courses
  const filteredCourses = useMemo(() => {
    return courses.filter((course) => {
      // Search filter - search both Norwegian and English names
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const nameNb = course.name.toLowerCase();
        const nameEn = course.name_en?.toLowerCase() || "";

        if (
          !nameNb.includes(query) &&
          !nameEn.includes(query) &&
          !course.city.toLowerCase().includes(query)
        ) {
          return false;
        }
      }

      // Region filter
      if (selectedRegion !== "all" && course.region !== selectedRegion) {
        return false;
      }

      // City filter
      if (selectedCity !== "all" && course.city !== selectedCity) {
        return false;
      }

      // Holes filter
      if (minHoles && course.holes < minHoles) {
        return false;
      }

      // Price filter
      if (maxPrice && course.greenFee18 && course.greenFee18 > maxPrice) {
        return false;
      }

      return true;
    });
  }, [courses, searchQuery, selectedRegion, selectedCity, minHoles, maxPrice]);

  return (
    <div className="flex h-[calc(100vh-80px)] w-full flex-col md:flex-row">
      {/* Sidebar */}
      <aside className="order-2 h-1/2 w-full overflow-y-auto border-r border-base-300 bg-base-100 p-4 md:order-1 md:h-full md:w-96">
        <h1 className="mb-4 text-2xl font-bold">{t("title")}</h1>

        {/* Search */}
        <div className="form-control mb-4">
          <label htmlFor="course-search" className="sr-only">
            {t("searchPlaceholder")}
          </label>
          <input
            ref={searchInputRef}
            id="course-search"
            type="text"
            placeholder={t("searchPlaceholder")}
            className="input-bordered input w-full"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            aria-label={t("searchPlaceholder")}
          />
        </div>

        {/* Filters */}
        <div className="space-y-3">
          {/* Region filter */}
          <div>
            <label htmlFor="region-filter" className="sr-only">
              {t("filterByRegion")}
            </label>
            <select
              id="region-filter"
              className="select-bordered select w-full"
              value={selectedRegion}
              onChange={(e) => setSelectedRegion(e.target.value)}
              aria-label={t("filterByRegion")}
            >
              <option value="all">{t("allRegions")}</option>
              {regions.map((region) => (
                <option key={region} value={region}>
                  {region}
                </option>
              ))}
            </select>
          </div>

          {/* City filter */}
          <div>
            <label htmlFor="city-filter" className="sr-only">
              {t("filterByCity")}
            </label>
            <select
              id="city-filter"
              className="select-bordered select w-full"
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              aria-label={t("filterByCity")}
            >
              <option value="all">{t("allCities")}</option>
              {cities.map((city) => (
                <option key={city} value={city}>
                  {city}
                </option>
              ))}
            </select>
          </div>

          {/* Holes filter */}
          <div>
            <label htmlFor="holes-filter" className="sr-only">
              {t("filterByHoles")}
            </label>
            <select
              id="holes-filter"
              className="select-bordered select w-full"
              value={minHoles || "all"}
              onChange={(e) =>
                setMinHoles(e.target.value === "all" ? null : Number(e.target.value))
              }
              aria-label={t("filterByHoles")}
            >
              <option value="all">{t("filterByHoles")}</option>
              <option value="9">9+ {t("holes")}</option>
              <option value="18">18+ {t("holes")}</option>
              <option value="27">27+ {t("holes")}</option>
            </select>
          </div>

          {/* Price filter */}
          <div>
            <label htmlFor="price-filter" className="sr-only">
              {t("filterByPrice")}
            </label>
            <select
              id="price-filter"
              className="select-bordered select w-full"
              value={maxPrice || "all"}
              onChange={(e) =>
                setMaxPrice(e.target.value === "all" ? null : Number(e.target.value))
              }
              aria-label={t("filterByPrice")}
            >
              <option value="all">{t("filterByPrice")}</option>
              <option value="500">{t("maxPrice500")}</option>
              <option value="750">{t("maxPrice750")}</option>
              <option value="1000">{t("maxPrice1000")}</option>
            </select>
          </div>

          {/* Clear Filters Button */}
          {(searchQuery ||
            selectedRegion !== "all" ||
            selectedCity !== "all" ||
            minHoles ||
            maxPrice) && (
            <button
              onClick={() => {
                setSearchQuery("");
                setSelectedRegion("all");
                setSelectedCity("all");
                setMinHoles(null);
                setMaxPrice(null);
                setSelectedCourse(null);
                searchInputRef.current?.focus();
              }}
              className="btn btn-outline btn-sm w-full"
            >
              {t("clearFilters")}
            </button>
          )}
        </div>

        {/* Results count */}
        <p
          className="text-base-content/70 mt-4 text-sm"
          role="status"
          aria-live="polite"
          aria-atomic="true"
        >
          {t("showingCourses", {
            filtered: filteredCourses.length,
            total: courses.length,
          })}
        </p>

        {/* Course list */}
        <div className="mt-4 space-y-2">
          {filteredCourses.length === 0 && (
            <div className="mt-8 text-center" role="status" aria-live="polite">
              <p className="text-base-content/70">{t("noResults")}</p>
            </div>
          )}
          {filteredCourses.map((course) => (
            <button
              key={course.slug}
              onClick={() => setSelectedCourse(course)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  setSelectedCourse(course);
                }
              }}
              className={`w-full rounded-lg border p-3 text-left transition-colors ${
                selectedCourse?.slug === course.slug
                  ? "bg-primary/10 border-primary"
                  : "border-base-300 hover:bg-base-200"
              }`}
              aria-label={`Select ${getLocalizedName(course.name, course.name_en, locale)}`}
            >
              <h3 className="font-semibold">
                {getLocalizedName(course.name, course.name_en, locale)}
              </h3>
              <p className="text-base-content/70 text-sm">{course.city}</p>
              <p className="text-sm">
                {course.holes} {t("holes")} • {course.par ? `${t("par")} ${course.par}` : "—"}
              </p>
              {course.greenFee18 && (
                <p className="text-sm font-medium text-primary">{course.greenFee18} kr</p>
              )}
            </button>
          ))}
        </div>
      </aside>

      {/* Map */}
      <div className="order-1 h-1/2 flex-1 md:order-2 md:h-full">
        <ErrorBoundary>
          <DynamicMap
            courses={filteredCourses}
            onSelectCourse={setSelectedCourse}
            locale={locale}
            mapCenter={mapCenter}
            mapZoom={mapZoom}
            onZoomIn={handleZoomIn}
            onZoomOut={handleZoomOut}
            onCenterChange={handleCenterChange}
            onZoomChange={handleZoomChange}
          />
        </ErrorBoundary>
      </div>
    </div>
  );
}
