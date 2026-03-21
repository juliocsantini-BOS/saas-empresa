import { Module } from "@nestjs/common";
import { PrismaModule } from "../prisma/prisma.module";
import { CrmDocumentsController } from "./crm-documents.controller";
import { CrmDocumentsService } from "./crm-documents.service";

@Module({
  imports: [PrismaModule],
  controllers: [CrmDocumentsController],
  providers: [CrmDocumentsService],
  exports: [CrmDocumentsService],
})
export class CrmDocumentsModule {}
