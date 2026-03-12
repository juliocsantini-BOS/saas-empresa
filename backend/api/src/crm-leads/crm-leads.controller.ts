import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from "@nestjs/common";
import { Role } from "@prisma/client";
import { CurrentUser } from "../common/decorators/current-user.decorator";
import { Roles } from "../common/decorators/roles.decorator";
import { RolesGuard } from "../common/guards/roles.guard";
import { TenantGuard } from "../common/guards/tenant.guard";
import { CrmLeadsService } from "./crm-leads.service";
import { CreateCrmLeadDto } from "./dto/create-crm-lead.dto";
import { UpdateCrmLeadDto } from "./dto/update-crm-lead.dto";
import { CreateCrmLeadTaskDto } from "./dto/create-crm-lead-task.dto";
import { CreateCrmLeadActivityDto } from "./dto/create-crm-lead-activity.dto";
import { CreateCrmSavedViewDto } from "./dto/create-crm-saved-view.dto";
import { BulkUpdateCrmLeadsDto } from "./dto/bulk-update-crm-leads.dto";

type CrmCurrentUser = {
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

  @Post()
  @Roles(Role.ADMIN_MASTER, Role.ADMIN, Role.CEO, Role.CMO, Role.SALES, Role.SUPPORT)
  async create(
    @Body() body: CreateCrmLeadDto,
    @CurrentUser() user: CrmCurrentUser,
  ) {
    return this.crmLeads.create({
      actor: user,
      body,
    });
  }

  @Get()
  @Roles(Role.ADMIN_MASTER, Role.ADMIN, Role.CEO, Role.CMO, Role.SALES, Role.SUPPORT, Role.USER)
  async findAll(
    @CurrentUser() user: CrmCurrentUser,
  ) {
    return this.crmLeads.findAll(user);
  }

  @Get("pipeline")
  @Roles(Role.ADMIN_MASTER, Role.ADMIN, Role.CEO, Role.CMO, Role.SALES, Role.SUPPORT, Role.USER)
  async pipeline(
    @CurrentUser() user: CrmCurrentUser,
  ) {
    return this.crmLeads.pipeline(user);
  }

  @Patch("bulk")
  @Roles(Role.ADMIN_MASTER, Role.ADMIN, Role.CEO, Role.CMO, Role.SALES, Role.SUPPORT, Role.USER)
  async bulkUpdate(
    @Body() body: BulkUpdateCrmLeadsDto,
    @CurrentUser() user: CrmCurrentUser,
  ) {
    return this.crmLeads.bulkUpdate(user, body);
  }

  @Get(":id/activities")
  @Roles(Role.ADMIN_MASTER, Role.ADMIN, Role.CEO, Role.CMO, Role.SALES, Role.SUPPORT, Role.USER)
  async activities(
    @Param("id") id: string,
    @CurrentUser() user: CrmCurrentUser,
  ) {
    return this.crmLeads.findActivities(id, user);
  }

  @Post(":id/activities")
  @Roles(Role.ADMIN_MASTER, Role.ADMIN, Role.CEO, Role.CMO, Role.SALES, Role.SUPPORT, Role.USER)
  async createActivity(
    @Param("id") id: string,
    @Body() body: CreateCrmLeadActivityDto,
    @CurrentUser() user: CrmCurrentUser,
  ) {
    return this.crmLeads.createManualActivity({
      leadId: id,
      actor: user,
      body,
    });
  }

  @Get(":id/tasks")
  @Roles(Role.ADMIN_MASTER, Role.ADMIN, Role.CEO, Role.CMO, Role.SALES, Role.SUPPORT, Role.USER)
  async tasks(
    @Param("id") id: string,
    @CurrentUser() user: CrmCurrentUser,
  ) {
    return this.crmLeads.findTasks(id, user);
  }

  @Post(":id/tasks")
  @Roles(Role.ADMIN_MASTER, Role.ADMIN, Role.CEO, Role.CMO, Role.SALES, Role.SUPPORT)
  async createTask(
    @Param("id") id: string,
    @Body() body: CreateCrmLeadTaskDto,
    @CurrentUser() user: CrmCurrentUser,
  ) {
    return this.crmLeads.createTask({
      leadId: id,
      actor: user,
      body,
    });
  }

  @Patch("tasks/:taskId/complete")
  @Roles(Role.ADMIN_MASTER, Role.ADMIN, Role.CEO, Role.CMO, Role.SALES, Role.SUPPORT)
  async completeTask(
    @Param("taskId") taskId: string,
    @CurrentUser() user: CrmCurrentUser,
  ) {
    return this.crmLeads.completeTask(taskId, user);
  }

  @Patch("tasks/:taskId/reopen")
  @Roles(Role.ADMIN_MASTER, Role.ADMIN, Role.CEO, Role.CMO, Role.SALES, Role.SUPPORT)
  async reopenTask(
    @Param("taskId") taskId: string,
    @CurrentUser() user: CrmCurrentUser,
  ) {
    return this.crmLeads.reopenTask(taskId, user);
  }

  @Patch(":id")
  @Roles(Role.ADMIN_MASTER, Role.ADMIN, Role.CEO, Role.CMO, Role.SALES, Role.SUPPORT)
  async update(
    @Param("id") id: string,
    @Body() body: UpdateCrmLeadDto,
    @CurrentUser() user: CrmCurrentUser,
  ) {
    return this.crmLeads.update(id, user, body);
  }

  @Delete(":id")
  @Roles(Role.ADMIN_MASTER, Role.ADMIN, Role.CEO, Role.CMO, Role.SALES)
  async remove(
    @Param("id") id: string,
    @CurrentUser() user: CrmCurrentUser,
  ) {
    return this.crmLeads.remove(id, user);
  }
}
