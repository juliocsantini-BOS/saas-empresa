import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { Prisma, Role } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import { CreateSalesTargetDto } from "./dto/create-sales-target.dto";

type SalesTargetActor = {
  id: string;
  role: Role;
  companyId?: string | null;
  branchId?: string | null;
  departmentId?: string | null;
};

@Injectable()
export class CrmSalesTargetsService {
  constructor(private readonly prisma: PrismaService) {}

  private ensureCompanyId(companyId: string | null | undefined) {
    const cid = String(companyId ?? "").trim();
    if (!cid) {
      throw new ForbiddenException("Company obrigatória");
    }
    return cid;
  }

  private canViewWholeCompany(role: Role) {
    return role === Role.ADMIN_MASTER || role === Role.ADMIN || role === Role.CEO;
  }

  private canManageTargets(role: Role) {
    return (
      role === Role.ADMIN_MASTER ||
      role === Role.ADMIN ||
      role === Role.CEO ||
      role === Role.CMO
    );
  }

  private normalizeDate(value: string, field: string) {
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) {
      throw new BadRequestException(`${field} inválido`);
    }
    return parsed;
  }

  private normalizeMoney(value?: number) {
    if (value === undefined) return undefined;
    if (value < 0) throw new BadRequestException("targetValue inválido");
    return new Prisma.Decimal(value);
  }

  async create(actor: SalesTargetActor, body: CreateSalesTargetDto) {
    const companyId = this.ensureCompanyId(actor.companyId);

    if (!this.canManageTargets(actor.role)) {
      throw new ForbiddenException("Você não pode criar metas comerciais.");
    }

    const periodStart = this.normalizeDate(body.periodStart, "periodStart");
    const periodEnd = this.normalizeDate(body.periodEnd, "periodEnd");

    if (periodEnd.getTime() < periodStart.getTime()) {
      throw new BadRequestException("periodEnd não pode ser menor que periodStart");
    }

    const branchId = body.branchId ? String(body.branchId).trim() : null;
    const departmentId = body.departmentId ? String(body.departmentId).trim() : null;
    const userId = body.userId ? String(body.userId).trim() : null;

    if (branchId) {
      const branch = await this.prisma.branch.findFirst({
        where: { id: branchId, companyId },
        select: { id: true },
      });

      if (!branch) {
        throw new BadRequestException("branchId inválido para esta empresa.");
      }
    }

    if (departmentId) {
      const department = await this.prisma.department.findFirst({
        where: {
          id: departmentId,
          companyId,
          ...(branchId ? { branchId } : {}),
        },
        select: { id: true },
      });

      if (!department) {
        throw new BadRequestException("departmentId inválido para esta empresa.");
      }
    }

    if (userId) {
      const user = await this.prisma.user.findFirst({
        where: {
          id: userId,
          companyId,
          ...(branchId ? { branchId } : {}),
          ...(departmentId ? { departmentId } : {}),
        },
        select: { id: true },
      });

      if (!user) {
        throw new BadRequestException("userId inválido para esta empresa.");
      }
    }

    return this.prisma.salesTarget.create({
      data: {
        companyId,
        branchId,
        departmentId,
        userId,
        periodType: body.periodType,
        periodStart,
        periodEnd,
        targetValue: this.normalizeMoney(body.targetValue),
        targetDeals: body.targetDeals ?? null,
      },
      include: {
        branch: { select: { id: true, name: true } },
        department: { select: { id: true, name: true } },
        user: { select: { id: true, name: true, email: true } },
      },
    });
  }

  async list(actor: SalesTargetActor) {
    const companyId = this.ensureCompanyId(actor.companyId);

    const where = this.canViewWholeCompany(actor.role)
      ? { companyId }
      : actor.branchId
        ? {
            companyId,
            OR: [{ branchId: actor.branchId }, { userId: actor.id }],
          }
        : {
            companyId,
            userId: actor.id,
          };

    return this.prisma.salesTarget.findMany({
      where,
      include: {
        branch: { select: { id: true, name: true } },
        department: { select: { id: true, name: true } },
        user: { select: { id: true, name: true, email: true } },
      },
      orderBy: [{ periodStart: "desc" }, { createdAt: "desc" }],
    });
  }

  async remove(actor: SalesTargetActor, id: string) {
    const companyId = this.ensureCompanyId(actor.companyId);

    if (!this.canManageTargets(actor.role)) {
      throw new ForbiddenException("Você não pode excluir metas comerciais.");
    }

    const existing = await this.prisma.salesTarget.findFirst({
      where: { id, companyId },
      select: { id: true },
    });

    if (!existing) {
      throw new NotFoundException("Meta comercial não encontrada");
    }

    await this.prisma.salesTarget.delete({
      where: { id: existing.id },
    });

    return { ok: true };
  }
}