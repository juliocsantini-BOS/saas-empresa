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
import { AuthGuard } from "@nestjs/passport";
import { DepartmentsService } from "./departments.service";
import { CurrentUser } from "../common/decorators/current-user.decorator";
import { CreateDepartmentDto } from "./dto/create-department.dto";
import { UpdateDepartmentDto } from "./dto/update-department.dto";
import { RequirePermissions } from "../common/decorators/require-permissions.decorator";
import { Role } from "@prisma/client";
import { Roles } from "../common/decorators/roles.decorator";
import { RolesGuard } from "../common/guards/roles.guard";
import { TenantGuard } from "../common/guards/tenant.guard";

@Controller("v1/departments")
@UseGuards(AuthGuard("jwt"), TenantGuard, RolesGuard)
export class DepartmentsController {
  constructor(private readonly service: DepartmentsService) {}

  @Post()
  @Roles(Role.ADMIN_MASTER, Role.ADMIN, Role.CEO)
  @RequirePermissions("departments.create")
  async create(@Body() body: CreateDepartmentDto, @CurrentUser() user: any) {
    return this.service.create(user?.companyId ?? null, body?.branchId, body?.name);
  }

  @Get()
  @Roles(Role.ADMIN_MASTER, Role.ADMIN, Role.CEO, Role.SUPPORT, Role.CFO, Role.CMO, Role.FINANCE, Role.SALES, Role.USER)
  @RequirePermissions("departments.read")
  async list(@CurrentUser() user: any) {
    return this.service.list({
      userId: user?.id,
      role: user?.role,
      companyId: user?.companyId ?? null,
      branchId: user?.branchId ?? null,
      departmentId: user?.departmentId ?? null,
    });
  }

  @Patch(":id")
  @Roles(Role.ADMIN_MASTER, Role.ADMIN, Role.CEO)
  @RequirePermissions("departments.update")
  async rename(
    @Param("id") id: string,
    @Body() body: UpdateDepartmentDto,
    @CurrentUser() user: any,
  ) {
    return this.service.rename(user?.companyId ?? null, id, body?.name);
  }

  @Delete(":id")
  @Roles(Role.ADMIN_MASTER, Role.ADMIN, Role.CEO)
  @RequirePermissions("departments.delete")
  async remove(@Param("id") id: string, @CurrentUser() user: any) {
    return this.service.remove(user?.companyId ?? null, id);
  }
}