import { expect, test } from "@playwright/test";
import { isFullSuite, queryDb, signInAsStaff, signOut, waitForHydration } from "./helpers";

/**
 * COD confirmation and allowed order transitions, driven by a real staff
 * session against the local Supabase instance (skipped on SQLite runs).
 */
test.skip(!isFullSuite, "requires the local Supabase instance (full suite)");

async function createSeededOrder(): Promise<string> {
	const product = (
		await queryDb<{ id: string }>(
			"SELECT id FROM \"Product\" WHERE ref = 'E2E-LEGACY-001'",
		)
	)[0];
	const idempotencyKey = `e2e-lifecycle-${Date.now()}`;
	const request = (await import("@playwright/test")).request;
	const ctx = await request.newContext({ baseURL: "http://127.0.0.1:3000" });
	const res = await ctx.post("/api/checkout", {
		data: {
			items: [{ productId: product.id, qty: 1, size: null }],
			customer: {
				name: "E2E Lifecycle",
				phone: "0677889900",
				city: "Casablanca",
				address: "7 rue E2E",
			},
			idempotencyKey,
		},
	});
	const body = (await res.json()) as { order?: { number: string } };
	await ctx.dispose();
	if (!body.order?.number) throw new Error("seed order failed");
	return body.order.number;
}

test("staff processes an order through every allowed COD transition", async ({ page }) => {
	test.setTimeout(120_000);
	const number = await createSeededOrder();
	await signInAsStaff(page);

	// Fulfilment queue: to-confirm. A click before React hydrates is a
	// lost no-op — wait for the hydrated handler on every queue load.
	const hydrateQueue = () =>
		waitForHydration(page, /confirmer|préparer|expédier|livrer|valider/);

	await page.goto("/makteb/fulfilment?queue=to-confirm");
	const row = page.locator("tr", { hasText: number });
	await expect(row).toBeVisible();
	await hydrateQueue();

	await row.getByRole("button", { name: /confirmer/i }).click();
	await expect(
		page.locator("tr", { hasText: number }).getByText(/CONFIRMED|Confirmée/i, { exact: false }).first(),
	).toBeVisible({ timeout: 20_000 });

	// to-prepare → start preparing.
	await page.goto("/makteb/fulfilment?queue=to-prepare");
	await hydrateQueue();
	await page
		.locator("tr", { hasText: number })
		.getByRole("button", { name: /préparer/i })
		.click();
	await page.goto("/makteb/fulfilment?queue=to-dispatch");
	await hydrateQueue();
	await page
		.locator("tr", { hasText: number })
		.getByRole("button", { name: /expédier/i })
		.click();
	// Dispatch opens the inline form (provider/reference).
	const dispatchRow = page.locator("tr", { hasText: number });
	await waitForHydration(page, /valider/);
	await dispatchRow.getByRole("button", { name: /valider/i }).click();
	await expect(
		page.locator("tr", { hasText: number }).getByText(/DISPATCHED|Expédiée/i, { exact: false }).first(),
	).toBeVisible({ timeout: 20_000 });

	// In transit → deliver.
	await page.goto("/makteb/fulfilment?queue=in-transit");
	await hydrateQueue();
	await page
		.locator("tr", { hasText: number })
		.getByRole("button", { name: /livrer/i })
		.click();
	await expect(
		page.locator("tr", { hasText: number }).getByText(/DELIVERED|Livrée/i, { exact: false }).first(),
	).toBeVisible({ timeout: 20_000 });

	// Persisted audit trail for the whole walk.
	const history = await queryDb<{ to_status: string }>(
		'SELECT "toStatus" AS to_status FROM "OrderStatusHistory" h JOIN "Order" o ON o.id = h."orderId" WHERE o.number = $1 ORDER BY h."createdAt" ASC',
		[number],
	);
	expect(history.map((h) => h.to_status)).toEqual([
		"PENDING",
		"CONFIRMED",
		"PROCESSING",
		"DISPATCHED",
		"DELIVERED",
	]);

	// Delivered order settled its reservation ledger (legacy product → none,
	// so assert the fulfilment/payment columns instead).
	const order = (
		await queryDb<{ fulfilment: string; payment: string }>(
			'SELECT "fulfilmentStatus" AS fulfilment, "paymentStatus" AS payment FROM "Order" WHERE number = $1',
			[number],
		)
	)[0];
	expect(order.fulfilment).toBe("DELIVERED");
	expect(order.payment).toBe("PAID");
	await signOut(page);
});

test("cancelling an order releases its variant reservation", async ({ page }) => {
	test.setTimeout(120_000);
	// Place a variant order directly (idempotent API path).
	const variant = (
		await queryDb<{ id: string; product_id: string }>(
			'SELECT id, "productId" AS product_id FROM "ProductVariant" WHERE sku = \'E2E-VAR-S\'',
		)
	)[0];
	const idempotencyKey = `e2e-cancel-${Date.now()}`;
	const request = (await import("@playwright/test")).request;
	const ctx = await request.newContext({ baseURL: "http://127.0.0.1:3000" });
	const res = await ctx.post("/api/checkout", {
		data: {
			items: [{ productId: variant.product_id, qty: 1, size: "S" }],
			customer: {
				name: "E2E Annulation",
				phone: "0688990011",
				city: "Casablanca",
				address: "8 rue E2E",
			},
			idempotencyKey,
		},
	});
	const body = (await res.json()) as { order?: { number: string } };
	await ctx.dispose();
	const number = body.order?.number;
	if (!number) throw new Error("seed order failed");

	await signInAsStaff(page);
	await page.goto("/makteb/fulfilment?queue=to-confirm");
	const row = page.locator("tr", { hasText: number });
	await expect(row).toBeVisible();
	await waitForHydration(page, /annuler|valider/);
	await row.getByRole("button", { name: /annuler/i }).click();
	await row.getByRole("button", { name: /valider/i }).click();
	await expect(
		page.locator("tr", { hasText: number }).getByText(/CANCELLED|Annulée/i, { exact: false }).first(),
	).toBeVisible({ timeout: 20_000 });

	// The reservation is released: a lifecycle release movement exists and
	// the variant's reserved counter is back to zero.
	const movement = (
		await queryDb<{ n: number }>(
			'SELECT count(*)::int AS n FROM "StockMovement" WHERE "idempotencyKey" LIKE $1 AND type = $2',
			[`${idempotencyKey}:reserve:%`, "RELEASE"],
		)
	)[0];
	expect(movement.n).toBe(1);
	const variantAfter = (
		await queryDb<{ reserved: number }>(
			'SELECT reserved FROM "ProductVariant" WHERE sku = \'E2E-VAR-S\'',
		)
	)[0];
	expect(variantAfter.reserved).toBe(0);
	await signOut(page);
});
