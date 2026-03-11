import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { Prisma, Role } from "@prisma/client";
import * as bcrypt from "bcrypt";
import { PrismaService } from "../prisma/prisma.service";
import { PermissionsCacheService } from "../common/permissions/permissions-cache.service";

type CreateUserInput = {
  email: string;
  name: string;
  password: string;
  role?: Role | string;
  companyId: string;
  branchId?: string | null;
  departmentId?: string | null;
};

type ViewerScope = {
  role: Role;
  companyId: string;
  userId: string;
  branchId?: string | null;
  departmentId?: string | null;
};

@Injectable()
export class UsersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly permsCache: PermissionsCacheService,
  ) {}

  private canViewWholeCompany(role: Role): boolean {
    return role === Role.ADMIN_MASTER || role === Role.ADMIN || role === Role.CEO;
  }

  private async buildUserReadWhere(scope: ViewerScope) {
    const cid = String(scope.companyId ?? "").trim();
    const uid = String(scope.userId ?? "").trim();
    const branchId = String(scope.branchId ?? "").trim();
    const departmentId = String(scope.departmentId ?? "").trim();

    if (!cid) throw new BadRequestException("companyId é obrigatório");
    if (!uid) throw new BadRequestException("userId é obrigatório");

    if (this.canViewWholeCompany(scope.role)) {
      return { companyId: cid };
    }

    if (scope.role === Role.USER) {
      if (departmentId) {
        return {
          companyId: cid,
          OR: [
            { id: uid },
            { departmentId },
          ],
        };
      }

      if (branchId) {
        return {
          companyId: cid,
          OR: [
            { id: uid },
            { branchId },
          ],
        };
      }

      return { companyId: cid, id: uid };
    }

    if (branchId) {
      return {
        companyId: cid,
        OR: [
          { id: uid },
          { branchId },
        ],
      };
    }

    return { companyId: cid, id: uid };
  }

  async create(data: CreateUserInput) {
    const email = (data?.email ?? "").trim().toLowerCase();
    const name = (data?.name ?? "").trim();
    const password = data?.password ?? "";
    const companyId = String(data?.companyId ?? "").trim();
    const branchId = data?.branchId ? String(data.branchId).trim() : null;
    const departmentId = data?.departmentId ? String(data.departmentId).trim() : null;

    if (!email) throw new BadRequestException("email é obrigatório");
    if (!name) throw new BadRequestException("name é obrigatório");
    if (!password) throw new BadRequestException("password é obrigatório");
    if (!companyId) throw new BadRequestException("companyId é obrigatório");

    const rawRole = (data?.role ?? "USER").toString().trim().toUpperCase();
    const allowed = Object.values(Role) as string[];
    if (!allowed.includes(rawRole)) {
      throw new BadRequestException("role inválido. Use: " + allowed.join(", "));
    }
    const role = rawRole as Role;

    const exists = await this.prisma.user.findFirst({
      where: { companyId, email },
      select: { id: true },
    });
    if (exists) {
      throw new ConflictException("Já existe um usuário com esse email nesta empresa.");
    }

    if (branchId) {
      const branch = await this.prisma.branch.findFirst({
        where: { id: branchId, companyId },
        select: { id: true },
      });
      if (!branch) {
        throw new BadRequestException("branchId inválido para esta empresa");
      }
    }

    if (departmentId) {
      const department = await this.prisma.department.findFirst({
        where: { id: departmentId, companyId },
        select: { id: true, branchId: true },
      });
      if (!department) {
        throw new BadRequestException("departmentId inválido para esta empresa");
      }
      if (branchId && department.branchId !== branchId) {
        throw new BadRequestException(
          "departmentId não pertence ao branchId informado",
        );
      }
    }

    const passwordHash = await bcrypt.hash(password, 10);

    try {
      return await this.prisma.user.create({
        data: {
          email,
          name,
          password: passwordHash,
          role,
          companyId,
          branchId,
          departmentId,
        },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          isActive: true,
          createdAt: true,
          companyId: true,
          branchId: true,
          departmentId: true,
        },
      });
    } catch (err) {
      if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
        throw new ConflictException("Já existe um usuário com esse email nesta empresa.");
      }
      if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2003") {
        throw new BadRequestException("companyId/branchId/departmentId inválido");
      }
      throw err;
    }
  }

  async findAll(scope: ViewerScope) {
    const where = await this.buildUserReadWhere(scope);

    return this.prisma.user.findMany({
      where,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
        createdAt: true,
        companyId: true,
        branchId: true,
        departmentId: true,
      },
      orderBy: { createdAt: "desc" },
    });
  }

  async me(userId: string, companyId: string) {
    const uid = String(userId ?? "").trim();
    const cid = String(companyId ?? "").trim();
    if (!uid) throw new BadRequestException("userId inválido");
    if (!cid) throw new BadRequestException("companyId inválido");

    const me = await this.prisma.user.findFirst({
      where: { id: uid, companyId: cid },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
        createdAt: true,
        companyId: true,
        branchId: true,
        departmentId: true,
      },
    });

    if (!me) throw new NotFoundException("User não encontrado");
    return me;
  }

  async setMyBranch(userId: string, companyId: string, branchId: string) {
    const uid = String(userId ?? "").trim();
    const cid = String(companyId ?? "").trim();
    const bid = String(branchId ?? "").trim();
    if (!uid) throw new BadRequestException("userId inválido");
    if (!cid) throw new ForbiddenException("Company obrigatória");
    if (!bid) throw new BadRequestException("branchId é obrigatório");

    const branch = await this.prisma.branch.findFirst({
      where: { id: bid, companyId: cid },
      select: { id: true, name: true, companyId: true, createdAt: true },
    });
    if (!branch) throw new BadRequestException("branchId inválido para esta empresa");

    const updated = await this.prisma.user.updateMany({
      where: { id: uid, companyId: cid },
      data: {
        branchId: bid,
        departmentId: null,
      },
    });

    if (updated.count === 0) throw new NotFoundException("User não encontrado");
    return { ok: true, branch };
  }

  async setMyDepartment(userId: string, companyId: string, departmentId: string) {
    const uid = String(userId ?? "").trim();
    const cid = String(companyId ?? "").trim();
    const did = String(departmentId ?? "").trim();
    if (!uid) throw new BadRequestException("userId inválido");
    if (!cid) throw new ForbiddenException("Company obrigatória");
    if (!did) throw new BadRequestException("departmentId é obrigatório");

    const department = await this.prisma.department.findFirst({
      where: { id: did, companyId: cid },
      select: {
        id: true,
        name: true,
        companyId: true,
        branchId: true,
        createdAt: true,
      },
    });

    if (!department) {
      throw new BadRequestException("departmentId inválido para esta empresa");
    }

    const updated = await this.prisma.user.updateMany({
      where: { id: uid, companyId: cid },
      data: {
        departmentId: did,
        branchId: department.branchId,
      },
    });

    if (updated.count === 0) throw new NotFoundException("User não encontrado");
    return { ok: true, department };
  }

  async updateRole(userId: string, companyId: string, roleInput: Role | string) {
    const uid = String(userId ?? "").trim();
    const cid = String(companyId ?? "").trim();
    const rawRole = String(roleInput ?? "").trim().toUpperCase();
    if (!uid) throw new BadRequestException("userId inválido");
    if (!cid) throw new BadRequestException("companyId inválido");

    const allowed = Object.values(Role) as string[];
    if (!allowed.includes(rawRole)) {
      throw new BadRequestException("role inválido. Use: " + allowed.join(", "));
    }
    if (rawRole === Role.ADMIN_MASTER) {
      throw new BadRequestException("Não é permitido atribuir ADMIN_MASTER por este endpoint");
    }

    const target = await this.prisma.user.findFirst({
      where: { id: uid, companyId: cid },
      select: { id: true, role: true },
    });
    if (!target) throw new NotFoundException("User não encontrado");

    const updated = await this.prisma.user.update({
      where: { id: uid },
      data: { role: rawRole as Role },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
        createdAt: true,
        companyId: true,
        branchId: true,
        departmentId: true,
      },
    });

    await this.permsCache.invalidateUser(cid, uid);
    return updated;
  }

  async updateStatus(userId: string, companyId: string, isActive: boolean) {
    const uid = String(userId ?? "").trim();
    const cid = String(companyId ?? "").trim();
    if (!uid) throw new BadRequestException("userId inválido");
    if (!cid) throw new BadRequestException("companyId inválido");

    const target = await this.prisma.user.findFirst({
      where: { id: uid, companyId: cid },
      select: { id: true, role: true },
    });
    if (!target) throw new NotFoundException("User não encontrado");

    if (target.role === Role.ADMIN_MASTER) {
      throw new BadRequestException("Não é permitido alterar status de ADMIN_MASTER");
    }

    const updated = await this.prisma.user.update({
      where: { id: uid },
      data: isActive
        ? { isActive: true }
        : {
            isActive: false,
            refreshTokenHash: null,
            refreshTokenId: null,
            tokenVersion: { increment: 1 },
          },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
        createdAt: true,
        companyId: true,
        branchId: true,
        departmentId: true,
      },
    });

    if (!isActive) {
      await this.prisma.session.updateMany({
        where: {
          userId: uid,
          revokedAt: null,
        },
        data: {
          revokedAt: new Date(),
          lastUsedAt: new Date(),
        },
      });
    }

    await this.permsCache.invalidateUser(cid, uid);
    return updated;
  }

  async updateBranch(userId: string, companyId: string, branchId: string) {
    const uid = String(userId ?? "").trim();
    const cid = String(companyId ?? "").trim();
    const bid = String(branchId ?? "").trim();
    if (!uid) throw new BadRequestException("userId inválido");
    if (!cid) throw new BadRequestException("companyId inválido");
    if (!bid) throw new BadRequestException("branchId é obrigatório");

    const target = await this.prisma.user.findFirst({
      where: { id: uid, companyId: cid },
      select: { id: true, role: true },
    });
    if (!target) throw new NotFoundException("User não encontrado");

    if (target.role === Role.ADMIN_MASTER) {
      throw new BadRequestException("Não é permitido alterar branch de ADMIN_MASTER");
    }

    const branch = await this.prisma.branch.findFirst({
      where: { id: bid, companyId: cid },
      select: { id: true, name: true, companyId: true, createdAt: true },
    });
    if (!branch) throw new BadRequestException("branchId inválido para esta empresa");

    const updated = await this.prisma.user.update({
      where: { id: uid },
      data: {
        branchId: bid,
        departmentId: null,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
        createdAt: true,
        companyId: true,
        branchId: true,
        departmentId: true,
      },
    });

    return { ok: true, user: updated, branch };
  }

  async updateDepartment(userId: string, companyId: string, departmentId: string) {
    const uid = String(userId ?? "").trim();
    const cid = String(companyId ?? "").trim();
    const did = String(departmentId ?? "").trim();
    if (!uid) throw new BadRequestException("userId inválido");
    if (!cid) throw new BadRequestException("companyId inválido");
    if (!did) throw new BadRequestException("departmentId é obrigatório");

    const target = await this.prisma.user.findFirst({
      where: { id: uid, companyId: cid },
      select: { id: true, role: true },
    });
    if (!target) throw new NotFoundException("User não encontrado");

    if (target.role === Role.ADMIN_MASTER) {
      throw new BadRequestException("Não é permitido alterar department de ADMIN_MASTER");
    }

    const department = await this.prisma.department.findFirst({
      where: { id: did, companyId: cid },
      select: {
        id: true,
        name: true,
        companyId: true,
        branchId: true,
        createdAt: true,
      },
    });
    if (!department) {
      throw new BadRequestException("departmentId inválido para esta empresa");
    }

    const updated = await this.prisma.user.update({
      where: { id: uid },
      data: {
        departmentId: did,
        branchId: department.branchId,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
        createdAt: true,
        companyId: true,
        branchId: true,
        departmentId: true,
      },
    });

    return { ok: true, user: updated, department };
  }

  async resetPassword(userId: string, companyId: string, password: string) {
    const uid = String(userId ?? "").trim();
    const cid = String(companyId ?? "").trim();
    const plain = String(password ?? "");
    if (!uid) throw new BadRequestException("userId inválido");
    if (!cid) throw new BadRequestException("companyId inválido");
    if (!plain || plain.length < 6) {
      throw new BadRequestException("password deve ter no mínimo 6 caracteres");
    }

    const target = await this.prisma.user.findFirst({
      where: { id: uid, companyId: cid },
      select: { id: true, role: true },
    });
    if (!target) throw new NotFoundException("User não encontrado");

    if (target.role === Role.ADMIN_MASTER) {
      throw new BadRequestException("Não é permitido resetar senha de ADMIN_MASTER");
    }

    const passwordHash = await bcrypt.hash(plain, 10);

    await this.prisma.user.update({
      where: { id: uid },
      data: {
        password: passwordHash,
        refreshTokenHash: null,
        refreshTokenId: null,
        tokenVersion: { increment: 1 },
      },
    });

    await this.prisma.session.updateMany({
      where: {
        userId: uid,
        revokedAt: null,
      },
      data: {
        revokedAt: new Date(),
        lastUsedAt: new Date(),
      },
    });

    await this.permsCache.invalidateUser(cid, uid);
    return { ok: true };
  }
}