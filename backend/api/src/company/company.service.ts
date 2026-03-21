import { BadRequestException, Injectable } from '@nestjs/common';
import { Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { RequestContext } from '../common/request-context/request-context';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCompanyDto } from './dto/create-company.dto';

@Injectable()
export class CompanyService {
  constructor(private readonly prisma: PrismaService) {}

  async findCurrent(companyId: string) {
    const currentCompanyId = String(companyId ?? '').trim();
    if (!currentCompanyId) {
      throw new BadRequestException('companyId e obrigatorio');
    }

    return this.prisma.company.findUnique({
      where: { id: currentCompanyId },
      select: {
        id: true,
        name: true,
        sector: true,
        teamSize: true,
        operationModel: true,
        hasInventory: true,
        salesModel: true,
        financeMaturity: true,
        multiUnit: true,
        mainGoal: true,
        createdAt: true,
      },
    });
  }

  async create(name: string) {
    const companyName = (name ?? '').trim();
    if (!companyName) throw new BadRequestException('name Ã© obrigatÃ³rio');

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
            name: 'Matriz',
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
    const name = (dto?.name ?? '').trim();
    const ownerEmail = (dto?.ownerEmail ?? '').trim().toLowerCase();
    const ownerName = (dto?.ownerName ?? '').trim();
    const ownerPassword = dto?.ownerPassword ?? '';
    const ownerRoleRaw = (dto?.ownerRole ?? 'CEO')
      .toString()
      .trim()
      .toUpperCase();
    const branchName = (dto?.branchName ?? 'Matriz').trim() || 'Matriz';
    const sector = (dto?.sector ?? '').trim() || null;
    const teamSize = (dto?.teamSize ?? '').trim() || null;
    const operationModel = (dto?.operationModel ?? '').trim() || null;
    const hasInventory = (dto?.hasInventory ?? '').trim() || null;
    const salesModel = (dto?.salesModel ?? '').trim() || null;
    const financeMaturity = (dto?.financeMaturity ?? '').trim() || null;
    const multiUnit = (dto?.multiUnit ?? '').trim() || null;
    const mainGoal = (dto?.mainGoal ?? '').trim() || null;

    if (!name) throw new BadRequestException('name Ã© obrigatÃ³rio');
    if (!ownerEmail) {
      throw new BadRequestException('ownerEmail Ã© obrigatÃ³rio');
    }
    if (!ownerName) throw new BadRequestException('ownerName Ã© obrigatÃ³rio');
    if (!ownerPassword) {
      throw new BadRequestException('ownerPassword Ã© obrigatÃ³rio');
    }
    if (!branchName) {
      throw new BadRequestException('branchName Ã© obrigatÃ³rio');
    }

    const allowedOwnerRoles = [Role.CEO, Role.ADMIN] as string[];
    if (!allowedOwnerRoles.includes(ownerRoleRaw)) {
      throw new BadRequestException(
        `ownerRole invÃ¡lido. Use apenas: ${allowedOwnerRoles.join(', ')}`,
      );
    }

    const ownerRole = ownerRoleRaw as Role;

    const exists = await this.prisma.user.findFirst({
      where: { email: ownerEmail },
      select: { id: true },
    });

    if (exists) throw new BadRequestException('ownerEmail jÃ¡ existe');

    const passwordHash = await bcrypt.hash(ownerPassword, 10);

    const ctx = RequestContext.get();
    const prevCompanyId = ctx.companyId ?? null;

    try {
      const result = await this.prisma.$transaction(async (tx) => {
        const company = await tx.company.create({
          data: {
            name,
            sector,
            teamSize,
            operationModel,
            hasInventory,
            salesModel,
            financeMaturity,
            multiUnit,
            mainGoal,
            requestId: ctx?.requestId,
          },
          select: {
            id: true,
            name: true,
            sector: true,
            teamSize: true,
            operationModel: true,
            hasInventory: true,
            salesModel: true,
            financeMaturity: true,
            multiUnit: true,
            mainGoal: true,
            createdAt: true,
          },
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
