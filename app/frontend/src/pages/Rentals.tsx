import { useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import PageHero from "../components/layout/PageHero";
import Reveal from "../components/ui/Reveal";
import Select from "../components/ui/Select";
import GearShopsPanel from "../components/trails/GearShopsPanel";
import { useGearShops } from "../hooks/useGearShops";
import { useTrails } from "../hooks/useTrails";

const TYPE_LABELS: Record<string, string> = {
  tent: "Tents",
  sleeping_bag: "Sleeping bags",
  sleeping_mat: "Sleeping mats & mattresses",
  hammock: "Hammocks",
  stove: "Stoves",
  cookset: "Cooking sets",
  backpack: "Backpacks",
  headlamp: "Head torches",
  lantern: "Lanterns & camp lights",
  poles: "Trekking poles",
  shoes: "Hiking shoes",
  rain_gear: "Rain gear",
};

export default function Rentals() {
  const { data: trails, error: trailsError } = useTrails();
  const { data: shops, loading, error } = useGearShops();
  const [params, setParams] = useSearchParams();

  const trail = (trails ?? []).find((t) => t.slug === params.get("trail"));

  // every priced item from every shop, grouped by what it is, cheapest first
  const byType = useMemo(() => {
    const groups = new Map<string, { name: string; shop: string; price: number }[]>();
    for (const shop of shops ?? []) {
      for (const item of shop.items) {
        if (!item.gearType) continue;
        groups.set(item.gearType, [...(groups.get(item.gearType) ?? []), { name: item.name, shop: shop.name, price: item.pricePerDay }]);
      }
    }
    return Object.keys(TYPE_LABELS)
      .filter((type) => groups.has(type))
      .map((type) => ({ type, rows: groups.get(type)!.sort((a, b) => a.price - b.price) }));
  }, [shops]);

  return (
    <>
      <PageHero
        page="rentals"
        title="Gear up"
        dim="for the trail"
        blurb="Tell us where you're going and we'll work out what to bring, which shop covers it best, and what it costs."
      />
      <div className="mx-auto max-w-6xl px-5 pb-16">
        {(error || trailsError) && (
          <div className="mt-8 rounded-2xl border border-clay-600/30 bg-clay-100/40 p-4 text-sm text-clay-700">{error ?? trailsError}</div>
        )}

        <div className="mt-8 max-w-sm">
          <span className="mb-2 block text-sm font-medium text-ink-900">Which trail are you hiking?</span>
          <Select
            ariaLabel="Trail"
            value={trail?.slug ?? ""}
            onChange={(slug) => setParams(slug ? { trail: slug } : {}, { replace: true })}
            options={[{ value: "", label: "Choose a trail…" }, ...(trails ?? []).map((t) => ({ value: t.slug, label: t.name, hint: t.district }))]}
          />
        </div>

        {trail ? (
          <div className="mt-8">
            <GearShopsPanel key={trail.slug} trail={trail} />
          </div>
        ) : (
          <div className="mt-8 max-w-xl rounded-2xl border border-dashed border-ink-900/20 p-8 text-center">
            <p className="font-medium text-ink-900">Pick a trail to get your kit</p>
            <p className="mt-1 text-sm text-ink-700/70">You'll get a checklist for that trail, the best shops for it, and a gear order you can book.</p>
          </div>
        )}

        <section className="mt-20">
          <Reveal>
            <h2 className="font-display text-2xl text-ink-900">Compare prices by gear type</h2>
            <p className="mt-1 text-sm text-ink-700/70">What every shop charges per day, cheapest first. Stock isn't published, so confirm with the shop.</p>
          </Reveal>

          {loading && !error && <p className="mt-6 text-sm text-ink-700/60">Loading prices…</p>}

          <div className="mt-6 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {byType.map(({ type, rows }) => (
              <Reveal key={type}>
                <div className="h-full rounded-2xl border border-ink-900/10 bg-parchment-100/40 p-5">
                  <h3 className="font-medium text-ink-900">{TYPE_LABELS[type]}</h3>
                  <ul className="mt-3 divide-y divide-ink-900/10 text-sm">
                    {rows.slice(0, 5).map((r, i) => (
                      <li key={i} className="flex items-start justify-between gap-3 py-2">
                        <span className="text-ink-700">
                          {r.name}
                          <span className="block text-xs text-ink-700/50">{r.shop}</span>
                        </span>
                        <span className="shrink-0 font-medium text-ink-900">LKR {r.price.toLocaleString()}</span>
                      </li>
                    ))}
                  </ul>
                  {rows.length > 5 && <p className="mt-2 text-xs text-ink-700/50">+ {rows.length - 5} more. Pick a trail above to see them all.</p>}
                </div>
              </Reveal>
            ))}
          </div>
        </section>
      </div>
    </>
  );
}
