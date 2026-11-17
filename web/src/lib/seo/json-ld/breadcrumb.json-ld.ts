import { baseUrl } from "@/config/site";

export function breadcrumbJsonLd(items: { name: string; path: string }[]) {
	const base = baseUrl();
	return {
		"@context": "https://schema.org",
		"@type": "BreadcrumbList",
		itemListElement: items.map((it, i) => ({
			"@type": "ListItem",
			position: i + 1,
			name: it.name,
			item: it.path.startsWith("http") ? it.path : `${base}${it.path}`,
		})),
	};
}
