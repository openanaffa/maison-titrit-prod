import { db } from "@/lib/db";

/**
 * Public product DTO (flattened for the storefront): primary image + category name.
 */
export interface ProductDTO {
  id: string;
  ref: string;
  name: string;
  nameAmazigh: string | null;
  description: string;
  shortStory: string;
  category: string; // category name (or "—")
  categoryId: string | null;
  price: number;
  salePrice: number | null;
  currency: string;
  image: string; // primary (first) image url
  images: { url: string; alt: string | null; position: number }[];
  materials: string;
  colors: string;
  sizes: string;
  inStock: boolean;
  featured: boolean;
}

/** Input shape: a Product row WITH images + category included. */
type ProductWithRelations = {
  id: string;
  ref: string;
  name: string;
  nameAmazigh: string | null;
  description: string;
  shortStory: string;
  materials: string;
  colors: string;
  sizes: string;
  price: number;
  salePrice: number | null;
  currency: string;
  inStock: boolean;
  featured: boolean;
  categoryId: string | null;
  createdAt: Date;
  updatedAt: Date;
  images: { url: string; alt: string | null; position: number }[];
  category: { name: string; slug: string } | null;
};

function toDTO(p: ProductWithRelations): ProductDTO {
  const images = [...(p.images ?? [])].sort((a, b) => a.position - b.position);
  return {
    id: p.id,
    ref: p.ref,
    name: p.name,
    nameAmazigh: p.nameAmazigh,
    description: p.description,
    shortStory: p.shortStory,
    category: p.category?.name ?? "—",
    categoryId: p.categoryId,
    price: p.price,
    salePrice: p.salePrice,
    currency: p.currency,
    image: images[0]?.url ?? "/images/maison-titrit/lora-beige.png",
    images: images.map((i) => ({ url: i.url, alt: i.alt, position: i.position })),
    materials: p.materials,
    colors: p.colors,
    sizes: p.sizes,
    inStock: p.inStock,
    featured: p.featured,
  };
}

/** List products, optionally filtered by category name or slug. */
export async function listProducts(category?: string) {
  const where = (() => {
    if (!category || category === "all" || category === "Tous") return undefined;
    // match by category name OR slug
    return {
      OR: [{ category: { name: category } }, { category: { slug: category } }],
    };
  })();
  const products = await db.product.findMany({
    where,
    orderBy: [{ featured: "desc" }, { createdAt: "asc" }],
    include: { images: true, category: true },
  });
  return products.map(toDTO);
}

export async function getProduct(ref: string) {
  const product = await db.product.findUnique({
    where: { ref },
    include: { images: true, category: true },
  });
  return product ? toDTO(product) : null;
}
