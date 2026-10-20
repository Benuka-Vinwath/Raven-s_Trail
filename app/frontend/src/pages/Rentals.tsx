import { useMemo, useState } from "react";
import PageHero from "../components/layout/PageHero";
import { Star } from "lucide-react";
import { motion } from "framer-motion";
import clsx from "clsx";
import { useGearShops } from "../hooks/useGearShops";
import { useGearCart } from "../hooks/useGearCart";
import GearItemCard from "../components/gear/GearItemCard";
import ReservationSummary from "../components/gear/ReservationSummary";
import type { GearCategory } from "../types";

export default function Rentals() {
  const { data: shops, loading, error } = useGearShops();
  const [category, setCategory] = useState<GearCategory | "All">("All");

  const allItems = useMemo(
    () =>
      (shops ?? []).flatMap((shop) =>
        shop.items.map((item) => ({ ...item, shopName: shop.name, shopRating: shop.rating, district: shop.district }))
      ),
    [shops]
  );
  const CATEGORIES = useMemo(
    () => Array.from(new Set(allItems.map((i) => i.category))) as GearCategory[],
    [allItems]
  );

  const { cartItems, total, toggle, setDays, cart } = useGearCart(allItems);

  const filtered = useMemo(
    () => (category === "All" ? allItems : allItems.filter((i) => i.category === category)),
    [allItems, category]
  );

  return (
    <>
      <PageHero page="rentals" title="Gear up" dim="for the trail" blurb="Gear from partner shops near popular trailheads — browse everything here, or book straight from a trail's page for shops along that specific route." />
    <div className="max-w-6xl mx-auto px-5 pb-16">

      {error && (
        <div className="mt-8 border border-clay-600/30 bg-clay-100/40 text-clay-700 rounded-2xl p-4 text-sm">{error}</div>
      )}

      {loading && !error && <p className="mt-8 text-sm text-ink-700/60">Loading gear shops…</p>}

      {!loading && !error && (
        <>
          <div className="mt-8 flex flex-wrap gap-2">
            <button
              onClick={() => setCategory("All")}
              className={clsx(
                "px-3.5 py-1.5 rounded-full text-sm border transition-all duration-200 ease-smooth active:scale-95",
                category === "All" ? "bg-forest-600 text-parchment-50 border-forest-600" : "border-ink-900/15 text-ink-700 hover:border-forest-500/50"
              )}
            >
              All gear
            </button>
            {CATEGORIES.map((c) => (
              <button
                key={c}
                onClick={() => setCategory(c)}
                className={clsx(
                  "px-3.5 py-1.5 rounded-full text-sm border transition-all duration-200 ease-smooth active:scale-95",
                  category === c ? "bg-forest-600 text-parchment-50 border-forest-600" : "border-ink-900/15 text-ink-700 hover:border-forest-500/50"
                )}
              >
                {c}
              </button>
            ))}
          </div>

          <div className="mt-10 grid lg:grid-cols-[1fr_18rem] gap-10">
            <motion.div layout className="grid sm:grid-cols-2 gap-5">
              {filtered.map((item) => (
                <div key={item.id}>
                  <GearItemCard
                    item={item}
                    inCart={Boolean(cart[item.id])}
                    onToggle={() => toggle(item.id)}
                    metaLine={item.available > 0 ? `per day · ${item.available} available` : "per day · confirm availability"}
                  />
                  <p className="mt-2 flex items-center gap-1.5 text-xs text-ink-700/60 px-1">
                    {item.shopRating > 0 && <Star size={11} className="fill-gold-500 text-gold-500" />}
                    {item.shopRating > 0 && `${item.shopRating} · `}{item.shopName} · {item.district}
                  </p>
                </div>
              ))}
            </motion.div>

            <ReservationSummary cartItems={cartItems} total={total} onSetDays={setDays} />
          </div>
        </>
      )}
    </div>
    </>
  );
}
