import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  UseGuards,
} from "@nestjs/common";
import { Role } from "@prisma/client";
import { CurrentUser } from "../common/decorators/current-user.decorator";
import { RequirePermissions } from "../common/decorators/require-permissions.decorator";
import { Roles } from "../common/decorators/roles.decorator";
import { RolesGuard } from "../common/guards/roles.guard";
import { TenantGuard } from "../common/guards/tenant.guard";
import { CrmPipelinesService } from "./crm-pipelines.service";

@Controller("v1/crm/pipelines")
@UseGuards(TenantGuard, RolesGuard)
export class CrmPipelinesController {
  constructor(private service: CrmPipelinesService) {}

  @Get()
  @Roles(Role.ADMIN_MASTER, Role.ADMIN, Role.CEO, Role.CMO, Role.SALES)
  @RequirePermissions("crm.pipelines.read")
  list(@CurrentUser() user: any) {
    return this.service.list(user)
  }

  @Post()
  @Roles(Role.ADMIN_MASTER, Role.ADMIN, Role.CEO, Role.CMO)
  @RequirePermissions("crm.pipelines.create")
  create(@CurrentUser() user: any, @Body() body: any) {
    return this.service.create(user, body)
  }

  @Delete(":pipelineId")
  @Roles(Role.ADMIN_MASTER, Role.ADMIN, Role.CEO)
  @RequirePermissions("crm.pipelines.delete")
  delete(
    @CurrentUser() user: any,
    @Param("pipelineId") pipelineId: string,
  ) {
    return this.service.delete(user, pipelineId)
  }
}
