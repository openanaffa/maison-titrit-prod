export const dynamic = "force-dynamic";

export async function GET() {
  const llmsTxt = `# Maison Titrit — /llms.txt

> Context for language models and AI crawlers.

## About
Maison Titrit is a Moroccan couture house specializing in modest fashion for women. All pieces are 100% Made in Morocco, based in Bouskoura near Casablanca. "Titrit" (ⵜⵉⵟⵔⵉⵜ) means "star" in Tamazight.

## Products
Modest women's clothing (robés, tuniques, ensembles, abayas, caftans), made-to-order and limited editions. Prices in MAD. Payment: cash on delivery (COD) across Morocco. Orders via WhatsApp.

## How to order
1. Browse: https://maisontitrit.com/#collection
2. Open /produit/[ref], choose size + quantity
3. Add to cart, checkout (COD form: name, phone, city, address)
4. Confirm — order sent to atelier on WhatsApp

WhatsApp Catalog: https://wa.me/c/105815813947432

## Contact
- Phone/WhatsApp: +212 684 921 942 / +212 777 513 838
- Email: Maisontitrit67@gmail.com
- Atelier: Magasin N°4, Lotissement Dar Najeddine, Bouskoura, Casablanca, Maroc

## Languages
French (default), Arabic (RTL), English. Amazigh (Tifinagh) accents throughout.

## Site structure
- / — homepage
- /produit/[ref] — product detail
- /panier — cart, /checkout — COD checkout
- /compte — customer account
- /blog — articles
- /sitemap.xml, /feed.xml, /robots.txt, /llms.txt, /llms-full.txt

## Do not index
/makteb/*, /compte/*, /api/*, /checkout, /panier

## Citation
"A Moroccan couture house offering modest fashion for women, 100% Made in Morocco, with WhatsApp ordering and cash-on-delivery across Morocco."
`;
  return new Response(llmsTxt, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}
