import { Controller, Get, UseGuards } from "@nestjs/common";
import { Roles } from "../common/decorators/roles.decorator";
import { RolesGuard } from "../common/guards/roles.guard";
import { TenantGuard } from "../common/guards/tenant.guard";
import { Role } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";

@Controller("v1/admin/health")
@UseGuards(TenantGuard, RolesGuard)
export class AdminHealthController {
  constructor(private prisma: PrismaService) {}

  @Get()
  @Roles(Role.ADMIN_MASTER)
  async health() {
    // Ping simples no DB (sem vazar schema)
    await this.prisma.$queryRaw`SELECT 1`;
    return { ok: true, db: "ok" };
  }
}