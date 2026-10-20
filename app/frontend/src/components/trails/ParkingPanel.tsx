import { ShieldCheck, ShieldAlert, Car } from "lucide-react";
import { useParkingSpots } from "../../hooks/useParkingSpots";
import TrailsMap from "./TrailsMap";
import type { Trail } from "../../types";

export default function ParkingPanel({ trail }: { trail: Trail }) {
  const { data: spots, loading, error } = useParkingSpots(trail.slug);

  if (loading) return <p className="text-sm text-ink-700/60">Loading parking…</p>;

  if (error) {
    return <div className="border border-clay-600/30 bg-clay-100/40 text-clay-700 rounded-2xl p-4 text-sm">{error}</div>;
  }

  if (!spots || spots.length === 0) {
    return (
      <div className="border border-dashed border-ink-900/20 rounded-2xl p-8 text-center">
        <p className="text-ink-900 font-medium">No listed parking for this trailhead yet</p>
        <p className="mt-1 text-sm text-ink-700/70">Ask locally at the trailhead — informal parking is often available.</p>
      </div>
    );
  }

  return (
    <div className="grid lg:grid-cols-[1fr_20rem] gap-10">
      <div className="space-y-4">
        {spots.map((p) => (
          <div
            key={p.id}
            className="border border-ink-900/10 rounded-2xl p-5 flex items-start justify-between gap-4 flex-wrap hover:border-forest-500/40 hover:shadow-elevate reveal hover:-translate-y-1 transition-[border-color,box-shadow,transform] duration-300 ease-smooth"
          >
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-medium text-ink-900">{p.name}</h3>
                {p.secured ? (
                  <span className="flex items-center gap-1 text-xs text-forest-700 bg-forest-600/10 px-2 py-0.5 rounded-full">
                    <ShieldCheck size={12} />
                    Secured
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-xs text-clay-700 bg-clay-100 px-2 py-0.5 rounded-full">
                    <ShieldAlert size={12} />
                    Unsecured
                  </span>
                )}
              </div>
              <p className="mt-1 text-sm text-ink-700/70">{p.district}</p>
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

      <div className="h-72 lg:h-full rounded-2xl overflow-hidden border border-ink-900/10 lg:sticky lg:top-24">
        <TrailsMap trails={[trail]} parking={spots} center={trail.startPoint} zoom={12} />
      </div>
    </div>
  );
}
