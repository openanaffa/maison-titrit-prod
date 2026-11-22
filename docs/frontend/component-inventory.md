# Component Inventory — Maison Titrit

> Living document. Update on add/remove. Counts as of audit (develop `a9032d3`).

## 1. Primitives — `web/src/components/ui/` (57)

accordion, alert, alert-dialog, aspect-ratio, avatar, badge, breadcrumb, button, calendar, card, carousel, chart, checkbox, collapsible, command, context-menu, dialog, drawer, dropdown-menu, form, hover-card, input, input-otp, label, menubar, navigation-menu, pagination, popover, progress, radio-group, scroll-area, select, separator, sheet, sidebar, skeleton, slider, sonner, switch, table, tabs, textarea, toast, toaster, toggle, toggle-group, tooltip, types.

Status: shadcn new-york, Radix-based. Not yet audited for casual edits. Wrappers preferred.

## 2. Storefront compositions — `web/src/components/maison/` (~30)

about, announcement-bar, article-body, cart-drawer, category-icons, checkout-form, checkout-states, compte-client, contact-social, contact-support-page, craft-band, google-icon, header-account-button, header-mobile-menu, header-theme-toggle, hero, legal-page, map-section, motifs, product-card, product-catalogue, product-detail, product-gallery, product-purchase, product-purchase-actions, product-story, site-footer, site-header, skip-link, social-icons, supabase-auth-provider, titrit-logo, whatsapp-float.

## 3. Backoffice compositions — `web/src/components/admin/` (~27)

admin-shell, article-form, articles-table-client, categories-client, customer-360-client, customer-notes-client, customers-table-client, dashboard-client, fulfilment-queue-client, integrations-form, integrations-verification, inventory-table-client, legal-identity-form, marketing-client, order-detail-client, order-detail-dialog, order-detail-helpers, order-detail-sections, order-items-table, orders-table-client, product-form, product-image-gallery, products-table-client, settings-client, status-badge, tags-client, team-client.

## 4. PWA

- `web/src/components/pwa/sw-register.tsx` (prod-only registration).

## 5. Hooks

- `use-mobile`, `use-toast`.
- `hooks/api/*`: announcement, articles, catalogue, categories, compte, integrations, legal-identity, orders, products, users.

## 6. Gaps vs. requested library

Missing documented reusable blocks:
- Product gallery viewer (lightbox) — partial in `product-gallery`.
- Variant/size selector — inline in `product-purchase`.
- SearchBar / FilterBar — not extracted.
- DataTable (admin uses tanstack table inline in each table client).
- Install PWA prompt — none.
- Offline/connectivity indicator — none.
- Command menu (cmdk present but no shared wrapper).
- Standardized empty/loading/error states — ad hoc.
- Inventory adjustment dialog — inline.
- Customer/order detail panels — inline in table clients.

## 7. Action

Extract and document the missing compositions in dedicated milestones (TODO M3/M7). Prefer composition over new primitives.