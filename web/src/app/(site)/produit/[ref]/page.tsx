import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ProductDetailClient } from "@/components/maison/product-detail";

import { getProduct, listProducts } from "@/lib/products";
import { serializeJsonLd } from "@/lib/serialize-json-ld";
import { buildPageMetadata } from "@/lib/seo/build-page.metadata";
import { breadcrumbJsonLd } from "@/lib/seo/json-ld/breadcrumb.json-ld";
import { productJsonLd } from "@/lib/seo/json-ld/product.json-ld";
import type { ProductDTO, RefParams } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<RefParams>;
}): Promise<Metadata> {
  const { ref } = await params;
  const product = await getProduct(ref);
  if (!product) {
    return { title: "Produit introuvable", robots: { index: false, follow: false } };
  }
  return buildPageMetadata({
    title: `${product.name} — ${product.price} MAD`,
    description: product.shortStory,
    path: `/produit/${product.ref}`,
    image: product.image,
    ogType: "product",
    keywords: [
      product.name,
      product.category,
      "mode modeste",
      "Made in Morocco",
      "caftan",
      "WhatsApp order",
      "COD",
      `${product.price} MAD`,
    ],
  });
}

export default async function ProductPage({
  params,
}: {
  params: Promise<RefParams>;
}) {
  const { ref } = await params;
  const product = await getProduct(ref);
  if (!product) notFound();

  // related: same category, excluding current, capped at 3
  const sameCategory = await listProducts(product.category);
  let related: ProductDTO[] = sameCategory.filter((p) => p.ref !== ref);
  if (related.length < 3) {
    const all = await listProducts();
    related = [
      ...related,
      ...all.filter((p) => p.ref !== ref && p.ref !== product.ref),
    ];
  }
  related = dedupeByRef(related).slice(0, 3);

  const pLd = productJsonLd({
    ref: product.ref,
    name: product.name,
    description: product.shortStory,
    image: product.image,
    price: product.price,
    salePrice: product.salePrice,
    currency: product.currency,
    category: product.category,
    inStock: product.inStock,
  });
  const bLd = breadcrumbJsonLd([
    { name: "Accueil", path: "/" },
    { name: "Collection", path: "/#collection" },
    { name: product.name, path: `/produit/${product.ref}` },
  ]);

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(pLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(bLd) }} />
      <ProductDetailClient product={product} related={related} />
    </>
  );
}

function dedupeByRef(list: ProductDTO[]): ProductDTO[] {
  const seen = new Set<string>();
  const out: ProductDTO[] = [];
  for (const p of list) {
    if (seen.has(p.ref)) continue;
    seen.add(p.ref);
    out.push(p);
  }
  return out;
}
