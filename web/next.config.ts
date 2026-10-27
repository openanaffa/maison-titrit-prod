import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* Vercel handles build output natively — no `output: "standalone"` needed. */
  reactStrictMode: false,
  // next dev would otherwise write web/AGENTS.md on every start
  agentRules: false,
};

export default nextConfig;
