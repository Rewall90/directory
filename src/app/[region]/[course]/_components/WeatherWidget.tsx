"use client";

import { useEffect, useState } from "react";
import {
  getWeatherEmoji,
  getWindDirection,
  formatTemperature,
  translateWeatherCondition,
} from "@/lib/google-weather";

interface WeatherData {
  temp: number;
  feelsLike: number;
  condition: string;
  conditionOriginal: string;
  emoji: string;
  windSpeed: number;
  windDirection: number;
  humidity: number;
  precipChance: number;
  uvIndex: number;
  updatedAt: string;
}

interface WeatherWidgetProps {
  lat: number;
  lng: number;
}

export function WeatherWidget({ lat, lng }: WeatherWidgetProps) {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    async function fetchWeather() {
      try {
        const response = await fetch(`/api/weather?lat=${lat}&lng=${lng}`);
        if (!response.ok) throw new Error("Failed to fetch");
        const data = await response.json();
        setWeather(data);
      } catch {
        setError(true);
      } finally {
        setLoading(false);
      }
    }

    void fetchWeather();
  }, [lat, lng]);

  if (loading) {
    return (
      <div className="animate-pulse rounded-lg bg-background-surface p-6 shadow-sm">
        <div className="mb-4 h-6 w-24 rounded bg-background-hover" />
        <div className="mb-4 flex items-center gap-4">
          <div className="h-12 w-12 rounded bg-background-hover" />
          <div>
            <div className="mb-2 h-8 w-16 rounded bg-background-hover" />
            <div className="h-4 w-24 rounded bg-background-hover" />
          </div>
        </div>
        <div className="space-y-3 border-t border-border-subtle pt-4">
          <div className="h-4 w-full rounded bg-background-hover" />
          <div className="h-4 w-3/4 rounded bg-background-hover" />
        </div>
      </div>
    );
  }

  if (error || !weather) {
    return null;
  }

  const weatherEmoji = weather.emoji || getWeatherEmoji(weather.conditionOriginal);
  const windDir = weather.windDirection ? getWindDirection(weather.windDirection) : "N";
  const translatedCondition =
    weather.condition || translateWeatherCondition(weather.conditionOriginal);

  // Calculate how old the data is
  const updatedAt = new Date(weather.updatedAt);
  const now = new Date();
  const dataAge = Math.floor((now.getTime() - updatedAt.getTime()) / 1000 / 60);
  const isStale = dataAge > 720;

  const formatUpdateTime = () => {
    if (dataAge < 60) {
      return `${dataAge} minutter siden`;
    } else if (dataAge < 1440) {
      const hours = Math.floor(dataAge / 60);
      return `${hours} time${hours > 1 ? "r" : ""} siden`;
    } else {
      const days = Math.floor(dataAge / 1440);
      return `${days} dag${days > 1 ? "er" : ""} siden`;
    }
  };

  return (
    <div className="rounded-lg bg-background-surface p-6 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-semibold text-text-primary">Vær</h2>
        {isStale && (
          <span className="text-xs text-text-tertiary" title="Værdata kan være utdatert">
            ⚠️ Utdatert
          </span>
        )}
      </div>

      {/* Main Weather Display */}
      <div className="mb-4 flex items-center gap-4">
        <div className="text-5xl" role="img" aria-label={translatedCondition}>
          {weatherEmoji}
        </div>
        <div className="flex-1">
          <div className="text-3xl font-bold text-text-primary">
            {formatTemperature(weather.temp)}
          </div>
          <div className="text-sm text-text-secondary">{translatedCondition}</div>
          {weather.feelsLike && weather.feelsLike !== weather.temp && (
            <div className="text-xs text-text-tertiary">
              Føles som {formatTemperature(weather.feelsLike)}
            </div>
          )}
        </div>
      </div>

      {/* Weather Details Grid */}
      <div className="space-y-3 border-t border-border-subtle pt-4">
        {/* Wind */}
        {weather.windSpeed !== null && weather.windSpeed > 0 && (
          <div className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-2 text-text-secondary">
              <span>💨</span>
              <span>Vind</span>
            </span>
            <span className="font-medium text-text-primary">
              {Math.round(weather.windSpeed)} km/t {windDir}
            </span>
          </div>
        )}

        {/* Humidity */}
        {weather.humidity !== null && (
          <div className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-2 text-text-secondary">
              <span>💧</span>
              <span>Fuktighet</span>
            </span>
            <span className="font-medium text-text-primary">{weather.humidity}%</span>
          </div>
        )}

        {/* Precipitation Chance */}
        {weather.precipChance !== null && weather.precipChance > 0 && (
          <div className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-2 text-text-secondary">
              <span>🌧️</span>
              <span>Nedbør</span>
            </span>
            <span className="font-medium text-text-primary">{weather.precipChance}%</span>
          </div>
        )}

        {/* UV Index */}
        {weather.uvIndex !== null && weather.uvIndex > 0 && (
          <div className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-2 text-text-secondary">
              <span>☀️</span>
              <span>UV-indeks</span>
            </span>
            <span className="font-medium text-text-primary">
              {weather.uvIndex}
              {weather.uvIndex >= 8 && <span className="ml-1 text-xs text-red-500">(Høy)</span>}
              {weather.uvIndex >= 6 && weather.uvIndex < 8 && (
                <span className="ml-1 text-xs text-yellow-600">(Moderat)</span>
              )}
            </span>
          </div>
        )}
      </div>

      {/* Last Updated */}
      <div className="mt-4 border-t border-border-subtle pt-3 text-center text-xs text-text-tertiary">
        Oppdatert {formatUpdateTime()}
      </div>

      {/* Google Attribution */}
      <div className="mt-2 flex items-center justify-center gap-1 text-xs text-text-tertiary">
        <span>Drevet av</span>
        <svg className="h-3 w-3" viewBox="0 0 24 24">
          <path
            fill="#4285F4"
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
          />
          <path
            fill="#34A853"
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          />
          <path
            fill="#FBBC05"
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
          />
          <path
            fill="#EA4335"
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
          />
        </svg>
        <span>Google Weather</span>
      </div>
    </div>
  );
}
