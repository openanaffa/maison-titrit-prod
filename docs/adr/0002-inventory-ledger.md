# ADR 0002 — Inventory ledger, reservations and atomic stock updates

Status: Accepted (issue #116)

## Context

After #115, each sellable unit is a `ProductVariant`, but there is still no
quantity tracking, no audit trail and no concurrency-safe reservation. The
previous model only had a boolean `inStock`.

## Decision

- Add `onHand`, `reserved`, `lowStockThreshold` and an optimistic-concurrency
  `version` column to `ProductVariant`. Available stock is computed as
  `onHand - reserved` (never stored, to avoid drift).
- Introduce a `StockMovement` ledger: every stock change writes an immutable
  row capturing type, signed quantity, resulting on-hand/reserved, reason,
  actor, source reference and an optional idempotency key.
- Movement types: RECEIVE, ADJUST, DAMAGE, RETURN, RESERVE, RELEASE, COMMIT.
- Atomicity uses optimistic concurrency (`version` guard with bounded retries)
  via Prisma interactive transactions, so the same code works on SQLite (dev)
  and Postgres (prod) without provider-specific locking.
- Idempotency is enforced by a unique `idempotencyKey` on `StockMovement`.

## Consequences

- Concurrent checkouts cannot oversell: reservation fails when available < qty.
- Failed/expired checkouts release reservations (RELEASE).
- Order confirmation commits stock (COMMIT: on-hand and reserved both drop).
- Reconciliation compares stored values to the last movement's after-values.

## Rejected alternatives

- Postgres `SELECT ... FOR UPDATE` row locking: not portable to SQLite dev;
  optimistic versioning keeps one code path.
- Redis for reservations: rejected per roadmap guardrail until a measured
  bottleneck exists.
