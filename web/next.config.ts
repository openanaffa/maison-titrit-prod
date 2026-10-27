import type { NextConfig } from "next";
import { withBotId } from "botid/next/config";

const nextConfig: NextConfig = {
  /* Vercel handles build output natively — no `output: "standalone"` needed. */
  reactStrictMode: false,
  agentRules: false,
};

export default withBotId(nextConfig);
