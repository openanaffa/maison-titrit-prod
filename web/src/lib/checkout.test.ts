import { describe, expect, test } from "bun:test";
import { parseCartLines, priceCart, type PricedProduct } from "./checkout";

const caftan: PricedProduct = {
  id: "p1", ref: "MT-01", name: "Caftan", price: 1200, salePrice: 900, inStock: true, sizes: "S · M · L",
};

describe("parseCartLines", () => {
  test("rejects tampered quantities", () => {
    expect(parseCartLines([{ productId: "p1", qty: -1, size: "M" }])).toBeNull();
    expect(parseCartLines([{ productId: "p1", qty: 1.5, size: "M" }])).toBeNull();
    expect(parseCartLines([{ productId: "p1", qty: 999, size: "M" }])).toBeNull();
    expect(parseCartLines([])).toBeNull();
  });
});

describe("priceCart", () => {
  test("uses DB sale price, ignores client price", () => {
    const lines = parseCartLines([{ productId: "p1", qty: 2, size: "M", price: 1 }])!;
    const r = priceCart(lines, [caftan]);
    expect(r).toEqual({ ok: true, total: 1800, items: [expect.objectContaining({ price: 900, quantity: 2 })] });
  });

  test("rejects unknown, out-of-stock and bad size", () => {
    expect(priceCart([{ productId: "x", qty: 1, size: "M" }], [caftan]).ok).toBe(false);
    expect(priceCart([{ productId: "p1", qty: 1, size: "M" }], [{ ...caftan, inStock: false }]).ok).toBe(false);
    expect(priceCart([{ productId: "p1", qty: 1, size: "XXL" }], [caftan]).ok).toBe(false);
  });
});
