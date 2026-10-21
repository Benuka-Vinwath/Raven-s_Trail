import { useState } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import { ArrowLeft, Phone } from "lucide-react";
import clsx from "clsx";
import PageHero from "../components/layout/PageHero";
import Button from "../components/ui/Button";
import { useAuth } from "../context/AuthContext";
import { useFetch } from "../hooks/useFetch";
import { ApiError, bookingsApi } from "../lib/api";
import { formatDate, PHASE_STYLE } from "../lib/trips";
import type { Booking } from "../types";

export default function BookingDetail() {
  const { id } = useParams();
  const { user, token, loading: authLoading } = useAuth();
  const { data, loading, error, refetch } = useFetch(() => bookingsApi.get(id!, token!), [id, token]);
  const [cancelError, setCancelError] = useState<string | null>(null);
  const [cancelling, setCancelling] = useState(false);

  if (authLoading) return null;
  if (!user) return <Navigate to="/login" state={{ from: `/bookings/${id}` }} replace />;

  async function cancel() {
    if (!token || !window.confirm("Cancel this booking? This can't be undone.")) return;
    setCancelling(true);
    setCancelError(null);
    try {
      await bookingsApi.cancel(id!, token);
      refetch();
    } catch (err) {
      setCancelError(err instanceof ApiError ? err.message : "Couldn't cancel. Try again.");
    } finally {
      setCancelling(false);
    }
  }

  // one block per shop, since the customer has to deal with each shop separately for pickup
  const byShop = (b: Booking) => {
    const map = new Map<string, { phone: string | null; items: Booking["items"] }>();
    for (const item of b.items) {
      const entry = map.get(item.shopName) ?? { phone: item.shopPhone, items: [] };
      entry.items.push(item);
      map.set(item.shopName, entry);
    }
    return [...map.entries()];
  };

  const phase = data ? PHASE_STYLE[data.phase] : null;

  return (
    <>
      <PageHero page="profile" title="Your" dim="booking" blurb={data ? `Reference ${data.reference}` : "Gear booking details."} />
      <div className="mx-auto max-w-3xl px-5 pb-16">
        <Link to="/trips" className="inline-flex items-center gap-1.5 text-sm text-ink-700 hover:text-forest-700">
          <ArrowLeft size={15} /> All my trips
        </Link>

        {error && <p className="mt-6 rounded-2xl border border-clay-600/30 bg-clay-100/40 p-4 text-sm text-clay-700">{error}</p>}
        {loading && !error && <p className="mt-6 text-sm text-ink-700/60">Loading your booking…</p>}

        {data && phase && (
          <div className="mt-6 space-y-6">
            <div className="rounded-3xl border border-ink-900/10 bg-parchment-100/60 p-6">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <Link to={`/trails/${data.trailSlug}`} className="font-display text-2xl text-ink-900 hover:text-forest-700">
                    {data.trailName}
                  </Link>
                  <p className="mt-1 text-sm text-ink-700">
                    {formatDate(data.startDate)} – {formatDate(data.endDate)} · {data.days} {data.days === 1 ? "day" : "days"}
                  </p>
                </div>
                <span className={clsx("rounded-full px-3 py-1 text-xs font-medium", phase.className)}>{phase.label}</span>
              </div>
              <p className="mt-4 text-xs text-ink-700/60">
                Booked on {new Date(data.createdAt).toLocaleDateString()}
                {data.cancelledAt && ` · Cancelled on ${new Date(data.cancelledAt).toLocaleDateString()}`}
              </p>
            </div>

            {byShop(data).map(([shop, { phone, items }]) => (
              <div key={shop} className="rounded-2xl border border-ink-900/10 p-5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h2 className="font-medium text-ink-900">{shop}</h2>
                  {phone && (
                    <span className="flex items-center gap-1.5 text-sm text-ink-700">
                      <Phone size={13} className="text-forest-600" />
                      {phone}
                    </span>
                  )}
                </div>
                <ul className="mt-3 divide-y divide-ink-900/10 text-sm">
                  {items.map((i, n) => (
                    <li key={n} className="flex items-center justify-between py-2">
                      <span className="text-ink-700">
                        {i.quantity} × {i.itemName}
                        <span className="text-ink-700/50"> · LKR {i.unitPrice.toLocaleString()}/day</span>
                      </span>
                      <span className="text-ink-900">LKR {i.lineTotal.toLocaleString()}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}

            <div className="flex items-center justify-between rounded-2xl bg-forest-600/8 p-5">
              <span className="font-medium text-ink-900">Total</span>
              <span className="font-display text-2xl text-ink-900">LKR {data.totalLkr.toLocaleString()}</span>
            </div>
            <p className="text-sm text-ink-700/70">
              Payment isn't taken on this site. Call each shop to arrange pickup, and quote your reference <strong>{data.reference}</strong>.
            </p>

            {cancelError && <p className="text-sm text-clay-700">{cancelError}</p>}
            {data.phase === "upcoming" && (
              <Button variant="secondary" onClick={cancel} disabled={cancelling}>
                {cancelling ? "Cancelling…" : "Cancel booking"}
              </Button>
            )}
          </div>
        )}
      </div>
    </>
  );
}
