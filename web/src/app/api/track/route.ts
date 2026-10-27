/**
 * POST /api/track — server-side analytics dispatch (Meta Conversions API +
 * GA4 Measurement Protocol).
 *
 * Division of labor with the browser (see src/lib/analytics.ts):
 *   - the CLIENT fires page views + browse events (view_item*, begin_checkout,
 *     sign_up) directly via gtag/fbq;
 *   - this SERVER route fires Purchase / AddToCart (Meta CAPI + GA4 MP, both
 *     optional) so the same event is never sent twice.
 *
 * Consent is mandatory: the request body must carry
 * `consent: { analytics: boolean, marketing: boolean }`; a leg whose consent
 * is false is refused, a request without consent info is refused (400).
 *
 * All env vars are optional — an unconfigured leg is simply skipped and the
 * route still answers 200. PII (email/phone) is sha256-hashed in place and
 * NEVER persisted or logged; there is no storage here.
 */
import { NextRequest, NextResponse } from "next/server";
import { createHash } from "crypto";

type ConsentFlag = { analytics: boolean; marketing: boolean };

type TrackItem = {
  ref: string;
  name?: string;
  price?: number;
  qty?: number;
};

type TrackPayload = {
  event?: string;
  consent?: ConsentFlag;
  transactionId?: string;
  value?: number;
  currency?: string;
  items?: TrackItem[];
  eventId?: string;
  sourceUrl?: string;
  clientId?: string;
  fbp?: string;
  fbc?: string;
  // used ONLY for sha256 hashing below — never stored, never logged
  email?: string;
  phone?: string;
};

type LegResult = "sent" | "skipped" | "refused" | "error";

/* --- env (all optional) ---------------------------------------------------- */
const META_TOKEN = process.env.META_CAPI_ACCESS_TOKEN || "";
const META_PIXEL = process.env.META_PIXEL_ID || "";
const GA_ID = process.env.GA_MEASUREMENT_ID || "";
const GA_SECRET = process.env.GA_API_SECRET || "";

const metaReady = Boolean(META_TOKEN && META_PIXEL);
const gaReady = Boolean(GA_ID && GA_SECRET);

/* --- helpers --------------------------------------------------------------- */

/** sha256 of trim().toLowerCase() — Meta CAPI user-normalized value. */
function sha256(value: string): string {
  return createHash("sha256").update(value.trim().toLowerCase()).digest("hex");
}

function hashPhone(value: string): string {
  // Meta expects the phone reduced to digits incl. country code
  return sha256(value.replace(/[^\d]/g, ""));
}

/** GA4 wants snake_case event names; map the Meta-style names we dispatch. */
const GA4_EVENT_NAMES: Record<string, string> = {
  Purchase: "purchase",
  AddToCart: "add_to_cart",
  InitiateCheckout: "begin_checkout",
  ViewContent: "view_item",
  Lead: "generate_lead",
  PageView: "page_view",
};

function clientIp(req: NextRequest): string {
  const xff = req.headers.get("x-forwarded-for");
  return xff ? (xff.split(",")[0]?.trim() ?? "") : "";
}

function safeCurrency(c: unknown): string {
  return typeof c === "string" && /^[A-Za-z]{3}$/.test(c) ? c.toUpperCase() : "MAD";
}

/* --- GA4 Measurement Protocol leg ------------------------------------------- */

async function sendGa4(
  payload: TrackPayload,
  userAgent: string,
): Promise<LegResult> {
  if (!gaReady) return "skipped";
  const consent = payload.consent as ConsentFlag;
  if (!consent.analytics) return "refused";

  const items = (payload.items ?? []).map((it) => ({
    item_id: it.ref,
    item_name: it.name ?? "",
    price: typeof it.price === "number" ? it.price : 0,
    quantity: typeof it.qty === "number" && it.qty > 0 ? it.qty : 1,
  }));

  const name = GA4_EVENT_NAMES[payload.event ?? ""] ?? (payload.event ?? "").toLowerCase();
  const params: Record<string, unknown> = {
    currency: safeCurrency(payload.currency),
    transaction_id: payload.transactionId ?? "",
    items,
  };
  if (typeof payload.value === "number") params.value = payload.value;

  const body = {
    client_id: payload.clientId || "server",
    timestamp_micros: Date.now() * 1000,
    events: [{ name, params }],
  };

  try {
    const res = await fetch(
      `https://www.google-analytics.com/mp/collect?measurement_id=${encodeURIComponent(GA_ID)}&api_secret=${encodeURIComponent(GA_SECRET)}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json", "User-Agent": userAgent },
        body: JSON.stringify(body),
      },
    );
    return res.ok ? "sent" : "error";
  } catch {
    return "error";
  }
}

/* --- Meta Conversions API leg (Graph v19) ----------------------------------- */

async function sendMetaCapi(
  payload: TrackPayload,
  req: NextRequest,
  userAgent: string,
): Promise<LegResult> {
  if (!metaReady) return "skipped";
  const consent = payload.consent as ConsentFlag;
  if (!consent.marketing) return "refused";

  const user_data: Record<string, unknown> = {
    client_ip_address: clientIp(req),
    client_user_agent: userAgent,
  };
  if (payload.email) user_data.em = [sha256(payload.email)];
  if (payload.phone) user_data.ph = [hashPhone(payload.phone)];
  if (payload.fbp) user_data.fbp = payload.fbp;
  if (payload.fbc) user_data.fbc = payload.fbc;

  const custom_data: Record<string, unknown> = {
    currency: safeCurrency(payload.currency),
  };
  if (typeof payload.value === "number") custom_data.value = payload.value;
  if (payload.transactionId) custom_data.order_id = payload.transactionId;
  if (payload.items?.length) {
    custom_data.content_type = "product";
    custom_data.num_items = payload.items.reduce((s, it) => s + (it.qty ?? 1), 0);
    custom_data.contents = payload.items.map((it) => ({
      id: it.ref,
      quantity: typeof it.qty === "number" && it.qty > 0 ? it.qty : 1,
      item_price: it.price,
    }));
  }

  const body = {
    data: [
      {
        event_name: payload.event,
        event_time: Math.floor(Date.now() / 1000),
        event_id: payload.eventId,
        action_source: "website",
        event_source_url: payload.sourceUrl,
        user_data,
        custom_data,
      },
    ],
  };

  try {
    const res = await fetch(
      `https://graph.facebook.com/v19.0/${encodeURIComponent(META_PIXEL)}/events?access_token=${encodeURIComponent(META_TOKEN)}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      },
    );
    return res.ok ? "sent" : "error";
  } catch {
    return "error";
  }
}

/* --- route ------------------------------------------------------------------- */

export async function POST(req: NextRequest) {
  let payload: TrackPayload;
  try {
    payload = (await req.json()) as TrackPayload;
  } catch {
    return NextResponse.json({ error: "invalid JSON body" }, { status: 400 });
  }

  if (!payload.event || typeof payload.event !== "string") {
    return NextResponse.json({ error: "missing event name" }, { status: 400 });
  }

  // Consent guard — missing consent info is refused outright.
  const consent = payload.consent;
  if (
    !consent ||
    typeof consent !== "object" ||
    typeof consent.analytics !== "boolean" ||
    typeof consent.marketing !== "boolean"
  ) {
    return NextResponse.json(
      { error: "missing consent info" },
      { status: 400 },
    );
  }

  // never log the body (it may carry email/phone) — event name + leg status only
  const userAgent = req.headers.get("user-agent") ?? "";

  const ga = await sendGa4(payload, userAgent);
  const meta = await sendMetaCapi(payload, req, userAgent);

  // Status stays 200 even on upstream errors — the browser must never treat
  // analytics as a checkout failure. Only malformed/consent-less input is 400.
  return NextResponse.json({ ok: true, legs: { ga, meta } });
}
