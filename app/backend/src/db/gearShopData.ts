import type { PoolClient } from "pg";

type Category = "Shelter" | "Pack" | "Cook" | "Safety" | "Sleep";

interface RealShop {
  name: string;
  district: string;
  address: string;
  phone: string | null;
  website: string | null;
  note: string;
  sourceUrl: string;
  rating: number;
  reviewCount: number;
  trails: "all" | string[]; // trail slugs this shop can supply
  items: { name: string; category: Category; pricePerDay: number; description: string }[];
}

// Real businesses found online (their own sites and public listings). Prices are the ones each shop publishes;
// stock levels aren't published, so items are stored with available = 0 and shown as "confirm availability".
// Rating and review count are only filled in where a public listing gives them. Re-check before relying on any of it.
const kandyTrails = [
  "knuckles-range", "riverston-mini-worlds-end", "hanthana-range", "ambuluwawa-tower", "kabaragala", "rakshagala",
  "lakegala-meemure", "pekoe-trail-stage-1", "alagalla", "uthuwankanda", "bible-rock",
];

export const realShops: RealShop[] = [
  {
    name: "Koodarama",
    district: "Gampaha",
    address: "Pickup: 62/1 Walpola, Andiambalama (Katunayaka) or 265/B/05 Liyana Gardens, Batuwatta (Ragama)",
    phone: "076 056 5427 (Katunayaka) · 071 079 7988 (Ragama)",
    website: "https://koodarama.lk/rentals/",
    note: "Rent by WhatsApp from the rentals page. The site lists pickup at both branches and doesn't state delivery, deposit or opening hours. Some prices are ranges, so the lower one is shown.",
    sourceUrl: "https://koodarama.lk/rentals/",
    rating: 0, reviewCount: 0, trails: "all",
    items: [
      { name: "2 Person Tent", category: "Shelter", pricePerDay: 450, description: "Lightweight, for couples or solo hikers." },
      { name: "4 Person Tent", category: "Shelter", pricePerDay: 550, description: "Popular dome tent for general trips." },
      { name: "6 Person Tent", category: "Shelter", pricePerDay: 650, description: "Quick setup." },
      { name: "8 Person Tent", category: "Shelter", pricePerDay: 800, description: "Family-sized dome." },
      { name: "Sleeping Bag", category: "Sleep", pricePerDay: 300, description: "3-season mummy bag, rated to 5°C." },
      { name: "Air Mattress", category: "Sleep", pricePerDay: 500, description: "Comes in four sizes." },
      { name: "Self-Inflating Mattress with Pillow", category: "Sleep", pricePerDay: 300, description: "Self-inflating pad with a pillow." },
      { name: "Sleeping Mat", category: "Sleep", pricePerDay: 100, description: "Foam roll-up mat." },
      { name: "Sleeping Blanket", category: "Sleep", pricePerDay: 200, description: "Fleece blanket." },
      { name: "Hammock", category: "Sleep", pricePerDay: 200, description: "Ultra-light nylon hammock." },
      { name: "Gas Stove", category: "Cook", pricePerDay: 200, description: "Compact gas stove." },
      { name: "Windproof Gas Stove", category: "Cook", pricePerDay: 250, description: "Built for high-altitude conditions." },
      { name: "Cooking Set", category: "Cook", pricePerDay: 250, description: "Basic set; the full set is up to LKR 450." },
      { name: "60L Backpack", category: "Pack", pricePerDay: 250, description: "Multi-day trekking pack. LKR 250–300 depending on the model." },
      { name: "90L Backpack", category: "Pack", pricePerDay: 350, description: "Extended expedition pack." },
      { name: "Hiking Stick", category: "Safety", pricePerDay: 150, description: "Adjustable aluminium pole." },
      { name: "Hiking Shoes", category: "Safety", pricePerDay: 350, description: "Several sizes. LKR 350–450 depending on the pair." },
      { name: "Raincoat", category: "Safety", pricePerDay: 250, description: "Poncho-style raincoat." },
      { name: "Head Torch", category: "Safety", pricePerDay: 100, description: "Hands-free. LKR 100–300 depending on the model." },
      { name: "LED Camping Lantern", category: "Safety", pricePerDay: 250, description: "Rechargeable. LKR 250–300 depending on the model." },
    ],
  },
  {
    name: "Wild Trail Gear",
    district: "Kalutara",
    address: "No 27/A, Bodhirukkarama Road, Nalluruwa, Panadura",
    phone: "+94 77 686 4908",
    website: "https://www.wildtrailgear.lk/",
    note: "Book on WhatsApp or by email (Wild.trail.gears@gmail.com). Minimum rental is 2 days. Only tents and cooking gear have published prices; delivery and deposit aren't stated.",
    sourceUrl: "https://www.wildtrailgear.lk/",
    rating: 0, reviewCount: 0, trails: "all",
    items: [
      { name: "3 Person Tent", category: "Shelter", pricePerDay: 500, description: "Manual (pitch-it-yourself) tent." },
      { name: "4 Person Tent", category: "Shelter", pricePerDay: 600, description: "Manual (pitch-it-yourself) tent." },
      { name: "6 Person Tent", category: "Shelter", pricePerDay: 750, description: "Manual (pitch-it-yourself) tent." },
      { name: "8 Person Tent", category: "Shelter", pricePerDay: 900, description: "Manual (pitch-it-yourself) tent." },
      { name: "Windproof Gas Stove", category: "Cook", pricePerDay: 250, description: "Windproof camping gas stove." },
      { name: "Cooking Set", category: "Cook", pricePerDay: 300, description: "Camp cooking set." },
    ],
  },
  {
    name: "Campingrent.lk",
    district: "Island-wide",
    address: "No shop address published. Ships rental gear anywhere in Sri Lanka.",
    phone: "077 485 4862 · 071 682 6066 (WhatsApp)",
    website: "https://campingrent.lk/",
    note: "Advertises a 24x7 service line. Delivery fees, lead times and deposit rules aren't published (a reviewer says an ID can be left as a deposit), so confirm them when you book.",
    sourceUrl: "https://campingrent.lk/",
    rating: 0, reviewCount: 0, trails: "all",
    items: [
      { name: "2 Person Tent", category: "Shelter", pricePerDay: 450, description: "Tent rental." },
      { name: "4 Person Tent", category: "Shelter", pricePerDay: 600, description: "Tent rental." },
      { name: "6 Person Tent", category: "Shelter", pricePerDay: 800, description: "Tent rental." },
      { name: "8 Person Tent", category: "Shelter", pricePerDay: 1200, description: "Tent rental." },
      { name: "Sleeping Bag", category: "Sleep", pricePerDay: 350, description: "Sleeping bag rental." },
      { name: "Hammock", category: "Sleep", pricePerDay: 350, description: "Hammock rental." },
      { name: "Camping Backpack", category: "Pack", pricePerDay: 350, description: "Backpack rental." },
      { name: "Windproof Gas Stove", category: "Cook", pricePerDay: 350, description: "Gas stove rental." },
      { name: "Cooking Set", category: "Cook", pricePerDay: 350, description: "Camp cooking set." },
      { name: "Rain Poncho", category: "Safety", pricePerDay: 350, description: "Rain poncho rental." },
      { name: "Head Torch", category: "Safety", pricePerDay: 150, description: "Head torch rental." },
      { name: "Camping Light", category: "Safety", pricePerDay: 150, description: "Camping light rental." },
      { name: "Water Storage Bag", category: "Pack", pricePerDay: 150, description: "Water storage bag rental." },
    ],
  },
  {
    name: "Canopy Hut the Original",
    district: "Colombo",
    address: "528/A Awissawella Road, Wellampitiya",
    phone: "011 226 7667 · 075 842 9919",
    website: "https://www.canopyhut.lk/camping-gear-for-rent-c-5/",
    note: "Email sales@canopyhut.lk. Only a tent has a published rental price (listed as LKR 450 per day, Colombo, with no tent model given). Delivery, hours and deposit aren't stated.",
    sourceUrl: "https://www.canopyhut.lk/camping-gear-for-rent-c-5/",
    rating: 0, reviewCount: 0, trails: "all",
    items: [{ name: "Camping Tent", category: "Shelter", pricePerDay: 450, description: "Listed as 'camping tent for rent'; the model isn't specified." }],
  },
  {
    name: "Redwood Camping",
    district: "Gampaha",
    address: "No 24/1, Makola South, Makola, Kiribathgoda 11600",
    phone: "076 058 2384",
    website: null,
    note: "Rents tents, stoves, BBQ machines, camping lights, mattresses, head torches, gas cartridges, hiking backpacks and leech socks. Open 8:00 AM to 9:00 PM daily and delivers around Colombo (Kadawatha, Kaduwela, Wattala, Nugegoda, Maharagama and others) per its Google listing. No prices are published, so ask.",
    sourceUrl: "https://business.google.com/v/redwood-camping/06001310266384943738/f619/_",
    rating: 4.8, reviewCount: 114, trails: "all",
    items: [],
  },
  {
    name: "Camping Tent & Gear Lk",
    district: "Kandy",
    address: "22 Siyabalapitiya Heerassagala Road, Kandy",
    phone: "+94 77 797 0910",
    website: null,
    note: "Rents tents (and bikes) and sells backpacks, tents, camping stoves and gas torches. No prices or hours are published, so call first. Rating is from its Google reviews.",
    sourceUrl: "https://wanderlog.com/place/details/15787965/camping-tent--gear-lk",
    rating: 4.2, reviewCount: 123, trails: kandyTrails,
    items: [],
  },
  {
    name: "Scan Alpine Camping Store",
    district: "Kandy",
    address: "Kandy City Centre (KCC), Kandy",
    phone: null,
    website: null,
    note: "A camping store whose listing says it provides rental gear for travellers (sleeping bags and tents among its stock). Open daily 8:30 AM to 9:00 PM. No phone or prices are published, so ask in the shop. Only four reviews.",
    sourceUrl: "https://www.tripadvisor.com/Attraction_Review-g304138-d33999810-Reviews-Scan_Alpine_Camping_Store-Kandy_Kandy_District_Central_Province.html",
    rating: 4.8, reviewCount: 4, trails: kandyTrails,
    items: [],
  },
];

// Safe to re-run: removes the previously inserted real shops (the ones with a source URL) and inserts them again.
export async function insertRealShops(client: PoolClient) {
  await client.query("DELETE FROM gear_shops WHERE source_url IS NOT NULL");
  const { rows: trailRows } = await client.query<{ id: string; slug: string }>("SELECT id, slug FROM trails");
  const idBySlug = new Map(trailRows.map((t) => [t.slug, t.id]));

  for (const shop of realShops) {
    const { rows } = await client.query<{ id: string }>(
      `INSERT INTO gear_shops (name, district, address, rating, review_count, phone, website, note, source_url)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING id`,
      [shop.name, shop.district, shop.address, shop.rating, shop.reviewCount, shop.phone, shop.website, shop.note, shop.sourceUrl]
    );
    const shopId = rows[0].id;

    for (const item of shop.items) {
      await client.query(
        `INSERT INTO shop_items (shop_id, name, category, price_per_day, available, description) VALUES ($1,$2,$3,$4,0,$5)`,
        [shopId, item.name, item.category, item.pricePerDay, item.description]
      );
    }

    const slugs = shop.trails === "all" ? [...idBySlug.keys()] : shop.trails;
    for (const slug of slugs) {
      const trailId = idBySlug.get(slug);
      if (!trailId) throw new Error(`Real shop "${shop.name}" references unknown trail "${slug}"`);
      await client.query("INSERT INTO gear_shop_trails (shop_id, trail_id) VALUES ($1,$2)", [shopId, trailId]);
    }
  }
}
