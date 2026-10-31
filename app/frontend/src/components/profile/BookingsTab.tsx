import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import clsx from "clsx";
import Button from "../ui/Button";
import BookingCard from "./BookingCard";
import type { Booking } from "../../types";

const FILTERS = [
  { id: "active", label: "Ongoing & upcoming" },
  { id: "past", label: "Past" },
] as const;
type FilterId = (typeof FILTERS)[number]["id"];

export default function BookingsTab({ bookings, loading, error }: { bookings: Booking[]; loading: boolean; error: string | null }) {
  const [filter, setFilter] = useState<FilterId>("active");
  const [query, setQuery] = useState("");

  const groups = useMemo(() => {
    const q = query.trim().toLowerCase();
    const matches = (b: Booking) => !q || b.reference.toLowerCase().includes(q) || b.trailName.toLowerCase().includes(q) || b.shops.some((s) => s.name.toLowerCase().includes(q));
    const found = bookings.filter(matches);
    return {
      // soonest first for what's coming, newest first for history (the API already sorts newest first)
      active: found.filter((b) => b.phase === "upcoming" || b.phase === "ongoing").reverse(),
      past: found.filter((b) => b.phase === "past" || b.phase === "cancelled"),
    };
  }, [bookings, query]);

  const shown = groups[filter];

  return (
    <section>
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex gap-2">
          {FILTERS.map((f) => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className={clsx(
                "rounded-full border px-4 py-1.5 text-sm transition-all duration-200 ease-smooth active:scale-95",
                filter === f.id ? "border-forest-600 bg-forest-600 text-parchment-50" : "border-ink-900/15 text-ink-700 hover:border-forest-500/50"
              )}
            >
              {f.label} <span className="opacity-70">({groups[f.id].length})</span>
            </button>
          ))}
        </div>
        <div className="relative min-w-[12rem] flex-1 sm:max-w-xs">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-700/50" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search reference, trail or shop"
            className="w-full rounded-xl border border-ink-900/15 bg-parchment-50 py-2 pl-9 pr-3 text-sm text-ink-900 outline-none transition-colors placeholder:text-ink-700/40 focus:border-forest-500"
          />
        </div>
      </div>

      {error && <p className="mt-5 rounded-2xl border border-clay-600/30 bg-clay-100/40 p-4 text-sm text-clay-700">{error}</p>}
      {loading && !error && <p className="mt-5 text-sm text-ink-700/60">Loading your bookings…</p>}

      {!loading && !error && shown.length === 0 && (
        <div className="mt-5 rounded-2xl border border-dashed border-ink-900/20 p-8 text-center">
          <p className="font-medium text-ink-900">
            {query ? "No bookings match that search" : filter === "active" ? "No bookings in progress" : "No past bookings yet"}
          </p>
          <p className="mt-1 text-sm text-ink-700/70">Build a kit for your next trail and book it. It will show up here.</p>
          <Button to="/rentals" className="mt-4">
            Plan my gear
          </Button>
        </div>
      )}

      <div className="mt-5 grid gap-4 md:grid-cols-2">
        {shown.map((b) => (
          <BookingCard key={b.id} b={b} />
        ))}
      </div>
    </section>
  );
}
