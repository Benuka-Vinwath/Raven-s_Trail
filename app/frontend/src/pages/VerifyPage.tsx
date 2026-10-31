import { useParams, useSearchParams } from "react-router-dom";
import { AlertTriangle, BadgeCheck, CircleSlash, PackageCheck, Undo2 } from "lucide-react";
import clsx from "clsx";
import RavenMark from "../components/icons/RavenMark";
import { useFetch } from "../hooks/useFetch";
import { verifyApi } from "../lib/api";
import { formatDate } from "../lib/trips";
import type { VoucherCheck } from "../types";

// Public page a shop owner lands on after scanning a customer's QR code. No login, built for a phone held at a counter:
// one big colour-coded answer first, details below.
function verdict(v: VoucherCheck) {
  if (v.stage === "cancelled") {
    return { tone: "bg-red-600", icon: <CircleSlash size={34} />, title: "CANCELLED", text: "Do not hand over any gear. The customer cancelled this booking." };
  }
  if (v.stage === "returned") {
    return { tone: "bg-slate-600", icon: <Undo2 size={34} />, title: "COMPLETED", text: "The gear on this booking has already been returned." };
  }
  if (v.stage === "collected") {
    return { tone: "bg-amber-600", icon: <PackageCheck size={34} />, title: "ALREADY COLLECTED", text: "The customer has marked this gear as collected. Check before handing anything over again." };
  }
  if (v.expired) {
    return { tone: "bg-amber-600", icon: <AlertTriangle size={34} />, title: "DATES HAVE PASSED", text: "This booking was never collected and its dates are over. Confirm with the customer." };
  }
  if (v.notStartedYet) {
    return { tone: "bg-emerald-600", icon: <BadgeCheck size={34} />, title: "VALID", text: `A real booking, but the rental starts on ${formatDate(v.startDate)}.` };
  }
  return { tone: "bg-emerald-600", icon: <BadgeCheck size={34} />, title: "VALID", text: "A confirmed booking, ready to hand over." };
}

export default function VerifyPage() {
  const { token } = useParams();
  const [params] = useSearchParams();
  const { data, loading, error } = useFetch(() => verifyApi.get(token!, params.get("shop"), params.get("s")), [token, params.get("shop"), params.get("s")]);

  return (
    <div className="min-h-screen bg-parchment-50 pb-10">
      <header className="flex items-center gap-2 px-5 py-4 text-ink-900">
        <span className="text-forest-600">
          <RavenMark className="h-6 w-6" />
        </span>
        <span className="font-display text-lg">Raven's Trail</span>
        <span className="ml-auto text-xs text-ink-700/60">Booking check</span>
      </header>

      <main className="mx-auto max-w-md px-4">
        {loading && <p className="mt-10 text-center text-sm text-ink-700/60">Checking this voucher…</p>}

        {error && !loading && (
          <div className="mt-6 rounded-3xl bg-red-600 p-6 text-white">
            <CircleSlash size={34} />
            <p className="mt-3 font-display text-3xl">NOT VALID</p>
            <p className="mt-1 text-sm text-white/90">{error}. Don't hand over any gear on this voucher.</p>
          </div>
        )}

        {data && (
          <>
            {(() => {
              const v = verdict(data);
              return (
                <div className={clsx("mt-2 rounded-3xl p-6 text-white", v.tone)}>
                  {v.icon}
                  <p className="mt-3 font-display text-3xl">{v.title}</p>
                  <p className="mt-1 text-sm text-white/90">{v.text}</p>
                </div>
              );
            })()}

            <div className="mt-5 rounded-3xl border border-ink-900/10 bg-white p-5">
              <p className="text-xs uppercase tracking-wide text-ink-700/50">Reference</p>
              <p className="font-display text-2xl tracking-wider text-ink-900">{data.reference}</p>

              <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
                <div>
                  <dt className="text-xs text-ink-700/50">Customer</dt>
                  <dd className="text-ink-900">{data.customerFirstName}</dd>
                </div>
                <div>
                  <dt className="text-xs text-ink-700/50">Phone ends in</dt>
                  <dd className="text-ink-900">{data.phoneEnding ? `••• ${data.phoneEnding}` : "—"}</dd>
                </div>
                <div>
                  <dt className="text-xs text-ink-700/50">Trail</dt>
                  <dd className="text-ink-900">{data.trailName}</dd>
                </div>
                <div>
                  <dt className="text-xs text-ink-700/50">Rental</dt>
                  <dd className="text-ink-900">
                    {formatDate(data.startDate)} to {formatDate(data.endDate)} ({data.days} {data.days === 1 ? "day" : "days"})
                  </dd>
                </div>
              </dl>
            </div>

            <div className="mt-5 rounded-3xl border border-ink-900/10 bg-white p-5">
              <p className="font-medium text-ink-900">{data.scope === "shop" ? `Items from ${data.shopName}` : "All items on this booking"}</p>
              <ul className="mt-3 divide-y divide-ink-900/10 text-sm">
                {data.items.map((i, n) => (
                  <li key={n} className="flex items-start justify-between gap-3 py-2.5">
                    <span className="text-ink-900">
                      {i.quantity} × {i.itemName}
                      {data.scope === "all" && <span className="block text-xs text-ink-700/50">{i.shopName}</span>}
                    </span>
                    <span className="shrink-0 text-ink-700">LKR {i.lineTotal.toLocaleString()}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-3 flex items-center justify-between border-t border-ink-900/10 pt-3">
                <span className="font-medium text-ink-900">To pay at pickup</span>
                <span className="font-display text-xl text-ink-900">LKR {data.total.toLocaleString()}</span>
              </div>
              <p className="mt-2 text-xs text-ink-700/50">Payment is made to the shop. Ask to see the customer's ID.</p>
            </div>

            {(data.pickedUpAt || data.returnedAt) && (
              <p className="mt-4 text-center text-xs text-ink-700/60">
                {data.pickedUpAt && `Marked collected ${new Date(data.pickedUpAt).toLocaleString()}`}
                {data.returnedAt && ` · returned ${new Date(data.returnedAt).toLocaleString()}`}
              </p>
            )}
          </>
        )}
      </main>
    </div>
  );
}
