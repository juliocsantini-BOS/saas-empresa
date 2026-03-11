-- Fix: add requestId to AuditLog (idempotent)
ALTER TABLE "public"."AuditLog" ADD COLUMN IF NOT EXISTS "requestId" TEXT;

-- Fix: ensure index exists
CREATE INDEX IF NOT EXISTS "AuditLog_requestId_idx"
ON "public"."AuditLog" USING btree ("requestId");