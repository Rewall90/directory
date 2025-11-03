/**
 * Cron job to update weather data for all golf courses
 * Runs twice daily (6 AM and 6 PM) via Vercel Cron
 *
 * Endpoint: POST /api/cron/update-weather
 * Schedule: 0 6,18 * * * (6 AM and 6 PM daily)
 *
 * Cost: ~10,000 API calls/month = FREE (within Google's free tier)
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentWeather } from "@/lib/google-weather";

export async function GET(request: NextRequest) {
  try {
    // Verify the request is coming from Vercel Cron
    // In production, Vercel adds a special header to cron requests
    const authHeader = request.headers.get("authorization");
    if (
      process.env.NODE_ENV === "production" &&
      authHeader !== `Bearer ${process.env.CRON_SECRET}`
    ) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    console.log("🌤️  Starting weather update cron job...");
    const startTime = Date.now();

    // Fetch all courses with coordinates
    const courses = await prisma.course.findMany({
      where: {
        AND: [{ latitude: { not: null } }, { longitude: { not: null } }],
      },
      select: {
        id: true,
        name: true,
        latitude: true,
        longitude: true,
      },
    });

    console.log(`📍 Found ${courses.length} courses with coordinates`);

    let successCount = 0;
    let errorCount = 0;
    const errors: string[] = [];

    // Update weather for each course
    // Note: We could batch these with Promise.all, but sequential is safer
    // to avoid rate limiting and makes debugging easier
    for (const course of courses) {
      try {
        const weather = await getCurrentWeather(
          course.latitude!,
          course.longitude!
        );

        if (weather) {
          await prisma.course.update({
            where: { id: course.id },
            data: {
              weatherTemp: weather.temperature,
              weatherFeelsLike: weather.feelsLike,
              weatherCondition: weather.condition,
              weatherIcon: weather.icon,
              weatherWindSpeed: weather.windSpeed,
              weatherWindDirection: weather.windDirection,
              weatherHumidity: weather.humidity,
              weatherPrecipChance: weather.precipitationChance,
              weatherUvIndex: weather.uvIndex,
              weatherVisibility: weather.visibility,
              weatherUpdatedAt: weather.updatedAt,
            },
          });

          successCount++;
          console.log(
            `✅ Updated weather for ${course.name}: ${weather.temperature}°C, ${weather.condition}`
          );
        } else {
          errorCount++;
          errors.push(`Failed to fetch weather for ${course.name}`);
          console.error(`❌ Failed to fetch weather for ${course.name}`);
        }

        // Small delay to avoid rate limiting (optional, but safe)
        await new Promise((resolve) => setTimeout(resolve, 50));
      } catch (error) {
        errorCount++;
        const errorMsg = `Error updating ${course.name}: ${error}`;
        errors.push(errorMsg);
        console.error(`❌ ${errorMsg}`);
      }
    }

    const duration = Date.now() - startTime;
    const summary = {
      success: true,
      totalCourses: courses.length,
      successCount,
      errorCount,
      duration: `${(duration / 1000).toFixed(2)}s`,
      timestamp: new Date().toISOString(),
    };

    console.log("🎉 Weather update completed!");
    console.log(`   Success: ${successCount}/${courses.length}`);
    console.log(`   Errors: ${errorCount}`);
    console.log(`   Duration: ${(duration / 1000).toFixed(2)}s`);

    if (errors.length > 0) {
      console.log("⚠️  Errors encountered:");
      errors.slice(0, 10).forEach((err) => console.log(`   - ${err}`));
      if (errors.length > 10) {
        console.log(`   ... and ${errors.length - 10} more`);
      }
    }

    return NextResponse.json({
      ...summary,
      errors: errors.slice(0, 10), // Only return first 10 errors
    });
  } catch (error) {
    console.error("❌ Fatal error in weather cron job:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
        message: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

// Support POST as well (Vercel Cron can use both)
export async function POST(request: NextRequest) {
  return GET(request);
}
