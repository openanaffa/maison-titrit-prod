"use client";

/**
 * Consent store + lightweight tracking helpers.
 * Consent is persisted in localStorage and shared via a small pub/sub so the
 * analytics scripts mount only after the visitor accepts.
 */
import { analytics, CONSENT_VERSION, type ConsentCategory } from "@/config/site";

const STORAGE_KEY = "titrit-consent";

export type ConsentState = {
  version: number;
  necessary: true; // always
  analytics: boolean;
  marketing: boolean;
  decided: boolean; // whether the user has made a choice
};

export const DEFAULT_CONSENT: ConsentState = {
  version: CONSENT_VERSION,
  necessary: true,
  analytics: false,
  marketing: false,
  decided: false,
};

type Listener = (s: ConsentState) => void;
const listeners = new Set<Listener>();
let current: ConsentState = DEFAULT_CONSENT;

function emit() {
  for (const l of listeners) l(current);
}

export function getConsent(): ConsentState {
  return current;
}

export function setConsent(next: ConsentState) {
  current = { ...next, necessary: true, version: CONSENT_VERSION };
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(current));
  } catch {
    /* ignore */
  }
  emit();
  // notify dataLayer / gtag + FB of the choice
  pushDataLayer({
    event: "cookie_consent_update",
    analytics: current.analytics,
    marketing: current.marketing,
  });
}

export function loadConsent(): ConsentState {
  if (typeof window === "undefined") return DEFAULT_CONSENT;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_CONSENT;
    const parsed = JSON.parse(raw) as Partial<ConsentState>;
    if (parsed.version !== CONSENT_VERSION) return DEFAULT_CONSENT;
    current = { ...DEFAULT_CONSENT, ...parsed, necessary: true };
  } catch {
    current = DEFAULT_CONSENT;
  }
  return current;
}

export function subscribe(l: Listener): () => void {
  listeners.add(l);
  return () => listeners.delete(l);
}

/* --- dataLayer helpers --------------------------------------------------- */
export function pushDataLayer(obj: Record<string, unknown>) {
  if (typeof window === "undefined") return;
  (window as unknown as { dataLayer: unknown[] }).dataLayer =
    (window as unknown as { dataLayer: unknown[] }).dataLayer || [];
  (window as unknown as { dataLayer: unknown[] }).dataLayer.push(obj);
}

/** Track a page view / custom event via GTM + GA4 (only after analytics consent). */
export function track(event: string, params?: Record<string, unknown>) {
  const s = getConsent();
  if (!s.analytics) return;
  pushDataLayer({ event, ...params });
}

/** Track a Meta Pixel custom event (only after marketing consent). */
export function trackFacebook(event: string, params?: Record<string, unknown>) {
  const s = getConsent();
  if (!s.marketing) return;
  if (typeof window === "undefined") return;
  const fbq = (window as unknown as { fbq?: (...a: unknown[]) => void }).fbq;
  fbq?.("track", event, params);
}

/** Convenience: has the visitor consented to a category? */
export function hasConsent(cat: ConsentCategory): boolean {
  return getConsent()[cat];
}

export { analytics };

/* --- E-commerce standard events (GA4 + Meta Pixel) ----------------------- */
/** GA4 ecomm events: view_item_list, view_item, add_to_cart, begin_checkout, purchase. */

export function trackViewItemList(items: { ref: string; name: string; price: number; category?: string }[]) {
  track("view_item_list", { item_list_id: "collection", item_list_name: "Collection", items: items.map(toGtmItem) });
}
export function trackViewItem(p: { ref: string; name: string; price: number; currency: string; category?: string }) {
  track("view_item", { currency: p.currency, value: p.price, items: [toGtmItem(p)] });
  trackFacebook("ViewContent", { content_ids: [p.ref], content_name: p.name, content_type: "product", value: p.price, currency: p.currency });
}
export function trackAddToCart(p: { ref: string; name: string; price: number; currency: string; qty: number }) {
  track("add_to_cart", { currency: p.currency, value: p.price * p.qty, items: [{ ...toGtmItem(p), quantity: p.qty }] });
  trackFacebook("AddToCart", { content_ids: [p.ref], content_name: p.name, value: p.price * p.qty, currency: p.currency, contents: [{ id: p.ref, quantity: p.qty }] });
}
export function trackBeginCheckout(items: { ref: string; name: string; price: number; qty: number }[], total: number, currency: string) {
  track("begin_checkout", { currency, value: total, items: items.map((i) => ({ ...toGtmItem(i), quantity: i.qty })) });
  trackFacebook("InitiateCheckout", { value: total, currency, num_items: items.length, contents: items.map((i) => ({ id: i.ref, quantity: i.qty })) });
}
export function trackPurchase(order: { number: string; total: number; currency: string; items: { ref: string; name: string; price: number; qty: number }[] }) {
  track("purchase", { transaction_id: order.number, value: order.total, currency: order.currency, items: order.items.map((i) => ({ ...toGtmItem(i), quantity: i.qty })) });
  trackFacebook("Purchase", { value: order.total, currency: order.currency, num_items: order.items.length, contents: order.items.map((i) => ({ id: i.ref, quantity: i.qty })), order_id: order.number });
}
export function trackLead(email?: string) {
  track("sign_up", { method: "email" });
  trackFacebook("Lead", { content_name: "sign_up", ...(email ? { em: email.toLowerCase() } : {}) });
}

function toGtmItem(p: { ref: string; name: string; price: number; category?: string }): Record<string, unknown> {
  return { item_id: p.ref, item_name: p.name, price: p.price, item_category: p.category ?? "Modest Fashion", item_brand: "Maison Titrit" };
}

/* --- UTM + first-touch attribution (captured on first visit) ------------ */
export function captureAttribution() {
  if (typeof window === "undefined") return;
  try {
    const url = new URL(window.location.href);
    const utm = { source: url.searchParams.get("utm_source"), medium: url.searchParams.get("utm_medium"), campaign: url.searchParams.get("utm_campaign"), content: url.searchParams.get("utm_content"), term: url.searchParams.get("utm_term"), ref: url.searchParams.get("ref") };
    const existing = sessionStorage.getItem("titrit-attr");
    if (existing) return; // first-touch only
    if (utm.source || utm.medium || utm.campaign || utm.ref) {
      sessionStorage.setItem("titrit-attr", JSON.stringify({ ...utm, landing: window.location.pathname, ts: Date.now() }));
    }
  } catch { /* ignore */ }
}

export function getAttribution(): Record<string, string> | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem("titrit-attr");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}
