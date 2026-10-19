import { useFetch } from "./useFetch";
import { gearShopsApi } from "../lib/api";

export function useGearShops(trailSlug?: string) {
  return useFetch(() => gearShopsApi.list(trailSlug), [trailSlug]);
}
