import { describe, expect, test } from "bun:test";
import {
	digitsOf,
	guestOrderMatches,
	isCustomerSegment,
	matchesSegment,
	normalizeEmail,
	phoneCandidates,
} from "./customers";

describe("digitsOf / normalizeEmail", () => {
	test("phone digits ignore formatting", () => {
		expect(digitsOf("+212 612-345-678")).toBe("212612345678");
		expect(digitsOf("06 00 00 00 00")).toBe("0600000000");
	});
	test("emails compare case-insensitively", () => {
		expect(normalizeEmail(" Aya@Titrit.com ")).toBe("aya@titrit.com");
	});
});

describe("guestOrderMatches", () => {
	const customer = { phone: "+212612345678", email: "Aya@Titrit.com" };
	test("matches on normalized phone", () => {
		expect(
			guestOrderMatches(
				{ customerPhone: "0612 345 678", customerEmail: null },
				customer,
			),
		).toBe(true);
	});
	test("matches on case-insensitive email", () => {
		expect(
			guestOrderMatches(
				{ customerPhone: "0700000000", customerEmail: "aya@titrit.com" },
				customer,
			),
		).toBe(true);
	});
	test("no match without a shared identifier", () => {
		expect(
			guestOrderMatches(
				{ customerPhone: "0777777777", customerEmail: "other@x.com" },
				customer,
			),
		).toBe(false);
	});
	test("never matches a customer without a phone when the guest has none either", () => {
		expect(
			guestOrderMatches(
				{ customerPhone: "", customerEmail: null },
				{ phone: "", email: "aya@titrit.com" },
			),
		).toBe(false);
	});
});

describe("phoneCandidates", () => {
	test("covers international and national forms", () => {
		expect(phoneCandidates("+212612345678")).toContain("612345678");
		expect(phoneCandidates("0612345678")).toContain("612345678");
		expect(phoneCandidates("")).toEqual([]);
	});
});

describe("matchesSegment", () => {
	const base = {
		totalOrders: 0,
		matchedGuestOrders: 0,
		emailVerified: false,
		marketingConsent: "",
	};
	test("has-orders / guest-linked", () => {
		expect(matchesSegment(base, "has-orders")).toBe(false);
		expect(matchesSegment({ ...base, totalOrders: 2 }, "has-orders")).toBe(
			true,
		);
		expect(
			matchesSegment({ ...base, matchedGuestOrders: 1 }, "guest-linked"),
		).toBe(true);
	});
	test("email-verified / marketing-consent", () => {
		expect(
			matchesSegment({ ...base, emailVerified: true }, "email-verified"),
		).toBe(true);
		expect(
			matchesSegment(
				{ ...base, marketingConsent: "OPTED_IN" },
				"marketing-consent",
			),
		).toBe(true);
		expect(
			matchesSegment(
				{ ...base, marketingConsent: "OPTED_OUT" },
				"marketing-consent",
			),
		).toBe(false);
	});
});

describe("isCustomerSegment", () => {
	test("accepts known segments only", () => {
		expect(isCustomerSegment("has-orders")).toBe(true);
		expect(isCustomerSegment("bogus")).toBe(false);
		expect(isCustomerSegment(undefined)).toBe(false);
	});
});
