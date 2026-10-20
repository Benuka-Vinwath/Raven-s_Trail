import { pool } from "./pool.js";
import { insertRealShops } from "./gearShopData.js";
import { applyTrailCosts, insertTrail, moreTrails, type SeedTrail } from "./trailData.js";

type Category = "Shelter" | "Pack" | "Cook" | "Safety" | "Sleep";

const trails: SeedTrail[] = [
  {
    mockId: "t1",
    slug: "ella-rock",
    name: "Ella Rock",
    district: "Badulla",
    region: "Hill Country",
    difficulty: "moderate",
    distanceKm: 8,
    elevationGainM: 550,
    peakElevationM: 1041,
    durationHrs: 4,
    rating: 4.7,
    reviewCount: 312,
    tags: ["Sunrise", "Railway walk", "Viewpoint"],
    summary: "A rail-track approach through tea country to a wide summit view over Ella Gap.",
    description:
      "Start along the railway line toward Kithalella, cross the river, and climb through pine and tea estates. The unmarked upper section is easy to lose in mist, so keep to the ridge line. The reward is a broad granite summit looking down over Ella Gap and the plains beyond.",
    bestSeason: "Dec – Mar",
    startPoint: [6.8667, 81.0466],
    elevationProfile: [900, 920, 960, 1010, 1041, 1020, 980],
    illustration: "dawn",
  },
  {
    mockId: "t2",
    slug: "little-adams-peak",
    name: "Little Adam's Peak",
    district: "Badulla",
    region: "Hill Country",
    difficulty: "easy",
    distanceKm: 3.2,
    elevationGainM: 180,
    peakElevationM: 1141,
    durationHrs: 1.5,
    rating: 4.8,
    reviewCount: 540,
    tags: ["Family friendly", "Sunrise", "Short"],
    summary: "A gentle paved-then-dirt climb through tea rows to a three-peak ridge walk.",
    description:
      "The easiest of Ella's three summits and a good warm-up hike. A wide path climbs steadily through a working tea estate before narrowing to a ridge with drop-offs on both sides near the top. Popular at sunrise — arrive early to beat the crowds.",
    bestSeason: "Year-round",
    startPoint: [6.8721, 81.0553],
    elevationProfile: [960, 990, 1040, 1090, 1141],
    illustration: "dawn",
  },
  {
    mockId: "t3",
    slug: "adams-peak",
    name: "Adam's Peak (Sri Pada)",
    district: "Ratnapura",
    region: "Sabaragamuwa",
    difficulty: "hard",
    distanceKm: 11,
    elevationGainM: 1000,
    peakElevationM: 2243,
    durationHrs: 6,
    rating: 4.9,
    reviewCount: 890,
    tags: ["Pilgrimage", "Night hike", "Steps"],
    summary: "Over 5,000 steps through the night to a summit shrine and a shadow-cast sunrise.",
    description:
      "A pilgrimage route lit end to end during the Dec–May season, climbed overnight to reach the summit shrine by dawn. Expect crowds and tea stalls on peak weekends, near-total solitude off season. The descent is harder on the knees than the climb — pace yourself.",
    bestSeason: "Dec – May",
    startPoint: [6.8096, 80.4994],
    elevationProfile: [1200, 1450, 1700, 1900, 2100, 2243],
    illustration: "misty",
  },
  {
    mockId: "t4",
    slug: "worlds-end",
    name: "World's End, Horton Plains",
    district: "Nuwara Eliya",
    region: "Hill Country",
    difficulty: "moderate",
    distanceKm: 9.5,
    elevationGainM: 350,
    peakElevationM: 2140,
    durationHrs: 4,
    rating: 4.8,
    reviewCount: 621,
    tags: ["Escarpment", "Cloud forest", "Early start"],
    summary: "A loop across misty grassland to an 870 m escarpment drop, clearest before 9am.",
    description:
      "A well-maintained loop trail through montane cloud forest and open plains to a sheer 870-metre escarpment. Cloud typically rolls in by mid-morning, so an early park entry is essential for the view. Continue the loop past Baker's Falls on the return leg.",
    bestSeason: "Jan – Mar",
    startPoint: [6.8058, 80.7975],
    elevationProfile: [2100, 2130, 2140, 2120, 2100],
    illustration: "misty",
  },
  {
    mockId: "t5",
    slug: "knuckles-range",
    name: "Knuckles Range Traverse",
    district: "Matale",
    region: "Knuckles Massif",
    difficulty: "hard",
    distanceKm: 16,
    elevationGainM: 1150,
    peakElevationM: 1863,
    durationHrs: 8,
    rating: 4.6,
    reviewCount: 174,
    tags: ["Multi-day", "Guide recommended", "Biodiversity"],
    summary: "A remote ridge traverse through cloud forest, best done with a registered local guide.",
    description:
      "The Knuckles massif is a UNESCO-listed wilderness with poor phone signal and fast-changing weather. This traverse crosses several sub-peaks through dense cloud forest home to endemic birds and amphibians. A registered guide is required for the back-country sections.",
    bestSeason: "Feb – Apr",
    startPoint: [7.4667, 80.7833],
    elevationProfile: [900, 1200, 1500, 1700, 1863, 1600, 1300],
    illustration: "misty",
  },
  {
    mockId: "t6",
    slug: "pidurangala-rock",
    name: "Pidurangala Rock",
    district: "Matale",
    region: "Cultural Triangle",
    difficulty: "moderate",
    distanceKm: 2.5,
    elevationGainM: 200,
    peakElevationM: 380,
    durationHrs: 1.5,
    rating: 4.7,
    reviewCount: 705,
    tags: ["Sunrise", "Scramble", "Sigiriya view"],
    summary: "A short, rocky scramble beside Sigiriya with the best sunrise view of the rock fortress.",
    description:
      "A quieter, cheaper neighbour to Sigiriya with a short but steep boulder scramble near the top — some hand-over-hand sections. The summit slab faces directly across to Sigiriya rock, making it the best sunrise vantage point in the Cultural Triangle.",
    bestSeason: "May – Sep",
    startPoint: [7.9587, 80.7529],
    elevationProfile: [180, 240, 300, 350, 380],
    illustration: "dawn",
  },
  {
    mockId: "t7",
    slug: "bambarakanda-falls",
    name: "Bambarakanda Falls Summit",
    district: "Badulla",
    region: "Hill Country",
    difficulty: "hard",
    distanceKm: 7,
    elevationGainM: 700,
    peakElevationM: 1740,
    durationHrs: 5,
    rating: 4.5,
    reviewCount: 98,
    tags: ["Waterfall", "Steep", "Pine forest"],
    summary: "A steep pine-forest climb beside Sri Lanka's tallest waterfall to a plateau viewpoint.",
    description:
      "Follows an old plantation track up alongside the country's tallest waterfall, gaining height quickly through pine forest. The upper plateau gives a rare top-down view of the falls. Footing is loose in places — trekking poles recommended.",
    bestSeason: "Dec – Mar",
    startPoint: [6.7833, 80.7833],
    elevationProfile: [1040, 1250, 1450, 1650, 1740],
    illustration: "dusk",
  },
  {
    mockId: "t8",
    slug: "riverston-mini-worlds-end",
    name: "Riverston & Mini World's End",
    district: "Matale",
    region: "Knuckles Massif",
    difficulty: "moderate",
    distanceKm: 6,
    elevationGainM: 300,
    peakElevationM: 1150,
    durationHrs: 3,
    rating: 4.6,
    reviewCount: 210,
    tags: ["Viewpoint", "Cave", "Cloud forest"],
    summary: "A ridge walk through the Knuckles foothills to a sheer drop and a hidden cave pool.",
    description:
      "An approachable slice of the Knuckles range, following a ridge track to the Mini World's End viewpoint before dropping to a cave with a natural pool. Roads in are rough — a 4WD or trail vehicle is recommended for the approach.",
    bestSeason: "Feb – Apr",
    startPoint: [7.423, 80.764],
    elevationProfile: [900, 1000, 1080, 1150, 1050],
    illustration: "midday",
  },
  {
    mockId: "t9",
    slug: "liptons-seat",
    name: "Lipton's Seat",
    district: "Badulla",
    region: "Hill Country",
    difficulty: "easy",
    distanceKm: 8,
    elevationGainM: 320,
    peakElevationM: 1970,
    durationHrs: 3,
    rating: 4.7,
    reviewCount: 265,
    tags: ["Tea estate", "Sunrise", "Gentle grade"],
    summary: "A gentle switchback walk through Dambatenne tea estate said to offer views of four provinces.",
    description:
      "A wide estate road climbs gradually through the Dambatenne tea gardens once walked by Sir Thomas Lipton himself. The grade is gentle throughout, making it one of the most accessible high-elevation viewpoints on the island. Clearest at first light.",
    bestSeason: "Year-round",
    startPoint: [6.7784, 81.0644],
    elevationProfile: [1650, 1750, 1850, 1930, 1970],
    illustration: "dawn",
  },
  {
    mockId: "t10",
    slug: "moulawella-peak-sinharaja",
    name: "Moulawella Peak, Sinharaja",
    district: "Ratnapura",
    region: "Rainforest",
    difficulty: "hard",
    distanceKm: 12,
    elevationGainM: 500,
    peakElevationM: 760,
    durationHrs: 6,
    rating: 4.6,
    reviewCount: 143,
    tags: ["Rainforest", "Leeches", "Guide required"],
    summary: "A humid rainforest trek through Sri Lanka's last major lowland rainforest to a canopy viewpoint.",
    description:
      "Deep within Sinharaja Forest Reserve, this trail follows old logging tracks through dense, humid rainforest thick with endemic species. Leech socks are essential in wet season. A licensed forest guide is mandatory and can be arranged at the Kudawa entrance.",
    bestSeason: "Jan – Mar",
    startPoint: [6.4098, 80.45],
    elevationProfile: [200, 350, 500, 650, 760],
    illustration: "misty",
  },
];

const gearShops: {
  name: string;
  district: string;
  address: string;
  rating: number;
  reviewCount: number;
  nearTrails: string[];
  items: { name: string; category: Category; pricePerDay: number; available: number; description: string }[];
}[] = [
  {
    name: "Ella Trailhead Outfitters",
    district: "Badulla",
    address: "Main Street, near Ella Railway Station",
    rating: 4.7,
    reviewCount: 186,
    nearTrails: ["Ella Rock", "Little Adam's Peak", "Lipton's Seat", "Bambarakanda Falls Summit"],
    items: [
      { name: "2-Person Trek Tent", category: "Shelter", pricePerDay: 1200, available: 8, description: "Freestanding double-wall tent, packs to 2.1 kg." },
      { name: "60L Trekking Backpack", category: "Pack", pricePerDay: 600, available: 15, description: "Adjustable harness, rain cover included." },
      { name: "Sleeping Mat", category: "Sleep", pricePerDay: 200, available: 18, description: "Insulated foam roll mat." },
      { name: "Trekking Pole Pair", category: "Safety", pricePerDay: 250, available: 22, description: "Adjustable aluminium poles for steep descents." },
    ],
  },
  {
    name: "Horton Plains Basecamp",
    district: "Nuwara Eliya",
    address: "Near Horton Plains park entrance",
    rating: 4.6,
    reviewCount: 94,
    nearTrails: ["World's End, Horton Plains"],
    items: [
      { name: "4-Person Base Tent", category: "Shelter", pricePerDay: 2000, available: 4, description: "Roomy family/group tent for trailhead camping." },
      { name: "Portable Gas Stove Kit", category: "Cook", pricePerDay: 450, available: 10, description: "Includes stove, gas canister and 2-pot cook set." },
      { name: "Sleeping Bag (5°C)", category: "Sleep", pricePerDay: 500, available: 12, description: "Rated for cold nights at Horton Plains elevation." },
    ],
  },
  {
    name: "Sri Pada Pilgrim Supplies",
    district: "Ratnapura",
    address: "Nallathanniya base village",
    rating: 4.8,
    reviewCount: 231,
    nearTrails: ["Adam's Peak (Sri Pada)"],
    items: [
      { name: "Headlamp + Spare Batteries", category: "Safety", pricePerDay: 150, available: 25, description: "Essential for the overnight climb to the summit shrine." },
      { name: "Trekking Pole Pair", category: "Safety", pricePerDay: 250, available: 20, description: "Adjustable aluminium poles for the descent." },
      { name: "Sleeping Bag (5°C)", category: "Sleep", pricePerDay: 500, available: 8, description: "For a rest stop before the pre-dawn summit push." },
    ],
  },
  {
    name: "Sinharaja Rainforest Gear",
    district: "Ratnapura",
    address: "Kudawa Conservation Center entrance",
    rating: 4.6,
    reviewCount: 67,
    nearTrails: ["Moulawella Peak, Sinharaja"],
    items: [
      { name: "Leech Sock Set", category: "Safety", pricePerDay: 100, available: 30, description: "Rainforest essential in wet season." },
      { name: "30L Day Pack", category: "Pack", pricePerDay: 350, available: 14, description: "Lightweight pack for the forest trek." },
      { name: "Headlamp + Spare Batteries", category: "Safety", pricePerDay: 150, available: 16, description: "For the dense forest canopy shade." },
    ],
  },
  {
    name: "Knuckles & Riverston Trekking Hub",
    district: "Matale",
    address: "Riverston viewpoint road, near Corbett's Gap",
    rating: 4.5,
    reviewCount: 112,
    nearTrails: ["Knuckles Range Traverse", "Riverston & Mini World's End", "Pidurangala Rock"],
    items: [
      { name: "30L Day Pack", category: "Pack", pricePerDay: 350, available: 20, description: "Lightweight pack for single-day summit hikes." },
      { name: "Trekking Pole Pair", category: "Safety", pricePerDay: 250, available: 22, description: "Adjustable aluminium poles for steep descents." },
      { name: "Portable Gas Stove Kit", category: "Cook", pricePerDay: 450, available: 10, description: "Includes stove, gas canister and 2-pot cook set." },
      { name: "2-Person Trek Tent", category: "Shelter", pricePerDay: 1200, available: 6, description: "Freestanding double-wall tent for the back-country sections." },
    ],
  },
];

const parkingSpots: {
  name: string;
  district: string;
  nearTrail: string;
  coords: [number, number];
  pricePerDay: number;
  capacity: number;
  secured: boolean;
  surface: "Paved" | "Gravel" | "Grass";
}[] = [
  { name: "Ella Railway Yard Parking", district: "Badulla", nearTrail: "Ella Rock", coords: [6.8756, 81.0462], pricePerDay: 300, capacity: 40, secured: true, surface: "Gravel" },
  { name: "Adam's Peak Base (Nallathanniya)", district: "Ratnapura", nearTrail: "Adam's Peak (Sri Pada)", coords: [6.8215, 80.4931], pricePerDay: 250, capacity: 120, secured: true, surface: "Paved" },
  { name: "Horton Plains Entrance Lot", district: "Nuwara Eliya", nearTrail: "World's End, Horton Plains", coords: [6.8064, 80.7999], pricePerDay: 400, capacity: 80, secured: true, surface: "Paved" },
  { name: "Pidurangala Trailhead Yard", district: "Matale", nearTrail: "Pidurangala Rock", coords: [7.9601, 80.7515], pricePerDay: 200, capacity: 35, secured: false, surface: "Gravel" },
  { name: "Dambatenne Estate Lot", district: "Badulla", nearTrail: "Lipton's Seat", coords: [6.7802, 81.0602], pricePerDay: 150, capacity: 25, secured: false, surface: "Grass" },
  { name: "Kudawa Conservation Center", district: "Ratnapura", nearTrail: "Moulawella Peak, Sinharaja", coords: [6.4083, 80.4553], pricePerDay: 200, capacity: 20, secured: true, surface: "Gravel" },
];

const reviews: { mockTrailId: string; author: string; rating: number; date: string; body: string; tags: string[] }[] = [
  { mockTrailId: "t1", author: "Ishara W.", rating: 5, date: "2026-08-14", body: "Went up before sunrise via the railway line — quiet, misty, and the summit view over the gap was worth every step. Bring a torch for the track walk.", tags: ["Sunrise", "Solo"] },
  { mockTrailId: "t3", author: "Devin R.", rating: 5, date: "2026-04-02", body: "Climbed overnight for Vesak season, the whole staircase was lit up like a string of lights. Legs were destroyed for two days after but the sunrise above the clouds was unreal.", tags: ["Night hike", "Pilgrimage"] },
  { mockTrailId: "t4", author: "Anoma P.", rating: 4, date: "2026-02-19", body: "Get there for the 6am gate opening or you'll just see white. Baker's Falls loop back is a nice add-on and barely adds any time.", tags: ["Early start"] },
  { mockTrailId: "t2", author: "Sam K.", rating: 5, date: "2026-07-30", body: "Perfect first hike for the kids. Steady incline, no scrambling, and the tea estate views alone are worth it even before the top.", tags: ["Family friendly"] },
  { mockTrailId: "t6", author: "Nadeesha F.", rating: 5, date: "2026-06-11", body: "Cheaper and less crowded than Sigiriya itself, and honestly the better sunrise spot. The last scramble needs both hands, wear proper shoes.", tags: ["Sunrise", "Scramble"] },
  { mockTrailId: "t10", author: "Chamod L.", rating: 4, date: "2026-01-22", body: "Our guide from Kudawa knew every bird call in the forest. Wet, humid, leeches everywhere in January — the leech socks from the rental page genuinely saved us.", tags: ["Guide", "Rainforest"] },
];

async function seed() {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    await client.query("TRUNCATE TABLE trips, reviews, parking_spots, shop_items, gear_shop_trails, gear_shops, trails CASCADE");

    const mockIdToDbId = new Map<string, string>();
    const nameToDbId = new Map<string, string>();

    for (const t of [...trails, ...moreTrails]) {
      const id = (await insertTrail(client, t))!;
      mockIdToDbId.set(t.mockId, id);
      nameToDbId.set(t.name, id);
    }
    await applyTrailCosts(client);
    console.log(`seeded ${trails.length + moreTrails.length} trails`);

    for (const shop of gearShops) {
      const { rows } = await client.query<{ id: string }>(
        `INSERT INTO gear_shops (name, district, address, rating, review_count)
         VALUES ($1,$2,$3,$4,$5) RETURNING id`,
        [shop.name, shop.district, shop.address, shop.rating, shop.reviewCount]
      );
      const shopId = rows[0].id;

      for (const item of shop.items) {
        await client.query(
          `INSERT INTO shop_items (shop_id, name, category, price_per_day, available, description)
           VALUES ($1,$2,$3,$4,$5,$6)`,
          [shopId, item.name, item.category, item.pricePerDay, item.available, item.description]
        );
      }

      for (const trailName of shop.nearTrails) {
        const trailId = nameToDbId.get(trailName);
        if (!trailId) throw new Error(`Seed error: shop "${shop.name}" references unknown trail "${trailName}"`);
        await client.query(`INSERT INTO gear_shop_trails (shop_id, trail_id) VALUES ($1,$2)`, [shopId, trailId]);
      }
    }
    await insertRealShops(client);
    console.log(`seeded ${gearShops.length} placeholder + real gear shops`);

    for (const p of parkingSpots) {
      const trailId = nameToDbId.get(p.nearTrail);
      if (!trailId) throw new Error(`Seed error: parking "${p.name}" references unknown trail "${p.nearTrail}"`);
      await client.query(
        `INSERT INTO parking_spots (name, district, trail_id, lat, lng, price_per_day, capacity, secured, surface)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
        [p.name, p.district, trailId, p.coords[0], p.coords[1], p.pricePerDay, p.capacity, p.secured, p.surface]
      );
    }
    console.log(`seeded ${parkingSpots.length} parking spots`);

    for (const r of reviews) {
      const trailId = mockIdToDbId.get(r.mockTrailId);
      if (!trailId) throw new Error(`Seed error: review references unknown trail id "${r.mockTrailId}"`);
      await client.query(
        `INSERT INTO reviews (trail_id, author, rating, body, tags, created_at)
         VALUES ($1,$2,$3,$4,$5,$6)`,
        [trailId, r.author, r.rating, r.body, r.tags, new Date(r.date)]
      );
    }
    console.log(`seeded ${reviews.length} reviews`);

    await client.query("COMMIT");
    console.log("Seed complete.");
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}

seed()
  .catch((err) => {
    console.error("Seed failed:", err);
    process.exitCode = 1;
  })
  .finally(() => pool.end());
