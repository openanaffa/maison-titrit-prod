# Suggested Commands

From repo root:
- bun install
- bun run dev:web   (Next dev :3000)
- bun run lint       (web eslint, 0 errors/0 warnings)
- bunx tsc --noEmit -p web
- bun run build

In web/:
- bun test
- bun run db:generate / db:push (sqlite)
- bun run db:generate:pg / db:push:pg (postgres)
- bun run seed:prod
- bun run vercel:build

Windows: use cmd /c or powershell; scripts (.ps1) may be blocked by execution policy.
