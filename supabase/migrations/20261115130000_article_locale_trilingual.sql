-- Trilingual blog (fr / ar / en): add a locale discriminator to Article.
--
-- Fully idempotent: every step is guarded and only matches the exact shape it
-- is meant to change, so the file can be re-run as many times as needed.
--
-- Note on Postgres specifics:
--   * Prisma materialises `@unique` as a unique INDEX, not a table constraint.
--     `ALTER TABLE ... DROP CONSTRAINT "Article_slug_key"` is therefore a
--     silent no-op — the stale slug-only index has to be dropped with
--     DROP INDEX, otherwise it keeps rejecting a second locale for a slug.
--   * The table name is case-sensitive ("Article"), so it is always quoted.

-- 1. Ensure the locale column exists (NOT NULL, defaults to 'fr').
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'Article'
      AND column_name = 'locale'
  ) THEN
    ALTER TABLE "Article" ADD COLUMN "locale" text NOT NULL DEFAULT 'fr';
  END IF;
END $$;

-- 2. Backfill any NULL / empty locale values to the default locale.
UPDATE "Article" SET "locale" = 'fr' WHERE "locale" IS NULL OR "locale" = '';

-- 3. Drop every unique index that covers ONLY the slug column.
DO $$
DECLARE
  idx text;
BEGIN
  FOR idx IN
    SELECT c.relname
    FROM pg_index i
    JOIN pg_class c ON c.oid = i.indexrelid
    JOIN pg_class t ON t.oid = i.indrelid
    JOIN pg_namespace n ON n.oid = t.relnamespace
    WHERE n.nspname = 'public'
      AND t.relname = 'Article'
      AND i.indisunique
      AND NOT i.indisprimary
      AND i.indpred IS NULL
      AND i.indnkeyatts = 1
      AND pg_get_indexdef(i.indexrelid, 1, true) = 'slug'
  LOOP
    EXECUTE format('DROP INDEX IF EXISTS %I.%I', 'public', idx);
  END LOOP;
END $$;

-- 4. Ensure the compound unique (slug, locale) exists, as a plain unique
--    index to match how Prisma materialises @@unique (never a constraint).
--    A constraint-backed index left by an earlier version of this script is
--    still detected by the shape check, so this stays a no-op there.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_index i
    JOIN pg_class t ON t.oid = i.indrelid
    JOIN pg_namespace n ON n.oid = t.relnamespace
    WHERE n.nspname = 'public'
      AND t.relname = 'Article'
      AND i.indisunique
      AND i.indpred IS NULL
      AND i.indnkeyatts = 2
      AND pg_get_indexdef(i.indexrelid, 1, true) = 'slug'
      AND pg_get_indexdef(i.indexrelid, 2, true) = 'locale'
  ) THEN
    CREATE UNIQUE INDEX "Article_slug_locale_key" ON "Article" ("slug", "locale");
  END IF;
END $$;

-- 5. Index backing the locale-filtered published-article queries.
CREATE INDEX IF NOT EXISTS "Article_published_locale_idx" ON "Article" ("published", "locale");
