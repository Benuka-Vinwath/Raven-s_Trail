import { useMemo, useState, type ReactNode } from "react";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useParkingSpots } from "../../hooks/useParkingSpots";
import { ApiError, budgetApi, type BudgetPlan } from "../../lib/api";
import Button from "../ui/Button";
import type { Trail } from "../../types";

// Rates are multiples of the trail's own "from Colombo by bus" price.
const TRANSPORT_OPTIONS = [
  { id: "bus", label: "Public bus", multiplier: 1 },
  { id: "train", label: "Train", multiplier: 1.4 },
  { id: "van", label: "Private van (shared)", multiplier: 3 },
  { id: "own", label: "Own vehicle (fuel share)", multiplier: 2.2 },
] as const;

const STYLES = {
  budget: { label: "Budget", blurb: "Simple meals, basic stay", foodPerDay: 1000, stayMultiplier: 0.6 },
  standard: { label: "Standard", blurb: "Restaurants, guesthouse", foodPerDay: 1500, stayMultiplier: 1 },
  comfortable: { label: "Comfortable", blurb: "Nicer food and rooms", foodPerDay: 2500, stayMultiplier: 1.8 },
} as const;
type Style = keyof typeof STYLES;

const COLORS = [
  "var(--color-forest-600)",
  "#4f8fa3",
  "#8a6bb0",
  "var(--color-clay-600)",
  "#c76f8a",
  "var(--color-gold-500)",
  "var(--color-moss-300)",
  "#6b7280",
];

const INPUT =
  "w-full rounded-2xl border border-ink-900/15 bg-parchment-50 px-3 py-2.5 text-ink-900 outline-none transition-colors duration-200 ease-smooth focus:border-forest-500";

const roundTo50 = (n: number) => Math.round(n / 50) * 50;

export default function BudgetCalculator({ trail }: { trail: Trail }) {
  const { costs } = trail;
  const [people, setPeople] = useState(2);
  const [days, setDays] = useState(2);
  const [style, setStyle] = useState<Style>("standard");
  const [transport, setTransport] = useState<(typeof TRANSPORT_OPTIONS)[number]["id"]>("bus");
  const [guide, setGuide] = useState(costs.guideFeeLkr > 0);
  const [gearPerDay, setGearPerDay] = useState(1200);
  const [parkingDays, setParkingDays] = useState(1);
  const [budgetText, setBudgetText] = useState("");
  const [startingFrom, setStartingFrom] = useState("");

  const { token } = useAuth();
  const [ai, setAi] = useState<{ forTotal: number; plan: BudgetPlan } | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  const { data: parkingSpots } = useParkingSpots(trail.slug);
  const parking = parkingSpots?.[0];

  const budget = Number(budgetText) > 0 ? Number(budgetText) : undefined;
  const transportLabel = TRANSPORT_OPTIONS.find((t) => t.id === transport)!.label;

  const lines = useMemo(() => {
    const t = TRANSPORT_OPTIONS.find((o) => o.id === transport)!;
    const s = STYLES[style];
    const nights = Math.max(0, days - 1);
    return [
      { label: "Transport", amount: roundTo50(costs.transportFromColomboLkr * t.multiplier) * people },
      { label: "Entry fees", amount: costs.entryFeeLkr * people },
      { label: "Guide", amount: guide ? costs.guideFeeLkr * days : 0 },
      { label: "Local transfer", amount: costs.transferLkr },
      { label: "Stay", amount: roundTo50(costs.stayPerNightLkr * s.stayMultiplier) * people * nights },
      { label: "Food", amount: s.foodPerDay * people * days },
      { label: "Gear rental", amount: gearPerDay * days },
      { label: "Parking", amount: (parking?.pricePerDay ?? 0) * parkingDays },
    ].filter((l) => l.amount > 0);
  }, [transport, style, people, days, guide, gearPerDay, parking, parkingDays, costs]);

  const total = lines.reduce((sum, l) => sum + l.amount, 0);
  const rows = lines.map((l, i) => ({ ...l, color: COLORS[i % COLORS.length] }));

  async function askAi() {
    if (!token) return;
    setAiLoading(true);
    setAiError(null);
    try {
      const plan = await budgetApi.plan(
        {
          trailSlug: trail.slug,
          people,
          days,
          style,
          transport: transportLabel,
          startingFrom: startingFrom.trim() || undefined,
          budget,
          lines,
          total,
        },
        token
      );
      setAi({ forTotal: total, plan });
    } catch (err) {
      setAiError(err instanceof ApiError ? err.message : "Something went wrong. Try again.");
    } finally {
      setAiLoading(false);
    }
  }

  return (
    <div className="grid lg:grid-cols-[1fr_20rem] gap-10">
      <div className="space-y-7">
        <div className="grid sm:grid-cols-2 gap-6">
          <Field label="Hikers">
            <input type="number" min={1} value={people} onChange={(e) => setPeople(Math.max(1, Number(e.target.value)))} className={INPUT} />
          </Field>
          <Field label="Days">
            <input type="number" min={1} value={days} onChange={(e) => setDays(Math.max(1, Number(e.target.value)))} className={INPUT} />
          </Field>
        </div>

        <div className="grid sm:grid-cols-2 gap-6">
          <Field label="Your budget for the trip (LKR, optional)">
            <input
              type="number"
              min={0}
              placeholder="e.g. 20000"
              value={budgetText}
              onChange={(e) => setBudgetText(e.target.value)}
              className={INPUT}
            />
          </Field>
          <Field label="Starting from (optional)">
            <input
              type="text"
              maxLength={60}
              placeholder="e.g. Kandy"
              value={startingFrom}
              onChange={(e) => setStartingFrom(e.target.value)}
              className={INPUT}
            />
          </Field>
        </div>

        <Field label="Trip style">
          <div className="grid grid-cols-3 gap-2">
            {(Object.keys(STYLES) as Style[]).map((id) => (
              <ChoiceButton key={id} active={style === id} onClick={() => setStyle(id)} title={STYLES[id].label} sub={STYLES[id].blurb} />
            ))}
          </div>
        </Field>

        <Field label="Transport (round trip, per person, from Colombo)">
          <div className="grid grid-cols-2 gap-2">
            {TRANSPORT_OPTIONS.map((opt) => (
              <ChoiceButton
                key={opt.id}
                active={transport === opt.id}
                onClick={() => setTransport(opt.id)}
                title={opt.label}
                sub={`LKR ${roundTo50(costs.transportFromColomboLkr * opt.multiplier).toLocaleString()}/person`}
              />
            ))}
          </div>
          <p className="mt-2 text-xs text-ink-700/60">Starting somewhere else? Costs change — mention it above and the AI will account for it.</p>
        </Field>

        {costs.guideFeeLkr > 0 && (
          <label className="flex items-start gap-3 rounded-2xl border border-ink-900/10 bg-parchment-100/50 p-4 text-sm text-ink-900">
            <input type="checkbox" checked={guide} onChange={(e) => setGuide(e.target.checked)} className="mt-1 accent-forest-600" />
            <span>
              Hire a guide — LKR {costs.guideFeeLkr.toLocaleString()}/day for the group
              <span className="block text-xs text-ink-700/60">Usually required for this trail.</span>
            </span>
          </label>
        )}

        <Field label="Gear rental, per day for the group (LKR)">
          <input type="number" min={0} value={gearPerDay} onChange={(e) => setGearPerDay(Math.max(0, Number(e.target.value)))} className={`${INPUT} sm:max-w-xs`} />
        </Field>

        {parking && (
          <Field label={`Parking at ${parking.name} (LKR ${parking.pricePerDay}/day)`}>
            <input
              type="number"
              min={0}
              value={parkingDays}
              onChange={(e) => setParkingDays(Math.max(0, Number(e.target.value)))}
              className={`${INPUT} !w-32`}
            />
            <span className="ml-2 text-sm text-ink-700/60">days</span>
          </Field>
        )}

        <p className="text-xs text-ink-700/50">
          Costs are rough estimates at Sri Lankan resident rates. Foreign visitors pay more at several parks, so check current prices.
        </p>

        <div className="rounded-3xl border border-forest-600/25 bg-forest-600/5 p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="flex items-center gap-2 font-medium text-ink-900">
                <Sparkles size={16} className="text-forest-600" /> AI trip plan
              </h2>
              <p className="mt-1 text-sm text-ink-700/70">A day-by-day plan, ways to save, and what to pack — based on everything above.</p>
            </div>
            {token ? (
              <Button onClick={askAi} disabled={aiLoading}>
                {aiLoading ? "Thinking…" : ai ? "Regenerate" : "Generate plan"}
              </Button>
            ) : (
              <Button to="/login" variant="secondary">
                Sign in to use
              </Button>
            )}
          </div>

          {aiError && <p className="mt-4 rounded-2xl border border-clay-600/30 bg-clay-100/40 p-3 text-sm text-clay-700">{aiError}</p>}

          {ai && (
            <div className="mt-5 space-y-5">
              {ai.forTotal !== total && <p className="text-xs text-clay-700">You changed the trip since this plan was made — regenerate to update it.</p>}
              <p className="text-sm leading-relaxed text-ink-900">{ai.plan.summary}</p>

              {ai.plan.itinerary.length > 0 && (
                <ol className="space-y-3">
                  {ai.plan.itinerary.map((d) => (
                    <li key={d.day} className="flex gap-3">
                      <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-forest-600 text-xs font-medium text-white">{d.day}</span>
                      <div>
                        <p className="text-sm font-medium text-ink-900">{d.title}</p>
                        <p className="text-sm text-ink-700/80">{d.plan}</p>
                      </div>
                    </li>
                  ))}
                </ol>
              )}

              {ai.plan.savings.length > 0 && (
                <ul className="space-y-3">
                  {ai.plan.savings.map((tip) => (
                    <li key={tip.title} className="rounded-2xl border border-ink-900/10 bg-parchment-50 p-4">
                      <div className="flex items-start justify-between gap-3">
                        <p className="text-sm font-medium text-ink-900">{tip.title}</p>
                        {tip.savingLkr > 0 && (
                          <span className="shrink-0 rounded-full bg-forest-600/10 px-2.5 py-0.5 text-xs font-medium text-forest-700">
                            save ~LKR {tip.savingLkr.toLocaleString()}
                          </span>
                        )}
                      </div>
                      <p className="mt-1 text-sm text-ink-700/80">{tip.detail}</p>
                    </li>
                  ))}
                </ul>
              )}

              {ai.plan.packing.length > 0 && (
                <div>
                  <p className="mb-2 text-sm font-medium text-ink-900">Pack or rent</p>
                  <div className="flex flex-wrap gap-2">
                    {ai.plan.packing.map((item) => (
                      <span key={item} className="rounded-full bg-forest-600/10 px-3 py-1 text-xs font-medium text-forest-700">
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              <p className="text-xs text-ink-700/50">AI-generated — double-check prices and timings before you go.</p>
            </div>
          )}
        </div>
      </div>

      <aside className="border border-ink-900/10 rounded-2xl p-6 h-fit lg:sticky lg:top-24">
        <h2 className="font-medium text-ink-900">Estimated total</h2>
        <motion.p
          key={total}
          initial={{ opacity: 0.4, y: -2 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
          className="mt-1 font-display text-4xl text-ink-900"
        >
          LKR {total.toLocaleString()}
        </motion.p>
        <p className="text-sm text-ink-700/60">LKR {Math.round(total / people).toLocaleString()} per person</p>

        {budget !== undefined && (
          <p
            className={`mt-3 rounded-xl px-3 py-2 text-sm font-medium ${
              total <= budget ? "bg-forest-600/10 text-forest-700" : "bg-clay-100/60 text-clay-700"
            }`}
          >
            {total <= budget
              ? `LKR ${(budget - total).toLocaleString()} under budget`
              : `LKR ${(total - budget).toLocaleString()} over budget`}
          </p>
        )}

        <div className="mt-5 h-2.5 rounded-full overflow-hidden flex bg-parchment-200">
          {rows.map((r) => (
            <motion.div
              key={r.label}
              animate={{ width: `${(r.amount / total) * 100}%` }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              style={{ backgroundColor: r.color }}
            />
          ))}
        </div>

        <div className="mt-5 space-y-2.5">
          {rows.map((r) => (
            <div key={r.label} className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-2 text-ink-700">
                <span className="h-2 w-2 rounded-full" style={{ backgroundColor: r.color }} />
                {r.label}
              </span>
              <span className="text-ink-900 font-medium">LKR {r.amount.toLocaleString()}</span>
            </div>
          ))}
        </div>
      </aside>
    </div>
  );
}

function ChoiceButton({ active, onClick, title, sub }: { active: boolean; onClick: () => void; title: string; sub: string }) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileTap={{ scale: 0.97 }}
      transition={{ type: "spring", stiffness: 500, damping: 30 }}
      className={`rounded-2xl border px-3 py-2.5 text-sm text-left transition-colors duration-200 ease-smooth ${
        active ? "border-forest-600 bg-forest-600/10 text-forest-700" : "border-ink-900/15 text-ink-700 hover:border-forest-500/40"
      }`}
    >
      <span className="block font-medium">{title}</span>
      <span className="block text-xs text-ink-700/60">{sub}</span>
    </motion.button>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="block text-sm font-medium text-ink-900 mb-2">{label}</span>
      {children}
    </label>
  );
}
