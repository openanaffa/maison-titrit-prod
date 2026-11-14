import { PRODUCTS } from "@/config/products";

export type EditorialCategory = "Maison" | "Craft";

export type SeedArticle = {
  slug: string;
  title: string;
  excerpt: string;
  body: string;
  coverImage: string;
  category: EditorialCategory;
  tags: string[];
  productRef?: string;
};

const EDITORIAL_ARTICLES: SeedArticle[] = [
  {
    slug: "lheritage-amazigh-chez-maison-titrit",
    title: "Maison Titrit, une étoile née à Bouskoura",
    excerpt:
      "Le nom Titrit signifie « étoile » en tamazight. À Bouskoura, la maison imagine une mode féminine modeste où l'héritage marocain dialogue avec des lignes d'aujourd'hui.",
    body: `## Une étoile comme nom, une maison comme promesse

En tamazight, « Titrit » signifie « étoile ». Ce mot donne à la maison une image simple : celle d'une lumière qui accompagne, sans prendre toute la place. Maison Titrit se présente comme une maison de couture marocaine dédiée à la mode modeste pour femmes.

## Un ancrage à Bouskoura

La maison situe son atelier à Bouskoura, près de Casablanca. C'est depuis cet ancrage que ses collections racontent une rencontre entre silhouettes contemporaines et références marocaines. Les informations disponibles présentent Maison Titrit comme une maison fondée par deux créatrices passionnées ; leurs noms et leurs parcours individuels ne sont pas publiés dans les éléments de marque actuellement disponibles.

## Une élégance à s'approprier

Une pièce modeste n'impose pas une seule façon de s'habiller. Une robe fluide peut rester discrète ou devenir le centre d'une tenue ; un caftan peut se porter avec des bijoux fins ou sans autre accent. La maison met en avant le confort, le style et une fabrication marocaine, tout en laissant à chaque cliente le choix de son allure.

Découvrez les pièces de la collection, puis contactez la maison pour confirmer les tailles, les compositions et la disponibilité avant de commander.`,
    coverImage: "/images/maison-titrit/hero-atelier.png",
    category: "Maison",
    tags: ["Maison", "Bouskoura", "Casablanca", "identité", "mode modeste"],
  },
  {
    slug: "du-croquis-aux-finitions-les-gestes-de-la-maison",
    title: "Du croquis aux finitions : les gestes de la maison",
    excerpt:
      "Design, couture, broderie et sfifa : les gestes que Maison Titrit met en avant, et les bonnes questions à poser avant de choisir une pièce.",
    body: `## Une idée prend forme

Dans sa présentation, Maison Titrit décrit un travail de design qui passe par le croquis, le drapé et le patronage à l'atelier. Ces étapes donnent une direction à la pièce : son volume, sa longueur et la manière dont elle accompagne le mouvement.

## Le détail fait la différence

La maison met également en avant la couture, la broderie main, la sfifa et les finitions d'atelier. Ces mots décrivent son univers de création ; ils ne signifient pas que chaque détail est présent sur chaque référence. Pour une commande, la fiche du produit et la confirmation de l'équipe restent les meilleurs repères.

## Choisir en connaissance de cause

La composition, l'entretien, les tailles réellement disponibles et les délais peuvent varier d'une pièce à l'autre. Avant de commander, demandez la composition exacte du modèle choisi et les conseils d'entretien adaptés à son tissu et à ses ornements. Une information précise aide à mieux porter et à mieux préserver un vêtement.

La collection en ligne présente les silhouettes et les visuels disponibles. Pour les détails qui ne figurent pas sur une fiche, contactez directement Maison Titrit.`,
    coverImage: "/images/maison-titrit/about-craft.png",
    category: "Craft",
    tags: ["Craft", "atelier", "broderie", "sfifa", "entretien"],
  },
];

const PRODUCT_FEATURES = [
  {
    ref: "MT-NOUR",
    slug: "robe-nour-la-ligne-longue-au-quotidien",
    title: "Robe Nour : la ligne longue au quotidien",
    excerpt:
      "Une robe longue brun cacao, une ceinture souple et une silhouette facile à composer : les repères de style de la robe Nour.",
    body: `## Une silhouette sans détour

La robe Nour joue sur une ligne longue et un brun cacao uniforme. Sa ceinture souple permet de choisir le tombé que l'on préfère : légèrement marqué à la taille ou plus libre. Le résultat reste sobre, avec une présence douce plutôt qu'un détail spectaculaire.

## Composer autour de la couleur

Le brun cacao s'accorde naturellement avec des tons crème, sable ou bronze. Pour une journée active, quelques accessoires suffisent ; pour le soir, une étole contrastante peut changer l'allure sans alourdir la silhouette.

## Avant de choisir

La composition textile, le guide des mesures et la disponibilité de chaque taille sont à confirmer auprès de la maison. Consultez la fiche produit pour le prix indicatif et contactez l'équipe avant toute commande.`,
  },
  {
    ref: "MT-YASMINE",
    slug: "ensemble-yasmine-deux-pieces-une-garde-robe",
    title: "Ensemble Yasmine : deux pièces, plusieurs façons de porter",
    excerpt:
      "Haut ample et pantalon large composent Yasmine, un ensemble sable pensé pour être porté coordonné ou séparément.",
    body: `## Un duo qui simplifie la tenue

Yasmine réunit un haut à manches longues et un pantalon large dans une teinte sable. Portées ensemble, les deux pièces créent une silhouette coordonnée ; séparées, elles offrent davantage de combinaisons avec les vêtements déjà présents dans la garde-robe.

## Jouer avec les proportions

Le volume du pantalon appelle un haut plus court ou ajusté quand on le porte séparément. Le haut, lui, peut équilibrer une jupe longue ou un pantalon droit. Ces associations sont des pistes de style, à adapter à la coupe réelle et à la préférence de chacune.

## Les détails à vérifier

La nature du tissu, les mesures du haut et du pantalon et leur disponibilité par taille ne sont pas renseignées de façon définitive. Demandez ces informations à Maison Titrit avant de commander.`,
  },
  {
    ref: "MT-AMAL",
    slug: "tunique-amal-ivoire-et-lignes-essentielles",
    title: "Tunique Amal : l'ivoire et les lignes essentielles",
    excerpt:
      "Boutonnage central, lien de taille et couleur ivoire : une tunique qui mise sur des détails utiles plutôt que sur l'excès.",
    body: `## La simplicité comme point de départ

La tunique Amal associe une teinte ivoire à un boutonnage central et à un lien à nouer. Ces éléments donnent à la pièce plusieurs façons d'être portée : taille soulignée, lien plus lâche ou tunique ouverte sur une base coordonnée, selon sa construction finale.

## Des associations faciles

Un pantalon large dans une couleur naturelle prolonge sa ligne douce. Un pantalon plus sombre crée un contraste net. Dans les deux cas, la tunique garde une place centrale sans demander beaucoup d'accessoires.

## Bien préparer son choix

La composition, la longueur exacte et les tailles réellement disponibles doivent être confirmées avec la maison. Le visuel montre une pièce claire : vérifiez également les conseils d'entretien et de transparence avant de commander.`,
  },
  {
    ref: "MT-AZUR",
    slug: "robe-azur-le-mouvement-par-la-couleur",
    title: "Robe Azur : le mouvement par la couleur",
    excerpt:
      "Un bleu azur franc, des manches souples et un bas volanté donnent à la robe Azur son énergie visuelle.",
    body: `## Une couleur qui attire le regard

La robe Azur fait du bleu sa signature. Les manches souples et le bas volanté apportent du mouvement à la silhouette longue, tandis que la taille dessinée évite que le volume ne prenne toute la place.

## Garder l'équilibre

Des chaussures neutres et un sac sobre laissent la couleur s'exprimer. Pour une association plus graphique, un accessoire crème ou bronze crée un contraste chaleureux. La robe n'a pas besoin d'accumuler les ornements.

## Avant l'achat

La composition du tissu, les dimensions et la tenue des couleurs au lavage sont à confirmer. Demandez les mesures disponibles et les conseils d'entretien à Maison Titrit avant de choisir votre taille.`,
  },
  {
    ref: "MT-SABLE",
    slug: "robe-sable-la-piece-calme-de-la-garde-robe",
    title: "Robe Sable : la pièce calme de la garde-robe",
    excerpt:
      "Une couleur naturelle, une ligne longue et une taille doucement marquée : la robe Sable s'adapte aux accessoires.",
    body: `## Une base facile à réinventer

La robe Sable privilégie une teinte naturelle et une coupe longue. La taille légèrement marquée structure la silhouette, tandis que les manches longues gardent l'allure sobre. Elle peut devenir une base quotidienne ou une pièce plus habillée selon les accessoires.

## Le rôle des matières

Une couleur claire révèle le tombé et la texture du tissu. Comme la composition exacte de ce modèle reste à confirmer, demandez à la maison des informations sur son toucher, son opacité et son entretien avant de l'associer à une saison précise.

## Une silhouette personnelle

Un foulard coloré apporte un accent ; des bijoux dorés prolongent la chaleur du sable. La fiche de la robe rassemble son prix indicatif et les tailles proposées, à confirmer avec Maison Titrit avant commande.`,
  },
  {
    ref: "MT-TERRACOTTA",
    slug: "robe-terracotta-une-couleur-un-detail-brode",
    title: "Robe Terracotta : une couleur, un détail brodé",
    excerpt:
      "La robe Terracotta fait dialoguer une nuance chaude et des motifs clairs qui rythment la longueur.",
    body: `## Le contraste au service de la silhouette

La base terracotta attire l'œil, puis les motifs clairs prennent le relais sur le devant et la jupe. Ce dialogue donne du relief à la pièce sans dépendre d'un imprimé chargé. La longueur et les manches couvrantes équilibrent son caractère affirmé.

## Laisser les ornements respirer

Des accessoires unis, dans les tons crème ou brun, accompagnent le motif sans lui faire concurrence. La robe peut se suffire à elle-même pour une occasion habillée ou s'inscrire dans une tenue plus simple.

## La broderie, à confirmer par modèle

Le visuel présente des ornements, mais la technique et la composition exacte ne sont pas documentées pour cette référence. Vérifiez ces éléments, les mesures et la disponibilité auprès de Maison Titrit avant de commander.`,
  },
  {
    ref: "MT-SAHAR",
    slug: "robe-sahar-le-noir-rehausse-de-bronze",
    title: "Robe Sahar : le noir rehaussé de bronze",
    excerpt:
      "Une base noire, une ligne ample et des détails bronze au col, au devant et aux poignets composent Sahar.",
    body: `## Un contraste précis

La robe Sahar place des détails bronze sur une base noire. Le regard suit les ornements du col vers le devant, puis retrouve le même accent aux poignets. La ligne longue et ample laisse le décor porter l'essentiel de l'expression.

## Pour une allure de soirée

Des accessoires simples prolongent le contraste sans multiplier les points d'attention. Une chaussure sombre reste discrète ; une touche métallique peut rappeler le bronze du vêtement.

## Informations à demander

La composition, la technique des ornements et la disponibilité des tailles doivent être confirmées. La fiche présente le visuel de collection et un prix indicatif ; contactez la maison pour vérifier les détails de la pièce proposée.`,
  },
  {
    ref: "MT-EMERAUDE",
    slug: "caftan-emeraude-leclat-du-vert-profond",
    title: "Caftan Émeraude : l'éclat d'un vert profond",
    excerpt:
      "Le vert émeraude, les ornements dorés et la ceinture tressée composent une silhouette de cérémonie.",
    body: `## Une palette de caractère

Le caftan Émeraude associe un vert profond à des détails dorés visibles à l'encolure, au centre et aux poignets. La ceinture tressée marque la taille et rassemble ces éléments dans une silhouette cohérente.

## Choisir les bons accents

Des bijoux fins en ton chaud prolongent les ornements ; des accessoires neutres laissent le vert rester le point focal. Cette pièce peut accompagner une réception ou une célébration, sous réserve de confirmer sa coupe et sa disponibilité.

## Le modèle avant la commande

La composition, les finitions et les mesures ne figurent pas encore parmi les informations vérifiées. Demandez à Maison Titrit les détails du modèle et la disponibilité de votre taille avant de commander.`,
  },
  {
    ref: "MT-NOIR",
    slug: "caftan-nuit-le-contraste-noir-et-or",
    title: "Caftan Nuit : le contraste du noir et de l'or",
    excerpt:
      "Le caftan Nuit associe un fond noir à des broderies dorées qui encadrent l'encolure, le devant et les manches.",
    body: `## Un décor qui suit la ligne

Sur le caftan Nuit, les détails dorés soulignent le col et prolongent le centre du vêtement. Les manches reprennent le même contraste, ce qui donne à la pièce un rythme visuel régulier sur toute sa longueur.

## Une tenue équilibrée

Le noir offre une base facile à accompagner. Une pochette simple et des bijoux discrets suffisent à compléter l'allure ; les ornements du caftan restent ainsi lisibles.

## Avant de réserver

Le visuel montre la couleur et le placement des ornements, mais pas la composition ni les finitions détaillées. Confirmez auprès de Maison Titrit le tissu, les mesures, le prix final et la disponibilité avant toute commande.`,
  },
  {
    ref: "MT-SAHEL",
    slug: "djellaba-sahel-lecru-et-la-ligne-centrale",
    title: "Djellaba Sahel : l'écru et la ligne centrale",
    excerpt:
      "La capuche et le détail passementé donnent à cette djellaba écrue une présence discrète et familière.",
    body: `## Une silhouette familière

La djellaba Sahel présente une coupe ample, une capuche et une teinte écrue. Le détail passementé suit le centre et structure la longueur sans changer son esprit décontracté.

## L'écru, facile à associer

La couleur se marie avec des bruns, des bleus profonds ou des accessoires en tons naturels. Portée seule ou en superposition, la djellaba peut s'adapter à plusieurs moments de la journée selon la matière et la saison.

## Matière et entretien

La composition et l'entretien de ce modèle ne sont pas confirmés dans la fiche. Demandez ces informations, ainsi que le guide des mesures et les tailles disponibles, avant de choisir votre pièce.`,
  },
  {
    ref: "MT-GRENAT",
    slug: "jellaba-grenat-la-profondeur-dune-teinte",
    title: "Jellaba Grenat : la profondeur d'une teinte",
    excerpt:
      "Un grenat intense, une ceinture ton sur ton et des ornements clairs composent la personnalité de cette jellaba.",
    body: `## La couleur en premier

Le grenat donne à cette jellaba une profondeur immédiate. Une ceinture assortie souligne la taille, tandis que les ornements clairs encadrent le devant et les poignets. Le résultat joue sur la couleur et le contraste plutôt que sur l'accumulation.

## Une pièce qui se suffit à elle-même

Des accessoires sobres prolongent la palette sans détourner le regard du vêtement. Pour une tenue plus personnelle, un foulard dans un ton doux peut répondre au grenat sans créer un contraste trop fort.

## Demander les précisions utiles

La composition, les finitions et les mesures exactes restent à confirmer. Contactez Maison Titrit pour vérifier les tailles, le prix final et la disponibilité avant la commande.`,
  },
  {
    ref: "MT-ROYAL",
    slug: "takchita-royale-bleu-nuit-et-broderies-claires",
    title: "Takchita Royale : bleu nuit et broderies claires",
    excerpt:
      "Une silhouette de cérémonie en bleu nuit, soulignée par des broderies claires et une longueur spectaculaire.",
    body: `## Une présence de cérémonie

La Takchita Royale associe un bleu nuit profond à des broderies claires qui accompagnent le buste et la longueur. La silhouette est pensée pour une occasion où le vêtement occupe naturellement le premier plan.

## Le soin des proportions

Avec une pièce aussi ornée, des accessoires choisis avec mesure gardent l'ensemble harmonieux. La longueur, la façon de la fermer et les éventuelles superpositions influencent beaucoup le tombé final.

## Confirmer la construction du modèle

La construction exacte, la composition, les mesures et les finitions doivent être vérifiées directement avec la maison. Demandez aussi comment le modèle se porte et quelles tailles sont disponibles avant de réserver.`,
  },
  {
    ref: "MT-ETOILE",
    slug: "caftan-etoile-le-detail-au-coeur-du-vetement",
    title: "Caftan Étoile : le détail au cœur du vêtement",
    excerpt:
      "Ce portrait éditorial met en avant la ligne ceinturée et les détails dorés du caftan Étoile.",
    body: `## Une silhouette construite autour du détail

Le caftan Étoile met en avant une ligne longue et ceinturée, relevée de détails dorés. La ceinture rassemble la silhouette ; les ornements attirent le regard vers l'encolure et le devant. L'idée est de choisir une pièce forte, puis de laisser les accessoires accompagner son mouvement.

## Une silhouette qui se suffit à elle-même

Les détails dorés et la ceinture tressée donnent à cette proposition son caractère. Pour apprécier le tombé et la construction du modèle, demandez à la maison des photos complémentaires, la composition et les finitions avant commande.

Pour découvrir le visuel de référence et poser vos questions, consultez la fiche produit et contactez Maison Titrit.`,
  },
  {
    ref: "MT-CUIVRE",
    slug: "caftan-cuivre-la-chaleur-des-ornements",
    title: "Caftan Cuivre : la chaleur des ornements",
    excerpt:
      "Une base terracotta aux reflets cuivrés et des ornements clairs donnent à cette proposition une allure chaleureuse.",
    body: `## Une palette chaleureuse

Le caftan Cuivre se construit autour d'un ton terracotta et d'ornements clairs. La couleur donne de la chaleur à la silhouette ; les motifs rythment le devant et la longueur sans demander d'imprimé supplémentaire.

## Un accent suffit

Des accessoires crème, bruns ou dorés prolongent la palette. Une association plus contrastée peut apporter une touche contemporaine, à condition de laisser les détails du vêtement rester visibles.

## Garder la silhouette équilibrée

Le ton terracotta et les ornements clairs donnent à cette proposition une allure chaleureuse. Demandez à la maison des photos complémentaires pour vérifier la coupe exacte, ainsi que la composition, les finitions et la disponibilité avant commande.`,
  },
];

function getProduct(ref: string) {
  const product = PRODUCTS.find((item) => item.ref === ref);
  if (!product) throw new Error(`Missing product for editorial feature: ${ref}`);
  return product;
}

export const SEED_ARTICLES: SeedArticle[] = [
  ...EDITORIAL_ARTICLES,
  ...PRODUCT_FEATURES.map((feature) => {
    const product = getProduct(feature.ref);
    return {
      ...feature,
      body: `${feature.body}\n\n[Découvrir ${product.name}](/produit/${product.ref})`,
      coverImage: product.images[0].url,
      category: "Craft" as const,
      tags: ["Craft", "produit", product.ref, product.category, "mode modeste"],
      productRef: product.ref,
    };
  }),
];
