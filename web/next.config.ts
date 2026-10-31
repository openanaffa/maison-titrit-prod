import type { NextConfig } from "next";
import { withBotId } from "botid/next/config";

const nextConfig: NextConfig = {
  /* Vercel handles build output natively — no `output: "standalone"` needed. */
  reactStrictMode: false,
  agentRules: false,
  // Private paths stay crawlable so Google sees noindex (robots.txt Disallow caused "indexed though blocked").
  async headers() {
    return ["/makteb/:path*", "/api/:path*", "/compte/:path*", "/checkout/:path*", "/panier/:path*", "/auth/:path*"].map(
      (source) => ({ source, headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }] }),
    );
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "cdn.maisontitrit.com" },
      { protocol: "https", hostname: "pub-*.r2.dev" },
    ],
  },
};

export default withBotId(nextConfig);
