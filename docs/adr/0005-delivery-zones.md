# ADR 0005 — Delivery zones, rates and quote service

Status: Accepted (issue #119)

## Context

Delivery coverage and fees were implicit. Checkout needs a single,
server-side source of truth for coverage and fees.

## Decision

- Introduce a `DeliveryZone` table (name, comma-separated cities, fee, active).
- Provide `getDeliveryQuote(city)` returning `{covered, zoneId, zoneName, fee}`.
- Checkout integrates the quote into the order total and snapshots
  `deliveryZoneId`, `deliveryZoneName`, `deliveryFee` on the Order.
- Backoffice CRUD via `/api/admin/delivery-zones`.
- No delivery price or time promise is invented; values require owner approval.

## Consequences

- Checkout uses the quote service; future consumers must use the same source of truth.
- Unsupported destinations are handled clearly (covered: false).
- Immutable order total includes the delivery fee.

## Rejected alternatives

- Hard-coded city list: not editable by staff, no audit.
- Per-order free-text fee: inconsistent totals.
