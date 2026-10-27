/**
 * Server-side cart pricing. The client only says *what* it wants
 * (productId, qty, size); price, name and availability come from the DB.
 */

export const MAX_QTY_PER_LINE = 20;
export const MAX_LINES = 30;

export type CartLineInput = { productId: string; qty: number; size: string | null };

export type PricedProduct = {
  id: string;
  ref: string;
  name: string;
  price: number;
  salePrice: number | null;
  inStock: boolean;
  sizes: string; // "S · M · L · XL"
};

export type PricedLine = {
  productId: string;
  ref: string;
  name: string;
  price: number; // unit, MAD
  quantity: number;
  size: string | null;
};

export type PricingResult =
  | { ok: true; items: PricedLine[]; total: number }
  | { ok: false; error: string };

/** Parse the untrusted request body into cart lines, or null if malformed. */
export function parseCartLines(raw: unknown): CartLineInput[] | null {
  if (!Array.isArray(raw) || raw.length === 0 || raw.length > MAX_LINES) return null;
  const lines: CartLineInput[] = [];
  for (const r of raw) {
    if (!r || typeof r !== "object") return null;
    const { productId, qty, size } = r as Record<string, unknown>;
    if (typeof productId !== "string" || !productId) return null;
    if (!Number.isInteger(qty) || (qty as number) < 1 || (qty as number) > MAX_QTY_PER_LINE) return null;
    if (size != null && typeof size !== "string") return null;
    lines.push({ productId, qty: qty as number, size: size?.trim() || null });
  }
  return lines;
}

export function sizeList(sizes: string): string[] {
  return sizes.split("·").map((s) => s.trim()).filter(Boolean);
}

export function priceCart(lines: CartLineInput[], products: PricedProduct[]): PricingResult {
  const byId = new Map(products.map((p) => [p.id, p]));
  const items: PricedLine[] = [];
  for (const line of lines) {
    const p = byId.get(line.productId);
    if (!p) return { ok: false, error: "Un article du panier n'existe plus." };
    if (!p.inStock) return { ok: false, error: `« ${p.name} » n'est plus disponible.` };
    const allowed = sizeList(p.sizes);
    if (allowed.length > 0 && (!line.size || !allowed.includes(line.size))) {
      return { ok: false, error: `Taille invalide pour « ${p.name} ».` };
    }
    items.push({
      productId: p.id,
      ref: p.ref,
      name: p.name,
      price: p.salePrice ?? p.price,
      quantity: line.qty,
      size: line.size,
    });
  }
  const total = items.reduce((s, i) => s + i.price * i.quantity, 0);
  return { ok: true, items, total };
}
