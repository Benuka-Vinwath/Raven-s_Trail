import { useState } from "react";
import PageHero from "../components/layout/PageHero";
import { useTrails } from "../hooks/useTrails";
import WeatherPanel from "../components/trails/WeatherPanel";

export default function Weather() {
  const { data: trails, loading, error } = useTrails();
  const [trailId, setTrailId] = useState<string | null>(null);

  const trail = (trails ?? []).find((t) => t.id === trailId) ?? trails?.[0];

  return (
    <>
      <PageHero page="weather" title="Live forecast" dim="at the trailhead" blurb="Real-time conditions from Open-Meteo for your chosen trail, so you know before you pack." />
    <div className="max-w-4xl mx-auto px-5 pb-16">

      {error && (
        <div className="mt-8 border border-clay-600/30 bg-clay-100/40 text-clay-700 rounded-2xl p-4 text-sm">{error}</div>
      )}

      {loading && !error && <p className="mt-8 text-sm text-ink-700/60">Loading trails…</p>}

      {trail && (
        <>
          <select
            value={trail.id}
            onChange={(e) => setTrailId(e.target.value)}
            className="mt-8 w-full sm:w-80 rounded-2xl border border-ink-900/15 bg-parchment-50 px-3 py-2.5 text-ink-900 outline-none transition-colors duration-200 ease-smooth focus:border-forest-500"
          >
            {(trails ?? []).map((t) => (
              <option key={t.id} value={t.id}>
                {t.name} — {t.district}
              </option>
            ))}
          </select>

          <div className="mt-8">
            <WeatherPanel trail={trail} />
          </div>
        </>
      )}
    </div>
    </>
  );
}
