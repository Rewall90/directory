/**
 * Google Places API (New) utility functions
 * For fetching place photos from Google Places API
 *
 * API Documentation: https://developers.google.com/maps/documentation/places/web-service/place-photos
 * Pricing: Place Photos $7 per 1,000 requests (first 1,000 free, $200/month credit)
 */

import type { PlacePhoto } from "@/types/course";

// Helper function to get API key (reads from env at runtime)
function getApiKey(): string | undefined {
  return process.env.GOOGLE_PLACES_API_KEY;
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
 * Search for a place by name and coordinates to get its Place ID
 * Used by migration script to populate googlePlaceId in JSON files
 *
 * @param name Golf club name (e.g., "Oslo Golfklubb")
 * @param lat Latitude
 * @param lng Longitude
 * @returns Place ID or null if not found
 */
export async function findPlaceId(name: string, lat: number, lng: number): Promise<string | null> {
  const apiKey = getApiKey();

  if (!apiKey) {
    console.error("GOOGLE_PLACES_API_KEY is not set");
    return null;
  }

  try {
    // Use Text Search (New) with location bias
    const url = "https://places.googleapis.com/v1/places:searchText";

    const response = await fetch(url, {
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

    const data = await response.json();

    if (data.places && data.places.length > 0) {
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
 * @param maxPhotos Maximum number of photos to fetch (default 4)
 * @returns Array of PlacePhoto objects with temporary URLs
 */
export async function getPlacePhotos(
  placeId: string,
  maxPhotos: number = 4,
): Promise<PlacePhoto[]> {
  const apiKey = getApiKey();

  if (!apiKey) {
    console.error("GOOGLE_PLACES_API_KEY is not set");
    return [];
  }

  try {
    // Step 1: Get photo references from Place Details
    const detailsUrl = `https://places.googleapis.com/v1/places/${placeId}`;

    const detailsResponse = await fetch(detailsUrl, {
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

    const detailsData: PlacesApiResponse = await detailsResponse.json();

    if (!detailsData.photos || detailsData.photos.length === 0) {
      return [];
    }

    // Step 2: Get photo URLs (limited to maxPhotos)
    const photos: PlacePhoto[] = [];
    const photosToFetch = detailsData.photos.slice(0, maxPhotos);

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

    return photos;
  } catch (error) {
    console.error("Error fetching place photos:", error);
    return [];
  }
}
