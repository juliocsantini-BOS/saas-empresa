import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { Role } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";

type Actor = {
  id: string;
  role: Role;
  companyId?: string | null;
};

@Injectable()
export class CrmAccountsService {
  constructor(private readonly prisma: PrismaService) {}

  private ensureCompanyId(actor: Actor) {
    const companyId = String(actor.companyId ?? "").trim();
    if (!companyId) {
      throw new ForbiddenException("Company obrigatória.");
    }
    return companyId;
  }

  private trim(value: unknown) {
    const normalized = String(value ?? "").trim();
    return normalized || null;
  }

  async list(actor: Actor) {
    const companyId = this.ensureCompanyId(actor);
    return (this.prisma as any).crmAccount.findMany({
      where: { companyId },
      include: {
        ownerUser: { select: { id: true, name: true, email: true } },
        branch: { select: { id: true, name: true } },
        department: { select: { id: true, name: true } },
        contacts: {
          orderBy: [{ isPrimary: "desc" }, { createdAt: "asc" }],
        },
        leads: {
          select: {
            id: true,
            name: true,
            status: true,
            dealValue: true,
            probability: true,
            updatedAt: true,
          },
        },
      },
      orderBy: [{ updatedAt: "desc" }],
    });
  }

  async create(actor: Actor, body: any) {
    const companyId = this.ensureCompanyId(actor);
    const name = this.trim(body?.name);
    if (!name) {
      throw new BadRequestException("name é obrigatório.");
    }

    return (this.prisma as any).crmAccount.create({
      data: {
        companyId,
        name,
        legalName: this.trim(body?.legalName),
        website: this.trim(body?.website),
        industry: this.trim(body?.industry),
        companySize: this.trim(body?.companySize),
        city: this.trim(body?.city),
        state: this.trim(body?.state),
        notes: this.trim(body?.notes),
        ownerUserId: this.trim(body?.ownerUserId),
        branchId: this.trim(body?.branchId),
        departmentId: this.trim(body?.departmentId),
      },
      include: {
        ownerUser: { select: { id: true, name: true, email: true } },
        branch: { select: { id: true, name: true } },
        department: { select: { id: true, name: true } },
      },
    });
  }

  async update(actor: Actor, accountId: string, body: any) {
    const companyId = this.ensureCompanyId(actor);
    const existing = await (this.prisma as any).crmAccount.findFirst({
      where: { id: accountId, companyId },
      select: { id: true },
    });

    if (!existing) {
      throw new NotFoundException("Conta não encontrada.");
    }

    const data: Record<string, unknown> = {};
    if (body?.name !== undefined) {
      const name = this.trim(body.name);
      if (!name) throw new BadRequestException("name não pode ser vazio.");
      data.name = name;
    }

    for (const key of [
      "legalName",
      "website",
      "industry",
      "companySize",
      "city",
      "state",
      "notes",
      "ownerUserId",
      "branchId",
      "departmentId",
    ]) {
      if (body?.[key] !== undefined) {
        data[key] = this.trim(body[key]);
      }
    }

    return (this.prisma as any).crmAccount.update({
      where: { id: accountId },
      data,
      include: {
        ownerUser: { select: { id: true, name: true, email: true } },
        branch: { select: { id: true, name: true } },
        department: { select: { id: true, name: true } },
      },
    });
  }

  async listContacts(actor: Actor, accountId: string) {
    const companyId = this.ensureCompanyId(actor);
    await this.ensureAccount(accountId, companyId);
    return (this.prisma as any).crmContact.findMany({
      where: { companyId, accountId },
      include: {
        ownerUser: { select: { id: true, name: true, email: true } },
        branch: { select: { id: true, name: true } },
        department: { select: { id: true, name: true } },
      },
      orderBy: [{ isPrimary: "desc" }, { updatedAt: "desc" }],
    });
  }

  async createContact(actor: Actor, accountId: string, body: any) {
    const companyId = this.ensureCompanyId(actor);
    await this.ensureAccount(accountId, companyId);

    const firstName = this.trim(body?.firstName);
    if (!firstName) {
      throw new BadRequestException("firstName é obrigatório.");
    }

    const lastName = this.trim(body?.lastName);
    const fullName = [firstName, lastName].filter(Boolean).join(" ");

    return (this.prisma as any).crmContact.create({
      data: {
        companyId,
        accountId,
        firstName,
        lastName,
        fullName,
        email: this.trim(body?.email),
        phone: this.trim(body?.phone),
        whatsapp: this.trim(body?.whatsapp),
        jobTitle: this.trim(body?.jobTitle),
        notes: this.trim(body?.notes),
        isPrimary: body?.isPrimary === true,
        ownerUserId: this.trim(body?.ownerUserId),
        branchId: this.trim(body?.branchId),
        departmentId: this.trim(body?.departmentId),
      },
      include: {
        ownerUser: { select: { id: true, name: true, email: true } },
        branch: { select: { id: true, name: true } },
        department: { select: { id: true, name: true } },
      },
    });
  }

  async updateContact(actor: Actor, contactId: string, body: any) {
    const companyId = this.ensureCompanyId(actor);
    const existing = await (this.prisma as any).crmContact.findFirst({
      where: { id: contactId, companyId },
      select: { id: true, firstName: true, lastName: true },
    });

    if (!existing) {
      throw new NotFoundException("Contato não encontrado.");
    }

    const data: Record<string, unknown> = {};
    const firstName =
      body?.firstName !== undefined ? this.trim(body.firstName) : existing.firstName;
    const lastName =
      body?.lastName !== undefined ? this.trim(body.lastName) : existing.lastName;

    if (!firstName) throw new BadRequestException("firstName não pode ser vazio.");
    data.firstName = firstName;
    data.lastName = lastName;
    data.fullName = [firstName, lastName].filter(Boolean).join(" ");

    for (const key of [
      "email",
      "phone",
      "whatsapp",
      "jobTitle",
      "notes",
      "ownerUserId",
      "branchId",
      "departmentId",
    ]) {
      if (body?.[key] !== undefined) {
        data[key] = this.trim(body[key]);
      }
    }

    if (body?.isPrimary !== undefined) {
      data.isPrimary = body.isPrimary === true;
    }

    return (this.prisma as any).crmContact.update({
      where: { id: contactId },
      data,
      include: {
        ownerUser: { select: { id: true, name: true, email: true } },
        branch: { select: { id: true, name: true } },
        department: { select: { id: true, name: true } },
      },
    });
  }

  private async ensureAccount(accountId: string, companyId: string) {
    const account = await (this.prisma as any).crmAccount.findFirst({
      where: { id: accountId, companyId },
      select: { id: true },
    });

    if (!account) {
      throw new NotFoundException("Conta não encontrada.");
    }
  }
}
