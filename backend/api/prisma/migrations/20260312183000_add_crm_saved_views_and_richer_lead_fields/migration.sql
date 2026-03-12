-- AlterTable
ALTER TABLE "CrmLead" ADD COLUMN     "city" TEXT,
ADD COLUMN     "companySize" TEXT,
ADD COLUMN     "competitor" TEXT,
ADD COLUMN     "industry" TEXT,
ADD COLUMN     "jobTitle" TEXT,
ADD COLUMN     "nextMeetingAt" TIMESTAMP(3),
ADD COLUMN     "sourceDetail" TEXT,
ADD COLUMN     "state" TEXT,
ADD COLUMN     "website" TEXT,
ADD COLUMN     "whatsapp" TEXT,
ADD COLUMN     "wonReason" TEXT;

-- CreateTable
CREATE TABLE "CrmSavedView" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "name" TEXT NOT NULL,
    "filtersJson" JSONB NOT NULL,
    "companyId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "CrmSavedView_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CrmSavedView_companyId_idx" ON "CrmSavedView"("companyId");

-- CreateIndex
CREATE INDEX "CrmSavedView_userId_idx" ON "CrmSavedView"("userId");

-- CreateIndex
CREATE INDEX "CrmSavedView_companyId_userId_createdAt_idx" ON "CrmSavedView"("companyId", "userId", "createdAt");

-- AddForeignKey
ALTER TABLE "CrmSavedView" ADD CONSTRAINT "CrmSavedView_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CrmSavedView" ADD CONSTRAINT "CrmSavedView_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

