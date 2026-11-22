-- #122 customer 360: tracked DDL for User.marketingConsent,
-- CustomerNote and CustomerAuditEvent. The live database received the
-- change via `prisma db push`; this migration makes it reproducible from
-- the repository's migration history. All statements are idempotent.

ALTER TABLE public."User"
  ADD COLUMN IF NOT EXISTS "marketingConsent" TEXT;
-- OPTED_IN | OPTED_OUT | NULL = unknown

CREATE TABLE IF NOT EXISTS public."CustomerNote" (
  "id"        TEXT NOT NULL,
  "userId"    TEXT NOT NULL,
  "authorId"  TEXT NOT NULL,
  "body"      TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "CustomerNote_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "CustomerNote_userId_idx"
  ON public."CustomerNote"("userId");

CREATE TABLE IF NOT EXISTS public."CustomerAuditEvent" (
  "id"        TEXT NOT NULL,
  "userId"    TEXT,
  "actorId"   TEXT NOT NULL,
  "action"    TEXT NOT NULL, -- VIEW_CUSTOMER | NOTE_ADDED | NOTE_REMOVED | CONSENT_CHANGED
  "detail"    TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "CustomerAuditEvent_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "CustomerAuditEvent_userId_idx"
  ON public."CustomerAuditEvent"("userId");

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'CustomerNote_userId_fkey' AND conrelid = 'public."CustomerNote"'::regclass) THEN
    ALTER TABLE public."CustomerNote"
      ADD CONSTRAINT "CustomerNote_userId_fkey"
      FOREIGN KEY ("userId") REFERENCES public."User"("id")
      ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'CustomerNote_authorId_fkey' AND conrelid = 'public."CustomerNote"'::regclass) THEN
    ALTER TABLE public."CustomerNote"
      ADD CONSTRAINT "CustomerNote_authorId_fkey"
      FOREIGN KEY ("authorId") REFERENCES public."User"("id")
      ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'CustomerAuditEvent_userId_fkey' AND conrelid = 'public."CustomerAuditEvent"'::regclass) THEN
    ALTER TABLE public."CustomerAuditEvent"
      ADD CONSTRAINT "CustomerAuditEvent_userId_fkey"
      FOREIGN KEY ("userId") REFERENCES public."User"("id")
      ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'CustomerAuditEvent_actorId_fkey' AND conrelid = 'public."CustomerAuditEvent"'::regclass) THEN
    ALTER TABLE public."CustomerAuditEvent"
      ADD CONSTRAINT "CustomerAuditEvent_actorId_fkey"
      FOREIGN KEY ("actorId") REFERENCES public."User"("id")
      ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;
