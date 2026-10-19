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
}
