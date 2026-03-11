import {
  BadRequestException,
  Injectable,
  ForbiddenException,
  NotFoundException,
} from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { Role } from "@prisma/client";

type BranchViewerScope = {
  role: Role;
  companyId: string;
  userId: string;
  branchId?: string | null;
};

@Injectable()
export class BranchesService {
  constructor(private readonly prisma: PrismaService) {}

  private canViewWholeCompany(role: Role): boolean {
    return role === Role.ADMIN_MASTER || role === Role.ADMIN || role === Role.CEO;
  }

  async create(companyId: string | null, name: string) {
    const cid = String(companyId ?? "").trim();
    const branchName = (name ?? "").trim();

    if (!cid) throw new ForbiddenException("Company obrigatória");
    if (!branchName) throw new BadRequestException("name é obrigatório");

    return this.prisma.branch.create({
      data: { name: branchName, companyId: cid },
      select: { id: true, name: true, companyId: true, createdAt: true },
    });
  }

  async list(scope: BranchViewerScope) {
    const cid = String(scope.companyId ?? "").trim();
    const bid = String(scope.branchId ?? "").trim();

    if (!cid) throw new ForbiddenException("Company obrigatória");

    const where = this.canViewWholeCompany(scope.role)
      ? { companyId: cid }
      : bid
        ? { companyId: cid, id: bid }
        : { companyId: cid, id: "__never__" };

    return this.prisma.branch.findMany({
      where,
      select: { id: true, name: true, companyId: true, createdAt: true },
      orderBy: { createdAt: "desc" },
    });
  }

  async rename(companyId: string | null, branchId: string, name: string) {
    const cid = String(companyId ?? "").trim();
    const id = String(branchId ?? "").trim();
    const branchName = (name ?? "").trim();

    if (!cid) throw new ForbiddenException("Company obrigatória");
    if (!id) throw new BadRequestException("branchId inválido");
    if (!branchName) throw new BadRequestException("name é obrigatório");

    const exists = await this.prisma.branch.findFirst({
      where: { id, companyId: cid },
      select: { id: true },
    });

    if (!exists) throw new NotFoundException("Branch não encontrada");

    return this.prisma.branch.update({
      where: { id },
      data: { name: branchName },
      select: { id: true, name: true, companyId: true, createdAt: true },
    });
  }

  async remove(companyId: string | null, branchId: string) {
    const cid = String(companyId ?? "").trim();
    const id = String(branchId ?? "").trim();

    if (!cid) throw new ForbiddenException("Company obrigatória");
    if (!id) throw new BadRequestException("branchId inválido");

    const branch = await this.prisma.branch.findFirst({
      where: { id, companyId: cid },
      select: { id: true },
    });

    if (!branch) throw new NotFoundException("Branch não encontrada");

    const count = await this.prisma.branch.count({ where: { companyId: cid } });
    if (count <= 1) {
      throw new BadRequestException("Não é permitido apagar a última filial da empresa");
    }

    const departmentsUsing = await this.prisma.department.count({
      where: { companyId: cid, branchId: id },
    });

    if (departmentsUsing > 0) {
      throw new BadRequestException(
        "Não é possível apagar: existem departments vinculados a esta filial. Remova ou mova esses departments primeiro.",
      );
    }

    const usersUsing = await this.prisma.user.count({
      where: { companyId: cid, branchId: id },
    });

    if (usersUsing > 0) {
      throw new BadRequestException(
        "Não é possível apagar: existem usuários vinculados a esta filial. Troque o branchId desses usuários primeiro.",
      );
    }

    await this.prisma.branch.delete({ where: { id } });
    return { ok: true };
  }
}