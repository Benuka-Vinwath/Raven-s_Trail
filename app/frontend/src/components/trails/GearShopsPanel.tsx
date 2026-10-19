import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, Star, MapPin } from "lucide-react";
import { useGearShops } from "../../hooks/useGearShops";
import { useGearCart } from "../../hooks/useGearCart";
import GearItemCard from "../gear/GearItemCard";
import ReservationSummary from "../gear/ReservationSummary";
import type { Trail } from "../../types";

export default function GearShopsPanel({ trail }: { trail: Trail }) {
  const { data: shops, loading, error } = useGearShops(trail.slug);
  const allItems = (shops ?? []).flatMap((s) => s.items);
  const { cartItems, total, toggle, setDays, cart } = useGearCart(allItems);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (shops && shops.length > 0) {
      setExpanded((prev) => (prev.size === 0 ? new Set([shops[0].id]) : prev));
    }
  }, [shops]);

  function toggleShop(id: string) {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  if (loading) return <p className="text-sm text-ink-700/60">Loading gear shops…</p>;

  if (error) {
    return <div className="border border-clay-600/30 bg-clay-100/40 text-clay-700 rounded p-4 text-sm">{error}</div>;
  }

  if (!shops || shops.length === 0) {
    return (
      <div className="border border-dashed border-ink-900/20 rounded p-8 text-center">
        <p className="text-ink-900 font-medium">No partner shops listed for this trail yet</p>
        <p className="mt-1 text-sm text-ink-700/70">Check the full gear marketplace for other pickup points.</p>
      </div>
    );
  }

  return (
    <div className="grid lg:grid-cols-[1fr_18rem] gap-10">
      <div className="space-y-4">
        <p className="text-sm text-ink-700/70">
          {shops.length} {shops.length === 1 ? "shop serves" : "shops serve"} the {trail.name} trailhead. Tap a
          shop to see what's in stock.
        </p>

        {shops.map((shop) => {
          const isOpen = expanded.has(shop.id);
          return (
            <div key={shop.id} className="border border-ink-900/10 rounded overflow-hidden">
              <button
                onClick={() => toggleShop(shop.id)}
                className="w-full flex items-center justify-between gap-4 p-5 text-left hover:bg-forest-600/5 transition-colors duration-300 ease-smooth"
                aria-expanded={isOpen}
              >
                <div>
                  <h3 className="font-medium text-ink-900">{shop.name}</h3>
                  <p className="mt-1 flex items-center gap-1.5 text-xs text-ink-700/60">
                    <MapPin size={12} />
                    {shop.address}
                  </p>
                  <p className="mt-1 flex items-center gap-1.5 text-xs text-ink-700/70">
                    <Star size={12} className="fill-gold-500 text-gold-500" />
                    {shop.rating} ({shop.reviewCount}) · {shop.items.length} items available
                  </p>
                </div>
                <motion.span
                  animate={{ rotate: isOpen ? 180 : 0 }}
                  transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                  className="shrink-0 text-ink-700"
                >
                  <ChevronDown size={18} />
                </motion.span>
              </button>

              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                    className="overflow-hidden border-t border-ink-900/10"
                  >
                    <div className="grid sm:grid-cols-2 gap-4 p-5">
                      {shop.items.map((item) => (
                        <GearItemCard
                          key={item.id}
                          item={item}
                          inCart={Boolean(cart[item.id])}
                          onToggle={() => toggle(item.id)}
                        />
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>

      <ReservationSummary cartItems={cartItems} total={total} onSetDays={setDays} title="Gear reservation" />
    </div>
  );
}
