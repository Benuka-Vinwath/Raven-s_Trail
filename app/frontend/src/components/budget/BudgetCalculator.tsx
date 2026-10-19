import { useMemo, useState, type ReactNode } from "react";
import { motion } from "framer-motion";
import { useParkingSpots } from "../../hooks/useParkingSpots";
import type { Trail } from "../../types";

const TRANSPORT_OPTIONS = [
  { id: "bus", label: "Public bus", perPersonRoundTrip: 800 },
  { id: "train", label: "Train", perPersonRoundTrip: 1200 },
  { id: "van", label: "Private van (shared)", perPersonRoundTrip: 2500 },
  { id: "own", label: "Own vehicle (fuel share)", perPersonRoundTrip: 1800 },
] as const;

export default function BudgetCalculator({ trail }: { trail: Trail }) {
  const [people, setPeople] = useState(2);
  const [days, setDays] = useState(2);
  const [transport, setTransport] = useState<(typeof TRANSPORT_OPTIONS)[number]["id"]>("bus");
  const [foodPerDay, setFoodPerDay] = useState(1500);
  const [gearPerDay, setGearPerDay] = useState(1200);
  const [parkingDays, setParkingDays] = useState(1);

  const { data: parkingSpots } = useParkingSpots(trail.slug);
  const parking = parkingSpots?.[0];

  const breakdown = useMemo(() => {
    const transportRate = TRANSPORT_OPTIONS.find((t) => t.id === transport)!.perPersonRoundTrip;
    const transportTotal = transportRate * people;
    const foodTotal = foodPerDay * days * people;
    const gearTotal = gearPerDay * days;
    const parkingTotal = (parking?.pricePerDay ?? 0) * parkingDays;
    const total = transportTotal + foodTotal + gearTotal + parkingTotal;
    return { transportTotal, foodTotal, gearTotal, parkingTotal, total };
  }, [transport, people, foodPerDay, days, gearPerDay, parking, parkingDays]);

  const rows = [
    { label: "Transport", value: breakdown.transportTotal, color: "var(--color-forest-600)" },
    { label: "Food", value: breakdown.foodTotal, color: "var(--color-clay-600)" },
    { label: "Gear rental", value: breakdown.gearTotal, color: "var(--color-gold-500)" },
    { label: "Parking", value: breakdown.parkingTotal, color: "var(--color-moss-300)" },
  ];

  return (
    <div className="grid lg:grid-cols-[1fr_20rem] gap-10">
      <div className="space-y-7">
        <div className="grid sm:grid-cols-2 gap-6">
          <Field label="Hikers">
            <input
              type="number"
              min={1}
              value={people}
              onChange={(e) => setPeople(Math.max(1, Number(e.target.value)))}
              className="w-full rounded border border-ink-900/15 bg-parchment-50 px-3 py-2.5 text-ink-900 outline-none transition-colors duration-200 ease-smooth focus:border-forest-500"
            />
          </Field>
          <Field label="Days">
            <input
              type="number"
              min={1}
              value={days}
              onChange={(e) => setDays(Math.max(1, Number(e.target.value)))}
              className="w-full rounded border border-ink-900/15 bg-parchment-50 px-3 py-2.5 text-ink-900 outline-none transition-colors duration-200 ease-smooth focus:border-forest-500"
            />
          </Field>
        </div>

        <Field label="Transport (round trip, per person)">
          <div className="grid grid-cols-2 gap-2">
            {TRANSPORT_OPTIONS.map((opt) => (
              <motion.button
                key={opt.id}
                onClick={() => setTransport(opt.id)}
                whileTap={{ scale: 0.97 }}
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
                className={`rounded border px-3 py-2.5 text-sm text-left transition-colors duration-200 ease-smooth ${
                  transport === opt.id
                    ? "border-forest-600 bg-forest-600/10 text-forest-700"
                    : "border-ink-900/15 text-ink-700 hover:border-forest-500/40"
                }`}
              >
                <span className="block font-medium">{opt.label}</span>
                <span className="block text-xs text-ink-700/60">LKR {opt.perPersonRoundTrip}/person</span>
              </motion.button>
            ))}
          </div>
        </Field>

        <div className="grid sm:grid-cols-2 gap-6">
          <Field label="Food, per person/day (LKR)">
            <input
              type="number"
              min={0}
              value={foodPerDay}
              onChange={(e) => setFoodPerDay(Math.max(0, Number(e.target.value)))}
              className="w-full rounded border border-ink-900/15 bg-parchment-50 px-3 py-2.5 text-ink-900 outline-none transition-colors duration-200 ease-smooth focus:border-forest-500"
            />
          </Field>
          <Field label="Gear rental, per day (LKR)">
            <input
              type="number"
              min={0}
              value={gearPerDay}
              onChange={(e) => setGearPerDay(Math.max(0, Number(e.target.value)))}
              className="w-full rounded border border-ink-900/15 bg-parchment-50 px-3 py-2.5 text-ink-900 outline-none transition-colors duration-200 ease-smooth focus:border-forest-500"
            />
          </Field>
        </div>

        {parking && (
          <Field label={`Parking at ${parking.name} (LKR ${parking.pricePerDay}/day)`}>
            <input
              type="number"
              min={0}
              value={parkingDays}
              onChange={(e) => setParkingDays(Math.max(0, Number(e.target.value)))}
              className="w-32 rounded border border-ink-900/15 bg-parchment-50 px-3 py-2.5 text-ink-900 outline-none transition-colors duration-200 ease-smooth focus:border-forest-500"
            />
            <span className="ml-2 text-sm text-ink-700/60">days</span>
          </Field>
        )}
      </div>

      <aside className="border border-ink-900/10 rounded p-6 h-fit lg:sticky lg:top-24">
        <h2 className="font-medium text-ink-900">Estimated total</h2>
        <motion.p
          key={breakdown.total}
          initial={{ opacity: 0.4, y: -2 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
          className="mt-1 font-display text-4xl text-ink-900"
        >
          LKR {breakdown.total.toLocaleString()}
        </motion.p>
        <p className="text-sm text-ink-700/60">LKR {Math.round(breakdown.total / people).toLocaleString()} per person</p>

        <div className="mt-5 h-2.5 rounded-full overflow-hidden flex bg-parchment-200">
          {rows.map((r) =>
            r.value > 0 ? (
              <motion.div
                key={r.label}
                animate={{ width: `${(r.value / breakdown.total) * 100}%` }}
                transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                style={{ backgroundColor: r.color }}
              />
            ) : null
          )}
        </div>

        <div className="mt-5 space-y-2.5">
          {rows.map((r) => (
            <div key={r.label} className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-2 text-ink-700">
                <span className="h-2 w-2 rounded-full" style={{ backgroundColor: r.color }} />
                {r.label}
              </span>
              <span className="text-ink-900 font-medium">LKR {r.value.toLocaleString()}</span>
            </div>
          ))}
        </div>
      </aside>
    </div>
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
