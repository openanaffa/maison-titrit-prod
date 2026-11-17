/** Content/seed shapes: catalogue entries, editorial articles and campaign drafts. */
import type { Locale } from "@/i18n/dictionaries";

export type CatalogCategory = { name: string; slug: string; position?: number };

export type CatalogImage = { url: string; alt?: string; position?: number };

export type CatalogProduct = {
  ref: string;
  name: string;
  nameAmazigh?: string;
  category: string;
  price: number;
  salePrice?: number;
  images: CatalogImage[];
  shortStory: string;
  description: string;
  materials: string;
  colors: string;
  sizes: string;
  inStock?: boolean;
  featured?: boolean;
};

export type EditorialCategory = "Maison" | "Craft";

export type SeedArticle = {
  slug: string;
  locale: Locale;
  title: string;
  excerpt: string;
  body: string;
  coverImage: string;
  category: EditorialCategory;
  tags: string[];
  productRef?: string;
};

export type CampaignPlatform =
  | "facebook"
  | "instagram"
  | "pinterest"
  | "linkedin"
  | "googleBusiness";

export type PlatformDraft = {
  title: string;
  caption: string;
  callToAction: string;
  hashtags: string[];
  url: string;
};

export type CampaignDraft = {
  status: "draft";
  kind: "product" | "product-article" | "editorial";
  subject: string;
  image: string;
  productPath?: string;
  articlePath: string;
  posts: Record<CampaignPlatform, PlatformDraft>;
};
