import { useMemo, useState } from "react";
import type { ShopItem } from "../types";

export function useGearCart(allItems: ShopItem[]) {
  const [cart, setCart] = useState<Record<string, number>>({});

  const cartItems = useMemo(
    () =>
      Object.entries(cart)
        .map(([id, days]) => {
          const item = allItems.find((i) => i.id === id);
          return item ? { item, days } : null;
        })
        .filter((entry): entry is { item: ShopItem; days: number } => entry !== null),
    [cart, allItems]
  );

  const total = cartItems.reduce((sum, { item, days }) => sum + item.pricePerDay * days, 0);

  function toggle(id: string) {
    setCart((prev) => {
      const next = { ...prev };
      if (next[id]) delete next[id];
      else next[id] = 1;
      return next;
    });
  }

  function setDays(id: string, days: number) {
    setCart((prev) => ({ ...prev, [id]: Math.max(1, days) }));
  }

  return { cart, cartItems, total, toggle, setDays };
}
