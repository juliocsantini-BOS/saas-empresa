import { Module } from "@nestjs/common";
import { PrismaModule } from "../prisma/prisma.module";
import { PermissionsModule } from "../common/permissions/permissions.module";
import { CrmPipelinesController } from "./crm-pipelines.controller";
import { CrmPipelinesService } from "./crm-pipelines.service";
import { CrmPipelineStagesController } from "./crm-pipeline-stages.controller";
import { CrmPipelineStagesService } from "./crm-pipeline-stages.service";

@Module({
  imports: [PrismaModule, PermissionsModule],
  controllers: [CrmPipelinesController, CrmPipelineStagesController],
  providers: [CrmPipelinesService, CrmPipelineStagesService],
  exports: [CrmPipelinesService, CrmPipelineStagesService],
})
export class CrmPipelinesModule {}
