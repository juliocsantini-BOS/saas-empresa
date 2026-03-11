import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { RedisService } from "../redis/redis.service";
import { PermissionEffect, Role } from "@prisma/client";

type EffectivePermsCache = {
  perms: string[];
  computedAt: string;
  v: number;
};

@Injectable()
export class PermissionsCacheService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
  ) {}

  private ttlSec(): number {
    const v = Number(process.env.PERMS_CACHE_TTL_SEC ?? "180");
    return Number.isFinite(v) ? Math.max(30, v) : 180;
  }

  private key(companyId: string, userId: string, role: Role) {
    return `rbac:perms:v3:${companyId}:${role}:${userId}`;
  }

  async getEffectivePermissions(params: {
    userId: string;
    role: Role;
    companyId: string;
  }): Promise<Set<string>> {
    const userId = String(params.userId ?? "").trim();
    const role = params.role;
    const companyId = String(params.companyId ?? "").trim();
    const cacheKey = this.key(companyId, userId, role);

    const cached = await this.redis.getJson<EffectivePermsCache>(cacheKey);
    if (cached && Array.isArray(cached.perms)) {
      return new Set(cached.perms);
    }

    const rolePerms = await this.prisma.rolePermission.findMany({
      where: { role },
      select: { permission: { select: { key: true } } },
    });

    const roleKeys = rolePerms.map((rp) => rp.permission.key);

    const userPerms = await this.prisma.userPermission.findMany({
      where: { userId, companyId },
      select: {
        effect: true,
        permission: { select: { key: true } },
      },
    });

    const finalPerms = new Set<string>(roleKeys);

    for (const up of userPerms) {
      const k = up.permission.key;
      if (up.effect === PermissionEffect.ALLOW) finalPerms.add(k);
      if (up.effect === PermissionEffect.DENY) finalPerms.delete(k);
    }

    await this.redis.setJson(
      cacheKey,
      {
        perms: Array.from(finalPerms),
        computedAt: new Date().toISOString(),
        v: 3,
      },
      this.ttlSec(),
    );

    return finalPerms;
  }

  async invalidate(companyId: string, userId: string, role: Role) {
    const cid = String(companyId ?? "").trim();
    const uid = String(userId ?? "").trim();
    await this.redis.del(this.key(cid, uid, role));
  }

  async invalidateUser(companyId: string, userId: string) {
    const cid = String(companyId ?? "").trim();
    const uid = String(userId ?? "").trim();
    await this.redis.delPattern(`rbac:perms:v3:${cid}:*:${uid}`);
  }

  async invalidateCompany(companyId: string) {
    const cid = String(companyId ?? "").trim();
    await this.redis.delPattern(`rbac:perms:v3:${cid}:*`);
  }

  async invalidateRoleEverywhere(role: Role) {
    await this.redis.delPattern(`rbac:perms:v3:*:${role}:*`);
  }
}