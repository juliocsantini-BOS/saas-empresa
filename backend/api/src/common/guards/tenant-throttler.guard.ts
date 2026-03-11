import { Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { ThrottlerGuard } from "@nestjs/throttler";
import type { ThrottlerModuleOptions, ThrottlerStorage } from "@nestjs/throttler";

@Injectable()
export class TenantThrottlerGuard extends ThrottlerGuard {
  constructor(
    options: ThrottlerModuleOptions,
    storageService: ThrottlerStorage,
    reflector: Reflector,
  ) {
    super(options, storageService, reflector);
  }

  protected async getTracker(req: Record<string, any>): Promise<string> {
    const companyId = req?.user?.companyId ? String(req.user.companyId) : "";
    if (companyId) return `tenant:${companyId}`;

    const userId = req?.user?.id ? String(req.user.id) : "";
    if (userId) return `user:${userId}`;

    const xf = req?.headers?.["x-forwarded-for"]
      ?.toString()
      .split(",")[0]
      ?.trim();

    return xf || req.ip || "unknown";
  }
}
