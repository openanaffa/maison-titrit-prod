# #121 — Fulfilment queue and delivery operations in Makteb

Parent: #112 (M2). Depends on #117 ✅ (merged #137) and #119 ✅ (merged #143).

## Verified current state (audit evidence)

| Building block | Location | Status |
|---|---|---|
| Validated state machine (transitions, reason, audit) | `web/src/lib/order-status.ts` — `transitionOrder(orderId, to, {actorId, reason})`, `isAllowedTransition`, `ALLOWED_TRANSITIONS`, `getOrderStatusHistory` | ✅ exists (ADR 0004) |
| Order admin PATCH route | `web/src/app/api/admin/orders/[id]/route.ts` — accepts `{status}` only; `transitionOrder` already supports `reason` but the route does not pass it | ⚠️ extend |
| Orders listing | `web/src/lib/repositories/orders.ts` — `listOrders(supabase, {status?, search?})` (single status, no date filter, no queue grouping) | ⚠️ extend |
| Orders admin page | `web/src/app/makteb/orders/page.tsx` + `order-detail-client.tsx` (`StatusSelector` uses `ALLOWED_TRANSITIONS`) | reuse pattern |
| Notifications | `web/src/lib/notify.ts` — staff email (SMTP) + **Wafine staff WhatsApp** `POST {WAFINE_API_URL}/api/sessions/{id}/messages/send-text`, header `X-API-Key`, body `{chatId, text}`, expects HTTP 201. No customer notifications exist. No persistence of attempts. | ⚠️ extend |
| Order delivery fields | `deliveryZoneId`, `deliveryZoneName`, `deliveryFee` — no provider/reference columns | ⚠️ add |
| RBAC | `web/src/lib/roles.ts` — `orders:write` = FOUNDER/DEVELOPER/ADMIN; `orders:read` = all staff | reuse |
| i18n | `web/src/i18n/dictionaries/lang/{fr,ar,en}.ts` | extend |

## Design

### 1. Work queues (`/makteb/fulfilment`)
Server page (pattern: `makteb/orders/page.tsx`) with tabbed queues derived from the
state machine (no new status values):

| Queue | Statuses |
|---|---|
| To confirm | `PENDING` |
| To prepare | `CONFIRMED` |
| To dispatch | `PROCESSING` |
| In transit | `DISPATCHED` (delivery provider/reference visible) |
| Delivered / returns | `DELIVERED`, `RETURN_REQUESTED`, `RETURNED` |
| Exceptions | `CANCELLED` (last 30 days) |

Search: order number (`MT-%`), customer phone (`contains`, digits-normalized),
date range (`from`/`to` query params). Repo extension:
`listFulfilmentOrders(supabase, {statuses[], search, phone, from, to})` — one
indexed query, no N+1 (items counted in the same select as today).

### 2. Validated transitions with reason capture
- Extend `PATCH /api/admin/orders/[id]` body: `{ status, reason?, deliveryProvider?, deliveryReference? }`.
- Route passes `reason` into `transitionOrder` opts (already audited via
  `OrderStatusHistory` with actor + reason).
- Queue rows render `StatusSelector`-style inline actions constrained by
  `ALLOWED_TRANSITIONS`; `PENDING→CONFIRMED` (accept), `CONFIRMED→PROCESSING`
  (start preparing), `PROCESSING→DISPATCHED` (dispatch, requires delivery
  provider/reference when the zone has a delivery provider), `DISPATCHED→DELIVERED`.
- Duplicate actions safe: transition to the same status is a no-op; illegal
  transitions are rejected server-side by `isAllowedTransition`.

### 3. Delivery provider/reference (only where operationally used)
- Add `deliveryProvider String?` + `deliveryReference String?` to `Order` in
  **both** schemas (lockstep rule) → live DB via `prisma db push` (session-pooler
  5432; documented in the learning trail), regenerate `database.types.ts`
  (`bun run db:types`).
- Captured at dispatch time; displayed in the queue and detail view.

### 4. Customer notifications with retry visibility
- New `OrderNotification` model: `{ id, orderId, event, channel, to, status
  (SENT|FAILED|PENDING), attempts, lastError, lastAttemptAt, createdAt }`.
- `notifyCustomerOrderUpdate(order, event)` — events `CONFIRMED`,
  `DISPATCHED`, `DELIVERED`; channels: email (customer email optional — skip
  when absent), WhatsApp via the verified Wafine contract (`chatId =
  <digits>@c.us`, digits-normalized phone).
- Fired from the transition route *after* commit; failure never blocks the
  transition. Retry = re-run with the same `OrderNotification` row
  (attempts++, lastError) via a staff-only retry endpoint.
- Queue badge shows failed/retrying notification counts (retry visibility).

### 5. Security
- All new endpoints behind `requirePermission("orders:write")` /
  `orders:read`; no customer PII in list payloads beyond what exists today.
- `OrderNotification` table: RLS enabled, staff-only read; writes only via
  service role (Prisma).
- Wafine credentials stay server-side (env only, never returned).

## Phases (each = one commit)
1. Schema: Order delivery fields + OrderNotification model (both schemas, db:types, live db push) + migration note.
2. Repo + API: `listFulfilmentOrders` filters + PATCH route reason/delivery fields.
3. Notifications: `notifyCustomerOrderUpdate` + persistence + retry endpoint.
4. UI: `/makteb/fulfilment` queue page (tabs, search, actions, retry badges), nav entry, i18n FR/AR/EN.
5. Tests: transitions w/ reason + duplicate safety, notification retry state, queue filters.

## Acceptance mapping (issue #121)
- Queues for unconfirmed/confirmed/preparing/dispatched/exceptions → §1.
- Search by number/phone/date → §1.
- Validated transitions with reason capture → §2 (uses ADR-0004 machine).
- Delivery provider/reference where operationally used → §3.
- Customer notification triggers with retry visibility → §4.
- Duplicate actions safe + audited → §2 (`transitionOrder` + history).
- Mobile/tablet layout → §4 (existing makteb responsive patterns).

## Out of scope
- Wafine *customer conversation* lifecycle (that is #125 — two-way messaging,
  takeover). Only one-way outbound notifications here.
- E2E suite (#126) — separate.

## 📌 Evidence for #123 (Wafine contract discovery)
Verified in-code contract from `lib/notify.ts`:
`POST {WAFINE_API_URL}/api/sessions/{WAFINE_SESSION_ID}/messages/send-text`,
headers `X-API-Key: WAFINE_API_KEY`, body `{chatId: "<digits>@c.us", text}`,
success = HTTP 201, timeout 5s. To be validated against Wafine's owner/docs in #123.
