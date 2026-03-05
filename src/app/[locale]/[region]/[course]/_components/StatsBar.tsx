import { useTranslations } from "next-intl";
import type { Course } from "@/types/course";
import { getLocalizedCourseField } from "@/lib/i18n-courses";

interface StatsBarProps {
  course: Course;
  locale: "nb" | "en";
}

const formatter = new Intl.NumberFormat("no-NO");

export function StatsBar({ course, locale }: StatsBarProps) {
  const t = useTranslations("statsBar");
  const localizedTerrain = getLocalizedCourseField(course, "terrain", locale);
  const localizedCourseType = getLocalizedCourseField(course, "courseType", locale);
  const stats = [
    { value: course.course.holes, label: t("holes") },
    { value: course.course.par, label: t("par") },
    {
      value: course.course.lengthMeters
        ? `${formatter.format(course.course.lengthMeters)} m`
        : null,
      label: t("length"),
    },
    { value: course.course.yearBuilt, label: t("yearBuilt") },
    { value: localizedTerrain || localizedCourseType, label: t("courseType") },
    {
      value:
        course.season.start && course.season.end
          ? `${course.season.start}–${course.season.end}`
          : null,
      label: t("season"),
    },
  ].filter((stat) => stat.value != null);

  if (stats.length === 0) return null;

  return (
    <div className="mt-16 bg-v3d-forest py-8 text-white">
      <div className="mx-auto flex max-w-[1200px] flex-wrap justify-between gap-6 px-8">
        {stats.map((stat, index) => (
          <div
            key={stat.label}
            className="text-center"
            style={{ animationDelay: `${index * 0.05}s` }}
          >
            <div className="mb-1 font-serif text-3xl font-semibold">{stat.value}</div>
            <div className="text-xs uppercase tracking-widest opacity-80">{stat.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
