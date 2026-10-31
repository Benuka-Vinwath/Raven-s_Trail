import { ShieldCheck, Car } from "lucide-react";
import PageHero from "../components/layout/PageHero";
import { lazy, Suspense } from "react";

const TrailsMap = lazy(() => import("../components/trails/TrailsMap"));
import { useParkingSpots } from "../hooks/useParkingSpots";
import { useTrails } from "../hooks/useTrails";

export default function Parking() {
  const { data: parkingSpots, loading, error } = useParkingSpots();
  const { data: trails } = useTrails();

  return (
    <>
      <PageHero page="parking" title="Park safely" dim="near the trailhead" blurb="Pricing and capacity for parking at the most popular trailheads, so you know before you drive up." />
    <div className="max-w-6xl mx-auto px-5 pb-16">

      {error && (
        <div className="mt-8 border border-clay-600/30 bg-clay-100/40 text-clay-700 rounded-2xl p-4 text-sm">{error}</div>
      )}

      {loading && !error && <p className="mt-8 text-sm text-ink-700/60">Loading parking…</p>}

      {!loading && !error && parkingSpots && (
        <div className="mt-10 grid lg:grid-cols-[1fr_20rem] gap-10">
          <div className="space-y-4">
            {parkingSpots.map((p) => (
              <div
                key={p.id}
                className="border border-ink-900/10 rounded-2xl p-5 flex items-start justify-between gap-4 flex-wrap hover:border-forest-500/40 hover:shadow-elevate reveal hover:-translate-y-1 transition-[border-color,box-shadow,transform] duration-300 ease-smooth"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium text-ink-900">{p.name}</h3>
                    {p.secured && (
                      <span className="flex items-center gap-1 text-xs text-forest-700 bg-forest-600/10 px-2 py-0.5 rounded-full">
                        <ShieldCheck size={12} />
                        Secured
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-sm text-ink-700/70">
                    Near {p.nearTrail} · {p.district}
                  </p>
                  <p className="mt-1 text-sm text-ink-700/60 flex items-center gap-1.5">
                    <Car size={14} />
                    {p.capacity} vehicles · {p.surface} surface
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <p className="font-display text-xl text-ink-900">LKR {p.pricePerDay}</p>
                  <p className="text-xs text-ink-700/60">per day</p>
                </div>
              </div>
            ))}
          </div>

          <aside className="h-72 lg:h-full lg:min-h-[32rem] rounded-2xl overflow-hidden border border-ink-900/10 lg:sticky lg:top-24">
            <Suspense fallback={<div className="h-full w-full animate-pulse bg-ink-900/5" />}>
              <TrailsMap
                trails={(trails ?? []).filter((t) => parkingSpots.some((p) => p.nearTrail === t.name))}
                parking={parkingSpots}
              />
            </Suspense>
          </aside>
        </div>
      )}
    </div>
    </>
  );
}
