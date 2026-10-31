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
  gearType: string | null; // standard type (tent, sleeping_bag...) used for comparing shops
  size: number | null; // tent capacity or backpack litres, when known
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
  phone: string | null;
  createdAt: string;
  avatarUrl: string | null;
}

export type TripPhase = "planning" | "upcoming" | "ongoing" | "past" | "cancelled";

export interface Trip {
  id: string;
  trailId: string;
  trailSlug: string;
  trailName: string;
  distanceKm: number;
  elevationGainM: number;
  hikers: number;
  days: number;
  transport: string;
  foodPerDay: number;
  gearPerDay: number;
  parkingDays: number;
  startDate: string | null; // YYYY-MM-DD
  endDate: string | null;
  phase: TripPhase;
  notes: string | null;
  createdAt: string;
  booking: { id: string; reference: string; status: "confirmed" | "cancelled"; totalLkr: number } | null;
}

export interface BookingItem {
  shopName: string;
  shopPhone: string | null;
  shopAddress: string | null;
  itemName: string;
  category: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
}

export interface BookingShop {
  name: string;
  phone: string | null;
  address: string | null;
  signature: string; // makes this shop's voucher link tamper-proof
  subtotal: number;
}

export interface Booking {
  id: string;
  reference: string;
  verifyToken: string; // the secret behind the QR code
  customerName: string;
  customerPhone: string | null;
  tripId: string;
  trailSlug: string;
  trailName: string;
  status: "confirmed" | "cancelled";
  phase: "upcoming" | "ongoing" | "past" | "cancelled";
  startDate: string;
  endDate: string;
  days: number;
  totalLkr: number;
  createdAt: string;
  cancelledAt: string | null;
  pickedUpAt: string | null;
  returnedAt: string | null;
  items: BookingItem[];
  shops: BookingShop[];
}

export type VoucherStage = "ready" | "collected" | "returned" | "cancelled";

// what a shop sees after scanning a voucher: deliberately limited
export interface VoucherCheck {
  reference: string;
  stage: VoucherStage;
  expired: boolean;
  notStartedYet: boolean;
  customerFirstName: string;
  phoneEnding: string | null;
  trailName: string;
  startDate: string;
  endDate: string;
  days: number;
  scope: "all" | "shop";
  shopName: string | null;
  items: { shopName: string; itemName: string; quantity: number; unitPrice: number; lineTotal: number }[];
  total: number;
  pickedUpAt: string | null;
  returnedAt: string | null;
  cancelledAt: string | null;
}

export type KitLevel = "essential" | "recommended" | "optional";
export type KitMode = "day" | "night" | "rain" | "camp";

export interface KitItem {
  type: string;
  label: string;
  quantity: number;
  level: KitLevel;
  reason: string;
}

export interface KitLine {
  type: string;
  label: string;
  level: KitLevel;
  covered: boolean;
  itemId?: string;
  itemName?: string;
  quantity?: number;
  unitPrice?: number;
  assumedSize?: boolean; // the shop doesn't say how many people the tent sleeps
  lineTotal: number;
}

export interface KitShop {
  shop: { id: string; name: string; district: string; address: string; phone: string | null; website: string | null; note: string | null };
  essentialCovered: number;
  recommendedCovered: number;
  totalLkr: number;
  perPersonLkr: number;
  missing: string[];
  lines: KitLine[];
}

export interface Kit {
  inputs: { people: number; nights: number; days: number; mode: KitMode; rainHint: boolean; coldHint: boolean };
  trail: { slug: string; name: string };
  kit: KitItem[];
  totals: { essential: number; recommended: number };
  shops: KitShop[];
  callToPrice: { id: string; name: string; phone: string | null }[];
  notRentable: string[];
}
