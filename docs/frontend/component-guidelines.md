# Component Guidelines — Maison Titrit

## 1. Hierarchy

Tokens → Primitives → Compositions → Blocks → Layouts.

- **Primitives**: shadcn/ui in `web/src/components/ui/` (Button, Input, Label, Badge, …).
- **Compositions**: `SearchBar`, `ProductCard`, `ProductGallery`, `FormField`, `DataTable`, `FilterBar`.
- **Blocks**: `ProductCatalogue`, `CheckoutForm`, `InventoryWorkspace`, `CustomerProfile`, `OrderManagement`.
- **Layouts**: storefront root, `makteb` shell, auth.

## 2. shadcn/ui rules

- Prefer existing primitives over reinventing controls.
- Use Radix-based accessible primitives.
- Use shadcn CLI + registry conventions; registries configured in `components.json` (incl. `@supabase`).
- Compose, don't build monoliths.
- Centralize variants with `cva` where appropriate.
- Use `cn()` for class composition.
- Never edit generated primitives casually; extend via wrappers/composition.
- Document custom components and intended use.

## 3. Quality requirements (every reusable component)

- Strong TypeScript types.
- Semantic HTML; ARIA only when needed.
- Keyboard support + visible focus.
- Responsive (mobile-first); container queries for self-adapting components.
- Loading, empty, error, disabled states where relevant.
- Light + dark theme; RTL; reduced-motion; forced-colors (planned).
- No unnecessary client JS (prefer RSC).

## 4. Prohibited patterns

- Duplicate components or inconsistent visual patterns.
- Arbitrary hard-coded colors (use tokens).
- `!important` without justification.
- Inline styles for token values.
- ARIA without understood semantics.
- Editing `ui/*` primitives directly for one-off needs.

## 5. Variants & styling

- Use `cva` for variant matrices; keep in the component file or a colocated `*.variants.ts`.
- Use `tailwind-merge` via `cn()`; avoid conflicting utilities.
- Mobile-first responsive; container queries for components that must adapt to their own width.

## 6. Component inventory

See `component-inventory.md`. Update it when adding/removing components.