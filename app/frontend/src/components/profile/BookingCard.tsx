import { Link } from "react-router-dom";
import { CalendarDays, ChevronRight, RotateCcw, Store } from "lucide-react";
import clsx from "clsx";
import { formatDate, PHASE_STYLE } from "../../lib/trips";
import type { Booking } from "../../types";

// one line saying where the gear is, for bookings that are under way
function progress(b: Booking): string {
  if (b.phase === "cancelled") return b.cancelledAt ? `Cancelled ${new Date(b.cancelledAt).toLocaleDateString()}` : "Cancelled";
  if (b.returnedAt) return `Returned ${new Date(b.returnedAt).toLocaleDateString()}`;
  if (b.pickedUpAt) return `Collected ${new Date(b.pickedUpAt).toLocaleDateString()}. Not marked returned yet`;
  if (b.phase === "upcoming") return "Not collected yet";
  if (b.phase === "ongoing") return "Rental period started. Not collected yet";
  return "Dates passed. Gear was never marked collected";
}

export default function BookingCard({ b }: { b: Booking }) {
  const phase = PHASE_STYLE[b.phase];
  const finished = b.phase === "past" || b.phase === "cancelled";

  return (
    <div className="rounded-2xl border border-ink-900/10 bg-parchment-100/50 transition-[border-color,box-shadow] duration-300 ease-smooth hover:border-forest-500/40 hover:shadow-elevate">
      <Link to={`/bookings/${b.id}`} className="group block p-4">
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
          <span className="truncate">{b.shops.map((s) => s.name).join(", ")}</span>
        </p>

        <div className="mt-3 flex items-center justify-between gap-3">
          <p className="text-xs text-ink-700/70">{progress(b)}</p>
          <p className="flex shrink-0 items-center gap-1 text-sm font-medium text-ink-900">
            LKR {b.totalLkr.toLocaleString()}
            <ChevronRight size={15} className="text-ink-700/40 transition-transform duration-200 group-hover:translate-x-0.5" />
          </p>
        </div>
      </Link>

      {finished && (
        <div className="border-t border-ink-900/10 px-4 py-2.5">
          <Link to={`/rentals?trail=${b.trailSlug}`} className="inline-flex items-center gap-1.5 text-sm font-medium text-forest-700 hover:underline">
            <RotateCcw size={13} /> Book again for {b.trailName}
          </Link>
        </div>
      )}
    </div>
  );
}
