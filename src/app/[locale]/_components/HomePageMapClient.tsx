"use client";

import { useEffect, useState, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import type { MapCourse } from "@/lib/courses";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import "leaflet/dist/leaflet.css";

// Fix Leaflet default icon issue with Webpack
// @ts-expect-error - Leaflet internal property not in type definitions
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "/leaflet/marker-icon-2x.png",
  iconUrl: "/leaflet/marker-icon.png",
  shadowUrl: "/leaflet/marker-shadow.png",
});

interface HomePageMapClientProps {
  courses: MapCourse[];
  locale: string;
}

export function HomePageMapClient({ courses, locale }: HomePageMapClientProps) {
  const t = useTranslations("map");
  const router = useRouter();
  const mapRef = useRef<L.Map | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [mapId] = useState(() => `map-${Math.random().toString(36).substr(2, 9)}`);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  const handleViewDetails = (course: MapCourse) => {
    const slug = locale === "en" && course.slug_en ? course.slug_en : course.slug;
    router.push(`/${course.regionSlug}/${slug}`);
  };

  return (
    <div className="relative w-full max-w-2xl overflow-hidden rounded-lg shadow-lg">
      <div ref={containerRef} id={mapId} className="h-[300px] w-full md:h-[400px] lg:h-[500px]">
        <MapContainer
          center={[65, 13]} // Center of Norway
          zoom={5}
          style={{ height: "100%", width: "100%" }}
          ref={(map) => {
            if (map) mapRef.current = map;
          }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/" target="_blank" rel="noopener noreferrer">CARTO</a>'
            url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
            maxZoom={20}
          />

          {/* Show markers without clustering for homepage */}
          {courses.map((course) => (
            <Marker
              key={course.slug}
              position={[course.coordinates.lat, course.coordinates.lng]}
              eventHandlers={{
                click: () => handleViewDetails(course),
                keypress: (e) => {
                  if (e.originalEvent.key === "Enter" || e.originalEvent.key === " ") {
                    handleViewDetails(course);
                  }
                },
              }}
            >
              <Popup>
                <div className="p-2">
                  <h3 className="font-semibold">
                    {locale === "en" && course.name_en ? course.name_en : course.name}
                  </h3>
                  <p className="text-sm text-gray-600">{course.city}</p>
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
                  <button
                    onClick={() => handleViewDetails(course)}
                    className="mt-2 inline-block text-sm text-blue-600 hover:underline"
                  >
                    {t("viewDetails")} →
                  </button>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>

      {/* Link to full map page */}
      <div className="absolute bottom-4 right-4 z-[1000]">
        <button onClick={() => router.push("/kart")} className="btn btn-primary btn-sm shadow-lg">
          {locale === "en" ? "View Full Map" : "Se fullt kart"}
        </button>
      </div>
    </div>
  );
}
