"use client";

import { useEffect, useState, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import MarkerClusterGroup from "react-leaflet-cluster";
import L from "leaflet";
import type { MapCourse } from "@/lib/courses";
import { useTranslations } from "next-intl";
import { MAP_CONFIG, TILE_CONFIG } from "@/lib/constants/map-config";
import { MapControls } from "./MapControls";
import { MapCoordinates } from "./MapCoordinates";
import { getLocalizedName, getLocalizedSlug } from "@/lib/utils/locale-helpers";
import { buildCourseUrl } from "@/lib/utils/url-helpers";
import "leaflet/dist/leaflet.css";

// Fix Leaflet default icon issue with Webpack
if ("_getIconUrl" in L.Icon.Default.prototype) {
  delete (L.Icon.Default.prototype as Record<string, unknown>)._getIconUrl;
}
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "/leaflet/marker-icon-2x.png",
  iconUrl: "/leaflet/marker-icon.png",
  shadowUrl: "/leaflet/marker-shadow.png",
});

interface GolfMapProps {
  courses: MapCourse[];
  onSelectCourse: (course: MapCourse) => void;
  locale: string;
  mapCenter: [number, number];
  mapZoom: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onCenterChange: (center: [number, number]) => void;
}

// Component to update map view when selected course changes
function MapController({ center, zoom }: { center: [number, number]; zoom: number }) {
  const map = useMap();

  useEffect(() => {
    // Cancel any ongoing animations before starting new one
    map.stop();
    map.setView(center, zoom, { animate: true, duration: 0.5 });
  }, [center, zoom, map]);

  return null;
}

export function GolfMap({
  courses,
  onSelectCourse,
  locale,
  mapCenter,
  mapZoom,
  onZoomIn,
  onZoomOut,
  onCenterChange,
}: GolfMapProps) {
  const t = useTranslations("map");
  const [isClient, setIsClient] = useState(false);
  const mapRef = useRef<L.Map | null>(null);

  // Stable refs for callbacks to avoid re-attaching event listeners
  const onCenterChangeRef = useRef(onCenterChange);
  const onSelectCourseRef = useRef(onSelectCourse);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Keep callback refs up to date
  useEffect(() => {
    onCenterChangeRef.current = onCenterChange;
    onSelectCourseRef.current = onSelectCourse;
  }, [onCenterChange, onSelectCourse]);

  // Event listener management with proper cleanup
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const handleMoveEnd = () => {
      const center = map.getCenter();
      onCenterChangeRef.current([center.lat, center.lng]);
    };

    map.on("moveend", handleMoveEnd);

    return () => {
      map.off("moveend", handleMoveEnd);
    };
  }, []);

  // Cleanup on unmount - let react-leaflet handle map disposal
  useEffect(() => {
    return () => {
      mapRef.current = null;
    };
  }, []);

  if (!isClient) {
    return null;
  }

  return (
    <div className="relative h-full w-full">
      <MapContainer
        center={mapCenter}
        zoom={mapZoom}
        className="h-full w-full"
        style={{ height: "100%", width: "100%" }}
        zoomControl={false}
        ref={(map) => {
          if (map) {
            mapRef.current = map;
          }
        }}
      >
        <MapController center={mapCenter} zoom={mapZoom} />

        <TileLayer
          attribution={TILE_CONFIG.ATTRIBUTION}
          url={TILE_CONFIG.URL}
          maxZoom={TILE_CONFIG.MAX_ZOOM}
        />

        <MarkerClusterGroup
          chunkedLoading
          maxClusterRadius={MAP_CONFIG.CLUSTER.MAX_RADIUS}
          spiderfyOnMaxZoom
          showCoverageOnHover={false}
          disableClusteringAtZoom={MAP_CONFIG.CLUSTER.DISABLE_AT_ZOOM}
          removeOutsideVisibleBounds={true}
        >
          {courses.map((course) => (
            <Marker
              key={course.slug}
              position={[course.coordinates.lat, course.coordinates.lng]}
              eventHandlers={{
                click: () => onSelectCourseRef.current(course),
                keypress: (e) => {
                  if (e.originalEvent.key === "Enter" || e.originalEvent.key === " ") {
                    onSelectCourseRef.current(course);
                  }
                },
              }}
            >
              <Popup>
                <div className="p-2">
                  <h3 className="font-semibold">
                    {getLocalizedName(course.name, course.name_en, locale)}
                  </h3>
                  <p className="text-base-content/70 text-sm">{course.city}</p>
                  <p className="text-sm">
                    {course.holes} {t("holes")} • {course.par ? `${t("par")} ${course.par}` : "—"}
                  </p>
                  {course.rating && (
                    <p className="text-sm">
                      ⭐ {course.rating.toFixed(1)} ({course.reviewCount})
                    </p>
                  )}
                  {course.greenFee18 && (
                    <p className="mt-1 text-sm font-medium text-primary">{course.greenFee18} kr</p>
                  )}
                  <a
                    href={buildCourseUrl(
                      course.regionSlug,
                      getLocalizedSlug(course.slug, course.slug_en, locale),
                      locale,
                    )}
                    className="mt-2 inline-block text-sm text-primary hover:underline"
                  >
                    {t("viewDetails")} →
                  </a>
                </div>
              </Popup>
            </Marker>
          ))}
        </MarkerClusterGroup>
      </MapContainer>

      {/* Custom zoom controls */}
      <MapControls zoom={mapZoom} onZoomIn={onZoomIn} onZoomOut={onZoomOut} showLocate={false} />

      {/* Coordinate display */}
      <MapCoordinates center={mapCenter} zoom={mapZoom} />
    </div>
  );
}
