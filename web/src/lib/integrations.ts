import { cache } from "react";
import { unstable_cache } from "next/cache";
import { db } from "@/lib/db";
import { analytics as siteAnalytics } from "@/config/site";

/* ============================================================================
 *  Integration settings — runtime-configurable trackers & domain verifications
 *  Backed by the `Setting` key-value table (keys: integration.analytics,
 *  integration.verification). Values override the build-time env fallbacks in
 *  src/config/site.ts, so the founder can change them via /makteb/settings
 *  without a redeploy.
 * ==========================================================================*/

export type AnalyticsConfig = {
  gtmId: string;
  ga4Id: string;
  fbPixelId: string;
};

export type CustomMeta = { name: string; content: string };

export type VerificationConfig = {
  google: string; // "google-site-verification"
  facebook: string; // "facebook-domain-verification"
  instagram: string; // "instagram-site-verification"
  tiktok: string; // "tiktok-domain-verification"
  custom: CustomMeta[]; // anything else (Pinterest, Bing, Clarity…)
};

export type Integrations = {
  analytics: AnalyticsConfig;
  verification: VerificationConfig;
};

const DEFAULT_ANALYTICS: AnalyticsConfig = {
  gtmId: siteAnalytics.gtmId,
  ga4Id: siteAnalytics.ga4Id,
  fbPixelId: siteAnalytics.fbPixelId,
};

const DEFAULT_VERIFICATION: VerificationConfig = {
  google: "",
  facebook: siteAnalytics.metaDomainVerification,
  instagram: "",
  tiktok: "",
  custom: [],
};

/* --- ID sanity ------------------------------------------------------------ */

/// Loose shim for GTM / GA4 IDs; falsy or placeholder values are dropped.
const VALID_TRACKER_ID = /^[A-Z]{1,5}-[A-Za-z0-9_-]{4,20}$/;

export function sanitizeAnalytics(input: unknown): AnalyticsConfig {
  const raw = (input ?? {}) as Record<string, unknown>;
  const pick = (v: unknown): string =>
    typeof v === "string" && VALID_TRACKER_ID.test(v.trim()) ? v.trim() : "";
  return {
    gtmId: pick(raw.gtmId),
    ga4Id: pick(raw.ga4Id),
    fbPixelId:
      typeof raw.fbPixelId === "string" && /^\d{10,20}$/.test(raw.fbPixelId.trim())
        ? raw.fbPixelId.trim()
        : "",
  };
}

const VALID_META_NAME = /^[a-z0-9_.:-]{2,80}$/i;
const MAX_META_CONTENT = 600;

/// Accepts a raw paste of `<meta …>` tags (one per line) and extracts ONLY
/// name|property + content pairs — raw HTML is never stored or re-emitted.
export function parseCustomMeta(paste: unknown): CustomMeta[] {
  if (typeof paste !== "string") return [];
  const out: CustomMeta[] = [];
  const tagRe = /<(?:meta|TITLE)[^>]*>/gi;
  const attr = (tag: string, a: string) => {
    const m = tag.match(new RegExp(`${a}\\s*=\\s*["']([^"']+)["']`, "i"));
    return m?.[1]?.trim() ?? "";
  };
  for (const tag of paste.match(tagRe) ?? []) {
    const name = attr(tag, "name") || attr(tag, "property");
    const content = attr(tag, "content");
    if (name && content && VALID_META_NAME.test(name) && content.length <= MAX_META_CONTENT) {
      out.push({ name, content });
    }
  }
  return out;
}

export function sanitizeVerification(input: unknown): VerificationConfig {
  const raw = (input ?? {}) as Record<string, unknown>;
  const pick = (v: unknown): string => {
    // Owners paste the code given by each platform (e.g. the content value of
    // the <meta> tag). Strip anything that looks like a full tag down to the
    // content value, then hard-limit length and character set.
    if (typeof v !== "string") return "";
    const s = v.trim();
    const inner = s.match(/content\s*=\s*["']([^"']+)["']/i)?.[1] ?? s;
    const clean = inner.replace(/["'\\<>]/g, "").slice(0, 200);
    return /^[\w=+/.-]+$/.test(clean) ? clean : "";
  };
  const customInput = Array.isArray(raw.custom) ? raw.custom : parseCustomMeta(raw.custom);
  return {
    google: pick(raw.google),
    facebook: pick(raw.facebook),
    instagram: pick(raw.instagram),
    tiktok: pick(raw.tiktok),
    custom: customInput
      .map((c) => {
        const cc = c as unknown as Record<string, unknown>;
        const name = typeof cc.name === "string" ? cc.name.trim() : "";
        const content = typeof cc.content === "string" ? cc.content.trim() : "";
        return name && content && VALID_META_NAME.test(name) && content.length <= MAX_META_CONTENT
          ? { name: name.slice(0, 80), content: content.slice(0, MAX_META_CONTENT) }
          : null;
      })
      .filter((v): v is CustomMeta => v !== null)
      .slice(0, 10),
  };
}

/* --- Read (server) --------------------------------------------------------- */

async function readRow(key: string): Promise<Record<string, unknown>> {
  try {
    const row = await db.setting.findUnique({ where: { key } });
    return row ? (JSON.parse(row.value) as Record<string, unknown>) : {};
  } catch {
    return {}; // DB unavailable (e.g. build prerender with placeholder URL)
  }
}

async function readIntegrations(): Promise<Integrations> {
  const [analyticsRow, verificationRow] = await Promise.all([
    readRow("integration.analytics"),
    readRow("integration.verification"),
  ]);
  const storedAnalytics = sanitizeAnalytics(analyticsRow);
  const storedVerification = sanitizeVerification(verificationRow);
  return {
    analytics: {
      // stored > env (config/site.ts already resolves the env vars)
      gtmId: storedAnalytics.gtmId || DEFAULT_ANALYTICS.gtmId,
      ga4Id: storedAnalytics.ga4Id || DEFAULT_ANALYTICS.ga4Id,
      fbPixelId: storedAnalytics.fbPixelId || DEFAULT_ANALYTICS.fbPixelId,
    },
    verification: {
      google: storedVerification.google || DEFAULT_VERIFICATION.google,
      facebook: storedVerification.facebook || DEFAULT_VERIFICATION.facebook,
      instagram: storedVerification.instagram || DEFAULT_VERIFICATION.instagram,
      tiktok: storedVerification.tiktok || DEFAULT_VERIFICATION.tiktok,
      custom: storedVerification.custom.length
        ? storedVerification.custom
        : DEFAULT_VERIFICATION.custom,
    },
  };
}

/** Cached read (per-request + 60s revalidate) of the effective integrations. */
export const getIntegrations = cache(
  unstable_cache(readIntegrations, ["integrations"], { revalidate: 60 }),
);

/** Head-side metadata names per platform. */
export const VERIFICATION_META: Record<keyof Omit<VerificationConfig, "custom">, string> = {
  google: "google-site-verification",
  facebook: "facebook-domain-verification",
  instagram: "instagram-site-verification",
  tiktok: "tiktok-domain-verification",
};
