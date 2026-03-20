import Image from "next/image";
import Link from "next/link";
import { useTranslations } from "next-intl";
import type { PopularCourse } from "@/lib/courses";

interface PopularCoursesProps {
  courses: PopularCourse[];
}

export function PopularCourses({ courses }: PopularCoursesProps) {
  const t = useTranslations("popularCourses");

  return (
    <section className="bg-background py-12">
      <div className="container mx-auto max-w-[1170px] px-4">
        <h2 className="mb-6 text-2xl font-semibold text-text-primary">{t("label")}</h2>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {courses.map((course) => (
            <Link
              key={course.slug}
              href={`/${course.regionSlug}/${course.slug}`}
              className="group block"
            >
              <div className="relative aspect-[4/3] overflow-hidden rounded-xl">
                <Image
                  src={course.imageSrc}
                  alt={course.imageAlt}
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                />
              </div>
              <div className="px-0.5 pt-2.5">
                <h3 className="text-base font-bold text-text-primary">{course.name}</h3>
                <div className="mt-0.5 flex items-center gap-1 text-[13px] text-text-secondary">
                  <span className="text-amber-500">&#9733;</span>
                  <span>{course.rating.toFixed(1)}</span>
                  <span className="text-text-tertiary">
                    ({course.reviewCount} {t("reviews")})
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
