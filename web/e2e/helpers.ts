/**
 * E2E helpers (#126): environment resolution, direct database assertions
 * (persisted state, not just UI messages), and local sign-in.
 */
import { spawnSync } from "node:child_process";
import path from "node:path";
import { readFileSync } from "node:fs";
import { Pool } from "pg";
import { expect, type Page } from "@playwright/test";

const WEB_DIR = path.resolve(__dirname, "..");

export function e2eEnv(): Record<string, string> {
	const out: Record<string, string> = {};
	try {
		for (const line of readFileSync(path.join(WEB_DIR, ".env.e2e"), "utf8").split("\n")) {
			const m = /^([A-Z_]+)=(.*)$/.exec(line.trim());
			if (m) out[m[1]] = m[2];
		}
	} catch {
		// seed not run — specs fail with a clear error below
	}
	return out;
}

export const ENV = e2eEnv();
export const isFullSuite = ENV.NEXT_PUBLIC_SUPABASE_URL?.includes("127.0.0.1:54321") ?? false;
export const staff = {
	email: ENV.E2E_STAFF_EMAIL ?? "e2e-founder@e2e.local",
	password: ENV.E2E_STAFF_PASSWORD ?? "e2e-founder-password",
};
export const customer = {
	email: ENV.E2E_CUSTOMER_EMAIL ?? "e2e-customer@e2e.local",
	password: ENV.E2E_CUSTOMER_PASSWORD ?? "e2e-customer-password",
};

/**
 * Run a read-only SQL query against the isolated test database.
 * Postgres (local Supabase) uses pg; SQLite dev runs shell out to bun +
 * Prisma. The caller passes parameterized SQL; helpers return plain rows.
 */
export async function queryDb<T = Record<string, unknown>>(
	sql: string,
	params: unknown[] = [],
): Promise<T[]> {
	const databaseUrl = ENV.DATABASE_URL ?? "";
	if (databaseUrl.startsWith("postgresql://")) {
		const pool = new Pool({ connectionString: databaseUrl });
		try {
			const res = await pool.query(sql, params as never[]);
			return res.rows as T[];
		} finally {
			await pool.end();
		}
	}
	// SQLite: delegate to bun + Prisma in a subprocess.
	const script = [
		`const {PrismaClient}=require("@prisma/client");`,
		`const db=new PrismaClient();`,
		`db.$queryRawUnsafe(${JSON.stringify(sql)}, ...${JSON.stringify(params)}).then(r=>{console.log(JSON.stringify(r));return db.$disconnect();}).catch(e=>{console.error(e);process.exit(1);})`,
	].join("");
	const res = spawnSync("bun", ["-e", script], {
		cwd: WEB_DIR,
		encoding: "utf8",
		shell: process.platform === "win32",
	});
	if (res.status !== 0) throw new Error(`sqlite query failed: ${res.stderr}`);
	return JSON.parse(res.stdout) as T[];
}

/** Staff sign-in through the real /auth/signin password form (local auth). */
export async function signInAsStaff(page: Page): Promise<void> {
	await page.goto("/auth/signin?callbackUrl=/makteb");
	await page.getByLabel(/e-?mail|courriel/i).fill(staff.email);
	await page.getByLabel(/password|mot de passe/i).fill(staff.password);
	await page.getByRole("button", { name: /se connecter|sign in/i }).click();
	// The dev server may still be compiling /makteb on the first staff hit.
	await page.waitForURL(/makteb/, { timeout: 45_000 });
	await page.waitForLoadState("networkidle");
}

/**
 * Add the main product to the cart and wait for the app's own
 * confirmation toast. The toast doubles as a hydration signal: a click
 * issued before React hydrates is a lost no-op, so the whole
 * (optionally size-selecting) sequence is retried via expect.toPass.
 *
 * The product page renders related-product cards with their own
 * add-to-cart buttons below the purchase section — the main product's
 * button is the first in DOM order.
 */
export async function addToCart(page: Page, opts?: { size?: string }): Promise<void> {
	await expect(async () => {
		if (opts?.size) {
			await page
				.getByRole("button", { name: opts.size, exact: true })
				.click();
		}
		await page
			.getByRole("button", { name: /ajouter au panier/i })
			.first()
			.click();
		await expect(
			page.getByText(/ajouté au panier/i).first(),
		).toBeVisible();
	}).toPass({ timeout: 20_000 });
	// Close the toast wait deterministically.
	await page.waitForTimeout(300);
}

/** Sign out (clears the local auth session, incl. httpOnly cookies). */
export async function signOut(page: Page): Promise<void> {
	await page.context().clearCookies();
	await page.evaluate(() => {
		try {
			window.localStorage.clear();
		} catch {
			/* ignore */
		}
	});
}
