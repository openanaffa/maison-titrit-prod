import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* Vercel handles build output natively — no `output: "standalone"` needed. */
  reactStrictMode: false,
  agentRules: false,
};

export default nextConfig;
