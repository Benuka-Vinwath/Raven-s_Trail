import { useMemo, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { CalendarDays, Mountain, Route, Users } from "lucide-react";
import clsx from "clsx";
import PageHero from "../components/layout/PageHero";
import Button from "../components/ui/Button";
import Reveal from "../components/ui/Reveal";
import { useAuth } from "../context/AuthContext";
import { useFetch } from "../hooks/useFetch";
import { ApiError, tripsApi } from "../lib/api";
import { trailPhoto } from "../lib/photos";
import { formatDate, PHASE_STYLE } from "../lib/trips";
import type { Trip, TripPhase } from "../types";

const TABS = [
  { id: "upcoming", label: "Upcoming", phases: ["ongoing", "upcoming"] },
  { id: "past", label: "Past", phases: ["past", "cancelled"] },
  { id: "planning", label: "Planning", phases: ["planning"] },
] as const;
type TabId = (typeof TABS)[number]["id"];

export default function MyTrips() {
  const { user, token, loading: authLoading } = useAuth();
  const { data: trips, loading, error, refetch } = useFetch(() => tripsApi.list(token!), [token]);
  const [tab, setTab] = useState<TabId>("upcoming");

  const grouped = useMemo(() => {
    const byTab = (id: TabId) => (trips ?? []).filter((t) => (TABS.find((x) => x.id === id)!.phases as readonly TripPhase[]).includes(t.phase));
    return { upcoming: byTab("upcoming").reverse(), past: byTab("past"), planning: byTab("planning") };
  }, [trips]);

  // numbers for the header: only hikes that were actually completed
  const done = (trips ?? []).filter((t) => t.phase === "past");
  const stats = {
    trips: done.length,
    km: Math.round(done.reduce((s, t) => s + t.distanceKm, 0) * 10) / 10,
    climb: done.reduce((s, t) => s + t.elevationGainM, 0),
  };

  if (authLoading) return null;
  if (!user) return <Navigate to="/login" state={{ from: "/trips" }} replace />;

  return (
    <>
      <PageHero
        page="profile"
        title="Your"
        dim="trips"
        blurb="Hikes you've planned, gear you've booked, and the trails you've already finished."
      />
      <div className="mx-auto max-w-6xl px-5 pb-16">
        <div className="grid grid-cols-3 gap-3 sm:max-w-xl">
          <Stat icon={<Route size={16} />} value={stats.trips} label="Trails done" />
          <Stat icon={<Mountain size={16} />} value={`${stats.km} km`} label="Distance" />
          <Stat icon={<Mountain size={16} />} value={`${stats.climb.toLocaleString()} m`} label="Climbed" />
        </div>

        <div className="mt-8 flex gap-2">
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

        {error && <p className="mt-6 rounded-2xl border border-clay-600/30 bg-clay-100/40 p-4 text-sm text-clay-700">{error}</p>}
        {loading && !error && <p className="mt-6 text-sm text-ink-700/60">Loading your trips…</p>}

        {!loading && !error && grouped[tab].length === 0 && (
          <div className="mt-6 max-w-xl rounded-2xl border border-dashed border-ink-900/20 p-8 text-center">
            <p className="font-medium text-ink-900">
              {tab === "upcoming" ? "No upcoming trips" : tab === "past" ? "No past trips yet" : "Nothing in planning"}
            </p>
            <p className="mt-1 text-sm text-ink-700/70">Pick a trail, add gear to your order, and book it. It will show up here.</p>
            <Button to="/trails" className="mt-5">
              Find a trail
            </Button>
          </div>
        )}

        <div className="mt-6 grid gap-5 md:grid-cols-2">
          {grouped[tab].map((trip, i) => (
            <Reveal key={trip.id} delay={Math.min(i, 4) * 0.06}>
              <TripCard trip={trip} onChanged={refetch} />
            </Reveal>
          ))}
        </div>
      </div>
    </>
  );
}

function Stat({ icon, value, label }: { icon: React.ReactNode; value: string | number; label: string }) {
  return (
    <div className="rounded-2xl border border-ink-900/10 bg-parchment-100/60 p-4">
      <span className="text-forest-600">{icon}</span>
      <p className="mt-1 font-display text-2xl text-ink-900">{value}</p>
      <p className="text-xs text-ink-700/70">{label}</p>
    </div>
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
              <Link to={`/trails/${trip.trailSlug}?tab=gear`} className="text-forest-700 underline-offset-2 hover:underline">
                Book gear
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
