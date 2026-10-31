import { Link } from "react-router-dom";
import { Award, CalendarDays, Lock, Users } from "lucide-react";
import clsx from "clsx";
import Button from "../ui/Button";
import BookingCard from "./BookingCard";
import { badgesFor, countdownLabel, nextTrip, type ProfileStats } from "../../lib/profile";
import { trailPhoto } from "../../lib/photos";
import { formatDate } from "../../lib/trips";
import type { Booking, RecentReview, Trip } from "../../types";

interface Props {
  trips: Trip[];
  bookings: Booking[];
  reviews: RecentReview[];
  stats: ProfileStats;
  totalTrails: number;
  onGo: (tab: string) => void;
}

export default function OverviewTab({ trips, bookings, reviews, stats, totalTrails, onGo }: Props) {
  const next = nextTrip(trips);
  const recent = bookings.slice(0, 2);
  const badges = badgesFor(trips, bookings, reviews);
  const earned = badges.filter((b) => b.earned).length;
  const percent = totalTrails ? Math.min(100, Math.round((stats.trails / totalTrails) * 100)) : 0;

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
      <div className="space-y-8">
        <section>
          <h2 className="font-display text-xl text-ink-900">Your next trip</h2>
          {next ? (
            <div className="mt-3 overflow-hidden rounded-3xl border border-ink-900/10 bg-parchment-100/60">
              <div className="relative h-36">
                <img src={trailPhoto(next.trailSlug, 900)} alt="" className="h-full w-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-pine-950/70 to-transparent" />
                <span className="absolute left-4 top-4 rounded-full bg-parchment-50/95 px-3 py-1 text-xs font-medium text-forest-700">{countdownLabel(next)}</span>
                <p className="absolute bottom-3 left-4 right-4 font-display text-2xl text-white">{next.trailName}</p>
              </div>
              <div className="p-5">
                <p className="flex items-center gap-1.5 text-sm text-ink-700">
                  <CalendarDays size={14} className="text-forest-600" />
                  {next.startDate === next.endDate ? formatDate(next.startDate) : `${formatDate(next.startDate)} – ${formatDate(next.endDate)}`}
                </p>
                <p className="mt-1 flex items-center gap-1.5 text-sm text-ink-700">
                  <Users size={14} className="text-forest-600" />
                  {next.hikers} {next.hikers === 1 ? "hiker" : "hikers"}
                </p>
                <div className="mt-4 flex flex-wrap gap-3">
                  {next.booking ? (
                    <>
                      <Button size="sm" to={`/bookings/${next.booking.id}`}>
                        View booking {next.booking.reference}
                      </Button>
                      <Button size="sm" variant="secondary" to={`/bookings/${next.booking.id}/voucher`}>
                        Open voucher
                      </Button>
                    </>
                  ) : (
                    <Button size="sm" to={`/rentals?trail=${next.trailSlug}`}>
                      Plan my gear
                    </Button>
                  )}
                  <Button size="sm" variant="secondary" to={`/trails/${next.trailSlug}?tab=weather`}>
                    Check the weather
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="mt-3 rounded-2xl border border-dashed border-ink-900/20 p-8 text-center">
              <p className="font-medium text-ink-900">No trip planned yet</p>
              <p className="mt-1 text-sm text-ink-700/70">Pick a trail and build your gear kit. Your next trip will show up here with a countdown.</p>
              <Button to="/trails" className="mt-4">
                Find a trail
              </Button>
            </div>
          )}
        </section>

        <section>
          <div className="flex items-center justify-between">
            <h2 className="font-display text-xl text-ink-900">Recent bookings</h2>
            {bookings.length > 0 && (
              <button onClick={() => onGo("bookings")} className="text-sm font-medium text-forest-700 hover:underline">
                See all ({bookings.length})
              </button>
            )}
          </div>
          {recent.length === 0 ? (
            <p className="mt-3 text-sm text-ink-700/70">
              No gear bookings yet. <Link to="/rentals" className="font-medium text-forest-700 hover:underline">Plan your gear</Link>
            </p>
          ) : (
            <div className="mt-3 space-y-4">
              {recent.map((b) => (
                <BookingCard key={b.id} b={b} />
              ))}
            </div>
          )}
        </section>
      </div>

      <div className="space-y-8">
        <section>
          <h2 className="font-display text-xl text-ink-900">Your progress</h2>
          <div className="mt-3 rounded-2xl border border-ink-900/10 bg-parchment-100/60 p-5">
            <div className="flex items-end justify-between">
              <p className="font-display text-3xl text-ink-900">
                {stats.trails}
                <span className="text-lg text-ink-700/60"> of {totalTrails} trails</span>
              </p>
              <p className="text-sm text-ink-700/70">{percent}%</p>
            </div>
            <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-ink-900/10" role="progressbar" aria-valuenow={percent} aria-valuemin={0} aria-valuemax={100} aria-label="Trails completed">
              <div className="h-full rounded-full bg-forest-600 transition-[width] duration-700 ease-smooth" style={{ width: `${percent}%` }} />
            </div>
            <p className="mt-2 text-xs text-ink-700/60">Only finished trips count, so a planned trip never raises your total.</p>
          </div>
        </section>

        <section>
          <div className="flex items-center justify-between">
            <h2 className="font-display text-xl text-ink-900">Badges</h2>
            <p className="text-sm text-ink-700/70">
              {earned} of {badges.length} earned
            </p>
          </div>
          <ul className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
            {badges.map((b) => (
              <li
                key={b.id}
                className={clsx("flex items-center gap-3 rounded-2xl border p-3.5", b.earned ? "border-gold-500/40 bg-gold-100/60" : "border-ink-900/10 bg-parchment-100/40")}
              >
                <span className={clsx("flex h-10 w-10 shrink-0 items-center justify-center rounded-full", b.earned ? "bg-gold-500 text-white" : "bg-ink-900/8 text-ink-700/40")}>
                  {b.earned ? <Award size={18} /> : <Lock size={15} />}
                </span>
                <div className="min-w-0">
                  <p className={clsx("text-sm font-medium", b.earned ? "text-ink-900" : "text-ink-700")}>{b.title}</p>
                  <p className="text-xs text-ink-700/60">
                    {b.earned ? "Earned" : b.hint}
                    {!b.earned && b.progress ? ` · ${b.progress}` : ""}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}
