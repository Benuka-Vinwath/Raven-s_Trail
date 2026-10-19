import { useFetch } from "./useFetch";
import { parkingApi } from "../lib/api";

export function useParkingSpots(trailSlug?: string) {
  return useFetch(() => parkingApi.list(trailSlug), [trailSlug]);
}
