import { SEED_ARTICLES } from "@/config/articles";
import { PRODUCTS } from "@/config/products";

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

const platformNames: CampaignPlatform[] = [
  "facebook",
  "instagram",
  "pinterest",
  "linkedin",
  "googleBusiness",
];

const tagsFor = (category: string, productName?: string) => {
  const productTag = productName
    ? `#${productName.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-zA-Z0-9]/g, "")}`
    : "";
  const styleTag = category === "Modern" ? "#StyleModerne" : "#StyleMarocain";
  return {
    facebook: ["#MaisonTitrit", styleTag, "#ModeModeste"],
    instagram: ["#MaisonTitrit", styleTag, "#ModeModeste", "#MadeInMorocco", "#Casablanca", "#Bouskoura", productTag].filter(Boolean),
    pinterest: ["#ModeModeste", styleTag, productTag].filter(Boolean),
    linkedin: ["#MaisonTitrit", styleTag],
    googleBusiness: [],
  };
};

function getFeatureArticle(ref: string) {
  const article = SEED_ARTICLES.find((item) => item.productRef === ref);
  if (!article) throw new Error(`Missing product article for campaign: ${ref}`);
  return article;
}

function getProduct(ref: string) {
  const product = PRODUCTS.find((item) => item.ref === ref);
  if (!product) throw new Error(`Missing product for campaign: ${ref}`);
  return product;
}

function formattedPost(
  title: string,
  caption: string,
  callToAction: string,
  url: string,
  hashtags: string[],
): PlatformDraft {
  return {
    title,
    caption: hashtags.length ? `${caption}\n\n${hashtags.join(" ")}` : caption,
    callToAction,
    hashtags,
    url,
  };
}

function productCampaigns(): CampaignDraft[] {
  return PRODUCTS.map((product) => {
    const article = getFeatureArticle(product.ref);
    const productPath = `/produit/${product.ref}`;
    const articlePath = `/blog/${article.slug}`;
    const hashtags = tagsFor(product.category, product.name);

    return {
      status: "draft",
      kind: "product",
      subject: `${product.name} · ${article.title}`,
      image: product.images[0].url,
      productPath,
      articlePath,
      posts: {
        facebook: formattedPost(
          `${product.name} — une pièce à découvrir`,
          `${product.shortStory}\n\nRéf. ${product.ref} · ${product.price} MAD (prix indicatif à confirmer). Son histoire et ses détails sont à lire dans notre portrait éditorial.`,
          "Découvrir la pièce",
          productPath,
          hashtags.facebook,
        ),
        instagram: formattedPost(
          `${product.name} | Maison Titrit`,
          `${product.shortStory}\n\nUne silhouette, une couleur, un détail : découvrez la pièce et le regard de la Maison dans son portrait dédié. Composition, tailles et disponibilité à confirmer avant commande.`,
          "Voir la pièce et son portrait",
          productPath,
          hashtags.instagram,
        ),
        pinterest: formattedPost(
          `${product.name} | Mode modeste marocaine`,
          `${product.name} : ${product.shortStory} Enregistrez cette idée de silhouette et consultez la fiche pour les détails du modèle.`,
          "Voir la fiche produit",
          productPath,
          hashtags.pinterest,
        ),
        linkedin: formattedPost(
          `${product.name} : une silhouette de la collection Maison Titrit`,
          `Dans cette proposition, ${product.name} associe une ligne claire à un détail qui signe la silhouette. Notre portrait éditorial revient sur ses choix de style et les informations à vérifier avant commande : composition, tailles et disponibilité.`,
          "Lire le portrait éditorial",
          articlePath,
          hashtags.linkedin,
        ),
        googleBusiness: formattedPost(
          `${product.name} — Maison Titrit`,
          `${product.shortStory} Retrouvez le visuel et les informations disponibles sur la fiche. Pour confirmer la composition, les tailles, le prix final et la disponibilité, contactez Maison Titrit à Bouskoura.`,
          "En savoir plus",
          productPath,
          hashtags.googleBusiness,
        ),
      },
    };
  });
}

function productArticleCampaigns(): CampaignDraft[] {
  return SEED_ARTICLES.filter((article) => article.productRef).map((article) => {
    const ref = article.productRef;
    if (!ref) throw new Error(`Product reference missing for article: ${article.slug}`);
    const product = getProduct(ref);
    const productPath = `/produit/${product.ref}`;
    const articlePath = `/blog/${article.slug}`;
    const hashtags = tagsFor(product.category, product.name);

    return {
      status: "draft",
      kind: "product-article",
      subject: article.title,
      image: article.coverImage,
      productPath,
      articlePath,
      posts: {
        facebook: formattedPost(
          article.title,
          `${article.excerpt}\n\nUn portrait pour découvrir la pièce ${product.name} sous un autre angle, puis retrouver ses informations pratiques.`,
          "Lire le portrait",
          articlePath,
          hashtags.facebook,
        ),
        instagram: formattedPost(
          `${article.title} | Journal Maison Titrit`,
          `${article.excerpt}\n\nUne lecture dédiée à ${product.name} : sa ligne, ses détails et les questions à poser avant de commander.`,
          "Lire l'article",
          articlePath,
          hashtags.instagram,
        ),
        pinterest: formattedPost(
          `${product.name} — histoire de la pièce | Maison Titrit`,
          `${article.excerpt} Enregistrez l'inspiration, puis lisez le portrait complet et consultez la fiche de la pièce.`,
          "Enregistrer et lire",
          articlePath,
          hashtags.pinterest,
        ),
        linkedin: formattedPost(
          article.title,
          `${article.excerpt}\n\nCe portrait associe une pièce de la collection à des repères éditoriaux utiles : silhouette, détails visibles et informations à confirmer avant commande.`,
          "Lire l'article",
          articlePath,
          hashtags.linkedin,
        ),
        googleBusiness: formattedPost(
          `${article.title} — Maison Titrit`,
          `${article.excerpt} Pour toute question sur la composition, les tailles ou la disponibilité de ${product.name}, contactez la Maison à Bouskoura.`,
          "Lire l'article",
          articlePath,
          hashtags.googleBusiness,
        ),
      },
    };
  });
}

function editorialCampaign(
  slug: string,
  posts: Record<CampaignPlatform, Omit<PlatformDraft, "url" | "hashtags"> & { hashtags?: string[] }>,
): CampaignDraft {
  const article = SEED_ARTICLES.find((item) => item.slug === slug);
  if (!article) throw new Error(`Missing editorial article for campaign: ${slug}`);
  const articlePath = `/blog/${article.slug}`;
  const categoryHashtags = article.category === "Maison"
    ? ["#MaisonTitrit", "#Bouskoura", "#Casablanca", "#ModeMarocaine"]
    : ["#MaisonTitrit", "#SavoirFaire", "#ModeMarocaine", "#ModeModeste"];

  return {
    status: "draft",
    kind: "editorial",
    subject: article.title,
    image: article.coverImage,
    articlePath,
    posts: Object.fromEntries(
      platformNames.map((platform) => {
        const post = posts[platform];
        const hashtags = post.hashtags ?? (platform === "googleBusiness" ? [] : categoryHashtags);
        return [
          platform,
          {
            ...post,
            caption: hashtags.length ? `${post.caption}\n\n${hashtags.join(" ")}` : post.caption,
            hashtags,
            url: articlePath,
          },
        ];
      }),
    ) as Record<CampaignPlatform, PlatformDraft>,
  };
}

const editorialCampaigns: CampaignDraft[] = [
  editorialCampaign("lheritage-amazigh-chez-maison-titrit", {
    facebook: {
      title: "Maison Titrit : une étoile à Bouskoura",
      caption: "Que raconte le nom Titrit ? Découvrez l'histoire d'une maison de couture marocaine dédiée à la mode modeste, ancrée à Bouskoura et inspirée par des lignes d'hier comme d'aujourd'hui.",
      callToAction: "Lire l'histoire de la Maison",
    },
    instagram: {
      title: "L'histoire derrière le nom",
      caption: "Titrit, « étoile » en tamazight. Une maison à Bouskoura, une mode féminine modeste, et l'envie de faire dialoguer héritage et allure contemporaine. Voici l'histoire de Maison Titrit.",
      callToAction: "Lire le récit",
    },
    pinterest: {
      title: "Maison Titrit — histoire et inspiration marocaine",
      caption: "Une maison de couture à Bouskoura, un nom qui signifie « étoile » en tamazight et une vision de la mode modeste. À lire dans le journal Maison Titrit.",
      callToAction: "Découvrir l'histoire",
    },
    linkedin: {
      title: "Une maison de couture marocaine, ancrée à Bouskoura",
      caption: "Maison Titrit présente son identité, son ancrage près de Casablanca et sa vision d'une mode modeste pour femmes. Un portrait de marque fondé sur les informations communiquées par la Maison.",
      callToAction: "Lire le portrait de marque",
    },
    googleBusiness: {
      title: "Découvrez Maison Titrit",
      caption: "Maison Titrit est une maison de couture marocaine située à Bouskoura, près de Casablanca. Découvrez son histoire et sa vision de la mode modeste dans notre journal.",
      callToAction: "En savoir plus",
      hashtags: [],
    },
  }),
  editorialCampaign("du-croquis-aux-finitions-les-gestes-de-la-maison", {
    facebook: {
      title: "Du croquis aux finitions : les gestes de la Maison",
      caption: "Comment une silhouette prend-elle forme ? Notre article présente le vocabulaire de création de Maison Titrit — croquis, drapé, patronage, couture, broderie et sfifa — et les questions utiles à poser sur chaque modèle.",
      callToAction: "Lire le guide",
    },
    instagram: {
      title: "Le geste, le fil, le détail",
      caption: "Une silhouette se dessine, se construit, puis se précise dans les finitions. Découvrez les gestes que Maison Titrit met en avant et nos conseils pour vérifier les matières et l'entretien d'une pièce.",
      callToAction: "Lire l'article",
    },
    pinterest: {
      title: "Savoir-faire couture marocain | Guide Maison Titrit",
      caption: "Croquis, drapé, patronage, broderie et sfifa : repères de création et questions à poser avant de choisir une pièce de mode modeste.",
      callToAction: "Enregistrer et lire le guide",
    },
    linkedin: {
      title: "Les étapes de création mises en avant par Maison Titrit",
      caption: "Un aperçu du vocabulaire de la Maison, du dessin des silhouettes aux finitions, accompagné d'un rappel pratique : la composition et l'entretien doivent être confirmés référence par référence.",
      callToAction: "Lire l'article",
    },
    googleBusiness: {
      title: "Les gestes de création de Maison Titrit",
      caption: "Découvrez comment Maison Titrit présente son univers de création, du croquis aux finitions, ainsi que les informations à demander avant de choisir une pièce.",
      callToAction: "En savoir plus",
      hashtags: [],
    },
  }),
];

/** Unpublished copy only; there is no social scheduler or publishing integration. */
export const SEED_CAMPAIGN_DRAFTS: CampaignDraft[] = [
  ...productCampaigns(),
  ...productArticleCampaigns(),
  ...editorialCampaigns,
];

/** Verify and confirm these details with the Maison before publishing or taking orders. */
export const CAMPAIGN_REVIEW_CHECKLIST = [
  "Confirmer le prix final en MAD pour chaque référence.",
  "Confirmer la composition, les mesures, le guide des tailles et l'entretien par modèle.",
  "Confirmer le stock et la disponibilité avant d'activer les commandes.",
  "Fournir des photos dédiées pour MT-ETOILE et MT-CUIVRE ; les visuels actuels sont partagés.",
  "Confirmer les noms et parcours des fondatrices avant d'ajouter des détails biographiques.",
  "Vérifier que les URLs de campagne correspondent au site et ajouter les liens adaptés aux profils sociaux.",
  "Confirmer les droits d'utilisation des visuels présents dans le dépôt.",
];
