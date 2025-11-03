import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  calculateDistance,
  getBoundingBox,
  type Coordinates,
} from "@/lib/geolocation";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const lat = searchParams.get("lat");
    const lng = searchParams.get("lng");
    const limit = parseInt(searchParams.get("limit") || "3", 10);
    const radiusKm = parseInt(searchParams.get("radius") || "50", 10);

    // Validate required parameters
    if (!lat || !lng) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required parameters: lat and lng",
        },
        { status: 400 }
      );
    }

    const userLocation: Coordinates = {
      latitude: parseFloat(lat),
      longitude: parseFloat(lng),
    };

    // Validate coordinates
    if (
      isNaN(userLocation.latitude) ||
      isNaN(userLocation.longitude) ||
      userLocation.latitude < -90 ||
      userLocation.latitude > 90 ||
      userLocation.longitude < -180 ||
      userLocation.longitude > 180
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid coordinates",
        },
        { status: 400 }
      );
    }

    // Calculate bounding box for efficient pre-filtering
    const bbox = getBoundingBox(userLocation, radiusKm);

    // Query database with bounding box filter
    // This significantly reduces the number of courses we need to calculate distance for
    const coursesInBounds = await prisma.course.findMany({
      where: {
        AND: [
          { latitude: { not: null } },
          { longitude: { not: null } },
          { latitude: { gte: bbox.minLat, lte: bbox.maxLat } },
          { longitude: { gte: bbox.minLng, lte: bbox.maxLng } },
        ],
      },
      select: {
        id: true,
        slug: true,
        name: true,
        city: true,
        region: true,
        holes: true,
        par: true,
        latitude: true,
        longitude: true,
        ratings: {
          select: {
            source: true,
            rating: true,
            reviewCount: true,
            maxRating: true,
          },
        },
      },
    });

    // Calculate exact distances and sort
    const coursesWithDistance = coursesInBounds
      .map((course) => {
        const distance = calculateDistance(userLocation, {
          latitude: course.latitude!,
          longitude: course.longitude!,
        });

        // Calculate average rating
        let avgRating = null;
        let totalReviews = 0;
        if (course.ratings.length > 0) {
          const validRatings = course.ratings.filter((r) => r.rating !== null);
          if (validRatings.length > 0) {
            // Normalize ratings to 5-point scale and calculate average
            const normalizedSum = validRatings.reduce((sum, r) => {
              const normalized = (r.rating! / (r.maxRating || 5)) * 5;
              return sum + normalized;
            }, 0);
            avgRating = Math.round((normalizedSum / validRatings.length) * 10) / 10;
            totalReviews = course.ratings.reduce(
              (sum, r) => sum + (r.reviewCount || 0),
              0
            );
          }
        }

        return {
          id: course.id,
          slug: course.slug,
          name: course.name,
          city: course.city,
          region: course.region,
          holes: course.holes,
          par: course.par,
          distance,
          rating: avgRating,
          reviewCount: totalReviews,
        };
      })
      .filter((course) => course.distance <= radiusKm) // Filter by radius
      .sort((a, b) => a.distance - b.distance) // Sort by distance
      .slice(0, limit); // Take only the requested number

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
      {
        success: false,
        error: "Failed to fetch nearby courses",
      },
      { status: 500 }
    );
  }
}
