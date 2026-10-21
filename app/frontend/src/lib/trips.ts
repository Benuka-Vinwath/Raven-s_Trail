import type { TripPhase } from "../types";

export function formatDate(d: string | null) {
  if (!d) return "";
  const [y, m, day] = d.split("-").map(Number);
  return new Date(y, m - 1, day).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" });
}

export const PHASE_STYLE: Record<TripPhase, { label: string; className: string }> = {
  planning: { label: "No dates yet", className: "bg-ink-900/8 text-ink-700" },
  upcoming: { label: "Upcoming", className: "bg-forest-600/12 text-forest-700" },
  ongoing: { label: "Happening now", className: "bg-gold-100 text-clay-700" },
  past: { label: "Completed", className: "bg-ink-900/8 text-ink-700" },
  cancelled: { label: "Cancelled", className: "bg-clay-100/70 text-clay-700" },
};
