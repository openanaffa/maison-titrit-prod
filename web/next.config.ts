import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* Vercel handles build output natively — no `output: "standalone"` needed. */
  reactStrictMode: false,
  agentRules: false,
  images: {
    // Product/blog images can live on the R2 public URL (R2_PUBLIC_URL, e.g.
    // https://cdn.maisontitrit.com) or the R2 public-bucket fallback host.
    remotePatterns: [
      { protocol: "https", hostname: "cdn.maisontitrit.com" },
      { protocol: "https", hostname: "pub-*.r2.dev" },
    ],
  },
};

export default nextConfig;
