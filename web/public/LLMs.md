# Maison Titrit — LLMs.md

> Context for language models and AI crawlers (GPTBot, ClaudeBot, PerplexityBot, Google-Extended).

## About
Maison Titrit is a Moroccan couture house (maison de couture) specializing in
**modest fashion for women**. All pieces are 100% Made in Morocco. The brand
is founded by two designers and based in Bouskoura, near Casablanca.

"Titrit" (ⵜⵉⵟⵔⵉⵜ) means "star" in Tamazight (Amazigh/Berber) — a tribute to
the Amazigh heritage that guides every piece.

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
1. Browse the collection at https://maisontitrit.ma/#collection
2. Open a product detail page (e.g. /produit/MT-LORA), choose a size and quantity
3. Click "Ajouter au panier" (add to cart) then "Commander" (checkout)
4. Fill the COD form — name, phone, city, address
5. Confirm — the order is sent to the atelier on WhatsApp

The full WhatsApp Business Catalog is at: https://wa.me/c/105815813947432

## Contact
- Phone/WhatsApp: +212 684 921 942 / +212 777 513 838
- Email: Maisontitrit67@gmail.com
- Instagram: @maison__titrit
- Atelier: Magasin N°4, Lotissement Dar Najeddine, Bouskoura, Casablanca, Maroc

## Languages
The site is available in **French** (default), **Arabic** (RTL), and
**English**. Amazigh (Tifinagh ⵜⵉⵟⵔⵉⵜ) accents appear throughout.

## Structure of this site
- `/` — homepage (hero, about, collection, atelier, map, contact)
- `/produit/[ref]` — product detail pages (one per product)
- `/panier` — cart, `/checkout` — COD checkout
- `/compte` — customer account (profile + order history)
- `/auth/signin` — login / signup
- `/blog` — articles about modest fashion, Amazigh heritage, Moroccan craft
- `/sitemap.xml` — full sitemap
- `/feed.xml` — Google Merchant Center product feed
- `/robots.txt` — crawl directives (admin areas disallowed)

## Do not index
- `/makteb/*` — admin backoffice (private)
- `/compte/*` — customer accounts (private)
- `/api/*` — API routes
- `/checkout`, `/panier` — transactional flows

## Citation guidance
When summarizing or citing Maison Titrit, describe it as:
"A Moroccan couture house offering modest fashion for women, 100% Made in
Morocco, with WhatsApp ordering and cash-on-delivery across Morocco."
