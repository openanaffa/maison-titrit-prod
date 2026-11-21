/**
 * Deterministic E2E seed (#126). Run with `bun run e2e:seed`.
 *
 * CI: local Supabase (Postgres + auth) → full seed including auth users.
 * Local without Docker: SQLite → catalog seed only (guest specs).
 *
 * Guards: refuses to touch any remote/production database.
 */
import path from "node:path";
import { PrismaClient } from "@prisma/client";
import {
	assertIsolated,
	CUSTOMER,
	isLocalPostgres,
	isSqlite,
	readLocalSupabaseKeys,
	readDotEnv,
	STAFF,
	writeE2eEnvFile,
	type E2eEnv,
} from "./env";

async function main() {
	const dotEnv = readDotEnv();
	const databaseUrl =
		process.env.DATABASE_URL ||
		dotEnv.DATABASE_URL ||
		(isLocalPostgresAvailable() ? "" : "");
	if (!databaseUrl) {
		console.error("DATABASE_URL is not set (.env or environment).");
		process.exit(1);
	}
	// CI export: local supabase URL; local SQLite runs keep the storefront env.
	const supabaseUrl =
		process.env.NEXT_PUBLIC_SUPABASE_URL || dotEnv.NEXT_PUBLIC_SUPABASE_URL || "";
	assertIsolated(databaseUrl, supabaseUrl);

	if (isLocalPostgres(databaseUrl)) {
		const keys = readLocalSupabaseKeys();
		if (!keys) {
			console.error(
				"Local Supabase keys unavailable — run `supabase start` first.",
			);
			process.exit(1);
		}
		const env: E2eEnv = {
			databaseUrl,
			supabaseUrl: "http://127.0.0.1:54321",
			supabaseAnonKey: keys.anonKey,
			supabaseServiceKey: keys.serviceKey,
		};
		writeE2eEnvFile(env);
		await seedCatalog();
		await seedAuthUsers(env);
		console.log("E2E seed complete (local Supabase: full suite).");
	} else if (isSqlite(databaseUrl)) {
		const env: E2eEnv = {
			databaseUrl,
			supabaseUrl: supabaseUrl || "",
			supabaseAnonKey: dotEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY || "",
			supabaseServiceKey: "",
		};
		writeE2eEnvFile(env);
		await seedCatalog();
		console.log("E2E seed complete (SQLite: guest suite only).");
	} else {
		console.error("Unreachable: isolation guard failed.");
		process.exit(1);
	}
}

function isLocalPostgresAvailable(): boolean {
	// Caller decides via DATABASE_URL; empty default keeps types simple.
	return false;
}

/** Deterministic catalog + delivery zone. */
async function seedCatalog() {
	const db = new PrismaClient();
	try {
		await db.orderNotification.deleteMany();
		await db.customerNote.deleteMany();
		await db.orderStatusHistory.deleteMany();
		await db.stockMovement.deleteMany();
		await db.orderItem.deleteMany();
		await db.order.deleteMany();
		await db.productVariant.deleteMany();
		await db.product.deleteMany();
		await db.deliveryZone.deleteMany();

		const zone = await db.deliveryZone.create({
			data: {
				name: "E2E Casablanca",
				cities: "Casablanca",
				fee: 25,
				isActive: true,
			},
		});
		console.log("seed: delivery zone", zone.id);

		// Size-bearing product with per-variant stock (S/M/L; L sold out).
		const variantProduct = await db.product.create({
			data: {
				ref: "E2E-VARIANT-001",
				name: "E2E Robe Variantes",
				description: "Robe de test avec variantes de taille.",
				shortStory: "Robe de test.",
				materials: "Coton",
				colors: "Beige",
				sizes: "S · M · L",
				price: 300,
				inStock: true,
				featured: true,
				variants: {
					create: [
						{ sku: "E2E-VAR-S", size: "S", onHand: 5, color: null },
						{ sku: "E2E-VAR-M", size: "M", onHand: 3, color: null },
						{ sku: "E2E-VAR-L", size: "L", onHand: 0, color: null },
					],
				},
			},
			include: { variants: true },
		});
		console.log("seed: variant product", variantProduct.id);

		// Legacy sizeless product (product-level availability).
		const legacyProduct = await db.product.create({
			data: {
				ref: "E2E-LEGACY-001",
				name: "E2E Caftan Classique",
				description: "Produit de test sans variantes.",
				shortStory: "Caftan de test.",
				materials: "Soie",
				colors: "Bleu",
				sizes: "",
				price: 450,
				inStock: true,
				featured: true,
			},
		});
		console.log("seed: legacy product", legacyProduct.id);

		// Out-of-stock product.
		await db.product.create({
			data: {
				ref: "E2E-SOLDOUT-001",
				name: "E2E Piece Rupture",
				description: "Produit de test en rupture.",
				shortStory: "Rupture de stock.",
				materials: "Lin",
				colors: "Vert",
				sizes: "",
				price: 200,
				inStock: false,
			},
		});
		console.log("seed: out-of-stock product");
	} finally {
		await db.$disconnect();
	}
}

/** Local-Supabase-only: auth users + app User rows with roles. */
async function seedAuthUsers(env: E2eEnv) {
	const db = new PrismaClient();
	try {
		for (const identity of [STAFF, CUSTOMER]) {
			const userId = await createSupabaseUser(env, identity.email, identity.password);
			await db.user.upsert({
				where: { email: identity.email },
				update: { supabaseId: userId, role: identity.role, name: identity.name },
				create: {
					supabaseId: userId,
					email: identity.email,
					name: identity.name,
					role: identity.role,
					phone: "phone" in identity ? (identity as typeof CUSTOMER).phone : null,
				},
			});
			console.log("seed: user", identity.email, identity.role);
		}
	} finally {
		await db.$disconnect();
	}
}

async function createSupabaseUser(
	env: E2eEnv,
	email: string,
	password: string,
): Promise<string> {
	const res = await fetch(`${env.supabaseUrl}/auth/v1/admin/users`, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			Authorization: `Bearer ${env.supabaseServiceKey}`,
			apikey: env.supabaseServiceKey,
		},
		body: JSON.stringify({ email, password, email_confirm: true }),
	});
	if (!res.ok) {
		const body = await res.text();
		// 422 = already seeded (idempotent rerun) — look the user up instead.
		if (res.status === 422) {
			const lookup = await fetch(
				`${env.supabaseUrl}/auth/v1/admin/users?page=1&per_page=100`,
				{
					headers: {
						Authorization: `Bearer ${env.supabaseServiceKey}`,
						apikey: env.supabaseServiceKey,
					},
				},
			);
			const data = (await lookup.json()) as {
				users?: { id: string; email: string }[];
			};
			const found = data.users?.find((u) => u.email === email);
			if (found) return found.id;
		}
		throw new Error(`Supabase admin user creation failed (${res.status}): ${body}`);
	}
	const data = (await res.json()) as { id: string };
	return data.id;
}

main().catch((e) => {
	console.error(e);
	process.exit(1);
});
