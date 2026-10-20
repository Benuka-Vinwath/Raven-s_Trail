import { AnimatePresence, motion } from "framer-motion";
import { Plus, Check } from "lucide-react";
import clsx from "clsx";
import type { ShopItem } from "../../types";

interface GearItemCardProps {
  item: ShopItem;
  inCart: boolean;
  onToggle: () => void;
  metaLine?: string;
}

export default function GearItemCard({ item, inCart, onToggle, metaLine }: GearItemCardProps) {
  return (
    <div className="group border border-ink-900/10 rounded-2xl p-5 flex flex-col hover:border-forest-500/40 hover:shadow-elevate reveal hover:-translate-y-1 transition-[border-color,box-shadow,transform] duration-300 ease-smooth">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-xs text-ink-700/60">{item.category}</p>
          <h3 className="font-medium text-ink-900 mt-0.5">{item.name}</h3>
        </div>
      </div>
      <p className="mt-2 text-sm text-ink-700/75 leading-relaxed flex-1">{item.description}</p>
      <div className="mt-4 flex items-center justify-between">
        <div>
          <p className="font-display text-lg text-ink-900">LKR {item.pricePerDay}</p>
          <p className="text-xs text-ink-700/60">{metaLine ?? `per day · ${item.available} available`}</p>
        </div>
        <motion.button
          onClick={onToggle}
          whileTap={{ scale: 0.85 }}
          transition={{ type: "spring", stiffness: 500, damping: 25 }}
          className={clsx(
            "h-9 w-9 rounded-full flex items-center justify-center border shrink-0 overflow-hidden transition-colors duration-200 ease-smooth",
            inCart
              ? "bg-forest-600 border-forest-600 text-parchment-50"
              : "border-ink-900/20 text-ink-700 hover:border-clay-600 hover:text-clay-600"
          )}
          aria-label={inCart ? `Remove ${item.name} from reservation` : `Add ${item.name} to reservation`}
        >
          <AnimatePresence mode="wait" initial={false}>
            <motion.span
              key={inCart ? "check" : "plus"}
              className="flex"
              initial={{ scale: 0.4, rotate: -45, opacity: 0 }}
              animate={{ scale: 1, rotate: 0, opacity: 1 }}
              exit={{ scale: 0.4, rotate: 45, opacity: 0 }}
              transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
            >
              {inCart ? <Check size={16} /> : <Plus size={16} />}
            </motion.span>
          </AnimatePresence>
        </motion.button>
      </div>
    </div>
  );
}
