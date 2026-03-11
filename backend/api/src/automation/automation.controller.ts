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
import { AutomationService } from "./automation.service";
import { CreateAutomationRuleDto } from "./dto/create-automation-rule.dto";
import { UpdateAutomationRuleDto } from "./dto/update-automation-rule.dto";
import { ListAutomationExecutionsQueryDto } from "./dto/list-automation-executions.query.dto";

@Controller("v1/automation")
@UseGuards(TenantGuard, RolesGuard)
export class AutomationController {
  constructor(private readonly automation: AutomationService) {}

  @Get("rules")
  @Roles(Role.ADMIN_MASTER, Role.ADMIN, Role.CEO, Role.CMO, Role.CFO, Role.SALES, Role.SUPPORT)
  async listRules(
    @CurrentUser() user: { companyId?: string | null },
  ) {
    return this.automation.listRules(String(user.companyId ?? "").trim());
  }

  @Post("rules")
  @Roles(Role.ADMIN_MASTER, Role.ADMIN, Role.CEO)
  async createRule(
    @Body() body: CreateAutomationRuleDto,
    @CurrentUser() user: { companyId?: string | null },
  ) {
    return this.automation.createRule({
      companyId: String(user.companyId ?? "").trim(),
      body,
    });
  }

  @Patch("rules/:id")
  @Roles(Role.ADMIN_MASTER, Role.ADMIN, Role.CEO)
  async updateRule(
    @Param("id") id: string,
    @Body() body: UpdateAutomationRuleDto,
    @CurrentUser() user: { companyId?: string | null },
  ) {
    return this.automation.updateRule({
      id,
      companyId: String(user.companyId ?? "").trim(),
      body,
    });
  }

  @Delete("rules/:id")
  @Roles(Role.ADMIN_MASTER, Role.ADMIN, Role.CEO)
  async deleteRule(
    @Param("id") id: string,
    @CurrentUser() user: { companyId?: string | null },
  ) {
    return this.automation.deleteRule(id, String(user.companyId ?? "").trim());
  }

  @Get("executions")
  @Roles(Role.ADMIN_MASTER, Role.ADMIN, Role.CEO, Role.CMO, Role.CFO, Role.SUPPORT)
  async listExecutions(
    @Query() query: ListAutomationExecutionsQueryDto,
    @CurrentUser() user: { companyId?: string | null },
  ) {
    return this.automation.listExecutions(
      String(user.companyId ?? "").trim(),
      query,
    );
  }

  @Post("run/maintenance")
  @Roles(Role.ADMIN_MASTER, Role.ADMIN, Role.CEO, Role.SUPPORT)
  async runMaintenance(
    @CurrentUser() user: { companyId?: string | null },
  ) {
    return this.automation.runMaintenance(String(user.companyId ?? "").trim());
  }
}
