import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from "@nestjs/common";
import { Role } from "@prisma/client";
import { CurrentUser } from "../common/decorators/current-user.decorator";
import { RequirePermissions } from "../common/decorators/require-permissions.decorator";
import { Roles } from "../common/decorators/roles.decorator";
import { CrmPipelineStagesService } from "./crm-pipeline-stages.service";
import { CreateCrmPipelineStageDto } from "./dto/create-crm-pipeline-stage.dto";
import { UpdateCrmPipelineStageDto } from "./dto/update-crm-pipeline-stage.dto";
import { ReorderCrmPipelineStagesDto } from "./dto/reorder-crm-pipeline-stages.dto";

type PipelineCurrentUser = {
  id: string;
  role: Role;
  companyId?: string | null;
};

@Controller("v1/crm/pipelines/:pipelineId/stages")
export class CrmPipelineStagesController {
  constructor(private readonly service: CrmPipelineStagesService) {}

  @Get()
  @Roles(
    Role.ADMIN_MASTER,
    Role.ADMIN,
    Role.CEO,
    Role.CFO,
    Role.CMO,
    Role.SALES,
    Role.FINANCE,
    Role.SUPPORT,
    Role.USER,
  )
  @RequirePermissions("crm.pipeline_stages.read")
  async list(
    @Param("pipelineId") pipelineId: string,
    @CurrentUser() user: PipelineCurrentUser,
  ) {
    return this.service.list(user, pipelineId);
  }

  @Post()
  @Roles(Role.ADMIN_MASTER, Role.ADMIN, Role.CEO, Role.CMO)
  @RequirePermissions("crm.pipeline_stages.create")
  async create(
    @Param("pipelineId") pipelineId: string,
    @Body() body: CreateCrmPipelineStageDto,
    @CurrentUser() user: PipelineCurrentUser,
  ) {
    return this.service.create(user, pipelineId, body);
  }

  @Patch("reorder")
  @Roles(Role.ADMIN_MASTER, Role.ADMIN, Role.CEO, Role.CMO)
  @RequirePermissions("crm.pipeline_stages.reorder")
  async reorder(
    @Param("pipelineId") pipelineId: string,
    @Body() body: ReorderCrmPipelineStagesDto,
    @CurrentUser() user: PipelineCurrentUser,
  ) {
    return this.service.reorder(user, pipelineId, body);
  }

  @Patch(":stageId")
  @Roles(Role.ADMIN_MASTER, Role.ADMIN, Role.CEO, Role.CMO)
  @RequirePermissions("crm.pipeline_stages.update")
  async update(
    @Param("pipelineId") pipelineId: string,
    @Param("stageId") stageId: string,
    @Body() body: UpdateCrmPipelineStageDto,
    @CurrentUser() user: PipelineCurrentUser,
  ) {
    return this.service.update(user, pipelineId, stageId, body);
  }

  @Delete(":stageId")
  @Roles(Role.ADMIN_MASTER, Role.ADMIN, Role.CEO, Role.CMO)
  @RequirePermissions("crm.pipeline_stages.delete")
  async remove(
    @Param("pipelineId") pipelineId: string,
    @Param("stageId") stageId: string,
    @CurrentUser() user: PipelineCurrentUser,
  ) {
    return this.service.remove(user, pipelineId, stageId);
  }
}
