import { lazy, Suspense, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { List, LocateFixed, Map as MapIcon, MapPin, Search, X } from "lucide-react";
import clsx from "clsx";
import type { LatLngBounds } from "leaflet";
import PageHero from "../components/layout/PageHero";
import TrailCard from "../components/trails/TrailCard";
import Select from "../components/ui/Select";
import { useTrails } from "../hooks/useTrails";
import { distanceKm } from "../lib/geo";
import type { Difficulty } from "../types";

// the map (Leaflet + clustering) is the heaviest part of the page, so it loads after the list is on screen
const TrailsMap = lazy(() => import("../components/trails/TrailsMap"));

const DIFFICULTIES: Difficulty[] = ["easy", "moderate", "hard"];
type Sort = "rating" | "elevation" | "distance" | "nearest";

const chip = (active: boolean) =>
  clsx(
    "rounded-full border px-3.5 py-1.5 text-sm capitalize transition-all duration-200 ease-smooth active:scale-95",
    active ? "border-forest-600 bg-forest-600 text-parchment-50" : "border-ink-900/15 text-ink-700 hover:border-forest-500/50"
  );

export default function Trails() {
  const { data: trails, loading, error } = useTrails();
  const [params, setParams] = useSearchParams();
  const [query, setQuery] = useState(params.get("q") ?? "");
  const [difficulties, setDifficulties] = useState<Set<Difficulty>>(new Set());
  const [districts, setDistricts] = useState<Set<string>>(new Set());
  const [sort, setSort] = useState<Sort>("rating");

  const [view, setView] = useState<"list" | "map">("list"); // phones show one or the other
  const [hovered, setHovered] = useState<string | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const [areaBounds, setAreaBounds] = useState<LatLngBounds | null>(null);
  const [userPos, setUserPos] = useState<[number, number] | null>(null);
  const [locating, setLocating] = useState(false);
  const [locateError, setLocateError] = useState<string | null>(null);

  const DISTRICTS = useMemo(() => Array.from(new Set((trails ?? []).map((t) => t.district))).sort(), [trails]);

  // straight-line distance from the visitor to each trailhead, once they've shared their location
  const awayKm = useMemo(() => {
    if (!userPos) return undefined;
    return Object.fromEntries((trails ?? []).map((t) => [t.slug, distanceKm(userPos, t.startPoint)]));
  }, [trails, userPos]);

  const filtered = useMemo(() => {
    let result = (trails ?? []).filter((t) => {
      const matchesQuery =
        query.trim() === "" ||
        t.name.toLowerCase().includes(query.toLowerCase()) ||
        t.district.toLowerCase().includes(query.toLowerCase()) ||
        t.tags.some((tag) => tag.toLowerCase().includes(query.toLowerCase()));
      const matchesDifficulty = difficulties.size === 0 || difficulties.has(t.difficulty);
      const matchesDistrict = districts.size === 0 || districts.has(t.district);
      const inArea = !areaBounds || areaBounds.contains(t.startPoint);
      return matchesQuery && matchesDifficulty && matchesDistrict && inArea;
    });

    result = [...result].sort((a, b) => {
      if (sort === "nearest" && awayKm) return awayKm[a.slug] - awayKm[b.slug];
      if (sort === "rating") return b.rating - a.rating || b.reviewCount - a.reviewCount || a.name.localeCompare(b.name);
      if (sort === "elevation") return b.peakElevationM - a.peakElevationM;
      return a.distanceKm - b.distanceKm;
    });

    return result;
  }, [trails, query, difficulties, districts, sort, areaBounds, awayKm]);

  function toggle<T>(set: Set<T>, value: T, apply: (s: Set<T>) => void) {
    const next = new Set(set);
    if (next.has(value)) next.delete(value);
    else next.add(value);
    apply(next);
  }

  function handleQueryChange(value: string) {
    setQuery(value);
    setParams(value ? { q: value } : {});
  }

  function locate() {
    if (!navigator.geolocation) {
      setLocateError("Your browser can't share its location.");
      return;
    }
    setLocating(true);
    setLocateError(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserPos([pos.coords.latitude, pos.coords.longitude]);
        setSort("nearest");
        setLocating(false);
      },
      () => {
        setLocating(false);
        setLocateError("Couldn't get your location. Check that location access is allowed for this site.");
      },
      { timeout: 10_000, maximumAge: 300_000 }
    );
  }

  // picking a pin brings its card into view beside the map
  function selectTrail(slug: string | null) {
    setSelected(slug);
    if (slug && window.innerWidth >= 1024) document.getElementById(`trail-${slug}`)?.scrollIntoView({ block: "center", behavior: "smooth" });
  }

  const sortOptions = [
    { value: "rating", label: "Highest rated" },
    { value: "elevation", label: "Highest elevation" },
    { value: "distance", label: "Shortest distance" },
    ...(userPos ? [{ value: "nearest", label: "Nearest to me" }] : []),
  ];

  return (
    <>
      <PageHero
        page="trails"
        title="Find your"
        dim="next trail"
        blurb={`${(trails ?? []).length} routes mapped across ${DISTRICTS.length} districts, from a gentle tea-estate walk to a multi-day rainforest traverse. Filter by district, elevation and difficulty.`}
      />
      <div className="mx-auto max-w-7xl px-5 pb-16">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative min-w-[14rem] flex-1 sm:max-w-md">
            <Search size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-700/50" />
            <input
              value={query}
              onChange={(e) => handleQueryChange(e.target.value)}
              type="text"
              placeholder="Search by trail, district or tag"
              className="w-full rounded-2xl border border-ink-900/15 bg-parchment-50 py-2.5 pl-10 pr-4 text-ink-900 outline-none transition-colors duration-200 ease-smooth placeholder:text-ink-700/40 focus:border-forest-500"
            />
          </div>
          <Select ariaLabel="Sort by" size="sm" className="w-52" value={sort} onChange={(v) => setSort(v as Sort)} options={sortOptions} />
          <button
            onClick={locate}
            disabled={locating}
            className="flex items-center gap-2 rounded-2xl border border-ink-900/15 bg-parchment-50 px-3.5 py-2 text-sm text-ink-900 transition-colors hover:border-forest-500/50 disabled:opacity-60"
          >
            <LocateFixed size={15} className={userPos ? "text-forest-600" : "text-ink-700"} />
            {locating ? "Locating…" : userPos ? "Location on" : "Near me"}
          </button>

          <div className="flex overflow-hidden rounded-2xl border border-ink-900/15 text-sm lg:hidden">
            {(["list", "map"] as const).map((v) => (
              <button key={v} onClick={() => setView(v)} className={clsx("flex items-center gap-1.5 px-3.5 py-2 capitalize", view === v ? "bg-forest-600 text-parchment-50" : "text-ink-700")}>
                {v === "list" ? <List size={15} /> : <MapIcon size={15} />}
                {v}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {DIFFICULTIES.map((d) => (
            <button key={d} onClick={() => toggle(difficulties, d, setDifficulties)} className={chip(difficulties.has(d))}>
              {d}
            </button>
          ))}
          <span className="mx-1 hidden w-px bg-ink-900/15 sm:block" />
          {DISTRICTS.map((d) => (
            <button key={d} onClick={() => toggle(districts, d, setDistricts)} className={chip(districts.has(d))}>
              {d}
            </button>
          ))}
        </div>

        {error && <div className="mt-8 rounded-2xl border border-clay-600/30 bg-clay-100/40 p-4 text-sm text-clay-700">{error}</div>}
        {loading && !error && <p className="mt-8 text-sm text-ink-700/60">Loading trails…</p>}

        {!loading && !error && (
          <>
            <div className="mt-5 flex flex-wrap items-center gap-3 text-sm text-ink-700/70">
              <span>
                {filtered.length} {filtered.length === 1 ? "trail" : "trails"}
              </span>
              {areaBounds && (
                <button onClick={() => setAreaBounds(null)} className="flex items-center gap-1.5 rounded-full bg-forest-600/10 px-3 py-1 text-forest-700">
                  <MapPin size={13} /> Only this map area <X size={13} />
                </button>
              )}
              {locateError && <span className="text-clay-700">{locateError}</span>}
            </div>

            <div className="mt-4 grid gap-6 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)]">
              <div className={clsx(view === "map" && "hidden lg:block")}>
                {filtered.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-ink-900/20 p-10 text-center">
                    <p className="font-medium text-ink-900">No trails match those filters</p>
                    <p className="mt-1 text-sm text-ink-700/70">Try clearing a filter, searching a different district, or showing the whole map.</p>
                  </div>
                ) : (
                  <div key={sort} className="grid gap-5 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
                    {filtered.map((t) => (
                      <div
                        key={t.id}
                        id={`trail-${t.slug}`}
                        onMouseEnter={() => setHovered(t.slug)}
                        onMouseLeave={() => setHovered(null)}
                        className={clsx("relative rounded-3xl transition-shadow duration-200", selected === t.slug && "ring-2 ring-forest-500 ring-offset-2 ring-offset-parchment-50")}
                      >
                        <TrailCard trail={t} awayKm={awayKm?.[t.slug]} />
                        <button
                          onClick={() => {
                            selectTrail(t.slug);
                            setView("map");
                          }}
                          aria-label={`Show ${t.name} on the map`}
                          title="Show on map"
                          className="absolute right-3 top-3 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-parchment-50/90 text-forest-700 shadow-sm backdrop-blur transition-transform hover:scale-110"
                        >
                          <MapPin size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className={clsx(view === "list" && "hidden lg:block")}>
                <div className="h-[72vh] overflow-hidden rounded-3xl border border-ink-900/10 lg:sticky lg:top-24 lg:h-[calc(100vh-7rem)]">
                  <Suspense fallback={<div className="h-full w-full animate-pulse bg-ink-900/5" />}>
                    <TrailsMap
                      variant="full"
                      trails={filtered}
                      hoveredSlug={hovered}
                      selectedSlug={selected}
                      onSelect={selectTrail}
                      userPos={userPos}
                      userDistances={awayKm}
                      autoFit={!areaBounds}
                      onSearchArea={setAreaBounds}
                    />
                  </Suspense>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
}
