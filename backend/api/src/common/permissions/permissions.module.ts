import { Module } from "@nestjs/common";
import { PermissionsSyncService } from "./permissions-sync.service";
import { PermissionsCacheService } from "./permissions-cache.service";
import { RedisModule } from "../redis/redis.module";
import { PrismaModule } from "../../prisma/prisma.module";

@Module({
  imports: [RedisModule, PrismaModule],
  providers: [PermissionsSyncService, PermissionsCacheService],
  exports: [PermissionsCacheService, PermissionsSyncService],
})
export class PermissionsModule {}