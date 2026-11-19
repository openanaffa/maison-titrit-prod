import { describe, expect, test } from "bun:test";
import { getSafeRedirectPath } from "./safe-redirect";

describe("getSafeRedirectPath", () => {
	const origin = "https://maisontitrit.com";

	test("preserves safe same-origin paths and query parameters", () => {
		expect(getSafeRedirectPath("/makteb?tab=orders", origin, "/compte")).toBe(
			"/makteb?tab=orders",
		);
	});

	test("rejects external and malformed redirect targets", () => {
		expect(getSafeRedirectPath("//attacker.example", origin, "/compte")).toBe(
			"/compte",
		);
		expect(getSafeRedirectPath("\\\\attacker.example", origin, "/compte")).toBe(
			"/compte",
		);
		expect(
			getSafeRedirectPath("https://attacker.example", origin, "/compte"),
		).toBe("/compte");
		expect(getSafeRedirectPath("http://[", origin, "/compte")).toBe("/compte");
	});
});
