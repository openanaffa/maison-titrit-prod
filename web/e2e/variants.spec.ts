import { expect, test } from "@playwright/test";
import { queryDb } from "./helpers";

/**
 * Variant selection and unavailable stock behavior (#126).
 *
 * The UI part of variant selection (size buttons render, sold-out product
 * shows Épuisé) is covered by the direct assertions below; the purchase
 * flows are driven through the real /api/checkout endpoint with idempotent
 * payloads so the suite asserts persisted state deterministically.
 */
test("checkout with a size reserves the matching variant and persists the link", async ({ request }) => {
	const variant = (
		await queryDb<{ id: string; product_id: string }>(
			'SELECT id, "productId" AS product_id FROM "ProductVariant" WHERE sku = \'E2E-VAR-M\'',
		)
	)[0];
	const idempotencyKey = `e2e-variant-${Date.now()}`;
	const res = await request.post("/api/checkout", {
		data: {
			items: [{ productId: variant.product_id, qty: 1, size: "M" }],
			customer: {
				name: "E2E Variante",
				phone: "0633445566",
				city: "Casablanca",
				address: "3 rue E2E",
			},
			idempotencyKey,
		},
	});
	expect(res.status()).toBe(200);
	const body = (await res.json()) as { order?: { number: string } };
	const number = body.order?.number;
	expect(number).toBeTruthy();

	const order = (
		await queryDb<{ id: string; total: number }>(
			'SELECT id, total FROM "Order" WHERE number = $1',
			[number],
		)
	)[0];
	// 300 product + 25 Casablanca delivery fee.
	expect(order.total).toBe(325);

	// The order item is linked to the E2E-VAR-M variant.
	const item = (
		await queryDb<{ sku: string | null }>(
			'SELECT oi.sku FROM "OrderItem" oi JOIN "ProductVariant" pv ON pv.id = oi."variantId" WHERE oi."orderId" = $1',
			[order.id],
		)
	)[0];
	expect(item?.sku).toBe("E2E-VAR-M");

	// The reservation was recorded against that variant (stock held).
	const movement = (
		await queryDb<{ quantity: number; variant_sku: string }>(
			'SELECT sm.quantity, pv.sku AS variant_sku FROM "StockMovement" sm JOIN "ProductVariant" pv ON pv.id = sm."variantId" WHERE sm."idempotencyKey" = $1 AND sm.type = $2',
			[`${idempotencyKey}:reserve:0`, "RESERVE"],
		)
	)[0];
	expect(movement.variant_sku).toBe("E2E-VAR-M");
	expect(movement.quantity).toBe(1);
});

test("a size without stock is rejected and persists nothing", async ({ request }) => {
	const variant = (
		await queryDb<{ id: string; product_id: string }>(
			'SELECT id, "productId" AS product_id FROM "ProductVariant" WHERE sku = \'E2E-VAR-L\'',
		)
	)[0];
	const res = await request.post("/api/checkout", {
		data: {
			items: [{ productId: variant.product_id, qty: 1, size: "L" }],
			customer: {
				name: "E2E Sans Stock",
				phone: "0644556677",
				city: "Casablanca",
				address: "4 rue E2E",
			},
			idempotencyKey: `e2e-soldout-${Date.now()}`,
		},
	});
	expect(res.status()).toBeGreaterThanOrEqual(400);
	// Persisted state: no order for this customer.
	const orders = await queryDb<{ n: number }>(
		'SELECT count(*)::int AS n FROM "Order" WHERE "customerName" = $1',
		["E2E Sans Stock"],
	);
	expect(orders[0].n).toBe(0);
});

test("the variant product page renders its size options", async ({ page }) => {
	await page.goto("/produit/E2E-VARIANT-001");
	await expect(page.getByRole("heading", { name: /E2E Robe/i })).toBeVisible();
	for (const size of ["S", "M", "L"]) {
		await expect(
			page.getByRole("button", { name: size, exact: true }),
		).toBeVisible();
	}
});

test("the sold-out product page shows the unavailable state", async ({ page }) => {
	await page.goto("/produit/E2E-SOLDOUT-001");
	await expect(
		page.getByRole("button", { name: /épuisé/i }).first(),
	).toBeVisible();
	// Persisted state: no order has ever contained this product.
	const orders = await queryDb<{ n: number }>(
		'SELECT count(*)::int AS n FROM "OrderItem" oi JOIN "Product" p ON p.id = oi."productId" WHERE p.ref = $1',
		["E2E-SOLDOUT-001"],
	);
	expect(orders[0].n).toBe(0);
});
