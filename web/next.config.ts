import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* Vercel handles build output natively — no `output: "standalone"` needed. */
  reactStrictMode: false,
  agentRules: false,
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "cdn.maisontitrit.com" },
      { protocol: "https", hostname: "pub-*.r2.dev" },
    ],
  },
};

export default nextConfig;
