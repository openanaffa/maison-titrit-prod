import { describe, expect, test } from "bun:test";
import { GET } from "./route";

describe("llms.txt route", () => {
	test("returns valid Markdown with an H1 and absolute links, no private routes", async () => {
		const res = await GET();
		const body = await res.text();
		expect(body.trimStart().startsWith("# ")).toBe(true);
		expect(body).toMatch(/\[.+?\]\(https:\/\/maisontitrit\.com\/[^)]+\)/);
		for (const privatePath of [
			"/makteb",
			"/compte",
			"/checkout",
			"/panier",
			"/api/",
		]) {
			expect(body).not.toContain(privatePath);
		}
	});
});
