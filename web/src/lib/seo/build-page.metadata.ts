import type { Metadata } from "next";
import { baseUrl, DEFAULT_OG, site } from "@/config/site";
import type { PageMetaInput } from "@/lib/types";

export function buildPageMetadata(input: PageMetaInput): Metadata {
	const base = baseUrl();
	const path = input.path ?? "/";
	const url = path.startsWith("http") ? path : `${base}${path}`;
	const imgUrl = input.image
		? input.image.startsWith("http")
			? input.image
			: `${base}${input.image}`
		: `${base}${DEFAULT_OG}`;

	const ogType: "website" | "article" | "profile" =
		input.ogType === "article"
			? "article"
			: input.ogType === "profile"
				? "profile"
				: "website";

	return {
		title: input.title,
		description: input.description,
		keywords: input.keywords,
		alternates: { canonical: url },
		openGraph: {
			title: input.title,
			description: input.description,
			url,
			siteName: site.name,
			type: ogType,
			locale: input.locale ?? "fr_MA",
			images: [
				{
					url: imgUrl,
					width: 1200,
					height: 630,
					alt: input.title,
				},
			],
			...(input.publishedTime ? { publishedTime: input.publishedTime } : {}),
			...(input.modifiedTime ? { modifiedTime: input.modifiedTime } : {}),
		},
		twitter: {
			card: "summary_large_image",
			site: "@maison__titrit",
			creator: "@maison__titrit",
			title: input.title,
			description: input.description,
			images: [imgUrl],
		},
		robots: input.noIndex
			? { index: false, follow: false }
			: {
					index: true,
					follow: true,
					"max-snippet": -1,
					"max-image-preview": "large",
					"max-video-preview": -1,
				},
	};
}
