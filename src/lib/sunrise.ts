/**
 * MET Norway Sunrise API 3.0 utility
 * Fetches sunrise/sunset times for a given location in Norway
 *
 * API Documentation: https://api.met.no/weatherapi/sunrise/3.0/documentation
 * Pricing: FREE (Creative Commons license)
 */

export interface SunriseData {
  sunrise: string | null; // HH:MM or null if polar night/midnight sun
  sunset: string | null; // HH:MM or null if polar night/midnight sun
  daylightMinutes: number | null; // Total daylight in minutes, null for edge cases
  polarNight: boolean;
  midnightSun: boolean;
}

interface SunriseApiResponse {
  properties: {
    body: string;
    sunrise: {
      time: string | null;
      azimuth: number | null;
    };
    sunset: {
      time: string | null;
      azimuth: number | null;
    };
    solarnoon: {
      time: string;
      disc_centre_elevation: number;
      visible: boolean;
    };
    solarmidnight: {
      time: string;
      disc_centre_elevation: number;
      visible: boolean;
    };
  };
}

/**
 * Get today's date in Norway timezone (Europe/Oslo) as YYYY-MM-DD
 */
function getNorwayDate(): string {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Oslo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  return formatter.format(new Date());
}

/**
 * Get Norway's current UTC offset as +HH:MM (e.g. "+01:00" or "+02:00")
 */
function getNorwayOffset(): string {
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: "Europe/Oslo",
    timeZoneName: "shortOffset",
  });
  const parts = formatter.formatToParts(new Date());
  const offsetPart = parts.find((p) => p.type === "timeZoneName");
  // Format is like "GMT+1" or "GMT+2" — convert to "+01:00" / "+02:00"
  const match = offsetPart?.value?.match(/GMT([+-])(\d+)/);
  if (!match) return "+01:00";
  const sign = match[1];
  const hours = match[2].padStart(2, "0");
  return `${sign}${hours}:00`;
}

/**
 * Extract HH:MM from an ISO timestamp like "2026-03-21T06:37+01:00"
 */
function extractTime(isoString: string): string {
  const match = isoString.match(/T(\d{2}:\d{2})/);
  return match ? match[1] : isoString;
}

/**
 * Calculate daylight duration in minutes from two ISO timestamps
 */
function calculateDaylightMinutes(sunriseIso: string, sunsetIso: string): number {
  const sunrise = new Date(sunriseIso);
  const sunset = new Date(sunsetIso);
  return Math.round((sunset.getTime() - sunrise.getTime()) / 60000);
}

/**
 * Get sunrise and sunset times for a location
 * @param latitude Latitude coordinate
 * @param longitude Longitude coordinate
 * @returns Sunrise data or null if request fails
 */
export async function getSunriseSunset(
  latitude: number,
  longitude: number,
): Promise<SunriseData | null> {
  try {
    const lat = Math.round(latitude * 10000) / 10000;
    const lon = Math.round(longitude * 10000) / 10000;
    const date = getNorwayDate();
    const offset = getNorwayOffset();

    const url = `https://api.met.no/weatherapi/sunrise/3.0/sun?lat=${lat}&lon=${lon}&date=${date}&offset=${encodeURIComponent(offset)}`;

    const response = await fetch(url, {
      headers: {
        "User-Agent": "golfkart.no/1.0 https://golfkart.no (contact@golfkart.no)",
      },
      next: { revalidate: 43200 },
    });

    if (!response.ok) {
      console.error(`MET Norway Sunrise API error: ${response.status} ${response.statusText}`);
      return null;
    }

    const data: SunriseApiResponse = await response.json();
    const props = data.properties;

    const sunriseTime = props.sunrise?.time ?? null;
    const sunsetTime = props.sunset?.time ?? null;

    // Midnight sun: sun never sets (solarmidnight is visible)
    const midnightSun = !sunriseTime && !sunsetTime && props.solarmidnight?.visible === true;

    // Polar night: sun never rises (solarnoon is not visible)
    const polarNight = !sunriseTime && !sunsetTime && props.solarnoon?.visible === false;

    let sunrise: string | null = null;
    let sunset: string | null = null;
    let daylightMinutes: number | null = null;

    if (sunriseTime && sunsetTime) {
      sunrise = extractTime(sunriseTime);
      sunset = extractTime(sunsetTime);
      daylightMinutes = calculateDaylightMinutes(sunriseTime, sunsetTime);
    }

    return {
      sunrise,
      sunset,
      daylightMinutes,
      polarNight,
      midnightSun,
    };
  } catch (error) {
    console.error("Error fetching sunrise data from MET Norway:", error);
    return null;
  }
}
