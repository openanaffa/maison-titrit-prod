import { describe, expect, test } from "bun:test";
import { customerOrderUpdateEmail } from "./email-templates";
import { digitsOnly } from "./notify";
import { isNotifyingEvent } from "./order-notifications";
import {
	ALLOWED_TRANSITIONS,
	FULFILMENT_QUEUES,
	QUEUE_NEXT_ACTION,
} from "./types/constants";

describe("FULFILMENT_QUEUES", () => {
	test("partitions every order status exactly once", () => {
		const seen = FULFILMENT_QUEUES.flatMap((q) => q.statuses);
		const all = [
			"PENDING",
			"CONFIRMED",
			"PROCESSING",
			"DISPATCHED",
			"DELIVERED",
			"CANCELLED",
			"RETURN_REQUESTED",
			"RETURNED",
		];
		expect([...seen].sort()).toEqual([...all].sort());
	});
	test("each queue key has a next action permitted from every status in it", () => {
		for (const q of FULFILMENT_QUEUES) {
			const target = QUEUE_NEXT_ACTION[q.key];
			if (!target) continue; // passive queues (delivered/exceptions)
			for (const status of q.statuses) {
				expect((ALLOWED_TRANSITIONS[status] ?? []).includes(target)).toBe(true);
			}
		}
	});
});

describe("isNotifyingEvent", () => {
	test("transitions that trigger customer notifications", () => {
		expect(isNotifyingEvent("CONFIRMED")).toBe(true);
		expect(isNotifyingEvent("DISPATCHED")).toBe(true);
		expect(isNotifyingEvent("DELIVERED")).toBe(true);
	});
	test("silent transitions", () => {
		expect(isNotifyingEvent("PENDING")).toBe(false);
		expect(isNotifyingEvent("PROCESSING")).toBe(false);
		expect(isNotifyingEvent("CANCELLED")).toBe(false);
	});
});

describe("digitsOnly", () => {
	test("normalizes WhatsApp-friendly input", () => {
		expect(digitsOnly("+212 612-345-678")).toBe("212612345678");
		expect(digitsOnly("06 00 00 00 00")).toBe("0600000000");
	});
});

describe("customerOrderUpdateEmail", () => {
	const order = {
		number: "MT-1002",
		customerName: "Yasmine",
		customerEmail: "y@example.com",
		customerPhone: "0600000000",
		total: 405,
		deliveryProvider: "Livreur maison",
		deliveryReference: "REF-7",
	};
	test("mentions order number and event copy", () => {
		const tpl = customerOrderUpdateEmail("DISPATCHED", order);
		expect(tpl.subject).toContain("MT-1002");
		expect(tpl.text).toContain("MT-1002");
		expect(tpl.html).toContain("en route");
	});
	test("shows delivery provider and reference when present", () => {
		const tpl = customerOrderUpdateEmail("DISPATCHED", order);
		expect(tpl.html).toContain("Livreur maison");
		expect(tpl.html).toContain("REF-7");
	});
	test("omits delivery line when fields are empty", () => {
		const tpl = customerOrderUpdateEmail("CONFIRMED", {
			...order,
			deliveryProvider: "",
			deliveryReference: "",
		});
		expect(tpl.text).not.toContain("Livraison :");
	});
});
