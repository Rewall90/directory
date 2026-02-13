import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { getAllCourses } from "@/lib/courses";
import type { Course } from "@/types/course";

// Cache courses in memory for fast search
let coursesCache: Course[] | null = null;

function getCoursesCache(): Course[] {
  if (!coursesCache) {
    coursesCache = getAllCourses();
  }
  return coursesCache;
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get("q")?.toLowerCase();

    const courses = getCoursesCache();

    if (!query) {
      // Return latest 10 courses if no query
      return NextResponse.json(
        courses.slice(0, 10).map((c) => ({
          id: c.slug,
          slug: c.slug,
          name: c.name,
          city: c.city,
          region: c.region,
          municipality: c.municipality,
          holes: c.course.holes,
          par: c.course.par,
          lengthMeters: c.course.lengthMeters,
        })),
      );
    }

    // Search by name, city, region, municipality, or former name
    const results = courses
      .filter(
        (course) =>
          course.name.toLowerCase().includes(query) ||
          course.city.toLowerCase().includes(query) ||
          course.region.toLowerCase().includes(query) ||
          course.municipality?.toLowerCase().includes(query) ||
          course.formerName?.toLowerCase().includes(query),
      )
      .slice(0, 15)
      .map((c) => ({
        id: c.slug,
        slug: c.slug,
        name: c.name,
        city: c.city,
        region: c.region,
        municipality: c.municipality,
        holes: c.course.holes,
        par: c.course.par,
        lengthMeters: c.course.lengthMeters,
      }));

    return NextResponse.json(results);
  } catch (error) {
    console.error("Error searching courses:", error);
    return NextResponse.json({ error: "Failed to search courses" }, { status: 500 });
  }
}
