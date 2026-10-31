import { useState } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import { ArrowLeft, Check, FileText, MessageCircle, Phone } from "lucide-react";
import clsx from "clsx";
import PageHero from "../components/layout/PageHero";
import Button from "../components/ui/Button";
import QrCode from "../components/ui/QrCode";
import { useAuth } from "../context/AuthContext";
import { useFetch } from "../hooks/useFetch";
import { ApiError, bookingsApi } from "../lib/api";
import { formatDate, PHASE_STYLE } from "../lib/trips";
import { masterVoucherUrl, whatsappLink } from "../lib/voucher";
import type { Booking } from "../types";

function Step({ done, title, detail, children }: { done: boolean; title: string; detail?: string; children?: React.ReactNode }) {
  return (
    <li className="flex items-start gap-3">
      <span className={clsx("mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-xs", done ? "border-forest-600 bg-forest-600 text-white" : "border-ink-900/20 text-ink-700/40")}>
        {done ? <Check size={13} /> : null}
      </span>
      <div className="min-w-0 flex-1">
        <p className={clsx("text-sm font-medium", done ? "text-ink-900" : "text-ink-700")}>{title}</p>
        {detail && <p className="text-xs text-ink-700/60">{detail}</p>}
        {children}
      </div>
    </li>
  );
}

export default function BookingDetail() {
  const { id } = useParams();
  const { user, token, loading: authLoading } = useAuth();
  const { data, loading, error, refetch } = useFetch(() => bookingsApi.get(id!, token!), [id, token]);
  const [actionError, setActionError] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

  if (authLoading) return null;
  if (!user) return <Navigate to="/login" state={{ from: `/bookings/${id}` }} replace />;

  async function act(name: "cancel" | "collected" | "returned", confirmText?: string) {
    if (!token || (confirmText && !window.confirm(confirmText))) return;
    setBusy(name);
    setActionError(null);
    try {
      await bookingsApi[name](id!, token);
      refetch();
    } catch (err) {
      setActionError(err instanceof ApiError ? err.message : "That didn't work. Try again.");
    } finally {
      setBusy(null);
    }
  }

  const phase = data ? PHASE_STYLE[data.phase] : null;
  const itemsOf = (b: Booking, shop: string) => b.items.filter((i) => i.shopName === shop);
  const when = (d: string) => new Date(d).toLocaleString();

  return (
    <>
      <PageHero page="profile" title="Your" dim="booking" blurb={data ? `Reference ${data.reference}` : "Gear booking details."} />
      <div className="mx-auto max-w-3xl px-5 pb-16">
        <Link to="/profile" className="inline-flex items-center gap-1.5 text-sm text-ink-700 hover:text-forest-700">
          <ArrowLeft size={15} /> My profile
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
                  <p className="mt-0.5 text-xs text-ink-700/60">
                    {data.customerName}
                    {data.customerPhone ? ` · ${data.customerPhone}` : ""}
                  </p>
                </div>
                <span className={clsx("rounded-full px-3 py-1 text-xs font-medium", phase.className)}>{phase.label}</span>
              </div>
            </div>

            {/* proof of booking */}
            {data.status === "confirmed" && (
              <div className="flex flex-wrap items-center gap-6 rounded-3xl border border-forest-600/25 bg-forest-600/5 p-6">
                <QrCode value={masterVoucherUrl(data)} size={120} alt={`QR code for booking ${data.reference}`} />
                <div className="min-w-0 flex-1">
                  <h2 className="font-medium text-ink-900">Your proof of booking</h2>
                  <p className="mt-1 text-sm text-ink-700/80">
                    Show the shop this QR code or your voucher when you collect. They scan it and see a live check of your booking, so an edited or cancelled one is caught.
                  </p>
                  <Button to={`/bookings/${data.id}/voucher`} className="mt-4">
                    <FileText size={15} /> Open voucher (QR and PDF)
                  </Button>
                </div>
              </div>
            )}

            {/* what happens next */}
            {data.status === "confirmed" && (
              <div className="rounded-2xl border border-ink-900/10 p-5">
                <h2 className="font-medium text-ink-900">Progress</h2>
                <ol className="mt-4 space-y-4">
                  <Step done title="Booked" detail={when(data.createdAt)} />
                  <Step done={Boolean(data.pickedUpAt)} title="Gear collected" detail={data.pickedUpAt ? when(data.pickedUpAt) : "Mark this once the shops have handed everything over."}>
                    {!data.pickedUpAt && (
                      <Button size="sm" variant="secondary" className="mt-2" disabled={busy === "collected"} onClick={() => act("collected", "Mark all the gear as collected?")}>
                        {busy === "collected" ? "Saving…" : "I've collected my gear"}
                      </Button>
                    )}
                  </Step>
                  <Step done={Boolean(data.returnedAt)} title="Gear returned" detail={data.returnedAt ? when(data.returnedAt) : data.pickedUpAt ? "Mark this when it's back with the shops." : "Comes after collecting."}>
                    {data.pickedUpAt && !data.returnedAt && (
                      <Button size="sm" variant="secondary" className="mt-2" disabled={busy === "returned"} onClick={() => act("returned", "Mark all the gear as returned?")}>
                        {busy === "returned" ? "Saving…" : "I've returned it"}
                      </Button>
                    )}
                  </Step>
                </ol>
              </div>
            )}

            {data.shops.map((shop) => {
              const wa = whatsappLink(data, shop);
              return (
                <div key={shop.name} className="rounded-2xl border border-ink-900/10 p-5">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <h2 className="font-medium text-ink-900">{shop.name}</h2>
                      {shop.address && <p className="text-xs text-ink-700/60">{shop.address}</p>}
                    </div>
                    <p className="font-medium text-ink-900">LKR {shop.subtotal.toLocaleString()}</p>
                  </div>
                  <ul className="mt-3 divide-y divide-ink-900/10 text-sm">
                    {itemsOf(data, shop.name).map((i, n) => (
                      <li key={n} className="flex items-center justify-between py-2">
                        <span className="text-ink-700">
                          {i.quantity} × {i.itemName}
                          <span className="text-ink-700/50"> · LKR {i.unitPrice.toLocaleString()}/day</span>
                        </span>
                        <span className="text-ink-900">LKR {i.lineTotal.toLocaleString()}</span>
                      </li>
                    ))}
                  </ul>
                  {data.status === "confirmed" && (
                    <div className="mt-4 flex flex-wrap items-center gap-3">
                      {wa && (
                        <a href={wa} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 rounded-xl bg-forest-600 px-3.5 py-2 text-sm font-medium text-white transition-colors hover:bg-forest-700">
                          <MessageCircle size={15} /> Send this booking to the shop
                        </a>
                      )}
                      {shop.phone && (
                        <span className="flex items-center gap-1.5 text-sm text-ink-700">
                          <Phone size={13} className="text-forest-600" />
                          {shop.phone}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              );
            })}

            <div className="flex items-center justify-between rounded-2xl bg-forest-600/8 p-5">
              <span className="font-medium text-ink-900">Total</span>
              <span className="font-display text-2xl text-ink-900">LKR {data.totalLkr.toLocaleString()}</span>
            </div>
            <p className="text-sm text-ink-700/70">Payment isn't taken on this site. You pay each shop directly when you collect.</p>

            {data.cancelledAt && <p className="text-sm text-clay-700">Cancelled on {new Date(data.cancelledAt).toLocaleDateString()}.</p>}
            {actionError && <p className="text-sm text-clay-700">{actionError}</p>}
            {data.phase === "upcoming" && (
              <Button variant="secondary" onClick={() => act("cancel", "Cancel this booking? This can't be undone.")} disabled={busy === "cancel"}>
                {busy === "cancel" ? "Cancelling…" : "Cancel booking"}
              </Button>
            )}
          </div>
        )}
      </div>
    </>
  );
}
