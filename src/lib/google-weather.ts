/**
 * Google Weather API utility functions
 * For fetching current weather conditions from Google Maps Weather API
 *
 * API Documentation: https://developers.google.com/maps/documentation/weather
 * Pricing: $0.15 per 1,000 requests (10,000 free per month)
 */

// Helper function to get API key (reads from env at runtime)
function getApiKey(): string | undefined {
  return process.env.GOOGLE_WEATHER_API_KEY;
}

/**
 * Weather condition codes from Google Weather API
 */
export interface WeatherCondition {
  code: string;
  description: string;
}

/**
 * Current weather data structure
 */
export interface CurrentWeather {
  temperature: number; // Celsius
  feelsLike: number; // Celsius
  condition: string; // e.g., "Partly cloudy", "Sunny", "Rainy"
  icon: string; // Weather icon code
  windSpeed: number; // km/h
  windDirection: number; // Degrees (0-360)
  humidity: number; // Percentage (0-100)
  precipitationChance: number; // Percentage (0-100)
  uvIndex: number; // 0-11+
  visibility: number; // kilometers
  updatedAt: Date;
}

/**
 * Response from Google Weather API
 */
interface GoogleWeatherResponse {
  temperature?: {
    degrees?: number;
    unit?: string;
  };
  feelsLikeTemperature?: {
    degrees?: number;
    unit?: string;
  };
  weatherCondition?: {
    description?: {
      text?: string;
    };
    type?: string;
    iconBaseUri?: string;
  };
  wind?: {
    speed?: {
      value?: number;
      unit?: string;
    };
    direction?: {
      degrees?: number;
      cardinal?: string;
    };
  };
  relativeHumidity?: number;
  precipitation?: {
    probability?: {
      percent?: number;
    };
  };
  uvIndex?: number;
  visibility?: {
    distance?: number;
    unit?: string;
  };
}

/**
 * Get current weather conditions for a location
 * @param latitude Latitude coordinate
 * @param longitude Longitude coordinate
 * @returns Current weather data or null if request fails
 */
export async function getCurrentWeather(
  latitude: number,
  longitude: number,
): Promise<CurrentWeather | null> {
  const apiKey = getApiKey();

  if (!apiKey) {
    console.error("GOOGLE_WEATHER_API_KEY is not set");
    return null;
  }

  try {
    // Use GET with query parameters as per Google Weather API documentation
    const url = `https://weather.googleapis.com/v1/currentConditions:lookup?key=${apiKey}&location.latitude=${latitude}&location.longitude=${longitude}`;

    const response = await fetch(url, {
      method: "GET",
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Weather API error: ${response.status} ${response.statusText}`);
      console.error(`Response:`, errorText);
      return null;
    }

    const data: GoogleWeatherResponse = await response.json();

    // Extract and normalize weather data
    return {
      temperature: data.temperature?.degrees ?? 0,
      feelsLike: data.feelsLikeTemperature?.degrees ?? 0,
      condition: data.weatherCondition?.description?.text ?? "Unknown",
      icon: data.weatherCondition?.type ?? "unknown",
      windSpeed: data.wind?.speed?.value ?? 0,
      windDirection: data.wind?.direction?.degrees ?? 0,
      humidity: data.relativeHumidity ?? 0,
      precipitationChance: data.precipitation?.probability?.percent ?? 0,
      uvIndex: data.uvIndex ?? 0,
      visibility: data.visibility?.distance ?? 0,
      updatedAt: new Date(),
    };
  } catch (error) {
    console.error("Error fetching weather data:", error);
    return null;
  }
}

/**
 * Get a weather emoji based on condition code or description
 * @param condition Weather condition description or code (e.g., "Partly sunny" or "PARTLY_CLOUDY")
 * @returns Emoji representing the weather
 */
export function getWeatherEmoji(condition: string): string {
  const conditionLower = condition.toLowerCase();

  // Check for specific Google Weather API codes
  // Check for "partly" and "mostly" BEFORE checking for "sunny" alone
  if (
    conditionLower.includes("partly") ||
    conditionLower.includes("partial") ||
    conditionLower.includes("mostly")
  ) {
    return "⛅";
  }
  if (conditionLower.includes("clear") || conditionLower.includes("sunny")) {
    return "☀️";
  }
  if (conditionLower.includes("cloud") || conditionLower.includes("overcast")) {
    return "☁️";
  }
  if (conditionLower.includes("rain") || conditionLower.includes("drizzle")) {
    return "🌧️";
  }
  if (conditionLower.includes("storm") || conditionLower.includes("thunder")) {
    return "⛈️";
  }
  if (conditionLower.includes("snow") || conditionLower.includes("flurr")) {
    return "❄️";
  }
  if (conditionLower.includes("fog") || conditionLower.includes("mist")) {
    return "🌫️";
  }
  if (conditionLower.includes("wind")) {
    return "💨";
  }

  return "🌤️"; // Default
}

/**
 * Get wind direction as cardinal direction
 * @param degrees Wind direction in degrees (0-360)
 * @returns Cardinal direction (N, NE, E, SE, S, SW, W, NW)
 */
export function getWindDirection(degrees: number): string {
  const directions = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
  const index = Math.round(degrees / 45) % 8;
  return directions[index];
}

/**
 * Format temperature for display
 * @param celsius Temperature in Celsius
 * @returns Formatted temperature string
 */
export function formatTemperature(celsius: number): string {
  return `${Math.round(celsius)}°C`;
}

/**
 * Translate weather condition from English to Norwegian
 * @param condition Weather condition in English
 * @returns Weather condition in Norwegian
 */
export function translateWeatherCondition(condition: string): string {
  const conditionLower = condition.toLowerCase();

  // Direct translations
  const translations: Record<string, string> = {
    clear: "Klart",
    sunny: "Solrikt",
    "mostly sunny": "Delvis solrikt",
    "partly sunny": "Delvis solrikt",
    "partly cloudy": "Delvis skyet",
    "mostly cloudy": "Overskyet",
    cloudy: "Skyet",
    overcast: "Overskyet",
    rain: "Regn",
    "light rain": "Lett regn",
    "heavy rain": "Kraftig regn",
    drizzle: "Duskregn",
    showers: "Regnbyger",
    thunderstorm: "Tordenvær",
    snow: "Snø",
    "light snow": "Lett snø",
    "heavy snow": "Kraftig snø",
    sleet: "Sludd",
    fog: "Tåke",
    mist: "Dis",
    haze: "Dunst",
    windy: "Vindfull",
  };

  // Check for exact match first
  if (translations[conditionLower]) {
    return translations[conditionLower];
  }

  // Check for partial matches
  for (const [english, norwegian] of Object.entries(translations)) {
    if (conditionLower.includes(english)) {
      return norwegian;
    }
  }

  // Return original if no translation found
  return condition;
}
