// Unsplash photo ids (free to hotlink). Trails without an entry fall back to the hero photo.
export const photo = (id: string, w = 1200) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}&q=75`;

const HERO = "1476362555312-ab9e108a0b7e";

const BY_SLUG: Record<string, string> = {
  "ella-rock": "1580635849305-4399d586ac5c",
  "little-adams-peak": "1613693687360-8b0d54705746",
  "adams-peak": "1603731510149-3cdcd45927a5",
  "worlds-end": "1729196014295-fdc3d621f967",
  "knuckles-range": "1573912863588-57d033d1b4bb",
  "pidurangala-rock": "1760020052045-d1ab1631b3a1",
  "bambarakanda-falls": "1609681980718-340e7f4b11d7",
  "riverston-mini-worlds-end": "1585171095587-208afbf98724",
  "liptons-seat": "1641149750086-b11cd21d1f60",
  "moulawella-peak-sinharaja": "1710028267907-65696d606b18",
};

const PAGE = {
  trails: "1573912863588-57d033d1b4bb",
  rentals: "1628087236671-6730a5b9d79a",
  parking: "1544039161-b0c20826c6f6",
  budget: "1641149750086-b11cd21d1f60",
  weather: "1603731510149-3cdcd45927a5",
  community: "1667617139130-1c161474b680",
  notFound: HERO,
};
export const pagePhoto = (page: keyof typeof PAGE, w = 1800) => photo(PAGE[page], w);

export const heroPhoto = (w = 2000) => photo(HERO, w);
export const trailPhoto = (slug: string, w = 900) => photo(BY_SLUG[slug] ?? HERO, w);

export const GALLERY = [
  { id: "1641149750086-b11cd21d1f60", caption: "Tea country at first light" },
  { id: "1573912863588-57d033d1b4bb", caption: "Cloud-draped ridgelines" },
  { id: "1705730631841-5c02db0885ed", caption: "Summit rock above the clouds" },
  { id: "1544039161-b0c20826c6f6", caption: "Fog on the forest path" },
  { id: "1609681980718-340e7f4b11d7", caption: "Waterfall valleys" },
  { id: "1628087236671-6730a5b9d79a", caption: "Camp beneath the peaks" },
  { id: "1667617139130-1c161474b680", caption: "Pack on, eyes up" },
];
