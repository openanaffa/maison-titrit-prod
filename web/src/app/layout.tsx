import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "@/components/theme-provider";
import { LocaleProvider } from "@/i18n/locale-provider";
import { NextAuthProvider } from "@/components/maison/next-auth-provider";
import { AnnouncementBar } from "@/components/maison/announcement-bar";
import { AnalyticsScripts } from "@/components/analytics/analytics-scripts";
import {
  CookieConsent,
  CookiePreferencesButton,
} from "@/components/analytics/cookie-consent";
import { SiteJsonLd } from "@/components/seo/json-ld";
import { site } from "@/config/site";
import { baseUrl } from "@/lib/seo";
import { VERIFICATION_META, getIntegrations } from "@/lib/integrations";
import { AttributionCapture } from "@/components/analytics/attribution-capture";
import { Analytics } from '@vercel/analytics/next';

const SITE_URL = baseUrl();
const OG_IMAGE = `${SITE_URL}/og-default.png`;

/* Integration settings are runtime-editable (see /makteb/settings) — the root
 * layout revalidates them every 60s and re-emits the verification metas and
 * analytics scripts accordingly. Re-renders the whole subtree on that cadence. */
export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  const { verification } = await getIntegrations();

  const other: Record<string, string> = {};
  if (verification.google) other[VERIFICATION_META.google] = verification.google;
  if (verification.facebook) other[VERIFICATION_META.facebook] = verification.facebook;
  if (verification.instagram) other[VERIFICATION_META.instagram] = verification.instagram;
  if (verification.tiktok) other[VERIFICATION_META.tiktok] = verification.tiktok;
  for (const { name, content } of verification.custom) other[name] = content;

  return {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${site.name} — ${site.nameAmazigh} | Modest Fashion · Made in Morocco`,
    template: `%s · ${site.name}`,
  },
  description:
    "Maison Titrit — mode modeste pour femmes. Style, confort, qualité. 100% Made in Morocco 🇲🇦. Caftans, robes, tuniques, ensembles & abayas. Commande sur WhatsApp — paiement à la livraison (COD).",
  keywords: [
    "Maison Titrit",
    "mode modeste",
    "modest fashion",
    "caftan",
    "robe",
    "tunique",
    "abaya",
    "Made in Morocco",
    "Bouskoura",
    "Casablanca",
    "modest dresses",
    "Moroccan fashion",
    "Amazigh",
    "WhatsApp order",
  ],
  authors: [{ name: site.name }],
  creator: site.name,
  publisher: site.name,
  applicationName: site.name,
  alternates: { canonical: SITE_URL },
  openGraph: {
    title: `${site.name} — Modest Fashion · Made in Morocco`,
    description:
      "Mode modeste pour femmes. Style, confort, qualité. 100% Made in Morocco 🇲🇦. Commande sur WhatsApp — paiement à la livraison (COD).",
    type: "website",
    locale: "fr_MA",
    siteName: site.name,
    url: SITE_URL,
    images: [
      {
        url: OG_IMAGE,
        width: 1200,
        height: 630,
        alt: `${site.name} — Modest Fashion · Made in Morocco`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: "@maison__titrit",
    creator: "@maison__titrit",
    title: `${site.name} — Modest Fashion · Made in Morocco`,
    description: "Mode modeste pour femmes. 100% Made in Morocco 🇲🇦. Commande sur WhatsApp.",
    images: [OG_IMAGE],
  },
  robots: {
    index: true,
    follow: true,
    "max-snippet": -1,
    "max-image-preview": "large",
    "max-video-preview": -1,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
  // Domain verification tags — editor-managed (see /makteb/settings), env as fallback
  verification:
    Object.keys(other).length > 0
      ? {
          other,
        }
      : undefined,
  category: "shopping",
  };
}

/**
 * All Google fonts are loaded via <link> tags in <head> (below).
 * This avoids the Turbopack `next/font/google` import-map bug
 * ("next/font/google queries have exactly one entry") and keeps font
 * loading resilient across Next.js/Turbopack versions. The CSS variables
 * (--font-display, --font-serif, …) are defined in globals.css :root.
 */
const FONT_HREF =
  "https://fonts.googleapis.com/css2?" +
  [
    "family=Cinzel:wght@400;500;600;700",
    "family=Allura",
    "family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400;1,500",
    "family=Jost:wght@300;400;500;600",
    "family=Marcellus",
    "family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;0,800;0,900;1,400;1,500;1,600",
    "family=Noto+Sans+Tifinagh:wght@400;700",
  ].join("&") +
  "&display=swap";

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const { analytics } = await getIntegrations();
  return (
    <html lang="fr" dir="ltr" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href={FONT_HREF} rel="stylesheet" />
        <SiteJsonLd />
      </head>
      <body className="antialiased bg-background text-foreground min-h-screen flex flex-col">
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
          <LocaleProvider>
            <NextAuthProvider>
              <AttributionCapture />
              <AnnouncementBar />
              <AnalyticsScripts gtmId={analytics.gtmId} ga4Id={analytics.ga4Id} fbPixelId={analytics.fbPixelId} />
              {children}
              <CookieConsent />
              <CookiePreferencesButton />
            </NextAuthProvider>
          </LocaleProvider>
        </ThemeProvider>
        <Toaster />
        <Analytics />
      </body>
    </html>
  );
}
