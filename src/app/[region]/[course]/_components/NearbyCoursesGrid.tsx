import Link from "next/link";
import type { Course } from "@/types/course";
import { toRegionSlug } from "@/lib/constants/norway-regions";
import { calculateAverageRating } from "@/lib/courses";

interface NearbyCoursesGridProps {
  courses: Array<{
    course: Course;
    distanceKm: number | null;
  }>;
}

export function NearbyCoursesGrid({ courses }: NearbyCoursesGridProps) {
  if (courses.length === 0) return null;

  return (
    <section className="mx-auto max-w-[1200px] px-8 py-20">
      {/* Section Header */}
      <div className="mb-8 flex items-baseline gap-4">
        <span className="font-serif text-6xl font-normal text-v3d-accent">05</span>
        <h2 className="font-serif text-2xl font-medium text-v3d-text-dark">Nærliggende baner</h2>
      </div>

      {/* Course Cards */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {courses.map(({ course, distanceKm }) => {
          const ratingData = calculateAverageRating(course.ratings);

          return (
            <Link
              key={course.slug}
              href={`/${toRegionSlug(course.region)}/${course.slug}`}
              className="group overflow-hidden rounded-xl border border-v3d-border bg-v3d-warm transition-all hover:-translate-y-1 hover:shadow-lg"
            >
              {/* Image Placeholder */}
              <div className="flex h-[120px] items-center justify-center bg-v3d-accent text-xs text-v3d-text-light">
                [ Bilde ]
              </div>

              {/* Content */}
              <div className="p-5">
                <h3 className="mb-1 font-serif text-lg font-medium text-v3d-text-dark group-hover:text-v3d-forest">
                  {course.name}
                </h3>
                <div className="flex gap-3 text-sm text-v3d-text-muted">
                  <span>{course.course.holes} hull</span>
                  {ratingData && <span>⭐ {ratingData.averageRating.toFixed(1)}</span>}
                  {distanceKm && (
                    <span className="font-semibold text-v3d-forest">
                      {distanceKm.toFixed(1)} km
                    </span>
                  )}
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
