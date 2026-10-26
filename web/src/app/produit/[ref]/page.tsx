import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getProduct, listProducts, type ProductDTO } from "@/lib/products";
import { ProductDetailClient } from "@/components/maison/product-detail";
import { buildPageMetadata, productJsonLd, breadcrumbJsonLd } from "@/lib/seo";

/** Force dynamic so freshly seeded products appear immediately. */
export const dynamic = "force-dynamic";

type Params = { ref: string };

/** Generate rich per-product metadata for SEO + ads + social sharing. */
export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
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
  params: Promise<Params>;
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
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(pLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(bLd) }} />
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
