import { describe, expect, test } from "bun:test";
import { isAllowedTransition, paymentStatusFor, fulfilmentStatusFor } from "./order-status";

describe("isAllowedTransition", () => {
	test("allows forward progression", () => {
		expect(isAllowedTransition("PENDING", "CONFIRMED")).toBe(true);
		expect(isAllowedTransition("CONFIRMED", "PROCESSING")).toBe(true);
		expect(isAllowedTransition("PROCESSING", "DISPATCHED")).toBe(true);
		expect(isAllowedTransition("DISPATCHED", "DELIVERED")).toBe(true);
	});
	test("rejects invalid jumps", () => {
		expect(isAllowedTransition("PENDING", "DELIVERED")).toBe(false);
		expect(isAllowedTransition("DELIVERED", "PENDING")).toBe(false);
		expect(isAllowedTransition("CANCELLED", "CONFIRMED")).toBe(false);
	});
	test("allows cancellation from early states", () => {
		expect(isAllowedTransition("PENDING", "CANCELLED")).toBe(true);
		expect(isAllowedTransition("CONFIRMED", "CANCELLED")).toBe(true);
		expect(isAllowedTransition("PROCESSING", "CANCELLED")).toBe(true);
	});
});

describe("paymentStatusFor", () => {
	test("PAID on delivered", () => {
		expect(paymentStatusFor("DELIVERED")).toBe("PAID");
	});
	test("REFUNDED on returned", () => {
		expect(paymentStatusFor("RETURNED")).toBe("REFUNDED");
	});
	test("UNPAID otherwise", () => {
		expect(paymentStatusFor("PENDING")).toBe("UNPAID");
	});
});

describe("fulfilmentStatusFor", () => {
	test("maps correctly", () => {
		expect(fulfilmentStatusFor("DISPATCHED")).toBe("SHIPPED");
		expect(fulfilmentStatusFor("DELIVERED")).toBe("DELIVERED");
		expect(fulfilmentStatusFor("CANCELLED")).toBe("UNFULFILLED");
	});
});
