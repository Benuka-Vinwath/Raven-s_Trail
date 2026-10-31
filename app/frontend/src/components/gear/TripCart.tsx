import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Minus, Plus, X } from "lucide-react";
import Button from "../ui/Button";
import { useAuth } from "../../context/AuthContext";
import { ApiError, cartApi } from "../../lib/api";
import type { useTripCart } from "../../hooks/useTripCart";
import type { Trail } from "../../types";

const INPUT =
  "w-full rounded-xl border border-ink-900/15 bg-parchment-50 px-2.5 py-2 text-sm text-ink-900 outline-none transition-colors duration-200 ease-smooth focus:border-forest-500";

const todayLocal = () => new Date().toLocaleDateString("en-CA"); // YYYY-MM-DD

export default function TripCart({ trail, cart }: { trail: Trail; cart: ReturnType<typeof useTripCart> }) {
  const { token, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [hikers, setHikers] = useState(2);
  // the shops phone or message this number about pickup; remembered for next time
  const [phone, setPhone] = useState(() => {
    try {
      return localStorage.getItem("ravenstrail_phone") ?? "";
    } catch {
      return "";
    }
  });
  // fall back to the profile number when nothing was remembered from a previous checkout
  const shownPhone = phone || user?.phone || "";
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const { cartItems, days, perDay, total } = cart;

  async function checkout() {
    setError(null);
    if (!token) {
      navigate("/login", { state: { from: location.pathname + location.search } });
      return;
    }
    if (!days) {
      setError("Choose your start and end dates first.");
      return;
    }
    if (shownPhone.split("").filter((ch) => ch >= "0" && ch <= "9").length < 9) {
      setError("Add a phone number the shops can reach about pickup.");
      return;
    }
    setBusy(true);
    try {
      await cart.save();
      const booking = await cartApi.checkout(trail.slug, hikers, shownPhone.trim(), token);
      try {
        localStorage.setItem("ravenstrail_phone", shownPhone.trim());
      } catch {
        /* private mode: just won't be remembered */
      }
      cart.clear();
      navigate(`/bookings/${booking.id}`);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong. Try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div id="gear-order" className="border border-ink-900/10 rounded-2xl p-5 h-fit lg:sticky lg:top-24">
      <h2 className="font-medium text-ink-900">Your gear order</h2>
      <p className="mt-1 text-xs text-ink-700/60">One order, even if the gear comes from several shops.</p>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <label className="block text-xs text-ink-700">
          From
          <input
            type="date"
            min={todayLocal()}
            value={cart.cart.startDate ?? ""}
            onChange={(e) => {
              const start = e.target.value || null;
              // keep the end date valid when the start moves past it
              const end = start && cart.cart.endDate && cart.cart.endDate < start ? start : cart.cart.endDate;
              cart.setDates(start, end);
            }}
            className={`mt-1 ${INPUT}`}
          />
        </label>
        <label className="block text-xs text-ink-700">
          To
          <input
            type="date"
            min={cart.cart.startDate ?? todayLocal()}
            value={cart.cart.endDate ?? ""}
            onChange={(e) => cart.setDates(cart.cart.startDate, e.target.value || null)}
            className={`mt-1 ${INPUT}`}
          />
        </label>
      </div>
      <p className="mt-2 text-xs text-ink-700/60">{days ? `${days} ${days === 1 ? "day" : "days"} of rental` : "Pick dates to see your total."}</p>

      {cartItems.length === 0 ? (
        <p className="mt-5 text-sm text-ink-700/60">Add gear from the list to start your order.</p>
      ) : (
        <ul className="mt-5 space-y-3">
          {cartItems.map(({ item, quantity }) => (
            <li key={item.id} className="text-sm">
              <div className="flex items-start justify-between gap-2">
                <span className="text-ink-900">{item.name}</span>
                <button onClick={() => cart.remove(item.id)} aria-label={`Remove ${item.name}`} className="shrink-0 text-ink-700/50 hover:text-clay-600">
                  <X size={14} />
                </button>
              </div>
              <div className="mt-1 flex items-center justify-between text-xs text-ink-700/70">
                <div className="flex items-center gap-1.5">
                  <button onClick={() => cart.setQuantity(item.id, quantity - 1)} aria-label="Fewer" className="rounded-full border border-ink-900/15 p-1 hover:border-forest-500">
                    <Minus size={11} />
                  </button>
                  <span className="w-5 text-center text-ink-900">{quantity}</span>
                  <button onClick={() => cart.setQuantity(item.id, quantity + 1)} aria-label="More" className="rounded-full border border-ink-900/15 p-1 hover:border-forest-500">
                    <Plus size={11} />
                  </button>
                </div>
                <span>LKR {(item.pricePerDay * quantity).toLocaleString()}/day</span>
              </div>
            </li>
          ))}
        </ul>
      )}

      {cartItems.length > 0 && (
        <div className="mt-5 space-y-3 border-t border-ink-900/10 pt-4">
          <div className="flex items-center justify-between text-xs text-ink-700/70">
            <span>Per day</span>
            <span>LKR {perDay.toLocaleString()}</span>
          </div>
          <div className="flex items-center justify-between font-medium text-ink-900">
            <span>Total</span>
            <span>{days ? `LKR ${total.toLocaleString()}` : "—"}</span>
          </div>
          <label className="flex items-center justify-between gap-3 text-xs text-ink-700">
            Hikers
            <input type="number" min={1} max={50} value={hikers} onChange={(e) => setHikers(Math.max(1, Number(e.target.value)))} className={`w-16 text-center ${INPUT}`} />
          </label>
          <label className="block text-xs text-ink-700">
            Your phone number
            <input
              type="tel"
              autoComplete="tel"
              placeholder="e.g. 077 123 4567"
              maxLength={20}
              value={shownPhone}
              onChange={(e) => setPhone(e.target.value)}
              className={`mt-1 ${INPUT}`}
            />
            <span className="mt-1 block text-ink-700/50">So the shops can reach you about pickup.</span>
          </label>
          {error && <p className="rounded-xl border border-clay-600/30 bg-clay-100/40 p-2.5 text-xs text-clay-700">{error}</p>}
          <Button onClick={checkout} disabled={busy} className="w-full">
            {busy ? "Booking…" : token ? "Book this gear" : "Sign in to book"}
          </Button>
          <p className="text-xs leading-relaxed text-ink-700/60">
            You pay the shops directly when you collect. Contact each shop to arrange pickup — details are on your booking.
          </p>
        </div>
      )}
    </div>
  );
}
