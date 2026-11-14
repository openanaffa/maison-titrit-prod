/**
 * Seed script for Maison Titrit — full bootstrap.
 * Run:  bun run scripts/seed.ts
 *
 *  - creates categories + products + images (from src/config/products.ts)
 *  - creates the founder user (env ADMIN_EMAIL / ADMIN_PASSWORD — REQUIRED)
 *  - creates one demo order (so the dashboard isn't empty)
 *  Idempotent: upserts by unique keys; wipes products/images/orders first.
 */
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { PRODUCTS, CATEGORIES } from "@/config/products";
import { SEED_ARTICLES } from "@/config/articles";
import { existsSync } from "node:fs";
import { resolve } from "node:path";

const db = new PrismaClient();
const publishedAt = new Date("2026-11-14T12:00:00.000Z");

function validateSeedContent() {
  const refs = new Set(PRODUCTS.map((product) => product.ref));
  if (refs.size !== PRODUCTS.length) {
    throw new Error("Seed catalogue contains duplicate product references.");
  }

  for (const category of CATEGORIES) {
    const count = PRODUCTS.filter((product) => product.category === category.name).length;
    if (count !== 7) {
      throw new Error(`Expected exactly 7 products in ${category.name}; found ${count}.`);
    }
  }

  for (const product of PRODUCTS) {
    if (!CATEGORIES.some((category) => category.name === product.category)) {
      throw new Error(`Unknown category for product ${product.ref}: ${product.category}`);
    }
    if (product.images.length === 0) {
      throw new Error(`Product ${product.ref} has no images.`);
    }
    for (const image of product.images) {
      if (!image.url.startsWith("/") || !existsSync(resolve(process.cwd(), "public", image.url.slice(1)))) {
        throw new Error(`Missing local product image for ${product.ref}: ${image.url}`);
      }
    }
  }

  const slugs = new Set(SEED_ARTICLES.map((article) => article.slug));
  if (slugs.size !== SEED_ARTICLES.length) {
    throw new Error("Seed articles contain duplicate slugs.");
  }
  const productArticles = SEED_ARTICLES.filter((article) => article.productRef);
  if (
    productArticles.length !== PRODUCTS.length ||
    productArticles.some((article) => !article.productRef || !refs.has(article.productRef))
  ) {
    throw new Error("Each seeded product must have exactly one matching feature article.");
  }
  for (const article of SEED_ARTICLES) {
    if (article.tags[0] !== article.category) {
      throw new Error(`Article ${article.slug} must use ${article.category} as its first tag.`);
    }
    if (!existsSync(resolve(process.cwd(), "public", article.coverImage.slice(1)))) {
      throw new Error(`Missing local cover image for article ${article.slug}: ${article.coverImage}`);
    }
  }
}

async function main() {
  validateSeedContent();

  const founderEmail = process.env.ADMIN_EMAIL?.toLowerCase();
  const founderPass = process.env.ADMIN_PASSWORD;
  // Never fall back to shipped defaults — fail loudly for both.
  if (!founderEmail) {
    console.error(
      "✗ ADMIN_EMAIL is not set. Provide it via the environment (never commit it):\n" +
        '  ADMIN_EMAIL="<founder-email>" bun run scripts/seed.ts',
    );
    process.exit(1);
  }
  if (!founderPass) {
    console.error(
      "✗ ADMIN_PASSWORD is not set. Provide it via the environment (never commit it):\n" +
        '  ADMIN_PASSWORD="<your-strong-password>" bun run scripts/seed.ts',
    );
    process.exit(1);
  }

  // 1) Founder user
  const passwordHash = await bcrypt.hash(founderPass, 10);
  const founder = await db.user.upsert({
    where: { email: founderEmail },
    update: { role: "FOUNDER", password: passwordHash },
    create: {
      email: founderEmail,
      name: "Fondatrice Maison Titrit",
      role: "FOUNDER",
      password: passwordHash,
      emailVerified: new Date(),
    },
  });
  console.log("  ✓ founder:", founder.email, "(role:", founder.role + ")");

  // 2) Categories
  const catMap = new Map<string, string>();
  for (const c of CATEGORIES) {
    const cat = await db.category.upsert({
      where: { slug: c.slug },
      update: { name: c.name, position: c.position ?? 0 },
      create: { name: c.name, slug: c.slug, position: c.position ?? 0 },
    });
    catMap.set(c.name, cat.id);
    console.log("  ✓ category:", cat.name, "→", cat.slug);
  }

  // 3) Products + images (wipe first to keep idempotent, respecting FKs)
  await db.orderItem.deleteMany({});
  await db.image.deleteMany({});
  await db.product.deleteMany({});
  await db.category.deleteMany({
    where: { slug: { notIn: CATEGORIES.map((category) => category.slug) } },
  });
  for (const p of PRODUCTS) {
    const catId = catMap.get(p.category) ?? null;
    const product = await db.product.create({
      data: {
        ref: p.ref,
        name: p.name,
        nameAmazigh: p.nameAmazigh,
        description: p.description,
        shortStory: p.shortStory,
        materials: p.materials,
        colors: p.colors,
        sizes: p.sizes,
        price: p.price,
        salePrice: p.salePrice ?? null,
        currency: "MAD",
        inStock: p.inStock ?? true,
        featured: p.featured ?? false,
        categoryId: catId,
      },
    });
    for (const img of p.images) {
      await db.image.create({
        data: {
          productId: product.id,
          url: img.url,
          alt: img.alt ?? product.name,
          position: img.position ?? 0,
        },
      });
    }
    console.log("  ✓ product:", product.ref, product.name, "— ", product.price, "MAD");
  }

  // 4) Demo order (so the dashboard has something to show)
  const first = await db.product.findFirst({ orderBy: { createdAt: "asc" } });
  if (first && (await db.order.count()) === 0) {
    const order = await db.order.create({
      data: {
        number: "MT-1001",
        status: "PENDING",
        customerName: "Client Démo",
        customerPhone: "+212600000000",
        customerEmail: "demo@example.com",
        city: "Casablanca",
        address: "Demo address",
        total: first.price,
        currency: "MAD",
        payment: "COD",
        userId: founder.id,
      },
    });
    await db.orderItem.create({
      data: {
        orderId: order.id,
        productId: first.id,
        ref: first.ref,
        name: first.name,
        price: first.price,
        quantity: 1,
        size: "M",
      },
    });
    console.log("  ✓ demo order:", order.number);
  }

  // 5) Maison + Craft editorial and one linked feature for each product
  for (const article of SEED_ARTICLES) {
    const data = {
      title: article.title,
      excerpt: article.excerpt,
      body: article.body,
      coverImage: article.coverImage,
      authorName: "Maison Titrit",
      tags: article.tags.join(", "),
      published: true,
      publishedAt,
    };
    await db.article.upsert({
      where: { slug: article.slug },
      update: data,
      create: { slug: article.slug, ...data },
    });
    console.log("  ✓ article:", article.slug, `(${article.category})`);
  }

  console.log(
    "\nDone. Products:",
    await db.product.count(),
    "| Categories:",
    await db.category.count(),
    "| Seed articles:",
    SEED_ARTICLES.length,
    "| Orders:",
    await db.order.count(),
  );
  console.log("\n  Founder login → email:", founderEmail, "| password: (from ADMIN_PASSWORD env)");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
