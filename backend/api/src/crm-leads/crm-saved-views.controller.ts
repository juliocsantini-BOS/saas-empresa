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
import { Roles } from "../common/decorators/roles.decorator";
import { RolesGuard } from "../common/guards/roles.guard";
import { TenantGuard } from "../common/guards/tenant.guard";
import { CrmLeadsService } from "./crm-leads.service";
import { CreateCrmSavedViewDto } from "./dto/create-crm-saved-view.dto";

type CrmCurrentUser = {
  id: string;
  role: Role;
  companyId?: string | null;
  branchId?: string | null;
  departmentId?: string | null;
};

@Controller("v1/crm/views")
@UseGuards(TenantGuard, RolesGuard)
export class CrmSavedViewsController {
  constructor(private readonly crmLeads: CrmLeadsService) {}

  @Get()
  @Roles(Role.ADMIN_MASTER, Role.ADMIN, Role.CEO, Role.CMO, Role.SALES, Role.SUPPORT, Role.USER)
  async findSavedViews(
    @CurrentUser() user: CrmCurrentUser,
  ) {
    return this.crmLeads.findSavedViews(user);
  }

  @Post()
  @Roles(Role.ADMIN_MASTER, Role.ADMIN, Role.CEO, Role.CMO, Role.SALES, Role.SUPPORT, Role.USER)
  async createSavedView(
    @Body() body: CreateCrmSavedViewDto,
    @CurrentUser() user: CrmCurrentUser,
  ) {
    return this.crmLeads.createSavedView({
      actor: user,
      body,
    });
  }

  @Delete(":viewId")
  @Roles(Role.ADMIN_MASTER, Role.ADMIN, Role.CEO, Role.CMO, Role.SALES, Role.SUPPORT, Role.USER)
  async removeSavedView(
    @Param("viewId") viewId: string,
    @CurrentUser() user: CrmCurrentUser,
  ) {
    return this.crmLeads.removeSavedView(viewId, user);
  }
}
