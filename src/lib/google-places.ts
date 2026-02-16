/**
 * Google Places API (New) utility functions
 * For fetching place photos from Google Places API
 *
 * API Documentation: https://developers.google.com/maps/documentation/places/web-service/place-photos
 * Pricing: Place Photos $7 per 1,000 requests (first 1,000 free, $200/month credit)
 */

import type { PlacePhoto } from "@/types/course";
import { canFetchPhotos, recordPhotoFetch } from "./rate-limiter";

// Timeout for API requests (15 seconds)
const FETCH_TIMEOUT_MS = 15000;

// Helper function to get API key (reads from env at runtime)
function getApiKey(): string | undefined {
  return process.env.GOOGLE_PLACES_API_KEY;
}

/**
 * Fetch with timeout using AbortController
 */
async function fetchWithTimeout(
  url: string,
  options: RequestInit,
  timeoutMs: number = FETCH_TIMEOUT_MS,
): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    return response;
  } finally {
    clearTimeout(timeoutId);
  }
}

/**
 * Safely parse JSON response, returns null on parse error
 */
async function safeParseJson<T>(response: Response): Promise<T | null> {
  try {
    return (await response.json()) as T;
  } catch {
    console.error("Failed to parse JSON response");
    return null;
  }
}

/**
 * Response structure from Google Places API (New) Place Details
 */
interface PlacesApiPhoto {
  name: string; // Format: "places/{place_id}/photos/{photo_reference}"
  widthPx: number;
  heightPx: number;
  authorAttributions: Array<{
    displayName: string;
    uri: string;
    photoUri: string;
  }>;
}

interface PlacesApiResponse {
  photos?: PlacesApiPhoto[];
}

/**
 * Response structure from Google Places API Text Search
 */
interface TextSearchApiResponse {
  places?: Array<{
    id: string;
    displayName?: {
      text: string;
      languageCode: string;
    };
  }>;
}

/**
 * Search for a place by name and coordinates to get its Place ID
 * Used by migration script to populate googlePlaceId in JSON files
 *
 * @param name Golf club name (e.g., "Oslo Golfklubb")
 * @param lat Latitude (-90 to 90)
 * @param lng Longitude (-180 to 180)
 * @returns Place ID or null if not found
 */
export async function findPlaceId(name: string, lat: number, lng: number): Promise<string | null> {
  // Input validation
  if (!name?.trim()) {
    console.error("findPlaceId: name is required");
    return null;
  }
  if (!Number.isFinite(lat) || lat < -90 || lat > 90) {
    console.error("findPlaceId: lat must be between -90 and 90");
    return null;
  }
  if (!Number.isFinite(lng) || lng < -180 || lng > 180) {
    console.error("findPlaceId: lng must be between -180 and 180");
    return null;
  }

  const apiKey = getApiKey();

  if (!apiKey) {
    console.error("GOOGLE_PLACES_API_KEY is not set");
    return null;
  }

  try {
    // Use Text Search (New) with location bias
    const url = "https://places.googleapis.com/v1/places:searchText";

    const response = await fetchWithTimeout(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": apiKey,
        "X-Goog-FieldMask": "places.id,places.displayName",
      },
      body: JSON.stringify({
        textQuery: `${name} golf`,
        locationBias: {
          circle: {
            center: { latitude: lat, longitude: lng },
            radius: 5000, // 5km radius
          },
        },
        maxResultCount: 1,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Places API search error: ${response.status}`, errorText);
      return null;
    }

    const data = await safeParseJson<TextSearchApiResponse>(response);
    if (!data) {
      return null;
    }

    if (data.places && data.places.length > 0 && data.places[0]?.id) {
      return data.places[0].id;
    }

    return null;
  } catch (error) {
    console.error("Error searching for place:", error);
    return null;
  }
}

/**
 * Fetch photos for a place using Google Places API (New)
 *
 * @param placeId Google Place ID
 * @param maxPhotos Maximum number of photos to fetch (default 4, max 10)
 * @returns Array of PlacePhoto objects with temporary URLs
 */
export async function getPlacePhotos(
  placeId: string,
  maxPhotos: number = 4,
): Promise<PlacePhoto[]> {
  // Input validation
  if (!placeId?.trim()) {
    console.error("getPlacePhotos: placeId is required");
    return [];
  }
  if (!Number.isFinite(maxPhotos) || maxPhotos < 1) {
    console.error("getPlacePhotos: maxPhotos must be at least 1");
    return [];
  }
  // Cap maxPhotos to avoid excessive API costs
  const cappedMaxPhotos = Math.min(maxPhotos, 10);

  const apiKey = getApiKey();

  if (!apiKey) {
    console.error("GOOGLE_PLACES_API_KEY is not set");
    return [];
  }

  // Rate limit check to prevent cost exploitation
  if (!canFetchPhotos()) {
    console.warn("getPlacePhotos: Rate limit exceeded, skipping photo fetch");
    return [];
  }

  try {
    // Step 1: Get photo references from Place Details
    const detailsUrl = `https://places.googleapis.com/v1/places/${placeId}`;

    const detailsResponse = await fetchWithTimeout(detailsUrl, {
      method: "GET",
      headers: {
        "X-Goog-Api-Key": apiKey,
        "X-Goog-FieldMask": "photos",
      },
    });

    if (!detailsResponse.ok) {
      const errorText = await detailsResponse.text();
      console.error(`Places API details error: ${detailsResponse.status}`, errorText);
      return [];
    }

    const detailsData = await safeParseJson<PlacesApiResponse>(detailsResponse);
    if (!detailsData) {
      return [];
    }

    if (!detailsData.photos || detailsData.photos.length === 0) {
      return [];
    }

    // Step 2: Get photo URLs (limited to cappedMaxPhotos)
    const photos: PlacePhoto[] = [];
    const photosToFetch = detailsData.photos.slice(0, cappedMaxPhotos);

    for (const photo of photosToFetch) {
      // Build photo URL with desired dimensions
      // Using 800px width for hero, smaller for gallery
      const photoUrl = `https://places.googleapis.com/v1/${photo.name}/media?key=${apiKey}&maxWidthPx=1200&maxHeightPx=800`;

      // Build attribution HTML from author attributions
      const attributionHtml =
        photo.authorAttributions
          ?.map(
            (attr) =>
              `<a href="${attr.uri}" target="_blank" rel="noopener">${attr.displayName}</a>`,
          )
          .join(", ") || "Google";

      photos.push({
        url: photoUrl,
        attributionHtml,
        width: photo.widthPx,
        height: photo.heightPx,
      });
    }

    // Record successful fetch for rate limiting
    recordPhotoFetch(photos.length);

    return photos;
  } catch (error) {
    console.error("Error fetching place photos:", error);
    return [];
  }
}
