import { Module } from "@nestjs/common";
import { PrismaModule } from "../prisma/prisma.module";
import { CrmIntegrationsController } from "./crm-integrations.controller";
import { CrmIntegrationsService } from "./crm-integrations.service";

@Module({
  imports: [PrismaModule],
  controllers: [CrmIntegrationsController],
  providers: [CrmIntegrationsService],
  exports: [CrmIntegrationsService],
})
export class CrmIntegrationsModule {}
