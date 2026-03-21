import { Module } from "@nestjs/common";
import { PrismaModule } from "../prisma/prisma.module";
import { CrmEngagementController } from "./crm-engagement.controller";
import { CrmEngagementService } from "./crm-engagement.service";

@Module({
  imports: [PrismaModule],
  controllers: [CrmEngagementController],
  providers: [CrmEngagementService],
  exports: [CrmEngagementService],
})
export class CrmEngagementModule {}
