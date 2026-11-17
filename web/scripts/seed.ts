/** Synchronize catalog and editorial seed data to Supabase Postgres. */

import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { PrismaClient } from "@prisma/client";
import { SEED_ARTICLES } from "@/config/articles";
import { CATEGORIES, PRODUCTS } from "@/config/products";

const db = new PrismaClient();
const publishedAt = new Date("2026-11-14T12:00:00.000Z");

function requirePostgresDatabaseUrl() {
	const value = process.env.DATABASE_URL;
	if (!value) {
		throw new Error(
			"DATABASE_URL must point to the Supabase Postgres database.",
		);
	}
	let protocol: string;
	try {
		protocol = new URL(value).protocol;
	} catch {
		throw new Error("DATABASE_URL is not a valid Postgres connection URL.");
	}
	if (protocol !== "postgres:" && protocol !== "postgresql:") {
		throw new Error(
			"The content seed only writes to Postgres. Use the Supabase Postgres DATABASE_URL.",
		);
	}
}

function validateSeedContent() {
	const refs = new Set(PRODUCTS.map((product) => product.ref));
	if (refs.size !== PRODUCTS.length) {
		throw new Error("Seed catalogue contains duplicate product references.");
	}

	for (const category of CATEGORIES) {
		const count = PRODUCTS.filter(
			(product) => product.category === category.name,
		).length;
		if (count !== 7) {
			throw new Error(
				`Expected exactly 7 products in ${category.name}; found ${count}.`,
			);
		}
	}

	for (const product of PRODUCTS) {
		if (!CATEGORIES.some((category) => category.name === product.category)) {
			throw new Error(
				`Unknown category for product ${product.ref}: ${product.category}`,
			);
		}
		if (product.images.length === 0) {
			throw new Error(`Product ${product.ref} has no images.`);
		}
		for (const image of product.images) {
			if (
				!image.url.startsWith("/") ||
				!existsSync(resolve(process.cwd(), "public", image.url.slice(1)))
			) {
				throw new Error(
					`Missing local product image for ${product.ref}: ${image.url}`,
				);
			}
		}
	}

	const slugLocalePairs = new Set(
		SEED_ARTICLES.map((article) => `${article.slug}|${article.locale}`),
	);
	if (slugLocalePairs.size !== SEED_ARTICLES.length) {
		throw new Error("Seed articles contain duplicate slug+locale pairs.");
	}
	const productArticles = SEED_ARTICLES.filter(
		(article) => article.productRef && article.locale === "fr",
	);
	if (
		productArticles.length !== PRODUCTS.length ||
		productArticles.some(
			(article) => !article.productRef || !refs.has(article.productRef),
		)
	) {
		throw new Error(
			"Each seeded product must have exactly one matching feature article.",
		);
	}
	for (const article of SEED_ARTICLES) {
		if (article.tags[0] !== article.category) {
			throw new Error(
				`Article ${article.slug} must use ${article.category} as its first tag.`,
			);
		}
		if (
			!existsSync(resolve(process.cwd(), "public", article.coverImage.slice(1)))
		) {
			throw new Error(
				`Missing local cover image for article ${article.slug}: ${article.coverImage}`,
			);
		}
	}
}

async function main() {
	validateSeedContent();
	requirePostgresDatabaseUrl();

	const founderEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();

	// Individual upserts (not one big transaction) so Supabase PgBouncer's
	// short interactive-transaction timeout never kills the seed.
	const seedRefs = PRODUCTS.map((product) => product.ref);
	const targetCategories = await db.category.findMany({
		where: { slug: { in: CATEGORIES.map((category) => category.slug) } },
		select: { id: true },
	});
	const unrelatedProducts = await db.product.findMany({
		where: {
			categoryId: { in: targetCategories.map((category) => category.id) },
			ref: { notIn: seedRefs },
		},
		select: { ref: true },
	});
	if (unrelatedProducts.length > 0) {
		throw new Error(
			`Refusing to seed over unowned products in Modern/Moroccan: ${unrelatedProducts.map((product) => product.ref).join(", ")}`,
		);
	}

	const categoryIds = new Map<string, string>();
	for (const category of CATEGORIES) {
		const saved = await db.category.upsert({
			where: { slug: category.slug },
			update: { name: category.name, position: category.position ?? 0 },
			create: {
				name: category.name,
				slug: category.slug,
				position: category.position ?? 0,
			},
		});
		categoryIds.set(category.name, saved.id);
	}

	for (const product of PRODUCTS) {
		const categoryId = categoryIds.get(product.category);
		if (!categoryId)
			throw new Error(`Missing database category for ${product.ref}.`);

		const fields = {
			name: product.name,
			nameAmazigh: product.nameAmazigh ?? null,
			description: product.description,
			shortStory: product.shortStory,
			materials: product.materials,
			colors: product.colors,
			sizes: product.sizes,
			price: product.price,
			salePrice: product.salePrice ?? null,
			currency: "MAD",
			inStock: product.inStock ?? true,
			featured: product.featured ?? false,
			categoryId,
		};
		const images = product.images.map((image) => ({
			url: image.url,
			alt: image.alt ?? product.name,
			position: image.position ?? 0,
		}));

		await db.product.upsert({
			where: { ref: product.ref },
			update: { ...fields, images: { deleteMany: {}, create: images } },
			create: { ref: product.ref, ...fields, images: { create: images } },
		});
	}

	for (const category of CATEGORIES) {
		const categoryId = categoryIds.get(category.name);
		if (!categoryId)
			throw new Error(`Missing database category for ${category.name}.`);
		const count = await db.product.count({ where: { categoryId } });
		if (count !== 7) {
			throw new Error(
				`Expected exactly 7 products in ${category.name} after seed; found ${count}.`,
			);
		}
	}

	for (const article of SEED_ARTICLES) {
		const fields = {
			title: article.title,
			excerpt: article.excerpt,
			body: article.body,
			coverImage: article.coverImage,
			authorName: "Maison Titrit",
			tags: article.tags.join(", "),
			locale: article.locale,
			published: true,
			publishedAt,
		};
		await db.article.upsert({
			where: { slug_locale: { slug: article.slug, locale: article.locale } },
			update: fields,
			create: { slug: article.slug, ...fields },
		});
	}

	if (founderEmail) {
		const existing = await db.user.findUnique({
			where: { email: founderEmail },
		});
		if (!existing) {
			await db.user.create({
				data: {
					email: founderEmail,
					name: "Maison Titrit",
					role: "FOUNDER",
				},
			});
		}
	}

	console.log(
		`Supabase content sync complete: ${PRODUCTS.length} products, ${CATEGORIES.length} categories, ${SEED_ARTICLES.length} articles.`,
	);
	if (founderEmail) {
		console.log(
			"Founder profile bootstrap was requested; existing users and roles were left unchanged.",
		);
	}
}

main()
	.catch((e) => {
		console.error(e);
		process.exitCode = 1;
	})
	.finally(async () => {
		await db.$disconnect();
	});
