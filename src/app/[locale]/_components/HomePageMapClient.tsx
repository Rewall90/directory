"use client";

import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet.markercluster";
import "leaflet.markercluster/dist/MarkerCluster.css";
import "leaflet.markercluster/dist/MarkerCluster.Default.css";
import type { MapCourse } from "@/lib/courses";
import { useTranslations } from "next-intl";
import { primaryMarkerIcon } from "@/lib/map-marker";
import { buildMarkerPopupHtml } from "@/lib/map-popup";
import { MAP_CONFIG, TILE_CONFIG } from "@/lib/constants/map-config";

interface HomePageMapClientProps {
  courses: MapCourse[];
  locale: string;
}

export function HomePageMapClient({ courses, locale }: HomePageMapClientProps) {
  const t = useTranslations("map");
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const map = L.map(containerRef.current).setView([65, 13], 5);
    mapRef.current = map;

    L.tileLayer(TILE_CONFIG.URL, {
      attribution: TILE_CONFIG.ATTRIBUTION,
      maxZoom: TILE_CONFIG.MAX_ZOOM,
    }).addTo(map);

    const cluster = L.markerClusterGroup({
      chunkedLoading: true,
      maxClusterRadius: MAP_CONFIG.CLUSTER.MAX_RADIUS,
      spiderfyOnMaxZoom: true,
      showCoverageOnHover: false,
      disableClusteringAtZoom: MAP_CONFIG.CLUSTER.DISABLE_AT_ZOOM,
      removeOutsideVisibleBounds: true,
    });

    const labels = { holes: t("holes"), par: t("par"), viewDetails: t("viewDetails") };

    const markers = courses.map((course) => {
      const marker = L.marker([course.coordinates.lat, course.coordinates.lng], {
        icon: primaryMarkerIcon,
      });
      marker.bindPopup(buildMarkerPopupHtml(course, locale, labels));
      return marker;
    });

    cluster.addLayers(markers);
    map.addLayer(cluster);

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, [courses, locale, t]);

  return (
    <div
      className="relative w-full overflow-hidden rounded-xl shadow-md"
      role="application"
      aria-label={
        locale === "en"
          ? "Interactive map of golf courses in Norway"
          : "Interaktivt kart over golfbaner i Norge"
      }
    >
      <div ref={containerRef} className="h-[300px] w-full md:h-[400px] lg:h-[460px]" />
    </div>
  );
}
