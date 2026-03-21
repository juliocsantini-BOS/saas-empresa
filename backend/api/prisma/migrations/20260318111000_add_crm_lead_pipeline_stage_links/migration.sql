CREATE TABLE IF NOT EXISTS "CrmPipeline" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "description" TEXT,
  "isDefault" BOOLEAN NOT NULL DEFAULT false,
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  "companyId" TEXT NOT NULL,
  CONSTRAINT "CrmPipeline_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "CrmPipelineStage" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "order" INTEGER NOT NULL,
  "color" TEXT,
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "isSystemStage" BOOLEAN NOT NULL DEFAULT false,
  "statusBase" "CrmLeadStatus" NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  "companyId" TEXT NOT NULL,
  "pipelineId" TEXT NOT NULL,
  CONSTRAINT "CrmPipelineStage_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "CrmLead"
ADD COLUMN IF NOT EXISTS "pipelineId" TEXT,
ADD COLUMN IF NOT EXISTS "stageId" TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS "CrmPipeline_companyId_name_key"
ON "CrmPipeline"("companyId", "name");

CREATE INDEX IF NOT EXISTS "CrmPipeline_companyId_idx"
ON "CrmPipeline"("companyId");

CREATE INDEX IF NOT EXISTS "CrmPipeline_companyId_isDefault_idx"
ON "CrmPipeline"("companyId", "isDefault");

CREATE INDEX IF NOT EXISTS "CrmPipeline_companyId_isActive_idx"
ON "CrmPipeline"("companyId", "isActive");

CREATE UNIQUE INDEX IF NOT EXISTS "CrmPipelineStage_pipelineId_name_key"
ON "CrmPipelineStage"("pipelineId", "name");

CREATE UNIQUE INDEX IF NOT EXISTS "CrmPipelineStage_pipelineId_order_key"
ON "CrmPipelineStage"("pipelineId", "order");

CREATE INDEX IF NOT EXISTS "CrmPipelineStage_companyId_idx"
ON "CrmPipelineStage"("companyId");

CREATE INDEX IF NOT EXISTS "CrmPipelineStage_pipelineId_idx"
ON "CrmPipelineStage"("pipelineId");

CREATE INDEX IF NOT EXISTS "CrmPipelineStage_pipelineId_order_idx"
ON "CrmPipelineStage"("pipelineId", "order");

CREATE INDEX IF NOT EXISTS "CrmPipelineStage_companyId_statusBase_idx"
ON "CrmPipelineStage"("companyId", "statusBase");

CREATE INDEX IF NOT EXISTS "CrmLead_pipelineId_idx"
ON "CrmLead"("pipelineId");

CREATE INDEX IF NOT EXISTS "CrmLead_stageId_idx"
ON "CrmLead"("stageId");

CREATE INDEX IF NOT EXISTS "CrmLead_companyId_pipelineId_idx"
ON "CrmLead"("companyId", "pipelineId");

CREATE INDEX IF NOT EXISTS "CrmLead_companyId_stageId_idx"
ON "CrmLead"("companyId", "stageId");

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'CrmPipeline_companyId_fkey'
  ) THEN
    ALTER TABLE "CrmPipeline"
    ADD CONSTRAINT "CrmPipeline_companyId_fkey"
    FOREIGN KEY ("companyId") REFERENCES "Company"("id")
    ON DELETE CASCADE
    ON UPDATE CASCADE;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'CrmPipelineStage_companyId_fkey'
  ) THEN
    ALTER TABLE "CrmPipelineStage"
    ADD CONSTRAINT "CrmPipelineStage_companyId_fkey"
    FOREIGN KEY ("companyId") REFERENCES "Company"("id")
    ON DELETE CASCADE
    ON UPDATE CASCADE;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'CrmPipelineStage_pipelineId_fkey'
  ) THEN
    ALTER TABLE "CrmPipelineStage"
    ADD CONSTRAINT "CrmPipelineStage_pipelineId_fkey"
    FOREIGN KEY ("pipelineId") REFERENCES "CrmPipeline"("id")
    ON DELETE CASCADE
    ON UPDATE CASCADE;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'CrmLead_pipelineId_fkey'
  ) THEN
    ALTER TABLE "CrmLead"
    ADD CONSTRAINT "CrmLead_pipelineId_fkey"
    FOREIGN KEY ("pipelineId") REFERENCES "CrmPipeline"("id")
    ON DELETE SET NULL
    ON UPDATE CASCADE;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'CrmLead_stageId_fkey'
  ) THEN
    ALTER TABLE "CrmLead"
    ADD CONSTRAINT "CrmLead_stageId_fkey"
    FOREIGN KEY ("stageId") REFERENCES "CrmPipelineStage"("id")
    ON DELETE SET NULL
    ON UPDATE CASCADE;
  END IF;
END $$;
