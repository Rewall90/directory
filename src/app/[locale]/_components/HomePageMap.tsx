"use client";

import dynamic from "next/dynamic";
import type { MapCourse } from "@/lib/courses";

const HomePageMapClient = dynamic(
  () => import("./HomePageMapClient").then((mod) => mod.HomePageMapClient),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-[300px] w-full items-center justify-center rounded-xl bg-background-surface shadow-md md:h-[400px] lg:h-[460px]">
        <span className="loading loading-spinner loading-lg"></span>
        <p className="ml-4">Laster kart...</p>
      </div>
    ),
  },
);

interface HomePageMapProps {
  courses: MapCourse[];
  locale: string;
}

export function HomePageMap({ courses, locale }: HomePageMapProps) {
  return <HomePageMapClient courses={courses} locale={locale} />;
}
