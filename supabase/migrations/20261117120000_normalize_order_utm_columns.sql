-- Reconcile legacy unquoted UTM columns (utmsource, ...) with the quoted
-- camelCase columns used by Prisma and the application ("utmSource", ...).
--
-- This is intentionally forward-only and safe for the observed live schema:
-- merge any legacy-only values, but abort rather than overwrite if both
-- versions contain different non-NULL values. It is a no-op for databases
-- that never had the legacy columns.
DO $$
DECLARE
  column_pair record;
  legacy_exists boolean;
  canonical_exists boolean;
  has_conflict boolean;
BEGIN
  IF to_regclass('public."Order"') IS NULL THEN
    RAISE EXCEPTION 'Expected public."Order" before normalizing UTM columns';
  END IF;

  FOR column_pair IN
    SELECT * FROM (VALUES
      ('utmsource', 'utmSource'),
      ('utmmedium', 'utmMedium'),
      ('utmcampaign', 'utmCampaign'),
      ('utmcontent', 'utmContent'),
      ('utmterm', 'utmTerm')
    ) AS columns_to_normalize(legacy_name, canonical_name)
  LOOP
    SELECT EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name = 'Order'
        AND column_name = column_pair.legacy_name
    ) INTO legacy_exists;

    SELECT EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name = 'Order'
        AND column_name = column_pair.canonical_name
    ) INTO canonical_exists;

    IF legacy_exists AND canonical_exists THEN
      EXECUTE format(
        'SELECT EXISTS (
           SELECT 1 FROM public."Order"
           WHERE %I IS NOT NULL
             AND %I IS NOT NULL
             AND %I IS DISTINCT FROM %I
         )',
        column_pair.legacy_name,
        column_pair.canonical_name,
        column_pair.legacy_name,
        column_pair.canonical_name
      ) INTO has_conflict;

      IF has_conflict THEN
        RAISE EXCEPTION
          'Conflicting data in public."Order" columns % and %; reconcile values before retrying',
          column_pair.legacy_name,
          column_pair.canonical_name;
      END IF;

      EXECUTE format(
        'UPDATE public."Order" SET %I = COALESCE(%I, %I) WHERE %I IS NOT NULL',
        column_pair.canonical_name,
        column_pair.canonical_name,
        column_pair.legacy_name,
        column_pair.legacy_name
      );
      EXECUTE format('ALTER TABLE public."Order" DROP COLUMN %I', column_pair.legacy_name);
    ELSIF legacy_exists THEN
      EXECUTE format(
        'ALTER TABLE public."Order" RENAME COLUMN %I TO %I',
        column_pair.legacy_name,
        column_pair.canonical_name
      );
    ELSE
      RAISE EXCEPTION
        'Neither expected UTM column % nor legacy column % exists on public."Order"',
        column_pair.canonical_name,
        column_pair.legacy_name;
    END IF;
  END LOOP;
END $$;
