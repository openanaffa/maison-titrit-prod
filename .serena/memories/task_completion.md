# Task Completion

Before declaring a structural change done:
- bunx tsc --noEmit -p web
- bun run lint (0 errors / 0 warnings)
- bun run build
- bun test (in web/)

For MCP/config changes: validate JSON (node parse) and confirm servers start.
