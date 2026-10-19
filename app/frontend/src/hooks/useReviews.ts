import { useFetch } from "./useFetch";
import { reviewsApi } from "../lib/api";

export function useTrailReviews(slug: string) {
  return useFetch(() => reviewsApi.forTrail(slug), [slug]);
}

export function useRecentReviews(limit = 20) {
  return useFetch(() => reviewsApi.recent(limit), [limit]);
}
