ALTER TABLE "CrmLead"
  ADD COLUMN IF NOT EXISTS "dealValue" NUMERIC(14,2),
  ADD COLUMN IF NOT EXISTS "currency" TEXT NOT NULL DEFAULT 'BRL',
  ADD COLUMN IF NOT EXISTS "probability" INTEGER NOT NULL DEFAULT 10,
  ADD COLUMN IF NOT EXISTS "source" TEXT,
  ADD COLUMN IF NOT EXISTS "priority" TEXT,
  ADD COLUMN IF NOT EXISTS "nextStep" TEXT,
  ADD COLUMN IF NOT EXISTS "nextStepDueAt" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "expectedCloseDate" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "statusChangedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  ADD COLUMN IF NOT EXISTS "lastActivityAt" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "lastContactAt" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "wonAt" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "lostAt" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "lostReason" TEXT;

UPDATE "CrmLead"
SET
  "statusChangedAt" = COALESCE("statusChangedAt", "updatedAt", "createdAt");

UPDATE "CrmLead"
SET
  "probability" = CASE
    WHEN "status" = 'NEW' THEN 10
    WHEN "status" = 'CONTACTED' THEN 25
    WHEN "status" = 'PROPOSAL' THEN 50
    WHEN "status" = 'NEGOTIATION' THEN 75
    WHEN "status" = 'WON' THEN 100
    WHEN "status" = 'LOST' THEN 0
    ELSE 10
  END
WHERE "probability" IS NULL OR "probability" = 10;

UPDATE "CrmLead"
SET "wonAt" = COALESCE("wonAt", "updatedAt", "createdAt")
WHERE "status" = 'WON' AND "wonAt" IS NULL;

UPDATE "CrmLead"
SET "lostAt" = COALESCE("lostAt", "updatedAt", "createdAt")
WHERE "status" = 'LOST' AND "lostAt" IS NULL;

CREATE INDEX IF NOT EXISTS "CrmLead_companyId_statusChangedAt_idx"
  ON "CrmLead"("companyId", "statusChangedAt");

CREATE INDEX IF NOT EXISTS "CrmLead_companyId_lastActivityAt_idx"
  ON "CrmLead"("companyId", "lastActivityAt");

CREATE INDEX IF NOT EXISTS "CrmLead_companyId_expectedCloseDate_idx"
  ON "CrmLead"("companyId", "expectedCloseDate");

CREATE INDEX IF NOT EXISTS "CrmLead_companyId_probability_idx"
  ON "CrmLead"("companyId", "probability");

CREATE INDEX IF NOT EXISTS "CrmLead_companyId_ownerUserId_status_idx"
  ON "CrmLead"("companyId", "ownerUserId", "status");