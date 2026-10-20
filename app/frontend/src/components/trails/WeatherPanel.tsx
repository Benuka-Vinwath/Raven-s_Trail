import { Wind, Droplets, CloudSun } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useWeather, weatherLabel } from "../../hooks/useWeather";
import type { Trail } from "../../types";

export default function WeatherPanel({ trail }: { trail: Trail }) {
  const { data, loading, error } = useWeather(trail.startPoint[0], trail.startPoint[1]);

  if (error) {
    return <div className="border border-clay-600/30 bg-clay-100/40 text-clay-700 rounded-2xl p-4 text-sm">{error}</div>;
  }

  if (loading || !data) {
    return <p className="text-sm text-ink-700/60">Loading forecast…</p>;
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={trail.id}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="border border-ink-900/10 rounded-2xl p-8 flex flex-col sm:flex-row items-start sm:items-center gap-6 justify-between">
          <div>
            <p className="text-sm text-ink-700/60">
              {trail.name}, {trail.district} · {trail.peakElevationM} m peak elevation
            </p>
            <p className="font-display text-6xl text-ink-900 mt-1">{Math.round(data.current.temperature)}°C</p>
            <p className="text-ink-700/80 mt-1">{weatherLabel(data.current.weatherCode)}</p>
          </div>
          <div className="flex gap-6">
            <div className="flex items-center gap-2 text-ink-700">
              <Wind size={18} className="text-forest-600" />
              <div>
                <p className="text-sm font-medium text-ink-900">{Math.round(data.current.windSpeed)} km/h</p>
                <p className="text-xs text-ink-700/60">Wind</p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-ink-700">
              <Droplets size={18} className="text-forest-600" />
              <div>
                <p className="text-sm font-medium text-ink-900">{data.current.precipitation} mm</p>
                <p className="text-xs text-ink-700/60">Precipitation</p>
              </div>
            </div>
          </div>
        </div>

        <h3 className="mt-8 font-medium text-ink-900">7-day outlook</h3>
        <div className="mt-4 grid grid-cols-3 sm:grid-cols-7 gap-3">
          {data.daily.map((d) => (
            <div
              key={d.date}
              className="border border-ink-900/10 rounded-2xl p-3 text-center hover:border-forest-500/40 hover:shadow-elevate reveal hover:-translate-y-1 transition-[border-color,box-shadow,transform] duration-300 ease-smooth"
            >
              <p className="text-xs text-ink-700/60">
                {new Date(d.date).toLocaleDateString(undefined, { weekday: "short" })}
              </p>
              <CloudSun size={18} className="mx-auto mt-2 text-forest-600" />
              <p className="mt-2 text-sm font-medium text-ink-900">{Math.round(d.max)}°</p>
              <p className="text-xs text-ink-700/50">{Math.round(d.min)}°</p>
              <p className="mt-1 text-xs text-clay-600">{Math.round(d.precipProbability)}%</p>
            </div>
          ))}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
