import type { Booking, RecentReview, Trip } from "../types";

export interface ProfileStats {
  trails: number; // different trails finished
  km: number;
  climb: number;
  bookings: number; // gear bookings that weren't cancelled
  reviews: number;
}

// Only hikes that are over count as "done", so a planned trip never inflates the numbers.
export function profileStats(trips: Trip[], bookings: Booking[], reviews: RecentReview[]): ProfileStats {
  const done = trips.filter((t) => t.phase === "past");
  return {
    trails: new Set(done.map((t) => t.trailSlug)).size,
    km: Math.round(done.reduce((sum, t) => sum + t.distanceKm, 0) * 10) / 10,
    climb: done.reduce((sum, t) => sum + t.elevationGainM, 0),
    bookings: bookings.filter((b) => b.status === "confirmed").length,
    reviews: reviews.length,
  };
}

export interface Badge {
  id: string;
  title: string;
  hint: string; // how to earn it
  earned: boolean;
  progress?: string;
}

export function badgesFor(trips: Trip[], bookings: Booking[], reviews: RecentReview[]): Badge[] {
  const s = profileStats(trips, bookings, reviews);
  const done = trips.filter((t) => t.phase === "past").map((t) => t.trailSlug);
  const climbTarget = 2000;
  return [
    { id: "first", title: "First steps", hint: "Finish your first trail", earned: s.trails >= 1, progress: `${Math.min(s.trails, 1)}/1` },
    { id: "regular", title: "Trail regular", hint: "Finish 5 different trails", earned: s.trails >= 5, progress: `${Math.min(s.trails, 5)}/5` },
    { id: "climber", title: "High climber", hint: `Climb ${climbTarget.toLocaleString()} m in total`, earned: s.climb >= climbTarget, progress: `${Math.min(s.climb, climbTarget).toLocaleString()}/${climbTarget.toLocaleString()} m` },
    { id: "night", title: "Night hiker", hint: "Finish Adam's Peak", earned: done.includes("adams-peak") },
    { id: "pekoe", title: "Pekoe Trail walker", hint: "Finish any Pekoe Trail stage", earned: done.some((slug) => slug.startsWith("pekoe-trail")) },
    { id: "geared", title: "Geared up", hint: "Rent gear and return it", earned: bookings.some((b) => b.returnedAt !== null) },
    { id: "story", title: "Storyteller", hint: "Write a trail review", earned: s.reviews >= 1 },
  ];
}

// the soonest trip that hasn't finished yet
export function nextTrip(trips: Trip[]): Trip | null {
  return (
    trips
      .filter((t) => (t.phase === "ongoing" || t.phase === "upcoming") && t.startDate)
      .sort((a, b) => a.startDate!.localeCompare(b.startDate!))[0] ?? null
  );
}

// whole days from today (local date) until a YYYY-MM-DD date; negative once it has started
export function daysUntil(date: string): number {
  const today = new Date().toLocaleDateString("en-CA");
  return Math.round((Date.parse(date) - Date.parse(today)) / 86_400_000);
}

export function countdownLabel(trip: Trip): string {
  if (trip.phase === "ongoing") return "Happening now";
  const d = daysUntil(trip.startDate!);
  if (d <= 0) return "Today";
  return d === 1 ? "Tomorrow" : `In ${d} days`;
}
