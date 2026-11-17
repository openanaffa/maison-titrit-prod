import { describe, expect, test } from "bun:test";
import { serializeJsonLd } from "../serialize-json-ld";

describe("serializeJsonLd", () => {
	test("escapes less-than characters without changing the parsed data", () => {
		const value = { name: "</script><script>alert(1)</script>" };
		const serialized = serializeJsonLd(value);

		expect(serialized).not.toContain("<");
		expect(JSON.parse(serialized)).toEqual(value);
	});
});
