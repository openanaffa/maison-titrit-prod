import { NextResponse } from "next/server";

export async function GET() {
	const sentryEnabled = !!process.env.SENTRY_DSN;
	const nodeVersion = process.version;
	const nextVersion = "16.4.5";

	return NextResponse.json({
		status: "ok",
		timestamp: new Date().toISOString(),
		sentry: {
			enabled: sentryEnabled,
			dsnConfigured: !!process.env.SENTRY_DSN,
		},
		runtime: {
			node: nodeVersion,
			next: nextVersion,
		},
		release:
			process.env.SENTRY_RELEASE ||
			process.env.VERCEL_GIT_COMMIT_SHA ||
			"local",
	});
}
