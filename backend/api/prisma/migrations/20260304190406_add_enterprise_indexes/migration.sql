-- CreateIndex
CREATE INDEX "AuditLog_companyId_createdAt_idx" ON "AuditLog"("companyId", "createdAt");

-- CreateIndex
CREATE INDEX "AuditLog_companyId_userId_createdAt_idx" ON "AuditLog"("companyId", "userId", "createdAt");

-- CreateIndex
CREATE INDEX "AuditLog_companyId_requestId_idx" ON "AuditLog"("companyId", "requestId");

-- CreateIndex
CREATE INDEX "Branch_companyId_createdAt_idx" ON "Branch"("companyId", "createdAt");

-- CreateIndex
CREATE INDEX "Company_createdAt_idx" ON "Company"("createdAt");

-- CreateIndex
CREATE INDEX "Company_requestId_idx" ON "Company"("requestId");

-- CreateIndex
CREATE INDEX "Permission_createdAt_idx" ON "Permission"("createdAt");

-- CreateIndex
CREATE INDEX "RolePermission_role_permissionId_idx" ON "RolePermission"("role", "permissionId");

-- CreateIndex
CREATE INDEX "User_companyId_role_idx" ON "User"("companyId", "role");

-- CreateIndex
CREATE INDEX "User_companyId_isActive_idx" ON "User"("companyId", "isActive");

-- CreateIndex
CREATE INDEX "User_companyId_createdAt_idx" ON "User"("companyId", "createdAt");

-- CreateIndex
CREATE INDEX "UserPermission_companyId_userId_idx" ON "UserPermission"("companyId", "userId");

-- CreateIndex
CREATE INDEX "UserPermission_companyId_permissionId_idx" ON "UserPermission"("companyId", "permissionId");

-- CreateIndex
CREATE INDEX "UserPermission_companyId_userId_effect_idx" ON "UserPermission"("companyId", "userId", "effect");
