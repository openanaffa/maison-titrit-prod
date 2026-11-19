import { describe, expect, test } from "bun:test";

import { cn } from "./utils";

describe("cn — vintage role classes", () => {
	test("a field role strips the shadcn input's conflicting border and radius utilities", () => {
		expect(cn("border-input rounded-md field-vintage")).toBe("field-vintage");
	});

	test("a label role strips conflicting type utilities but keeps unrelated ones", () => {
		expect(
			cn("font-serif text-sm text-ink-soft uppercase label-vintage p-3"),
		).toBe("label-vintage p-3");
	});

	test("roles do not strip modifier-scoped variants", () => {
		expect(cn("border-input focus-visible:border-ring field-vintage")).toBe(
			"focus-visible:border-ring field-vintage",
		);
	});
});
