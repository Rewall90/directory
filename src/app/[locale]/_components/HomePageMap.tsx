"use client";

import dynamic from "next/dynamic";
import type { MapCourse } from "@/lib/courses";

const HomePageMapClient = dynamic(
  () => import("./HomePageMapClient").then((mod) => mod.HomePageMapClient),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-[300px] w-full max-w-2xl items-center justify-center rounded-lg bg-base-200 shadow-lg md:h-[400px] lg:h-[500px]">
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
