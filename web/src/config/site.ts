/**
 * ============================================================================
 *  MAISON TITRIT â€” CENTRAL SITE CONFIG
 * ----------------------------------------------------------------------------
 *  This is the SINGLE source of truth for brand identity, contact details,
 *  social profiles, store location/hours, navigation, and tracking IDs.
 *
 *  ðŸ‘‰ To refine the site, edit values in THIS file. No other file needs to
 *     change for content/contact/socials/analytics IDs.
 *
 *  UI text strings (FR / AR / EN) live in  src/i18n/dictionaries.ts
 *  Product catalogue data          lives in  src/config/products.ts
 * ============================================================================
 */
export const SITE_URL = baseUrl();
export const OG_IMAGE = `${SITE_URL}/og-default.png`;
export const DEFAULT_OG = "/og-default.png";

export function baseUrl(): string {
	return process.env.NEXT_PUBLIC_SITE_URL || "https://maisontitrit.com";
}
export const site = {
	/* --- Identity ----------------------------------------------------------- */
	name: "Maison Titrit",
	nameAmazigh: "âµœâµ‰âµŸâµ”âµ‰âµœ",
	taglineKey: "brand.tagline", // resolved via i18n: "Maison de Couture"
	signature: "100% MADE IN MOROCCO ðŸ‡²ðŸ‡¦",
	arabicWelcome: "Ù…Ø±Ø­Ø¨Ø§ Ø¨ Ø·Ù„Ø¨Ø§ØªÙƒÙ… ðŸ¥°", // shown as a flourish / in AR locale

	/* --- Contact ------------------------------------------------------------ */
	phones: [
		{
			label: "+212 684 921 942",
			e164: "+212684921942",
			display: "06 84 92 19 42",
		},
		{
			label: "+212 777 513 838",
			e164: "+212777513838",
			display: "07 77 51 38 38",
		},
	],
	email: "hello@maisontitrit.com",

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
	// Instagram Â· Pinterest Â· Facebook Â· TikTok Â· YouTube
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
	// Basic embed via google.com/maps?q=...&output=embed â€” no API key required.
	// To upgrade to a keyed Maps JavaScript API embed, set NEXT_PUBLIC_GMAPS_KEY.
	map: {
		lat: 33.4496,
		lon: -7.652,
		query: "Maison Titrit, Lotissement Dar Najeddine, Bouskoura, Casablanca",
		zoom: 15,
	},

	/* --- Commerce ----------------------------------------------------------- */
	currency: "MAD",
	paymentKey: "brand.payment",

	/* --- Navigation --------------------------------------------------------- */
	nav: [
		// Anchors are home-scoped (/#â€¦) so the header works from every page;
		// /blog is a real route (Journal).
		{ href: "/#maison", labelKey: "nav.maison" },
		{ href: "/#collection", labelKey: "nav.collection" },
		{ href: "/blog", labelKey: "nav.journal" },
		{ href: "/#atelier", labelKey: "nav.atelier" },
		{ href: "/#nous-trouver", labelKey: "nav.find" },
		{ href: "/#contact", labelKey: "nav.contact" },
	],
} as const;

export type SiteConfig = typeof site;

/* ============================================================================
 *  ANALYTICS & MARKETING TAGS
 * ----------------------------------------------------------------------------
 *  Replace the placeholder IDs with your real IDs (or set the env vars).
 *  Scripts are consent-gated by the cookie banner â€” they only load after the
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
	/* --- Phase-2 marketing SDK IDs (each activates only when set + real) ---- */
	// Pinterest Tag ID â€” numeric, from Pinterest Ads â†’ Conversions â†’ Tag Manager â†’ Install tag
	pinterestTagId: process.env.NEXT_PUBLIC_PINTEREST_TAG_ID || "",
	// TikTok Pixel ID â€” numeric, from TikTok Ads â†’ Events â†’ Pixel
	tiktokPixelId: process.env.NEXT_PUBLIC_TIKTOK_PIXEL_ID || "",
	// YouTube channel handle or channel ID (e.g. "@maison__titrit" or "UCâ€¦")
	youtubeChannelId: process.env.NEXT_PUBLIC_YOUTUBE_CHANNEL_ID || "",
} as const;
export type SiteAnalytics = typeof analytics;
/* ============================================================================
 *  LEGAL NOTICE — defaults (owner-configurable in /makteb/settings)
 * ----------------------------------------------------------------------------
 *  Verified legal identity is stored in Setting key `site.legal` and surfaced
 *  via getLegalIdentity() / /api/settings/legal. Keep defaults empty here so
 *  unconfirmed identifiers are never published; the footer and legal surfaces
 *  render only verified, non-empty values.
 * ============================================================================
 */
export const legalNotice = {
	companyName: "",
	rcNumber: "",
	iceNumber: "",
	cndpDeclarationNumber: "",
	dpoEmail: "",
} as const;

/* --- Default consent categories ----------------------------------------- */
export const CONSENT_VERSION = 1; // bump to re-show banner after policy change
