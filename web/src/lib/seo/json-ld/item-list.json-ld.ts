import { baseUrl } from "@/config/site";

export function itemListJsonLd(
	items: {
		ref: string;
		name: string;
		image: string;
		price: number;
		currency: string;
	}[],
) {
	const base = baseUrl();
	return {
		"@context": "https://schema.org",
		"@type": "ItemList",
		name: "Collection Maison Titrit",
		itemListElement: items.map((it, i) => ({
			"@type": "ListItem",
			position: i + 1,
			url: `${base}/produit/${it.ref}`,
			name: it.name,
			image: it.image.startsWith("http") ? it.image : `${base}${it.image}`,
			price: `${it.price} ${it.currency}`,
		})),
	};
}
