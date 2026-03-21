import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { Prisma, Role } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";

type Actor = {
  id: string;
  role: Role;
  companyId?: string | null;
};

@Injectable()
export class CrmDocumentsService {
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

  private decimal(value: unknown) {
    if (value === undefined || value === null || value === "") return null;
    const parsed = Number(value);
    if (!Number.isFinite(parsed) || parsed < 0) {
      throw new BadRequestException("Valor monetário inválido.");
    }
    return new Prisma.Decimal(parsed);
  }

  private normalizeDate(value: unknown) {
    const raw = this.trim(value);
    if (!raw) return null;
    const parsed = new Date(raw);
    if (Number.isNaN(parsed.getTime())) {
      throw new BadRequestException("Data inválida.");
    }
    return parsed;
  }

  async listQuotes(actor: Actor) {
    const companyId = this.ensureCompanyId(actor);
    return (this.prisma as any).crmQuote.findMany({
      where: { companyId },
      include: {
        items: { orderBy: [{ sortOrder: "asc" }] },
        lead: { select: { id: true, name: true, status: true } },
        account: { select: { id: true, name: true } },
        contact: { select: { id: true, fullName: true, email: true } },
        ownerUser: { select: { id: true, name: true, email: true } },
      },
      orderBy: [{ updatedAt: "desc" }],
    });
  }

  async createQuote(actor: Actor, body: any) {
    const companyId = this.ensureCompanyId(actor);
    const title = this.trim(body?.title);
    if (!title) {
      throw new BadRequestException("title é obrigatório.");
    }

    const items = Array.isArray(body?.items) ? body.items : [];
    const normalizedItems = items.map((item: any, index: number) => {
      const quantity = this.decimal(item?.quantity) || new Prisma.Decimal(1);
      const unitPrice = this.decimal(item?.unitPrice) || new Prisma.Decimal(0);
      const total = new Prisma.Decimal(quantity).mul(unitPrice);
      return {
        description: this.trim(item?.description) || `Item ${index + 1}`,
        quantity,
        unitPrice,
        total,
        sortOrder: index,
      };
    });

    const subtotal = normalizedItems.reduce(
      (sum, item) => sum.add(item.total),
      new Prisma.Decimal(0),
    );
    const discount = this.decimal(body?.discount) || new Prisma.Decimal(0);
    const total = subtotal.sub(discount);

    return this.prisma.$transaction(async (tx) => {
      const number = `Q-${Date.now()}`;
      const quote = await (tx as any).crmQuote.create({
        data: {
          companyId,
          number,
          title,
          status: this.trim(body?.status) || "DRAFT",
          currency: this.trim(body?.currency) || "BRL",
          subtotal,
          discount,
          total,
          validUntil: this.normalizeDate(body?.validUntil),
          notes: this.trim(body?.notes),
          eSignatureProvider: this.trim(body?.eSignatureProvider),
          leadId: this.trim(body?.leadId),
          accountId: this.trim(body?.accountId),
          contactId: this.trim(body?.contactId),
          ownerUserId: this.trim(body?.ownerUserId) || actor.id,
          branchId: this.trim(body?.branchId),
          departmentId: this.trim(body?.departmentId),
        },
      });

      for (const item of normalizedItems) {
        await (tx as any).crmQuoteItem.create({
          data: {
            companyId,
            quoteId: quote.id,
            ...item,
          },
        });
      }

      return (tx as any).crmQuote.findUnique({
        where: { id: quote.id },
        include: { items: { orderBy: [{ sortOrder: "asc" }] } },
      });
    });
  }

  async updateQuoteStatus(actor: Actor, quoteId: string, body: any) {
    const companyId = this.ensureCompanyId(actor);
    const existing = await (this.prisma as any).crmQuote.findFirst({
      where: { id: quoteId, companyId },
      select: { id: true },
    });

    if (!existing) {
      throw new NotFoundException("Quote não encontrado.");
    }

    const status = this.trim(body?.status);
    if (!status) throw new BadRequestException("status é obrigatório.");

    const now = new Date();
    return (this.prisma as any).crmQuote.update({
      where: { id: quoteId },
      data: {
        status,
        viewedAt: status === "VIEWED" ? now : undefined,
        approvedAt: status === "APPROVED" ? now : undefined,
        signedAt: status === "SIGNED" ? now : undefined,
        rejectedAt: status === "REJECTED" ? now : undefined,
      },
    });
  }

  async listDocuments(actor: Actor) {
    const companyId = this.ensureCompanyId(actor);
    return (this.prisma as any).crmDocument.findMany({
      where: { companyId },
      include: {
        quote: { select: { id: true, number: true, title: true, status: true } },
        lead: { select: { id: true, name: true, status: true } },
        account: { select: { id: true, name: true } },
        contact: { select: { id: true, fullName: true, email: true } },
        user: { select: { id: true, name: true, email: true } },
      },
      orderBy: [{ updatedAt: "desc" }],
    });
  }

  async createDocument(actor: Actor, body: any) {
    const companyId = this.ensureCompanyId(actor);
    const title = this.trim(body?.title);
    const type = this.trim(body?.type);
    if (!title || !type) {
      throw new BadRequestException("title e type são obrigatórios.");
    }

    return (this.prisma as any).crmDocument.create({
      data: {
        companyId,
        title,
        type,
        signatureStatus: this.trim(body?.signatureStatus) || "NOT_SENT",
        fileUrl: this.trim(body?.fileUrl),
        contentHtml: this.trim(body?.contentHtml),
        quoteId: this.trim(body?.quoteId),
        leadId: this.trim(body?.leadId),
        accountId: this.trim(body?.accountId),
        contactId: this.trim(body?.contactId),
        userId: actor.id,
        provider: this.trim(body?.provider),
        externalDocumentId: this.trim(body?.externalDocumentId),
        sentAt: this.normalizeDate(body?.sentAt),
        openedAt: this.normalizeDate(body?.openedAt),
        signedAt: this.normalizeDate(body?.signedAt),
      },
    });
  }
}
