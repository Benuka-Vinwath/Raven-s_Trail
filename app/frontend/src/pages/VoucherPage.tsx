import { Link, Navigate, useParams } from "react-router-dom";
import { ArrowLeft, Printer } from "lucide-react";
import RavenMark from "../components/icons/RavenMark";
import Button from "../components/ui/Button";
import QrCode from "../components/ui/QrCode";
import { useAuth } from "../context/AuthContext";
import { useFetch } from "../hooks/useFetch";
import { bookingsApi } from "../lib/api";
import { formatDate } from "../lib/trips";
import { masterVoucherUrl, shopVoucherUrl } from "../lib/voucher";
import type { Booking } from "../types";

// The printable proof of booking. "Save as PDF" in the browser's print dialog gives the PDF; the navbar, footer and chat
// are hidden when printing, and each shop's voucher starts on its own page so it can be shown or handed over on its own.
function Header({ b, title }: { b: Booking; title: string }) {
  return (
    <div className="flex items-center justify-between border-b border-ink-900/15 pb-4">
      <div className="flex items-center gap-2 text-ink-900">
        <span className="text-forest-600">
          <RavenMark className="h-7 w-7" />
        </span>
        <div>
          <p className="font-display text-xl leading-none">Raven's Trail</p>
          <p className="text-xs text-ink-700/60">{title}</p>
        </div>
      </div>
      <p className="font-display text-2xl tracking-wider text-ink-900">{b.reference}</p>
    </div>
  );
}

function Facts({ b }: { b: Booking }) {
  const rows: [string, string][] = [
    ["Name", b.customerName],
    ["Phone", b.customerPhone ?? "—"],
    ["Trail", b.trailName],
    ["Rental dates", `${formatDate(b.startDate)} to ${formatDate(b.endDate)} (${b.days} ${b.days === 1 ? "day" : "days"})`],
  ];
  return (
    <dl className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
      {rows.map(([k, v]) => (
        <div key={k}>
          <dt className="text-xs text-ink-700/50">{k}</dt>
          <dd className="text-ink-900">{v}</dd>
        </div>
      ))}
    </dl>
  );
}

export default function VoucherPage() {
  const { id } = useParams();
  const { user, token, loading: authLoading } = useAuth();
  const { data: b, loading, error } = useFetch(() => bookingsApi.get(id!, token!), [id, token]);

  if (authLoading) return null;
  if (!user) return <Navigate to="/login" state={{ from: `/bookings/${id}/voucher` }} replace />;

  return (
    <div className="mx-auto max-w-3xl px-5 pb-16 pt-24 print:max-w-none print:p-0">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 print:hidden">
        <Link to={`/bookings/${id}`} className="inline-flex items-center gap-1.5 text-sm text-ink-700 hover:text-forest-700">
          <ArrowLeft size={15} /> Back to booking
        </Link>
        <Button onClick={() => window.print()}>
          <Printer size={15} /> Download or print PDF
        </Button>
      </div>
      <p className="mb-6 text-sm text-ink-700/70 print:hidden">
        In the print window, choose <strong>Save as PDF</strong> as the destination. The first page is your booking summary. Each shop then has its own page with its own QR code.
      </p>

      {loading && <p className="text-sm text-ink-700/60">Loading your voucher…</p>}
      {error && <p className="rounded-2xl border border-clay-600/30 bg-clay-100/40 p-4 text-sm text-clay-700">{error}</p>}

      {b && (
        <div className="space-y-8 print:space-y-0">
          {b.status === "cancelled" && (
            <p className="rounded-2xl border border-clay-600/30 bg-clay-100/40 p-4 text-sm text-clay-700 print:hidden">
              This booking is cancelled. Its QR codes now show "CANCELLED" to shops.
            </p>
          )}

          {/* page 1: the whole booking */}
          <section className="rounded-3xl border border-ink-900/10 bg-white p-8 print:break-after-page print:rounded-none print:border-0 print:p-0">
            <Header b={b} title="Gear booking voucher" />
            <div className="mt-6 flex items-start justify-between gap-6">
              <div className="min-w-0 flex-1">
                <Facts b={b} />
              </div>
              <div className="shrink-0 text-center">
                <QrCode value={masterVoucherUrl(b)} size={150} alt={`QR code for booking ${b.reference}`} />
                <p className="mt-1 text-xs text-ink-700/60">Scan to check this booking</p>
              </div>
            </div>

            <h3 className="mt-8 font-medium text-ink-900">What you booked</h3>
            <div className="mt-3 space-y-4">
              {b.shops.map((s) => (
                <div key={s.name} className="rounded-2xl border border-ink-900/10 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-medium text-ink-900">{s.name}</p>
                      <p className="text-xs text-ink-700/60">{[s.address, s.phone].filter(Boolean).join(" · ")}</p>
                    </div>
                    <p className="shrink-0 font-medium text-ink-900">LKR {s.subtotal.toLocaleString()}</p>
                  </div>
                  <ul className="mt-2 text-sm text-ink-700">
                    {b.items.filter((i) => i.shopName === s.name).map((i, n) => (
                      <li key={n}>
                        {i.quantity} × {i.itemName}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            <div className="mt-6 flex items-center justify-between rounded-2xl bg-forest-600/8 p-4">
              <span className="font-medium text-ink-900">Total to pay the shops</span>
              <span className="font-display text-2xl text-ink-900">LKR {b.totalLkr.toLocaleString()}</span>
            </div>

            <ul className="mt-6 list-disc space-y-1 pl-5 text-xs text-ink-700/70">
              <li>Payment is made to each shop when you collect. Nothing is paid on this website.</li>
              <li>Bring your ID (NIC or passport). Shops may ask for a deposit; confirm it when you collect.</li>
              <li>The QR code opens a live check of this booking. A cancelled or already-collected booking shows that to the shop.</li>
              <li>Issued {new Date(b.createdAt).toLocaleString()}.</li>
            </ul>
          </section>

          {/* one page per shop */}
          {b.shops.map((s, n) => (
            <section
              key={s.name}
              className={`rounded-3xl border border-ink-900/10 bg-white p-8 print:rounded-none print:border-0 print:p-0 ${n < b.shops.length - 1 ? "print:break-after-page" : ""}`}
            >
              <Header b={b} title={`Voucher for ${s.name}`} />
              <div className="mt-6 flex items-start justify-between gap-6">
                <div className="min-w-0 flex-1">
                  <p className="font-display text-2xl text-ink-900">{s.name}</p>
                  <p className="mt-1 text-sm text-ink-700">{s.address ?? ""}</p>
                  <p className="text-sm text-ink-700">{s.phone ?? ""}</p>
                  <div className="mt-5">
                    <Facts b={b} />
                  </div>
                </div>
                <div className="shrink-0 text-center">
                  <QrCode value={shopVoucherUrl(b, s)} size={170} alt={`QR code for ${s.name}`} />
                  <p className="mt-1 max-w-[11rem] text-xs text-ink-700/60">Show this to {s.name} when you collect</p>
                </div>
              </div>

              <table className="mt-8 w-full text-sm">
                <thead>
                  <tr className="border-b border-ink-900/15 text-left text-xs text-ink-700/60">
                    <th className="pb-2 font-normal">Item</th>
                    <th className="pb-2 text-right font-normal">Qty</th>
                    <th className="pb-2 text-right font-normal">Per day</th>
                    <th className="pb-2 text-right font-normal">{b.days} {b.days === 1 ? "day" : "days"}</th>
                  </tr>
                </thead>
                <tbody>
                  {b.items.filter((i) => i.shopName === s.name).map((i, k) => (
                    <tr key={k} className="border-b border-ink-900/10">
                      <td className="py-2 text-ink-900">{i.itemName}</td>
                      <td className="py-2 text-right text-ink-700">{i.quantity}</td>
                      <td className="py-2 text-right text-ink-700">LKR {i.unitPrice.toLocaleString()}</td>
                      <td className="py-2 text-right text-ink-900">LKR {i.lineTotal.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="mt-4 flex items-center justify-between">
                <span className="font-medium text-ink-900">To pay {s.name}</span>
                <span className="font-display text-2xl text-ink-900">LKR {s.subtotal.toLocaleString()}</span>
              </div>
              <p className="mt-6 text-xs text-ink-700/60">
                Reference {b.reference}. Pay the shop at pickup, and bring your ID. Scanning the QR code shows the shop this booking's live status.
              </p>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
