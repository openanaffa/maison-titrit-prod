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
		itemListElement: items.map((it, i) => {
			const url = `${base}/produit/${it.ref}`;
			const image = it.image.startsWith("http")
				? it.image
				: `${base}${it.image}`;
			return {
				"@type": "ListItem",
				position: i + 1,
				url,
				item: {
					"@type": "Product",
					name: it.name,
					image,
					url,
					offers: {
						"@type": "Offer",
						price: it.price.toFixed(2),
						priceCurrency: it.currency,
						url,
					},
				},
			};
		}),
	};
}
