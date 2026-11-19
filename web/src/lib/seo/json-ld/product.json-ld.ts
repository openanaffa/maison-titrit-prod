import { baseUrl, site } from "@/config/site";

export function productJsonLd(p: {
	ref: string;
	name: string;
	description: string;
	image: string;
	price: number;
	salePrice?: number | null;
	currency: string;
	category?: string;
	inStock?: boolean;
}) {
	const base = baseUrl();
	const price = p.salePrice ?? p.price;
	const url = `${base}/produit/${p.ref}`;
	return {
		"@context": "https://schema.org",
		"@type": "Product",
		"@id": url,
		url,
		name: p.name,
		description: p.description,
		image: p.image.startsWith("http") ? p.image : `${base}${p.image}`,
		sku: p.ref,
		brand: { "@type": "Brand", name: site.name },
		...(p.category ? { category: p.category } : {}),
		offers: {
			"@type": "Offer",
			url,
			price: price.toFixed(2),
			priceCurrency: p.currency,
			availability:
				p.inStock === false
					? "https://schema.org/OutOfStock"
					: "https://schema.org/InStock",
			itemCondition: "https://schema.org/NewCondition",
			seller: { "@id": `${base}/#store` },
		},
	};
}
