import { describe, expect, test } from "bun:test";
import {
	type PricedProduct,
	parseCartLines,
	parseSizes,
	priceCart,
} from "./checkout";

const caftan: PricedProduct = {
	id: "p1",
	ref: "MT-01",
	name: "Caftan",
	price: 1200,
	salePrice: 900,
	inStock: true,
	sizes: "S · M · L",
};

describe("parseSizes", () => {
	test("accepts every separator used in product data", () => {
		expect(parseSizes("S · M · L · XL")).toEqual(["S", "M", "L", "XL"]);
		expect(parseSizes("S/M/L")).toEqual(["S", "M", "L"]);
		expect(parseSizes("S,M,L")).toEqual(["S", "M", "L"]);
		expect(parseSizes("S-M-L")).toEqual(["S", "M", "L"]);
		expect(parseSizes("Unique")).toEqual(["Unique"]);
		expect(parseSizes("")).toEqual([]);
	});

	test("priceCart accepts sizes written with non-· separators", () => {
		const slashSized = { ...caftan, sizes: "S/M/L" };
		const r = priceCart([{ productId: "p1", qty: 1, size: "M" }], [slashSized]);
		expect(r.ok).toBe(true);
	});
});

describe("parseCartLines", () => {
	test("rejects tampered quantities", () => {
		expect(
			parseCartLines([{ productId: "p1", qty: -1, size: "M" }]),
		).toBeNull();
		expect(
			parseCartLines([{ productId: "p1", qty: 1.5, size: "M" }]),
		).toBeNull();
		expect(
			parseCartLines([{ productId: "p1", qty: 999, size: "M" }]),
		).toBeNull();
		expect(parseCartLines([])).toBeNull();
	});
});

describe("priceCart", () => {
	test("uses DB sale price, ignores client price", () => {
		const lines = parseCartLines([
			{ productId: "p1", qty: 2, size: "M", price: 1 },
		])!;
		const r = priceCart(lines, [caftan]);
		expect(r).toEqual({
			ok: true,
			total: 1800,
			items: [expect.objectContaining({ price: 900, quantity: 2 })],
		});
	});

	test("rejects unknown, out-of-stock and bad size", () => {
		expect(
			priceCart([{ productId: "x", qty: 1, size: "M" }], [caftan]).ok,
		).toBe(false);
		expect(
			priceCart(
				[{ productId: "p1", qty: 1, size: "M" }],
				[{ ...caftan, inStock: false }],
			).ok,
		).toBe(false);
		expect(
			priceCart([{ productId: "p1", qty: 1, size: "XXL" }], [caftan]).ok,
		).toBe(false);
	});
});
