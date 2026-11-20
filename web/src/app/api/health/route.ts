import { SeverityNumber } from "@opentelemetry/api-logs";
import { after, NextResponse } from "next/server";
import { posthogLogger, posthogLoggerProvider } from "@/instrumentation";

export async function GET() {
	const sentryEnabled = !!process.env.SENTRY_DSN;
	const nodeVersion = process.version;
	const nextVersion = "16.4.5";

	posthogLogger?.emit({
		body: "Health check completed",
		severityNumber: SeverityNumber.INFO,
		attributes: {
			endpoint: "/api/health",
			status: "ok",
		},
	});
	if (posthogLoggerProvider) {
		after(async () => {
			await posthogLoggerProvider.forceFlush().catch(() => {});
		});
	}

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
