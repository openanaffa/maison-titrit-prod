import { expect, test } from "@playwright/test";
import { e2eEnv } from "./helpers";

/**
 * Decisive auth probe; runs first (filename order). It reproduces the
 * exact session cookie @supabase/ssr writes — base64url of the full
 * session JSON under `sb-<host-prefix>-auth-token` — from a real local
 * password grant, then loads /makteb with it. If the app's server-side
 * session path works, the browser stays on /makteb.
 */
const ENV = e2eEnv();
const SUPABASE_URL = ENV.NEXT_PUBLIC_SUPABASE_URL ?? "http://127.0.0.1:54321";
const ANON_KEY = ENV.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

function ssrCookieName(url: string): string {
	const host = new URL(url).hostname.split(".")[0];
	return `sb-${host}-auth-token`;
}

test("a locally granted session cookie authenticates /makteb", async ({ page }) => {
	test.skip(!ANON_KEY, "anon key missing — seed not run");

	const res = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
		method: "POST",
		headers: { apikey: ANON_KEY, "Content-Type": "application/json" },
		body: JSON.stringify({
			email: ENV.E2E_STAFF_EMAIL ?? "e2e-founder@e2e.local",
			password: ENV.E2E_STAFF_PASSWORD ?? "e2e-founder-password",
		}),
	});
	expect(res.ok).toBe(true);
	const session = (await res.json()) as Record<string, unknown>;
	expect(session.access_token).toBeTruthy();

	// @supabase/ssr encodes cookie values as `base64-` + base64url(JSON).
	const payload = `base64-${Buffer.from(JSON.stringify(session), "utf8").toString("base64url")}`;

	await page.context().addCookies([
		{
			name: ssrCookieName(SUPABASE_URL),
			value: payload,
			domain: "127.0.0.1",
			path: "/",
		},
	]);

	await page.goto("/makteb");
	await expect(page).not.toHaveURL(/signin/);
	await expect(page.locator("main")).toBeVisible();
});
