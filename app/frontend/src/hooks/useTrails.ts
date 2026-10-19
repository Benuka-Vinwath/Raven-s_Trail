import { useFetch } from "./useFetch";
import { trailsApi } from "../lib/api";

export function useTrails() {
  return useFetch(() => trailsApi.list(), []);
}

export function useTrail(slug: string) {
  return useFetch(() => trailsApi.get(slug), [slug]);
}
