/** SEO metadata shapes shared by the page metadata builder. */

export type OpenGraphT = "website" | "article" | "product" | "profile";

export type PageMetaInput = {
	title: string;
	description: string;
	/** Path beginning with / (or full URL). Defaults to "/" */
	path?: string;
	/** OG image path (default: /og-default.png) */
	image?: string;
	ogType?: OpenGraphT;
	/** ISO date string for articles */
	publishedTime?: string;
	/** ISO date string for articles */
	modifiedTime?: string;
	/** For articles */
	author?: string;
	/** keywords */
	keywords?: string[];
	/** noindex / nofollow for private/low-value pages */
	noIndex?: boolean;
	/**
	 * Open Graph locale (e.g. fr_MA, ar_MA, en_US). Defaults to fr_MA.
	 * Single-URL cookie-locale model: this describes content locale metadata,
	 * not a locale-specific URL.
	 */
	locale?: string;
};
