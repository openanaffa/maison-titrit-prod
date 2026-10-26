/**
 * ============================================================================
 *  MAISON TITRIT — PRODUCT CATALOGUE (seed source of truth)
 * ----------------------------------------------------------------------------
 *  Edit products, prices, sizes, and images HERE. Then run:
 *     bun run scripts/seed.ts
 *  to sync the database.
 *
 *  The admin backoffice (/makteb) writes directly to the same DB — this seed
 *  is only the initial bootstrap. Once you manage products in the admin,
 *  re-running the seed will overwrite admin changes (it's idempotent).
 * ============================================================================
 */

export type CatalogCategory = { name: string; slug: string; position?: number };

export const CATEGORIES: CatalogCategory[] = [
  { name: "Robes", slug: "robes", position: 1 },
  { name: "Tuniques", slug: "tuniques", position: 2 },
  { name: "Ensembles", slug: "ensembles", position: 3 },
  { name: "Abayas", slug: "abayas", position: 4 },
  { name: "Caftans", slug: "caftans", position: 5 },
];

export type CatalogImage = { url: string; alt?: string; position?: number };

export type CatalogProduct = {
  ref: string;
  name: string;
  nameAmazigh: string;
  category: string; // category name (resolved to categoryId at seed time)
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

export const PRODUCTS: CatalogProduct[] = [
  {
    ref: "MT-LORA",
    name: "Collection Lora 🌸",
    nameAmazigh: "ⵍⵓⵔⴰ",
    category: "Robes",
    price: 190,
    images: [
      { url: "/images/maison-titrit/lora-beige.png", alt: "Collection Lora — Beige", position: 0 },
      { url: "/images/maison-titrit/lora-sky.png", alt: "Collection Lora — Bleu Ciel", position: 1 },
    ],
    shortStory:
      "Élégance paisible aux détails raffinés. Couleurs choisies avec soin : Beige · Bleu Ciel · Rose Baby.",
    description:
      "La Collection Lora incarne une élégance paisible aux détails raffinés. Confectionnée dans un tissu fluide et léger, elle offre une coupe modeste et fluide, parfaite pour un quotidien élégant. Couleurs choisies avec soin : Beige, Bleu Ciel et Rose Baby. Coutures finies à la main à l'atelier de Bouskoura.",
    materials: "Tissu fluide · coutures finies",
    colors: "Beige · Bleu Ciel · Rose Baby",
    sizes: "M · L · XL",
    inStock: true,
    featured: true,
  },
  {
    ref: "MT-LORA-SKY",
    name: "Collection Lora · Bleu Ciel",
    nameAmazigh: "ⵍⵓⵔⴰ",
    category: "Robes",
    price: 190,
    images: [{ url: "/images/maison-titrit/lora-sky.png", alt: "Collection Lora — Bleu Ciel", position: 0 }],
    shortStory:
      "La Collection Lora en Bleu Ciel — douceur et légèreté pour un quotidien élégant.",
    description:
      "La Collection Lora en Bleu Ciel — douceur et légèreté pour un quotidien élégant. Tissu fluide, coupe modeste, coutures finies à la main. 100% Made in Morocco.",
    materials: "Tissu fluide · coutures finies",
    colors: "Bleu Ciel",
    sizes: "M · L · XL",
    inStock: true,
    featured: true,
  },
  {
    ref: "MT-NOUR",
    name: "Robe Nour",
    nameAmazigh: "ⵏⵓⵔ",
    category: "Robes",
    price: 290,
    images: [{ url: "/images/maison-titrit/robe-nour.png", alt: "Robe Nour", position: 0 }],
    shortStory:
      "Robe longue fluide, manches longues et ceinture souple. Minimaliste, confortable, intemporelle.",
    description:
      "La Robe Nour est une pièce longue et fluide, à manches longues et ceinture souple. Minimaliste, confortable et intemporelle — pensée pour la femme moderne qui recherche l'élégance modeste au quotidien.",
    materials: "Lin mélangé · ceinture tissu",
    colors: "Olive · Sable",
    sizes: "S · M · L · XL",
    inStock: true,
    featured: false,
  },
  {
    ref: "MT-AMAL",
    name: "Tunique Amal",
    nameAmazigh: "ⴰⵎⴰⵍ",
    category: "Tuniques",
    price: 220,
    images: [{ url: "/images/maison-titrit/tunique-amal.png", alt: "Tunique Amal", position: 0 }],
    shortStory:
      "Tunique en lin crème, broderie ton-sur-ton. Coupe détendue, modeste et raffinée.",
    description:
      "La Tunique Amal en lin crème, avec sa broderie ton-sur-ton, incarne la coupe détendue, modeste et raffinée. Idéale sur un pantalon large ou une jupe fluide.",
    materials: "Lin lavé · fil coton",
    colors: "Crème",
    sizes: "S · M · L · XL · XXL",
    inStock: true,
    featured: false,
  },
  {
    ref: "MT-YASMINE",
    name: "Ensemble Yasmine",
    nameAmazigh: "ⵢⴰⵙⵎⵉⵏ",
    category: "Ensembles",
    price: 450,
    images: [{ url: "/images/maison-titrit/ensemble-yasmine.png", alt: "Ensemble Yasmine", position: 0 }],
    shortStory:
      "Deux pièces : top manches longues et pantalon large, en rose poudré. Confort et allure, ensemble.",
    description:
      "L'Ensemble Yasmine est un deux pièces : top manches longues et pantalon large, en rose poudré. Confort et allure, ensemble — pour un quotidien élégant et modeste.",
    materials: "Crêpe fluide",
    colors: "Rose poudré",
    sizes: "S · M · L · XL",
    inStock: true,
    featured: true,
  },
  {
    ref: "MT-SAHAR",
    name: "Abaya Sahar",
    nameAmazigh: "ⵙⴰⵀⴰⵔ",
    category: "Abayas",
    price: 520,
    images: [{ url: "/images/maison-titrit/abaya-sahar.png", alt: "Abaya Sahar", position: 0 }],
    shortStory:
      "Abaya fluide en noir, broderie bronze antique aux poignets. Élégance modeste pour le soir.",
    description:
      "L'Abaya Sahar est une abaya fluide en noir, avec broderie bronze antique aux poignets. Élégance modeste pour le soir, confectionnée à l'atelier de Bouskoura.",
    materials: "Nida premium · broderie bronze",
    colors: "Noir",
    sizes: "S · M · L · XL · Sur-mesure",
    inStock: true,
    featured: false,
  },
];
