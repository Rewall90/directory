import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { getAllCourses, calculateAverageRating } from "@/lib/courses";
import { calculateDistance, getBoundingBox, type Coordinates } from "@/lib/geolocation";
import type { Course } from "@/types/course";

// Cache courses in memory
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
    const lat = searchParams.get("lat");
    const lng = searchParams.get("lng");
    const limit = parseInt(searchParams.get("limit") || "3", 10);
    const radiusKm = parseInt(searchParams.get("radius") || "50", 10);

    if (!lat || !lng) {
      return NextResponse.json(
        { success: false, error: "Missing required parameters: lat and lng" },
        { status: 400 }
      );
    }

    const userLocation: Coordinates = {
      latitude: parseFloat(lat),
      longitude: parseFloat(lng),
    };

    if (
      isNaN(userLocation.latitude) ||
      isNaN(userLocation.longitude) ||
      userLocation.latitude < -90 ||
      userLocation.latitude > 90 ||
      userLocation.longitude < -180 ||
      userLocation.longitude > 180
    ) {
      return NextResponse.json(
        { success: false, error: "Invalid coordinates" },
        { status: 400 }
      );
    }

    const bbox = getBoundingBox(userLocation, radiusKm);
    const courses = getCoursesCache();

    // Filter courses within bounding box
    const coursesInBounds = courses.filter(
      (c) =>
        c.coordinates &&
        c.coordinates.lat >= bbox.minLat &&
        c.coordinates.lat <= bbox.maxLat &&
        c.coordinates.lng >= bbox.minLng &&
        c.coordinates.lng <= bbox.maxLng
    );

    // Calculate distances and sort
    const coursesWithDistance = coursesInBounds
      .map((course) => {
        const distance = calculateDistance(userLocation, {
          latitude: course.coordinates!.lat,
          longitude: course.coordinates!.lng,
        });

        const ratingData = calculateAverageRating(course.ratings);

        return {
          id: course.slug,
          slug: course.slug,
          name: course.name,
          city: course.city,
          region: course.region,
          holes: course.course.holes,
          par: course.course.par,
          distance,
          rating: ratingData?.averageRating ?? null,
          reviewCount: ratingData?.totalReviews ?? 0,
        };
      })
      .filter((course) => course.distance <= radiusKm)
      .sort((a, b) => a.distance - b.distance)
      .slice(0, limit);

    return NextResponse.json({
      success: true,
      count: coursesWithDistance.length,
      courses: coursesWithDistance,
      userLocation: {
        latitude: userLocation.latitude,
        longitude: userLocation.longitude,
      },
      radiusKm,
    });
  } catch (error) {
    console.error("Error fetching nearby courses:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch nearby courses" },
      { status: 500 }
    );
  }
}
