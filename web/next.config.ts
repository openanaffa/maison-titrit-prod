import { withSentryConfig } from "@sentry/nextjs/config";
import { withBotId } from "botid/next/config";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	reactStrictMode: false,
	agentRules: false,
	// Private paths stay crawlable so Google sees noindex (robots.txt Disallow caused "indexed though blocked").
	async headers() {
		return [
			"/makteb/:path*",
			"/api/:path*",
			"/compte/:path*",
			"/checkout/:path*",
			"/panier/:path*",
			"/auth/:path*",
		]
			.map((source) => ({
				source,
				headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }],
			}))
			.concat({
				source: "/((?!api/|_next/|.*\\.).*)",
				headers: [{ key: "Content-Type", value: "text/html; charset=utf-8" }],
			});
	},
	images: {
		remotePatterns: [
			{ protocol: "https", hostname: "cdn.maisontitrit.com" },
			{ protocol: "https", hostname: "pub-*.r2.dev" },
		],
	},
};

export default withSentryConfig(withBotId(nextConfig), {
	org: process.env.SENTRY_ORG,
	project: process.env.SENTRY_PROJECT,
	silent: !process.env.CI,
});
