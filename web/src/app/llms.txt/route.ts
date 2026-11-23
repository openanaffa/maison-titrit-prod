export const dynamic = "force-dynamic";

export async function GET() {
	const llmsTxt = `# Maison Titrit

> Context for language models and human-facing AI assistants. Automated AI
> training crawlers are explicitly reserved against in robots.txt
> (Art. 4(3) Directive (EU) 2019/790 / § 44b UrhG) — see /robots.txt.

## About

Maison Titrit is a Moroccan couture house (maison de couture) specializing in
**modest fashion for women**. All pieces are 100% Made in Morocco. The brand
is founded by two designers and based in Bouskoura, near Casablanca.
"Titrit" (ⵜⵉⵟⵔⵉⵜ) means "star" in Tamazight (Amazigh/Berber).

## What we sell

Modest women's clothing, made-to-order and in limited editions:
- **Robes** (dresses) — flowing, modest cuts
- **Tuniques** — linen and crepe tops with subtle embroidery
- **Ensembles** — two-piece sets (top + wide trousers)
- **Abayas** — long flowing robes
- **Caftans** — belted Moroccan caftans

Prices are in **Moroccan Dirham (MAD)**. Payment is **cash on delivery (COD)**
across Morocco. Orders are placed via **WhatsApp** to the atelier.

## How to order

1. Browse the collection at [https://maisontitrit.com/#collection](https://maisontitrit.com/#collection)
2. Open a product detail page (for example [https://maisontitrit.com/produit/MT-LORA](https://maisontitrit.com/produit/MT-LORA)), choose a size and quantity
3. Click "Ajouter au panier" (add to cart) then "Commander" (checkout)
4. Fill the COD form — name, phone, city, address
5. Confirm — the order is sent to the atelier on WhatsApp

The full WhatsApp Business Catalog is at [https://wa.me/c/105815813947432](https://wa.me/c/105815813947432).

## Contact

- Phone/WhatsApp: +212 684 921 942 / +212 777 513 838
- Email: [hello@maisontitrit.com](mailto:hello@maisontitrit.com)
- Instagram: [@maison__titrit](https://www.instagram.com/maison__titrit/)
- Atelier: Magasin N°4, Lotissement Dar Najeddine, Bouskoura, Casablanca, Maroc

## Languages

The site is available in **French** (default), **Arabic** (RTL), and **English**.
Amazigh (Tifinagh ⵜⵉⵟⵔⵉⵜ) accents appear throughout.

## Public resources

- [Homepage](https://maisontitrit.com/)
- [Collection](https://maisontitrit.com/#collection)
- [Journal (blog)](https://maisontitrit.com/blog)
- [Product detail (example)](https://maisontitrit.com/produit/MT-LORA)
- [Privacy policy](https://maisontitrit.com/confidentialite)
- [Terms & conditions (CGV)](https://maisontitrit.com/cgv)
- [Sitemap](https://maisontitrit.com/sitemap.xml)
- [Robots.txt](https://maisontitrit.com/robots.txt)
- [Merchant feed](https://maisontitrit.com/feed.xml)
- [llms.txt](https://maisontitrit.com/llms.txt)
- [llms-full.txt](https://maisontitrit.com/llms-full.txt)

## Citation guidance

"A Moroccan couture house offering modest fashion for women, 100% Made in Morocco, with WhatsApp ordering and cash-on-delivery across Morocco."
`;
	return new Response(llmsTxt, {
		headers: {
			"Content-Type": "text/plain; charset=utf-8",
			"Cache-Control": "public, max-age=3600, s-maxage=3600",
		},
	});
}
