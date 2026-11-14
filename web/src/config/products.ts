/**
 * ============================================================================
 *  MAISON TITRIT — PRODUCT CATALOGUE (seed source of truth)
 * ----------------------------------------------------------------------------
 *  Run `bun run scripts/seed.ts` from web/ to sync this catalogue to Prisma.
 *  Product copy is French-first. Prices, stock, size runs, compositions and
 *  product-photo matches are editorial proposals that must be confirmed before
 *  the catalogue is made available for ordering.
 * ============================================================================
 */

export type CatalogCategory = { name: string; slug: string; position?: number };

export const CATEGORIES: CatalogCategory[] = [
  { name: "Modern", slug: "modern", position: 1 },
  { name: "Moroccan", slug: "moroccan", position: 2 },
];

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

const productImage = (file: string, alt: string): CatalogImage => ({
  url: `/images/maison-titrit/${file}`,
  alt,
  position: 0,
});

export const PRODUCTS: CatalogProduct[] = [
  {
    ref: "MT-NOUR",
    name: "Robe Nour",
    category: "Modern",
    price: 290,
    images: [productImage("robe-nour.png", "Robe longue Nour, brun cacao, face et dos")],
    shortStory: "Une ligne longue et ceinturée, dans un brun cacao doux, pour une allure simple qui accompagne le quotidien.",
    description:
      "La robe Nour dessine une silhouette longue et nette. Sa ceinture souple souligne la taille sans rompre la fluidité de la ligne, tandis que son brun cacao se porte facilement du matin au soir. Une pièce sobre, pensée pour composer une tenue modeste avec peu d'accessoires.",
    materials: "Composition à confirmer avant publication",
    colors: "Brun cacao",
    sizes: "S · M · L · XL",
    inStock: false,
    featured: true,
  },
  {
    ref: "MT-YASMINE",
    name: "Ensemble Yasmine",
    category: "Modern",
    price: 450,
    images: [productImage("ensemble-yasmine.png", "Ensemble Yasmine deux pièces, ton sable")],
    shortStory: "Un haut ample et un pantalon large dans un ton sable : deux pièces faciles à porter ensemble ou séparément.",
    description:
      "Yasmine réunit un haut à manches longues et un pantalon large dans une même nuance sable. Les volumes restent confortables et la palette douce laisse toute sa place aux accessoires. Portez les deux pièces ensemble pour une silhouette coordonnée, ou séparez-les pour multiplier les associations.",
    materials: "Composition à confirmer avant publication",
    colors: "Sable",
    sizes: "S · M · L · XL",
    inStock: false,
    featured: true,
  },
  {
    ref: "MT-AMAL",
    name: "Tunique Amal",
    category: "Modern",
    price: 220,
    images: [productImage("tunique-amal.png", "Tunique Amal ivoire à boutonnage central et lien de taille")],
    shortStory: "Une tunique ivoire à boutonnage central et lien à la taille, à associer à un pantalon fluide.",
    description:
      "La tunique Amal joue la carte de la lumière et de la simplicité : une ligne ivoire, un boutonnage central et un lien à nouer à la taille. Sa longueur permet de la porter avec un pantalon ample ou une jupe longue. Une pièce de superposition qui trouve sa place dans une garde-robe modeste.",
    materials: "Composition à confirmer avant publication",
    colors: "Ivoire",
    sizes: "S · M · L · XL · XXL",
    inStock: false,
    featured: false,
  },
  {
    ref: "MT-AZUR",
    name: "Robe Azur",
    category: "Modern",
    price: 320,
    images: [productImage("lora-sky.png", "Robe longue bleu azur à manches bouffantes et jupe volantée")],
    shortStory: "Un bleu azur lumineux, des manches souples et un bas volanté pour une robe qui apporte du mouvement.",
    description:
      "La robe Azur mise sur la couleur : son bleu franc illumine la silhouette, tandis que les manches souples et le bas volanté donnent du mouvement à la ligne longue. L'encolure montante et la taille dessinée équilibrent les volumes. Une proposition expressive à garder au centre de la tenue.",
    materials: "Composition à confirmer avant publication",
    colors: "Bleu azur",
    sizes: "S · M · L · XL",
    inStock: false,
    featured: true,
  },
  {
    ref: "MT-SABLE",
    name: "Robe Sable",
    category: "Modern",
    price: 290,
    images: [productImage("lora-beige.png", "Robe longue sable à manches longues et taille marquée")],
    shortStory: "Une robe longue sable aux lignes épurées, rehaussée d'une taille marquée et de manches longues.",
    description:
      "La robe Sable associe une teinte naturelle à une coupe longue et épurée. La taille légèrement marquée structure la silhouette sans la contraindre, et les manches longues complètent son allure couvrante. Sa neutralité en fait une base facile à porter avec des bijoux dorés ou un foulard coloré.",
    materials: "Composition à confirmer avant publication",
    colors: "Sable",
    sizes: "S · M · L · XL",
    inStock: false,
    featured: false,
  },
  {
    ref: "MT-TERRACOTTA",
    name: "Robe Terracotta",
    category: "Modern",
    price: 420,
    images: [productImage("robe-terracotta.png", "Robe longue terracotta avec motifs brodés clairs")],
    shortStory: "La chaleur du terracotta rencontre des motifs brodés clairs pour une robe longue au caractère affirmé.",
    description:
      "La robe Terracotta fait dialoguer une couleur chaude et des motifs clairs répartis sur le devant et la jupe. Sa longueur et ses manches couvrantes donnent une base élégante, tandis que les détails brodés attirent le regard. Laissez la pièce parler et choisissez des accessoires discrets.",
    materials: "Composition et technique de broderie à confirmer avant publication",
    colors: "Terracotta · broderie claire",
    sizes: "S · M · L · XL",
    inStock: false,
    featured: true,
  },
  {
    ref: "MT-SAHAR",
    name: "Robe Sahar",
    category: "Modern",
    price: 520,
    images: [productImage("abaya-sahar.png", "Robe longue noire Sahar à broderies bronze")],
    shortStory: "Une base noire, une ligne longue et des broderies bronze placées au col, aux manches et à l'avant.",
    description:
      "Sahar propose une silhouette noire, ample et longue, ponctuée de broderies bronze au col, sur le devant et aux poignets. Le contraste reste graphique et la coupe laisse la tenue accompagner les occasions habillées sans perdre son confort. Pour une allure plus sobre, associez-la à des accessoires unis.",
    materials: "Composition et finitions à confirmer avant publication",
    colors: "Noir · détails bronze",
    sizes: "S · M · L · XL",
    inStock: false,
    featured: true,
  },
  {
    ref: "MT-EMERAUDE",
    name: "Caftan Émeraude",
    category: "Moroccan",
    price: 690,
    images: [productImage("caftan-emeraude.png", "Caftan vert émeraude à ornements dorés et ceinture")],
    shortStory: "Un vert profond, une ceinture assortie et des ornements dorés pour une silhouette de cérémonie.",
    description:
      "Le caftan Émeraude s'appuie sur le contraste d'un vert profond et de détails dorés. La ceinture dessine la taille, tandis que les ornements soulignent l'encolure, le devant et les poignets. Une pièce de présence pour une réception ou une célébration, à accessoiriser avec mesure.",
    materials: "Composition et finitions à confirmer avant publication",
    colors: "Vert émeraude · or",
    sizes: "S · M · L · XL",
    inStock: false,
    featured: true,
  },
  {
    ref: "MT-NOIR",
    name: "Caftan Nuit",
    category: "Moroccan",
    price: 650,
    images: [productImage("caftan-noir.png", "Caftan noir à broderies dorées sur le devant et les manches")],
    shortStory: "Le noir profond rencontre une broderie dorée qui souligne le devant et les manches.",
    description:
      "Le caftan Nuit construit son élégance sur une palette contrastée : un fond noir, traversé de broderies dorées au col, au centre et aux manches. Sa ligne longue en fait une pièce de cérémonie facile à compléter. Un bijou fin suffit à prolonger l'éclat des détails.",
    materials: "Composition et finitions à confirmer avant publication",
    colors: "Noir · or",
    sizes: "S · M · L · XL",
    inStock: false,
    featured: true,
  },
  {
    ref: "MT-SAHEL",
    name: "Djellaba Sahel",
    category: "Moroccan",
    price: 480,
    images: [productImage("djellaba-sahel.png", "Djellaba écrue à capuche et passementerie ton sur ton")],
    shortStory: "Une djellaba écrue à capuche, dont la passementerie discrète souligne la ligne centrale.",
    description:
      "La djellaba Sahel privilégie une teinte écrue et une ligne ample. La capuche et le détail passementé au centre lui donnent son caractère, sans surcharger la silhouette. Portée seule ou en superposition, elle offre une interprétation lumineuse d'un vêtement marocain familier.",
    materials: "Composition et passementerie à confirmer avant publication",
    colors: "Écru",
    sizes: "S · M · L · XL",
    inStock: false,
    featured: false,
  },
  {
    ref: "MT-GRENAT",
    name: "Jellaba Grenat",
    category: "Moroccan",
    price: 560,
    images: [productImage("jellaba-grenat.png", "Jellaba grenat à broderies claires et ceinture assortie")],
    shortStory: "Un grenat profond, une ceinture assortie et des broderies claires qui encadrent le devant.",
    description:
      "La Jellaba Grenat donne de la profondeur à la silhouette avec sa couleur riche et ses broderies claires. La ceinture assortie souligne la taille, tandis que les détails du devant et des manches gardent l'œil sur le travail décoratif. Une pièce marquante à porter lors des moments qui comptent.",
    materials: "Composition et finitions à confirmer avant publication",
    colors: "Grenat · broderie claire",
    sizes: "S · M · L · XL",
    inStock: false,
    featured: false,
  },
  {
    ref: "MT-ROYAL",
    name: "Takchita Royale",
    category: "Moroccan",
    price: 890,
    images: [productImage("takchita-royal.png", "Takchita bleu nuit ornée de broderies claires")],
    shortStory: "Un bleu nuit intense et des broderies claires composent une silhouette de cérémonie spectaculaire.",
    description:
      "La Takchita Royale affirme une silhouette de cérémonie avec son bleu nuit et ses broderies claires. Les ornements dessinent le buste et accompagnent la longueur de la pièce, pour une présence forte sans accumulation d'accessoires. Les détails de composition, de superposition et de fermeture restent à confirmer avant toute commande.",
    materials: "Composition, superposition et finitions à confirmer avant publication",
    colors: "Bleu nuit · broderie claire",
    sizes: "S · M · L · XL",
    inStock: false,
    featured: true,
  },
  {
    ref: "MT-ETOILE",
    name: "Caftan Étoile",
    category: "Moroccan",
    price: 720,
    images: [productImage("caftan-emeraude.png", "Visuel de collection du caftan Étoile, vert orné")],
    shortStory: "Une silhouette de caftan mise en lumière par des détails dorés et une ceinture tressée.",
    description:
      "Le caftan Étoile explore une silhouette longue, ceinturée et ornée. Les détails dorés et la ceinture tressée composent un ensemble lumineux, pensé pour une occasion habillée. Laissez les ornements guider le choix des accessoires pour garder une allure équilibrée.",
    materials: "Composition et finitions à confirmer avant publication",
    colors: "Vert profond · or",
    sizes: "S · M · L · XL",
    inStock: false,
    featured: false,
  },
  {
    ref: "MT-CUIVRE",
    name: "Caftan Cuivre",
    category: "Moroccan",
    price: 780,
    images: [productImage("robe-terracotta.png", "Visuel de collection du caftan Cuivre, terracotta brodé")],
    shortStory: "Un ton cuivre chaleureux et des ornements clairs dessinent une pièce de cérémonie lumineuse.",
    description:
      "Le caftan Cuivre fait ressortir les ornements clairs sur une base terracotta aux reflets chauds. La ligne longue donne de l'ampleur au motif et laisse les broderies rythmer le vêtement. Des accessoires crème ou bronze prolongent sa palette sans détourner le regard des détails.",
    materials: "Composition et technique de broderie à confirmer avant publication",
    colors: "Cuivre · broderie claire",
    sizes: "S · M · L · XL",
    inStock: false,
    featured: false,
  },
];
