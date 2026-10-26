/**
 * ============================================================================
 *  MAISON TITRIT — brand helpers
 * ----------------------------------------------------------------------------
 *  The authoritative config lives in  src/config/site.ts  (single source of
 *  truth). This file re-exports it as `brand` for backward compatibility and
 *  provides the WhatsApp / Google Maps link helpers.
 * ============================================================================
 */
import { site } from "@/config/site";

// Re-export the site config as `brand` (kept for legacy imports) + socials
export const brand = {
  name: site.name,
  nameAmazigh: site.nameAmazigh,
  tagline: site.taglineKey,
  signature: site.signature,
  arabicWelcome: site.arabicWelcome,
  about: "", // resolved via i18n (hero.about) — kept for legacy refs
  founded: "Made in Morocco",
  phones: site.phones,
  email: site.email,
  address: site.address,
  hours: site.hours,
  socials: {
    ...site.socials,
    whatsapp: site.whatsapp.chat,
    whatsappAlt: site.whatsapp.chatAlt,
  } as Record<string, string>,
  whatsappCatalog: site.whatsapp.catalog,
  map: site.map,
  currency: site.currency,
  payment: site.paymentKey,
} as const;

export const whatsappChat = site.whatsapp.chat;
export const whatsappCatalog = site.whatsapp.catalog;

/* --- WhatsApp link builders --------------------------------------------- */

/** WhatsApp deeplink for a specific product order (prefilled COD message). */
export function whatsappOrderLink(opts: {
  productName: string;
  price: number;
  size?: string;
  ref?: string;
}) {
  const phone = site.whatsapp.chat;
  const lines = [
    `Bonjour Maison Titrit 👋`,
    ``,
    `Je souhaite commander : « ${opts.productName} »`,
    `Réf. ${opts.ref ?? "—"} — Taille : ${opts.size ?? "à confirmer"}`,
    `Prix : ${opts.price.toLocaleString("fr-FR")} ${site.currency}`,
    `Paiement : Paiement à la livraison (COD)`,
    ``,
    `Merci de me confirmer la disponibilité et les délais de livraison.`,
  ];
  const text = encodeURIComponent(lines.join("\n"));
  return `https://wa.me/${phone}?text=${text}`;
}

/** Generic WhatsApp contact deeplink. */
export function whatsappContactLink(message?: string) {
  const phone = site.whatsapp.chat;
  const text = message ? `?text=${encodeURIComponent(message)}` : "";
  return `https://wa.me/${phone}${text}`;
}

/* --- Google Maps helpers (no API key needed for the basic embed) -------- */

/** Embeddable Google Maps iframe URL (no API key required). */
export function googleMapsEmbedUrl() {
  const { lat, lon, zoom } = site.map;
  // q with lat,lon + label — works without a key via the classic embed.
  return `https://www.google.com/maps?q=${encodeURIComponent(
    `${lat},${lon}`,
  )}&z=${zoom}&output=embed`;
}

/** Google Maps link for the full maps app (open in new tab). */
export function googleMapsLink() {
  const { query } = site.map;
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}

/** Google Maps directions link (from user's location to the atelier). */
export function googleMapsDirectionsUrl() {
  const { lat, lon } = site.map;
  return `https://www.google.com/maps/dir/?api=1&destination=${lat},${lon}`;
}

/* --- OpenStreetMap (kept as open-source fallback) ----------------------- */
export function osmEmbedUrl() {
  const { lat, lon } = site.map;
  const d = 0.02;
  return `https://www.openstreetmap.org/export/embed.html?bbox=${lon - d}%2C${
    lat - d
  }%2C${lon + d}%2C${lat + d}&layer=mapnik&marker=${lat}%2C${lon}`;
}
export function osmLink() {
  const { lat, lon } = site.map;
  return `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lon}#map=16/${lat}/${lon}`;
}
