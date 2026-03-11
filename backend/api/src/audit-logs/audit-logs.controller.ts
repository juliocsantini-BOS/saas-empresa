import {
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  Req,
  UseGuards,
} from "@nestjs/common";
import { AuditLogsService } from "./audit-logs.service";
import { Roles } from "../common/decorators/roles.decorator";
import { RolesGuard } from "../common/guards/roles.guard";
import { TenantGuard } from "../common/guards/tenant.guard";
import { RequirePermissions } from "../common/decorators/require-permissions.decorator";
import { Role } from "@prisma/client";
import { ListAuditLogsQueryDto } from "./dto/list-audit-logs.query.dto";

@Controller("v1/audit-logs")
@UseGuards(TenantGuard, RolesGuard)
export class AuditLogsController {
  constructor(private readonly service: AuditLogsService) {}

  @Get()
  @Roles(Role.ADMIN_MASTER, Role.ADMIN, Role.SUPPORT)
  @RequirePermissions("audit.read")
  async list(@Query() q: ListAuditLogsQueryDto, @Req() req: any) {
    const role = req?.user?.role ?? "";
    const companyId = req?.user?.companyId ?? null;

    return this.service.list({
      requesterRole: String(role),
      requesterCompanyId: companyId,
      take: q.take,
      skip: q.skip,
      order: q.order,
      includePayload: q.includePayload,
      companyId: q.companyId,
      userId: q.userId,
      method: q.method,
      path: q.path,
      statusCode: q.statusCode,
      ip: q.ip,
      hasBody: q.hasBody,
      from: q.from,
      to: q.to,
    });
  }

  @Get(":id")
  @Roles(Role.ADMIN_MASTER, Role.ADMIN, Role.SUPPORT)
  @RequirePermissions("audit.read")
  async get(
    @Param("id") id: string,
    @Query("includePayload") includePayload: string,
    @Req() req: any,
  ) {
    const role = req?.user?.role ?? "";
    const companyId = req?.user?.companyId ?? null;

    const row = await this.service.getById(String(id), {
      requesterRole: String(role),
      requesterCompanyId: companyId,
      includePayload,
    });

    if (row === "__FORBIDDEN__") return { message: "Not found" };
    if (!row) return { message: "Not found" };
    return row;
  }

  @Delete(":id")
  @Roles(Role.ADMIN_MASTER)
  @RequirePermissions("audit.export")
  async delete(@Param("id") id: string) {
    try {
      await this.service.deleteById(String(id));
      return { ok: true };
    } catch {
      return { ok: false, message: "Not found" };
    }
  }

  @Post("purge")
  @Roles(Role.ADMIN_MASTER)
  @RequirePermissions("audit.export")
  async purge(@Query("days") days: string, @Query("companyId") companyId?: string) {
    const n = Number(days);
    const safeDays = Number.isFinite(n) ? n : 30;

    return this.service.purge({
      days: safeDays,
      companyId: companyId ? String(companyId) : null,
    });
  }
}