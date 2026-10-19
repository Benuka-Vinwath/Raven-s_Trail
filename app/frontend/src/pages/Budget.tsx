import { useState } from "react";
import { useTrails } from "../hooks/useTrails";
import BudgetCalculator from "../components/budget/BudgetCalculator";

export default function Budget() {
  const { data: trails, loading, error } = useTrails();
  const [trailId, setTrailId] = useState<string | null>(null);

  const trail = (trails ?? []).find((t) => t.id === trailId) ?? trails?.[0];

  return (
    <div className="max-w-6xl mx-auto px-5 py-12">
      <p className="text-clay-600 font-medium text-sm mb-2">Budget planner</p>
      <h1 className="font-display text-4xl text-ink-900">Estimate the full cost of your hike</h1>
      <p className="mt-3 text-ink-700/80 leading-relaxed max-w-2xl">
        Transport, food, gear and parking — see the total before you commit, and split it per person.
      </p>

      {error && (
        <div className="mt-8 border border-clay-600/30 bg-clay-100/40 text-clay-700 rounded p-4 text-sm">{error}</div>
      )}

      {loading && !error && <p className="mt-8 text-sm text-ink-700/60">Loading trails…</p>}

      {trail && (
        <>
          <label className="mt-8 block max-w-sm">
            <span className="block text-sm font-medium text-ink-900 mb-2">Trail</span>
            <select
              value={trail.id}
              onChange={(e) => setTrailId(e.target.value)}
              className="w-full rounded border border-ink-900/15 bg-parchment-50 px-3 py-2.5 text-ink-900 outline-none transition-colors duration-200 ease-smooth focus:border-forest-500"
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
  );
}
