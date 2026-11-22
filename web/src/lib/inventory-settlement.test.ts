import { describe, expect, test } from "bun:test";
import {
	RESERVE_INFIX,
	SETTLED_SUFFIXES,
	settlementKeyFor,
} from "./inventory-settlement";

describe("reservation ledger convention", () => {
	test("key shapes match the checkout reservation convention", () => {
		const orderKey = "checkout:abc-123";
		const reserveKey = `${orderKey}:reserve:0`;
		// activeReservations scopes on the order key itself (which already
		// carries the "checkout:" prefix for default client keys).
		expect(reserveKey.startsWith(`${orderKey}${RESERVE_INFIX}`)).toBe(true);
		// replay generations keep the same matchable prefix
		expect(
			`${orderKey}:reserve:0:g2`.startsWith(`${orderKey}${RESERVE_INFIX}`),
		).toBe(true);
	});
});

describe("settlementKeyFor", () => {
	test("CANCELLED settles with a release-lifecycle suffix", () => {
		expect(settlementKeyFor("checkout:x:reserve:0", "CANCELLED")).toBe(
			"checkout:x:reserve:0:release-lifecycle",
		);
	});
	test("DELIVERED settles with a commit-lifecycle suffix", () => {
		expect(settlementKeyFor("checkout:x:reserve:1:g2", "DELIVERED")).toBe(
			"checkout:x:reserve:1:g2:commit-lifecycle",
		);
	});
	test("settlement keys are unique per suffix and never collide with existing checkout keys", () => {
		const suffixes = SETTLED_SUFFIXES.map((s) => `checkout:x:reserve:0${s}`);
		expect(new Set(suffixes).size).toBe(suffixes.length);
		// the original reservation idempotencyKey must never equal a
		// settlement key (unique movement index would then replay wrongly)
		for (const s of suffixes) {
			expect(s).not.toBe("checkout:x:reserve:0");
		}
	});
});

describe("SETTLED_SUFFIXES", () => {
	test("covers both checkout compensation and lifecycle settlement keys", () => {
		// `:release` — checkout rollback compensation (route.ts)
		// `:release-lifecycle` — CANCELLED settlement (this module)
		// `:commit-lifecycle` — DELIVERED settlement (this module)
		expect(SETTLED_SUFFIXES).toContain(":release");
		expect(SETTLED_SUFFIXES).toContain(":release-lifecycle");
		expect(SETTLED_SUFFIXES).toContain(":commit");
		expect(SETTLED_SUFFIXES).toContain(":commit-lifecycle");
	});
});
