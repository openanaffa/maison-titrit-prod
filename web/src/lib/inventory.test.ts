import { describe, expect, test } from "bun:test";
import { isLowStock } from "./inventory";

describe("isLowStock", () => {
	test("true when available <= threshold", () => {
		expect(isLowStock({ onHand: 5, reserved: 2, lowStockThreshold: 3 })).toBe(
			true,
		);
		expect(isLowStock({ onHand: 5, reserved: 3, lowStockThreshold: 2 })).toBe(
			true,
		);
	});
	test("false when available > threshold", () => {
		expect(isLowStock({ onHand: 10, reserved: 2, lowStockThreshold: 3 })).toBe(
			false,
		);
	});
});
