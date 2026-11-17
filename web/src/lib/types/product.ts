/** Product domain shapes: public DTO, admin table row, category and form values. */
import type { Tables } from "@/lib/supabase/database.types";

/** Image projection shared by the storefront DTO and admin table. */
export type ProductImageDTO = Pick<Tables<"Image">, "url" | "alt" | "position">;

/** Public product DTO (flattened for the storefront): primary image + category name. */
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
  images: ProductImageDTO[];
  materials: string;
  colors: string;
  sizes: string;
  inStock: boolean;
  featured: boolean;
}

/** Admin products table row — a projection of the public DTO. */
export type Row = Pick<
  ProductDTO,
  | "id"
  | "ref"
  | "name"
  | "price"
  | "salePrice"
  | "currency"
  | "category"
  | "inStock"
  | "featured"
> & {
  categorySlug?: string;
  image: string | null;
};

export type Category = {
  id: string;
  name: string;
  slug: string;
  position: number;
  count: number;
};

export type ProductFormImage = { url: string; alt?: string };

export type ProductFormValues = {
  ref: string;
  name: string;
  nameAmazigh?: string;
  description: string;
  shortStory: string;
  materials: string;
  colors: string;
  sizes: string;
  price: number;
  salePrice?: number | null;
  currency: string;
  inStock: boolean;
  featured: boolean;
  categoryId: string | null;
  images: ProductFormImage[];
};
