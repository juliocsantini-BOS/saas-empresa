import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from "@nestjs/common";
import { Role } from "@prisma/client";
import { UsersService } from "./users.service";
import { CurrentUser } from "../common/decorators/current-user.decorator";
import { TenantGuard } from "../common/guards/tenant.guard";
import { Roles } from "../common/decorators/roles.decorator";
import { RolesGuard } from "../common/guards/roles.guard";
import { SetMyBranchDto } from "./dto/set-my-branch.dto";
import { SetMyDepartmentDto } from "./dto/set-my-department.dto";
import { CreateUserDto } from "./dto/create-user.dto";
import { UpdateUserRoleDto } from "./dto/update-user-role.dto";
import { UpdateUserStatusDto } from "./dto/update-user-status.dto";
import { UpdateUserBranchDto } from "./dto/update-user-branch.dto";
import { UpdateUserDepartmentDto } from "./dto/update-user-department.dto";
import { ResetUserPasswordDto } from "./dto/reset-user-password.dto";
import { RequirePermissions } from "../common/decorators/require-permissions.decorator";

@Controller("v1/users")
@UseGuards(TenantGuard, RolesGuard)
export class UsersController {
  constructor(private readonly users: UsersService) {}

  @Post()
  @Roles(Role.ADMIN_MASTER, Role.ADMIN)
  @RequirePermissions("users.create")
  async create(
    @Body() body: CreateUserDto,
    @CurrentUser() user: { role: Role; companyId?: string | null },
  ) {
    const companyId = String(user.companyId ?? "").trim();
    if (!companyId) {
      throw new BadRequestException(
        "Token sem companyId. Faça o onboarding/seleção de empresa e gere um token com companyId.",
      );
    }
    return this.users.create({
      email: body?.email,
      name: body?.name,
      password: body?.password,
      role: body?.role,
      companyId,
      branchId: body?.branchId,
      departmentId: body?.departmentId,
    });
  }

  @Get()
  @Roles(Role.ADMIN_MASTER, Role.ADMIN, Role.SUPPORT, Role.CEO, Role.CFO, Role.CMO, Role.FINANCE, Role.SALES, Role.USER)
  @RequirePermissions("users.read")
  async findAll(
    @CurrentUser()
    user: {
      id: string;
      role: Role;
      companyId?: string | null;
      branchId?: string | null;
      departmentId?: string | null;
    },
  ) {
    const companyId = String(user.companyId ?? "").trim();
    if (!companyId) {
      throw new BadRequestException(
        "Token sem companyId. Gere um token com companyId para listar usuários.",
      );
    }
    return this.users.findAll({
      userId: user.id,
      role: user.role,
      companyId,
      branchId: user.branchId ?? null,
      departmentId: user.departmentId ?? null,
    });
  }

  @Get("me")
  @Roles(Role.ADMIN_MASTER, Role.ADMIN, Role.SUPPORT, Role.CEO, Role.USER, Role.CFO, Role.CMO, Role.FINANCE, Role.SALES)
  @RequirePermissions("users.read")
  async me(@CurrentUser() user: { id: string; companyId?: string | null }) {
    const companyId = String(user.companyId ?? "").trim();
    if (!companyId) throw new BadRequestException("Token sem companyId.");
    return this.users.me(user.id, companyId);
  }

  @Post("me/branch")
  @Roles(Role.ADMIN_MASTER, Role.ADMIN, Role.SUPPORT, Role.CEO, Role.USER, Role.CFO, Role.CMO, Role.FINANCE, Role.SALES)
  @RequirePermissions("branches.read", "users.update")
  async setMyBranch(
    @Body() body: SetMyBranchDto,
    @CurrentUser() user: { id: string; companyId?: string | null },
  ) {
    const companyId = String(user.companyId ?? "").trim();
    if (!companyId) throw new BadRequestException("Token sem companyId.");
    return this.users.setMyBranch(user.id, companyId, body?.branchId);
  }

  @Post("me/department")
  @Roles(Role.ADMIN_MASTER, Role.ADMIN, Role.SUPPORT, Role.CEO, Role.USER, Role.CFO, Role.CMO, Role.FINANCE, Role.SALES)
  @RequirePermissions("departments.read", "users.update")
  async setMyDepartment(
    @Body() body: SetMyDepartmentDto,
    @CurrentUser() user: { id: string; companyId?: string | null },
  ) {
    const companyId = String(user.companyId ?? "").trim();
    if (!companyId) throw new BadRequestException("Token sem companyId.");
    return this.users.setMyDepartment(user.id, companyId, body?.departmentId);
  }

  @Patch(":id/role")
  @Roles(Role.ADMIN_MASTER, Role.ADMIN)
  @RequirePermissions("users.update")
  async updateRole(
    @Param("id") id: string,
    @Body() body: UpdateUserRoleDto,
    @CurrentUser() user: { id: string; companyId?: string | null },
  ) {
    const companyId = String(user.companyId ?? "").trim();
    if (!companyId) throw new BadRequestException("Token sem companyId.");
    if (String(user.id ?? "").trim() === String(id ?? "").trim()) {
      throw new BadRequestException("Não é permitido alterar o próprio role por este endpoint.");
    }
    return this.users.updateRole(id, companyId, body.role);
  }

  @Patch(":id/status")
  @Roles(Role.ADMIN_MASTER, Role.ADMIN)
  @RequirePermissions("users.enable", "users.disable")
  async updateStatus(
    @Param("id") id: string,
    @Body() body: UpdateUserStatusDto,
    @CurrentUser() user: { id: string; companyId?: string | null },
  ) {
    const companyId = String(user.companyId ?? "").trim();
    if (!companyId) throw new BadRequestException("Token sem companyId.");
    if (String(user.id ?? "").trim() === String(id ?? "").trim() && body.isActive === false) {
      throw new BadRequestException("Não é permitido desativar o próprio usuário por este endpoint.");
    }
    return this.users.updateStatus(id, companyId, body.isActive);
  }

  @Patch(":id/branch")
  @Roles(Role.ADMIN_MASTER, Role.ADMIN)
  @RequirePermissions("branches.read", "users.update")
  async updateBranch(
    @Param("id") id: string,
    @Body() body: UpdateUserBranchDto,
    @CurrentUser() user: { companyId?: string | null },
  ) {
    const companyId = String(user.companyId ?? "").trim();
    if (!companyId) throw new BadRequestException("Token sem companyId.");
    return this.users.updateBranch(id, companyId, body.branchId);
  }

  @Patch(":id/department")
  @Roles(Role.ADMIN_MASTER, Role.ADMIN)
  @RequirePermissions("departments.read", "users.update")
  async updateDepartment(
    @Param("id") id: string,
    @Body() body: UpdateUserDepartmentDto,
    @CurrentUser() user: { companyId?: string | null },
  ) {
    const companyId = String(user.companyId ?? "").trim();
    if (!companyId) throw new BadRequestException("Token sem companyId.");
    return this.users.updateDepartment(id, companyId, body.departmentId);
  }

  @Post(":id/reset-password")
  @Roles(Role.ADMIN_MASTER, Role.ADMIN)
  @RequirePermissions("users.reset_password")
  async resetPassword(
    @Param("id") id: string,
    @Body() body: ResetUserPasswordDto,
    @CurrentUser() user: { companyId?: string | null },
  ) {
    const companyId = String(user.companyId ?? "").trim();
    if (!companyId) throw new BadRequestException("Token sem companyId.");
    return this.users.resetPassword(id, companyId, body.password);
  }
}