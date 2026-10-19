import { useState } from "react";
import { Star } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import clsx from "clsx";
import { useTrails } from "../hooks/useTrails";
import { useRecentReviews } from "../hooks/useReviews";
import { useAuth } from "../context/AuthContext";
import { reviewsApi, ApiError } from "../lib/api";
import Button from "../components/ui/Button";

export default function Community() {
  const { user, token } = useAuth();
  const { data: trails } = useTrails();
  const { data: reviews, loading: reviewsLoading, error: reviewsError, refetch } = useRecentReviews(30);

  const [trailSlug, setTrailSlug] = useState<string | null>(null);
  const [rating, setRating] = useState(5);
  const [text, setText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const selectedSlug = trailSlug ?? trails?.[0]?.slug ?? "";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!token || !selectedSlug || !text.trim()) return;
    setSubmitting(true);
    setSubmitError(null);
    try {
      await reviewsApi.create(selectedSlug, { rating, text: text.trim(), tags: [] }, token);
      setText("");
      setRating(5);
      setSubmitted(true);
      refetch();
      setTimeout(() => setSubmitted(false), 3000);
    } catch (err) {
      setSubmitError(err instanceof ApiError ? err.message : "Couldn't post your report. Try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="max-w-5xl mx-auto px-5 py-12">
      <p className="text-clay-600 font-medium text-sm mb-2">Community</p>
      <h1 className="font-display text-4xl text-ink-900">Trip reports from hikers on the ground</h1>
      <p className="mt-3 text-ink-700/80 leading-relaxed max-w-2xl">
        Real condition notes — trail state, crowd levels, what to bring — shared by hikers after their trip.
      </p>

      <div className="mt-12 grid lg:grid-cols-[1fr_20rem] gap-10">
        <div className="space-y-5">
          {reviewsError && (
            <div className="border border-clay-600/30 bg-clay-100/40 text-clay-700 rounded p-4 text-sm">
              {reviewsError}
            </div>
          )}
          {reviewsLoading && !reviewsError && <p className="text-sm text-ink-700/60">Loading trip reports…</p>}
          {!reviewsLoading && !reviewsError && reviews?.length === 0 && (
            <p className="text-sm text-ink-700/60">No trip reports yet — be the first to share one.</p>
          )}

          <AnimatePresence initial={false}>
            {reviews?.map((r) => (
              <motion.div
                key={r.id}
                layout
                initial={{ opacity: 0, y: -12, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                className="border border-ink-900/10 rounded p-6 hover:border-forest-500/40 hover:shadow-elevate transition-[border-color,box-shadow] duration-300 ease-smooth"
              >
                <div className="flex items-start justify-between gap-3 flex-wrap">
                  <div>
                    <p className="font-medium text-ink-900">{r.author}</p>
                    <p className="text-xs text-ink-700/60">
                      {r.trailName} · {r.date}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 text-sm text-ink-700">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} size={13} className={i < r.rating ? "fill-gold-500 text-gold-500" : "text-ink-900/15"} />
                    ))}
                  </div>
                </div>
                <p className="mt-3 text-sm text-ink-700/85 leading-relaxed">{r.text}</p>
                {r.tags.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {r.tags.map((tag) => (
                      <span key={tag} className="text-xs px-2.5 py-1 rounded-full bg-forest-600/10 text-forest-700 font-medium">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        <aside className="border border-ink-900/10 rounded p-6 h-fit sticky top-24">
          <h2 className="font-medium text-ink-900">Share your trip report</h2>

          {!user ? (
            <div className="mt-4">
              <p className="text-sm text-ink-700/70">Sign in to post a trip report under your own name.</p>
              <Button to="/login" size="sm" className="mt-4 w-full">
                Sign in
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="mt-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-ink-900 mb-1.5">Trail</label>
                <select
                  value={selectedSlug}
                  onChange={(e) => setTrailSlug(e.target.value)}
                  className="w-full rounded border border-ink-900/15 bg-parchment-50 px-3 py-2 text-sm text-ink-900 outline-none transition-colors duration-200 ease-smooth focus:border-forest-500"
                >
                  {(trails ?? []).map((t) => (
                    <option key={t.id} value={t.slug}>
                      {t.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-ink-900 mb-1.5">Rating</label>
                <div className="flex gap-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <motion.button
                      type="button"
                      key={i}
                      onClick={() => setRating(i + 1)}
                      aria-label={`Rate ${i + 1} stars`}
                      whileHover={{ scale: 1.25 }}
                      whileTap={{ scale: 0.9 }}
                      transition={{ type: "spring", stiffness: 500, damping: 20 }}
                    >
                      <Star
                        size={20}
                        className={clsx(
                          "transition-colors duration-150",
                          i < rating ? "fill-gold-500 text-gold-500" : "text-ink-900/15"
                        )}
                      />
                    </motion.button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-ink-900 mb-1.5">Report</label>
                <textarea
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  required
                  rows={4}
                  placeholder="Trail conditions, crowd levels, what to bring…"
                  className="w-full rounded border border-ink-900/15 bg-parchment-50 px-3 py-2 text-sm text-ink-900 outline-none transition-colors duration-200 ease-smooth focus:border-forest-500 resize-none"
                />
              </div>

              {submitError && (
                <p className="text-sm text-clay-700 bg-clay-100 border border-clay-600/30 rounded px-3 py-2">
                  {submitError}
                </p>
              )}

              <Button type="submit" size="sm" className="w-full" disabled={submitting}>
                {submitting ? "Posting…" : "Post report"}
              </Button>
              <AnimatePresence>
                {submitted && (
                  <motion.p
                    initial={{ opacity: 0, height: 0, y: -4 }}
                    animate={{ opacity: 1, height: "auto", y: 0 }}
                    exit={{ opacity: 0, height: 0, y: -4 }}
                    transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                    className="text-sm text-forest-700 text-center overflow-hidden"
                  >
                    Thanks — your report is live.
                  </motion.p>
                )}
              </AnimatePresence>
            </form>
          )}
        </aside>
      </div>
    </div>
  );
}
