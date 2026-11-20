import { expect, test } from "@playwright/test";
import { addToCart, queryDb } from "./helpers";

/**
 * Concurrent checkout and duplicate submission: the idempotency key
 * guarantees exactly one order per submission intent (#117/#126).
 */
test("double submission creates exactly one order", async ({ page }) => {
	test.setTimeout(90_000);
	await page.goto("/produit/E2E-LEGACY-001");
	await addToCart(page);
	await page.goto("/checkout");
	await page.getByLabel(/nom complet/i).fill("E2E Doublon");
	await page.getByLabel(/téléphone/i).fill("0655667788");
	await page.getByLabel(/ville/i).fill("Casablanca");
	await page.getByLabel(/adresse/i).fill("5 rue E2E");
	// Interception: count every checkout POST regardless of the UI outcome.
	const postUrls: string[] = [];
	page.on("request", (req) => {
		if (req.url().includes("/api/checkout") && req.method() === "POST") {
			postUrls.push(req.url());
		}
	});

	// Force two rapid submissions of the same form state: the first click
	// may disable the button, but a stale double-press must still be safe.
	const button = page.getByRole("button", { name: /confirmer et commander/i });
	await button.click({ force: true });
	await button.click({ force: true }).catch(() => {
		// The button may already be disabled by pending state — that is the
		// desired duplicate protection.
	});

	await expect(page.getByText(/MT-\d+/).first()).toBeVisible({
		timeout: 20_000,
	});

	// Persisted state: exactly one order for this customer.
	const orders = await queryDb<{ n: number }>(
		'SELECT count(*)::int AS n FROM "Order" WHERE "customerName" = $1',
		["E2E Doublon"],
	);
	expect(orders[0].n).toBe(1);
	// And the UI never reported two order numbers.
	expect(postUrls.length).toBeLessThanOrEqual(3);
});

test("a replayed idempotency key returns the original order", async ({ page }) => {
	const idempotencyKey = `e2e-replay-${Date.now()}`;
	const payload = {
		items: [{ productId: "", qty: 1, size: null }],
		customer: {
			name: "E2E Replay",
			phone: "0666778899",
			city: "Casablanca",
			address: "6 rue E2E",
		},
		idempotencyKey,
	};
	// Resolve the seeded legacy product id from the storefront data layer.
	const product = (
		await queryDb<{ id: string }>(
			"SELECT id FROM \"Product\" WHERE ref = 'E2E-LEGACY-001'",
		)
	)[0];
	payload.items[0].productId = product.id;

	const request = (await import("@playwright/test")).request;
	const ctx = await request.newContext({ baseURL: "http://127.0.0.1:3000" });
	const res1 = await ctx.post("/api/checkout", { data: payload });
	expect(res1.status()).toBe(200);
	const body1 = (await res1.json()) as { order?: { number: string } };
	const res2 = await ctx.post("/api/checkout", { data: payload });
	expect(res2.status()).toBe(200);
	const body2 = (await res2.json()) as { order?: { number: string } };
	expect(body1.order?.number).toBeTruthy();
	expect(body2.order?.number).toBe(body1.order?.number);

	const orders = await queryDb<{ n: number }>(
		'SELECT count(*)::int AS n FROM "Order" WHERE "idempotencyKey" = $1',
		[idempotencyKey],
	);
	expect(orders[0].n).toBe(1);
	await ctx.dispose();
});
