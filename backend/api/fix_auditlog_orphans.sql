-- Fix orphaned AuditLog references (safe / idempotent)

-- userId órfão => NULL
UPDATE "public"."AuditLog" a
SET "userId" = NULL
WHERE "userId" IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM "public"."User" u WHERE u."id" = a."userId");

-- companyId órfão => NULL (se houver)
UPDATE "public"."AuditLog" a
SET "companyId" = NULL
WHERE "companyId" IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM "public"."Company" c WHERE c."id" = a."companyId");