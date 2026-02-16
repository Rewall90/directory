/**
 * Simple in-memory rate limiter for API cost protection
 * Limits photo API calls to prevent cost exploitation
 *
 * Note: This is per-instance. For multi-instance deployments,
 * use Redis or Vercel KV for shared state.
 */

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

// Global counters (reset hourly/daily/monthly)
const hourlyPhotoRequests: RateLimitEntry = {
  count: 0,
  resetTime: Date.now() + 60 * 60 * 1000,
};

const dailyPhotoRequests: RateLimitEntry = {
  count: 0,
  resetTime: Date.now() + 24 * 60 * 60 * 1000,
};

const monthlyPhotoRequests: RateLimitEntry = {
  count: 0,
  resetTime: Date.now() + 30 * 24 * 60 * 60 * 1000, // ~30 days
};

// Configurable limits - matches Google Cloud quotas to stay in free tier
// Free tier (since March 2025): Enterprise SKU = 1,000/month
const LIMITS = {
  // Max photo fetches per hour (spreads out daily limit)
  HOURLY_PHOTO_REQUESTS: 10,
  // Max photo fetches per day (matches Google Cloud quota of 30/day)
  DAILY_PHOTO_REQUESTS: 30,
  // Max photo fetches per month - stays within 1,000 free tier
  // Enterprise SKU free tier = 1,000 photos/month
  // Setting to 900 for safety margin
  MONTHLY_PHOTO_REQUESTS: 900,
};

/**
 * Check if we can make more photo API requests
 * Returns true if under limit, false if rate limited
 */
export function canFetchPhotos(): boolean {
  const now = Date.now();

  // Reset hourly counter if needed
  if (now > hourlyPhotoRequests.resetTime) {
    hourlyPhotoRequests.count = 0;
    hourlyPhotoRequests.resetTime = now + 60 * 60 * 1000;
  }

  // Reset daily counter if needed
  if (now > dailyPhotoRequests.resetTime) {
    dailyPhotoRequests.count = 0;
    dailyPhotoRequests.resetTime = now + 24 * 60 * 60 * 1000;
  }

  // Reset monthly counter if needed
  if (now > monthlyPhotoRequests.resetTime) {
    monthlyPhotoRequests.count = 0;
    monthlyPhotoRequests.resetTime = now + 30 * 24 * 60 * 60 * 1000;
  }

  // Check limits
  if (hourlyPhotoRequests.count >= LIMITS.HOURLY_PHOTO_REQUESTS) {
    console.warn(
      `[Rate Limit] Hourly photo limit reached: ${hourlyPhotoRequests.count}/${LIMITS.HOURLY_PHOTO_REQUESTS}`,
    );
    return false;
  }

  if (dailyPhotoRequests.count >= LIMITS.DAILY_PHOTO_REQUESTS) {
    console.warn(
      `[Rate Limit] Daily photo limit reached: ${dailyPhotoRequests.count}/${LIMITS.DAILY_PHOTO_REQUESTS}`,
    );
    return false;
  }

  if (monthlyPhotoRequests.count >= LIMITS.MONTHLY_PHOTO_REQUESTS) {
    console.warn(
      `[Rate Limit] Monthly photo limit reached: ${monthlyPhotoRequests.count}/${LIMITS.MONTHLY_PHOTO_REQUESTS}`,
    );
    return false;
  }

  return true;
}

/**
 * Record that photos were fetched (call after successful fetch)
 * @param photoCount Number of photos fetched
 */
export function recordPhotoFetch(photoCount: number): void {
  hourlyPhotoRequests.count += photoCount;
  dailyPhotoRequests.count += photoCount;
  monthlyPhotoRequests.count += photoCount;
}

/**
 * Get current rate limit status (for monitoring)
 */
export function getRateLimitStatus(): {
  hourly: { used: number; limit: number; resetsIn: number };
  daily: { used: number; limit: number; resetsIn: number };
  monthly: { used: number; limit: number; resetsIn: number };
} {
  const now = Date.now();
  return {
    hourly: {
      used: hourlyPhotoRequests.count,
      limit: LIMITS.HOURLY_PHOTO_REQUESTS,
      resetsIn: Math.max(0, hourlyPhotoRequests.resetTime - now),
    },
    daily: {
      used: dailyPhotoRequests.count,
      limit: LIMITS.DAILY_PHOTO_REQUESTS,
      resetsIn: Math.max(0, dailyPhotoRequests.resetTime - now),
    },
    monthly: {
      used: monthlyPhotoRequests.count,
      limit: LIMITS.MONTHLY_PHOTO_REQUESTS,
      resetsIn: Math.max(0, monthlyPhotoRequests.resetTime - now),
    },
  };
}
