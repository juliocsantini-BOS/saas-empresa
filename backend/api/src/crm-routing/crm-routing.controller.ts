import { Body, Controller, Get, Param, Post, UseGuards } from "@nestjs/common";
import { Role } from "@prisma/client";
import { CurrentUser } from "../common/decorators/current-user.decorator";
import { Roles } from "../common/decorators/roles.decorator";
import { RolesGuard } from "../common/guards/roles.guard";
import { TenantGuard } from "../common/guards/tenant.guard";
import { CrmRoutingService } from "./crm-routing.service";

@Controller("v1/crm/routing")
@UseGuards(TenantGuard, RolesGuard)
export class CrmRoutingController {
  constructor(private readonly service: CrmRoutingService) {}

  @Get("rules")
  @Roles(Role.ADMIN_MASTER, Role.ADMIN, Role.CEO, Role.CMO, Role.SALES, Role.SUPPORT, Role.USER)
  listRules(@CurrentUser() user: any) {
    return this.service.listRules(user);
  }

  @Post("rules")
  @Roles(Role.ADMIN_MASTER, Role.ADMIN, Role.CEO, Role.CMO, Role.SALES)
  createRule(@CurrentUser() user: any, @Body() body: any) {
    return this.service.createRule(user, body);
  }

  @Post("preview")
  @Roles(Role.ADMIN_MASTER, Role.ADMIN, Role.CEO, Role.CMO, Role.SALES)
  preview(@CurrentUser() user: any, @Body() body: any) {
    return this.service.preview(user, body);
  }

  @Post("apply/:leadId")
  @Roles(Role.ADMIN_MASTER, Role.ADMIN, Role.CEO, Role.CMO, Role.SALES)
  apply(@CurrentUser() user: any, @Param("leadId") leadId: string) {
    return this.service.apply(user, leadId);
  }
}
