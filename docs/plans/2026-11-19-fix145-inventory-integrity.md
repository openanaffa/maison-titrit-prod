# #145 follow-up — commerce integrity fixes

Codex findings on the production release PR #145 that were left
unresolved by the subsequent merges. Both are verified against
`develop` (`3463e97`).

## Finding A — variant inventory bypassed at checkout

**Evidence:** `web/src/app/api/checkout/route.ts` L113–L160.

`findFirst({ productId, size, color: null })` — when a size-bearing
product has variant rows but none matching the requested size (e.g. the
product only carries a default null-size variant), the lookup misses and
control falls into the legacy branch `else if (!product.inStock)`, so a
size-bearing order can complete with **no variant reservation** and
`OrderItem.variantId = null`, silently bypassing per-variant inventory
(ADR 0002).

**Fix:** count the product's variant rows. If any exist but none matched
the requested size → reject `OUT_OF_STOCK` (per-variant enforcement).
The legacy fallback to `product.inStock` remains only for products with
**zero** variant rows (e.g. MT-YASMINE), which is the documented
migration-on-demand path.

## Finding B — order transitions never settle reservations

**Evidence:** `web/src/lib/order-status.ts::transitionOrder` updates
status/payment/fulfilment + audit history but never touches the ledger.
`commitStock` (`web/src/lib/inventory.ts` L261, movement type COMMIT) has
**zero call sites** in app code; `releaseReservation` is only called from
checkout's own compensation paths.

Consequences: a cancelled order keeps its stock held forever
(phantom reserved); a delivered order never converts its hold into a
stock decrement (onHand overstated).

**Fix:** `web/src/lib/inventory-settlement.ts` —
`settleOrderReservations(orderId, toStatus, actorId)`:

- Locate the order's reservation movements via the reservation ledger
  convention: `StockMovement.type = "RESERVE"`, `idempotencyKey`
  starting with `checkout:${order.idempotencyKey}:reserve:`
  (quantity = +qty held, variantId per row).
- A reservation is *active* when no movement exists with
  `${key}:release`, `${key}:release-lifecycle` or `${key}:commit`.
- On `CANCELLED` → `releaseReservation` with idempotencyKey
  `${key}:release-lifecycle`, `sourceRef: "order-lifecycle"`.
- On `DELIVERED` → `commitStock` with idempotencyKey
  `${key}:commit-lifecycle`, `sourceRef: "order-lifecycle"`.
- All calls idempotent by the movement-unique idempotencyKey, so
  re-running settlement (including on the same-status PATCH short-circuit
  path in the admin route) is safe.

Wiring: `transitionOrder` awaits settlement after the transition
commits (CANCELLED/DELIVERED only); the admin PATCH route also invokes it
on the same-status early return so a previously failed settlement can be
re-triggered by re-saving the status.

Out of scope (tracked): RETURNED return-to-stock movements; Wafine
lifecycle messaging (#123–#125).
