export function getSafeRedirectPath(
	candidate: string | null | undefined,
	origin: string,
	fallback: string,
) {
	if (!candidate) return fallback;
	try {
		const resolved = new URL(candidate, origin);
		return resolved.origin === origin
			? `${resolved.pathname}${resolved.search}${resolved.hash}`
			: fallback;
	} catch {
		return fallback;
	}
}
