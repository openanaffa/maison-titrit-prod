# ADR 0003 — Transactional, idempotent checkout and order creation

Status: Accepted (issue #117)

## Context

The previous checkout created an order in a single `db.order.create` with no
idempotency guard and no inventory effect. Duplicate submissions could create
duplicate orders, and there was no reservation/commit boundary.

## Decision

- Add an optional, unique `idempotencyKey` to `Order`. Replaying the same key
  returns the existing order instead of creating a duplicate.
- Checkout validates prices, sizes and availability server-side (already) and
  additionally resolves a `ProductVariant` per cart line; when a variant exists
  it reserves stock via the inventory service (with per-line idempotency keys).
- Order creation and any reservation are wrapped so that a failure releases
  already-made reservations (compensation). An idempotency-key collision on
  insert resolves to the existing order.
- Order items snapshot `variantId`, `sku`, `ref`, `name`, `price`, `quantity`,
  `size`, `color`.
- A `PENDING` order reserves stock; commit/release happen on state transitions
  (handled in #118).

## Consequences

- Duplicate submissions create one order.
- Failed transactions do not leave partial orders or leaked reservations.
- Historical and new order items retain full snapshots.

## Rejected alternatives

- Committing stock at checkout: would oversell if the order is later cancelled;
  reservation + commit-on-confirmation is safer.
