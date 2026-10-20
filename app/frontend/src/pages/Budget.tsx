import { useState } from "react";
import PageHero from "../components/layout/PageHero";
import { useTrails } from "../hooks/useTrails";
import BudgetCalculator from "../components/budget/BudgetCalculator";

export default function Budget() {
  const { data: trails, loading, error } = useTrails();
  const [trailId, setTrailId] = useState<string | null>(null);

  const trail = (trails ?? []).find((t) => t.id === trailId) ?? trails?.[0];

  return (
    <>
      <PageHero page="budget" title="Plan the full" dim="cost of your hike" blurb="Transport, food, gear and parking — see the total before you commit, and split it per person." />
    <div className="max-w-6xl mx-auto px-5 pb-16">

      {error && (
        <div className="mt-8 border border-clay-600/30 bg-clay-100/40 text-clay-700 rounded-2xl p-4 text-sm">{error}</div>
      )}

      {loading && !error && <p className="mt-8 text-sm text-ink-700/60">Loading trails…</p>}

      {trail && (
        <>
          <label className="mt-8 block max-w-sm">
            <span className="block text-sm font-medium text-ink-900 mb-2">Trail</span>
            <select
              value={trail.id}
              onChange={(e) => setTrailId(e.target.value)}
              className="w-full rounded-2xl border border-ink-900/15 bg-parchment-50 px-3 py-2.5 text-ink-900 outline-none transition-colors duration-200 ease-smooth focus:border-forest-500"
            >
              {(trails ?? []).map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name} — {t.district}
                </option>
              ))}
            </select>
          </label>

          <div className="mt-10">
            <BudgetCalculator key={trail.id} trail={trail} />
          </div>
        </>
      )}
    </div>
    </>
  );
}
