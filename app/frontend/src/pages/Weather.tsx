import { useState } from "react";
import PageHero from "../components/layout/PageHero";
import { useTrails } from "../hooks/useTrails";
import Select from "../components/ui/Select";
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
          <Select
            ariaLabel="Trail"
            className="mt-8 w-full sm:w-80"
            value={trail.id}
            onChange={setTrailId}
            options={(trails ?? []).map((t) => ({ value: t.id, label: t.name, hint: t.district }))}
          />

          <div className="mt-8">
            <WeatherPanel trail={trail} />
          </div>
        </>
      )}
    </div>
    </>
  );
}
