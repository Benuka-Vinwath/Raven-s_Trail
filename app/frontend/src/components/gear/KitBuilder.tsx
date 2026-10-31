import { useMemo, useState } from "react";
import { Backpack, CloudRain, Minus, Phone, Plus, Snowflake } from "lucide-react";
import clsx from "clsx";
import Button from "../ui/Button";
import { useFetch } from "../../hooks/useFetch";
import { useWeather } from "../../hooks/useWeather";
import type { useTripCart } from "../../hooks/useTripCart";
import { kitApi } from "../../lib/api";
import type { KitLevel, KitMode, KitShop, Trail } from "../../types";

const MODES: { id: KitMode; label: string }[] = [
  { id: "day", label: "Day hike" },
  { id: "night", label: "Sunrise or night start" },
  { id: "rain", label: "Wet & leeches" },
  { id: "camp", label: "Overnight camping" },
];

const LEVELS: { id: KitLevel; title: string; className: string }[] = [
  { id: "essential", title: "Essential", className: "bg-clay-100/70 text-clay-700" },
  { id: "recommended", title: "Recommended", className: "bg-forest-600/12 text-forest-700" },
  { id: "optional", title: "Nice to have", className: "bg-ink-900/8 text-ink-700" },
];

function addDays(date: string, n: number) {
  const d = new Date(`${date}T00:00:00`);
  d.setDate(d.getDate() + n);
  return d.toLocaleDateString("en-CA"); // YYYY-MM-DD
}

function Stepper({ label, value, min, max, onChange }: { label: string; value: number; min: number; max: number; onChange: (n: number) => void }) {
  return (
    <div className="text-xs text-ink-700">
      {label}
      <div className="mt-1 flex items-center gap-2">
        <button type="button" onClick={() => onChange(Math.max(min, value - 1))} aria-label={`Fewer ${label}`} className="rounded-full border border-ink-900/15 p-1.5 hover:border-forest-500">
          <Minus size={13} />
        </button>
        <span className="w-6 text-center text-sm font-medium text-ink-900">{value}</span>
        <button type="button" onClick={() => onChange(Math.min(max, value + 1))} aria-label={`More ${label}`} className="rounded-full border border-ink-900/15 p-1.5 hover:border-forest-500">
          <Plus size={13} />
        </button>
      </div>
    </div>
  );
}

export default function KitBuilder({ trail, cart }: { trail: Trail; cart: ReturnType<typeof useTripCart> }) {
  const [people, setPeople] = useState(2);
  const [nights, setNights] = useState<number | null>(null); // null = the server picks from the trail
  const [mode, setMode] = useState<KitMode | null>(null);
  const [startDate, setStartDate] = useState("");
  const [added, setAdded] = useState<string | null>(null);
  const [today] = useState(() => new Date().toLocaleDateString("en-CA"));

  const { data: weather } = useWeather(trail.startPoint[0], trail.startPoint[1]);

  // forecast for the chosen dates, if they fall inside the 7-day forecast; otherwise no hints
  const hints = useMemo(() => {
    if (!startDate || !weather) return { rain: false, cold: false, known: false };
    const days = weather.daily.filter((d) => d.date >= startDate && d.date <= addDays(startDate, nights ?? (mode === "camp" ? 1 : 0)));
    return {
      rain: days.some((d) => d.precipProbability >= 50),
      cold: days.some((d) => d.min < 12),
      known: days.length > 0,
    };
  }, [startDate, weather, nights, mode]);

  const { data, loading, error } = useFetch(
    () => kitApi.get(trail.slug, { people, nights, mode, rain: hints.rain, cold: hints.cold }),
    [trail.slug, people, nights, mode, hints.rain, hints.cold]
  );

  const activeMode = mode ?? data?.inputs.mode;
  const shownNights = nights ?? data?.inputs.nights ?? 0;

  function applyShopKit(s: KitShop) {
    const items: Record<string, number> = {};
    for (const l of s.lines) {
      if (l.covered && l.level !== "optional" && l.itemId && l.quantity) items[l.itemId] = (items[l.itemId] ?? 0) + l.quantity;
    }
    const end = startDate ? addDays(startDate, data?.inputs.nights ?? 0) : null;
    cart.loadKit(items, startDate || null, end);
    setAdded(s.shop.name);
    document.getElementById("gear-order")?.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  return (
    <section className="rounded-3xl border border-forest-600/25 bg-forest-600/5 p-6">
      <h2 className="flex items-center gap-2 font-medium text-ink-900">
        <Backpack size={17} className="text-forest-600" /> Build your kit for {trail.name}
      </h2>
      <p className="mt-1 text-sm text-ink-700/70">Tell us about the trip. We'll work out what to bring and which shop covers it best.</p>

      <div className="mt-5 flex flex-wrap gap-2">
        {MODES.map((m) => (
          <button
            key={m.id}
            type="button"
            onClick={() => {
              setMode(m.id);
              setNights(null); // each preset brings its own sensible number of nights
              setAdded(null);
            }}
            className={clsx(
              "rounded-full border px-3.5 py-1.5 text-sm transition-all duration-200 ease-smooth active:scale-95",
              activeMode === m.id ? "border-forest-600 bg-forest-600 text-parchment-50" : "border-ink-900/15 text-ink-700 hover:border-forest-500/50"
            )}
          >
            {m.label}
          </button>
        ))}
      </div>

      <div className="mt-4 flex flex-wrap items-end gap-6">
        <Stepper label="Hikers" value={people} min={1} max={20} onChange={(n) => { setPeople(n); setAdded(null); }} />
        <Stepper
          label="Nights camping"
          value={shownNights}
          min={0}
          max={10}
          onChange={(n) => {
            setNights(n);
            setAdded(null);
          }}
        />
        <label className="text-xs text-ink-700">
          Start date (optional)
          <input
            type="date"
            min={today}
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="mt-1 block rounded-xl border border-ink-900/15 bg-parchment-50 px-2.5 py-1.5 text-sm text-ink-900 outline-none focus:border-forest-500"
          />
        </label>
      </div>

      {startDate && (
        <p className="mt-3 flex flex-wrap items-center gap-3 text-xs text-ink-700/80">
          {hints.known ? (
            <>
              {hints.rain && <span className="flex items-center gap-1 text-clay-700"><CloudRain size={13} /> Rain likely on your dates, so rain gear is essential.</span>}
              {hints.cold && <span className="flex items-center gap-1 text-forest-700"><Snowflake size={13} /> Cool nights forecast, so pick a warm sleeping bag.</span>}
              {!hints.rain && !hints.cold && <span>The forecast for your dates looks mild.</span>}
            </>
          ) : (
            <span>That's beyond the 7-day forecast, so weather isn't factored in yet.</span>
          )}
        </p>
      )}

      {error && <p className="mt-5 rounded-2xl border border-clay-600/30 bg-clay-100/40 p-3 text-sm text-clay-700">{error}</p>}

      {data && (
        <div className={clsx("mt-6 space-y-6 transition-opacity duration-200", loading && "opacity-60")}>
          <div className="space-y-4">
            {LEVELS.map((lvl) => {
              const items = data.kit.filter((k) => k.level === lvl.id);
              if (items.length === 0) return null;
              return (
                <div key={lvl.id}>
                  <span className={clsx("rounded-full px-2.5 py-0.5 text-xs font-medium", lvl.className)}>{lvl.title}</span>
                  <ul className="mt-2 space-y-2">
                    {items.map((k) => (
                      <li key={k.type} className="text-sm">
                        <span className="font-medium text-ink-900">
                          {k.label}
                          {k.quantity > 1 && k.type !== "tent" ? ` × ${k.quantity}` : ""}
                        </span>
                        {data.notRentable.includes(k.label) && (
                          <span className="ml-2 rounded-full bg-gold-100 px-2 py-0.5 text-xs text-clay-700">not for rent here, buy or bring</span>
                        )}
                        <span className="block text-xs text-ink-700/70">{k.reason}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>

          <div>
            <h3 className="font-medium text-ink-900">Shops that can supply it</h3>
            <p className="mt-0.5 text-xs text-ink-700/60">
              Best match first. Prices are for {data.inputs.days} {data.inputs.days === 1 ? "day" : "days"} and cover the essential and recommended items.
            </p>

            {data.shops.length === 0 ? (
              <p className="mt-3 text-sm text-ink-700/70">None of the shops for this trail publish prices for this kit. Call them (below) or browse the full list.</p>
            ) : (
              <div className="mt-3 space-y-3">
                {data.shops.slice(0, 3).map((s, i) => (
                  <div key={s.shop.id} className="rounded-2xl border border-ink-900/10 bg-parchment-50 p-4">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="flex items-center gap-2 font-medium text-ink-900">
                          {s.shop.name}
                          {i === 0 && <span className="rounded-full bg-forest-600 px-2 py-0.5 text-xs font-medium text-parchment-50">Best match</span>}
                        </p>
                        <p className="mt-0.5 text-xs text-ink-700/70">
                          Covers {s.essentialCovered} of {data.totals.essential} essentials and {s.recommendedCovered} of {data.totals.recommended} recommended
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-display text-xl text-ink-900">LKR {s.totalLkr.toLocaleString()}</p>
                        <p className="text-xs text-ink-700/60">LKR {s.perPersonLkr.toLocaleString()} per person</p>
                      </div>
                    </div>

                    {s.missing.length > 0 && <p className="mt-2 text-xs text-clay-700">Doesn't list: {s.missing.join(", ")}</p>}
                    {s.lines.some((l) => l.assumedSize) && <p className="mt-1 text-xs text-ink-700/60">Tent size isn't stated by this shop; we assumed it sleeps 2. Please confirm.</p>}

                    <details className="mt-2 text-xs text-ink-700">
                      <summary className="cursor-pointer text-forest-700">See the breakdown</summary>
                      <ul className="mt-2 space-y-1">
                        {s.lines.filter((l) => l.covered).map((l) => (
                          <li key={l.type} className="flex justify-between gap-3">
                            <span>
                              {l.quantity} × {l.itemName}
                              {l.level === "optional" && <span className="text-ink-700/50"> (nice to have, not included)</span>}
                            </span>
                            <span>LKR {l.lineTotal.toLocaleString()}</span>
                          </li>
                        ))}
                      </ul>
                    </details>

                    <div className="mt-3 flex flex-wrap items-center gap-3">
                      <Button size="sm" onClick={() => applyShopKit(s)}>
                        Use this kit
                      </Button>
                      {s.shop.phone && (
                        <span className="flex items-center gap-1.5 text-xs text-ink-700">
                          <Phone size={12} className="text-forest-600" /> {s.shop.phone}
                        </span>
                      )}
                    </div>
                    {added === s.shop.name && <p className="mt-2 text-xs text-forest-700">Added to your gear order. Pick your dates there if you haven't.</p>}
                  </div>
                ))}
              </div>
            )}

            {data.callToPrice.length > 0 && (
              <p className="mt-3 text-xs text-ink-700/70">
                Also serving this trail but not publishing prices, so call for a quote: {data.callToPrice.map((c) => (c.phone ? `${c.name} (${c.phone})` : c.name)).join(", ")}.
              </p>
            )}
          </div>
          <p className="text-xs text-ink-700/50">A starting checklist, not a safety guarantee. Check conditions and ask a local guide before you go.</p>
        </div>
      )}
    </section>
  );
}
