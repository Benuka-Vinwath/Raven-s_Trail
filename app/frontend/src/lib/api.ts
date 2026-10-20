import type { Trail, GearShop, ParkingSpot, Review, RecentReview, User } from "../types";

const BASE_URL = import.meta.env.VITE_API_URL;

export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

interface RequestOptions {
  method?: "GET" | "POST" | "PATCH" | "DELETE";
  body?: unknown;
  token?: string | null;
}

async function request<T>(path: string, { method = "GET", body, token }: RequestOptions = {}): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${BASE_URL}${path}`, {
      method,
      headers: {
        ...(body ? { "Content-Type": "application/json" } : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new ApiError(0, "Can't reach the server. Is the API running?");
  }

  if (res.status === 204) return undefined as T;

  const data = await res.json().catch(() => null);
  if (!res.ok) {
    throw new ApiError(res.status, data?.error ?? `Request failed (${res.status})`);
  }
  return data as T;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export const authApi = {
  signup: (body: { name: string; email: string; password: string }) =>
    request<AuthResponse>("/auth/signup", { method: "POST", body }),
  login: (body: { email: string; password: string }) =>
    request<AuthResponse>("/auth/login", { method: "POST", body }),
  me: (token: string) => request<User>("/auth/me", { token }),
  updateProfile: (
    token: string,
    body: { name?: string; email?: string; currentPassword?: string; newPassword?: string; avatarUrl?: string | null }
  ) => request<User>("/auth/me", { method: "PATCH", body, token }),
};

export const trailsApi = {
  list: (params?: { q?: string; difficulty?: string; district?: string; sort?: string }) => {
    const query = params ? `?${new URLSearchParams(Object.entries(params).filter(([, v]) => v)).toString()}` : "";
    return request<Trail[]>(`/trails${query}`);
  },
  get: (slug: string) => request<Trail>(`/trails/${slug}`),
};

export const gearShopsApi = {
  list: (trailSlug?: string) => request<GearShop[]>(`/gear-shops${trailSlug ? `?trail=${trailSlug}` : ""}`),
};

export const parkingApi = {
  list: (trailSlug?: string) => request<ParkingSpot[]>(`/parking${trailSlug ? `?trail=${trailSlug}` : ""}`),
};

export interface BudgetPlanInput {
  trailSlug: string;
  people: number;
  days: number;
  style: "budget" | "standard" | "comfortable";
  transport: string;
  startingFrom?: string;
  budget?: number;
  lines: { label: string; amount: number }[];
  total: number;
}

export interface BudgetPlan {
  summary: string;
  itinerary: { day: number; title: string; plan: string }[];
  savings: { title: string; detail: string; savingLkr: number }[];
  packing: string[];
}

export const budgetApi = {
  plan: (body: BudgetPlanInput, token: string) => request<BudgetPlan>("/budget/plan", { method: "POST", body, token }),
};

export const reviewsApi = {
  recent: (limit = 20) => request<RecentReview[]>(`/reviews?limit=${limit}`),
  forTrail: (slug: string) => request<Review[]>(`/trails/${slug}/reviews`),
  create: (slug: string, body: { rating: number; text: string; tags?: string[] }, token: string) =>
    request<Review>(`/trails/${slug}/reviews`, { method: "POST", body, token }),
};
