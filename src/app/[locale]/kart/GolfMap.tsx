"use client";

import { useEffect, useState, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet.markercluster";
import "leaflet.markercluster/dist/MarkerCluster.css";
import "leaflet.markercluster/dist/MarkerCluster.Default.css";
import type { MapCourse } from "@/lib/courses";
import { useTranslations } from "next-intl";
import { MAP_CONFIG, TILE_CONFIG } from "@/lib/constants/map-config";
import { MapControls } from "./MapControls";
import { MapCoordinates } from "./MapCoordinates";
import { primaryMarkerIcon } from "@/lib/map-marker";
import { buildMarkerPopupHtml } from "@/lib/map-popup";

interface GolfMapProps {
  courses: MapCourse[];
  onSelectCourse: (course: MapCourse) => void;
  locale: string;
  mapCenter: [number, number];
  mapZoom: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onCenterChange: (center: [number, number]) => void;
  onZoomChange?: (zoom: number) => void;
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
  onZoomChange,
}: GolfMapProps) {
  const t = useTranslations("map");
  const [mapReady, setMapReady] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const clusterRef = useRef<L.MarkerClusterGroup | null>(null);

  // Stable refs for callbacks
  const onCenterChangeRef = useRef(onCenterChange);
  const onSelectCourseRef = useRef(onSelectCourse);
  const onZoomChangeRef = useRef(onZoomChange);
  useEffect(() => {
    onCenterChangeRef.current = onCenterChange;
    onSelectCourseRef.current = onSelectCourse;
    onZoomChangeRef.current = onZoomChange;
  }, [onCenterChange, onSelectCourse, onZoomChange]);

  // Create map imperatively
  useEffect(() => {
    if (!containerRef.current) return;

    const map = L.map(containerRef.current, {
      center: mapCenter,
      zoom: mapZoom,
      zoomControl: false,
    });
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
    clusterRef.current = cluster;
    map.addLayer(cluster);

    map.on("moveend", () => {
      const center = map.getCenter();
      onCenterChangeRef.current([center.lat, center.lng]);
      onZoomChangeRef.current?.(map.getZoom());
    });

    setMapReady(true);

    return () => {
      map.remove();
      mapRef.current = null;
      clusterRef.current = null;
      setMapReady(false);
    };
    // Only create the map once on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Sync map view when mapCenter/mapZoom change from parent
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    const cur = map.getCenter();
    if (
      Math.abs(cur.lat - mapCenter[0]) < 0.0001 &&
      Math.abs(cur.lng - mapCenter[1]) < 0.0001 &&
      map.getZoom() === mapZoom
    ) {
      return;
    }
    map.stop();
    map.setView(mapCenter, mapZoom, { animate: true, duration: 0.5 });
  }, [mapCenter, mapZoom]);

  // Sync markers when courses change or map becomes ready
  useEffect(() => {
    if (!mapReady) return;
    const cluster = clusterRef.current;
    if (!cluster) return;

    cluster.clearLayers();

    const labels = { holes: t("holes"), par: t("par"), viewDetails: t("viewDetails") };

    const markers = courses.map((course) => {
      const marker = L.marker([course.coordinates.lat, course.coordinates.lng], {
        icon: primaryMarkerIcon,
      });
      marker.bindPopup(buildMarkerPopupHtml(course, locale, labels));
      marker.on("click", () => onSelectCourseRef.current(course));
      return marker;
    });

    cluster.addLayers(markers);
  }, [courses, locale, t, mapReady]);

  return (
    <div className="relative h-full w-full">
      <div ref={containerRef} className="h-full w-full" />

      <MapControls zoom={mapZoom} onZoomIn={onZoomIn} onZoomOut={onZoomOut} showLocate={false} />

      <MapCoordinates center={mapCenter} zoom={mapZoom} />
    </div>
  );
}
