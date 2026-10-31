import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { CalendarDays, ChevronRight, Store } from "lucide-react";
import clsx from "clsx";
import Button from "../ui/Button";
import { useAuth } from "../../context/AuthContext";
import { useFetch } from "../../hooks/useFetch";
import { bookingsApi } from "../../lib/api";
import { formatDate, PHASE_STYLE } from "../../lib/trips";
import type { Booking } from "../../types";

const TABS = [
  { id: "active", label: "Ongoing & upcoming" },
  { id: "past", label: "Past" },
] as const;
type TabId = (typeof TABS)[number]["id"];

// one line saying where the gear is, for bookings that are under way
function progress(b: Booking): string | null {
  if (b.phase === "cancelled") return b.cancelledAt ? `Cancelled ${new Date(b.cancelledAt).toLocaleDateString()}` : "Cancelled";
  if (b.returnedAt) return `Returned ${new Date(b.returnedAt).toLocaleDateString()}`;
  if (b.pickedUpAt) return `Collected ${new Date(b.pickedUpAt).toLocaleDateString()}. Not marked returned yet`;
  if (b.phase === "upcoming") return "Not collected yet";
  if (b.phase === "ongoing") return "Rental period started. Not collected yet";
  return "Dates passed. Gear was never marked collected";
}

export default function MyBookings() {
  const { token } = useAuth();
  const { data, loading, error } = useFetch(() => bookingsApi.list(token!), [token]);
  const [tab, setTab] = useState<TabId>("active");

  const groups = useMemo(() => {
    const all = data ?? [];
    return {
      // soonest first for what's coming, newest first for history (the API already sorts newest first)
      active: all.filter((b) => b.phase === "upcoming" || b.phase === "ongoing").reverse(),
      past: all.filter((b) => b.phase === "past" || b.phase === "cancelled"),
    };
  }, [data]);

  return (
    <section>
      <h2 className="font-display text-2xl text-ink-900">My bookings</h2>
      <p className="mt-1 text-sm text-ink-700/70">Your gear orders: what's coming up, what's out with you, and what you've finished.</p>

      <div className="mt-4 flex gap-2">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={clsx(
              "rounded-full border px-4 py-1.5 text-sm transition-all duration-200 ease-smooth active:scale-95",
              tab === t.id ? "border-forest-600 bg-forest-600 text-parchment-50" : "border-ink-900/15 text-ink-700 hover:border-forest-500/50"
            )}
          >
            {t.label} <span className="opacity-70">({groups[t.id].length})</span>
          </button>
        ))}
      </div>

      {error && <p className="mt-5 rounded-2xl border border-clay-600/30 bg-clay-100/40 p-4 text-sm text-clay-700">{error}</p>}
      {loading && !error && <p className="mt-5 text-sm text-ink-700/60">Loading your bookings…</p>}

      {!loading && !error && groups[tab].length === 0 && (
        <div className="mt-5 rounded-2xl border border-dashed border-ink-900/20 p-8 text-center">
          <p className="font-medium text-ink-900">{tab === "active" ? "No bookings in progress" : "No past bookings yet"}</p>
          <p className="mt-1 text-sm text-ink-700/70">Build a kit for your next trail and book it. It will show up here.</p>
          <Button to="/rentals" className="mt-4">
            Plan my gear
          </Button>
        </div>
      )}

      <div className="mt-5 space-y-3">
        {groups[tab].map((b) => {
          const phase = PHASE_STYLE[b.phase];
          const shopNames = b.shops.map((s) => s.name);
          return (
            <Link
              key={b.id}
              to={`/bookings/${b.id}`}
              className="group block rounded-2xl border border-ink-900/10 bg-parchment-100/50 p-4 transition-[border-color,box-shadow] duration-300 ease-smooth hover:border-forest-500/40 hover:shadow-elevate"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-display text-lg leading-snug text-ink-900">{b.trailName}</p>
                  <p className="text-xs tracking-wider text-ink-700/60">{b.reference}</p>
                </div>
                <span className={clsx("shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium", phase.className)}>{phase.label}</span>
              </div>

              <p className="mt-2 flex items-center gap-1.5 text-sm text-ink-700">
                <CalendarDays size={14} className="shrink-0 text-forest-600" />
                {formatDate(b.startDate)} – {formatDate(b.endDate)}
              </p>
              <p className="mt-1 flex items-center gap-1.5 text-sm text-ink-700">
                <Store size={14} className="shrink-0 text-forest-600" />
                <span className="truncate">{shopNames.join(", ")}</span>
              </p>

              <div className="mt-3 flex items-center justify-between gap-3">
                <p className="text-xs text-ink-700/70">{progress(b)}</p>
                <p className="flex shrink-0 items-center gap-1 text-sm font-medium text-ink-900">
                  LKR {b.totalLkr.toLocaleString()}
                  <ChevronRight size={15} className="text-ink-700/40 transition-transform duration-200 group-hover:translate-x-0.5" />
                </p>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
