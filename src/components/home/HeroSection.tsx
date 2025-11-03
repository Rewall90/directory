"use client";

import { useState } from "react";
import Link from "next/link";
import { CourseSearch } from "../search/CourseSearch";
import { GolferDotsSVG } from "./GolferDotsSVG";
import { toRegionSlug } from "@/lib/constants/norway-regions";
import { StarRating } from "../courses/StarRating";
import { formatDistance } from "@/lib/geolocation";

interface HeroSectionProps {
  title?: string;
  description?: string[];
  courseCount: number;
}

interface NearbyCourse {
  id: string;
  slug: string;
  name: string;
  city: string;
  region: string;
  holes: number;
  par: number | null;
  distance: number;
  rating: number | null;
  reviewCount: number;
}

type ViewState = "initial" | "loading" | "success" | "error" | "denied";

export function HeroSection({
  title = "Golfbaner i Norge",
  description = [
    "Golf Directory tilbyr en komplett oversikt over golfbaner i Norge, med detaljert informasjon og vurderinger.",
  ],
  courseCount,
}: HeroSectionProps) {
  const [viewState, setViewState] = useState<ViewState>("initial");
  const [courses, setCourses] = useState<NearbyCourse[]>([]);
  const [errorMessage, setErrorMessage] = useState<string>("");

  const handleGetLocation = async () => {
    if (!navigator.geolocation) {
      setViewState("error");
      setErrorMessage("Nettleseren din støtter ikke geolokasjon.");
      return;
    }

    setViewState("loading");

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;

          sessionStorage.setItem("userLocation", JSON.stringify({ latitude, longitude }));

          const response = await fetch(
            `/api/courses/nearby?lat=${latitude}&lng=${longitude}&limit=3`,
          );

          if (!response.ok) {
            throw new Error("Kunne ikke hente golfbaner i nærheten");
          }

          const data = await response.json();

          if (data.success && data.courses.length > 0) {
            setCourses(data.courses);
            setViewState("success");
          } else {
            setViewState("error");
            setErrorMessage("Ingen golfbaner funnet i nærheten (innen 50 km)");
          }
        } catch (error) {
          console.error("Error fetching nearby courses:", error);
          setViewState("error");
          setErrorMessage("En feil oppstod ved henting av golfbaner");
        }
      },
      (error) => {
        console.error("Geolocation error:", error);
        if (error.code === error.PERMISSION_DENIED) {
          setViewState("denied");
          setErrorMessage("Du må gi tillatelse til stedstjenester for å se golfbaner i nærheten.");
        } else if (error.code === error.POSITION_UNAVAILABLE) {
          setViewState("error");
          setErrorMessage("Kunne ikke bestemme din posisjon.");
        } else if (error.code === error.TIMEOUT) {
          setViewState("error");
          setErrorMessage("Tidsavbrudd ved henting av posisjon.");
        } else {
          setViewState("error");
          setErrorMessage("En feil oppstod ved henting av posisjon.");
        }
      },
      {
        enableHighAccuracy: false,
        timeout: 10000,
        maximumAge: 300000,
      },
    );
  };

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-green-900 to-green-950 pb-24 pt-24 md:pb-56 md:pt-56 lg:pb-72 lg:pt-72">
      {/* Golfer Background - Centered on Mobile, Right on Desktop */}
      <div
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 md:left-auto md:right-0 md:translate-x-0"
        aria-hidden="true"
      >
        <GolferDotsSVG
          className="pointer-events-none h-[600px] w-[600px] transform-gpu opacity-40 sm:h-[650px] sm:w-[650px] sm:opacity-50 md:h-[600px] md:w-[600px] md:opacity-60 lg:h-[700px] lg:w-[700px] xl:h-[900px] xl:w-[900px]"
          style={{ color: "hsl(72, 80%, 80%)" }}
        />
      </div>

      <div className="container relative z-10 mx-auto max-w-[1170px] px-4">
        {/* Hero Content - Left Aligned */}
        <div className="mb-16 max-w-2xl">
          {/* Main Heading */}
          <h1
            className="mb-8 text-4xl font-bold drop-shadow-lg md:text-5xl lg:text-6xl xl:text-7xl"
            style={{ color: "hsl(132, 50%, 90%)" }}
          >
            Finn <span style={{ color: "hsl(192, 80%, 80%)" }}>Din</span> Golfbane
          </h1>

          {/* Description */}
          <div className="mb-8 space-y-4">
            {description.map((paragraph, index) => (
              <p
                key={index}
                className="text-lg font-extralight leading-relaxed md:text-xl"
                style={{ color: "hsl(132, 50%, 90%)" }}
              >
                {paragraph}
              </p>
            ))}
          </div>

          {/* Search */}
          <div className="mb-10">
            <CourseSearch />
          </div>

          {/* Location Button - Initial State */}
          {viewState === "initial" && (
            <div className="text-center">
              <button
                onClick={handleGetLocation}
                className="inline-flex items-center gap-3 px-8 py-4 text-lg shadow-lg transition"
                style={{
                  backgroundColor: "transparent",
                  color: "hsl(192, 80%, 80%)",
                  border: "solid 2px hsl(192, 80%, 80%)",
                  borderRadius: "4px",
                  fontFamily: "Manrope, sans-serif",
                  fontWeight: 600,
                  lineHeight: "16px",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "hsl(192, 80%, 20%)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "transparent";
                }}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  className="h-6 w-6"
                >
                  <path
                    fillRule="evenodd"
                    d="M9.69 18.933l.003.001C9.89 19.02 10 19 10 19s.11.02.308-.066l.002-.001.006-.003.018-.008a5.741 5.741 0 00.281-.14c.186-.096.446-.24.757-.433.62-.384 1.445-.966 2.274-1.765C15.302 14.988 17 12.493 17 9A7 7 0 103 9c0 3.492 1.698 5.988 3.355 7.584a13.731 13.731 0 002.273 1.765 11.842 11.842 0 00.976.544l.062.029.018.008.006.003zM10 11.25a2.25 2.25 0 100-4.5 2.25 2.25 0 000 4.5z"
                    clipRule="evenodd"
                  />
                </svg>
                Se baner nær meg
              </button>
            </div>
          )}

          {/* Loading State */}
          {viewState === "loading" && (
            <div className="text-center">
              <div className="mb-3 flex justify-center">
                <div className="h-10 w-10 animate-spin rounded-full border-4 border-white/30 border-t-white"></div>
              </div>
              <p className="text-base text-green-50">Finner golfbaner i nærheten...</p>
            </div>
          )}

          {/* Error State */}
          {(viewState === "error" || viewState === "denied") && (
            <div className="text-center">
              <div className="mb-4 rounded-lg border border-red-300/30 bg-red-900/20 p-4 text-red-100 backdrop-blur-sm">
                <p className="mb-1 text-base font-semibold">
                  {viewState === "denied" ? "Tillatelse nektet" : "Kunne ikke hente posisjon"}
                </p>
                <p className="text-sm">{errorMessage}</p>
              </div>
              <button
                onClick={handleGetLocation}
                className="inline-flex items-center gap-2 rounded-lg border-2 border-white/30 bg-transparent px-6 py-3 text-base font-semibold text-white transition hover:bg-white/10"
              >
                Prøv på nytt
              </button>
            </div>
          )}

          {/* Success State - Show Courses */}
          {viewState === "success" && courses.length > 0 && (
            <div>
              <div className="mb-4 text-center">
                <p className="text-lg font-semibold text-green-50">Golfbaner i nærheten</p>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                {courses.map((course) => {
                  const courseUrl = `/${toRegionSlug(course.region)}/${course.slug}`;

                  return (
                    <Link
                      key={course.id}
                      href={courseUrl}
                      className="group block rounded-lg border border-white/20 bg-white/10 p-6 shadow-lg backdrop-blur-sm transition hover:bg-white/20"
                    >
                      {/* Distance Badge */}
                      <div className="mb-2 flex items-center justify-between">
                        <span className="inline-flex items-center gap-1 rounded-full bg-yellow-400/20 px-2 py-1 text-xs font-medium text-yellow-300">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                            className="h-3 w-3"
                          >
                            <path
                              fillRule="evenodd"
                              d="M9.69 18.933l.003.001C9.89 19.02 10 19 10 19s.11.02.308-.066l.002-.001.006-.003.018-.008a5.741 5.741 0 00.281-.14c.186-.096.446-.24.757-.433.62-.384 1.445-.966 2.274-1.765C15.302 14.988 17 12.493 17 9A7 7 0 103 9c0 3.492 1.698 5.988 3.355 7.584a13.731 13.731 0 002.273 1.765 11.842 11.842 0 00.976.544l.062.029.018.008.006.003zM10 11.25a2.25 2.25 0 100-4.5 2.25 2.25 0 000 4.5z"
                              clipRule="evenodd"
                            />
                          </svg>
                          {formatDistance(course.distance)}
                        </span>
                      </div>

                      {/* Course Name */}
                      <h3 className="mb-1 text-base font-semibold text-white transition group-hover:text-yellow-400 md:text-lg">
                        {course.name}
                      </h3>

                      {/* City */}
                      <p className="mb-2 text-sm text-green-100 md:text-base">{course.city}</p>

                      {/* Rating */}
                      {course.rating && (
                        <div className="mb-2 flex items-center gap-1 text-xs md:text-sm">
                          <StarRating rating={course.rating} size={12} />
                          <span className="font-medium text-white">{course.rating.toFixed(1)}</span>
                          {course.reviewCount > 0 && (
                            <span className="text-green-200">({course.reviewCount})</span>
                          )}
                        </div>
                      )}

                      {/* Course Details */}
                      <div className="flex items-center gap-2 text-xs text-green-100 md:text-sm">
                        <span>{course.holes} hull</span>
                        {course.par && (
                          <>
                            <span className="text-green-300">•</span>
                            <span>Par {course.par}</span>
                          </>
                        )}
                      </div>
                    </Link>
                  );
                })}
              </div>

              {/* Reset button */}
              <div className="mt-4 text-center">
                <button
                  onClick={() => {
                    setViewState("initial");
                    setCourses([]);
                    sessionStorage.removeItem("userLocation");
                  }}
                  className="text-sm font-medium text-green-100 transition hover:text-white"
                >
                  Søk på nytt
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
