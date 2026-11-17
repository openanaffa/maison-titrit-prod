import { describe, expect, test } from "bun:test";
import { localBusinessSchema } from "./json-ld";

describe("localBusinessSchema PostalAddress", () => {
	test("includes postalCode 27182 while preserving other address fields", () => {
		const schema = localBusinessSchema() as {
			address: Record<string, unknown>;
		};
		expect(schema.address["@type"]).toBe("PostalAddress");
		expect(schema.address.postalCode).toBe("27182");
		expect(schema.address.streetAddress).toContain("Magasin N°4");
		expect(schema.address.addressLocality).toBe("Casablanca");
		expect(schema.address.addressCountry).toBe("MA");
	});
});
