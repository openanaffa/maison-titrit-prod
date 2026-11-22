# Testing — Maison Titrit

## 1. Commands

```sh
cd web && bun test src          # unit tests
bun run lint                   # eslint
bun run biome:check            # biome
bunx tsc --noEmit -p web       # type check
bun run build                  # next build
cd web && bunx playwright test  # e2e
```

## 2. Layers

- **Unit**: `*.test.ts` colocated (17 today). Bun test runner.
- **Component**: planned — interaction tests for primitives/compositions (TODO M6).
- **E2E**: Playwright against isolated local Supabase (8 specs). Commerce paths.
- **A11y**: axe checks on key routes (planned, TODO M6).
- **PWA**: manifest + SW validation; offline scenarios (planned, TODO M8/M9).
- **Performance**: Lighthouse CI (diagnostic today; gate planned TODO M12).
- **Security**: dependency + app security checks (botid, sentry).

## 3. Real user journeys to cover

Keyboard navigation; screen-reader semantics; mobile touch; slow network; offline launch; reconnection; SW updates; permission denied; subscription expiry; auth expiry; duplicate checkout attempts.

## 4. CI

`.github/workflows/ci.yml`: `verify` job (biome, tsc, test, build, lighthouse continue-on-error) + `e2e` job (isolated Supabase). Planned additions: axe, bundle check, Lighthouse gate.