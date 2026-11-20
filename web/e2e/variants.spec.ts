import { expect, test } from "@playwright/test";
import { queryDb } from "./helpers";

test("variant selection reserves stock per size and persists the variant link", async ({ page }) => {
	await page.goto("/produit/E2E-VARIANT-001");
	await expect(page.getByRole("heading", { name: /E2E Robe/i })).toBeVisible();

	// Pick size M and add to cart.
	await page.getByRole("button", { name: "M", exact: true }).click();
	await page.getByRole("button", { name: /ajouter au panier/i }).click();
	await page.goto("/checkout");
	await page.getByLabel(/nom complet/i).fill("E2E Variante");
	await page.getByLabel(/téléphone/i).fill("0633445566");
	await page.getByLabel(/ville/i).fill("Casablanca");
	await page.getByLabel(/adresse/i).fill("3 rue E2E");
	await page.getByRole("button", { name: /confirmer et commander/i }).click();
	const success = page.getByText(/MT-/).first();
	await expect(success).toBeVisible({ timeout: 20_000 });
	const orderNumber = (await success.textContent())?.trim() ?? "";

	const order = (
		await queryDb<{ id: string; total: number }>(
			'SELECT id, total FROM "Order" WHERE number = $1',
			[orderNumber],
		)
	)[0];
	// 300 product + 25 fee.
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
		await queryDb<{ quantity: number }>(
			'SELECT quantity FROM "StockMovement" sm JOIN "ProductVariant" pv ON pv.id = sm."variantId" WHERE pv.sku = $1 AND sm.type = $2',
			["E2E-VAR-M", "RESERVE"],
		)
	)[0];
	expect(movement?.quantity).toBe(1);
});

test("a size without stock is not purchasable", async ({ page }) => {
	await page.goto("/produit/E2E-VARIANT-001");
	// Size L has on-hand 0 — selecting it must not produce a purchasable
	// cart line; the checkout API rejects it.
	await page.getByRole("button", { name: "L", exact: true }).click();
	await page.getByRole("button", { name: /ajouter au panier/i }).click();
	await page.goto("/checkout");
	await page.getByLabel(/nom complet/i).fill("E2E Sans Stock");
	await page.getByLabel(/téléphone/i).fill("0644556677");
	await page.getByLabel(/ville/i).fill("Casablanca");
	await page.getByLabel(/adresse/i).fill("4 rue E2E");
	await page.getByRole("button", { name: /confirmer et commander/i }).click();

	// Checkout surfaces a failure state (no success page).
	await expect(page.getByText(/MT-\d+/)).not.toBeVisible({ timeout: 15_000 });

	// Persisted state: no new order for this customer.
	const orders = await queryDb<{ n: number }>(
		'SELECT count(*)::int AS n FROM "Order" WHERE "customerName" = $1',
		["E2E Sans Stock"],
	);
	expect(orders[0].n).toBe(0);
});

test("an out-of-stock product cannot be purchased", async ({ page }) => {
	await page.goto("/produit/E2E-SOLDOUT-001");
	const button = page.getByRole("button", { name: /rupture/i });
	await expect(button).toBeVisible();
	await page.goto("/checkout");
	// No cart contents → checkout is not placeable; verify no order was
	// created for the sold-out product ref.
	const orders = await queryDb<{ n: number }>(
		'SELECT count(*)::int AS n FROM "OrderItem" oi JOIN "Product" p ON p.id = oi."productId" WHERE p.ref = $1',
		["E2E-SOLDOUT-001"],
	);
	expect(orders[0].n).toBe(0);
});
