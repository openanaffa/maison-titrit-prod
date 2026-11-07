import { site } from "@/config/site";

function baseUrl() {
  return process.env.NEXT_PUBLIC_SITE_URL || "https://maisontitrit.com";
}

export const dynamic = "force-dynamic";

export async function GET() {
  const base = baseUrl();
  const manifest = {
    name: site.name,
    short_name: "Maison Titrit",
    description: "Mode modeste pour femmes. 100% Made in Morocco.",
    start_url: "/",
    display: "standalone",
    background_color: "#F4EAD5",
    theme_color: "#1C1A17",
    icons: [
      {
        src: "/favicon.ico",
        sizes: "16x16 32x32 48x48",
        type: "image/x-icon",
      },
      {
        src: "/apple-icon.png",
        sizes: "180x180",
        type: "image/png",
        purpose: "any maskable",
      },
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
      },
    ],
  };
  return new Response(JSON.stringify(manifest), {
    headers: {
      "Content-Type": "application/manifest+json",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}
