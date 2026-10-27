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

/* --- Google Consent Mode v2 ----------------------------------------------
 * The consent *default* (all denied, wait_for_update: 500) is injected
 * beforeInteractive in components/analytics/analytics-scripts.tsx. Here we
 * mirror every consent change (and restoration from localStorage) to gtag
 * consent state:
 *   analytics  → analytics_storage
 *   marketing  → ad_storage + ad_user_data + ad_personalization
 * ------------------------------------------------------------------------ */

/** Push a raw gtag command (arguments) onto the dataLayer. */
function pushGtag(...args: unknown[]) {
  if (typeof window === "undefined") return;
  const w = window as unknown as { dataLayer: unknown[] };
  w.dataLayer = w.dataLayer || [];
  w.dataLayer.push(args);
}

function gtagConsentValues(s: ConsentState) {
  return {
    analytics_storage: s.analytics ? "granted" : "denied",
    ad_storage: s.marketing ? "granted" : "denied",
    ad_user_data: s.marketing ? "granted" : "denied",
    ad_personalization: s.marketing ? "granted" : "denied",
  };
}

function pushGtagConsentUpdate(s: ConsentState) {
  // default already denies everything; only granted states need an update
  if (!(s.analytics || s.marketing)) return;
  pushGtag("consent", "update", gtagConsentValues(s));
}

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
  // mirror the choice to Google Consent Mode v2
  pushGtagConsentUpdate(current);
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
  // returning visitor whose stored choice predates Consent Mode v2 —
  // restore the gtag consent state so already-loaded tags respect it
  if (current.decided) pushGtagConsentUpdate(current);
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

/* --- Server-side dispatch (POST /api/track) ------------------------------
 * Division of labor with the browser so events are never double-sent:
 *   - the BROWSER fires page views & browse events (view_item*, begin_checkout,
 *     sign_up) via gtag/fbq (helpers above);
 *   - the SERVER route (src/app/api/track → Meta Conversions API + GA4
 *     Measurement Protocol) fires Purchase and AddToCart.
 * The route reports which legs actually ran; for any leg that was not
 * configured (env unset), refused, or errored server-side, we fall back to
 * the consent-gated browser dispatches from the helpers above.
 * ------------------------------------------------------------------------ */

type ServerLegs = { ga: boolean; meta: boolean };
const NO_LEGS: ServerLegs = { ga: false, meta: false };

function getCookie(name: string): string | undefined {
  if (typeof document === "undefined") return;
  const hit = document.cookie
    .split(";")
    .map((c) => c.trim())
    .find((c) => c.startsWith(`${name}=`));
  return hit ? decodeURIComponent(hit.slice(name.length + 1)) : undefined;
}

/** GA4 client_id from the `_ga` cookie (GA1.1.<client_id>), else a random
 * locally-persisted id (never PII). */
function getGaClientId(): string {
  if (typeof window === "undefined") return "server";
  try {
    const gaCookie = getCookie("_ga");
    if (gaCookie) {
      const parts = gaCookie.split(".");
      if (parts.length >= 4) return `${parts[2]}.${parts[3]}`;
    }
    let cid = window.localStorage.getItem("titrit-ga-cid");
    if (!cid) {
      cid = window.crypto.randomUUID();
      window.localStorage.setItem("titrit-ga-cid", cid);
    }
    return cid;
  } catch {
    return "server";
  }
}

async function dispatchServerEvent(
  event: string,
  payload: {
    transactionId?: string;
    value?: number;
    currency?: string;
    items?: { ref: string; name: string; price: number; qty?: number }[];
    email?: string;
    phone?: string;
  },
): Promise<ServerLegs> {
  if (typeof window === "undefined") return NO_LEGS;
  const s = getConsent();
  if (!s.decided) return NO_LEGS; // no answer from the banner → send nothing
  try {
    const res = await fetch("/api/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        event,
        consent: { analytics: s.analytics, marketing: s.marketing },
        sourceUrl: window.location.href,
        clientId: getGaClientId(),
        fbp: getCookie("_fbp"),
        fbc: getCookie("_fbc"),
        ...payload,
      }),
    });
    if (!res.ok) return NO_LEGS;
    const json = (await res.json()) as { ok?: boolean; legs?: { ga?: string; meta?: string } };
    const legs = json.legs;
    if (!legs) return NO_LEGS;
    return { ga: legs.ga === "sent", meta: legs.meta === "sent" };
  } catch {
    return NO_LEGS;
  }
}

/* --- E-commerce standard events (GA4 + Meta Pixel) ----------------------- */
/** GA4 ecomm events: view_item_list, view_item, add_to_cart, begin_checkout, purchase. */

export function trackViewItemList(items: { ref: string; name: string; price: number; category?: string }[]) {
  track("view_item_list", { item_list_id: "collection", item_list_name: "Collection", items: items.map(toGtmItem) });
}
export function trackViewItem(p: { ref: string; name: string; price: number; currency: string; category?: string }) {
  track("view_item", { currency: p.currency, value: p.price, items: [toGtmItem(p)] });
  trackFacebook("ViewContent", { content_ids: [p.ref], content_name: p.name, content_type: "product", value: p.price, currency: p.currency });
}
export async function trackAddToCart(p: { ref: string; name: string; price: number; currency: string; qty: number }) {
  // AddToCart → server-first (see dispatchServerEvent division of labor)
  const legs = await dispatchServerEvent("AddToCart", {
    value: p.price * p.qty,
    currency: p.currency,
    items: [{ ref: p.ref, name: p.name, price: p.price, qty: p.qty }],
  });
  // browser fallback only for legs the server could not cover
  if (!legs.ga) {
    track("add_to_cart", { currency: p.currency, value: p.price * p.qty, items: [{ ...toGtmItem(p), quantity: p.qty }] });
  }
  if (!legs.meta) {
    trackFacebook("AddToCart", { content_ids: [p.ref], content_name: p.name, value: p.price * p.qty, currency: p.currency, contents: [{ id: p.ref, quantity: p.qty }] });
  }
}
export function trackBeginCheckout(items: { ref: string; name: string; price: number; qty: number }[], total: number, currency: string) {
  track("begin_checkout", { currency, value: total, items: items.map((i) => ({ ...toGtmItem(i), quantity: i.qty })) });
  trackFacebook("InitiateCheckout", { value: total, currency, num_items: items.length, contents: items.map((i) => ({ id: i.ref, quantity: i.qty })) });
}
export async function trackPurchase(
  order: { number: string; total: number; currency: string; items: { ref: string; name: string; price: number; qty: number }[] },
  contact?: { email?: string; phone?: string },
) {
  // Purchase → server-first; hashed email/phone improve CAPI match quality
  const legs = await dispatchServerEvent("Purchase", {
    transactionId: order.number,
    value: order.total,
    currency: order.currency,
    items: order.items.map((i) => ({ ref: i.ref, name: i.name, price: i.price, qty: i.qty })),
    email: contact?.email,
    phone: contact?.phone,
  });
  if (!legs.ga) {
    track("purchase", { transaction_id: order.number, value: order.total, currency: order.currency, items: order.items.map((i) => ({ ...toGtmItem(i), quantity: i.qty })) });
  }
  if (!legs.meta) {
    trackFacebook("Purchase", { value: order.total, currency: order.currency, num_items: order.items.length, contents: order.items.map((i) => ({ id: i.ref, quantity: i.qty })), order_id: order.number });
  }
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
