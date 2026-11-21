import { describe, expect, test } from "bun:test";
import { matchZone, parseCities } from "./delivery";

describe("parseCities", () => {
	test("splits on comma/newline/semicolon", () => {
		expect(parseCities("Casablanca, Rabat")).toEqual(["casablanca", "rabat"]);
		expect(parseCities("Fes\nMeknes")).toEqual(["fes", "meknes"]);
	});
});

describe("matchZone", () => {
	test("returns index of matching zone", () => {
		const zones = [{ cities: "Casablanca, Rabat" }, { cities: "Fes" }];
		expect(matchZone("casablanca", zones)).toBe(0);
		expect(matchZone("FES", zones)).toBe(1);
		expect(matchZone("Tanger", zones)).toBe(-1);
	});
});
