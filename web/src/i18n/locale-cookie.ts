/**
 * Locale cookie helpers.
 *
 * The visitor's language choice lives in `localStorage` (client side) and is
 * mirrored into a cookie so that server-rendered pages — the blog listing and
 * the article pages — can serve the right language on the first paint.
 */

/** Cookie name shared by the locale provider and the language switcher. */
export const LOCALE_COOKIE = "titrit-locale";

/** One year, in seconds. */
export const LOCALE_COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

/** Read the locale cookie, or `null` when it is absent. */
export function readLocaleCookie(): string | null {
	if (typeof document === "undefined") return null;
	const prefix = `${LOCALE_COOKIE}=`;
	for (const part of document.cookie.split(";")) {
		const entry = part.trim();
		if (entry.startsWith(prefix)) {
			return decodeURIComponent(entry.slice(prefix.length));
		}
	}
	return null;
}

/** Persist the locale cookie for a year, readable by the server on every request. */
export function writeLocaleCookie(locale: string): void {
	if (typeof document === "undefined") return;
	// biome-ignore lint/suspicious/noDocumentCookie: intentional locale cookie
	document.cookie = `${LOCALE_COOKIE}=${encodeURIComponent(locale)}; path=/; max-age=${LOCALE_COOKIE_MAX_AGE}; SameSite=Lax`;
}
