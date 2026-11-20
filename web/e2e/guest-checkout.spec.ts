import { expect, test } from "@playwright/test";
import { addToCart, queryDb, waitForHydration } from "./helpers";

test("guest checkout persists a COD order end to end", async ({ page }) => {
	await page.goto("/produit/E2E-LEGACY-001");
	await expect(page.getByRole("heading", { name: /E2E Caftan/i })).toBeVisible();

	await addToCart(page);
	await page.goto("/checkout");
	await expect(page).toHaveURL(/\/checkout/);
	// The submit click must reach the hydrated handler (no native submit).
	await waitForHydration(page, /confirmer et commander/);

	await page.getByLabel(/nom complet/i).fill("E2E Cliente");
	await page.getByLabel(/téléphone/i).fill("0611223344");
	await page.getByLabel(/ville/i).fill("Casablanca");
	await page.getByLabel(/adresse/i).fill("12 rue E2E");
	await page
		.getByRole("button", { name: /confirmer et commander/i })
		.click();

	// Success state renders the persisted order number (UI evidence).
	const success = page.getByText(/MT-\d+/).first();
	await expect(success).toBeVisible({ timeout: 20_000 });
	// The paragraph reads "N° de commande: MT-1003" — extract the number.
	const orderNumber =
		/MT-\d+/.exec((await success.textContent()) ?? "")?.[0] ?? "";

	// Persisted state — not just the UI message.
	const orders = await queryDb<{ id: string; status: string; total: number; city: string }>(
		'SELECT id, status, total, city FROM "Order" WHERE number = $1',
		[orderNumber],
	);
	expect(orders).toHaveLength(1);
	const order = orders[0];
	expect(order.status).toBe("PENDING");
	expect(order.city).toBe("Casablanca");
	// 450 product + 25 Casablanca delivery fee.
	expect(order.total).toBe(475);

	const items = await queryDb(
		'SELECT quantity, price FROM "OrderItem" WHERE "orderId" = $1',
		[order.id],
	);
	expect(items.length).toBe(1);

	// Legacy product has no variants → no variant reservation movement.
	const movements = await queryDb<{ n: number }>(
		'SELECT count(*)::int AS n FROM "StockMovement" sm JOIN "ProductVariant" pv ON pv.id = sm."variantId" JOIN "Product" p ON p.id = pv."productId" WHERE p.ref = $1',
		["E2E-LEGACY-001"],
	);
	expect(movements[0].n).toBe(0);

	const history = await queryDb(
		'SELECT "fromStatus", "toStatus" FROM "OrderStatusHistory" WHERE "orderId" = $1',
		[order.id],
	);
	expect(history.length).toBe(1);
	expect(history[0].toStatus).toBe("PENDING");
});

test("guest checkout without a delivery-zone city still records a zone-less order", async ({ page }) => {
	await page.goto("/produit/E2E-LEGACY-001");
	await addToCart(page);
	await page.goto("/checkout");
	await page.getByLabel(/nom complet/i).fill("E2E Sans Zone");
	await page.getByLabel(/téléphone/i).fill("0622334455");
	await page.getByLabel(/ville/i).fill("VilleInconnue");
	await page.getByLabel(/adresse/i).fill("1 rue E2E");
	await waitForHydration(page, /confirmer et commander/);
	await page.getByRole("button", { name: /confirmer et commander/i }).click();
	const success = page.getByText(/MT-\d+/).first();
	await expect(success).toBeVisible({ timeout: 20_000 });
	// The paragraph reads "N° de commande: MT-1003" — extract the number.
	const orderNumber =
		/MT-\d+/.exec((await success.textContent()) ?? "")?.[0] ?? "";
	const orders = await queryDb<{ total: number }>(
		'SELECT total FROM "Order" WHERE number = $1',
		[orderNumber],
	);
	expect(orders[0]?.total).toBe(450);
});
