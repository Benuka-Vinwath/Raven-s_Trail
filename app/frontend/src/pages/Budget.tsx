import { useState } from "react";
import PageHero from "../components/layout/PageHero";
import { useTrails } from "../hooks/useTrails";
import Select from "../components/ui/Select";
import BudgetCalculator from "../components/budget/BudgetCalculator";
import { useAuth } from "../context/AuthContext";

export default function Budget() {
  const { data: trails, loading, error } = useTrails();
  const { token } = useAuth();
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
          <div className="mt-8 max-w-sm">
            <span className="block text-sm font-medium text-ink-900 mb-2">Trail</span>
            <Select
              ariaLabel="Trail"
              value={trail.id}
              onChange={setTrailId}
              options={(trails ?? []).map((t) => ({ value: t.id, label: t.name, hint: t.district }))}
            />
          </div>

          <div className="mt-10">
            {/* token in key: remount (clear all inputs/AI plan) on logout or login */}
            <BudgetCalculator key={`${trail.id}:${token ?? ""}`} trail={trail} />
          </div>
        </>
      )}
    </div>
    </>
  );
}
