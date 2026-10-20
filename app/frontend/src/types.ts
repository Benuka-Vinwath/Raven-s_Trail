export type Difficulty = "easy" | "moderate" | "hard";

export interface Trail {
  id: string;
  slug: string;
  name: string;
  district: string;
  region: string;
  difficulty: Difficulty;
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
  costs: TrailCosts;
}

// Sri Lankan resident rates in LKR; rough estimates
export interface TrailCosts {
  entryFeeLkr: number; // per person
  guideFeeLkr: number; // per group per day, 0 = not needed
  transferLkr: number; // per group, to the trailhead and back
  stayPerNightLkr: number; // per person, standard guesthouse
  transportFromColomboLkr: number; // per person round trip by bus
}

export type GearCategory = "Shelter" | "Pack" | "Cook" | "Safety" | "Sleep";

export interface ShopItem {
  id: string;
  name: string;
  category: GearCategory;
  pricePerDay: number;
  available: number;
  description: string;
}

export interface GearShop {
  id: string;
  name: string;
  district: string;
  address: string;
  rating: number;
  reviewCount: number;
  phone: string | null;
  website: string | null;
  note: string | null;
  sourceUrl: string | null; // set for real businesses, null for placeholder shops
  nearTrails: string[];
  items: ShopItem[];
}

export interface ParkingSpot {
  id: string;
  name: string;
  district: string;
  nearTrail: string;
  coords: [number, number];
  pricePerDay: number;
  capacity: number;
  secured: boolean;
  surface: "Paved" | "Gravel" | "Grass";
}

export interface Review {
  id: string;
  trailId: string;
  author: string;
  rating: number;
  date: string;
  text: string;
  tags: string[];
  avatarUrl: string | null;
}

export interface RecentReview extends Review {
  trailSlug: string;
  trailName: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  createdAt: string;
  avatarUrl: string | null;
}
