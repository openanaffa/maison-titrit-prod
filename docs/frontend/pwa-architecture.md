# PWA Architecture — Maison Titrit

## 1. Installability

- Manifest: `public/site.webmanifest`, linked from `<head>`.
- Required: name, short_name, start_url, scope, display, background/theme color, icons (maskable 192/512).
- Planned enhancements: screenshots, shortcuts, categories, lang/dir, separate `any`/`maskable` icon variants (TODO M7).
- Custom install UX: `beforeinstallprompt` handler + install button + iOS instructions (TODO M7). Do not assume every browser exposes the event.

## 2. Service worker (`public/sw.js`)

Current: custom, versioned caches (`mt-sw-v1`), activate cleans old caches, `skipWaiting`, `clients.claim`.

Strategies:
- `/_next/static/*`: cache-first.
- Public assets (png/jpg/svg/woff/css/js/json/webmanifest): stale-while-revalidate.
- Navigations: network-first, cache fallback, then `/` shell, then 503 text.
- Private prefixes (`/api/`, `/makteb`, `/compte`, `/checkout`, `/panier`, `/auth`) and RSC/router-prefetch requests: bypass.
- Cross-origin: bypass.

Planned:
- Offline fallback page (instead of 503 text).
- Update-available + reload UX; `controllerchange` handling.
- Evaluate Workbox/Serwist for maintainability (TODO M8).
- No auth/PII caching (already enforced; audit quarterly).

## 3. Offline capabilities

Available offline: app shell, cached static assets, previously viewed public catalogue/blog, offline info page, non-sensitive preferences.
Restricted offline: checkout/order confirmation, inventory adjustments, payment/status changes, auth-sensitive ops, customer PII/admin records.
Never claim success while offline. Queued operations use explicit pending states, idempotency, conflict handling, server confirmation (TODO M9).

## 4. Synchronization

- Detect online/offline transitions (`navigator.onLine` + events).
- Show connectivity state (planned indicator).
- Revalidate stale content after reconnect.
- Retry failed requests; prevent duplicate submissions (idempotency keys already used in checkout).
- Preserve safe user input where possible.

Background Sync only where supported; always provide foreground retry fallback.

## 5. Notifications (planned)

See TODO M10. Permission requested only after explicit user action with explanation. Distinguish in-app / browser / Web Push. Store subscriptions securely; protect endpoints; never expose VAPID private key. Handle expired subscriptions and delivery failures. Email remains the fallback channel.