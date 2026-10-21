import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, Star, MapPin, Phone, Globe } from "lucide-react";
import { useGearShops } from "../../hooks/useGearShops";
import { useTripCart } from "../../hooks/useTripCart";
import { useAuth } from "../../context/AuthContext";
import GearItemCard from "../gear/GearItemCard";
import TripCart from "../gear/TripCart";
import type { Trail } from "../../types";

export default function GearShopsPanel({ trail }: { trail: Trail }) {
  const { data: shops, loading, error } = useGearShops(trail.slug);
  const allItems = (shops ?? []).flatMap((s) => s.items);
  const { token } = useAuth();
  const cart = useTripCart(trail.slug, allItems, token);
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
    return <div className="border border-clay-600/30 bg-clay-100/40 text-clay-700 rounded-2xl p-4 text-sm">{error}</div>;
  }

  if (!shops || shops.length === 0) {
    return (
      <div className="border border-dashed border-ink-900/20 rounded-2xl p-8 text-center">
        <p className="text-ink-900 font-medium">No partner shops listed for this trail yet</p>
        <p className="mt-1 text-sm text-ink-700/70">Check the full gear marketplace for other pickup points.</p>
      </div>
    );
  }

  return (
    <div className="grid lg:grid-cols-[1fr_18rem] gap-10">
      <div className="space-y-4">
        <p className="text-sm text-ink-700/70">
          {shops.length} {shops.length === 1 ? "shop can" : "shops can"} supply gear for {trail.name}. Tap a
          shop for prices and how to book.
        </p>

        {shops.map((shop) => {
          const isOpen = expanded.has(shop.id);
          return (
            <div key={shop.id} className="reveal border border-ink-900/10 rounded-2xl overflow-hidden">
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
                    {shop.reviewCount > 0 && <Star size={12} className="fill-gold-500 text-gold-500" />}
                    {shop.reviewCount > 0 && `${shop.rating} (${shop.reviewCount}) · `}
                    {shop.items.length > 0 ? `${shop.items.length} items with prices` : "Prices on request"}
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
                    {(shop.phone || shop.website || shop.note) && (
                      <div className="space-y-1.5 border-b border-ink-900/10 bg-forest-600/5 p-5 text-sm text-ink-700">
                        {shop.phone && (
                          <p className="flex items-center gap-2">
                            <Phone size={14} className="shrink-0 text-forest-600" />
                            {shop.phone}
                          </p>
                        )}
                        {shop.website && (
                          <a href={shop.website} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-forest-700 underline-offset-2 hover:underline">
                            <Globe size={14} className="shrink-0" />
                            Visit their site to book
                          </a>
                        )}
                        {shop.note && <p className="text-xs leading-relaxed text-ink-700/75">{shop.note}</p>}
                        {shop.sourceUrl && (
                          <a href={shop.sourceUrl} target="_blank" rel="noreferrer" className="inline-block text-xs text-ink-700/50 underline-offset-2 hover:underline">
                            Source
                          </a>
                        )}
                      </div>
                    )}
                    <div className="grid sm:grid-cols-2 gap-4 p-5">
                      {shop.items.map((item) => (
                        <GearItemCard
                          key={item.id}
                          item={item}
                          inCart={Boolean(cart.cart.items[item.id])}
                          onToggle={() => cart.toggle(item.id)}
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

      <TripCart trail={trail} cart={cart} />
    </div>
  );
}
