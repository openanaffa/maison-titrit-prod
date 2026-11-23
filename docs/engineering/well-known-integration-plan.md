# Well-known resources — integration plan

> Status: proposed · Scope: `web/public/`, `web/src/app/`, `web/next.config.ts`
> Follows up: robots.txt TDM reservations (release branch, 5383830).

## What we already have

| Resource | Status |
| --- | --- |
| `/robots.txt` | ✅ search + social allowed, 9 training crawlers explicitly reserved (`Disallow: /`) per Art. 4(3) DS / § 44b UrhG |
| `/.well-known/security.txt` | ✅ dedicated `security@` contact |
| `/llms.txt`, `/llms-full.txt` | ✅ dynamic routes, MD022-clean, reservation policy stated |
| `/feed.xml`, `/sitemap.xml` | ✅ |
| `X-Robots-Tag: noindex` headers | ✅ on `/makteb`, `/api`, `/compte`, `/checkout`, `/panier`, `/auth` (next.config.ts) |
| `/humans.txt` | ✅ |

## Phase 1 — TDMRep (W3C) — recommended next, small

Turn the legal TDM reservation into the full W3C machine-readable form ([TDMRep CG-FINAL 2024-05-10](https://www.w3.org/community/reports/tdmrep/CG-FINAL-tdmrep-20240510/)).
robots.txt only covers the 9 named bots; TDMRep covers every other TDM agent
(bot not in our list, EU-compliant miners, future crawlers).

1. **`web/public/.well-known/tdmrep.json`** — site-wide reservation, opt-out for everything:

   ```json
   [
     { "location": "/", "tdm-reservation": 1 }
   ]
   ```

2. **`TDM-Reservation: 1` HTTP header** on all HTML responses — the spec's *preferred*
   technique. Add a catch-all `source: "/:path*"` header in `next.config.ts` `headers()`,
   and keep it out of nothing (site-wide is the intent).
3. **`<meta name="tdm-reservation" content="1">`** in `web/src/app/layout.tsx` — belt and
   braces for pages consumed where headers are stripped (AMP-ish contexts, offline copies).
4. **Content-Type guard**: ensure `*.json` in `public/.well-known/` is served as
   `application/json` (static default already does) — verify with `curl -I`.
5. **LLMs.md / llms.txt**: add a line referencing `/.well-known/tdmrep.json` next to the
   robots.txt mention.

Verification: `curl -I https://maisontitrit.com/ | grep -i tdm` → `TDM-Reservation: 1`;
`curl https://maisontitrit.com/.well-known/tdmrep.json` → the JSON above; run
`bun run build` + `tsc` per the usual bar.

## Phase 2 — Stated protocol — optional, experimental

[Stated](https://stated.network/docs/stated_well_known.html) is a decentralized
"organizational statements" well-known (`/.well-known/statements.txt` +
`/.well-known/statements/` with SHA-256-named files). Honest assessment: it is niche
(advocacy coalitions, collective signatures), but it fits the brand's storytelling
(Amazigh heritage, made-in-Morocco authenticity) and it is nearly free to adopt
minimally.

1. Publish **one plain statement** (format version 5): a brand-authenticity /
   provenance statement ("Maison Titrit — 100% made in Morocco, atelier in
   Bouskoura; AI-training TDM reserved, see /robots.txt and /.well-known/tdmrep.json").
2. Static files under `web/public/.well-known/`:
   - `statements.txt` — the statement text (statements concatenated by blank lines)
   - `statements/<urlsafe-b64(sha256)>.txt` — the same content as its own file
   - `statements/index.txt` — one line listing that file name
3. Add a tiny Node/Bun script `web/scripts/stated-statement.mjs` that takes a text file
   and emits the hash-named file + regenerated `index.txt` (keeps future statements
   mechanical, no hand-computed hashes).
4. Mention in llms.txt "Public resources" if published.

Skip peer-replication machinery (peers/, attachments/) until there is an actual
counterparty — YAGNI.

## Phase 3 — Google Merchant Center / UCP — strategic watch item

[UCP in Merchant Center](https://developers.google.com/merchant/ucp/guides/merchant-center/overview)
is Google's agentic-commerce pilot (AI agents browsing → Google-mediated cart/checkout
through merchant endpoints). Today it is **US-only early access**, requires a Merchant
Center account and real API endpoints (create checkout, update shipping, complete
transaction). Not implementable for us yet; preparation is cheap though:

1. Create the **Merchant Center account** when feed quality is ready; `web/public/feed.xml`
   (RSS) exists, but Google Shopping wants a proper **product feed** (Google Merchant
   format) — a new route `/products.xml` (or Merchant Center JSON) generated from Prisma
   products is the concrete prep task.
2. COD-only checkout is the structural blocker for UCP "Buy now": Google's flow expects
   online payment. Revisit when (if) the shop adds card payments (CMI / Stripe Maroc).
3. When UCP expands beyond the US or the shop has online payments, follow the
   **Direct API integration** path (no Merchant Center hub needed).
4. Meanwhile keep `feed.xml`, `sitemap.xml` and product data (`GTIN`, sizes, prices in
   MAD) clean — that work is reusable by any future commerce integration.

## Phase 4 — ads.txt — not applicable (decision recorded)

[ads.txt](https://en.wikipedia.org/wiki/Ads.txt) authorizes resellers of the site's
*ad inventory*. Maison Titrit sells couture, not ads; no SSP/ad networks are used.
**Decision: do not create `/ads.txt`.** Revisit only if the site ever runs programmatic
advertising (an empty or absent ads.txt is then the correct state; a wrong one is not).

## Sequencing & effort

| Phase | Effort | Risk | When |
| --- | --- | --- | --- |
| 1 TDMRep | ~1h (3 files + header) | none (additive) | next commit on release branch |
| 2 Stated | ~2h incl. script | none (additive, tiny) | after phase 1 |
| 3 Merchant/UCP prep | ~1d (feed route) | low (new route only) | with the next storefront/SEO pass |
| 4 ads.txt | — | — | documented N/A |

## Verification bar (unchanged)

`tsc --noEmit -p web` + `bun run lint` 0/0 + `biome:check` + `next build` + `bun test`,
plus `curl -I` spot-checks of every new well-known resource on the Vercel preview before
release-branch merge.
