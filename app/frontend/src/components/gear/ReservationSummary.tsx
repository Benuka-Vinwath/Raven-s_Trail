import { AnimatePresence, motion } from "framer-motion";
import type { ShopItem } from "../../types";

interface ReservationSummaryProps {
  cartItems: { item: ShopItem; days: number }[];
  total: number;
  onSetDays: (id: string, days: number) => void;
  title?: string;
}

export default function ReservationSummary({ cartItems, total, onSetDays, title = "Your reservation" }: ReservationSummaryProps) {
  return (
    <div className="border border-ink-900/10 rounded p-5 h-fit lg:sticky lg:top-24">
      <h2 className="font-medium text-ink-900">{title}</h2>
      <AnimatePresence mode="wait" initial={false}>
        {cartItems.length === 0 ? (
          <motion.p
            key="empty"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="mt-3 text-sm text-ink-700/60"
          >
            Add gear from the list to build a reservation.
          </motion.p>
        ) : (
          <motion.div key="items" className="mt-4 space-y-3" initial={false}>
            <AnimatePresence initial={false}>
              {cartItems.map(({ item, days }) => (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                  className="flex items-center justify-between text-sm gap-2 overflow-hidden"
                >
                  <span className="text-ink-700">{item.name}</span>
                  <div className="flex items-center gap-2 shrink-0">
                    <input
                      type="number"
                      min={1}
                      value={days}
                      onChange={(e) => onSetDays(item.id, Number(e.target.value))}
                      className="w-12 rounded border border-ink-900/15 px-1.5 py-1 text-center text-xs transition-colors duration-200 ease-smooth focus:border-forest-500 outline-none"
                    />
                    <span className="text-ink-700/60 text-xs">days</span>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            <motion.div layout className="pt-3 border-t border-ink-900/10 flex items-center justify-between font-medium text-ink-900">
              <span>Total</span>
              <span>LKR {total.toLocaleString()}</span>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
