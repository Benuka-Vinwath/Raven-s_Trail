import type { Trail, GearShop, ParkingSpot, Review, RecentReview, User, Trip, Booking, Kit, KitMode, VoucherCheck } from "../types";

const BASE_URL = import.meta.env.VITE_API_URL;

export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

interface RequestOptions {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
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

export const kitApi = {
  get: (slug: string, p: { people: number; nights: number | null; mode: KitMode | null; rain: boolean; cold: boolean }) => {
    const q = new URLSearchParams({ people: String(p.people), rain: p.rain ? "1" : "0", cold: p.cold ? "1" : "0" });
    if (p.nights !== null) q.set("nights", String(p.nights)); // left out = let the server choose from the trail
    if (p.mode) q.set("mode", p.mode);
    return request<Kit>(`/trails/${slug}/kit?${q}`);
  },
};

export interface CartData {
  startDate: string | null;
  endDate: string | null;
  items: { itemId: string; quantity: number }[];
}

export const tripsApi = {
  list: (token: string) => request<Trip[]>("/trips", { token }),
  create: (
    body: {
      trailSlug: string;
      hikers: number;
      days: number;
      transport: "bus" | "train" | "van" | "own";
      foodPerDay: number;
      gearPerDay: number;
      parkingDays?: number;
      startDate?: string;
      notes?: string;
    },
    token: string
  ) => request<Trip>("/trips", { method: "POST", body, token }),
  remove: (id: string, token: string) => request<void>(`/trips/${id}`, { method: "DELETE", token }),
};

export const cartApi = {
  get: (slug: string, token: string) => request<CartData>(`/cart/${slug}`, { token }),
  put: (slug: string, body: CartData, token: string) => request<void>(`/cart/${slug}`, { method: "PUT", body, token }),
  checkout: (slug: string, hikers: number, phone: string, token: string) =>
    request<Booking>(`/cart/${slug}/checkout`, { method: "POST", body: { hikers, phone }, token }),
};

export const bookingsApi = {
  list: (token: string) => request<Booking[]>("/bookings", { token }),
  collected: (id: string, token: string) => request<Booking>(`/bookings/${id}/collected`, { method: "POST", token }),
  returned: (id: string, token: string) => request<Booking>(`/bookings/${id}/returned`, { method: "POST", token }),
  get: (id: string, token: string) => request<Booking>(`/bookings/${id}`, { token }),
  cancel: (id: string, token: string) => request<Booking>(`/bookings/${id}/cancel`, { method: "POST", token }),
};

export interface ChatMessage {
  role: "user" | "assistant";
  text: string;
}

export interface ChatHandlers {
  onText: (text: string) => void;
  onStatus: (text: string) => void;
}

// The server answers with server-sent events (`data: {...}` lines), so this reads the body as a stream
// instead of using request(), which waits for the whole JSON body.
async function streamChat(messages: ChatMessage[], token: string | null, handlers: ChatHandlers, signal?: AbortSignal): Promise<void> {
  let res: Response;
  try {
    res = await fetch(`${BASE_URL}/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      body: JSON.stringify({ messages }),
      signal,
    });
  } catch {
    if (signal?.aborted) return;
    throw new ApiError(0, "Can't reach the server. Is the API running?");
  }

  // problems before the stream starts (validation, rate limit) come back as normal JSON errors
  if (!res.ok || !res.body) {
    const data = await res.json().catch(() => null);
    throw new ApiError(res.status, data?.error ?? `Request failed (${res.status})`);
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  try {
    for (;;) {
      const { done, value } = await reader.read();
      if (done) return;
      buffer += decoder.decode(value, { stream: true });
      let end: number;
      while ((end = buffer.indexOf("\n\n")) >= 0) {
        const line = buffer.slice(0, end);
        buffer = buffer.slice(end + 2);
        if (!line.startsWith("data:")) continue;
        const event = JSON.parse(line.slice(5));
        if (event.type === "text") handlers.onText(event.text);
        else if (event.type === "status") handlers.onStatus(event.text);
        else if (event.type === "error") throw new ApiError(502, event.message);
      }
    }
  } catch (err) {
    if (signal?.aborted) return;
    throw err;
  }
}

export const chatApi = { stream: streamChat };

// public: what a shop owner sees after scanning a customer's QR code
export const verifyApi = {
  get: (token: string, shop?: string | null, signature?: string | null) => {
    const q = new URLSearchParams();
    if (shop) q.set("shop", shop);
    if (signature) q.set("s", signature);
    return request<VoucherCheck>(`/verify/${token}${q.size ? `?${q}` : ""}`);
  },
};
