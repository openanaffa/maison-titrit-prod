-- Add locale support to Article model for trilingual blog (fr / ar / en)
-- Existing articles are backfilled to 'fr' (the default locale).

ALTER TABLE "Article" ADD COLUMN "locale" text NOT NULL DEFAULT 'fr';

-- Backfill any pre-existing rows explicitly (belt and braces with DEFAULT)
UPDATE "Article" SET "locale" = 'fr' WHERE "locale" IS NULL;

-- Replace the slug-only unique constraint with a compound (slug, locale)
-- so the same article can exist in multiple languages.
ALTER TABLE "Article" DROP CONSTRAINT IF EXISTS "Article_slug_key";
ALTER TABLE "Article" ADD CONSTRAINT "Article_slug_locale_key" UNIQUE ("slug", "locale");

CREATE INDEX IF NOT EXISTS "Article_published_locale_idx" ON "Article" ("published", "locale");
