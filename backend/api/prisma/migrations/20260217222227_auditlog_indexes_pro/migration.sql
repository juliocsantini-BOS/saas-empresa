-- PRO Indexes for AuditLog
-- Helps pagination/filter in large volumes

CREATE INDEX IF NOT EXISTS "AuditLog_companyId_createdAt_idx"
  ON "AuditLog"("companyId", "createdAt" DESC);

CREATE INDEX IF NOT EXISTS "AuditLog_userId_createdAt_idx"
  ON "AuditLog"("userId", "createdAt" DESC);

CREATE INDEX IF NOT EXISTS "AuditLog_statusCode_createdAt_idx"
  ON "AuditLog"("statusCode", "createdAt" DESC);