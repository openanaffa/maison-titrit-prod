# TODO — Entities / Types Centralization & Deduplication

Goal: single source of truth for every TypeScript type/interface, extracted from
inline/component-local definitions into a small set of focused modules under
`web/src/lib/types/`, using generics + mapped types where shapes overlap.

**Status:** inventory done. No code changed yet (planning artifact).
**Verification bar (AGENTS.md):** `tsc --noEmit` · `lint` 0/0 · `next build` · `bun test`.

---

## 1. Method

- Declarations discovered by scanning `web/src` for line-anchored `type`/`interface`
  (import-list mentions excluded): **114 declarations / 108 unique names**.
- References counted per name across `web/src`; top consumer files listed.
- A type is *centralized* when it has ≥2 consumers OR belongs to a domain that is
  shared (orders, products, articles, auth, i18n, seo).
- A type stays *colocated* when it is private implementation detail of one component
  and has 1 file / ≤2 references (e.g. carousel internals) — extracting those is YAGNI.

Legend: **refs** = occurrences outside its own declaration line; **files** = distinct
files that mention it.

---

## 2. Inventory (unique names, by domain)

### 2.1 i18n / content
| Type | Current location | refs | files | Referenced in (top) | Candidate location | Refactoring |
|---|---|---:|---:|---|---|---|
| `Locale` | `i18n/dictionaries/index.ts:15` | 48 | 12 | language-switcher, legal-docs, locale-cookie, locale-provider, config/articles | keep `i18n/dictionaries/index.ts` | canonical already; make other modules import it (done for `SiteLocale`) |
| `LegalDocKey` | `i18n/legal-docs.ts:17` | 4 | 2 | `components/maison/legal-page.tsx` | keep `i18n/legal-docs.ts` | fine |
| `LegalSection`, `LegalDoc` | `i18n/legal-docs.ts:19,24` | 2 | 1 | internal | keep | fine |
| `Dict` | `i18n/dictionaries/index.ts:30` | 2 | 1 | internal | keep | export if needed by lang/*.ts |
| `EditorialCategory`, `SeedArticle` | `config/articles.ts:4,6` | 2–7 | 1 | seed scripts | `lib/types/content.ts` | extract seed-only types out of runtime config |
| `CampaignPlatform`, `PlatformDraft`, `CampaignDraft` | `config/seed-campaign.ts` | 5–6 | 1 | seed scripts | `lib/types/content.ts` | same |

### 2.2 Orders / account
| Type | Current location | refs | files | Referenced in (top) | Candidate location | Refactoring |
|---|---|---:|---:|---|---|---|
| `Order` | `lib/types/order/order.d.ts:12` | 29 | 14 | compte, makteb pages, API | keep `lib/types/order/order.ts` | rename `.d.ts`→`.ts` |
| `OrderItem` | `lib/types/order/order.d.ts:6` | 8 | 7 | compte, orders pages | keep | fine |
| `BaseOrderEntity`, `BaseEntity` | `order.d.ts:3`, `base/entity.d.ts:1` | 2–3 | 1–2 | internal | keep `base/entity.d.ts` | fine |
| `OrderView`, `OrderItemView`, `OrderViewD` | `order.d.ts:75,63,29` | 1–6 | 1–3 | order-detail-client | keep | `OrderViewD` dead (1 self-ref) → delete |
| `OrderUtmRow` | `order.d.ts:18` | 7 | 3 | marketing | keep | fine |
| `OrderRow` | `supabase/database.types.ts:59` **and** `types/order/order.d.ts:98` | 14 | 6 | orders-table-client | **`lib/types/order/order.ts`** | **DEDUP** — unify, re-export from `database.types.ts` or drop there |
| `OrderItemRow` | `supabase/database.types.ts:82` | 2 | 1 | internal | keep | fine |
| `CompteUser` | `lib/types/index.ts:146` | 3 | 2 | compte-client | keep | fine |
| `Row` | `lib/types/index.ts:38` | 8 | 3 | products-table, database.types | keep | overlaps `ProductRow` — reconcile in product extraction |

### 2.3 Products / catalogue / admin forms
| Type | Current location | refs | files | Referenced in (top) | Candidate location | Refactoring |
|---|---|---:|---:|---|---|---|
| `ProductDTO` | `lib/products.ts:6` | 13 | 5 | produit page, cards, detail | keep `lib/products.ts` | canonical |
| `ProductWithRelations` | `lib/products.ts:28` | 2 | 1 | internal | keep | fine |
| `ProductRow` | `supabase/database.types.ts:30` | 7 | 3 | admin products API | keep | align with `Row` |
| `ImageRow`, `CategoryRow` | `database.types.ts:50,21` | 4–6 | 2–3 | admin APIs | keep | fine |
| `ProductFormValues`, `ProductFormImage` | `lib/types/index.ts:53,52` | 4–9 | 2–4 | product-form, new/edit pages | keep | fine |
| `ArticleFormValues`, `ArticleTableRow` | `lib/types/index.ts:118,110` | 5–10 | 2–4 | article-form, blog pages | keep | fine |
| `ArticleRow` | `database.types.ts:93` | 5 | 2 | admin articles API | keep | fine |
| `Category` | `lib/types/index.ts:109` | 21 | 14 | admin categories/products | keep | fine |
| `TeamUser`, `AdminUser`, `AdminNavItem` | `lib/types/index.ts:29,139,129` | 3 | 2 | admin-shell, team-client | keep | fine |
| `Stat`, `RecentOrder` | `lib/types/index.ts:91,100` | 3–4 | 2 | dashboard-client | keep | fine |
| `ErrorParams` | `lib/types/index.ts:140` | 4 | 2 | auth-error-client | keep | fine |
| `MarketingData` | `lib/types/index.ts:75` | 5 | 3 | marketing page/client | keep | fine |
| `PageMetaInput`, `OpenGraphT` | `lib/types/index.ts:8,6` | 2–3 | 1–2 | seo build-page.metadata | keep | fine |
| `AnalyticsForm`, `VerificationForm` | `lib/types/index.ts:83,84` | 3–4 | 2 | settings/constants | keep | fine |
| `DaysT` | `lib/types/constants.ts:34` | 2 | 2 | settings-client | keep | fine |
| `CatalogCategory`, `CatalogImage`, `CatalogProduct` | `config/products.ts:12,19,21` | 2–3 | 1 | seed data | `lib/types/content.ts` | extract seed-only types |

### 2.4 Auth / RBAC
| Type | Current location | refs | files | Referenced in (top) | Candidate location | Refactoring |
|---|---|---:|---:|---|---|---|
| `Permission` | `lib/roles.ts:55` | 9 | 4 | session, admin-shell | keep `lib/roles.ts` | fine |
| `Role` | `lib/roles.ts:6` | 9 | 3 | users API, roles | keep | fine |
| `AuthenticatedUser` | `lib/supabase/auth-client.ts:7` | 4 | 2 | supabase-auth-provider | keep | fine |
| `AuthState` | `components/maison/supabase-auth-provider.tsx:11` | 3 | 1 | private | keep (component-local) | YAGNI to extract |
| `Ctx` | `i18n/locale-provider.tsx:16` | 3 | 1 | private | keep | fine |

### 2.5 Analytics / tracking / consent
| Type | Current location | refs | files | Referenced in (top) | Candidate location | Refactoring |
|---|---|---:|---:|---|---|---|
| `ConsentState` | `lib/analytics.ts:12` | 10 | 1 | internal | `lib/types/analytics.ts` | extract + share |
| `Listener`, `ServerLegs` | `lib/analytics.ts:28,188` | 3 | 1 | internal | `lib/types/analytics.ts` | fine |
| `ConsentCategory` | `config/site.ts:159` (+ `lib/analytics.ts:8` import) | 3 | 2 | analytics | **dedupe** — one definition (`lib/types/analytics.ts`), site re-exports |
| `ConsentFlag`, `TrackItem`, `TrackPayload`, `LegResult` | `lib/types/tracking.ts` | 3–6 | 2 | track route | keep (already extracted) | fine |

### 2.6 Commerce helpers (lib)
| Type | Current location | refs | files | Referenced in (top) | Candidate location | Refactoring |
|---|---|---:|---:|---|---|---|
| `CartItem`, `CartState` | `lib/cart.ts:10,21` | 4–5 | 1 | internal | keep `lib/cart.ts` | fine |
| `CartLineInput`, `PricedProduct`, `PricedLine`, `PricingResult` | `lib/checkout.ts` | 2–4 | 1–2 | checkout + tests | keep `lib/checkout.ts` | fine |
| `StaffOrderPayload`, `EmailTemplate` | `lib/email-templates.ts:4,12` | 3–5 | 1–2 | notify | `lib/types/notifications.ts` | extract |
| `UploadResult` | `lib/storage.ts:17` | 4 | 1 | internal | keep | fine |
| `AnalyticsConfig`, `CustomMeta`, `VerificationConfig`, `Integrations` | `lib/integrations.ts` | 3–5 | 1–2 | settings-client | `lib/types/integrations.ts` | extract |

### 2.7 Routing / misc
| Type | Current location | refs | files | Referenced in (top) | Candidate location | Refactoring |
|---|---|---:|---:|---|---|---|
| `Params` (slug) | `app/(site)/blog/[slug]/page.tsx:13` | 12 | 4 | blog page | `lib/types/route-params.ts` | **DEDUP** with produit variant |
| `Params` (ref) | `app/(site)/produit/[ref]/page.tsx:14` | 12 | 4 | produit page | `lib/types/route-params.ts` | **DEDUP** — use `SlugParams`/`RefParams` |

### 2.8 UI kit internals (leave colocated — YAGNI)
`CarouselApi`, `CarouselProps`, `CarouselOptions`, `CarouselPlugin`, `CarouselContextProps`,
`UseCarouselParameters`, `UseEmblaCarouselType` (`components/ui/carousel.tsx`);
`ToastProps`, `ToastActionElement` (`components/ui/toast.tsx`); `ToasterToast`, `Action`,
`ActionType`, `State`, `Toast` (`hooks/use-toast.ts` → consider `components/ui/toast.tsx`);
`ChartConfig`, `ChartContextProps` (`components/ui/chart.tsx`); `FormFieldContextValue`,
`FormItemContextValue`, `FieldPath`, `FieldValues`, `ControllerProps` (`components/ui/form.tsx`);
`SidebarContextProps` (`components/ui/sidebar.tsx`); `PaginationLinkProps` (`components/ui/pagination.tsx`);
`SocialVariant` (`components/maison/social-icons.tsx`).
→ Do **not** extract; these are implementation details of one component/hook.

### 2.9 DB row source of truth
`Table`, `UserRow`, `CategoryRow`, `ProductRow`, `ImageRow`, `OrderRow`, `OrderItemRow`,
`ArticleRow`, `SettingRow`, `InviteRow`, `Database` — `lib/supabase/database.types.ts`.
→ This mirrors Prisma models. Keep as the row layer; derive DTOs/DTO-with-relations with
generics instead of hand-writing parallel interfaces.

---

## 3. Duplicate / dead inventory (action items)

| Item | Where | Action |
|---|---|---|
| `OrderRow` (two shapes) | `database.types.ts:59` (utm-flavoured) vs `types/order/order.d.ts:98` (customer-facing) | keep one; make `marketing` use `OrderUtmRow`; `database.types.ts` re-exports or drops the stale copy |
| `Params` ×2 | blog/[slug], produit/[ref] | replace with `SlugParams`/`RefParams` in `lib/types/route-params.ts` |
| `ConsentCategory` | `config/site.ts` + import in `lib/analytics.ts` | single definition in `lib/types/analytics.ts` |
| `OrderViewD` | `types/order/order.d.ts:29` | dead (self-reference only) → delete |
| `Row` vs `ProductRow` | `types/index.ts:38` vs `database.types.ts:30` | reconcile in product extraction (see §4) |
| `SiteLocale` | (removed earlier) | ✅ done — alias gone, uses `Locale` |

---

## 4. Files to create

Under `web/src/lib/types/`:

| File | Contents (extracted from) | Notes |
|---|---|---|
| `analytics.ts` | `ConsentState`, `Listener`, `ServerLegs`, `ConsentCategory` | `lib/analytics.ts` keeps logic; types re-exported for consumers |
| `tracking.ts` | `ConsentFlag`, `TrackItem`, `TrackPayload`, `LegResult` | ✅ exists |
| `notifications.ts` | `StaffOrderPayload`, `EmailTemplate` | from `lib/email-templates.ts` |
| `integrations.ts` | `AnalyticsConfig`, `CustomMeta`, `VerificationConfig`, `Integrations` | from `lib/integrations.ts` |
| `content.ts` | `SeedArticle`, `EditorialCategory`, `CampaignPlatform`, `PlatformDraft`, `CampaignDraft`, `CatalogCategory`, `CatalogImage`, `CatalogProduct` | seed-only types; keeps runtime config clean |
| `route-params.ts` | `SlugParams`, `RefParams` (replacing both `Params`) | |
| `product.ts` | `ProductDTO` (canonical), `Row`/`ProductRow` reconciliation, `ProductFormValues`, `ProductFormImage`, generic `WithRelations<T, R>` | replaces `lib/products.ts` type block |
| `account.ts` | `CompteUser` | small but shared by compte page |
| `admin.ts` | `AdminUser`, `AdminNavItem`, `TeamUser`, `Stat`, `RecentOrder`, `ErrorParams` | already centralised; move to dedicated file |
| `marketing.ts` | `MarketingData`, `OrderUtmRow` usage typing | |
| `article.ts` | `ArticleFormValues`, `ArticleTableRow` | |
| `seo.ts` | `PageMetaInput`, `OpenGraphT` | |
| `index.ts` | re-export barrel only | becomes pure `export *` facade |

Rename: `lib/types/order/order.d.ts` → `lib/types/order/order.ts` (exported types belong in
`.ts`, not ambient `.d.ts`).

---

## 5. Phased plan

### Phase 1 — kill duplicates (low risk) ✅ DONE (verified: tsc clean · lint 0/0 · test 28/28)
- [x] Unify `OrderRow`: renamed the stale `database.types.ts` copy to `OrderDbRow`; canonical
      admin-list `OrderRow` stays in `types/order/order.ts`.
- [x] `ConsentCategory` → single definition in new `lib/types/analytics.ts` (also holds
      `ConsentState`, `Listener`, `ServerLegs`); `config/site.ts` no longer defines it.
- [x] Delete dead `OrderViewD` (`types/order/order.ts`).
- [x] `Params` ×2 → `SlugParams`/`RefParams` in new `lib/types/route-params.ts`;
      blog `[slug]` and produit `[ref]` pages updated.
- [x] Rename `types/order/order.d.ts` → `types/order/order.ts`; `index.ts` re-export updated.

### Phase 2 — extract shared modules (medium) ✅ DONE (verified: tsc clean · lint 0/0 · test 28/28)
- [x] Created focused modules under `lib/types/`: `content.ts` (catalogue/editorial/campaign
      seeds), `notifications.ts`, `integrations.ts`, `seo.ts`, `account.ts`, `admin.ts`,
      `marketing.ts`, `article.ts`, `product.ts`.
- [x] Moved declarations out of `config/articles.ts`, `config/products.ts`,
      `config/seed-campaign.ts`, `lib/email-templates.ts`, `lib/notify.ts`,
      `lib/integrations.ts`, `lib/products.ts` and `lib/types/index.ts`.
- [x] `index.ts` reduced to a pure barrel (13 `export *` lines) — all original exports
      preserved except the intentionally deleted dead `OrderViewD`.
- [x] Removed the `ProductDTO` compatibility re-export from `lib/products.ts`; all four
      consumers now import it from `@/lib/types`.
- [x] Ran `tsc` + `lint` + `test` after each file group; all green.

### Phase 3 — generics cleanup ✅ DONE (verified: tsc clean · lint 0/0)
- [x] `lib/supabase/database.types.ts` is now **generated** from `prisma/schema.postgres.prisma`
      by `web/scripts/generate-db-types.ts` (`bun run db:types` at root or in `web/`).
      Emits Supabase's canonical `Database` shape (`Row`/`Insert`/`Update`/`Relationships`)
      plus `Json`, `Tables`, `TablesInsert`, `TablesUpdate` helpers. The stale hand-written
      `ArticleRow` (missing `locale`) is gone; the four admin routes now use `Tables<"…">`.
- [x] `ProductWithRelations` is derived from Prisma's generated `Prisma.ProductGetPayload`
      instead of duplicating 18 row fields by hand.
- [x] `ProductImageDTO` derives from generated `Tables<"Image">`; admin `Row` is now a
      `Pick<ProductDTO>` projection — no parallel field lists.
- [x] Skipped `WithRelations<T, R>` / `Paginated<T>` helpers: no `Paginated` shape exists
      in the codebase and Prisma's payload type covers the only relation case (YAGNI/KISS).
- [x] Extracted all `components/ui/*` local types into `components/ui/types.ts`
      (carousel, chart, form, pagination, sidebar, toast); `hooks/use-toast.ts` updated.

### Phase 4 — verification & commit
`bun run lint`, `bunx tsc --noEmit -p web`, `bun run build`, `bun run --cwd web test`;
commit on a `feature/types-centralization` branch off `develop`, PR.

---

## 6. Open questions for the user

1. ~~Should `lib/supabase/database.types.ts` remain hand-written, or be generated from
   `schema.postgres.prisma`?~~ **Resolved in Phase 3:** generated from the Prisma schema
   in Supabase's canonical `Database` shape; see `scripts/generate-db-types.ts`.
2. ~~Extract seed/content types to `lib/types/content.ts` (proposed) or a top-level
   `config/types.ts`?~~ **Resolved in Phase 2:** `lib/types/content.ts` (barrel-exported).
3. ~~Keep `components/ui/*` internals colocated (recommended) or extract a `ui/types.ts`?~~
   **Resolved in Phase 3:** extracted to `components/ui/types.ts` per your decision.
