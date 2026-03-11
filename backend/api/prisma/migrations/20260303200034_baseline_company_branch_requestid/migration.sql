-- Baseline: register requestId columns (idempotent)
ALTER TABLE "public"."Company" ADD COLUMN IF NOT EXISTS "requestId" TEXT;
ALTER TABLE "public"."Branch"  ADD COLUMN IF NOT EXISTS "requestId" TEXT;