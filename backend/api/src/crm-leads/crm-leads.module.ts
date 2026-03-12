import { Module } from "@nestjs/common";
import { PrismaModule } from "../prisma/prisma.module";
import { AutomationModule } from "../automation/automation.module";
import { PermissionsModule } from "../common/permissions/permissions.module";
import { CrmLeadsController } from "./crm-leads.controller";
import { CrmSavedViewsController } from "./crm-saved-views.controller";
import { CrmLeadsService } from "./crm-leads.service";

@Module({
  imports: [PrismaModule, AutomationModule, PermissionsModule],
  controllers: [CrmLeadsController, CrmSavedViewsController],
  providers: [CrmLeadsService],
})
export class CrmLeadsModule {}
