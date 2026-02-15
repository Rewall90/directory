import Image from "next/image";
import type { Course, PlacePhoto } from "@/types/course";

interface RatingData {
  averageRating: number;
  totalReviews: number;
}

interface CourseHeroProps {
  course: Course;
  ratingData: RatingData | null;
  photos: PlacePhoto[];
}

function StarIcon({ filled }: { filled: boolean }) {
  return (
    <svg viewBox="0 0 24 24" className={`h-4 w-4 ${filled ? "fill-v3d-gold" : "fill-gray-300"}`}>
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
    </svg>
  );
}

export function CourseHero({ course, ratingData, photos }: CourseHeroProps) {
  const heroPhoto = photos[0];
  const accentPhoto = photos[1];

  return (
    <section className="mx-auto grid max-w-[1200px] gap-16 px-8 pb-16 pt-32 md:grid-cols-2 md:items-center">
      {/* Left: Content */}
      <div className="pr-8">
        {/* Eyebrow */}
        {course.course.yearBuilt && (
          <div className="mb-6 flex items-center gap-3 text-sm font-semibold uppercase tracking-widest text-v3d-gold">
            <span className="h-px w-10 bg-v3d-gold" />
            Etablert {course.course.yearBuilt}
          </div>
        )}

        {/* Title */}
        <h1 className="mb-6 font-serif text-4xl font-medium leading-tight text-v3d-text-dark md:text-5xl">
          {course.name}
        </h1>

        {/* Subtitle */}
        {course.description && (
          <p className="mb-8 text-xl font-light text-v3d-text-muted">
            {course.description.split(".")[0]}.
          </p>
        )}

        {/* Rating Box */}
        {ratingData && (
          <div className="flex items-center gap-4 rounded-lg border border-v3d-border bg-v3d-warm p-6">
            <div className="font-serif text-4xl font-semibold text-v3d-forest">
              {ratingData.averageRating.toFixed(1)}
            </div>
            <div className="border-l border-v3d-border pl-4">
              <div className="mb-1 flex gap-0.5">
                {[1, 2, 3, 4, 5].map((star) => (
                  <StarIcon key={star} filled={star <= Math.round(ratingData.averageRating)} />
                ))}
              </div>
              <div className="text-sm text-v3d-text-muted">
                {ratingData.totalReviews.toLocaleString("no-NO")} anmeldelser på Google
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Right: Images */}
      <div className="relative">
        {/* Main Image */}
        <div className="relative flex aspect-[4/3] items-center justify-center overflow-hidden rounded-lg border border-dashed border-v3d-border bg-gradient-to-br from-v3d-forest-soft to-v3d-accent">
          {heroPhoto ? (
            <Image
              src={heroPhoto.url}
              alt={course.name}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 600px"
            />
          ) : (
            <span className="text-sm text-v3d-text-muted">[ Hovedbilde – 800x600 ]</span>
          )}
        </div>

        {/* Accent Image */}
        <div className="absolute -bottom-8 -left-8 hidden aspect-[16/10] w-3/5 items-center justify-center overflow-hidden rounded-lg border border-v3d-border bg-v3d-warm shadow-lg md:flex">
          {accentPhoto ? (
            <Image
              src={accentPhoto.url}
              alt={`${course.name} klubbhus`}
              fill
              className="object-cover"
              sizes="360px"
            />
          ) : (
            <span className="text-xs text-v3d-text-light">[ Sekundærbilde – klubbhus ]</span>
          )}
        </div>
      </div>
    </section>
  );
}
