import {
  BadRequestException,
  Injectable,
  ForbiddenException,
  NotFoundException,
} from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { Role } from "@prisma/client";

type DepartmentViewerScope = {
  role: Role;
  companyId: string;
  userId: string;
  branchId?: string | null;
  departmentId?: string | null;
};

@Injectable()
export class DepartmentsService {
  constructor(private readonly prisma: PrismaService) {}

  private canViewWholeCompany(role: Role): boolean {
    return role === Role.ADMIN_MASTER || role === Role.ADMIN || role === Role.CEO;
  }

  async create(companyId: string | null, branchId: string, name: string) {
    const cid = String(companyId ?? "").trim();
    const bid = String(branchId ?? "").trim();
    const departmentName = String(name ?? "").trim();

    if (!cid) throw new ForbiddenException("Company obrigatória");
    if (!bid) throw new BadRequestException("branchId é obrigatório");
    if (!departmentName) throw new BadRequestException("name é obrigatório");

    const branch = await this.prisma.branch.findFirst({
      where: { id: bid, companyId: cid },
      select: { id: true },
    });

    if (!branch) {
      throw new BadRequestException("branchId inválido para esta empresa");
    }

    return this.prisma.department.create({
      data: {
        name: departmentName,
        companyId: cid,
        branchId: bid,
      },
      select: {
        id: true,
        name: true,
        companyId: true,
        branchId: true,
        createdAt: true,
      },
    });
  }

  async list(scope: DepartmentViewerScope) {
    const cid = String(scope.companyId ?? "").trim();
    const bid = String(scope.branchId ?? "").trim();
    const did = String(scope.departmentId ?? "").trim();

    if (!cid) throw new ForbiddenException("Company obrigatória");

    let where: any = { companyId: cid };

    if (!this.canViewWholeCompany(scope.role)) {
      if (scope.role === Role.USER) {
        if (did) where = { companyId: cid, id: did };
        else if (bid) where = { companyId: cid, branchId: bid };
        else where = { companyId: cid, id: "__never__" };
      } else {
        if (bid) where = { companyId: cid, branchId: bid };
        else where = { companyId: cid, id: "__never__" };
      }
    }

    return this.prisma.department.findMany({
      where,
      select: {
        id: true,
        name: true,
        companyId: true,
        branchId: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
    });
  }

  async rename(companyId: string | null, departmentId: string, name: string) {
    const cid = String(companyId ?? "").trim();
    const id = String(departmentId ?? "").trim();
    const departmentName = String(name ?? "").trim();

    if (!cid) throw new ForbiddenException("Company obrigatória");
    if (!id) throw new BadRequestException("departmentId inválido");
    if (!departmentName) throw new BadRequestException("name é obrigatório");

    const exists = await this.prisma.department.findFirst({
      where: { id, companyId: cid },
      select: { id: true },
    });

    if (!exists) throw new NotFoundException("Department não encontrado");

    return this.prisma.department.update({
      where: { id },
      data: { name: departmentName },
      select: {
        id: true,
        name: true,
        companyId: true,
        branchId: true,
        createdAt: true,
      },
    });
  }

  async remove(companyId: string | null, departmentId: string) {
    const cid = String(companyId ?? "").trim();
    const id = String(departmentId ?? "").trim();

    if (!cid) throw new ForbiddenException("Company obrigatória");
    if (!id) throw new BadRequestException("departmentId inválido");

    const department = await this.prisma.department.findFirst({
      where: { id, companyId: cid },
      select: { id: true },
    });

    if (!department) throw new NotFoundException("Department não encontrado");

    const usersUsing = await this.prisma.user.count({
      where: { companyId: cid, departmentId: id },
    });

    if (usersUsing > 0) {
      throw new BadRequestException(
        "Não é possível apagar: existem usuários vinculados a este department. Troque o departmentId desses usuários primeiro.",
      );
    }

    await this.prisma.department.delete({ where: { id } });
    return { ok: true };
  }
}