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
import { CrmSalesTargetsService } from "./crm-sales-targets.service";
import { CreateSalesTargetDto } from "./dto/create-sales-target.dto";

type SalesTargetCurrentUser = {
  id: string;
  role: Role;
  companyId?: string | null;
  branchId?: string | null;
  departmentId?: string | null;
};

@Controller("v1/crm/sales-targets")
@UseGuards(TenantGuard, RolesGuard)
export class CrmSalesTargetsController {
  constructor(private readonly service: CrmSalesTargetsService) {}

  @Post()
  @Roles(Role.ADMIN_MASTER, Role.ADMIN, Role.CEO, Role.CMO)
  @RequirePermissions("crm.sales_targets.create")
  async create(
    @Body() body: CreateSalesTargetDto,
    @CurrentUser() user: SalesTargetCurrentUser,
  ) {
    return this.service.create(user, body);
  }

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
  @RequirePermissions("crm.sales_targets.read")
  async list(@CurrentUser() user: SalesTargetCurrentUser) {
    return this.service.list(user);
  }

  @Delete(":id")
  @Roles(Role.ADMIN_MASTER, Role.ADMIN, Role.CEO, Role.CMO)
  @RequirePermissions("crm.sales_targets.delete")
  async remove(
    @Param("id") id: string,
    @CurrentUser() user: SalesTargetCurrentUser,
  ) {
    return this.service.remove(user, id);
  }
}