/**
 * Maison Titrit — shopping cart (Zustand, persisted to localStorage).
 * Items are snapshots: productId, ref, name, price (salePrice-aware),
 * image, size, qty. The cart is client-side only; checkout persists it
 * to the DB as an Order.
 */
import { create } from "zustand";
import { persist } from "zustand/middleware";

export type CartItem = {
  productId: string;
  ref: string;
  name: string;
  price: number; // salePrice if present, else price
  currency: string;
  image: string;
  size: string;
  qty: number;
};

type CartState = {
  items: CartItem[];
  /** A composite key (productId|size) dedupes the same product+size. */
  add: (item: Omit<CartItem, "qty">, qty?: number) => void;
  setQty: (productId: string, size: string, qty: number) => void;
  remove: (productId: string, size: string) => void;
  clear: () => void;
};

export const useCart = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      add: (item, qty = 1) =>
        set((s) => {
          const key = (i: CartItem) => i.productId === item.productId && i.size === item.size;
          const existing = s.items.find(key);
          if (existing) {
            return {
              items: s.items.map((i) =>
                key(i) ? { ...i, qty: Math.min(20, i.qty + qty) } : i,
              ),
            };
          }
          return { items: [...s.items, { ...item, qty }] };
        }),
      setQty: (productId, size, qty) =>
        set((s) => ({
          items: s.items
            .map((i) =>
              i.productId === productId && i.size === size
                ? { ...i, qty: Math.max(1, Math.min(20, qty)) }
                : i,
            )
            .filter((i) => i.qty > 0),
        })),
      remove: (productId, size) =>
        set((s) => ({
          items: s.items.filter(
            (i) => !(i.productId === productId && i.size === size),
          ),
        })),
      clear: () => set({ items: [] }),
    }),
    { name: "titrit-cart" },
  ),
);

/** Selectors */
export const cartCount = (s: CartState) =>
  s.items.reduce((n, i) => n + i.qty, 0);

export const cartTotal = (s: CartState) =>
  s.items.reduce((sum, i) => sum + i.price * i.qty, 0);

export const cartKey = (i: CartItem) => `${i.productId}|${i.size}`;
