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

@Controller("v1/crm/leads")
@UseGuards(TenantGuard, RolesGuard)
export class CrmLeadsController {
  constructor(private readonly crmLeads: CrmLeadsService) {}

  @Post()
  @Roles(Role.ADMIN_MASTER, Role.ADMIN, Role.CEO, Role.CMO, Role.SALES, Role.SUPPORT)
  async create(
    @Body() body: CreateCrmLeadDto,
    @CurrentUser() user: { id: string; companyId?: string | null },
  ) {
    return this.crmLeads.create({
      companyId: String(user.companyId ?? "").trim(),
      currentUserId: user.id,
      body,
    });
  }

  @Get()
  @Roles(Role.ADMIN_MASTER, Role.ADMIN, Role.CEO, Role.CMO, Role.SALES, Role.SUPPORT, Role.USER)
  async findAll(
    @CurrentUser() user: { companyId?: string | null },
  ) {
    return this.crmLeads.findAll(String(user.companyId ?? "").trim());
  }

  @Get("pipeline")
  @Roles(Role.ADMIN_MASTER, Role.ADMIN, Role.CEO, Role.CMO, Role.SALES, Role.SUPPORT, Role.USER)
  async pipeline(
    @CurrentUser() user: { companyId?: string | null },
  ) {
    return this.crmLeads.pipeline(String(user.companyId ?? "").trim());
  }

  @Get(":id/activities")
  @Roles(Role.ADMIN_MASTER, Role.ADMIN, Role.CEO, Role.CMO, Role.SALES, Role.SUPPORT, Role.USER)
  async activities(
    @Param("id") id: string,
    @CurrentUser() user: { companyId?: string | null },
  ) {
    return this.crmLeads.findActivities(id, String(user.companyId ?? "").trim());
  }

  @Post(":id/activities")
  @Roles(Role.ADMIN_MASTER, Role.ADMIN, Role.CEO, Role.CMO, Role.SALES, Role.SUPPORT, Role.USER)
  async createActivity(
    @Param("id") id: string,
    @Body() body: CreateCrmLeadActivityDto,
    @CurrentUser() user: { id: string; companyId?: string | null },
  ) {
    return this.crmLeads.createManualActivity({
      leadId: id,
      companyId: String(user.companyId ?? "").trim(),
      currentUserId: user.id,
      body,
    });
  }

  @Get(":id/tasks")
  @Roles(Role.ADMIN_MASTER, Role.ADMIN, Role.CEO, Role.CMO, Role.SALES, Role.SUPPORT, Role.USER)
  async tasks(
    @Param("id") id: string,
    @CurrentUser() user: { companyId?: string | null },
  ) {
    return this.crmLeads.findTasks(id, String(user.companyId ?? "").trim());
  }

  @Post(":id/tasks")
  @Roles(Role.ADMIN_MASTER, Role.ADMIN, Role.CEO, Role.CMO, Role.SALES, Role.SUPPORT)
  async createTask(
    @Param("id") id: string,
    @Body() body: CreateCrmLeadTaskDto,
    @CurrentUser() user: { id: string; companyId?: string | null },
  ) {
    return this.crmLeads.createTask({
      leadId: id,
      companyId: String(user.companyId ?? "").trim(),
      currentUserId: user.id,
      body,
    });
  }

  @Patch("tasks/:taskId/complete")
  @Roles(Role.ADMIN_MASTER, Role.ADMIN, Role.CEO, Role.CMO, Role.SALES, Role.SUPPORT)
  async completeTask(
    @Param("taskId") taskId: string,
    @CurrentUser() user: { id: string; companyId?: string | null },
  ) {
    return this.crmLeads.completeTask(
      taskId,
      String(user.companyId ?? "").trim(),
      user.id,
    );
  }

  @Patch(":id")
  @Roles(Role.ADMIN_MASTER, Role.ADMIN, Role.CEO, Role.CMO, Role.SALES, Role.SUPPORT)
  async update(
    @Param("id") id: string,
    @Body() body: UpdateCrmLeadDto,
    @CurrentUser() user: { id: string; companyId?: string | null },
  ) {
    return this.crmLeads.update(
      id,
      String(user.companyId ?? "").trim(),
      user.id,
      body,
    );
  }

  @Delete(":id")
  @Roles(Role.ADMIN_MASTER, Role.ADMIN, Role.CEO, Role.CMO, Role.SALES)
  async remove(
    @Param("id") id: string,
    @CurrentUser() user: { companyId?: string | null },
  ) {
    return this.crmLeads.remove(id, String(user.companyId ?? "").trim());
  }
}
