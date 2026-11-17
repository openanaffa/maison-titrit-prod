# Tech Stack

- Bun 1.3.x (packageManager pinned). npm not on host for installs.
- Next.js 16.4.5 + React 19.3.1 (Turbopack).
- Prisma 6.19.3. Client generated per provider.
- Supabase (Postgres + Auth). Session pooler eu-west-1.
- Cloudflare R2 (media) + DNS.
- Vercel deploy (root dir web/).
- TypeScript 5.9.3, ESLint 9 (eslint-config-next).
- Tests: bun test (colocated *.test.ts).
- Fonts via Google Fonts <link> (no next/font/google).
- Tailwind 4.3.5.

Pseudo-enums as String (SQLite compat); do not un-comment enum blocks.
