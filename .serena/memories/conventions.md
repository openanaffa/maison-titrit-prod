# Conventions

- Package manager Bun. Never npm on host.
- New UI strings in web/src/i18n/dictionaries/lang/{fr,ar,en}.ts.
- Route pages via buildPageMetadata.
- Private pages noindexed.
- react-hooks/set-state-in-effect intentionally off (hydration-gated mount reads).
- Secret leak check: git ls-files | grep -i '\.env'.
- Tests colocated (*.test.ts) next to code.
- PWA/service worker intact when touching web/src/app/.
- Keep schemas in lockstep (sqlite + postgres).
