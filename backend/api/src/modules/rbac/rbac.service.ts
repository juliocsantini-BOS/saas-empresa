import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { PermissionEffect, Role } from "@prisma/client";
import { PermissionsCacheService } from "../../common/permissions/permissions-cache.service";
import { RequestContext } from "../../common/request-context/request-context";

function normalizeRole(input: string): Role {
  const raw = String(input ?? "").trim().toUpperCase();
  const allowed = Object.values(Role) as string[];
  if (!allowed.includes(raw)) {
    throw new BadRequestException("role inválido. Use: " + allowed.join(", "));
  }
  return raw as Role;
}

function normalizePermKey(input: string): string {
  const raw = String(input ?? "").trim();
  if (!raw) throw new BadRequestException("permKey é obrigatório");
  return raw.toLowerCase().replace(/:/g, ".");
}

@Injectable()
export class RbacService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly permsCache: PermissionsCacheService,
  ) {}

  private async runSystem<T>(fn: () => Promise<T>): Promise<T> {
    return RequestContext.run(
      { ...(RequestContext.get() ?? {}), isSystem: true, companyId: null },
      fn,
    );
  }

  async listPermissions() {
    return this.prisma.permission.findMany({
      orderBy: { key: "asc" },
      select: { id: true, key: true, description: true, createdAt: true },
    });
  }

  async listRoles() {
    return (Object.values(Role) as string[]).sort();
  }

  async listRolePermissions(roleInput: string) {
    const role = normalizeRole(roleInput);
    const rows = await this.prisma.rolePermission.findMany({
      where: { role },
      include: { permission: true },
      orderBy: { permission: { key: "asc" } },
    });
    return rows.map((r) => r.permission.key);
  }

  async getUserPermissions(userId: string, companyId: string, role: Role) {
    const uid = String(userId ?? "").trim();
    if (!uid) throw new BadRequestException("userId inválido");
    if (!role) throw new BadRequestException("role inválido");

    if (role === Role.ADMIN_MASTER) {
      const all = await this.prisma.permission.findMany({
        select: { key: true },
        orderBy: { key: "asc" },
      });
      return all.map((p) => p.key);
    }

    const cid = String(companyId ?? "").trim();
    if (!cid) throw new ForbiddenException("companyId obrigatório");

    const set = await this.permsCache.getEffectivePermissions({
      userId: uid,
      companyId: cid,
      role,
    });

    return Array.from(set).sort();
  }

  async listUserOverrides(userId: string, companyId: string) {
    const uid = String(userId ?? "").trim();
    const cid = String(companyId ?? "").trim();

    if (!uid) throw new BadRequestException("userId inválido");
    if (!cid) throw new BadRequestException("companyId obrigatório");

    const targetUser = await this.prisma.user.findFirst({
      where: { id: uid, companyId: cid },
      select: { id: true, role: true },
    });

    if (!targetUser) throw new NotFoundException("Usuário não encontrado nesta empresa");

    const rows = await this.prisma.userPermission.findMany({
      where: { companyId: cid, userId: uid },
      include: { permission: true },
      orderBy: [{ effect: "asc" }, { permission: { key: "asc" } }],
    });

    return rows.map((r) => ({
      permKey: r.permission.key,
      effect: r.effect,
    }));
  }

  async allowPermission(userId: string, companyId: string, permKey: string, actorRole: Role) {
    return this.setOverride(userId, companyId, permKey, PermissionEffect.ALLOW, actorRole);
  }

  async denyPermission(userId: string, companyId: string, permKey: string, actorRole: Role) {
    return this.setOverride(userId, companyId, permKey, PermissionEffect.DENY, actorRole);
  }

  private async setOverride(
    userId: string,
    companyId: string,
    permKey: string,
    effect: PermissionEffect,
    actorRole: Role,
  ) {
    const uid = String(userId ?? "").trim();
    const cid = String(companyId ?? "").trim();
    const key = normalizePermKey(permKey);

    if (!uid) throw new BadRequestException("userId inválido");
    if (!cid) throw new BadRequestException("companyId obrigatório");

    const perm = await this.prisma.permission.findUnique({
      where: { key },
      select: { id: true, key: true },
    });
    if (!perm) throw new NotFoundException("Permission not found");

    const targetUser = await this.prisma.user.findFirst({
      where: { id: uid, companyId: cid },
      select: { id: true, role: true },
    });
    if (!targetUser) throw new NotFoundException("Usuário não encontrado nesta empresa");

    if (targetUser.role === Role.ADMIN_MASTER) {
      throw new BadRequestException("Não é permitido alterar overrides de ADMIN_MASTER");
    }

    if (actorRole === Role.ADMIN && targetUser.role === Role.ADMIN) {
      throw new BadRequestException("ADMIN não pode alterar overrides de outro ADMIN");
    }

    const existing = await this.prisma.userPermission.findFirst({
      where: { companyId: cid, userId: uid, permissionId: perm.id },
      select: { id: true },
    });

    let rowId: string;

    if (!existing) {
      const created = await this.prisma.userPermission.create({
        data: {
          companyId: cid,
          userId: uid,
          permissionId: perm.id,
          effect,
        },
        select: { id: true },
      });
      rowId = created.id;
    } else {
      const updated = await this.prisma.userPermission.update({
        where: { id: existing.id },
        data: { effect },
        select: { id: true },
      });
      rowId = updated.id;
    }

    await this.permsCache.invalidate(cid, uid, targetUser.role);

    return { ok: true, userId: uid, companyId: cid, permKey: key, effect, rowId };
  }

  async removeOverride(userId: string, companyId: string, permKey: string, actorRole: Role) {
    const uid = String(userId ?? "").trim();
    const cid = String(companyId ?? "").trim();
    const key = normalizePermKey(permKey);

    if (!uid) throw new BadRequestException("userId inválido");
    if (!cid) throw new BadRequestException("companyId obrigatório");

    const perm = await this.prisma.permission.findUnique({
      where: { key },
      select: { id: true },
    });
    if (!perm) return { ok: true, removed: 0 };

    const targetUser = await this.prisma.user.findFirst({
      where: { id: uid, companyId: cid },
      select: { role: true },
    });
    if (!targetUser) throw new NotFoundException("Usuário não encontrado nesta empresa");

    if (targetUser.role === Role.ADMIN_MASTER) {
      throw new BadRequestException("Não é permitido alterar overrides de ADMIN_MASTER");
    }

    if (actorRole === Role.ADMIN && targetUser.role === Role.ADMIN) {
      throw new BadRequestException("ADMIN não pode alterar overrides de outro ADMIN");
    }

    const deleted = await this.prisma.userPermission.deleteMany({
      where: { companyId: cid, userId: uid, permissionId: perm.id },
    });

    await this.permsCache.invalidate(cid, uid, targetUser.role);

    return { ok: true, removed: deleted.count };
  }

  async addPermissionToRole(roleInput: string, permKey: string) {
    const role = normalizeRole(roleInput);
    const key = normalizePermKey(permKey);

    if (role === Role.ADMIN_MASTER) {
      throw new BadRequestException("Não é permitido alterar permissões globais do role ADMIN_MASTER");
    }

    const perm = await this.prisma.permission.findUnique({
      where: { key },
      select: { id: true, key: true },
    });
    if (!perm) throw new NotFoundException("Permission not found");

    await this.runSystem(async () => {
      await this.prisma.rolePermission.createMany({
        data: [{ role, permissionId: perm.id }],
        skipDuplicates: true,
      });
    });

    await this.permsCache.invalidateRoleEverywhere(role);

    return { ok: true, role, permKey: key };
  }

  async removePermissionFromRole(roleInput: string, permKey: string) {
    const role = normalizeRole(roleInput);
    const key = normalizePermKey(permKey);

    if (role === Role.ADMIN_MASTER) {
      throw new BadRequestException("Não é permitido alterar permissões globais do role ADMIN_MASTER");
    }

    const perm = await this.prisma.permission.findUnique({
      where: { key },
      select: { id: true },
    });
    if (!perm) return { ok: true, removed: 0 };

    const deleted = await this.runSystem(async () => {
      return this.prisma.rolePermission.deleteMany({
        where: { role, permissionId: perm.id },
      });
    });

    await this.permsCache.invalidateRoleEverywhere(role);

    return { ok: true, removed: deleted.count, role, permKey: key };
  }
}
