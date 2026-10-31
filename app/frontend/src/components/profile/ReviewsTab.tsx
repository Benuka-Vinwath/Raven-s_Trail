import { Link } from "react-router-dom";
import { Star } from "lucide-react";
import Button from "../ui/Button";
import type { RecentReview } from "../../types";

export default function ReviewsTab({ reviews, loading, error }: { reviews: RecentReview[]; loading: boolean; error: string | null }) {
  return (
    <section>
      {error && <p className="rounded-2xl border border-clay-600/30 bg-clay-100/40 p-4 text-sm text-clay-700">{error}</p>}
      {loading && !error && <p className="text-sm text-ink-700/60">Loading your reviews…</p>}

      {!loading && !error && reviews.length === 0 && (
        <div className="rounded-2xl border border-dashed border-ink-900/20 p-8 text-center">
          <p className="font-medium text-ink-900">You haven't reviewed a trail yet</p>
          <p className="mt-1 text-sm text-ink-700/70">Tell other hikers what it was like. It helps them choose, and earns you the Storyteller badge.</p>
          <Button to="/community" className="mt-4">
            Write a review
          </Button>
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        {reviews.map((r) => (
          <article key={r.id} className="rounded-2xl border border-ink-900/10 bg-parchment-100/50 p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <Link to={`/trails/${r.trailSlug}`} className="font-display text-lg leading-snug text-ink-900 hover:text-forest-700">
                  {r.trailName}
                </Link>
                <p className="text-xs text-ink-700/60">{r.date}</p>
              </div>
              <div className="flex shrink-0 items-center gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} size={14} className={i < r.rating ? "fill-gold-500 text-gold-500" : "text-ink-900/15"} />
                ))}
              </div>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-ink-700/85">{r.text}</p>
            {r.tags.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {r.tags.map((tag) => (
                  <span key={tag} className="rounded-full bg-forest-600/10 px-2.5 py-1 text-xs font-medium text-forest-700">
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </article>
        ))}
      </div>

      {reviews.length > 0 && (
        <Button to="/community" variant="secondary" className="mt-6">
          Write another review
        </Button>
      )}
    </section>
  );
}
