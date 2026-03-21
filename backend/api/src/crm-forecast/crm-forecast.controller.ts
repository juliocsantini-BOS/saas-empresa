import { Body, Controller, Get, Post, UseGuards } from "@nestjs/common";
import { Role } from "@prisma/client";
import { CurrentUser } from "../common/decorators/current-user.decorator";
import { Roles } from "../common/decorators/roles.decorator";
import { RolesGuard } from "../common/guards/roles.guard";
import { TenantGuard } from "../common/guards/tenant.guard";
import { CrmForecastService } from "./crm-forecast.service";

@Controller("v1/crm/forecast")
@UseGuards(TenantGuard, RolesGuard)
export class CrmForecastController {
  constructor(private readonly service: CrmForecastService) {}

  @Get("summary")
  @Roles(Role.ADMIN_MASTER, Role.ADMIN, Role.CEO, Role.CFO, Role.CMO, Role.SALES, Role.USER)
  summary(@CurrentUser() user: any) {
    return this.service.summary(user);
  }

  @Post("snapshots")
  @Roles(Role.ADMIN_MASTER, Role.ADMIN, Role.CEO, Role.CFO, Role.CMO, Role.SALES)
  createSnapshot(@CurrentUser() user: any, @Body() body: any) {
    return this.service.createSnapshot(user, body);
  }

  @Post("adjustments")
  @Roles(Role.ADMIN_MASTER, Role.ADMIN, Role.CEO, Role.CFO, Role.CMO, Role.SALES)
  createAdjustment(@CurrentUser() user: any, @Body() body: any) {
    return this.service.createAdjustment(user, body);
  }
}
