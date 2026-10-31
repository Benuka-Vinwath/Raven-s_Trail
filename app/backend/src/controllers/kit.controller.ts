import type { Request, Response } from "express";
import { z } from "zod";
import { pool } from "../db/pool.js";
import { ApiError } from "../utils/errors.js";

// The kit builder: given a trail and a group, work out what to bring, then rank the real shops by how much of it
// they can supply and what it costs. The rules live here (not in the browser) so the chatbot can reuse them later.

type Level = "essential" | "recommended" | "optional";
type Mode = "day" | "night" | "rain" | "camp";

interface KitItem {
  type: string;
  label: string;
  quantity: number;
  level: Level;
  reason: string;
  minSize?: number; // backpack litres
}

const querySchema = z.object({
  people: z.coerce.number().int().min(1).max(20).default(2),
  nights: z.coerce.number().int().min(0).max(10).optional(),
  mode: z.enum(["day", "night", "rain", "camp"]).optional(),
  // weather hints from the forecast for the chosen dates; the browser works them out
  rain: z.enum(["0", "1"]).optional(),
  cold: z.enum(["0", "1"]).optional(),
});

export function suggestMode(tags: string[]): Mode {
  const t = tags.map((x) => x.toLowerCase());
  if (t.includes("camping")) return "camp";
  if (t.includes("night hike")) return "night";
  if (t.includes("rainforest") || t.includes("leeches")) return "rain";
  return "day";
}

function buildKit(trail: any, o: { people: number; nights: number; mode: Mode; rain: boolean; cold: boolean }): KitItem[] {
  const tags: string[] = (trail.tags ?? []).map((x: string) => x.toLowerCase());
  const { people, nights, mode } = o;
  const hard = trail.difficulty === "hard";
  const demanding = trail.difficulty !== "easy";
  const climb: number = trail.elevation_gain_m;
  const peak: number = trail.peak_elevation_m;
  const wet = o.rain || mode === "rain" || tags.includes("rainforest") || tags.includes("leeches");
  const dark = mode === "night" || tags.includes("night hike");
  const steps = tags.includes("steps");
  const kit: KitItem[] = [];

  kit.push(
    nights > 0
      ? { type: "backpack", label: "Backpack (50L+)", quantity: people, level: "essential", minSize: 50, reason: "Carries the tent, sleeping bag and food." }
      : { type: "backpack", label: "Backpack", quantity: people, level: Number(trail.duration_hrs) >= 3 ? "recommended" : "optional", reason: "Water, snacks and a rain layer." }
  );
  kit.push({
    type: "shoes", label: "Hiking shoes", quantity: people, level: demanding ? "recommended" : "optional",
    reason: demanding ? "Grip on steep, wet or rocky ground." : "Good grip helps on wet steps.",
  });
  kit.push({
    type: "poles", label: "Trekking poles", quantity: people, level: hard || climb >= 700 || steps || dark ? "recommended" : "optional",
    reason: steps ? "Saves your knees on long staircases." : "Takes load off your knees on climbs and descents.",
  });
  kit.push({
    type: "rain_gear", label: "Raincoat or poncho", quantity: people, level: wet ? "essential" : "recommended",
    reason: wet ? "Wet conditions are likely here." : "Hill-country showers arrive without warning.",
  });
  kit.push({
    type: "headlamp", label: "Headlamp", quantity: people, level: dark ? "essential" : nights > 0 ? "recommended" : "optional",
    reason: dark ? "You'll be walking in the dark and need both hands free." : "For camp and for the unexpected late finish.",
  });
  if (wet) {
    kit.push({ type: "leech_socks", label: "Leech socks", quantity: people, level: "essential", reason: "Leeches are common here after rain." });
  }

  if (nights > 0) {
    kit.push({
      type: "tent", label: `Tent for ${people}`, quantity: 1, level: "essential",
      reason: `Needs to sleep ${people}. One bigger tent is easier to carry than two small ones.`,
    });
    kit.push({
      type: "sleeping_bag", label: "Sleeping bag", quantity: people, level: "essential",
      reason: peak >= 1500 || o.cold ? `It gets cold at ${peak} m. Choose one rated to 5°C or lower.` : "A light 3-season bag is enough at this height.",
    });
    kit.push({ type: "sleeping_mat", label: "Sleeping mat", quantity: people, level: "essential", reason: "Keeps the cold ground from draining your warmth." });
    const stoves = people > 6 ? 2 : 1;
    kit.push({ type: "stove", label: "Gas stove", quantity: stoves, level: "recommended", reason: "Hot food and tea at camp." });
    kit.push({ type: "cookset", label: "Cooking set", quantity: stoves, level: "recommended", reason: "Pots and utensils for the stove." });
    kit.push({ type: "lantern", label: "Camp lantern", quantity: 1, level: "optional", reason: "Light for the tent and camp." });
  }

  const order: Level[] = ["essential", "recommended", "optional"];
  return kit.sort((a, b) => order.indexOf(a.level) - order.indexOf(b.level));
}

interface ShopItem { id: string; shop_id: string; name: string; price_per_day: number; gear_type: string; size: number | null }

// the cheapest way this shop can supply one kit line, or null if it can't
function priceLine(item: KitItem, stock: ShopItem[], people: number) {
  const candidates = stock.filter((s) => s.gear_type === item.type);
  if (item.type === "tent") {
    // a tent with no stated size is assumed to sleep 2, and flagged
    const options = candidates.map((c) => {
      const capacity = c.size ?? 2;
      const quantity = Math.ceil(people / capacity);
      return { c, quantity, cost: quantity * c.price_per_day, assumedSize: c.size === null };
    });
    options.sort((a, b) => a.cost - b.cost);
    const best = options[0];
    return best && { itemId: best.c.id, itemName: best.c.name, quantity: best.quantity, unitPrice: best.c.price_per_day, assumedSize: best.assumedSize };
  }
  const fits = item.minSize ? candidates.filter((c) => c.size === null || c.size >= item.minSize!) : candidates;
  const best = [...fits].sort((a, b) => a.price_per_day - b.price_per_day)[0];
  return best && { itemId: best.id, itemName: best.name, quantity: item.quantity, unitPrice: best.price_per_day, assumedSize: false };
}

export async function getKit(req: Request, res: Response) {
  const q = querySchema.safeParse(req.query);
  if (!q.success) throw ApiError.badRequest("Invalid kit options");

  const { rows } = await pool.query("SELECT * FROM trails WHERE slug = $1", [req.params.slug]);
  const trail = rows[0];
  if (!trail) throw ApiError.notFound("Trail not found");

  const mode: Mode = q.data.mode ?? suggestMode(trail.tags ?? []);
  const nights = q.data.nights ?? (mode === "camp" ? 1 : 0);
  const people = q.data.people;
  const days = nights + 1; // rental days
  const kit = buildKit(trail, { people, nights, mode, rain: q.data.rain === "1", cold: q.data.cold === "1" });

  const { rows: shops } = await pool.query(
    `SELECT gs.id, gs.name, gs.district, gs.address, gs.phone, gs.website, gs.note
     FROM gear_shops gs JOIN gear_shop_trails gst ON gst.shop_id = gs.id
     WHERE gst.trail_id = $1 AND gs.source_url IS NOT NULL`,
    [trail.id]
  );
  const { rows: stock } = shops.length
    ? await pool.query<ShopItem>("SELECT id, shop_id, name, price_per_day, gear_type, size FROM shop_items WHERE shop_id = ANY($1) AND gear_type IS NOT NULL", [shops.map((s) => s.id)])
    : { rows: [] as ShopItem[] };

  const count = (items: KitItem[], level: Level) => items.filter((k) => k.level === level).length;
  const essentialTotal = count(kit, "essential");
  const recommendedTotal = count(kit, "recommended");

  const priced = shops.map((shop) => {
    const mine = stock.filter((s) => s.shop_id === shop.id);
    const lines = kit.map((k) => {
      const hit = priceLine(k, mine, people);
      return { type: k.type, label: k.label, level: k.level, covered: Boolean(hit), ...(hit ?? {}), lineTotal: hit ? hit.quantity * hit.unitPrice * days : 0 };
    });
    const included = lines.filter((l) => l.covered && l.level !== "optional");
    const totalLkr = included.reduce((sum, l) => sum + l.lineTotal, 0);
    return {
      shop: { id: shop.id, name: shop.name, district: shop.district, address: shop.address, phone: shop.phone, website: shop.website, note: shop.note },
      essentialCovered: lines.filter((l) => l.level === "essential" && l.covered).length,
      recommendedCovered: lines.filter((l) => l.level === "recommended" && l.covered).length,
      totalLkr,
      perPersonLkr: Math.round(totalLkr / people),
      missing: lines.filter((l) => !l.covered && l.level !== "optional").map((l) => l.label),
      lines,
    };
  });

  // most essentials covered first, then recommended, then the lowest price
  const ranked = priced
    .filter((p) => p.essentialCovered + p.recommendedCovered > 0)
    .sort((a, b) => b.essentialCovered - a.essentialCovered || b.recommendedCovered - a.recommendedCovered || a.totalLkr - b.totalLkr)
    .slice(0, 5);

  // kit items that no shop can supply at all: the hiker has to buy or bring them
  const notRentable = kit.filter((k) => k.level !== "optional" && !priced.some((p) => p.lines.find((l) => l.type === k.type)?.covered)).map((k) => k.label);

  res.json({
    inputs: { people, nights, days, mode, rainHint: q.data.rain === "1", coldHint: q.data.cold === "1" },
    trail: { slug: trail.slug, name: trail.name },
    kit,
    totals: { essential: essentialTotal, recommended: recommendedTotal },
    shops: ranked,
    // shops that serve this trail but publish no prices, so they can't be ranked: worth a phone call
    callToPrice: priced.filter((p) => p.essentialCovered + p.recommendedCovered === 0).map((p) => ({ id: p.shop.id, name: p.shop.name, phone: p.shop.phone })),
    notRentable,
  });
}
