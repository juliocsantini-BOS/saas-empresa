import { Module } from "@nestjs/common";
import { PrismaModule } from "../prisma/prisma.module";
import { AutomationModule } from "../automation/automation.module";
import { CrmLeadsController } from "./crm-leads.controller";
import { CrmLeadsService } from "./crm-leads.service";

@Module({
  imports: [PrismaModule, AutomationModule],
  controllers: [CrmLeadsController],
  providers: [CrmLeadsService],
})
export class CrmLeadsModule {}
