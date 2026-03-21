import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from "@nestjs/common";
import { Role } from "@prisma/client";
import { CurrentUser } from "../common/decorators/current-user.decorator";
import { Roles } from "../common/decorators/roles.decorator";
import { RolesGuard } from "../common/guards/roles.guard";
import { TenantGuard } from "../common/guards/tenant.guard";
import { CrmLeadsService } from "./crm-leads.service";
import { BulkUpdateCrmLeadsDto } from "./dto/bulk-update-crm-leads.dto";
import { CreateCrmLeadActivityDto } from "./dto/create-crm-lead-activity.dto";
import { CreateCrmLeadDto } from "./dto/create-crm-lead.dto";
import { CreateCrmLeadTaskDto } from "./dto/create-crm-lead-task.dto";
import { CreateCrmSavedViewDto } from "./dto/create-crm-saved-view.dto";
import { ListCrmLeadsQueryDto } from "./dto/list-crm-leads.query.dto";
import { UpdateCrmLeadDto } from "./dto/update-crm-lead.dto";
import { MoveLeadStageDto } from "./dto/move-lead-stage.dto";

type CrmCurrentUser = {
  id: string;
  role: Role;
  companyId?: string | null;
  branchId?: string | null;
  departmentId?: string | null;
};

type CrmActor = {
  id: string;
  role: Role;
  companyId?: string | null;
  branchId?: string | null;
  departmentId?: string | null;
};

@Controller("v1/crm/leads")
@UseGuards(TenantGuard, RolesGuard)
export class CrmLeadsController {
  constructor(private readonly crmLeads: CrmLeadsService) {}

  private toActor(user: CrmCurrentUser): CrmActor {
    return {
      id: user.id,
      role: user.role,
      companyId: user.companyId ?? null,
      branchId: user.branchId ?? null,
      departmentId: user.departmentId ?? null,
    };
  }

  @Post()
  @Roles(Role.ADMIN_MASTER, Role.ADMIN, Role.CEO, Role.CMO, Role.SALES, Role.SUPPORT)
  async create(
    @Body() body: CreateCrmLeadDto,
    @CurrentUser() user: CrmCurrentUser,
  ) {
    const actor = this.toActor(user);

    return this.crmLeads.create({
      actor,
      body,
    });
  }

  @Get()
  @Roles(Role.ADMIN_MASTER, Role.ADMIN, Role.CEO, Role.CMO, Role.SALES, Role.SUPPORT, Role.USER)
  async findAll(
    @Query() query: ListCrmLeadsQueryDto,
    @CurrentUser() user: CrmCurrentUser,
  ) {
    return this.crmLeads.findAll(user, query);
  }

  @Get("pipeline")
  @Roles(Role.ADMIN_MASTER, Role.ADMIN, Role.CEO, Role.CMO, Role.SALES, Role.SUPPORT, Role.USER)
  async pipeline(
    @CurrentUser() user: CrmCurrentUser,
  ) {
    const actor = this.toActor(user);
    return this.crmLeads.pipeline(actor);
  }

  @Patch("bulk")
  @Roles(Role.ADMIN_MASTER, Role.ADMIN, Role.CEO, Role.CMO, Role.SALES, Role.SUPPORT, Role.USER)
  async bulkUpdate(
    @Body() body: BulkUpdateCrmLeadsDto,
    @CurrentUser() user: CrmCurrentUser,
  ) {
    const actor = this.toActor(user);
    return this.crmLeads.bulkUpdate(actor, body);
  }

  @Get("saved-views")
  @Roles(Role.ADMIN_MASTER, Role.ADMIN, Role.CEO, Role.CMO, Role.SALES, Role.SUPPORT, Role.USER)
  async findSavedViews(
    @CurrentUser() user: CrmCurrentUser,
  ) {
    const actor = this.toActor(user);
    return this.crmLeads.findSavedViews(actor);
  }

  @Post("saved-views")
  @Roles(Role.ADMIN_MASTER, Role.ADMIN, Role.CEO, Role.CMO, Role.SALES, Role.SUPPORT, Role.USER)
  async createSavedView(
    @Body() body: CreateCrmSavedViewDto,
    @CurrentUser() user: CrmCurrentUser,
  ) {
    const actor = this.toActor(user);

    return this.crmLeads.createSavedView({
      actor,
      body,
    });
  }

  @Delete("saved-views/:viewId")
  @Roles(Role.ADMIN_MASTER, Role.ADMIN, Role.CEO, Role.CMO, Role.SALES, Role.SUPPORT, Role.USER)
  async removeSavedView(
    @Param("viewId") viewId: string,
    @CurrentUser() user: CrmCurrentUser,
  ) {
    const actor = this.toActor(user);
    return this.crmLeads.removeSavedView(viewId, actor);
  }

  @Get(":id")
  @Roles(Role.ADMIN_MASTER, Role.ADMIN, Role.CEO, Role.CMO, Role.SALES, Role.SUPPORT, Role.USER)
  async findOne(
    @Param("id") id: string,
    @CurrentUser() user: CrmCurrentUser,
  ) {
    return this.crmLeads.findOneDetailed(id, user);
  }

  @Get(":id/activities")
  @Roles(Role.ADMIN_MASTER, Role.ADMIN, Role.CEO, Role.CMO, Role.SALES, Role.SUPPORT, Role.USER)
  async activities(
    @Param("id") id: string,
    @CurrentUser() user: CrmCurrentUser,
  ) {
    const actor = this.toActor(user);
    return this.crmLeads.findActivities(id, actor);
  }

  @Post(":id/activities")
  @Roles(Role.ADMIN_MASTER, Role.ADMIN, Role.CEO, Role.CMO, Role.SALES, Role.SUPPORT, Role.USER)
  async createActivity(
    @Param("id") id: string,
    @Body() body: CreateCrmLeadActivityDto,
    @CurrentUser() user: CrmCurrentUser,
  ) {
    const actor = this.toActor(user);

    return this.crmLeads.createManualActivity({
      leadId: id,
      actor,
      body,
    });
  }

  @Get(":id/tasks")
  @Roles(Role.ADMIN_MASTER, Role.ADMIN, Role.CEO, Role.CMO, Role.SALES, Role.SUPPORT, Role.USER)
  async tasks(
    @Param("id") id: string,
    @CurrentUser() user: CrmCurrentUser,
  ) {
    const actor = this.toActor(user);
    return this.crmLeads.findTasks(id, actor);
  }

  @Post(":id/tasks")
  @Roles(Role.ADMIN_MASTER, Role.ADMIN, Role.CEO, Role.CMO, Role.SALES, Role.SUPPORT)
  async createTask(
    @Param("id") id: string,
    @Body() body: CreateCrmLeadTaskDto,
    @CurrentUser() user: CrmCurrentUser,
  ) {
    const actor = this.toActor(user);

    return this.crmLeads.createTask({
      leadId: id,
      actor,
      body,
    });
  }

  @Patch("tasks/:taskId/complete")
  @Roles(Role.ADMIN_MASTER, Role.ADMIN, Role.CEO, Role.CMO, Role.SALES, Role.SUPPORT)
  async completeTask(
    @Param("taskId") taskId: string,
    @CurrentUser() user: CrmCurrentUser,
  ) {
    const actor = this.toActor(user);
    return this.crmLeads.completeTask(taskId, actor);
  }

  @Patch("tasks/:taskId/reopen")
  @Roles(Role.ADMIN_MASTER, Role.ADMIN, Role.CEO, Role.CMO, Role.SALES, Role.SUPPORT)
  async reopenTask(
    @Param("taskId") taskId: string,
    @CurrentUser() user: CrmCurrentUser,
  ) {
    const actor = this.toActor(user);
    return this.crmLeads.reopenTask(taskId, actor);
  }

  @Patch(":id")
  @Roles(Role.ADMIN_MASTER, Role.ADMIN, Role.CEO, Role.CMO, Role.SALES, Role.SUPPORT)
  async update(
    @Param("id") id: string,
    @Body() body: UpdateCrmLeadDto,
    @CurrentUser() user: CrmCurrentUser,
  ) {
    const actor = this.toActor(user);
    return this.crmLeads.update(id, actor, body);
  }

    @Patch(":leadId/move-stage")
  @Roles(Role.ADMIN_MASTER, Role.ADMIN, Role.CEO, Role.CMO, Role.SALES)
  async moveStage(
    @Param("leadId") leadId: string,
    @Body() body: MoveLeadStageDto,
    @CurrentUser() user: CrmCurrentUser,
  ) {
    const actor = this.toActor(user);
    return this.crmLeads.moveLeadStage(
      leadId,
      actor,
      body.pipelineId,
      body.stageId,
    );
  }

  @Delete(":id")
  @Roles(Role.ADMIN_MASTER, Role.ADMIN, Role.CEO, Role.CMO, Role.SALES)
  async remove(
    @Param("id") id: string,
    @CurrentUser() user: CrmCurrentUser,
  ) {
    const actor = this.toActor(user);
    return this.crmLeads.remove(id, actor);
  }
}


