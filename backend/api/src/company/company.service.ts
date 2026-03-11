import { BadRequestException, Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { Role } from "@prisma/client";
import * as bcrypt from "bcrypt";
import { CreateCompanyDto } from "./dto/create-company.dto";
import { RequestContext } from "../common/request-context/request-context";

@Injectable()
export class CompanyService {
  constructor(private readonly prisma: PrismaService) {}

  async create(name: string) {
    const companyName = (name ?? "").trim();
    if (!companyName) throw new BadRequestException("name é obrigatório");

    const ctx = RequestContext.get();
    const prevCompanyId = ctx.companyId ?? null;

    try {
      const result = await this.prisma.$transaction(async (tx) => {
        const company = await tx.company.create({
          data: { name: companyName, requestId: ctx?.requestId },
          select: { id: true, name: true, createdAt: true },
        });

        RequestContext.set({ companyId: company.id });

        const branch = await tx.branch.create({
          data: {
            name: "Matriz",
            companyId: company.id,
            requestId: ctx?.requestId,
          },
          select: { id: true, name: true, createdAt: true, companyId: true },
        });

        return { company, branch };
      });

      return result;
    } finally {
      RequestContext.set({ companyId: prevCompanyId });
    }
  }

  async createWithOwner(dto: CreateCompanyDto) {
    const name = (dto?.name ?? "").trim();
    const ownerEmail = (dto?.ownerEmail ?? "").trim().toLowerCase();
    const ownerName = (dto?.ownerName ?? "").trim();
    const ownerPassword = dto?.ownerPassword ?? "";
    const ownerRoleRaw = (dto?.ownerRole ?? "CEO")
      .toString()
      .trim()
      .toUpperCase();
    const branchName = (dto?.branchName ?? "Matriz").trim() || "Matriz";

    if (!name) throw new BadRequestException("name é obrigatório");
    if (!ownerEmail) throw new BadRequestException("ownerEmail é obrigatório");
    if (!ownerName) throw new BadRequestException("ownerName é obrigatório");
    if (!ownerPassword) throw new BadRequestException("ownerPassword é obrigatório");
    if (!branchName) throw new BadRequestException("branchName é obrigatório");

    const allowedOwnerRoles = [Role.CEO, Role.ADMIN] as string[];
    if (!allowedOwnerRoles.includes(ownerRoleRaw)) {
      throw new BadRequestException(
        `ownerRole inválido. Use apenas: ${allowedOwnerRoles.join(", ")}`,
      );
    }

    const ownerRole = ownerRoleRaw as Role;

    const exists = await this.prisma.user.findFirst({
      where: { email: ownerEmail },
      select: { id: true },
    });

    if (exists) throw new BadRequestException("ownerEmail já existe");

    const passwordHash = await bcrypt.hash(ownerPassword, 10);

    const ctx = RequestContext.get();
    const prevCompanyId = ctx.companyId ?? null;

    try {
      const result = await this.prisma.$transaction(async (tx) => {
        const company = await tx.company.create({
          data: { name, requestId: ctx?.requestId },
          select: { id: true, name: true, createdAt: true },
        });

        RequestContext.set({ companyId: company.id });

        const branch = await tx.branch.create({
          data: {
            name: branchName,
            companyId: company.id,
            requestId: ctx?.requestId,
          },
          select: { id: true, name: true, createdAt: true, companyId: true },
        });

        const owner = await tx.user.create({
          data: {
            email: ownerEmail,
            name: ownerName,
            password: passwordHash,
            role: ownerRole,
            companyId: company.id,
            branchId: branch.id,
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
          },
        });

        return { company, branch, owner };
      });

      return result;
    } finally {
      RequestContext.set({ companyId: prevCompanyId });
    }
  }
}