import type { Difficulty } from "../types";

// pin colours by difficulty, close to the colours of the difficulty tags
export const DIFFICULTY_COLOR: Record<Difficulty, string> = {
  easy: "#4e9a62",
  moderate: "#d19a3d",
  hard: "#b5502f",
};

// straight-line distance in km between two [lat, lng] points (haversine)
export function distanceKm(a: [number, number], b: [number, number]): number {
  const rad = (d: number) => (d * Math.PI) / 180;
  const dLat = rad(b[0] - a[0]);
  const dLng = rad(b[1] - a[1]);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(rad(a[0])) * Math.cos(rad(b[0])) * Math.sin(dLng / 2) ** 2;
  return 6371 * 2 * Math.asin(Math.sqrt(h));
}

export const directionsUrl = (p: [number, number]) => `https://www.google.com/maps/dir/?api=1&destination=${p[0]},${p[1]}`;
