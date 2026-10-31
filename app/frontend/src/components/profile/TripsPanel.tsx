import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { CalendarDays, Users } from "lucide-react";
import clsx from "clsx";
import Button from "../ui/Button";
import Reveal from "../ui/Reveal";
import { useAuth } from "../../context/AuthContext";
import { ApiError, tripsApi } from "../../lib/api";
import { trailPhoto } from "../../lib/photos";
import { formatDate, PHASE_STYLE } from "../../lib/trips";
import type { Trip, TripPhase } from "../../types";

const TABS = [
  { id: "upcoming", label: "Upcoming", phases: ["ongoing", "upcoming"] },
  { id: "past", label: "Past", phases: ["past", "cancelled"] },
  { id: "planning", label: "Planning", phases: ["planning"] },
] as const;
type TabId = (typeof TABS)[number]["id"];

export default function TripsPanel({ trips, loading, error, onChanged }: { trips: Trip[]; loading: boolean; error: string | null; onChanged: () => void }) {
  const [tab, setTab] = useState<TabId>("upcoming");

  const grouped = useMemo(() => {
    const byTab = (id: TabId) => trips.filter((t) => (TABS.find((x) => x.id === id)!.phases as readonly TripPhase[]).includes(t.phase));
    return { upcoming: byTab("upcoming").reverse(), past: byTab("past"), planning: byTab("planning") };
  }, [trips]);

  return (
    <section>
      <div className="flex gap-2">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={clsx(
              "rounded-full border px-4 py-1.5 text-sm transition-all duration-200 ease-smooth active:scale-95",
              tab === t.id ? "border-forest-600 bg-forest-600 text-parchment-50" : "border-ink-900/15 text-ink-700 hover:border-forest-500/50"
            )}
          >
            {t.label} <span className="opacity-70">({grouped[t.id].length})</span>
          </button>
        ))}
      </div>

      {error && <p className="mt-5 rounded-2xl border border-clay-600/30 bg-clay-100/40 p-4 text-sm text-clay-700">{error}</p>}
      {loading && !error && <p className="mt-5 text-sm text-ink-700/60">Loading your trips…</p>}

      {!loading && !error && grouped[tab].length === 0 && (
        <div className="mt-5 rounded-2xl border border-dashed border-ink-900/20 p-8 text-center">
          <p className="font-medium text-ink-900">{tab === "upcoming" ? "No upcoming trips" : tab === "past" ? "No past trips yet" : "Nothing in planning"}</p>
          <p className="mt-1 text-sm text-ink-700/70">Pick a trail, add gear to your order, and book it. It will show up here.</p>
          <Button to="/trails" className="mt-5">
            Find a trail
          </Button>
        </div>
      )}

      <div className="mt-5 grid gap-5 md:grid-cols-2">
        {grouped[tab].map((trip, i) => (
          <Reveal key={trip.id} delay={Math.min(i, 4) * 0.06}>
            <TripCard trip={trip} onChanged={onChanged} />
          </Reveal>
        ))}
      </div>
    </section>
  );
}

function TripCard({ trip, onChanged }: { trip: Trip; onChanged: () => void }) {
  const { token } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const phase = PHASE_STYLE[trip.phase];

  async function remove() {
    if (!token || !window.confirm("Delete this planned trip?")) return;
    try {
      await tripsApi.remove(trip.id, token);
      onChanged();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Couldn't delete it. Try again.");
    }
  }

  return (
    <div className="overflow-hidden rounded-3xl border border-ink-900/10 bg-parchment-100/60">
      <div className="flex">
        <img src={trailPhoto(trip.trailSlug, 400)} alt="" loading="lazy" className="h-auto w-28 shrink-0 object-cover sm:w-36" />
        <div className="min-w-0 flex-1 p-4">
          <div className="flex items-start justify-between gap-2">
            <Link to={`/trails/${trip.trailSlug}`} className="font-display text-lg leading-snug text-ink-900 hover:text-forest-700">
              {trip.trailName}
            </Link>
            <span className={clsx("shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium", phase.className)}>{phase.label}</span>
          </div>
          <p className="mt-2 flex items-center gap-1.5 text-sm text-ink-700">
            <CalendarDays size={14} className="shrink-0 text-forest-600" />
            {trip.startDate ? (trip.startDate === trip.endDate ? formatDate(trip.startDate) : `${formatDate(trip.startDate)} – ${formatDate(trip.endDate)}`) : "Dates not set"}
          </p>
          <p className="mt-1 flex items-center gap-1.5 text-sm text-ink-700">
            <Users size={14} className="shrink-0 text-forest-600" />
            {trip.hikers} {trip.hikers === 1 ? "hiker" : "hikers"} · {trip.days} {trip.days === 1 ? "day" : "days"}
          </p>

          {trip.booking ? (
            <Link
              to={`/bookings/${trip.booking.id}`}
              className="mt-3 flex items-center justify-between rounded-xl border border-ink-900/10 bg-parchment-50 px-3 py-2 text-sm transition-colors duration-200 hover:border-forest-500/50"
            >
              <span className="text-ink-700">
                Booking <span className="font-medium text-ink-900">{trip.booking.reference}</span>
              </span>
              <span className="text-ink-900">LKR {trip.booking.totalLkr.toLocaleString()}</span>
            </Link>
          ) : (
            <p className="mt-3 text-xs text-ink-700/60">No gear booked for this trip.</p>
          )}

          <div className="mt-3 flex flex-wrap gap-3 text-sm">
            {trip.phase === "past" && (
              <Link to={`/community?trail=${trip.trailSlug}`} className="text-forest-700 underline-offset-2 hover:underline">
                Write a review
              </Link>
            )}
            {!trip.booking && (
              <Link to={`/rentals?trail=${trip.trailSlug}`} className="text-forest-700 underline-offset-2 hover:underline">
                Plan gear
              </Link>
            )}
            {!trip.booking && (
              <button onClick={remove} className="text-ink-700/60 underline-offset-2 hover:text-clay-700 hover:underline">
                Delete
              </button>
            )}
          </div>
          {error && <p className="mt-2 text-xs text-clay-700">{error}</p>}
        </div>
      </div>
    </div>
  );
}
