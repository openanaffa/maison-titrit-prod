/**
 * Correlation IDs for tracing critical workflows across service boundaries.
 *
 * A correlation ID is a stable identifier attached to every log line, Sentry
 * event and outbound notification for a single logical request (e.g. one
 * checkout POST). It lets ops trace a failure from the customer-facing error
 * back through Sentry, server logs and notification delivery without logging
 * secrets or unnecessary PII.
 *
 * The ID is derived from an inbound `x-correlation-id` header when present,
 * otherwise freshly generated. It is intentionally opaque: it contains no
 * customer data, PII or internal identifiers.
 */

export const CORRELATION_ID_HEADER = "x-correlation-id";

/** Extract an existing correlation ID from a request, or generate one. */
export function getCorrelationId(req: Request): string {
	const existing = req.headers.get(CORRELATION_ID_HEADER);
	if (existing && existing.length > 0) return existing;
	return `req_${crypto.randomUUID()}`;
}

/** Structured log entry with correlation ID context. No secrets or PII. */
export function logWithCorrelation(
	correlationId: string,
	level: "info" | "warn" | "error",
	message: string,
	meta?: Record<string, unknown>,
) {
	const entry: Record<string, unknown> = {
		correlationId,
		level,
		message,
		timestamp: new Date().toISOString(),
	};
	if (meta) Object.assign(entry, meta);
	const str = JSON.stringify(entry);
	if (level === "error") {
		console.error(str);
	} else if (level === "warn") {
		console.warn(str);
	} else {
		console.info(str);
	}
}
