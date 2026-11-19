## Summary

<!-- What does this change do, and why? Reference the issue/PR if any. -->

## Verification

The repo's bar must be green before merge (see AGENTS.md / ENTRYPOINT.md):

- [ ] `bunx tsc --noEmit -p web` passes
- [ ] `bun run lint` — 0 errors, 0 warnings
- [ ] `bunx biome check` clean
- [ ] `bun run build` succeeds (all routes)
- [ ] `cd web && bun test` passes

## Notes

<!-- Breaking changes, env/migration steps, screenshots, perf/SEO impact -->
