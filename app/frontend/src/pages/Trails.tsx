import { useMemo, useState } from "react";
import PageHero from "../components/layout/PageHero";
import { useSearchParams } from "react-router-dom";
import { Search } from "lucide-react";
import clsx from "clsx";
import TrailCard from "../components/trails/TrailCard";
import TrailsMap from "../components/trails/TrailsMap";
import { useTrails } from "../hooks/useTrails";
import type { Difficulty } from "../types";

const DIFFICULTIES: Difficulty[] = ["easy", "moderate", "hard"];

export default function Trails() {
  const { data: trails, loading, error } = useTrails();
  const [params, setParams] = useSearchParams();
  const [query, setQuery] = useState(params.get("q") ?? "");
  const [difficulties, setDifficulties] = useState<Set<Difficulty>>(new Set());
  const [districts, setDistricts] = useState<Set<string>>(new Set());
  const [sort, setSort] = useState<"rating" | "elevation" | "distance">("rating");

  const DISTRICTS = useMemo(
    () => Array.from(new Set((trails ?? []).map((t) => t.district))).sort(),
    [trails]
  );

  const filtered = useMemo(() => {
    let result = (trails ?? []).filter((t) => {
      const matchesQuery =
        query.trim() === "" ||
        t.name.toLowerCase().includes(query.toLowerCase()) ||
        t.district.toLowerCase().includes(query.toLowerCase()) ||
        t.tags.some((tag) => tag.toLowerCase().includes(query.toLowerCase()));
      const matchesDifficulty = difficulties.size === 0 || difficulties.has(t.difficulty);
      const matchesDistrict = districts.size === 0 || districts.has(t.district);
      return matchesQuery && matchesDifficulty && matchesDistrict;
    });

    result = [...result].sort((a, b) => {
      if (sort === "rating") return b.rating - a.rating || b.reviewCount - a.reviewCount || a.name.localeCompare(b.name);
      if (sort === "elevation") return b.peakElevationM - a.peakElevationM;
      return a.distanceKm - b.distanceKm;
    });

    return result;
  }, [trails, query, difficulties, districts, sort]);

  function toggleDifficulty(d: Difficulty) {
    setDifficulties((prev) => {
      const next = new Set(prev);
      if (next.has(d)) next.delete(d);
      else next.add(d);
      return next;
    });
  }

  function toggleDistrict(d: string) {
    setDistricts((prev) => {
      const next = new Set(prev);
      if (next.has(d)) next.delete(d);
      else next.add(d);
      return next;
    });
  }

  function handleQueryChange(value: string) {
    setQuery(value);
    setParams(value ? { q: value } : {});
  }

  return (
    <>
    <PageHero
      page="trails"
      title="Find your"
      dim="next trail"
      blurb={`${(trails ?? []).length} routes mapped across ${DISTRICTS.length} districts, from a gentle tea-estate walk to a multi-day rainforest traverse. Filter by district, elevation and difficulty.`}
    />
    <div className="max-w-6xl mx-auto px-5 pb-16">
      <div className="relative max-w-md">
        <Search size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-700/50" />
        <input
          value={query}
          onChange={(e) => handleQueryChange(e.target.value)}
          type="text"
          placeholder="Search by trail, district or tag"
          className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-ink-900/15 bg-parchment-50 text-ink-900 placeholder:text-ink-700/40 outline-none transition-colors duration-200 ease-smooth focus:border-forest-500"
        />
      </div>

      {error && (
        <div className="mt-8 border border-clay-600/30 bg-clay-100/40 text-clay-700 rounded-2xl p-4 text-sm">{error}</div>
      )}

      {loading && !error && <p className="mt-8 text-sm text-ink-700/60">Loading trails…</p>}

      {!loading && !error && (
        <div className="mt-10 grid lg:grid-cols-[15rem_1fr] gap-10">
          <aside className="space-y-8">
            <div>
              <h2 className="text-sm font-medium text-ink-900">Difficulty</h2>
              <div className="mt-3 flex flex-wrap gap-2">
                {DIFFICULTIES.map((d) => (
                  <button
                    key={d}
                    onClick={() => toggleDifficulty(d)}
                    className={clsx(
                      "px-3 py-1.5 rounded-full text-sm capitalize border transition-all duration-200 ease-smooth active:scale-95",
                      difficulties.has(d)
                        ? "bg-forest-600 text-parchment-50 border-forest-600"
                        : "border-ink-900/15 text-ink-700 hover:border-forest-500/50"
                    )}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h2 className="text-sm font-medium text-ink-900">District</h2>
              <div className="mt-3 space-y-2">
                {DISTRICTS.map((d) => (
                  <label key={d} className="flex items-center gap-2.5 text-sm text-ink-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={districts.has(d)}
                      onChange={() => toggleDistrict(d)}
                      className="h-4 w-4 rounded-2xl border-ink-900/25 accent-forest-600 transition-transform duration-150 ease-smooth"
                    />
                    {d}
                  </label>
                ))}
              </div>
            </div>

            <div>
              <h2 className="text-sm font-medium text-ink-900">Sort by</h2>
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value as typeof sort)}
                className="mt-3 w-full rounded-2xl border border-ink-900/15 bg-parchment-50 px-3 py-2 text-sm text-ink-900 outline-none transition-colors duration-200 ease-smooth focus:border-forest-500"
              >
                <option value="rating">Highest rated</option>
                <option value="elevation">Highest elevation</option>
                <option value="distance">Shortest distance</option>
              </select>
            </div>

            <div className="h-56 rounded-2xl overflow-hidden border border-ink-900/10 hidden lg:block">
              <TrailsMap trails={filtered} />
            </div>
          </aside>

          <div>
            <div className="lg:hidden h-48 rounded-2xl overflow-hidden border border-ink-900/10 mb-6">
              <TrailsMap trails={filtered} />
            </div>

            <p className="text-sm text-ink-700/70 mb-4">
              {filtered.length} {filtered.length === 1 ? "trail" : "trails"}
            </p>

            {filtered.length === 0 ? (
              <div className="border border-dashed border-ink-900/20 rounded-2xl p-10 text-center">
                <p className="text-ink-900 font-medium">No trails match those filters</p>
                <p className="mt-1 text-sm text-ink-700/70">Try clearing a filter or searching a different district.</p>
              </div>
            ) : (
              // keyed on the sort so re-ordering remounts the grid; layout animations on 40 cards left them stranded at their old positions
              <div key={sort} className="grid sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {filtered.map((t) => (
                  <TrailCard key={t.id} trail={t} />
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
    </>
  );
}
