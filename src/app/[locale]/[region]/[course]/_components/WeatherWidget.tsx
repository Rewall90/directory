"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { getWindDirection, formatTemperature, translateWeatherCondition } from "@/lib/weather";

interface WeatherData {
  temp: number;
  feelsLike: number;
  condition: string;
  conditionOriginal: string;
  icon: string;
  windSpeed: number;
  windGust: number;
  windDirection: number;
  humidity: number;
  precipAmount: number;
  precipProbability: number;
  thunderProbability: number;
  uvIndex: number;
  updatedAt: string;
  sunrise: string | null;
  sunset: string | null;
  daylightMinutes: number | null;
  polarNight: boolean;
  midnightSun: boolean;
}

/** Official MET Norway weather icon URL from their GitHub repo */
function getWeatherIconUrl(symbolCode: string): string {
  return `https://raw.githubusercontent.com/metno/weathericons/main/weather/svg/${symbolCode}.svg`;
}

interface WeatherWidgetProps {
  lat: number;
  lng: number;
}

const STALE_THRESHOLD_MINUTES = 720; // 12 hours

export function WeatherWidget({ lat, lng }: WeatherWidgetProps) {
  const t = useTranslations("weather");
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const controller = new AbortController();

    async function fetchWeather() {
      try {
        const response = await fetch(`/api/weather?lat=${lat}&lng=${lng}`, {
          signal: controller.signal,
        });
        if (!response.ok) throw new Error("Failed to fetch");
        const data = await response.json();
        setWeather(data);
      } catch (e) {
        if (e instanceof DOMException && e.name === "AbortError") return;
        setError(true);
      } finally {
        setLoading(false);
      }
    }

    void fetchWeather();
    return () => controller.abort();
  }, [lat, lng]);

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="mb-3 h-5 w-16 rounded bg-white/20" />
        <div className="mb-3 flex items-center gap-3">
          <div className="h-10 w-10 rounded bg-white/20" />
          <div>
            <div className="mb-1 h-8 w-14 rounded bg-white/20" />
            <div className="h-3 w-20 rounded bg-white/20" />
          </div>
        </div>
        <div className="space-y-2 border-t border-white/20 pt-3">
          <div className="h-3 w-full rounded bg-white/20" />
          <div className="h-3 w-3/4 rounded bg-white/20" />
        </div>
      </div>
    );
  }

  if (error || !weather) {
    return null;
  }

  const windDir = weather.windDirection != null ? getWindDirection(weather.windDirection) : "N";
  const translatedCondition =
    weather.condition || translateWeatherCondition(weather.conditionOriginal);

  // Calculate how old the data is (guard against negative from clock skew)
  const updatedAt = new Date(weather.updatedAt);
  const now = new Date();
  const dataAge = Math.max(0, Math.floor((now.getTime() - updatedAt.getTime()) / 1000 / 60));
  const isStale = dataAge > STALE_THRESHOLD_MINUTES;

  const formatUpdateTime = () => {
    if (dataAge < 60) {
      return t("minutesAgo", { count: dataAge });
    } else if (dataAge < 1440) {
      const hours = Math.floor(dataAge / 60);
      return hours === 1 ? t("hourAgo", { count: hours }) : t("hoursAgo", { count: hours });
    } else {
      const days = Math.floor(dataAge / 1440);
      return days === 1 ? t("dayAgo", { count: days }) : t("daysAgo", { count: days });
    }
  };

  return (
    <div>
      {isStale && (
        <div className="mb-3 text-right">
          <span className="text-xs text-white/60">{t("outdated")}</span>
        </div>
      )}

      {/* Main Weather Display */}
      <div className="mb-3 flex items-center gap-3">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={getWeatherIconUrl(weather.icon)}
          alt={translatedCondition}
          width={48}
          height={48}
          className="h-12 w-12 drop-shadow-md"
        />
        <div className="flex-1">
          <div className="font-serif text-3xl font-bold text-white">
            {formatTemperature(weather.temp)}
          </div>
          <div className="text-sm text-white/80">{translatedCondition}</div>
          {weather.feelsLike !== weather.temp && (
            <div className="text-xs text-white/60">
              {t("feelsLike", { temp: formatTemperature(weather.feelsLike) })}
            </div>
          )}
        </div>
      </div>

      {/* Weather Details Grid */}
      <div className="space-y-2 border-t border-white/20 pt-3">
        {/* Wind */}
        {weather.windSpeed != null && weather.windSpeed > 0 && (
          <div className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-2 text-white/70">
              <span>💨</span>
              <span>{t("wind")}</span>
            </span>
            <span className="font-medium text-white">
              {Math.round(weather.windSpeed)} {t("windUnit")} {windDir}
              {weather.windGust > 0 && weather.windGust > weather.windSpeed && (
                <span className="text-white/60">
                  {" "}
                  ({t("gusts")} {Math.round(weather.windGust)})
                </span>
              )}
            </span>
          </div>
        )}

        {/* Humidity */}
        {weather.humidity != null && (
          <div className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-2 text-white/70">
              <span>💧</span>
              <span>{t("humidity")}</span>
            </span>
            <span className="font-medium text-white">{weather.humidity}%</span>
          </div>
        )}

        {/* Precipitation */}
        {(weather.precipAmount > 0 || weather.precipProbability > 0) && (
          <div className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-2 text-white/70">
              <span>🌧️</span>
              <span>{t("precipitation")}</span>
            </span>
            <span className="font-medium text-white">
              {weather.precipAmount > 0
                ? `${weather.precipAmount} mm`
                : `${weather.precipProbability}%`}
              {weather.precipAmount > 0 && weather.precipProbability > 0 && (
                <span className="text-white/60"> ({weather.precipProbability}%)</span>
              )}
            </span>
          </div>
        )}

        {/* UV Index */}
        {weather.uvIndex > 0 && (
          <div className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-2 text-white/70">
              <span>☀️</span>
              <span>{t("uvIndex")}</span>
            </span>
            <span className="font-medium text-white">
              {Math.round(weather.uvIndex * 10) / 10}
              {weather.uvIndex >= 6 && <span className="ml-1 text-yellow-200">{t("uvHigh")}</span>}
              {weather.uvIndex >= 3 && weather.uvIndex < 6 && (
                <span className="ml-1 text-white/60">{t("uvModerate")}</span>
              )}
            </span>
          </div>
        )}

        {/* Thunder Warning */}
        {weather.thunderProbability >= 1 && (
          <div className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-2 text-yellow-200">
              <span>⚡</span>
              <span>{t("thunder")}</span>
            </span>
            <span className="font-medium text-yellow-200">{weather.thunderProbability}%</span>
          </div>
        )}
      </div>

      {/* Sunrise / Sunset */}
      {(weather.sunrise || weather.polarNight || weather.midnightSun) && (
        <div className="space-y-2 border-t border-white/20 pt-3">
          {weather.sunrise && (
            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-2 text-white/70">
                <span>🌅</span>
                <span>{t("sunrise")}</span>
              </span>
              <span className="font-medium text-white">{weather.sunrise}</span>
            </div>
          )}

          {weather.sunset && (
            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-2 text-white/70">
                <span>🌇</span>
                <span>{t("sunset")}</span>
              </span>
              <span className="font-medium text-white">{weather.sunset}</span>
            </div>
          )}

          {weather.daylightMinutes != null && (
            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-2 text-white/70">
                <span>☀️</span>
                <span>{t("daylight")}</span>
              </span>
              <span className="font-medium text-white">
                {t("daylightFormat", {
                  hours: Math.floor(weather.daylightMinutes / 60),
                  minutes: weather.daylightMinutes % 60,
                })}
              </span>
            </div>
          )}

          {weather.polarNight && (
            <div className="flex items-center justify-center text-sm">
              <span className="rounded-full bg-blue-500/20 px-3 py-1 text-blue-200">
                🌑 {t("polarNight")}
              </span>
            </div>
          )}

          {weather.midnightSun && (
            <div className="flex items-center justify-center text-sm">
              <span className="rounded-full bg-yellow-500/20 px-3 py-1 text-yellow-200">
                ☀️ {t("midnightSun")}
              </span>
            </div>
          )}
        </div>
      )}

      {/* Last Updated */}
      <div className="mt-3 border-t border-white/20 pt-2 text-center text-xs text-white/50">
        {t("updated", { time: formatUpdateTime() })}
      </div>

      {/* MET Norway Attribution */}
      <div className="mt-1 flex items-center justify-center gap-1 text-xs text-white/70">
        <span>{t("poweredBy")}</span>
        <a
          href="https://www.met.no/en"
          target="_blank"
          rel="noopener noreferrer"
          className="underline decoration-white/40 underline-offset-2 transition-colors hover:text-white"
        >
          MET Norway
        </a>
      </div>
    </div>
  );
}
