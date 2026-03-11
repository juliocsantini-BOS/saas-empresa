-- Drift fix (idempotente): garantir colunas e índice esperados pelo schema

ALTER TABLE "Company"  ADD COLUMN IF NOT EXISTS "requestId" TEXT;
ALTER TABLE "Branch"   ADD COLUMN IF NOT EXISTS "requestId" TEXT;
ALTER TABLE "AuditLog" ADD COLUMN IF NOT EXISTS "requestId" TEXT;

-- índice que o Prisma acusou como drift (se já existir, não cria de novo)
CREATE INDEX IF NOT EXISTS "AuditLog_requestId_idx" ON "AuditLog"("requestId");

-- enum Role (evita erro se já existir)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_enum e
    JOIN pg_type t ON t.oid = e.enumtypid
    WHERE t.typname = 'Role' AND e.enumlabel = 'USER'
  ) THEN
    ALTER TYPE "Role" ADD VALUE 'USER';
  END IF;
END $$;
