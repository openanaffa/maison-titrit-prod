/**
 * E2E environment contract (#126).
 *
 * The suite runs against an isolated local database — the local Supabase
 * Postgres in CI, or the SQLite dev database for guest-only local runs.
 * Everything here refuses to touch production.
 */
import { spawnSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

// Seed and Playwright both run with cwd = web/ (package scripts).
export const WEB_DIR = process.cwd();

export type E2eEnv = {
	databaseUrl: string;
	supabaseUrl: string;
	supabaseAnonKey: string;
	supabaseServiceKey: string;
};

/** Resolve the repo root (the git checkout that owns web/). */
export function repoRoot(): string {
	return path.resolve(WEB_DIR, "..");
}

/** The well-known local Supabase Postgres DSN used by supabase start. */
export const LOCAL_SUPABASE_POSTGRES =
	"postgresql://postgres:postgres@127.0.0.1:54322/postgres";
export const LOCAL_SUPABASE_URL = "http://127.0.0.1:54321";

export function isLocalPostgres(databaseUrl: string): boolean {
	return databaseUrl.includes("@127.0.0.1:54322") || databaseUrl.includes("@localhost:54322");
}

export function isSqlite(databaseUrl: string): boolean {
	// Only E2E-dedicated SQLite files may be seeded/cleaned — a developer's
	// dev.db holds real local catalog/order data that deleteMany() would
	// erase (Codex P2 on #151).
	return databaseUrl.startsWith("file:") && /e2e/i.test(databaseUrl);
}

/**
 * Production guard: the suite must never run against the deployed
 * Supabase project or any remote Postgres.
 */
export function assertIsolated(databaseUrl: string, supabaseUrl: string): void {
	const dangerous =
		!isLocalPostgres(databaseUrl) &&
		!isSqlite(databaseUrl) &&
		!databaseUrl.startsWith("postgresql://postgres:postgres@localhost") &&
		!databaseUrl.startsWith("postgresql://postgres:postgres@127.0.0.1");
	if (dangerous) {
		throw new Error(
			`E2E refuses to run: DATABASE_URL is not a local/SQLite database (${redact(databaseUrl)})`,
		);
	}
	if (supabaseUrl && !supabaseUrl.startsWith("http://127.0.0.1") && !supabaseUrl.startsWith("http://localhost")) {
		throw new Error(
			`E2E refuses to run: NEXT_PUBLIC_SUPABASE_URL is not local (${supabaseUrl})`,
		);
	}
}

function redact(url: string): string {
	return url.replace(/:[^:@/]+@/, ":***@");
}

/** Read the current .env (repo convention: gitignored, holds real values). */
export function readDotEnv(): Record<string, string> {
	const file = path.join(WEB_DIR, ".env");
	try {
		const out: Record<string, string> = {};
		for (const line of readFileSync(file, "utf8").split("\n")) {
			const m = /^([A-Z_]+)=(.*)$/.exec(line.trim());
			if (m) out[m[1]] = m[2];
		}
		return out;
	} catch {
		return {};
	}
}

function parseStatusKey(output: string, name: string): string | null {
	// `supabase status -o env` may quote values depending on CLI version —
	// strip surrounding quotes so the bearer token stays a valid JWT.
	const m = new RegExp(`${name}=?"?([^\"\\r\\n\\s]+)"?`).exec(output);
	return m?.[1] ?? null;
}

/** Read the local anon/service keys from `supabase status -o env`. */
export function readLocalSupabaseKeys(): {
	anonKey: string;
	serviceKey: string;
} | null {
	const res = spawnSync("npx", ["-y", "supabase", "status", "-o", "env"], {
		cwd: repoRoot(),
		encoding: "utf8",
		shell: process.platform === "win32",
	});
	if (res.status !== 0 || !res.stdout) return null;
	const anon = parseStatusKey(res.stdout, "ANON_KEY");
	const service = parseStatusKey(res.stdout, "SERVICE_ROLE_KEY");
	if (!anon || !service) return null;
	return { anonKey: anon, serviceKey: service };
}

/** Write web/.env.e2e for the Playwright webServer env. */
export function writeE2eEnvFile(env: E2eEnv): void {
	writeFileSync(
		path.join(WEB_DIR, ".env.e2e"),
		[
			`DATABASE_URL=${env.databaseUrl}`,
			`NEXT_PUBLIC_SUPABASE_URL=${env.supabaseUrl}`,
			`NEXT_PUBLIC_SUPABASE_ANON_KEY=${env.supabaseAnonKey}`,
			`SUPABASE_SERVICE_ROLE_KEY=${env.supabaseServiceKey}`,
			`E2E_STAFF_EMAIL=${STAFF.email}`,
			`E2E_STAFF_PASSWORD=${STAFF.password}`,
			`E2E_CUSTOMER_EMAIL=${CUSTOMER.email}`,
			`E2E_CUSTOMER_PASSWORD=${CUSTOMER.password}`,
		].join("\n"),
		"utf8",
	);
}

/** Deterministic test identities (local only). */
export const STAFF = {
	email: "e2e-founder@e2e.local",
	password: "e2e-founder-password",
	name: "E2E Founder",
	role: "FOUNDER" as const,
};
export const CUSTOMER = {
	email: "e2e-customer@e2e.local",
	password: "e2e-customer-password",
	name: "E2E Customer",
	phone: "0612345678",
	role: "CUSTOMER" as const,
};
