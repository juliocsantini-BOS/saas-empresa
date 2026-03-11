import { Module } from "@nestjs/common";
import { UsersService } from "./users.service";
import { UsersController } from "./users.controller";
import { PrismaModule } from "../prisma/prisma.module";
import { PermissionsModule } from "../common/permissions/permissions.module";
import { RolesGuard } from "../common/guards/roles.guard";
import { TenantGuard } from "../common/guards/tenant.guard";

@Module({
  imports: [PrismaModule, PermissionsModule],
  controllers: [UsersController],
  providers: [
    UsersService,
    RolesGuard,
    TenantGuard,
  ],
})
export class UsersModule {}