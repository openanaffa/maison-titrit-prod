/**
 * Seed script for Maison Titrit — full bootstrap.
 * Run:  bun run scripts/seed.ts
 *
 *  - creates categories + products + images (from src/config/products.ts)
 *  - creates the founder user (env ADMIN_EMAIL / ADMIN_PASSWORD, or defaults)
 *  - creates one demo order (so the dashboard isn't empty)
 *  Idempotent: upserts by unique keys; wipes products/images/orders first.
 */
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { PRODUCTS, CATEGORIES } from "@/config/products";

const db = new PrismaClient();

async function main() {
  const founderEmail = (process.env.ADMIN_EMAIL || "founder@maisontitrit.ma").toLowerCase();
  const founderPass = process.env.ADMIN_PASSWORD || "titrit-admin-2024";

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

  // 5) Blog article (Amazigh heritage / modest fashion story)
  await db.article.upsert({
    where: { slug: "lheritage-amazigh-chez-maison-titrit" },
    update: {},
    create: {
      slug: "lheritage-amazigh-chez-maison-titrit",
      title: "L'héritage amazigh chez Maison Titrit",
      excerpt:
        "« Titrit » signifie étoile en tamazight. Comment l'héritage amazigh guide chaque pièce de notre maison de couture.",
      body: `## Une étoile nommée Titrit

« Titrit » (ⵜⵉⵟⵔⵉⵜ) signifie **étoile** en tamazight, la langue des Amazighs (Berbères) du Maroc. Ce nom n'est pas anodin : il porte l'héritage de millénaires de savoir-faire textiles, du Haut Atlas aux plaines du Souss.

## Le geste, le fil, l'étoile

Chaque pièce Maison Titrit naît d'un geste patient hérité des couturières de l'Atlas :

- **Broderie main** — fil à fil, comme l'étoile à huit branches des tapis amazighs
- **Sfifa** — la passementerie dorée qui borde les caftans
- **Tissus nobles** — lin, soie, velours, choisis pour leur tombé et leur longévité

## Mode modeste, fierté amazigh

La mode modeste n'est pas une contrainte — c'est une élégance. Celle des femmes
amazighs qui, depuis toujours, drapent et brodent avec une liberté totale de
couleur et de motif, tout en gardant le corps couvert et fluide.

Chez Maison Titrit, nous poursuivons cette tradition : des pièces intemporelles,
confortables, modestes — et fièrement marocaines. **100% Made in Morocco.**

> مرحبا ب طلباتكم 🥰
`,
      coverImage: "/images/maison-titrit/about-craft.png",
      authorName: "Maison Titrit",
      tags: "amazigh,heritage,mode modeste,made in morocco",
      published: true,
      publishedAt: new Date(),
    },
  });
  console.log("  ✓ article: lheritage-amazigh-chez-maison-titrit");

  console.log(
    "\nDone. Products:",
    await db.product.count(),
    "| Categories:",
    await db.category.count(),
    "| Orders:",
    await db.order.count(),
  );
  console.log("\n  Founder login → email:", founderEmail, "| password:", founderPass);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
