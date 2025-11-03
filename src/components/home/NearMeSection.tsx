"use client";

import { useState } from "react";
import Link from "next/link";
import { toRegionSlug } from "@/lib/constants/norway-regions";
import { StarRating } from "../courses/StarRating";
import { formatDistance } from "@/lib/geolocation";

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

export function NearMeSection() {
  const [viewState, setViewState] = useState<ViewState>("initial");
  const [courses, setCourses] = useState<NearbyCourse[]>([]);
  const [errorMessage, setErrorMessage] = useState<string>("");

  const handleGetLocation = async () => {
    // Check if geolocation is supported
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

          // Store in sessionStorage for potential reuse (privacy-friendly)
          sessionStorage.setItem(
            "userLocation",
            JSON.stringify({ latitude, longitude })
          );

          // Fetch nearby courses from API
          const response = await fetch(
            `/api/courses/nearby?lat=${latitude}&lng=${longitude}&limit=3`
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
          setErrorMessage(
            "Du må gi tillatelse til stedstjenester for å se golfbaner i nærheten."
          );
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
        maximumAge: 300000, // Cache position for 5 minutes
      }
    );
  };

  return (
    <section className="bg-background-surface py-16">
      <div className="container mx-auto max-w-[1170px] px-4">
        {/* Initial State - Call to Action */}
        {viewState === "initial" && (
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="mb-6 text-3xl font-bold text-text-primary md:text-4xl">
              Finn golfbaner i nærheten
            </h2>
            <p className="mb-8 text-lg text-text-secondary">
              Del din plassering for å se de 3 nærmeste golfbanene
            </p>
            <button
              onClick={handleGetLocation}
              className="inline-flex items-center gap-3 rounded-lg bg-primary px-8 py-4 text-lg font-semibold text-primary-content shadow-card transition hover:bg-primary-light"
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
              Finn min posisjon
            </button>
          </div>
        )}

        {/* Loading State */}
        {viewState === "loading" && (
          <div className="mx-auto max-w-2xl text-center">
            <div className="mb-6 flex justify-center">
              <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
            </div>
            <p className="text-lg text-text-secondary">
              Finner golfbaner i nærheten...
            </p>
          </div>
        )}

        {/* Error State */}
        {(viewState === "error" || viewState === "denied") && (
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="mb-6 text-3xl font-bold text-text-primary md:text-4xl">
              Finn golfbaner i nærheten
            </h2>
            <div className="mb-8 rounded-lg border border-error/20 bg-error-light p-5 text-error">
              <p className="mb-2 text-lg font-semibold">
                {viewState === "denied"
                  ? "Tillatelse nektet"
                  : "Kunne ikke hente posisjon"}
              </p>
              <p className="text-base">{errorMessage}</p>
            </div>
            <button
              onClick={handleGetLocation}
              className="inline-flex items-center gap-2 rounded-lg border-2 border-primary bg-transparent px-8 py-4 text-lg font-semibold text-primary transition hover:bg-primary-lighter"
            >
              Prøv på nytt
            </button>
          </div>
        )}

        {/* Success State - Show Courses */}
        {viewState === "success" && courses.length > 0 && (
          <div>
            <div className="mb-10 text-center">
              <h2 className="mb-3 text-3xl font-bold text-text-primary md:text-4xl">
                Golfbaner i nærheten
              </h2>
              <p className="text-lg text-text-secondary">
                De 3 nærmeste golfbanene basert på din posisjon
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              {courses.map((course) => {
                const courseUrl = `/${toRegionSlug(course.region)}/${course.slug}`;

                return (
                  <Link
                    key={course.id}
                    href={courseUrl}
                    className="group block rounded-lg border border-border-default bg-background p-5 shadow-sm transition hover:shadow-md"
                  >
                    {/* Distance Badge */}
                    <div className="mb-3 flex items-center justify-between">
                      <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                          className="h-4 w-4"
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
                    <h3 className="mb-2 text-lg font-semibold text-text-primary group-hover:text-primary">
                      {course.name}
                    </h3>

                    {/* City */}
                    <p className="mb-3 text-text-secondary">
                      {course.city}
                    </p>

                    {/* Rating */}
                    {course.rating && (
                      <div className="mb-3 flex items-center gap-1.5 text-sm">
                        <StarRating rating={course.rating} size={14} />
                        <span className="font-medium text-text-primary">
                          {course.rating.toFixed(1)}
                        </span>
                        {course.reviewCount > 0 && (
                          <span className="text-text-tertiary">
                            ({course.reviewCount})
                          </span>
                        )}
                      </div>
                    )}

                    {/* Course Details */}
                    <div className="flex items-center gap-2 text-sm text-text-secondary">
                      <span>{course.holes} hull</span>
                      {course.par && (
                        <>
                          <span className="text-text-tertiary">•</span>
                          <span>Par {course.par}</span>
                        </>
                      )}
                    </div>

                    {/* Arrow indicator */}
                    <div className="mt-4 flex items-center gap-1 text-sm font-medium text-primary group-hover:gap-2 transition-all">
                      Se bane
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        className="h-4 w-4"
                      >
                        <path
                          fillRule="evenodd"
                          d="M3 10a.75.75 0 01.75-.75h10.638L10.23 5.29a.75.75 0 111.04-1.08l5.5 5.25a.75.75 0 010 1.08l-5.5 5.25a.75.75 0 11-1.04-1.08l4.158-3.96H3.75A.75.75 0 013 10z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                  </Link>
                );
              })}
            </div>

            {/* Reset button */}
            <div className="mt-8 text-center">
              <button
                onClick={() => {
                  setViewState("initial");
                  setCourses([]);
                  sessionStorage.removeItem("userLocation");
                }}
                className="text-base font-medium text-text-secondary hover:text-text-primary transition"
              >
                Søk på nytt
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
