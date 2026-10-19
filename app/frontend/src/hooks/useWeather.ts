import { useEffect, useState } from "react";

export interface WeatherNow {
  temperature: number;
  windSpeed: number;
  precipitation: number;
  weatherCode: number;
}

export interface WeatherDay {
  date: string;
  max: number;
  min: number;
  precipProbability: number;
  weatherCode: number;
}

interface WeatherData {
  current: WeatherNow;
  daily: WeatherDay[];
}

interface UseWeatherResult {
  data: WeatherData | null;
  loading: boolean;
  error: string | null;
}

export function weatherLabel(code: number): string {
  if (code === 0) return "Clear sky";
  if (code <= 2) return "Partly cloudy";
  if (code === 3) return "Overcast";
  if (code === 45 || code === 48) return "Fog";
  if (code >= 51 && code <= 57) return "Drizzle";
  if (code >= 61 && code <= 67) return "Rain";
  if (code >= 71 && code <= 77) return "Snow";
  if (code >= 80 && code <= 82) return "Rain showers";
  if (code >= 95) return "Thunderstorm";
  return "Mist";
}

export function useWeather(lat: number, lon: number): UseWeatherResult {
  const [data, setData] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError(null);

    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,precipitation,wind_speed_10m,weather_code&daily=temperature_2m_max,temperature_2m_min,precipitation_probability_max,weather_code&timezone=auto`;

    fetch(url, { signal: controller.signal })
      .then((res) => {
        if (!res.ok) throw new Error("Weather service unavailable");
        return res.json();
      })
      .then((json) => {
        setData({
          current: {
            temperature: json.current.temperature_2m,
            windSpeed: json.current.wind_speed_10m,
            precipitation: json.current.precipitation,
            weatherCode: json.current.weather_code,
          },
          daily: json.daily.time.map((date: string, i: number) => ({
            date,
            max: json.daily.temperature_2m_max[i],
            min: json.daily.temperature_2m_min[i],
            precipProbability: json.daily.precipitation_probability_max[i],
            weatherCode: json.daily.weather_code[i],
          })),
        });
      })
      .catch((err) => {
        if (err.name !== "AbortError") setError("Couldn't reach the weather service. Try again shortly.");
      })
      .finally(() => setLoading(false));

    return () => controller.abort();
  }, [lat, lon]);

  return { data, loading, error };
}
