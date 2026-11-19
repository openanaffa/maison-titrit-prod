# ADR 0004 — Order, payment and fulfilment state transitions

Status: Accepted (issue #118)

## Context

Order status was a single free-text `status` field with loose updates via
`updateStatus`. Invalid transitions were possible and there was no audit trail.

## Decision

- Keep `status` as the overall order status but expand the allowed values:
  PENDING, CONFIRMED, PROCESSING, DISPATCHED, DELIVERED, CANCELLED,
  RETURN_REQUESTED, RETURNED.
- Add separate `paymentStatus` (UNPAID/PAID/REFUNDED) and `fulfilmentStatus`
  (UNFULFILLED/PROCESSING/SHIPPED/DELIVERED/RETURNED) columns.
- Introduce an `OrderStatusHistory` audit table recording from/to status,
  payment/fulfilment status, actor, reason and timestamp.
- Centralise transitions in `web/src/lib/order-status.ts` with an explicit
  `ALLOWED_TRANSITIONS` map; `transitionOrder` validates and writes history
  inside a transaction. The admin PATCH route rejects invalid transitions with
  409.

## Consequences

- Invalid transitions are rejected server-side.
- Every transition is auditable.
- Payment and fulfilment state are derived deterministically from order status.

## Rejected alternatives

- A single combined status: cannot distinguish payment collection from
  delivery, needed for COD reconciliation.
- Database-level enum: SQLite compatibility (string pseudo-enums).
