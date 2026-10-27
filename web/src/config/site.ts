/**
 * ============================================================================
 *  MAISON TITRIT — CENTRAL SITE CONFIG
 * ----------------------------------------------------------------------------
 *  This is the SINGLE source of truth for brand identity, contact details,
 *  social profiles, store location/hours, navigation, and tracking IDs.
 *
 *  👉 To refine the site, edit values in THIS file. No other file needs to
 *     change for content/contact/socials/analytics IDs.
 *
 *  UI text strings (FR / AR / EN) live in  src/i18n/dictionaries.ts
 *  Product catalogue data          lives in  src/config/products.ts
 * ============================================================================
 */

export const site = {
  /* --- Identity ----------------------------------------------------------- */
  name: "Maison Titrit",
  nameAmazigh: "ⵜⵉⵟⵔⵉⵜ", // "Titrit" = star, in Tifinagh
  taglineKey: "brand.tagline", // resolved via i18n: "Maison de Couture"
  signature: "100% MADE IN MOROCCO 🇲🇦",
  arabicWelcome: "مرحبا ب طلباتكم 🥰", // shown as a flourish / in AR locale

  /* --- Contact ------------------------------------------------------------ */
  phones: [
    { label: "+212 684 921 942", e164: "+212684921942", display: "06 84 92 19 42" },
    { label: "+212 777 513 838", e164: "+212777513838", display: "07 77 51 38 38" },
  ],
  email: "Maisontitrit67@gmail.com",

  address: {
    line1: "Magasin N°4, Lots 5-6",
    line2: "Lotissement Dar Najeddine, Bouskoura",
    line3: "À proximité de New Time Private Academy",
    city: "Casablanca",
    country: "Maroc",
  },

  hours: [
    { dayKey: "hours.monfri", time: "10:00 — 20:00" },
    { dayKey: "hours.sat", time: "10:00 — 21:00" },
    { dayKey: "hours.sun", time: "Fermé" },
  ],

  /* --- Social profiles ---------------------------------------------------- */
  // Instagram · Pinterest · Facebook · TikTok · YouTube
  socials: {
    instagram: "https://www.instagram.com/maison__titrit/",
    instagramHandle: "@maison__titrit",
    pinterest: "https://www.pinterest.com/maison__titrit/",
    pinterestHandle: "maison__titrit",
    facebook: "https://www.facebook.com/maison.titrit",
    facebookHandle: "Maison Titrit",
    tiktok: "https://www.tiktok.com/@maison__titrit",
    tiktokHandle: "@maison__titrit",
    youtube: "https://www.youtube.com/@maison__titrit",
    youtubeHandle: "@maison__titrit",
  } as Record<string, string>,

  /* --- WhatsApp ----------------------------------------------------------- */
  whatsapp: {
    // Confirmed number for direct chat orders
    chat: "212684921942", // wa.me target (no +)
    chatAlt: "212777513838",
    // WhatsApp Business Catalog (the full online store)
    catalog: "https://wa.me/c/105815813947432",
  },

  /* --- Map (Google Maps) -------------------------------------------------- */
  // Basic embed via google.com/maps?q=...&output=embed — no API key required.
  // To upgrade to a keyed Maps JavaScript API embed, set NEXT_PUBLIC_GMAPS_KEY.
  map: {
    lat: 33.4496,
    lon: -7.652,
    query: "Maison Titrit, Lotissement Dar Najeddine, Bouskoura, Casablanca",
    zoom: 15,
  },

  /* --- Commerce ----------------------------------------------------------- */
  currency: "MAD",
  paymentKey: "brand.payment", // resolved via i18n: "Paiement à la livraison (COD)"

  /* --- Navigation --------------------------------------------------------- */
  nav: [
    { href: "#maison", labelKey: "nav.maison" },
    { href: "#collection", labelKey: "nav.collection" },
    { href: "#atelier", labelKey: "nav.atelier" },
    { href: "#nous-trouver", labelKey: "nav.find" },
    { href: "#contact", labelKey: "nav.contact" },
  ],
} as const;

export type SiteConfig = typeof site;

/* ============================================================================
 *  ANALYTICS & MARKETING TAGS
 * ----------------------------------------------------------------------------
 *  Replace the placeholder IDs with your real IDs (or set the env vars).
 *  Scripts are consent-gated by the cookie banner — they only load after the
 *  visitor accepts analytics/marketing cookies.
 * ============================================================================
 */
export const analytics = {
  // Google Tag Manager container ID (format: GTM-XXXXXXX)
  gtmId: process.env.NEXT_PUBLIC_GTM_ID || "GTM-XXXXXXX",
  // Google Analytics 4 measurement ID (format: G-XXXXXXXXXX)
  ga4Id: process.env.NEXT_PUBLIC_GA4_ID || "G-XXXXXXXXXX",
  // Meta / Facebook Pixel ID (numeric string)
  fbPixelId: process.env.NEXT_PUBLIC_FB_PIXEL_ID || "000000000000000",
  // Domain for Meta verification (optional)
  metaDomainVerification: process.env.NEXT_PUBLIC_META_DOMAIN || "",
} as const;

/* ============================================================================
 *  LEGAL — Moroccan Law 09-08 & EU GDPR (CNDP)
 * ----------------------------------------------------------------------------
 *  Mandatory legal notice rendered in the site footer (site-footer.tsx).
 *  ⚠️ TODO (user action required) — fill in the real values below:
 *     - rc:              Registre de Commerce number
 *     - ice:             Identifiant Commun de l'Entreprise (ICE) number
 *     - cndpDeclaration: CNDP declaration reference number
 *     - dpoEmail:        DPO / privacy contact email
 *  Until a value is filled in, its field is hidden in the footer.
 * ============================================================================
 */
export const legal = {
  /** Official company name shown on the notice */
  companyName: "Maison Titrit",
  /** TODO: Registre de Commerce number */
  rc: "",
  /** TODO: Identifiant Commun de l'Entreprise (ICE) number */
  ice: "",
  /** TODO: CNDP declaration reference number */
  cndpDeclaration: "",
  /** TODO: DPO / privacy contact email */
  dpoEmail: "",
} as const;

/* --- Default consent categories ----------------------------------------- */
export type ConsentCategory = "analytics" | "marketing";
export const CONSENT_VERSION = 1; // bump to re-show banner after policy change
