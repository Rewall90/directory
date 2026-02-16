import { NextResponse } from "next/server";
import { getRateLimitStatus } from "@/lib/rate-limiter";

/**
 * GET /api/rate-limit
 * Returns current rate limit status for monitoring
 *
 * Protected by a simple secret key to prevent public access
 */
export async function GET(request: Request) {
  // Simple auth check - require secret key
  const { searchParams } = new URL(request.url);
  const secret = searchParams.get("secret");

  if (secret !== process.env.RATE_LIMIT_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const status = getRateLimitStatus();

  return NextResponse.json({
    status: "ok",
    rateLimits: {
      hourly: {
        used: status.hourly.used,
        limit: status.hourly.limit,
        remaining: status.hourly.limit - status.hourly.used,
        resetsInMinutes: Math.round(status.hourly.resetsIn / 60000),
      },
      daily: {
        used: status.daily.used,
        limit: status.daily.limit,
        remaining: status.daily.limit - status.daily.used,
        resetsInHours: Math.round(status.daily.resetsIn / 3600000),
      },
      monthly: {
        used: status.monthly.used,
        limit: status.monthly.limit,
        remaining: status.monthly.limit - status.monthly.used,
        resetsInDays: Math.round(status.monthly.resetsIn / 86400000),
      },
    },
    estimatedCost: {
      hourlyUSD: ((status.hourly.used * 7) / 1000).toFixed(2),
      dailyUSD: ((status.daily.used * 7) / 1000).toFixed(2),
      monthlyUSD: ((status.monthly.used * 7) / 1000).toFixed(2),
      monthlyBudgetRemaining: (200 - (status.monthly.used * 7) / 1000).toFixed(2),
    },
  });
}
