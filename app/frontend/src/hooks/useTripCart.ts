import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { cartApi, type CartData } from "../lib/api";
import type { ShopItem } from "../types";

interface CartState {
  startDate: string | null;
  endDate: string | null;
  items: Record<string, number>; // item id -> quantity
}

const EMPTY: CartState = { startDate: null, endDate: null, items: {} };
const storageKey = (slug: string) => `ravenstrail_cart_${slug}`;

function readLocal(slug: string): CartState {
  try {
    const raw = localStorage.getItem(storageKey(slug));
    return raw ? { ...EMPTY, ...JSON.parse(raw) } : EMPTY;
  } catch {
    return EMPTY;
  }
}

const fromServer = (data: CartData): CartState => ({
  startDate: data.startDate,
  endDate: data.endDate,
  items: Object.fromEntries(data.items.map((i) => [i.itemId, i.quantity])),
});

export function daysBetween(start: string | null, end: string | null): number | null {
  if (!start || !end) return null;
  const n = Math.round((Date.parse(end) - Date.parse(start)) / 86_400_000) + 1;
  return n >= 1 ? n : null;
}

// One cart per trail. It lives in the browser for everyone (so it survives a refresh and a trip to the login page)
// and is mirrored to the account when logged in, so it follows the person to another device.
export function useTripCart(slug: string, allItems: ShopItem[], token: string | null) {
  const [cart, setCart] = useState<CartState>(() => readLocal(slug));
  const [synced, setSynced] = useState(false);
  const latest = useRef(cart);
  useEffect(() => {
    latest.current = cart;
  }, [cart]);

  // validItems drops anything the shops no longer list, so the server never gets an id it would reject
  const validIds = useMemo(() => new Set(allItems.map((i) => i.id)), [allItems]);

  const payload = useCallback((): CartData => {
    const c = latest.current;
    return {
      startDate: c.startDate,
      endDate: c.endDate,
      items: Object.entries(c.items)
        .filter(([id]) => validIds.size === 0 || validIds.has(id))
        .map(([itemId, quantity]) => ({ itemId, quantity })),
    };
  }, [validIds]);

  // on login: take the saved server cart, or upload the one built while logged out
  useEffect(() => {
    if (!token) {
      setSynced(false);
      return;
    }
    let cancelled = false;
    cartApi
      .get(slug, token)
      .then((data) => {
        if (cancelled) return;
        if (data.items.length > 0 || data.startDate) setCart(fromServer(data));
        setSynced(true);
      })
      .catch(() => !cancelled && setSynced(true));
    return () => {
      cancelled = true;
    };
  }, [slug, token]);

  useEffect(() => {
    try {
      localStorage.setItem(storageKey(slug), JSON.stringify(cart));
    } catch {
      /* private mode: the cart just won't survive a refresh */
    }
    if (!token || !synced || validIds.size === 0) return;
    const timer = setTimeout(() => cartApi.put(slug, payload(), token).catch(() => {}), 600);
    return () => clearTimeout(timer);
  }, [cart, token, synced, slug, payload, validIds]);

  const cartItems = useMemo(
    () =>
      Object.entries(cart.items)
        .map(([id, quantity]) => {
          const item = allItems.find((i) => i.id === id);
          return item ? { item, quantity } : null;
        })
        .filter((e): e is { item: ShopItem; quantity: number } => e !== null),
    [cart.items, allItems]
  );

  const days = daysBetween(cart.startDate, cart.endDate);
  const perDay = cartItems.reduce((sum, { item, quantity }) => sum + item.pricePerDay * quantity, 0);
  const total = days ? perDay * days : 0;

  function toggle(id: string) {
    setCart((prev) => {
      const items = { ...prev.items };
      if (items[id]) delete items[id];
      else items[id] = 1;
      return { ...prev, items };
    });
  }

  function setQuantity(id: string, quantity: number) {
    setCart((prev) => ({ ...prev, items: { ...prev.items, [id]: Math.min(20, Math.max(1, quantity)) } }));
  }

  function remove(id: string) {
    setCart((prev) => {
      const items = { ...prev.items };
      delete items[id];
      return { ...prev, items };
    });
  }

  function setDates(startDate: string | null, endDate: string | null) {
    setCart((prev) => ({ ...prev, startDate, endDate }));
  }

  // replace the whole cart, e.g. with a shop's kit from the kit builder
  function loadKit(items: Record<string, number>, startDate: string | null, endDate: string | null) {
    setCart({ startDate, endDate, items });
  }

  function clear() {
    setCart(EMPTY);
  }

  // used right before checkout so the server has exactly what is on screen
  const save = useCallback(async () => {
    if (token) await cartApi.put(slug, payload(), token);
  }, [token, slug, payload]);

  return { cart, cartItems, days, perDay, total, toggle, setQuantity, remove, setDates, loadKit, clear, save };
}
