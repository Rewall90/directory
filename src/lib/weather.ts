/**
 * MET Norway Weather API utility functions
 * For fetching current weather conditions from MET Norway Locationforecast API
 *
 * API Documentation: https://api.met.no/weatherapi/locationforecast/2.0/documentation
 * Pricing: FREE (Creative Commons license)
 * Update Frequency: Hourly for Nordic region, 4x daily for global forecasts
 */

/**
 * Current weather data structure
 */
export interface CurrentWeather {
  temperature: number; // Celsius
  feelsLike: number; // Celsius
  condition: string; // e.g., "Partly cloudy", "Clear sky"
  icon: string; // MET Norway symbol code
  windSpeed: number; // km/h
  windGust: number; // km/h
  windDirection: number; // Degrees (0-360)
  humidity: number; // Percentage (0-100)
  precipitationAmount: number; // mm expected in next hour
  precipitationProbability: number; // Percentage (0-100)
  thunderProbability: number; // Percentage (0-100)
  uvIndex: number; // UV index (clear sky)
  updatedAt: Date;
}

/**
 * Response from MET Norway Locationforecast API
 */
interface MetNoWeatherResponse {
  type: string;
  geometry: {
    coordinates: number[];
  };
  properties: {
    meta: {
      updated_at: string;
      units: {
        air_temperature: string;
        wind_speed: string;
        relative_humidity: string;
      };
    };
    timeseries: Array<{
      time: string;
      data: {
        instant: {
          details: {
            air_temperature: number;
            relative_humidity: number;
            wind_from_direction?: number;
            wind_speed?: number;
            wind_speed_of_gust?: number;
            cloud_area_fraction?: number;
            dew_point_temperature?: number;
            fog_area_fraction?: number;
            ultraviolet_index_clear_sky?: number;
          };
        };
        next_1_hours?: {
          summary: {
            symbol_code: string;
          };
          details: {
            precipitation_amount?: number;
            probability_of_precipitation?: number;
            probability_of_thunder?: number;
          };
        };
        next_6_hours?: {
          summary: {
            symbol_code: string;
          };
          details: {
            precipitation_amount?: number;
            probability_of_precipitation?: number;
          };
        };
      };
    }>;
  };
}

/**
 * Map MET Norway symbol code to readable condition
 * Full list: https://api.met.no/weatherapi/weathericon/2.0/documentation
 */
function mapSymbolToCondition(symbolCode: string): string {
  const symbol = symbolCode.replace(/_night|_day|_polartwilight/g, "");

  const symbolMap: Record<string, string> = {
    // Clear / Fair
    clearsky: "Clear sky",
    fair: "Fair",
    // Cloudy
    partlycloudy: "Partly cloudy",
    cloudy: "Cloudy",
    // Fog
    fog: "Fog",
    // Rain
    lightrain: "Light rain",
    rain: "Rain",
    heavyrain: "Heavy rain",
    lightrainshowers: "Light rain showers",
    rainshowers: "Rain showers",
    heavyrainshowers: "Heavy rain showers",
    // Sleet
    lightsleet: "Light sleet",
    sleet: "Sleet",
    heavysleet: "Heavy sleet",
    lightsleetshowers: "Light sleet showers",
    sleetshowers: "Sleet showers",
    heavysleetshowers: "Heavy sleet showers",
    // Snow
    lightsnow: "Light snow",
    snow: "Snow",
    heavysnow: "Heavy snow",
    lightsnowshowers: "Light snow showers",
    snowshowers: "Snow showers",
    heavysnowshowers: "Heavy snow showers",
    // Thunder combinations
    lightrainandthunder: "Light rain and thunder",
    rainandthunder: "Rain and thunder",
    heavyrainandthunder: "Heavy rain and thunder",
    lightrainshowersandthunder: "Light rain showers and thunder",
    rainshowersandthunder: "Rain showers and thunder",
    heavyrainshowersandthunder: "Heavy rain showers and thunder",
    lightsleetandthunder: "Light sleet and thunder",
    sleetandthunder: "Sleet and thunder",
    heavysleetandthunder: "Heavy sleet and thunder",
    lightsleetshowersandthunder: "Light sleet showers and thunder",
    sleetshowersandthunder: "Sleet showers and thunder",
    heavysleetshowersandthunder: "Heavy sleet showers and thunder",
    lightsnowandthunder: "Light snow and thunder",
    snowandthunder: "Snow and thunder",
    heavysnowandthunder: "Heavy snow and thunder",
    lightsnowshowersandthunder: "Light snow showers and thunder",
    snowshowersandthunder: "Snow showers and thunder",
    heavysnowshowersandthunder: "Heavy snow showers and thunder",
  };

  return symbolMap[symbol] || symbol;
}

/**
 * Calculate "feels like" temperature
 * Uses wind chill for cold temps, heat index for hot + humid
 */
function calculateFeelsLike(temp: number, windSpeed: number, humidity: number): number {
  const windKmh = windSpeed * 3.6;

  // Wind chill: applies below 10°C with meaningful wind
  if (temp < 10 && windKmh > 4.8) {
    const windChill =
      13.12 +
      0.6215 * temp -
      11.37 * Math.pow(windKmh, 0.16) +
      0.3965 * temp * Math.pow(windKmh, 0.16);
    return Math.round(windChill * 10) / 10;
  }

  // Heat index: applies above 27°C with high humidity
  if (temp >= 27 && humidity >= 40) {
    const c1 = -8.7847;
    const c2 = 1.6114;
    const c3 = 2.3385;
    const c4 = -0.1461;
    const c5 = -0.01231;
    const c6 = -0.01642;
    const c7 = 0.002212;
    const c8 = 0.000725;
    const c9 = -0.000003582;
    const t = temp;
    const r = humidity;
    const heatIndex =
      c1 +
      c2 * t +
      c3 * r +
      c4 * t * r +
      c5 * t * t +
      c6 * r * r +
      c7 * t * t * r +
      c8 * t * r * r +
      c9 * t * t * r * r;
    return Math.round(heatIndex * 10) / 10;
  }

  return temp;
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
  try {
    // Truncate to 4 decimal places as required by MET Norway to improve caching
    const lat = Math.round(latitude * 10000) / 10000;
    const lon = Math.round(longitude * 10000) / 10000;

    const url = `https://api.met.no/weatherapi/locationforecast/2.0/complete?lat=${lat}&lon=${lon}`;

    const response = await fetch(url, {
      headers: {
        "User-Agent": "golfkart.no/1.0 https://golfkart.no (contact@golfkart.no)",
      },
      // Cache for 1 hour (API updates hourly for Nordic region)
      next: { revalidate: 3600 },
    });

    if (!response.ok) {
      console.error(`MET Norway API error: ${response.status} ${response.statusText}`);
      return null;
    }

    const data: MetNoWeatherResponse = await response.json();

    if (!data.properties?.timeseries?.[0]) {
      console.error("Invalid response from MET Norway API");
      return null;
    }

    // Get current conditions (first timeseries entry)
    const current = data.properties.timeseries[0];
    const details = current.data.instant.details;
    const forecast = current.data.next_1_hours || current.data.next_6_hours;

    // Convert wind speed from m/s to km/h
    const windSpeedKmh = (details.wind_speed ?? 0) * 3.6;
    const windGustKmh = (details.wind_speed_of_gust ?? 0) * 3.6;

    // Calculate feels like temperature
    const feelsLike = calculateFeelsLike(
      details.air_temperature,
      details.wind_speed ?? 0,
      details.relative_humidity,
    );

    // Get weather condition from symbol code
    const symbolCode = forecast?.summary?.symbol_code || "fair";
    const condition = mapSymbolToCondition(symbolCode);

    // Get expected precipitation amount in mm
    const precipAmount = forecast?.details?.precipitation_amount ?? 0;

    // Get precipitation and thunder probability from next_1_hours (preferred) or next_6_hours
    const next1h = current.data.next_1_hours;
    const precipProbability = next1h?.details?.probability_of_precipitation ?? 0;
    const thunderProbability = next1h?.details?.probability_of_thunder ?? 0;

    return {
      temperature: Math.round(details.air_temperature * 10) / 10,
      feelsLike: Math.round(feelsLike * 10) / 10,
      condition,
      icon: symbolCode,
      windSpeed: Math.round(windSpeedKmh * 10) / 10,
      windGust: Math.round(windGustKmh * 10) / 10,
      windDirection: details.wind_from_direction ?? 0,
      humidity: Math.round(details.relative_humidity),
      precipitationAmount: Math.round(precipAmount * 10) / 10,
      precipitationProbability: Math.round(precipProbability),
      thunderProbability: Math.round(thunderProbability * 10) / 10,
      uvIndex: details.ultraviolet_index_clear_sky ?? 0,
      updatedAt: new Date(data.properties.meta.updated_at),
    };
  } catch (error) {
    console.error("Error fetching weather data from MET Norway:", error);
    return null;
  }
}

/**
 * Get a weather emoji based on MET Norway symbol code or condition description
 * @param condition Weather condition description or symbol code
 * @returns Emoji representing the weather
 */
export function getWeatherEmoji(condition: string): string {
  const conditionLower = condition.toLowerCase();

  // Remove time-of-day suffixes from MET Norway symbol codes
  const symbol = conditionLower.replace(/_night|_day|_polartwilight/g, "");

  // Thunder always takes precedence
  if (symbol.includes("thunder")) {
    return "⛈️";
  }

  // Snow
  if (symbol.includes("snow")) {
    if (symbol.includes("heavy")) return "❄️";
    return "🌨️";
  }

  // Sleet
  if (symbol.includes("sleet")) {
    return "🌨️";
  }

  // Rain
  if (symbol.includes("rain")) {
    if (symbol.includes("heavy")) return "🌧️";
    if (symbol.includes("light") || symbol.includes("shower")) return "🌦️";
    return "🌧️";
  }

  // Fog
  if (symbol.includes("fog")) {
    return "🌫️";
  }

  // Cloudy conditions (check before clear/sunny)
  if (symbol.includes("partlycloudy") || symbol.includes("fair")) {
    return "⛅";
  }

  if (symbol.includes("cloudy")) {
    return "☁️";
  }

  // Clear/Sunny
  if (symbol.includes("clearsky") || symbol.includes("clear") || symbol.includes("sunny")) {
    return "☀️";
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
 * Covers all conditions produced by mapSymbolToCondition
 * @param condition Weather condition in English
 * @returns Weather condition in Norwegian
 */
export function translateWeatherCondition(condition: string): string {
  const conditionLower = condition.toLowerCase();

  const translations: Record<string, string> = {
    // Clear / Fair
    "clear sky": "Klarvær",
    fair: "Lettskyet",
    // Cloudy
    "partly cloudy": "Delvis skyet",
    cloudy: "Skyet",
    // Fog
    fog: "Tåke",
    // Rain
    "light rain": "Lett regn",
    rain: "Regn",
    "heavy rain": "Kraftig regn",
    "light rain showers": "Lette regnbyger",
    "rain showers": "Regnbyger",
    "heavy rain showers": "Kraftige regnbyger",
    // Sleet
    "light sleet": "Lett sludd",
    sleet: "Sludd",
    "heavy sleet": "Kraftig sludd",
    "light sleet showers": "Lette sluddbyger",
    "sleet showers": "Sluddbyger",
    "heavy sleet showers": "Kraftige sluddbyger",
    // Snow
    "light snow": "Lett snø",
    snow: "Snø",
    "heavy snow": "Kraftig snøfall",
    "light snow showers": "Lette snøbyger",
    "snow showers": "Snøbyger",
    "heavy snow showers": "Kraftige snøbyger",
    // Thunder combinations
    "light rain and thunder": "Lett regn og torden",
    "rain and thunder": "Regn og torden",
    "heavy rain and thunder": "Kraftig regn og torden",
    "light rain showers and thunder": "Lette regnbyger og torden",
    "rain showers and thunder": "Regnbyger og torden",
    "heavy rain showers and thunder": "Kraftige regnbyger og torden",
    "light sleet and thunder": "Lett sludd og torden",
    "sleet and thunder": "Sludd og torden",
    "heavy sleet and thunder": "Kraftig sludd og torden",
    "light sleet showers and thunder": "Lette sluddbyger og torden",
    "sleet showers and thunder": "Sluddbyger og torden",
    "heavy sleet showers and thunder": "Kraftige sluddbyger og torden",
    "light snow and thunder": "Lett snø og torden",
    "snow and thunder": "Snø og torden",
    "heavy snow and thunder": "Kraftig snø og torden",
    "light snow showers and thunder": "Lette snøbyger og torden",
    "snow showers and thunder": "Snøbyger og torden",
    "heavy snow showers and thunder": "Kraftige snøbyger og torden",
  };

  // Check for exact match
  if (translations[conditionLower]) {
    return translations[conditionLower];
  }

  // Return original if no translation found
  return condition;
}
