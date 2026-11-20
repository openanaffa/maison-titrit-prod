import { OTLPLogExporter } from "@opentelemetry/exporter-logs-otlp-http";
import { resourceFromAttributes } from "@opentelemetry/resources";
import {
	BatchLogRecordProcessor,
	LoggerProvider,
} from "@opentelemetry/sdk-logs";
import * as Sentry from "@sentry/nextjs";

const posthogToken = process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN;
const posthogHost = process.env.NEXT_PUBLIC_POSTHOG_HOST;

// This provider and its logger export only purpose-written PostHog log lines.
// Existing application loggers intentionally remain unchanged.
export const posthogLoggerProvider =
	posthogToken && posthogHost
		? new LoggerProvider({
				resource: resourceFromAttributes({
					"service.name": "maison-titrit-web",
				}),
				processors: [
					new BatchLogRecordProcessor(
						new OTLPLogExporter({
							url: `${posthogHost.replace(/\/$/, "")}/i/v1/logs`,
							headers: {
								Authorization: `Bearer ${posthogToken}`,
								"Content-Type": "application/json",
							},
							timeoutMillis: 2000,
						}),
					),
				],
			})
		: null;

export const posthogLogger = posthogLoggerProvider?.getLogger(
	"maison-titrit-posthog-logs",
);

export async function register() {
	if (process.env.NEXT_RUNTIME === "nodejs") {
		if (!posthogToken && process.env.NODE_ENV !== "production") {
			console.warn(
				"NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN variable required by PostHog is missing or un-configured, this causes events to be silently missed. This error stops appearing once NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN is configured",
			);
		}
		if (!posthogHost && process.env.NODE_ENV !== "production") {
			console.warn(
				"NEXT_PUBLIC_POSTHOG_HOST variable required by PostHog is missing or un-configured, this causes events to be silently missed. This error stops appearing once NEXT_PUBLIC_POSTHOG_HOST is configured",
			);
		}
		await import("../sentry.server.config");
	}

	if (process.env.NEXT_RUNTIME === "edge") {
		await import("../sentry.edge.config");
	}
}

// Capture errors from Server Components, proxy, and route handlers
export const onRequestError = Sentry.captureRequestError;
