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
import { BranchesService } from "./branches.service";
import { CurrentUser } from "../common/decorators/current-user.decorator";
import { CreateBranchDto } from "./dto/create-branch.dto";
import { UpdateBranchDto } from "./dto/update-branch.dto";
import { RequirePermissions } from "../common/decorators/require-permissions.decorator";
import { Role } from "@prisma/client";
import { Roles } from "../common/decorators/roles.decorator";
import { RolesGuard } from "../common/guards/roles.guard";
import { TenantGuard } from "../common/guards/tenant.guard";

@Controller("v1/branches")
@UseGuards(AuthGuard("jwt"), TenantGuard, RolesGuard)
export class BranchesController {
  constructor(private readonly service: BranchesService) {}

  @Post()
  @Roles(Role.ADMIN_MASTER, Role.ADMIN, Role.CEO)
  @RequirePermissions("branches.create")
  async create(@Body() body: CreateBranchDto, @CurrentUser() user: any) {
    return this.service.create(user?.companyId ?? null, body.name);
  }

  @Get()
  @Roles(Role.ADMIN_MASTER, Role.ADMIN, Role.CEO, Role.SUPPORT, Role.CFO, Role.CMO, Role.FINANCE, Role.SALES, Role.USER)
  @RequirePermissions("branches.read")
  async list(@CurrentUser() user: any) {
    return this.service.list({
      userId: user?.id,
      role: user?.role,
      companyId: user?.companyId ?? null,
      branchId: user?.branchId ?? null,
    });
  }

  @Patch(":id")
  @Roles(Role.ADMIN_MASTER, Role.ADMIN, Role.CEO)
  @RequirePermissions("branches.update")
  async rename(
    @Param("id") id: string,
    @Body() body: UpdateBranchDto,
    @CurrentUser() user: any,
  ) {
    return this.service.rename(user?.companyId ?? null, id, body.name);
  }

  @Delete(":id")
  @Roles(Role.ADMIN_MASTER, Role.ADMIN, Role.CEO)
  @RequirePermissions("branches.delete")
  async remove(@Param("id") id: string, @CurrentUser() user: any) {
    return this.service.remove(user?.companyId ?? null, id);
  }
}