import {
  Body,
  Controller,
  Get,
  Post,
  Delete,
  Param,
  UseGuards,
  BadRequestException,
} from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { RbacService } from "./rbac.service";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { TenantGuard } from "../../common/guards/tenant.guard";
import { RolesGuard } from "../../common/guards/roles.guard";
import { Roles } from "../../common/decorators/roles.decorator";
import { RequirePermissions } from "../../common/decorators/require-permissions.decorator";
import { Role } from "@prisma/client";

@Controller("v1/rbac")
@UseGuards(AuthGuard("jwt"), TenantGuard, RolesGuard)
export class RbacController {
  constructor(private readonly service: RbacService) {}

  @Get("permissions")
  @Roles(Role.ADMIN_MASTER, Role.ADMIN)
  @RequirePermissions("rbac.permissions.read")
  listPermissions() {
    return this.service.listPermissions();
  }

  @Get("roles")
  @Roles(Role.ADMIN_MASTER, Role.ADMIN)
  @RequirePermissions("rbac.roles.read")
  listRoles() {
    return this.service.listRoles();
  }

  @Get("roles/:role/permissions")
  @Roles(Role.ADMIN_MASTER, Role.ADMIN)
  @RequirePermissions("rbac.roles.read", "rbac.permissions.read")
  listRolePermissions(@Param("role") role: string) {
    return this.service.listRolePermissions(role);
  }

  @Get("me")
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
  getMyPermissions(@CurrentUser() user: any) {
    return this.service.getUserPermissions(user.id, user.companyId, user.role);
  }

  @Get("users/:userId/overrides")
  @Roles(Role.ADMIN_MASTER, Role.ADMIN)
  @RequirePermissions("rbac.user_permissions.read")
  listUserOverrides(@Param("userId") userId: string, @CurrentUser() user: any) {
    const companyId = String(user.companyId ?? "").trim();
    if (!companyId && user.role !== Role.ADMIN_MASTER) {
      throw new BadRequestException("Token sem companyId.");
    }
    return this.service.listUserOverrides(userId, companyId);
  }

  @Post("users/:userId/allow")
  @Roles(Role.ADMIN_MASTER, Role.ADMIN)
  @RequirePermissions("rbac.user_permissions.allow")
  allow(
    @Param("userId") userId: string,
    @Body("permKey") permKey: string,
    @CurrentUser() user: any,
  ) {
    const companyId = String(user.companyId ?? "").trim();
    if (!companyId && user.role !== Role.ADMIN_MASTER) {
      throw new BadRequestException("Token sem companyId.");
    }
    return this.service.allowPermission(userId, companyId, permKey, user.role);
  }

  @Post("users/:userId/deny")
  @Roles(Role.ADMIN_MASTER, Role.ADMIN)
  @RequirePermissions("rbac.user_permissions.deny")
  deny(
    @Param("userId") userId: string,
    @Body("permKey") permKey: string,
    @CurrentUser() user: any,
  ) {
    const companyId = String(user.companyId ?? "").trim();
    if (!companyId && user.role !== Role.ADMIN_MASTER) {
      throw new BadRequestException("Token sem companyId.");
    }
    return this.service.denyPermission(userId, companyId, permKey, user.role);
  }

  @Delete("users/:userId/:permKey")
  @Roles(Role.ADMIN_MASTER, Role.ADMIN)
  @RequirePermissions("rbac.user_permissions.revoke")
  remove(
    @Param("userId") userId: string,
    @Param("permKey") permKey: string,
    @CurrentUser() user: any,
  ) {
    const companyId = String(user.companyId ?? "").trim();
    if (!companyId && user.role !== Role.ADMIN_MASTER) {
      throw new BadRequestException("Token sem companyId.");
    }
    return this.service.removeOverride(userId, companyId, permKey, user.role);
  }

  @Post("roles/:role/permissions")
  @Roles(Role.ADMIN_MASTER)
  @RequirePermissions("rbac.roles.update")
  addPermissionToRole(
    @Param("role") role: string,
    @Body("permKey") permKey: string,
  ) {
    return this.service.addPermissionToRole(role, permKey);
  }

  @Delete("roles/:role/permissions/:permKey")
  @Roles(Role.ADMIN_MASTER)
  @RequirePermissions("rbac.roles.update")
  removePermissionFromRole(
    @Param("role") role: string,
    @Param("permKey") permKey: string,
  ) {
    return this.service.removePermissionFromRole(role, permKey);
  }
}