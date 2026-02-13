import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import {
  getCurrentWeather,
  translateWeatherCondition,
  getWeatherEmoji,
} from "@/lib/google-weather";

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

    if (isNaN(latitude) || isNaN(longitude)) {
      return NextResponse.json({ error: "Invalid coordinates" }, { status: 400 });
    }

    const weather = await getCurrentWeather(latitude, longitude);

    if (!weather) {
      return NextResponse.json({ error: "Failed to fetch weather data" }, { status: 503 });
    }

    // Return weather with Norwegian translation
    return NextResponse.json({
      temp: weather.temperature,
      feelsLike: weather.feelsLike,
      condition: translateWeatherCondition(weather.condition),
      conditionOriginal: weather.condition,
      icon: weather.icon,
      emoji: getWeatherEmoji(weather.condition),
      windSpeed: weather.windSpeed,
      windDirection: weather.windDirection,
      humidity: weather.humidity,
      precipChance: weather.precipitationChance,
      uvIndex: weather.uvIndex,
      visibility: weather.visibility,
      updatedAt: weather.updatedAt.toISOString(),
    });
  } catch (error) {
    console.error("Error fetching weather:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
