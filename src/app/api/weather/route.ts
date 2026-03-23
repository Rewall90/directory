import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { getCurrentWeather, translateWeatherCondition, getWeatherEmoji } from "@/lib/weather";
import { getSunriseSunset } from "@/lib/sunrise";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const lat = searchParams.get("lat");
    const lng = searchParams.get("lng");

    if (!lat || !lng) {
      return NextResponse.json(
        { error: "Missing required parameters: lat and lng" },
        { status: 400 },
      );
    }

    const latitude = parseFloat(lat);
    const longitude = parseFloat(lng);

    if (
      !Number.isFinite(latitude) ||
      !Number.isFinite(longitude) ||
      latitude < -90 ||
      latitude > 90 ||
      longitude < -180 ||
      longitude > 180
    ) {
      return NextResponse.json({ error: "Invalid coordinates" }, { status: 400 });
    }

    const [weather, sunrise] = await Promise.all([
      getCurrentWeather(latitude, longitude),
      getSunriseSunset(latitude, longitude),
    ]);

    if (!weather) {
      return NextResponse.json({ error: "Failed to fetch weather data" }, { status: 503 });
    }

    // Return weather with Norwegian translation + sunrise data
    return NextResponse.json(
      {
        temp: weather.temperature,
        feelsLike: weather.feelsLike,
        condition: translateWeatherCondition(weather.condition),
        conditionOriginal: weather.condition,
        icon: weather.icon,
        emoji: getWeatherEmoji(weather.icon),
        windSpeed: weather.windSpeed,
        windGust: weather.windGust,
        windDirection: weather.windDirection,
        humidity: weather.humidity,
        precipAmount: weather.precipitationAmount,
        precipProbability: weather.precipitationProbability,
        thunderProbability: weather.thunderProbability,
        uvIndex: weather.uvIndex,
        updatedAt: weather.updatedAt.toISOString(),
        sunrise: sunrise?.sunrise ?? null,
        sunset: sunrise?.sunset ?? null,
        daylightMinutes: sunrise?.daylightMinutes ?? null,
        polarNight: sunrise?.polarNight ?? false,
        midnightSun: sunrise?.midnightSun ?? false,
      },
      {
        headers: {
          "Cache-Control": "public, max-age=1800, s-maxage=3600",
        },
      },
    );
  } catch (error) {
    console.error("Error fetching weather:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
