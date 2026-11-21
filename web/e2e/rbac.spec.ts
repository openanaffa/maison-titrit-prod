import { expect, test } from "@playwright/test";
import { customer, queryDb, signInAsStaff, signOut, waitForHydration } from "./helpers";

test("anonymous visitors are redirected away from /makteb", async ({ page }) => {
	await page.goto("/makteb");
	await expect(page).toHaveURL(/auth\/signin/, { timeout: 15_000 });
});

test("anonymous admin API calls are rejected", async ({ request }) => {
	const product = (
		await queryDb<{ id: string }>(
			"SELECT id FROM \"Product\" WHERE ref = 'E2E-LEGACY-001'",
		)
	)[0];
	const res = await request.patch(`/api/admin/orders/${product.id}`, {
		data: { status: "CONFIRMED" },
	});
	expect([401, 403]).toContain(res.status());
});

test("a CUSTOMER session cannot write customer records", async ({ page }) => {
	test.setTimeout(60_000);
	// Skip on SQLite runs: needs the local Supabase auth.
	const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
	test.skip(
		!supabaseUrl.includes("127.0.0.1:54321"),
		"requires the local Supabase instance",
	);

	// Sign in as the seeded CUSTOMER (hydration-safe like signInAsStaff).
	await page.goto("/auth/signin?callbackUrl=/makteb");
	await waitForHydration(page, /se connecter|sign in/);
	await page.getByLabel(/e-?mail|courriel/i).fill(customer.email);
	await page.getByLabel(/password|mot de passe/i).fill(customer.password);
	await page.getByRole("button", { name: /se connecter|sign in/i }).click();
	await page.waitForURL(/makteb/, { timeout: 45_000 });

	// The customers workspace itself redirects non-readers.
	await page.goto("/makteb/customers");
	await expect(page).not.toHaveURL(/makteb\/customers/, { timeout: 15_000 });

	// And the API enforces it regardless of the UI.
	const target = (
		await queryDb<{ id: string }>(
			'SELECT id FROM "User" WHERE role = \'CUSTOMER\' LIMIT 1',
		)
	)[0];
	const res = await page.request.post(`/api/admin/customers/${target.id}/consent`, {
		data: { consent: "OPTED_IN" },
	});
	expect([401, 403]).toContain(res.status());
	await signOut(page);
});

test("staff can reach the workspace after a real sign-in", async ({ page }) => {
	const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
	test.skip(
		!supabaseUrl.includes("127.0.0.1:54321"),
		"requires the local Supabase instance",
	);
	await signInAsStaff(page);
	await page.goto("/makteb/fulfilment");
	await expect(
		page.getByText(/file de préparation|fulfilment/i).first(),
	).toBeVisible({ timeout: 15_000 });
	await signOut(page);
});
