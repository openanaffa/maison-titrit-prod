import { defineConfig, devices } from "@playwright/test";
import path from "node:path";
import { readFileSync } from "node:fs";

// Seed writes web/.env.e2e; the webServer inherits it so `next dev` runs
// against the isolated local database (never production).
function e2eEnv(): Record<string, string> {
	const file = path.resolve(__dirname, ".env.e2e");
	const out: Record<string, string> = {};
	try {
		for (const line of readFileSync(file, "utf8").split("\n")) {
			const m = /^([A-Z_]+)=(.*)$/.exec(line.trim());
			if (m) out[m[1]] = m[2];
		}
	} catch {
		// Seed has not run yet — tests will fail fast with a clear message.
	}
	return out;
}

const env = e2eEnv();

export default defineConfig({
	testDir: "./e2e",
	timeout: 60_000,
	expect: { timeout: 10_000 },
	fullyParallel: false,
	workers: 1,
	retries: process.env.CI ? 1 : 0,
	reporter: process.env.CI ? [["list"], ["html", { open: "never" }]] : "list",
	use: {
		baseURL: "http://127.0.0.1:3000",
		trace: "retain-on-failure",
	},
	webServer: {
		// CI runs the production server — dev-mode hydration is racy under
		// parallel compiles (chunks stall, clicks land pre-hydration). A
		// build+start also mirrors what real visitors use.
		command: process.env.PW_DEV ? "bun run dev" : "bun run build && bun run start",
		cwd: __dirname,
		port: 3000,
		reuseExistingServer: !process.env.CI,
		env,
		timeout: 420_000,
	},
	projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
});
