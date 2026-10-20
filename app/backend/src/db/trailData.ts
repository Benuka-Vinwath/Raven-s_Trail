import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import type { PoolClient } from "pg";

export interface SeedTrail {
  mockId: string;
  slug: string;
  name: string;
  district: string;
  region: string;
  difficulty: "easy" | "moderate" | "hard";
  distanceKm: number;
  elevationGainM: number;
  peakElevationM: number;
  durationHrs: number;
  rating: number;
  reviewCount: number;
  tags: string[];
  summary: string;
  description: string;
  bestSeason: string;
  startPoint: [number, number];
  elevationProfile: number[];
  illustration: "dawn" | "misty" | "midday" | "dusk";
}

// Budget-planner costs live in a migration (idempotent); re-run it after trails are (re)created.
export async function applyTrailCosts(client: PoolClient) {
  const file = path.join(path.dirname(fileURLToPath(import.meta.url)), "sql/003_trail_costs.sql");
  await client.query(await readFile(file, "utf8"));
}

export async function insertTrail(client: PoolClient, t: SeedTrail, skipIfExists = false): Promise<string | null> {
  const { rows } = await client.query<{ id: string }>(
    `INSERT INTO trails
      (slug, name, district, region, difficulty, distance_km, elevation_gain_m, peak_elevation_m,
       duration_hrs, rating, review_count, tags, summary, description, best_season,
       start_lat, start_lng, elevation_profile, illustration)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19)
     ${skipIfExists ? "ON CONFLICT (slug) DO NOTHING" : ""}
     RETURNING id`,
    [
      t.slug, t.name, t.district, t.region, t.difficulty, t.distanceKm, t.elevationGainM, t.peakElevationM,
      t.durationHrs, t.rating, t.reviewCount, t.tags, t.summary, t.description, t.bestSeason,
      t.startPoint[0], t.startPoint[1], t.elevationProfile, t.illustration,
    ]
  );
  return rows[0]?.id ?? null;
}

// Added in a second batch. Sources: Wikipedia and OpenStreetMap (coordinates, peak heights), the official
// Pekoe Trail site (stage distance, hours, difficulty), and public trail guides. Distances, climbs and times
// vary between sources, so they are rounded estimates. Ratings start at 0 because nobody has reviewed these yet.
const APPROX = "Distances, climb and times are approximate, so confirm them locally before you go.";

export const moreTrails: SeedTrail[] = [
  {
    mockId: "n1", slug: "sigiriya-rock", name: "Sigiriya Rock", district: "Matale", region: "Cultural Triangle",
    difficulty: "moderate", distanceKm: 3, elevationGainM: 200, peakElevationM: 349, durationHrs: 2.5, rating: 0, reviewCount: 0,
    tags: ["Ancient fortress", "UNESCO", "Steps"],
    summary: "Climb about 1,200 steps up a 180 m granite column to the ruins of a 5th-century rock fortress.",
    description: `The stairway climbs in three stages past the Mirror Wall and the Lion Gate platform to the summit gardens and palace ruins. The effort is mostly heat rather than technique, so start at opening time and carry water because there are no vendors inside the site. Weekends and public holidays get crowded and the narrow stairs move in single file. ${APPROX}`,
    bestSeason: "Jan – Apr", startPoint: [7.9569, 80.7597], elevationProfile: [180, 215, 260, 305, 349], illustration: "midday",
  },
  {
    mockId: "n2", slug: "mihintale", name: "Mihintale", district: "Anuradhapura", region: "Cultural Triangle",
    difficulty: "easy", distanceKm: 3.5, elevationGainM: 150, peakElevationM: 300, durationHrs: 2, rating: 0, reviewCount: 0,
    tags: ["Pilgrimage", "Steps", "Sunset"],
    summary: "A wide granite staircase of 1,840 steps to the cradle of Buddhism in Sri Lanka, with views over the plains.",
    description: `Mihintale is where the monk Mahinda is said to have met King Devanampiyatissa, and the climb passes shrines and ruins on its way to the Ambasthala dagoba at the top. The steps are broad and shaded in places, but the final stretch over rock can be slippery. Go late afternoon for sunset, and dress modestly and go barefoot at the religious sites. ${APPROX}`,
    bestSeason: "Year-round", startPoint: [8.3506, 80.5169], elevationProfile: [130, 170, 210, 255, 300], illustration: "dusk",
  },
  {
    mockId: "n3", slug: "dunhinda-falls", name: "Dunhinda Falls", district: "Badulla", region: "Hill Country",
    difficulty: "easy", distanceKm: 2.5, elevationGainM: 100, peakElevationM: 800, durationHrs: 1.5, rating: 0, reviewCount: 0,
    tags: ["Waterfall", "Short walk", "Viewpoint"],
    summary: "A short stepped walk through forest to the misty 'Bridal Veil' waterfall, with a second lookout on the way.",
    description: `The path starts near the Badulla road and runs about 1 to 1.5 km each way, mostly down stone steps, to a viewing platform facing the main fall. Halfway down there is a second lookout over the smaller Kuda Dunhinda. The rocks are slippery from spray, so wear shoes with grip. ${APPROX}`,
    bestSeason: "Year-round", startPoint: [7.0167, 81.0667], elevationProfile: [800, 770, 745, 725, 745, 775, 800], illustration: "misty",
  },
  {
    mockId: "n4", slug: "namunukula-peak", name: "Namunukula Peak", district: "Badulla", region: "Hill Country",
    difficulty: "hard", distanceKm: 10, elevationGainM: 900, peakElevationM: 2036, durationHrs: 6, rating: 0, reviewCount: 0,
    tags: ["Summit", "Leeches", "Fog"],
    summary: "The main peak of the 'Nine Peaks' range above Passara, a steep and often foggy climb to 2,036 m.",
    description: `Routes start from several points around Passara, Spring Valley and the Gonakale tea estate, and sources quote 3 to 5 hours to reach the top. The upper forest is slippery and fog-bound, there are no reliable clean water sources, and leeches are common in wet months. Go in the dry season and take a local guide. ${APPROX}`,
    bestSeason: "Jan – Sep", startPoint: [6.9475, 81.1475], elevationProfile: [1150, 1350, 1550, 1750, 2036, 1750, 1350], illustration: "misty",
  },
  {
    mockId: "n5", slug: "narangala-mountain", name: "Narangala Mountain", district: "Badulla", region: "Hill Country",
    difficulty: "moderate", distanceKm: 6, elevationGainM: 450, peakElevationM: 1521, durationHrs: 4, rating: 0, reviewCount: 0,
    tags: ["Camping", "Sunrise", "Grassland"],
    summary: "A grassy summit ridge above Haliela with 360° views, popular for overnight camping.",
    description: `The route starts near a Hindu shrine at the Thangamale tea estate, follows a large pipeline up to a gravel road, then climbs the open grass to the top. Hikers camp on the summit for sunrise, so bring warm layers, water and leech protection. Avoid the wet season, when the trail is slippery and views disappear. ${APPROX}`,
    bestSeason: "Jan – Sep", startPoint: [7.027, 80.9972], elevationProfile: [1100, 1200, 1300, 1420, 1521, 1420, 1250], illustration: "dawn",
  },
  {
    mockId: "n6", slug: "diyaluma-falls", name: "Diyaluma Falls", district: "Badulla", region: "Hill Country",
    difficulty: "moderate", distanceKm: 3, elevationGainM: 150, peakElevationM: 890, durationHrs: 2.5, rating: 0, reviewCount: 0,
    tags: ["Waterfall", "Natural pools", "Swimming"],
    summary: "Walk to the top of Sri Lanka's second-highest waterfall (220 m) and bathe in the natural pools above the drop.",
    description: `The shorter route starts from Poonagala Road and takes about 30 to 45 minutes through tall grass to the top pools, while the steeper route from Koslanda is rougher. The pools are popular for swimming, but the cliff edges are steep and water levels change with the season, so stay well back from the drop. Closed shoes are advisable. ${APPROX}`,
    bestSeason: "Jan – Mar", startPoint: [6.7333, 81.0315], elevationProfile: [890, 860, 830, 820, 830, 860, 890], illustration: "midday",
  },
  {
    mockId: "n7", slug: "kirigalpotta", name: "Kirigalpotta", district: "Nuwara Eliya", region: "Hill Country",
    difficulty: "hard", distanceKm: 14, elevationGainM: 450, peakElevationM: 2388, durationHrs: 6, rating: 0, reviewCount: 0,
    tags: ["Highest public summit", "Horton Plains", "Guide required"],
    summary: "Sri Lanka's second-highest mountain, and the highest whose summit the public can reach, via Horton Plains.",
    description: `A single trail of roughly 7 km each way crosses the cloud-forest and grassland of Horton Plains National Park, with bogs and stream crossings on the way. Operators describe it as a full-day trek, and the weather turns some hikers back. You need park entry and normally a guide. ${APPROX}`,
    bestSeason: "Jan – Mar", startPoint: [6.8067, 80.8021], elevationProfile: [2150, 2200, 2250, 2300, 2388, 2300, 2200], illustration: "misty",
  },
  {
    mockId: "n8", slug: "totapola-kanda", name: "Totapola Kanda", district: "Nuwara Eliya", region: "Hill Country",
    difficulty: "easy", distanceKm: 2.7, elevationGainM: 160, peakElevationM: 2357, durationHrs: 1.5, rating: 0, reviewCount: 0,
    tags: ["Short hike", "Horton Plains", "Cloud forest"],
    summary: "A short climb through shrub and cloud forest to the third-highest mountain in Sri Lanka.",
    description: `The trail starts a few metres from the Pattipola entrance to Horton Plains and climbs about 2 km to a summit with an antenna and limited views because of the dense vegetation. It is a quick outing of about an hour or so. Because it lies inside the park, a park fee applies and you should confirm access rules with the Department of Wildlife Conservation. ${APPROX}`,
    bestSeason: "Jan – Mar", startPoint: [6.8331, 80.8197], elevationProfile: [2200, 2250, 2300, 2340, 2357, 2330, 2260], illustration: "misty",
  },
  {
    mockId: "n9", slug: "bible-rock", name: "Bible Rock (Bathalegala)", district: "Kegalle", region: "Sabaragamuwa",
    difficulty: "moderate", distanceKm: 6, elevationGainM: 470, peakElevationM: 670, durationHrs: 5, rating: 0, reviewCount: 0,
    tags: ["Scramble", "Rock summit", "Day trip from Colombo"],
    summary: "A forest climb and rock scramble to a book-shaped summit near Aranayake, about 3 hours from Colombo.",
    description: `Bible Rock is named for its resemblance to a book on a lectern. Guides start before dawn from the base near Ussapitiya, and sources put the ascent at roughly 2 to 3 hours each way, with some stretches over exposed rock where you need your hands. There are no facilities on the trail, so carry plenty of water. ${APPROX}`,
    bestSeason: "Dec – Mar", startPoint: [7.1883, 80.4344], elevationProfile: [200, 260, 340, 430, 540, 670], illustration: "dawn",
  },
  {
    mockId: "n10", slug: "lakegala-meemure", name: "Lakegala & Meemure", district: "Matale", region: "Knuckles Massif",
    difficulty: "hard", distanceKm: 10, elevationGainM: 700, peakElevationM: 1255, durationHrs: 7, rating: 0, reviewCount: 0,
    tags: ["Remote village", "Rock summit", "Leeches"],
    summary: "Trek into one of Sri Lanka's most remote villages and climb the rock peak that towers over it.",
    description: `Meemure is reached only on foot or by a very rough track, and its homestays make a good base for climbing Lakegala, the 'Rock of Lanka'. The climb is steep through forest, then opens onto exposed rock with views across the Knuckles massif. A village guide is strongly recommended because the upper sections involve scrambling and route-finding that is hard in cloud or rain. Leeches are common. ${APPROX}`,
    bestSeason: "Jun – Sep", startPoint: [7.4333, 80.8333], elevationProfile: [600, 750, 900, 1050, 1180, 1255], illustration: "misty",
  },
  {
    mockId: "n11", slug: "ravana-ella-cave", name: "Ravana Falls & Cave", district: "Badulla", region: "Hill Country",
    difficulty: "moderate", distanceKm: 4, elevationGainM: 150, peakElevationM: 1370, durationHrs: 2.5, rating: 0, reviewCount: 0,
    tags: ["Waterfall", "Cave", "Steps"],
    summary: "One of Sri Lanka's widest waterfalls, plus a steep climb of about 650 to 700 steps to Ravana Cave.",
    description: `The falls sit beside the Ella road, and the cave trail starts near a small temple and climbs steps, some broken or missing so you use bare rock as footholds. Count on 45 to 60 minutes from the temple to the cave. Tuk-tuks run from Ella to the trailhead. ${APPROX}`,
    bestSeason: "Dec – Mar", startPoint: [6.8408, 81.0544], elevationProfile: [1250, 1290, 1320, 1345, 1370], illustration: "midday",
  },
  {
    mockId: "n12", slug: "nine-arch-bridge", name: "Nine Arch Bridge Walk", district: "Badulla", region: "Hill Country",
    difficulty: "easy", distanceKm: 4, elevationGainM: 60, peakElevationM: 1010, durationHrs: 1.5, rating: 0, reviewCount: 0,
    tags: ["Railway walk", "Landmark", "Photography"],
    summary: "An easy walk from Ella along the railway to the colonial-era 'Bridge in the Sky'.",
    description: `Walk to Ella station, follow the track toward Demodara and pass through a short tunnel to reach the viaduct, about 2 km from town in 20 to 40 minutes. The line is a working railway, so listen for trains and keep off the track when one approaches. A road route from the Ella–Passara road also reaches the bridge. ${APPROX}`,
    bestSeason: "Dec – Mar", startPoint: [6.8736, 81.049], elevationProfile: [1010, 990, 970, 962, 975, 995, 1010], illustration: "dawn",
  },
  {
    mockId: "n13", slug: "ambuluwawa-tower", name: "Ambuluwawa Tower", district: "Kandy", region: "Central Highlands",
    difficulty: "moderate", distanceKm: 11, elevationGainM: 580, peakElevationM: 1100, durationHrs: 4.5, rating: 0, reviewCount: 0,
    tags: ["Viewpoint", "Multi-faith site", "Road climb"],
    summary: "A long climb from Gampola up to a spiral tower on a hilltop shared by Buddhist, Hindu, Christian and Muslim shrines.",
    description: `Guides describe a walk of 5 to 6 km up from Gampola with about 550 to 600 m of ascent, mostly along the access road and tracks. The tower itself is roughly 48 to 55 m tall and has a spiral outer staircase with long views. Many visitors drive most of the way instead. ${APPROX}`,
    bestSeason: "Dec – Apr", startPoint: [7.164, 80.574], elevationProfile: [490, 600, 720, 840, 960, 1060, 1100], illustration: "midday",
  },
  {
    mockId: "n14", slug: "lovers-leap-falls", name: "Lover's Leap Falls", district: "Nuwara Eliya", region: "Hill Country",
    difficulty: "easy", distanceKm: 5, elevationGainM: 120, peakElevationM: 1900, durationHrs: 2, rating: 0, reviewCount: 0,
    tags: ["Waterfall", "Tea country", "Easy walk"],
    summary: "A gentle walk through tea gardens from the Pedro estate to a 30 m waterfall above Nuwara Eliya.",
    description: `Start at Pedro Tea Estate, follow a dirt track past the factory and the tea manager's bungalow, then take a foot-only path through the gardens to the base of the fall. It is about 5 km round trip, and you can shorten it by taking a tuk-tuk partway. Rocks are slippery in the rain. ${APPROX}`,
    bestSeason: "Feb – May", startPoint: [6.9527, 80.7735], elevationProfile: [1890, 1900, 1910, 1895, 1880, 1890], illustration: "dawn",
  },
  {
    mockId: "n15", slug: "single-tree-hill", name: "Single Tree Hill", district: "Nuwara Eliya", region: "Hill Country",
    difficulty: "moderate", distanceKm: 6, elevationGainM: 250, peakElevationM: 2100, durationHrs: 4, rating: 0, reviewCount: 0,
    tags: ["Lake views", "Day hike", "Tea country"],
    summary: "A half-day hike from Nuwara Eliya to a 2,100 m hilltop looking over Lake Gregory and the surrounding peaks.",
    description: `The hill rises only about 250 m above Nuwara Eliya, so it feels more like a brisk hill walk than a mountain. Guided hikes usually leave early, reach the top by mid-morning and finish with a picnic by Lake Gregory. Reasonable fitness is enough. ${APPROX}`,
    bestSeason: "Feb – May", startPoint: [6.9578, 80.7625], elevationProfile: [1850, 1930, 2000, 2060, 2100, 2040, 1930], illustration: "dawn",
  },
  {
    mockId: "n16", slug: "hanthana-range", name: "Hanthana Mountain Range", district: "Kandy", region: "Central Highlands",
    difficulty: "moderate", distanceKm: 10, elevationGainM: 450, peakElevationM: 1240, durationHrs: 6, rating: 0, reviewCount: 0,
    tags: ["Ridge walk", "Day hike from Kandy", "Seven peaks"],
    summary: "A protected seven-peak range south-west of Kandy, with ridge walks and views of the city and Knuckles.",
    description: `The range stretches about 20 km toward Galaha, and the tourism board lists four routes, including one from Kandy across the Udawela tea estate. Katusu Konda has a narrow rocky ridge with steep drops, so take care there. Most people reach the main viewpoint in 1 to 2 hours, and a full guided day takes roughly 5 to 8. ${APPROX}`,
    bestSeason: "Jan – Apr", startPoint: [7.2678, 80.6328], elevationProfile: [790, 900, 1020, 1120, 1240, 1150, 1000], illustration: "midday",
  },
  {
    mockId: "n17", slug: "pekoe-trail-stage-1", name: "Pekoe Trail Stage 1: Hanthana to Galaha", district: "Kandy", region: "Pekoe Trail",
    difficulty: "easy", distanceKm: 12.84, elevationGainM: 500, peakElevationM: 1008, durationHrs: 4, rating: 0, reviewCount: 0,
    tags: ["Pekoe Trail", "Point to point", "Tea country"],
    summary: "The first stage of the 300 km Pekoe Trail, from the Hanthana range down through villages and tea to Galaha.",
    description: `This point-to-point stage climbs to a high point of about 1,000 m soon after a meditation centre turn-off, then descends toward a river crossing before Galaha. The official Pekoe Trail site rates it easy at about 4 hours; other trackers log 380 to 540 m of climbing. You need a transfer back or onward at the end. ${APPROX}`,
    bestSeason: "Dec – Apr", startPoint: [7.2678, 80.6328], elevationProfile: [800, 900, 1008, 950, 880, 838], illustration: "dawn",
  },
  {
    mockId: "n18", slug: "pekoe-trail-stage-13", name: "Pekoe Trail Stage 13: Haputale to St. Catherine's", district: "Badulla", region: "Pekoe Trail",
    difficulty: "hard", distanceKm: 14.6, elevationGainM: 718, peakElevationM: 1600, durationHrs: 4, rating: 0, reviewCount: 0,
    tags: ["Pekoe Trail", "Point to point", "Tea trails"],
    summary: "A hard day on the Pekoe Trail from Haputale through forest reserve and up along tea estate tracks to St. Catherine's.",
    description: `The official Pekoe Trail site lists this stage at 14.6 km, rated hard, with about 4 hours of hiking time, while trackers log roughly 718 m of climbing. It passes through a forest reserve and then along tea trails, with views toward Lipton's Seat. Check the trail's current alerts before you go, as stages close during heavy rain. ${APPROX}`,
    bestSeason: "Dec – Apr", startPoint: [6.7682, 80.9602], elevationProfile: [1430, 1300, 1150, 1300, 1450, 1600, 1500], illustration: "misty",
  },
  {
    mockId: "n19", slug: "hawagala", name: "Hawagala", district: "Ratnapura", region: "Sabaragamuwa",
    difficulty: "moderate", distanceKm: 8, elevationGainM: 700, peakElevationM: 1409, durationHrs: 5, rating: 0, reviewCount: 0,
    tags: ["Summit", "Pine forest", "Leeches"],
    summary: "A steady climb from Landuyaya through tea, pine and jungle to a mountain with wide views over Belihuloya.",
    description: `The usual approach is from Balangoda toward Belihuloya, starting near the shop at Landuyaya junction. One hiker reached the top in about two hours, passing tea gardens, pine forest and thick jungle. There is no permanent water on the mountain, so carry plenty, and expect leeches. Buses to Landuyaya run roughly once an hour. ${APPROX}`,
    bestSeason: "Dec – Mar", startPoint: [6.7221, 80.7438], elevationProfile: [700, 850, 1000, 1150, 1300, 1409], illustration: "misty",
  },
  {
    mockId: "n20", slug: "kabaragala", name: "Kabaragala", district: "Kandy", region: "Central Highlands",
    difficulty: "moderate", distanceKm: 7, elevationGainM: 500, peakElevationM: 1506, durationHrs: 4, rating: 0, reviewCount: 0,
    tags: ["Camping", "Grassland", "Cliff edge"],
    summary: "The highest peak of the Dolosbage range, a grassy ridge with a dedicated path and sheer cliff edges.",
    description: `The trail starts at Maryville Junction on the Nawalapitiya–Dolosbage road. A hiker's account describes about two hours to the camping spot on top, and the route has a defined path so it suits beginners with some fitness. The summit is exposed, so bring warm layers and keep well back from the cliff edge, especially in cloud. ${APPROX}`,
    bestSeason: "Jan – Apr", startPoint: [7.0694, 80.5031], elevationProfile: [1000, 1120, 1250, 1370, 1450, 1506], illustration: "dawn",
  },
  {
    mockId: "n21", slug: "rakshagala", name: "Rakshagala", district: "Kandy", region: "Central Highlands",
    difficulty: "moderate", distanceKm: 5, elevationGainM: 400, peakElevationM: 1300, durationHrs: 3, rating: 0, reviewCount: 0,
    tags: ["Viewpoint", "Dolosbage", "Local guide"],
    summary: "A viewpoint peak in the Raxawa estate near Dolosbage, looking across the neighbouring Kabaragala ridge.",
    description: `Rakshagala sits in the Raxawa estate in Dolosbage, close to the Kabaragala range. Very little route detail is published, so treat these figures as rough guesses, ask at the estate or in Dolosbage for the current path, and go with someone who knows it. Fog moves in quickly on this side of the range. ${APPROX}`,
    bestSeason: "Jan – Apr", startPoint: [7.0832, 80.5069], elevationProfile: [900, 1000, 1100, 1200, 1300], illustration: "misty",
  },
  {
    mockId: "n22", slug: "alagalla", name: "Alagalla Mountain Range", district: "Kegalle", region: "Sabaragamuwa",
    difficulty: "hard", distanceKm: 14, elevationGainM: 900, peakElevationM: 1140, durationHrs: 7, rating: 0, reviewCount: 0,
    tags: ["Full-day climb", "Train access", "Local guide"],
    summary: "A long, steep climb from Ihala Kotte railway station to the summit ridge on the Kandy–Kegalle border.",
    description: `The Ihala Kotte route starts at the railway station and is the harder way up. The other start at Poththapitiya is considered easier. One visitor logged about 7 km each way and around 4 hours to the top. Plan a full day, take a local guide, and avoid the rainy months of May and June. ${APPROX}`,
    bestSeason: "Dec – Apr", startPoint: [7.298, 80.4716], elevationProfile: [250, 400, 580, 760, 940, 1140], illustration: "midday",
  },
  {
    mockId: "n23", slug: "haritha-kanda", name: "Haritha Kanda", district: "Nuwara Eliya", region: "Hill Country",
    difficulty: "moderate", distanceKm: 4, elevationGainM: 250, peakElevationM: 1800, durationHrs: 3, rating: 0, reviewCount: 0,
    tags: ["Camping", "Rocky peak", "Bogawantalawa"],
    summary: "A rocky peak above Bogawantalawa, good for a short hike or an overnight camp with strong winds and big views.",
    description: `The approach starts near a temple by a tea estate, passes a vehicle barrier, makes a short steep climb, then follows about 1.5 km of easier walking to the summit rocks. Guides say you do not need prior permission to camp, but you must bring everything you need. It is windy and cool on top and rain is common. ${APPROX}`,
    bestSeason: "Jan – Mar", startPoint: [6.8174, 80.6992], elevationProfile: [1550, 1620, 1690, 1750, 1800], illustration: "misty",
  },
  {
    mockId: "n24", slug: "uthuwankanda", name: "Uthuwankanda", district: "Kegalle", region: "Sabaragamuwa",
    difficulty: "moderate", distanceKm: 4, elevationGainM: 300, peakElevationM: 430, durationHrs: 2.5, rating: 0, reviewCount: 0,
    tags: ["Rock summit", "Short hike", "History"],
    summary: "A short, rewarding climb to a rocky summit near Mawanella, an easy day trip from Kandy or Colombo.",
    description: `The turnoff is on the Colombo–Kandy road about 1.5 km before Mawanella, and there is a village camp at the start where you ask permission. The first part is easy, but the upper path is steep and can be dangerous, so take care. Avoid climbing in the rainy season. The summit is about 430 m above sea level. ${APPROX}`,
    bestSeason: "Dec – Mar", startPoint: [7.2617, 80.4191], elevationProfile: [130, 190, 260, 340, 430], illustration: "midday",
  },
  {
    mockId: "n25", slug: "yapahuwa-rock", name: "Yapahuwa Rock Fortress", district: "Kurunegala", region: "Cultural Triangle",
    difficulty: "easy", distanceKm: 2, elevationGainM: 90, peakElevationM: 310, durationHrs: 1.5, rating: 0, reviewCount: 0,
    tags: ["Ancient capital", "Steps", "Short climb"],
    summary: "Climb a steep ornamental stone staircase to the ruins of a medieval capital built on a granite rock.",
    description: `Yapahuwa was one of Sri Lanka's ephemeral capitals, a citadel on a huge granite rock rising roughly 90 to 100 m above the plain between Kurunegala and Anuradhapura. The staircase is about 100 steps in three flights and rises at a steep angle. One family took just under an hour for the climb and descent. The stone is slippery after rain, and monkeys will take unattended food. ${APPROX}`,
    bestSeason: "Dec – Apr", startPoint: [7.8168, 80.3107], elevationProfile: [220, 240, 265, 290, 310], illustration: "midday",
  },
  {
    mockId: "n26", slug: "adara-kanda", name: "Adara Kanda (Lovers' Peak)", district: "Ratnapura", region: "Sabaragamuwa",
    difficulty: "hard", distanceKm: 10, elevationGainM: 850, peakElevationM: 1500, durationHrs: 6, rating: 0, reviewCount: 0,
    tags: ["Summit", "Kalupahana range", "Local guide"],
    summary: "A 1,500 m peak in the Kalupahana range, about 5 km north-east of Belihuloya.",
    description: `Adara Kanda, also called Paraviyangala, rises about 850 m above Belihuloya and is usually approached from there. Little route detail is published, so distance and time here are rough estimates. Go with a local guide, start early, and carry water because the forest paths are slippery after rain. ${APPROX}`,
    bestSeason: "Jan – Apr", startPoint: [6.7508, 80.7739], elevationProfile: [660, 850, 1050, 1250, 1400, 1500], illustration: "misty",
  },
  {
    mockId: "n27", slug: "galboda-falls", name: "Galboda Falls", district: "Nuwara Eliya", region: "Hill Country",
    difficulty: "moderate", distanceKm: 5.3, elevationGainM: 299, peakElevationM: 1460, durationHrs: 2, rating: 0, reviewCount: 0,
    tags: ["Waterfall", "Train access", "Forest path"],
    summary: "Take the train to Galboda station, walk the line, then follow a narrow footpath to a roughly 30 m waterfall.",
    description: `Trackers log this as a 5.3 km out-and-back with about 299 m of climbing and an average of around two hours. Students who hiked it walked along the railway first and then switched to a narrow footpath. The easiest way in is by train to Galboda, so check the timetable for your return. ${APPROX}`,
    bestSeason: "Dec – Apr", startPoint: [6.7844, 80.7061], elevationProfile: [1380, 1340, 1380, 1430, 1460, 1420], illustration: "misty",
  },
  {
    mockId: "n28", slug: "dambulla-cave-temple", name: "Dambulla Cave Temple", district: "Matale", region: "Cultural Triangle",
    difficulty: "easy", distanceKm: 1.5, elevationGainM: 110, peakElevationM: 280, durationHrs: 1.5, rating: 0, reviewCount: 0,
    tags: ["UNESCO", "Cave paintings", "Steps"],
    summary: "Climb about 360 steps up a granite outcrop to five cave temples packed with Buddha statues and painted ceilings.",
    description: `The caves sit partway up a rock that rises around 150 to 160 m above the surrounding plain, and most guides count about 364 steps from the base, roughly 30 minutes at a relaxed pace. Dress to cover your knees and shoulders, and expect to go barefoot or in socks inside the caves. Avoid the midday heat. ${APPROX}`,
    bestSeason: "Year-round", startPoint: [7.8567, 80.6492], elevationProfile: [170, 200, 230, 255, 280], illustration: "midday",
  },
  {
    mockId: "n29", slug: "pekoe-trail-stage-9", name: "Pekoe Trail Stage 9: Bogawantalawa to Dayagama", district: "Nuwara Eliya", region: "Pekoe Trail",
    difficulty: "hard", distanceKm: 17.13, elevationGainM: 669, peakElevationM: 1800, durationHrs: 5, rating: 0, reviewCount: 0,
    tags: ["Pekoe Trail", "Point to point", "Camping"],
    summary: "A long day through the tea valley of Bogawantalawa and the foothills of Haritha Kanda to Dayagama.",
    description: `The official Pekoe Trail site lists this stage at 17.13 km, rated hard, at about 5 hours, and trackers log roughly 669 m of climbing. There are two unmarked camping spots in the foothills of Haritha mountain, so pack out your rubbish. Check the trail's alert status before you go, as stages close in heavy rain. ${APPROX}`,
    bestSeason: "Dec – Apr", startPoint: [6.7833, 80.6833], elevationProfile: [1440, 1550, 1700, 1800, 1650, 1500], illustration: "misty",
  },
  {
    mockId: "n30", slug: "pekoe-trail-stage-15", name: "Pekoe Trail Stage 15: Makulella to Ella", district: "Badulla", region: "Pekoe Trail",
    difficulty: "moderate", distanceKm: 9.61, elevationGainM: 240, peakElevationM: 1300, durationHrs: 3, rating: 0, reviewCount: 0,
    tags: ["Pekoe Trail", "Point to point", "Ella"],
    summary: "A moderate half-day on the Pekoe Trail from Makulella into Ella, finishing near Little Adam's Peak country.",
    description: `The official Pekoe Trail site lists this stage at 9.61 km, rated moderate, at about 3 hours, and trackers log roughly 240 m of climbing. It ends in Ella, so you can combine it with the Nine Arch Bridge walk or Little Adam's Peak the same day. Check trail alerts before you go. ${APPROX}`,
    bestSeason: "Dec – Apr", startPoint: [6.834, 81.0307], elevationProfile: [1230, 1280, 1300, 1250, 1100, 1010], illustration: "dawn",
  },
];
