import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { Role } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";

type Actor = {
  id?: string | null;
  role?: Role | null;
  companyId?: string | null;
  branchId?: string | null;
  departmentId?: string | null;
  name?: string | null;
};

@Injectable()
export class FinanceService {
  constructor(private readonly prisma: PrismaService) {}

  private ensureCompanyId(actor: Actor) {
    const companyId = String(actor.companyId ?? "").trim();
    if (!companyId) throw new ForbiddenException("Company obrigatória.");
    return companyId;
  }

  private trim(value: unknown) {
    const normalized = String(value ?? "").trim();
    return normalized || null;
  }

  private date(value: unknown) {
    const raw = this.trim(value);
    if (!raw) return null;
    const parsed = new Date(raw);
    if (Number.isNaN(parsed.getTime())) throw new BadRequestException("Data inválida.");
    return parsed;
  }

  private number(value: unknown, fallback = 0) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
  }

  private decimal(value: unknown, fallback = 0) {
    return Number(this.number(value, fallback).toFixed(2));
  }

  private startOfToday() {
    const date = new Date();
    date.setHours(0, 0, 0, 0);
    return date;
  }

  private endInDays(days: number) {
    const date = this.startOfToday();
    date.setDate(date.getDate() + days);
    date.setHours(23, 59, 59, 999);
    return date;
  }

  private sumAmount<T>(items: T[], getter: (item: T) => unknown) {
    return items.reduce((acc, item) => acc + this.number(getter(item), 0), 0);
  }

  async listAccounts(actor: Actor) {
    const companyId = this.ensureCompanyId(actor);
    return (this.prisma as any).financeAccount.findMany({
      where: { companyId },
      orderBy: [{ code: "asc" }],
    });
  }

  async createAccount(actor: Actor, body: any) {
    const companyId = this.ensureCompanyId(actor);
    const code = this.trim(body?.code);
    const name = this.trim(body?.name);
    if (!code || !name) throw new BadRequestException("code e name são obrigatórios.");

    return (this.prisma as any).financeAccount.create({
      data: {
        companyId,
        code,
        name,
        type: this.trim(body?.type)?.toUpperCase() || "ASSET",
        branchId: this.trim(body?.branchId),
        departmentId: this.trim(body?.departmentId),
        isActive: body?.isActive !== false,
      },
    });
  }

  async listBankAccounts(actor: Actor) {
    const companyId = this.ensureCompanyId(actor);
    return (this.prisma as any).financeBankAccount.findMany({
      where: { companyId },
      orderBy: [{ updatedAt: "desc" }],
    });
  }

  async createBankAccount(actor: Actor, body: any) {
    const companyId = this.ensureCompanyId(actor);
    const name = this.trim(body?.name);
    if (!name) throw new BadRequestException("name é obrigatório.");

    return (this.prisma as any).financeBankAccount.create({
      data: {
        companyId,
        name,
        bankName: this.trim(body?.bankName),
        accountType: this.trim(body?.accountType)?.toUpperCase() || "BANK",
        currency: this.trim(body?.currency) || "BRL",
        currentBalance: this.decimal(body?.currentBalance),
        accountNumberMasked: this.trim(body?.accountNumberMasked),
        pixKey: this.trim(body?.pixKey),
        branchId: this.trim(body?.branchId),
        isActive: body?.isActive !== false,
      },
    });
  }

  async listCostCenters(actor: Actor) {
    const companyId = this.ensureCompanyId(actor);
    return (this.prisma as any).financeCostCenter.findMany({
      where: { companyId },
      orderBy: [{ code: "asc" }],
    });
  }

  async createCostCenter(actor: Actor, body: any) {
    const companyId = this.ensureCompanyId(actor);
    const code = this.trim(body?.code);
    const name = this.trim(body?.name);
    if (!code || !name) throw new BadRequestException("code e name são obrigatórios.");

    return (this.prisma as any).financeCostCenter.create({
      data: {
        companyId,
        code,
        name,
        branchId: this.trim(body?.branchId),
        departmentId: this.trim(body?.departmentId),
        isActive: body?.isActive !== false,
      },
    });
  }

  async listCategories(actor: Actor) {
    const companyId = this.ensureCompanyId(actor);
    return (this.prisma as any).financeCategory.findMany({
      where: { companyId },
      orderBy: [{ name: "asc" }],
    });
  }

  async createCategory(actor: Actor, body: any) {
    const companyId = this.ensureCompanyId(actor);
    const name = this.trim(body?.name);
    if (!name) throw new BadRequestException("name é obrigatório.");

    return (this.prisma as any).financeCategory.create({
      data: {
        companyId,
        name,
        kind: this.trim(body?.kind)?.toUpperCase() || "OPERATING",
        branchId: this.trim(body?.branchId),
        departmentId: this.trim(body?.departmentId),
        costCenterId: this.trim(body?.costCenterId),
        isActive: body?.isActive !== false,
      },
    });
  }

  async listPayables(actor: Actor) {
    const companyId = this.ensureCompanyId(actor);
    return (this.prisma as any).financePayable.findMany({
      where: { companyId },
      include: {
        branch: true,
        department: true,
        category: true,
        costCenter: true,
        bankAccount: true,
        approvalRequest: true,
      },
      orderBy: [{ dueAt: "asc" }],
    });
  }

  async createPayable(actor: Actor, body: any) {
    const companyId = this.ensureCompanyId(actor);
    const vendorName = this.trim(body?.vendorName);
    const dueAt = this.date(body?.dueAt);
    const amount = this.decimal(body?.amount);
    if (!vendorName || !dueAt || amount <= 0) {
      throw new BadRequestException("vendorName, dueAt e amount são obrigatórios.");
    }

    return (this.prisma as any).financePayable.create({
      data: {
        companyId,
        vendorName,
        documentNumber: this.trim(body?.documentNumber),
        description: this.trim(body?.description),
        issueDate: this.date(body?.issueDate),
        dueAt,
        competenceDate: this.date(body?.competenceDate),
        amount,
        outstandingAmount: this.decimal(body?.outstandingAmount, amount),
        currency: this.trim(body?.currency) || "BRL",
        status: this.trim(body?.status)?.toUpperCase() || "OPEN",
        branchId: this.trim(body?.branchId),
        departmentId: this.trim(body?.departmentId),
        costCenterId: this.trim(body?.costCenterId),
        categoryId: this.trim(body?.categoryId),
        bankAccountId: this.trim(body?.bankAccountId),
        accountId: this.trim(body?.accountId),
      },
    });
  }

  async payPayable(actor: Actor, payableId: string, body: any) {
    const companyId = this.ensureCompanyId(actor);
    const payable = await (this.prisma as any).financePayable.findFirst({
      where: { id: payableId, companyId },
    });
    if (!payable) throw new NotFoundException("Conta a pagar não encontrada.");

    const amountPaid = this.decimal(body?.amountPaid, this.number(payable.outstandingAmount));
    const remaining = Math.max(0, this.number(payable.outstandingAmount) - amountPaid);
    const paidAt = this.date(body?.paidAt) || new Date();

    return this.prisma.$transaction(async (tx) => {
      const updated = await (tx as any).financePayable.update({
        where: { id: payable.id },
        data: {
          paidAt,
          outstandingAmount: remaining,
          status: remaining <= 0 ? "PAID" : "PARTIAL",
        },
      });

      await (tx as any).financeTransaction.create({
        data: {
          companyId,
          branchId: payable.branchId,
          departmentId: payable.departmentId,
          costCenterId: payable.costCenterId,
          categoryId: payable.categoryId,
          bankAccountId: this.trim(body?.bankAccountId) || payable.bankAccountId,
          accountId: payable.accountId,
          payableId: payable.id,
          approvalRequestId: payable.approvalRequestId,
          occurredAt: paidAt,
          description: `Pagamento - ${payable.vendorName}`,
          amount: amountPaid,
          currency: payable.currency,
          direction: "OUTFLOW",
          source: "PAYABLE",
          status: "POSTED",
        },
      });

      return updated;
    });
  }

  async batchPay(actor: Actor, body: any) {
    const payableIds = Array.isArray(body?.payableIds) ? body.payableIds : [];
    const results: any[] = [];
    for (const payableId of payableIds) {
      results.push(
        await this.payPayable(actor, String(payableId), {
          amountPaid: body?.amountPaid,
          bankAccountId: body?.bankAccountId,
        }),
      );
    }
    return results;
  }

  async listReceivables(actor: Actor) {
    const companyId = this.ensureCompanyId(actor);
    return (this.prisma as any).financeReceivable.findMany({
      where: { companyId },
      include: {
        branch: true,
        department: true,
        category: true,
        costCenter: true,
        bankAccount: true,
      },
      orderBy: [{ dueAt: "asc" }],
    });
  }

  async createReceivable(actor: Actor, body: any) {
    const companyId = this.ensureCompanyId(actor);
    const customerName = this.trim(body?.customerName);
    const dueAt = this.date(body?.dueAt);
    const amount = this.decimal(body?.amount);
    if (!customerName || !dueAt || amount <= 0) {
      throw new BadRequestException("customerName, dueAt e amount são obrigatórios.");
    }

    return (this.prisma as any).financeReceivable.create({
      data: {
        companyId,
        customerName,
        invoiceNumber: this.trim(body?.invoiceNumber),
        description: this.trim(body?.description),
        issueDate: this.date(body?.issueDate),
        dueAt,
        competenceDate: this.date(body?.competenceDate),
        amount,
        outstandingAmount: this.decimal(body?.outstandingAmount, amount),
        currency: this.trim(body?.currency) || "BRL",
        status: this.trim(body?.status)?.toUpperCase() || "OPEN",
        branchId: this.trim(body?.branchId),
        departmentId: this.trim(body?.departmentId),
        costCenterId: this.trim(body?.costCenterId),
        categoryId: this.trim(body?.categoryId),
        bankAccountId: this.trim(body?.bankAccountId),
        accountId: this.trim(body?.accountId),
      },
    });
  }

  async collectReceivable(actor: Actor, receivableId: string, body: any) {
    const companyId = this.ensureCompanyId(actor);
    const receivable = await (this.prisma as any).financeReceivable.findFirst({
      where: { id: receivableId, companyId },
    });
    if (!receivable) throw new NotFoundException("Conta a receber não encontrada.");

    const amountReceived = this.decimal(body?.amountReceived, this.number(receivable.outstandingAmount));
    const remaining = Math.max(0, this.number(receivable.outstandingAmount) - amountReceived);
    const receivedAt = this.date(body?.receivedAt) || new Date();

    return this.prisma.$transaction(async (tx) => {
      const updated = await (tx as any).financeReceivable.update({
        where: { id: receivable.id },
        data: {
          paidAt: receivedAt,
          outstandingAmount: remaining,
          status: remaining <= 0 ? "PAID" : "PARTIAL",
        },
      });

      const transaction = await (tx as any).financeTransaction.create({
        data: {
          companyId,
          branchId: receivable.branchId,
          departmentId: receivable.departmentId,
          costCenterId: receivable.costCenterId,
          categoryId: receivable.categoryId,
          bankAccountId: this.trim(body?.bankAccountId) || receivable.bankAccountId,
          accountId: receivable.accountId,
          receivableId: receivable.id,
          occurredAt: receivedAt,
          description: `Recebimento - ${receivable.customerName}`,
          amount: amountReceived,
          currency: receivable.currency,
          direction: "INFLOW",
          source: "RECEIVABLE",
          status: "POSTED",
        },
      });

      if (body?.registerPix === true) {
        await (tx as any).financePixConfirmation.create({
          data: {
            companyId,
            receivableId: receivable.id,
            transactionId: transaction.id,
            provider: this.trim(body?.provider) || "PIX",
            externalTxId: this.trim(body?.externalTxId),
            payerName: this.trim(body?.payerName),
            payerDocument: this.trim(body?.payerDocument),
            amount: amountReceived,
            status: "CONFIRMED",
            confirmedAt: receivedAt,
            rawJson: body?.rawJson ?? null,
          },
        });
      }

      return updated;
    });
  }

  async sendReceivableReminder(actor: Actor, receivableId: string, body: any) {
    const companyId = this.ensureCompanyId(actor);
    const receivable = await (this.prisma as any).financeReceivable.findFirst({
      where: { id: receivableId, companyId },
    });
    if (!receivable) throw new NotFoundException("Conta a receber não encontrada.");

    return (this.prisma as any).financeReminder.create({
      data: {
        companyId,
        receivableId,
        channel: this.trim(body?.channel)?.toUpperCase() || "EMAIL",
        status: "SENT",
        scheduledAt: this.date(body?.scheduledAt) || new Date(),
        sentAt: new Date(),
        message:
          this.trim(body?.message) ||
          `Reminder financeiro para ${receivable.customerName} - vencimento ${new Date(
            receivable.dueAt,
          ).toLocaleDateString("pt-BR")}`,
      },
    });
  }

  async listTransactions(actor: Actor) {
    const companyId = this.ensureCompanyId(actor);
    return (this.prisma as any).financeTransaction.findMany({
      where: { companyId },
      include: {
        branch: true,
        department: true,
        costCenter: true,
        category: true,
        bankAccount: true,
        payable: true,
        receivable: true,
      },
      orderBy: [{ occurredAt: "desc" }],
      take: 200,
    });
  }

  async createTransaction(actor: Actor, body: any) {
    const companyId = this.ensureCompanyId(actor);
    const description = this.trim(body?.description);
    const amount = this.decimal(body?.amount);
    if (!description || amount <= 0) {
      throw new BadRequestException("description e amount são obrigatórios.");
    }

    return (this.prisma as any).financeTransaction.create({
      data: {
        companyId,
        branchId: this.trim(body?.branchId),
        departmentId: this.trim(body?.departmentId),
        costCenterId: this.trim(body?.costCenterId),
        categoryId: this.trim(body?.categoryId),
        bankAccountId: this.trim(body?.bankAccountId),
        accountId: this.trim(body?.accountId),
        occurredAt: this.date(body?.occurredAt) || new Date(),
        postedAt: this.date(body?.postedAt),
        description,
        amount,
        currency: this.trim(body?.currency) || "BRL",
        direction: this.trim(body?.direction)?.toUpperCase() || "OUTFLOW",
        source: this.trim(body?.source)?.toUpperCase() || "MANUAL",
        status: this.trim(body?.status),
        metadataJson: body?.metadataJson ?? null,
      },
    });
  }

  async listStatementImports(actor: Actor) {
    const companyId = this.ensureCompanyId(actor);
    return (this.prisma as any).financeStatementImport.findMany({
      where: { companyId },
      include: { bankAccount: true, lines: true },
      orderBy: [{ createdAt: "desc" }],
    });
  }

  async createStatementImport(actor: Actor, body: any) {
    const companyId = this.ensureCompanyId(actor);
    const source = this.trim(body?.source);
    if (!source) throw new BadRequestException("source é obrigatório.");

    return this.prisma.$transaction(async (tx) => {
      const statementImport = await (tx as any).financeStatementImport.create({
        data: {
          companyId,
          bankAccountId: this.trim(body?.bankAccountId),
          source,
          provider: this.trim(body?.provider),
          fileName: this.trim(body?.fileName),
          periodStart: this.date(body?.periodStart),
          periodEnd: this.date(body?.periodEnd),
          importedAt: new Date(),
          status: "PROCESSED",
          rawJson: body?.rawJson ?? null,
        },
      });

      const lines = Array.isArray(body?.lines) ? body.lines : [];
      for (const line of lines) {
        await (tx as any).financeStatementLine.create({
          data: {
            companyId,
            importId: statementImport.id,
            externalId: this.trim(line?.externalId),
            bookingDate: this.date(line?.bookingDate),
            description: this.trim(line?.description) || "Linha importada",
            counterpartyName: this.trim(line?.counterpartyName),
            amount: this.decimal(line?.amount),
            currency: this.trim(line?.currency) || "BRL",
            direction: this.trim(line?.direction)?.toUpperCase() || "OUTFLOW",
            matchStatus: this.trim(line?.matchStatus)?.toUpperCase() || "UNMATCHED",
            rawJson: line?.rawJson ?? line ?? null,
          },
        });
      }

      return (tx as any).financeStatementImport.findUnique({
        where: { id: statementImport.id },
        include: { lines: true },
      });
    });
  }

  async reconcile(actor: Actor, body: any) {
    const companyId = this.ensureCompanyId(actor);
    const statementLineId = this.trim(body?.statementLineId);
    const transactionId = this.trim(body?.transactionId);
    if (!statementLineId || !transactionId) {
      throw new BadRequestException("statementLineId e transactionId são obrigatórios.");
    }

    return this.prisma.$transaction(async (tx) => {
      const match = await (tx as any).financeReconciliationMatch.create({
        data: {
          companyId,
          statementLineId,
          transactionId,
          userId: this.trim(actor.id),
          confidenceScore: this.number(body?.confidenceScore, 100),
          notes: this.trim(body?.notes),
          matchedAt: new Date(),
        },
      });

      await (tx as any).financeStatementLine.update({
        where: { id: statementLineId },
        data: { transactionId, matchStatus: "MATCHED" },
      });

      return match;
    });
  }

  async confirmPix(actor: Actor, body: any) {
    const receivableId = this.trim(body?.receivableId);
    const amount = this.decimal(body?.amount);
    if (!receivableId || amount <= 0) {
      throw new BadRequestException("receivableId e amount são obrigatórios.");
    }
    return this.collectReceivable(actor, receivableId, {
      ...body,
      amountReceived: amount,
      registerPix: true,
    });
  }

  async listApprovalPolicies(actor: Actor) {
    const companyId = this.ensureCompanyId(actor);
    return (this.prisma as any).financeApprovalPolicy.findMany({
      where: { companyId },
      include: { branch: true, department: true, costCenter: true },
      orderBy: [{ updatedAt: "desc" }],
    });
  }

  async createApprovalPolicy(actor: Actor, body: any) {
    const companyId = this.ensureCompanyId(actor);
    const name = this.trim(body?.name);
    const roleRequired = this.trim(body?.roleRequired);
    if (!name || !roleRequired) {
      throw new BadRequestException("name e roleRequired são obrigatórios.");
    }
    return (this.prisma as any).financeApprovalPolicy.create({
      data: {
        companyId,
        name,
        scope: this.trim(body?.scope)?.toUpperCase() || "COMPANY",
        roleRequired,
        minAmount: body?.minAmount !== undefined ? this.decimal(body?.minAmount) : null,
        maxAmount: body?.maxAmount !== undefined ? this.decimal(body?.maxAmount) : null,
        branchId: this.trim(body?.branchId),
        departmentId: this.trim(body?.departmentId),
        costCenterId: this.trim(body?.costCenterId),
        isActive: body?.isActive !== false,
      },
    });
  }

  async listApprovalRequests(actor: Actor) {
    const companyId = this.ensureCompanyId(actor);
    return (this.prisma as any).financeApprovalRequest.findMany({
      where: { companyId },
      include: {
        branch: true,
        department: true,
        costCenter: true,
        policy: true,
        requesterUser: true,
        approverUser: true,
      },
      orderBy: [{ requestedAt: "desc" }],
    });
  }

  async createApprovalRequest(actor: Actor, body: any) {
    const companyId = this.ensureCompanyId(actor);
    return (this.prisma as any).financeApprovalRequest.create({
      data: {
        companyId,
        entityType: this.trim(body?.entityType) || "PAYABLE",
        entityId: this.trim(body?.entityId),
        amount: body?.amount !== undefined ? this.decimal(body?.amount) : null,
        currency: this.trim(body?.currency) || "BRL",
        reason: this.trim(body?.reason),
        branchId: this.trim(body?.branchId),
        departmentId: this.trim(body?.departmentId),
        costCenterId: this.trim(body?.costCenterId),
        policyId: this.trim(body?.policyId),
        requesterUserId: this.trim(body?.requesterUserId) || this.trim(actor.id),
        approverUserId: this.trim(body?.approverUserId),
        status: this.trim(body?.status)?.toUpperCase() || "PENDING",
      },
    });
  }

  async decideApprovalRequest(actor: Actor, requestId: string, body: any) {
    const companyId = this.ensureCompanyId(actor);
    const request = await (this.prisma as any).financeApprovalRequest.findFirst({
      where: { id: requestId, companyId },
    });
    if (!request) throw new NotFoundException("Solicitação de aprovação não encontrada.");

    return (this.prisma as any).financeApprovalRequest.update({
      where: { id: request.id },
      data: {
        status: this.trim(body?.status)?.toUpperCase() || "APPROVED",
        decisionNotes: this.trim(body?.decisionNotes),
        approverUserId: this.trim(actor.id),
        decidedAt: new Date(),
      },
    });
  }

  async listClosePeriods(actor: Actor) {
    const companyId = this.ensureCompanyId(actor);
    return (this.prisma as any).financeClosePeriod.findMany({
      where: { companyId },
      include: { checklistItems: true, branch: true, department: true },
      orderBy: [{ periodStart: "desc" }],
    });
  }

  async createClosePeriod(actor: Actor, body: any) {
    const companyId = this.ensureCompanyId(actor);
    const label = this.trim(body?.label);
    const periodStart = this.date(body?.periodStart);
    const periodEnd = this.date(body?.periodEnd);
    if (!label || !periodStart || !periodEnd) {
      throw new BadRequestException("label, periodStart e periodEnd são obrigatórios.");
    }

    return this.prisma.$transaction(async (tx) => {
      const closePeriod = await (tx as any).financeClosePeriod.create({
        data: {
          companyId,
          label,
          periodStart,
          periodEnd,
          status: this.trim(body?.status)?.toUpperCase() || "OPEN",
          notes: this.trim(body?.notes),
          branchId: this.trim(body?.branchId),
          departmentId: this.trim(body?.departmentId),
        },
      });

      const checklistItems = Array.isArray(body?.checklistItems) ? body.checklistItems : [];
      for (const item of checklistItems) {
        await (tx as any).financeCloseChecklistItem.create({
          data: {
            companyId,
            closePeriodId: closePeriod.id,
            title: this.trim(item?.title) || "Checklist",
            description: this.trim(item?.description),
            isRequired: item?.isRequired !== false,
          },
        });
      }

      return (tx as any).financeClosePeriod.findUnique({
        where: { id: closePeriod.id },
        include: { checklistItems: true },
      });
    });
  }

  async listBudgetPlans(actor: Actor) {
    const companyId = this.ensureCompanyId(actor);
    return (this.prisma as any).financeBudgetPlan.findMany({
      where: { companyId },
      include: { lines: true, branch: true, department: true, ownerUser: true },
      orderBy: [{ periodStart: "desc" }],
    });
  }

  async createBudgetPlan(actor: Actor, body: any) {
    const companyId = this.ensureCompanyId(actor);
    const name = this.trim(body?.name);
    const periodStart = this.date(body?.periodStart);
    const periodEnd = this.date(body?.periodEnd);
    if (!name || !periodStart || !periodEnd) {
      throw new BadRequestException("name, periodStart e periodEnd são obrigatórios.");
    }

    return this.prisma.$transaction(async (tx) => {
      const budgetPlan = await (tx as any).financeBudgetPlan.create({
        data: {
          companyId,
          name,
          periodType: this.trim(body?.periodType)?.toUpperCase() || "MONTHLY",
          periodStart,
          periodEnd,
          status: this.trim(body?.status) || "ACTIVE",
          notes: this.trim(body?.notes),
          branchId: this.trim(body?.branchId),
          departmentId: this.trim(body?.departmentId),
          ownerUserId: this.trim(body?.ownerUserId) || this.trim(actor.id),
        },
      });

      const lines = Array.isArray(body?.lines) ? body.lines : [];
      for (const line of lines) {
        await (tx as any).financeBudgetLine.create({
          data: {
            companyId,
            budgetPlanId: budgetPlan.id,
            lineType: this.trim(line?.lineType)?.toUpperCase() || "EXPENSE",
            label: this.trim(line?.label) || "Linha orçamentária",
            plannedAmount: this.decimal(line?.plannedAmount),
            forecastAmount: this.decimal(line?.forecastAmount),
            actualAmount: this.decimal(line?.actualAmount),
            branchId: this.trim(line?.branchId) || this.trim(body?.branchId),
            departmentId: this.trim(line?.departmentId) || this.trim(body?.departmentId),
            costCenterId: this.trim(line?.costCenterId),
            categoryId: this.trim(line?.categoryId),
          },
        });
      }

      return (tx as any).financeBudgetPlan.findUnique({
        where: { id: budgetPlan.id },
        include: { lines: true },
      });
    });
  }

  async listForecastSnapshots(actor: Actor) {
    const companyId = this.ensureCompanyId(actor);
    return (this.prisma as any).financeForecastSnapshot.findMany({
      where: { companyId },
      include: { branch: true, department: true, closePeriod: true, budgetPlan: true },
      orderBy: [{ asOf: "desc" }],
    });
  }

  async createForecastSnapshot(actor: Actor, body: any) {
    const companyId = this.ensureCompanyId(actor);
    const label = this.trim(body?.label);
    const periodStart = this.date(body?.periodStart);
    const periodEnd = this.date(body?.periodEnd);
    if (!label || !periodStart || !periodEnd) {
      throw new BadRequestException("label, periodStart e periodEnd são obrigatórios.");
    }
    return (this.prisma as any).financeForecastSnapshot.create({
      data: {
        companyId,
        label,
        asOf: this.date(body?.asOf) || new Date(),
        periodStart,
        periodEnd,
        projectedInflows: this.decimal(body?.projectedInflows),
        projectedOutflows: this.decimal(body?.projectedOutflows),
        projectedClosingCash: this.decimal(body?.projectedClosingCash),
        gapToBudget: body?.gapToBudget !== undefined ? this.decimal(body?.gapToBudget) : null,
        notes: this.trim(body?.notes),
        branchId: this.trim(body?.branchId),
        departmentId: this.trim(body?.departmentId),
        closePeriodId: this.trim(body?.closePeriodId),
        budgetPlanId: this.trim(body?.budgetPlanId),
      },
    });
  }

  async listVendors(actor: Actor) {
    const companyId = this.ensureCompanyId(actor);
    return (this.prisma as any).financeVendor.findMany({
      where: { companyId },
      include: { procurementRequests: true, purchaseOrders: true, payables: true, documents: true },
      orderBy: [{ updatedAt: "desc" }],
    });
  }

  async createVendor(actor: Actor, body: any) {
    const companyId = this.ensureCompanyId(actor);
    const name = this.trim(body?.name);
    if (!name) throw new BadRequestException("name é obrigatório.");
    return (this.prisma as any).financeVendor.create({
      data: {
        companyId,
        name,
        legalName: this.trim(body?.legalName),
        taxId: this.trim(body?.taxId),
        email: this.trim(body?.email),
        phone: this.trim(body?.phone),
        portalStatus: this.trim(body?.portalStatus)?.toUpperCase() || "DISABLED",
        portalAccessEmail: this.trim(body?.portalAccessEmail),
        paymentTerms: this.trim(body?.paymentTerms),
        riskScore: this.number(body?.riskScore, 0),
        notes: this.trim(body?.notes),
      },
    });
  }

  async listVendorDocuments(actor: Actor) {
    const companyId = this.ensureCompanyId(actor);
    return (this.prisma as any).financeVendorDocument.findMany({
      where: { companyId },
      include: { vendor: true, payable: true, purchaseOrder: true },
      orderBy: [{ updatedAt: "desc" }],
    });
  }

  async createVendorDocument(actor: Actor, body: any) {
    const companyId = this.ensureCompanyId(actor);
    const title = this.trim(body?.title);
    const documentType = this.trim(body?.documentType);
    if (!title || !documentType) throw new BadRequestException("title e documentType são obrigatórios.");

    return (this.prisma as any).financeVendorDocument.create({
      data: {
        companyId,
        title,
        documentType,
        fileName: this.trim(body?.fileName),
        fileUrl: this.trim(body?.fileUrl),
        captureStatus: this.trim(body?.captureStatus)?.toUpperCase() || "EXTRACTED",
        extractedJson: body?.extractedJson ?? null,
        reviewNotes: this.trim(body?.reviewNotes),
        vendorId: this.trim(body?.vendorId),
        payableId: this.trim(body?.payableId),
        purchaseOrderId: this.trim(body?.purchaseOrderId),
      },
    });
  }

  async reviewVendorDocument(actor: Actor, documentId: string, body: any) {
    const companyId = this.ensureCompanyId(actor);
    const existing = await (this.prisma as any).financeVendorDocument.findFirst({
      where: { id: documentId, companyId },
    });
    if (!existing) throw new NotFoundException("Documento não encontrado.");
    return (this.prisma as any).financeVendorDocument.update({
      where: { id: documentId },
      data: {
        captureStatus: this.trim(body?.captureStatus)?.toUpperCase() || "REVIEWED",
        extractedJson: body?.extractedJson ?? existing.extractedJson,
        reviewNotes: this.trim(body?.reviewNotes),
      },
    });
  }

  async listProcurementRequests(actor: Actor) {
    const companyId = this.ensureCompanyId(actor);
    return (this.prisma as any).financeProcurementRequest.findMany({
      where: { companyId },
      include: { vendor: true, purchaseOrders: true, payables: true },
      orderBy: [{ requestedAt: "desc" }],
    });
  }

  async createProcurementRequest(actor: Actor, body: any) {
    const companyId = this.ensureCompanyId(actor);
    const title = this.trim(body?.title);
    const amount = this.decimal(body?.amount);
    if (!title || amount <= 0) throw new BadRequestException("title e amount são obrigatórios.");

    return (this.prisma as any).financeProcurementRequest.create({
      data: {
        companyId,
        title,
        description: this.trim(body?.description),
        amount,
        currency: this.trim(body?.currency) || "BRL",
        status: this.trim(body?.status)?.toUpperCase() || "DRAFT",
        requestedByName: this.trim(body?.requestedByName) || this.trim(actor.name),
        businessJustification: this.trim(body?.businessJustification),
        requestedAt: this.date(body?.requestedAt) || new Date(),
        neededBy: this.date(body?.neededBy),
        categoryLabel: this.trim(body?.categoryLabel),
        vendorName: this.trim(body?.vendorName),
        vendorId: this.trim(body?.vendorId),
      },
    });
  }

  async submitProcurementRequest(actor: Actor, requestId: string) {
    const companyId = this.ensureCompanyId(actor);
    const existing = await (this.prisma as any).financeProcurementRequest.findFirst({
      where: { id: requestId, companyId },
    });
    if (!existing) throw new NotFoundException("Solicitação não encontrada.");
    return (this.prisma as any).financeProcurementRequest.update({
      where: { id: requestId },
      data: { status: "APPROVAL_PENDING" },
    });
  }

  async approveProcurementRequest(actor: Actor, requestId: string) {
    const companyId = this.ensureCompanyId(actor);
    const existing = await (this.prisma as any).financeProcurementRequest.findFirst({
      where: { id: requestId, companyId },
    });
    if (!existing) throw new NotFoundException("Solicitação não encontrada.");
    return (this.prisma as any).financeProcurementRequest.update({
      where: { id: requestId },
      data: { status: "APPROVED" },
    });
  }

  async rejectProcurementRequest(actor: Actor, requestId: string, body: any) {
    const companyId = this.ensureCompanyId(actor);
    const existing = await (this.prisma as any).financeProcurementRequest.findFirst({
      where: { id: requestId, companyId },
    });
    if (!existing) throw new NotFoundException("Solicitação não encontrada.");
    return (this.prisma as any).financeProcurementRequest.update({
      where: { id: requestId },
      data: {
        status: "REJECTED",
        description: [existing.description, this.trim(body?.reason)].filter(Boolean).join(" | "),
      },
    });
  }

  async createPurchaseOrderFromRequest(actor: Actor, requestId: string, body: any) {
    const companyId = this.ensureCompanyId(actor);
    const request = await (this.prisma as any).financeProcurementRequest.findFirst({
      where: { id: requestId, companyId },
    });
    if (!request) throw new NotFoundException("Solicitação não encontrada.");

    return this.prisma.$transaction(async (tx) => {
      const purchaseOrder = await (tx as any).financePurchaseOrder.create({
        data: {
          companyId,
          poNumber: this.trim(body?.poNumber) || `PO-${Date.now()}`,
          title: this.trim(body?.title) || request.title,
          status: "APPROVED",
          issueDate: this.date(body?.issueDate) || new Date(),
          expectedAt: this.date(body?.expectedAt) || request.neededBy,
          currency: this.trim(body?.currency) || request.currency,
          subtotalAmount: this.decimal(body?.subtotalAmount, this.number(request.amount)),
          taxAmount: this.decimal(body?.taxAmount),
          totalAmount: this.decimal(body?.totalAmount, this.number(request.amount)),
          notes: this.trim(body?.notes),
          vendorId: this.trim(body?.vendorId) || request.vendorId,
          procurementRequestId: request.id,
        },
      });

      const lines = Array.isArray(body?.lines) && body.lines.length
        ? body.lines
        : [{ description: request.title, quantity: 1, unitPrice: request.amount, lineAmount: request.amount }];

      for (const line of lines) {
        await (tx as any).financePurchaseOrderLine.create({
          data: {
            companyId,
            purchaseOrderId: purchaseOrder.id,
            description: this.trim(line?.description) || request.title,
            quantity: this.decimal(line?.quantity, 1),
            unitPrice: this.decimal(line?.unitPrice, this.number(request.amount)),
            lineAmount: this.decimal(line?.lineAmount, this.number(request.amount)),
          },
        });
      }

      await (tx as any).financeProcurementRequest.update({
        where: { id: request.id },
        data: { status: "ORDERED" },
      });

      return (tx as any).financePurchaseOrder.findUnique({
        where: { id: purchaseOrder.id },
        include: { lines: true, procurementRequest: true, vendor: true },
      });
    });
  }

  async listPurchaseOrders(actor: Actor) {
    const companyId = this.ensureCompanyId(actor);
    return (this.prisma as any).financePurchaseOrder.findMany({
      where: { companyId },
      include: { vendor: true, procurementRequest: true, lines: true, goodsReceipts: true, threeWayMatches: true },
      orderBy: [{ updatedAt: "desc" }],
    });
  }

  async createPurchaseOrder(actor: Actor, body: any) {
    const companyId = this.ensureCompanyId(actor);
    const poNumber = this.trim(body?.poNumber) || `PO-${Date.now()}`;
    const title = this.trim(body?.title);
    if (!title) throw new BadRequestException("title é obrigatório.");

    return this.prisma.$transaction(async (tx) => {
      const purchaseOrder = await (tx as any).financePurchaseOrder.create({
        data: {
          companyId,
          poNumber,
          title,
          status: this.trim(body?.status)?.toUpperCase() || "DRAFT",
          issueDate: this.date(body?.issueDate),
          expectedAt: this.date(body?.expectedAt),
          currency: this.trim(body?.currency) || "BRL",
          subtotalAmount: this.decimal(body?.subtotalAmount),
          taxAmount: this.decimal(body?.taxAmount),
          totalAmount: this.decimal(body?.totalAmount),
          notes: this.trim(body?.notes),
          vendorId: this.trim(body?.vendorId),
          procurementRequestId: this.trim(body?.procurementRequestId),
        },
      });

      const lines = Array.isArray(body?.lines) ? body.lines : [];
      for (const line of lines) {
        await (tx as any).financePurchaseOrderLine.create({
          data: {
            companyId,
            purchaseOrderId: purchaseOrder.id,
            description: this.trim(line?.description) || "Linha de compra",
            quantity: this.decimal(line?.quantity, 1),
            unitPrice: this.decimal(line?.unitPrice),
            lineAmount: this.decimal(line?.lineAmount),
          },
        });
      }

      return (tx as any).financePurchaseOrder.findUnique({
        where: { id: purchaseOrder.id },
        include: { lines: true, vendor: true, procurementRequest: true },
      });
    });
  }

  async issuePurchaseOrder(actor: Actor, purchaseOrderId: string) {
    const companyId = this.ensureCompanyId(actor);
    const existing = await (this.prisma as any).financePurchaseOrder.findFirst({
      where: { id: purchaseOrderId, companyId },
    });
    if (!existing) throw new NotFoundException("PO não encontrada.");
    return (this.prisma as any).financePurchaseOrder.update({
      where: { id: purchaseOrderId },
      data: { status: "ISSUED", issueDate: existing.issueDate ?? new Date() },
    });
  }

  async createGoodsReceipt(actor: Actor, purchaseOrderId: string, body: any) {
    const companyId = this.ensureCompanyId(actor);
    const purchaseOrder = await (this.prisma as any).financePurchaseOrder.findFirst({
      where: { id: purchaseOrderId, companyId },
    });
    if (!purchaseOrder) throw new NotFoundException("PO não encontrada.");

    const receipt = await (this.prisma as any).financeGoodsReceipt.create({
      data: {
        companyId,
        purchaseOrderId,
        receiptNumber: this.trim(body?.receiptNumber) || `GR-${Date.now()}`,
        status: this.trim(body?.status)?.toUpperCase() || "COMPLETE",
        receivedAt: this.date(body?.receivedAt) || new Date(),
        receivedQty: this.decimal(body?.receivedQty, 1),
        varianceNotes: this.trim(body?.varianceNotes),
      },
    });

    await (this.prisma as any).financePurchaseOrder.update({
      where: { id: purchaseOrderId },
      data: { status: receipt.status === "COMPLETE" ? "RECEIVED" : "PARTIALLY_RECEIVED" },
    });

    return receipt;
  }

  async createThreeWayMatch(actor: Actor, purchaseOrderId: string, body: any) {
    const companyId = this.ensureCompanyId(actor);
    const purchaseOrder = await (this.prisma as any).financePurchaseOrder.findFirst({
      where: { id: purchaseOrderId, companyId },
    });
    if (!purchaseOrder) throw new NotFoundException("PO não encontrada.");

    return (this.prisma as any).financeThreeWayMatch.create({
      data: {
        companyId,
        purchaseOrderId,
        goodsReceiptId: this.trim(body?.goodsReceiptId),
        payableId: this.trim(body?.payableId),
        status: this.trim(body?.status)?.toUpperCase() || "MATCHED",
        varianceAmount: body?.varianceAmount !== undefined ? this.decimal(body?.varianceAmount) : null,
        notes: this.trim(body?.notes),
        matchedAt: this.date(body?.matchedAt) || new Date(),
      },
    });
  }

  async listExpenseReports(actor: Actor) {
    const companyId = this.ensureCompanyId(actor);
    return (this.prisma as any).financeExpenseReport.findMany({
      where: { companyId },
      include: { items: true },
      orderBy: [{ updatedAt: "desc" }],
    });
  }

  async createExpenseReport(actor: Actor, body: any) {
    const companyId = this.ensureCompanyId(actor);
    const title = this.trim(body?.title);
    const employeeName = this.trim(body?.employeeName) || this.trim(actor.name);
    if (!title || !employeeName) throw new BadRequestException("title e employeeName são obrigatórios.");
    return (this.prisma as any).financeExpenseReport.create({
      data: {
        companyId,
        title,
        employeeName,
        status: this.trim(body?.status)?.toUpperCase() || "DRAFT",
        currency: this.trim(body?.currency) || "BRL",
        totalAmount: this.decimal(body?.totalAmount),
        notes: this.trim(body?.notes),
      },
    });
  }

  async addExpenseItem(actor: Actor, reportId: string, body: any) {
    const companyId = this.ensureCompanyId(actor);
    const report = await (this.prisma as any).financeExpenseReport.findFirst({
      where: { id: reportId, companyId },
    });
    if (!report) throw new NotFoundException("Relatório de despesa não encontrado.");

    return this.prisma.$transaction(async (tx) => {
      const item = await (tx as any).financeExpenseItem.create({
        data: {
          companyId,
          expenseReportId: reportId,
          description: this.trim(body?.description) || "Despesa",
          expenseDate: this.date(body?.expenseDate),
          amount: this.decimal(body?.amount),
          currency: this.trim(body?.currency) || report.currency,
          source: this.trim(body?.source)?.toUpperCase() || "MANUAL",
          merchant: this.trim(body?.merchant),
          receiptUrl: this.trim(body?.receiptUrl),
          ocrJson: body?.ocrJson ?? null,
          corporateCardId: this.trim(body?.corporateCardId),
          cardTransactionId: this.trim(body?.cardTransactionId),
        },
      });

      const items = await (tx as any).financeExpenseItem.findMany({ where: { expenseReportId: reportId, companyId } });
      await (tx as any).financeExpenseReport.update({
        where: { id: reportId },
        data: { totalAmount: this.decimal(this.sumAmount(items, (entry: any) => entry.amount)) },
      });

      return item;
    });
  }

  async submitExpenseReport(actor: Actor, reportId: string) {
    const companyId = this.ensureCompanyId(actor);
    const report = await (this.prisma as any).financeExpenseReport.findFirst({ where: { id: reportId, companyId } });
    if (!report) throw new NotFoundException("Relatório de despesa não encontrado.");
    return (this.prisma as any).financeExpenseReport.update({
      where: { id: reportId },
      data: { status: "APPROVAL_PENDING", submittedAt: new Date() },
    });
  }

  async approveExpenseReport(actor: Actor, reportId: string) {
    const companyId = this.ensureCompanyId(actor);
    const report = await (this.prisma as any).financeExpenseReport.findFirst({ where: { id: reportId, companyId } });
    if (!report) throw new NotFoundException("Relatório de despesa não encontrado.");
    return (this.prisma as any).financeExpenseReport.update({
      where: { id: reportId },
      data: { status: "APPROVED", approvedAt: new Date() },
    });
  }

  async reimburseExpenseReport(actor: Actor, reportId: string, body: any) {
    const companyId = this.ensureCompanyId(actor);
    const report = await (this.prisma as any).financeExpenseReport.findFirst({ where: { id: reportId, companyId } });
    if (!report) throw new NotFoundException("Relatório de despesa não encontrado.");

    return this.prisma.$transaction(async (tx) => {
      const updated = await (tx as any).financeExpenseReport.update({
        where: { id: reportId },
        data: { status: "REIMBURSED", reimbursedAt: this.date(body?.reimbursedAt) || new Date() },
      });

      await (tx as any).financeTransaction.create({
        data: {
          companyId,
          occurredAt: this.date(body?.reimbursedAt) || new Date(),
          description: `Reembolso - ${report.employeeName}`,
          amount: this.decimal(report.totalAmount),
          currency: report.currency,
          direction: "OUTFLOW",
          source: "MANUAL",
          status: "POSTED",
          bankAccountId: this.trim(body?.bankAccountId),
        },
      });

      return updated;
    });
  }

  async listCorporateCards(actor: Actor) {
    const companyId = this.ensureCompanyId(actor);
    return (this.prisma as any).financeCorporateCard.findMany({
      where: { companyId },
      include: { cardTransactions: true, expenseItems: true },
      orderBy: [{ updatedAt: "desc" }],
    });
  }

  async createCorporateCard(actor: Actor, body: any) {
    const companyId = this.ensureCompanyId(actor);
    const cardName = this.trim(body?.cardName);
    if (!cardName) throw new BadRequestException("cardName é obrigatório.");
    return (this.prisma as any).financeCorporateCard.create({
      data: {
        companyId,
        cardName,
        provider: this.trim(body?.provider),
        cardHolderName: this.trim(body?.cardHolderName),
        last4: this.trim(body?.last4),
        limitAmount: this.decimal(body?.limitAmount),
        spentAmount: this.decimal(body?.spentAmount),
        currency: this.trim(body?.currency) || "BRL",
        status: this.trim(body?.status)?.toUpperCase() || "ACTIVE",
        policySummary: this.trim(body?.policySummary),
      },
    });
  }

  async listCardTransactions(actor: Actor) {
    const companyId = this.ensureCompanyId(actor);
    return (this.prisma as any).financeCardTransaction.findMany({
      where: { companyId },
      include: { corporateCard: true, expenseItems: true },
      orderBy: [{ occurredAt: "desc" }],
    });
  }

  async createCardTransaction(actor: Actor, body: any) {
    const companyId = this.ensureCompanyId(actor);
    const corporateCardId = this.trim(body?.corporateCardId);
    const merchant = this.trim(body?.merchant);
    if (!corporateCardId || !merchant) throw new BadRequestException("corporateCardId e merchant são obrigatórios.");

    return this.prisma.$transaction(async (tx) => {
      const transaction = await (tx as any).financeCardTransaction.create({
        data: {
          companyId,
          corporateCardId,
          occurredAt: this.date(body?.occurredAt) || new Date(),
          merchant,
          amount: this.decimal(body?.amount),
          currency: this.trim(body?.currency) || "BRL",
          source: this.trim(body?.source)?.toUpperCase() || "CARD",
          status: this.trim(body?.status),
          memo: this.trim(body?.memo),
        },
      });

      const spent = await (tx as any).financeCardTransaction.findMany({ where: { corporateCardId, companyId } });
      await (tx as any).financeCorporateCard.update({
        where: { id: corporateCardId },
        data: { spentAmount: this.decimal(this.sumAmount(spent, (entry: any) => entry.amount)) },
      });

      return transaction;
    });
  }

  async listErpConnections(actor: Actor) {
    const companyId = this.ensureCompanyId(actor);
    return (this.prisma as any).financeErpConnection.findMany({
      where: { companyId },
      include: { jobs: true },
      orderBy: [{ updatedAt: "desc" }],
    });
  }

  async createErpConnection(actor: Actor, body: any) {
    const companyId = this.ensureCompanyId(actor);
    const label = this.trim(body?.label);
    if (!label) throw new BadRequestException("label é obrigatório.");
    return (this.prisma as any).financeErpConnection.create({
      data: {
        companyId,
        provider: this.trim(body?.provider)?.toUpperCase() || "OTHER",
        label,
        status: this.trim(body?.status)?.toUpperCase() || "CONNECTED",
        externalOrgId: this.trim(body?.externalOrgId),
        syncDirection: this.trim(body?.syncDirection),
        lastSyncAt: this.date(body?.lastSyncAt),
        credentialsJson: body?.credentialsJson ?? null,
        settingsJson: body?.settingsJson ?? null,
      },
    });
  }

  async runErpSync(actor: Actor, connectionId: string, body: any) {
    const companyId = this.ensureCompanyId(actor);
    const connection = await (this.prisma as any).financeErpConnection.findFirst({
      where: { id: connectionId, companyId },
    });
    if (!connection) throw new NotFoundException("Conexão ERP não encontrada.");

    return this.prisma.$transaction(async (tx) => {
      const job = await (tx as any).financeErpSyncJob.create({
        data: {
          companyId,
          connectionId,
          jobType: this.trim(body?.jobType) || "FULL_SYNC",
          status: "SYNCING",
          startedAt: new Date(),
          recordsSynced: this.number(body?.recordsSynced, 0),
          errorMessage: this.trim(body?.errorMessage),
        },
      });

      await (tx as any).financeErpConnection.update({
        where: { id: connectionId },
        data: {
          status: body?.errorMessage ? "ERROR" : "CONNECTED",
          lastSyncAt: new Date(),
        },
      });

      return job;
    });
  }

  async listTreasuryTransfers(actor: Actor) {
    const companyId = this.ensureCompanyId(actor);
    return (this.prisma as any).financeTreasuryTransfer.findMany({
      where: { companyId },
      include: { sourceBankAccount: true, destinationBankAccount: true },
      orderBy: [{ updatedAt: "desc" }],
    });
  }

  async createTreasuryTransfer(actor: Actor, body: any) {
    const companyId = this.ensureCompanyId(actor);
    const reference = this.trim(body?.reference) || `TR-${Date.now()}`;
    const amount = this.decimal(body?.amount);
    if (amount <= 0) throw new BadRequestException("amount é obrigatório.");
    return (this.prisma as any).financeTreasuryTransfer.create({
      data: {
        companyId,
        reference,
        status: this.trim(body?.status)?.toUpperCase() || "PLANNED",
        amount,
        currency: this.trim(body?.currency) || "BRL",
        initiatedAt: this.date(body?.initiatedAt),
        settledAt: this.date(body?.settledAt),
        expectedSettlementAt: this.date(body?.expectedSettlementAt),
        notes: this.trim(body?.notes),
        sourceBankAccountId: this.trim(body?.sourceBankAccountId),
        destinationBankAccountId: this.trim(body?.destinationBankAccountId),
      },
    });
  }

  async settleTreasuryTransfer(actor: Actor, transferId: string, body: any) {
    const companyId = this.ensureCompanyId(actor);
    const transfer = await (this.prisma as any).financeTreasuryTransfer.findFirst({
      where: { id: transferId, companyId },
    });
    if (!transfer) throw new NotFoundException("Transferência não encontrada.");
    return (this.prisma as any).financeTreasuryTransfer.update({
      where: { id: transferId },
      data: {
        status: this.trim(body?.status)?.toUpperCase() || "SETTLED",
        settledAt: this.date(body?.settledAt) || new Date(),
      },
    });
  }

  async listTreasuryAllocations(actor: Actor) {
    const companyId = this.ensureCompanyId(actor);
    return (this.prisma as any).financeTreasuryAllocation.findMany({
      where: { companyId },
      include: { bankAccount: true },
      orderBy: [{ updatedAt: "desc" }],
    });
  }

  async createTreasuryAllocation(actor: Actor, body: any) {
    const companyId = this.ensureCompanyId(actor);
    const label = this.trim(body?.label);
    if (!label) throw new BadRequestException("label é obrigatório.");
    return (this.prisma as any).financeTreasuryAllocation.create({
      data: {
        companyId,
        label,
        allocationType: this.trim(body?.allocationType)?.toUpperCase() || "OPERATING",
        amount: this.decimal(body?.amount),
        currency: this.trim(body?.currency) || "BRL",
        yieldPct: body?.yieldPct !== undefined ? this.decimal(body?.yieldPct) : null,
        riskNotes: this.trim(body?.riskNotes),
        bankAccountId: this.trim(body?.bankAccountId),
      },
    });
  }

  async listCashPositionSnapshots(actor: Actor) {
    const companyId = this.ensureCompanyId(actor);
    return (this.prisma as any).financeCashPositionSnapshot.findMany({
      where: { companyId },
      orderBy: [{ asOf: "desc" }],
    });
  }

  async createCashPositionSnapshot(actor: Actor, body: any) {
    const companyId = this.ensureCompanyId(actor);
    return (this.prisma as any).financeCashPositionSnapshot.create({
      data: {
        companyId,
        asOf: this.date(body?.asOf) || new Date(),
        availableCash: this.decimal(body?.availableCash),
        restrictedCash: this.decimal(body?.restrictedCash),
        projected7d: this.decimal(body?.projected7d),
        projected30d: this.decimal(body?.projected30d),
        concentrationRiskPct: body?.concentrationRiskPct !== undefined ? this.decimal(body?.concentrationRiskPct) : null,
        notes: this.trim(body?.notes),
      },
    });
  }

  async listAnomalyInsights(actor: Actor) {
    const companyId = this.ensureCompanyId(actor);
    return (this.prisma as any).financeAnomalyInsight.findMany({
      where: { companyId },
      orderBy: [{ updatedAt: "desc" }],
    });
  }

  async createAnomalyInsight(actor: Actor, body: any) {
    const companyId = this.ensureCompanyId(actor);
    const title = this.trim(body?.title);
    const description = this.trim(body?.description);
    if (!title || !description) throw new BadRequestException("title e description são obrigatórios.");
    return (this.prisma as any).financeAnomalyInsight.create({
      data: {
        companyId,
        title,
        description,
        severity: this.trim(body?.severity)?.toUpperCase() || "MEDIUM",
        anomalyType: this.trim(body?.anomalyType) || "GENERAL",
        affectedAmount: body?.affectedAmount !== undefined ? this.decimal(body?.affectedAmount) : null,
        resolvedAt: this.date(body?.resolvedAt),
        explanation: this.trim(body?.explanation),
      },
    });
  }

  async listCashForecastRuns(actor: Actor) {
    const companyId = this.ensureCompanyId(actor);
    return (this.prisma as any).financeCashForecastRun.findMany({
      where: { companyId },
      orderBy: [{ asOf: "desc" }],
    });
  }

  async createCashForecastRun(actor: Actor, body: any) {
    const companyId = this.ensureCompanyId(actor);
    return (this.prisma as any).financeCashForecastRun.create({
      data: {
        companyId,
        asOf: this.date(body?.asOf) || new Date(),
        horizonDays: this.number(body?.horizonDays, 30),
        projectedInflows: this.decimal(body?.projectedInflows),
        projectedOutflows: this.decimal(body?.projectedOutflows),
        projectedClosingCash: this.decimal(body?.projectedClosingCash),
        confidencePct: body?.confidencePct !== undefined ? this.decimal(body?.confidencePct) : null,
        assumptionsJson: body?.assumptionsJson ?? null,
        notes: this.trim(body?.notes),
      },
    });
  }

  async listTravelPolicies(actor: Actor) {
    const companyId = this.ensureCompanyId(actor);
    return (this.prisma as any).financeTravelPolicy.findMany({
      where: { companyId },
      include: { requests: true },
      orderBy: [{ updatedAt: "desc" }],
    });
  }

  async createTravelPolicy(actor: Actor, body: any) {
    const companyId = this.ensureCompanyId(actor);
    const name = this.trim(body?.name);
    if (!name) throw new BadRequestException("name é obrigatório.");
    return (this.prisma as any).financeTravelPolicy.create({
      data: {
        companyId,
        name,
        status: this.trim(body?.status)?.toUpperCase() || "ACTIVE",
        countryCode: this.trim(body?.countryCode),
        maxFlightAmount: body?.maxFlightAmount !== undefined ? this.decimal(body?.maxFlightAmount) : null,
        maxHotelNightly: body?.maxHotelNightly !== undefined ? this.decimal(body?.maxHotelNightly) : null,
        perDiemAmount: body?.perDiemAmount !== undefined ? this.decimal(body?.perDiemAmount) : null,
        approvalNotes: this.trim(body?.approvalNotes),
      },
    });
  }

  async listTravelRequests(actor: Actor) {
    const companyId = this.ensureCompanyId(actor);
    return (this.prisma as any).financeTravelRequest.findMany({
      where: { companyId },
      include: { policy: true, bookings: true, advances: true },
      orderBy: [{ updatedAt: "desc" }],
    });
  }

  async createTravelRequest(actor: Actor, body: any) {
    const companyId = this.ensureCompanyId(actor);
    const travelerName = this.trim(body?.travelerName);
    const destination = this.trim(body?.destination);
    const purpose = this.trim(body?.purpose);
    if (!travelerName || !destination || !purpose) {
      throw new BadRequestException("travelerName, destination e purpose são obrigatórios.");
    }
    return (this.prisma as any).financeTravelRequest.create({
      data: {
        companyId,
        travelerName,
        destination,
        purpose,
        departureAt: this.date(body?.departureAt),
        returnAt: this.date(body?.returnAt),
        estimatedCost: this.decimal(body?.estimatedCost),
        currency: this.trim(body?.currency) || "BRL",
        status: this.trim(body?.status)?.toUpperCase() || "DRAFT",
        notes: this.trim(body?.notes),
        policyId: this.trim(body?.policyId),
      },
    });
  }

  async submitTravelRequest(actor: Actor, requestId: string) {
    const companyId = this.ensureCompanyId(actor);
    const request = await (this.prisma as any).financeTravelRequest.findFirst({
      where: { id: requestId, companyId },
    });
    if (!request) throw new NotFoundException("Solicitação de viagem não encontrada.");
    return (this.prisma as any).financeTravelRequest.update({
      where: { id: requestId },
      data: { status: "APPROVAL_PENDING" },
    });
  }

  async approveTravelRequest(actor: Actor, requestId: string) {
    const companyId = this.ensureCompanyId(actor);
    const request = await (this.prisma as any).financeTravelRequest.findFirst({
      where: { id: requestId, companyId },
    });
    if (!request) throw new NotFoundException("Solicitação de viagem não encontrada.");
    return (this.prisma as any).financeTravelRequest.update({
      where: { id: requestId },
      data: { status: "APPROVED" },
    });
  }

  async rejectTravelRequest(actor: Actor, requestId: string, body: any) {
    const companyId = this.ensureCompanyId(actor);
    const request = await (this.prisma as any).financeTravelRequest.findFirst({
      where: { id: requestId, companyId },
    });
    if (!request) throw new NotFoundException("Solicitação de viagem não encontrada.");
    return (this.prisma as any).financeTravelRequest.update({
      where: { id: requestId },
      data: {
        status: "REJECTED",
        notes: this.trim(body?.notes) || request.notes,
      },
    });
  }

  async listTravelBookings(actor: Actor) {
    const companyId = this.ensureCompanyId(actor);
    return (this.prisma as any).financeTravelBooking.findMany({
      where: { companyId },
      include: { travelRequest: true },
      orderBy: [{ updatedAt: "desc" }],
    });
  }

  async createTravelBooking(actor: Actor, body: any) {
    const companyId = this.ensureCompanyId(actor);
    const travelRequestId = this.trim(body?.travelRequestId);
    if (!travelRequestId) throw new BadRequestException("travelRequestId é obrigatório.");
    const request = await (this.prisma as any).financeTravelRequest.findFirst({
      where: { id: travelRequestId, companyId },
    });
    if (!request) throw new NotFoundException("Solicitação de viagem não encontrada.");
    const booking = await (this.prisma as any).financeTravelBooking.create({
      data: {
        companyId,
        travelRequestId,
        bookingType: this.trim(body?.bookingType)?.toUpperCase() || "OTHER",
        provider: this.trim(body?.provider),
        reference: this.trim(body?.reference),
        bookedAt: this.date(body?.bookedAt) || new Date(),
        amount: this.decimal(body?.amount),
        currency: this.trim(body?.currency) || request.currency || "BRL",
        autoReconciled: body?.autoReconciled === true,
        notes: this.trim(body?.notes),
      },
    });

    await (this.prisma as any).financeTravelRequest.update({
      where: { id: travelRequestId },
      data: { status: "BOOKED" },
    });

    return booking;
  }

  async reconcileTravelBooking(actor: Actor, bookingId: string, body: any) {
    const companyId = this.ensureCompanyId(actor);
    const booking = await (this.prisma as any).financeTravelBooking.findFirst({
      where: { id: bookingId, companyId },
      include: { travelRequest: true },
    });
    if (!booking) throw new NotFoundException("Reserva de viagem não encontrada.");

    return this.prisma.$transaction(async (tx) => {
      const updated = await (tx as any).financeTravelBooking.update({
        where: { id: bookingId },
        data: {
          autoReconciled: true,
          notes: this.trim(body?.notes) || booking.notes,
        },
      });

      if (body?.createTransaction === true) {
        await (tx as any).financeTransaction.create({
          data: {
            companyId,
            occurredAt: this.date(body?.occurredAt) || new Date(),
            description: `Viagem reconciliada - ${booking.travelRequest.travelerName}`,
            amount: this.decimal(body?.amount, this.number(booking.amount)),
            currency: this.trim(body?.currency) || booking.currency,
            direction: "OUTFLOW",
            source: "MANUAL",
            status: "POSTED",
            bankAccountId: this.trim(body?.bankAccountId),
            categoryId: this.trim(body?.categoryId),
            costCenterId: this.trim(body?.costCenterId),
            metadataJson: { travelBookingId: booking.id, autoReconciled: true },
          },
        });
      }

      return updated;
    });
  }

  async listTravelAdvances(actor: Actor) {
    const companyId = this.ensureCompanyId(actor);
    return (this.prisma as any).financeTravelAdvance.findMany({
      where: { companyId },
      include: { travelRequest: true },
      orderBy: [{ updatedAt: "desc" }],
    });
  }

  async createTravelAdvance(actor: Actor, body: any) {
    const companyId = this.ensureCompanyId(actor);
    const travelRequestId = this.trim(body?.travelRequestId);
    if (!travelRequestId) throw new BadRequestException("travelRequestId é obrigatório.");
    return (this.prisma as any).financeTravelAdvance.create({
      data: {
        companyId,
        travelRequestId,
        amount: this.decimal(body?.amount),
        currency: this.trim(body?.currency) || "BRL",
        status: this.trim(body?.status)?.toUpperCase() || "REQUESTED",
        requestedAt: this.date(body?.requestedAt) || new Date(),
        settledAt: this.date(body?.settledAt),
        settlementNotes: this.trim(body?.settlementNotes),
      },
    });
  }

  async settleTravelAdvance(actor: Actor, advanceId: string, body: any) {
    const companyId = this.ensureCompanyId(actor);
    const advance = await (this.prisma as any).financeTravelAdvance.findFirst({
      where: { id: advanceId, companyId },
    });
    if (!advance) throw new NotFoundException("Adiantamento de viagem não encontrado.");
    return (this.prisma as any).financeTravelAdvance.update({
      where: { id: advanceId },
      data: {
        status: this.trim(body?.status)?.toUpperCase() || "SETTLED",
        settledAt: this.date(body?.settledAt) || new Date(),
        settlementNotes: this.trim(body?.settlementNotes),
      },
    });
  }

  async listBillingPlans(actor: Actor) {
    const companyId = this.ensureCompanyId(actor);
    return (this.prisma as any).financeBillingPlan.findMany({
      where: { companyId },
      include: { invoices: true, revenueSchedules: true, recoveryCases: true },
      orderBy: [{ updatedAt: "desc" }],
    });
  }

  async createBillingPlan(actor: Actor, body: any) {
    const companyId = this.ensureCompanyId(actor);
    const customerName = this.trim(body?.customerName);
    const planName = this.trim(body?.planName);
    if (!customerName || !planName) {
      throw new BadRequestException("customerName e planName são obrigatórios.");
    }
    return (this.prisma as any).financeBillingPlan.create({
      data: {
        companyId,
        customerName,
        planName,
        interval: this.trim(body?.interval)?.toUpperCase() || "MONTHLY",
        status: this.trim(body?.status)?.toUpperCase() || "DRAFT",
        amount: this.decimal(body?.amount),
        currency: this.trim(body?.currency) || "BRL",
        nextBillingAt: this.date(body?.nextBillingAt),
        churnRiskPct: body?.churnRiskPct !== undefined ? this.decimal(body?.churnRiskPct) : null,
        recoveryMode: this.trim(body?.recoveryMode),
      },
    });
  }

  async listInvoices(actor: Actor) {
    const companyId = this.ensureCompanyId(actor);
    return (this.prisma as any).financeInvoice.findMany({
      where: { companyId },
      include: { billingPlan: true, receivable: true },
      orderBy: [{ updatedAt: "desc" }],
    });
  }

  async createInvoice(actor: Actor, body: any) {
    const companyId = this.ensureCompanyId(actor);
    const invoiceNumber = this.trim(body?.invoiceNumber);
    if (!invoiceNumber) throw new BadRequestException("invoiceNumber é obrigatório.");
    const amount = this.decimal(body?.amount);
    const taxAmount = this.decimal(body?.taxAmount);
    const netAmount = this.decimal(body?.netAmount, amount + taxAmount);
    return (this.prisma as any).financeInvoice.create({
      data: {
        companyId,
        invoiceNumber,
        status: this.trim(body?.status)?.toUpperCase() || "DRAFT",
        issueDate: this.date(body?.issueDate),
        dueAt: this.date(body?.dueAt),
        paidAt: this.date(body?.paidAt),
        amount,
        taxAmount,
        netAmount,
        currency: this.trim(body?.currency) || "BRL",
        smartNotes: this.trim(body?.smartNotes),
        billingPlanId: this.trim(body?.billingPlanId),
        receivableId: this.trim(body?.receivableId),
      },
    });
  }

  async listTaxProfiles(actor: Actor) {
    const companyId = this.ensureCompanyId(actor);
    return (this.prisma as any).financeTaxProfile.findMany({
      where: { companyId },
      orderBy: [{ countryCode: "asc" }, { label: "asc" }],
    });
  }

  async createTaxProfile(actor: Actor, body: any) {
    const companyId = this.ensureCompanyId(actor);
    const label = this.trim(body?.label);
    const countryCode = this.trim(body?.countryCode);
    if (!label || !countryCode) throw new BadRequestException("label e countryCode são obrigatórios.");
    return (this.prisma as any).financeTaxProfile.create({
      data: {
        companyId,
        label,
        countryCode,
        regime: this.trim(body?.regime)?.toUpperCase() || "OTHER",
        taxNumber: this.trim(body?.taxNumber),
        defaultRatePct: body?.defaultRatePct !== undefined ? this.decimal(body?.defaultRatePct) : null,
        notes: this.trim(body?.notes),
      },
    });
  }

  async listRevenueSchedules(actor: Actor) {
    const companyId = this.ensureCompanyId(actor);
    return (this.prisma as any).financeRevenueSchedule.findMany({
      where: { companyId },
      include: { billingPlan: true },
      orderBy: [{ updatedAt: "desc" }],
    });
  }

  async createRevenueSchedule(actor: Actor, body: any) {
    const companyId = this.ensureCompanyId(actor);
    const label = this.trim(body?.label);
    if (!label) throw new BadRequestException("label é obrigatório.");
    return (this.prisma as any).financeRevenueSchedule.create({
      data: {
        companyId,
        label,
        status: this.trim(body?.status)?.toUpperCase() || "DRAFT",
        recognitionStart: this.date(body?.recognitionStart),
        recognitionEnd: this.date(body?.recognitionEnd),
        recognizedAmount: this.decimal(body?.recognizedAmount),
        deferredAmount: this.decimal(body?.deferredAmount),
        notes: this.trim(body?.notes),
        billingPlanId: this.trim(body?.billingPlanId),
      },
    });
  }

  async listRecoveryCases(actor: Actor) {
    const companyId = this.ensureCompanyId(actor);
    return (this.prisma as any).financeRecoveryCase.findMany({
      where: { companyId },
      include: { billingPlan: true, receivable: true },
      orderBy: [{ updatedAt: "desc" }],
    });
  }

  async createRecoveryCase(actor: Actor, body: any) {
    const companyId = this.ensureCompanyId(actor);
    return (this.prisma as any).financeRecoveryCase.create({
      data: {
        companyId,
        status: this.trim(body?.status)?.toUpperCase() || "PENDING",
        reason: this.trim(body?.reason),
        attemptCount: this.number(body?.attemptCount, 0),
        recoveredAt: this.date(body?.recoveredAt),
        notes: this.trim(body?.notes),
        billingPlanId: this.trim(body?.billingPlanId),
        receivableId: this.trim(body?.receivableId),
      },
    });
  }

  async advanceRecoveryCase(actor: Actor, recoveryCaseId: string, body: any) {
    const companyId = this.ensureCompanyId(actor);
    const recoveryCase = await (this.prisma as any).financeRecoveryCase.findFirst({
      where: { id: recoveryCaseId, companyId },
    });
    if (!recoveryCase) throw new NotFoundException("Caso de recuperação não encontrado.");
    const status = this.trim(body?.status)?.toUpperCase() || "IN_PROGRESS";
    return (this.prisma as any).financeRecoveryCase.update({
      where: { id: recoveryCaseId },
      data: {
        status,
        attemptCount: this.number(body?.attemptCount, this.number(recoveryCase.attemptCount, 0) + 1),
        recoveredAt: status === "RECOVERED" ? this.date(body?.recoveredAt) || new Date() : this.date(body?.recoveredAt),
        notes: this.trim(body?.notes) || recoveryCase.notes,
      },
    });
  }

  async listCloseEvidences(actor: Actor) {
    const companyId = this.ensureCompanyId(actor);
    return (this.prisma as any).financeCloseEvidence.findMany({
      where: { companyId },
      include: { closePeriod: true },
      orderBy: [{ updatedAt: "desc" }],
    });
  }

  async createCloseEvidence(actor: Actor, body: any) {
    const companyId = this.ensureCompanyId(actor);
    const title = this.trim(body?.title);
    const evidenceType = this.trim(body?.evidenceType);
    const closePeriodId = this.trim(body?.closePeriodId);
    if (!title || !evidenceType || !closePeriodId) {
      throw new BadRequestException("title, evidenceType e closePeriodId são obrigatórios.");
    }
    return (this.prisma as any).financeCloseEvidence.create({
      data: {
        companyId,
        title,
        evidenceType,
        fileUrl: this.trim(body?.fileUrl),
        status: this.trim(body?.status)?.toUpperCase() || "PENDING",
        notes: this.trim(body?.notes),
        closePeriodId,
      },
    });
  }

  async verifyCloseEvidence(actor: Actor, evidenceId: string, body: any) {
    const companyId = this.ensureCompanyId(actor);
    const evidence = await (this.prisma as any).financeCloseEvidence.findFirst({
      where: { id: evidenceId, companyId },
    });
    if (!evidence) throw new NotFoundException("Evidência de fechamento não encontrada.");
    return (this.prisma as any).financeCloseEvidence.update({
      where: { id: evidenceId },
      data: {
        status: this.trim(body?.status)?.toUpperCase() || "VERIFIED",
        notes: this.trim(body?.notes) || evidence.notes,
        fileUrl: this.trim(body?.fileUrl) || evidence.fileUrl,
      },
    });
  }

  async listGlobalEntities(actor: Actor) {
    const companyId = this.ensureCompanyId(actor);
    return (this.prisma as any).financeGlobalEntity.findMany({
      where: { companyId },
      include: { countryPolicies: true },
      orderBy: [{ updatedAt: "desc" }],
    });
  }

  async createGlobalEntity(actor: Actor, body: any) {
    const companyId = this.ensureCompanyId(actor);
    const name = this.trim(body?.name);
    const countryCode = this.trim(body?.countryCode);
    const baseCurrency = this.trim(body?.baseCurrency);
    if (!name || !countryCode || !baseCurrency) {
      throw new BadRequestException("name, countryCode e baseCurrency são obrigatórios.");
    }
    return (this.prisma as any).financeGlobalEntity.create({
      data: {
        companyId,
        name,
        legalName: this.trim(body?.legalName),
        countryCode,
        baseCurrency,
        status: this.trim(body?.status)?.toUpperCase() || "DRAFT",
        taxNumber: this.trim(body?.taxNumber),
        notes: this.trim(body?.notes),
      },
    });
  }

  async listCountryPolicies(actor: Actor) {
    const companyId = this.ensureCompanyId(actor);
    return (this.prisma as any).financeCountryPolicy.findMany({
      where: { companyId },
      include: { globalEntity: true },
      orderBy: [{ updatedAt: "desc" }],
    });
  }

  async createCountryPolicy(actor: Actor, body: any) {
    const companyId = this.ensureCompanyId(actor);
    const countryCode = this.trim(body?.countryCode);
    if (!countryCode) throw new BadRequestException("countryCode é obrigatório.");
    return (this.prisma as any).financeCountryPolicy.create({
      data: {
        companyId,
        countryCode,
        status: this.trim(body?.status)?.toUpperCase() || "DRAFT",
        expensePolicyJson: body?.expensePolicyJson ?? null,
        reimbursementCurrency: this.trim(body?.reimbursementCurrency),
        notes: this.trim(body?.notes),
        globalEntityId: this.trim(body?.globalEntityId),
      },
    });
  }

  async listPlanDrivers(actor: Actor) {
    const companyId = this.ensureCompanyId(actor);
    return (this.prisma as any).financePlanDriver.findMany({
      where: { companyId },
      orderBy: [{ driverType: "asc" }, { label: "asc" }],
    });
  }

  async createPlanDriver(actor: Actor, body: any) {
    const companyId = this.ensureCompanyId(actor);
    const label = this.trim(body?.label);
    if (!label) throw new BadRequestException("label é obrigatório.");
    return (this.prisma as any).financePlanDriver.create({
      data: {
        companyId,
        label,
        driverType: this.trim(body?.driverType)?.toUpperCase() || "CUSTOM",
        unit: this.trim(body?.unit),
        currentValue: this.decimal(body?.currentValue),
        targetValue: body?.targetValue !== undefined ? this.decimal(body?.targetValue) : null,
        notes: this.trim(body?.notes),
      },
    });
  }

  async listPlanScenarios(actor: Actor) {
    const companyId = this.ensureCompanyId(actor);
    return (this.prisma as any).financePlanScenario.findMany({
      where: { companyId },
      orderBy: [{ updatedAt: "desc" }],
    });
  }

  async createPlanScenario(actor: Actor, body: any) {
    const companyId = this.ensureCompanyId(actor);
    const label = this.trim(body?.label);
    if (!label) throw new BadRequestException("label é obrigatório.");
    return (this.prisma as any).financePlanScenario.create({
      data: {
        companyId,
        label,
        status: this.trim(body?.status)?.toUpperCase() || "DRAFT",
        horizonMonths: this.number(body?.horizonMonths, 12),
        headcountPlan: body?.headcountPlan !== undefined ? this.number(body?.headcountPlan) : null,
        revenuePlan: body?.revenuePlan !== undefined ? this.decimal(body?.revenuePlan) : null,
        spendPlan: body?.spendPlan !== undefined ? this.decimal(body?.spendPlan) : null,
        assumptionsJson: body?.assumptionsJson ?? null,
        notes: this.trim(body?.notes),
      },
    });
  }

  async listCopilotInsights(actor: Actor) {
    const companyId = this.ensureCompanyId(actor);
    return (this.prisma as any).financeCopilotInsight.findMany({
      where: { companyId },
      orderBy: [{ updatedAt: "desc" }],
    });
  }

  async createCopilotInsight(actor: Actor, body: any) {
    const companyId = this.ensureCompanyId(actor);
    const title = this.trim(body?.title);
    const summary = this.trim(body?.summary);
    if (!title || !summary) throw new BadRequestException("title e summary são obrigatórios.");
    return (this.prisma as any).financeCopilotInsight.create({
      data: {
        companyId,
        title,
        summary,
        recommendation: this.trim(body?.recommendation),
        actionLabel: this.trim(body?.actionLabel),
        actionPayload: body?.actionPayload ?? null,
        riskLevel: this.trim(body?.riskLevel),
      },
    });
  }

  async listCopilotPlaybooks(actor: Actor) {
    const companyId = this.ensureCompanyId(actor);
    return (this.prisma as any).financeCopilotPlaybook.findMany({
      where: { companyId },
      orderBy: [{ updatedAt: "desc" }],
    });
  }

  async createCopilotPlaybook(actor: Actor, body: any) {
    const companyId = this.ensureCompanyId(actor);
    const title = this.trim(body?.title);
    const objective = this.trim(body?.objective);
    if (!title || !objective) throw new BadRequestException("title e objective são obrigatórios.");
    return (this.prisma as any).financeCopilotPlaybook.create({
      data: {
        companyId,
        title,
        objective,
        status: this.trim(body?.status)?.toUpperCase() || "DRAFT",
        triggerType: this.trim(body?.triggerType),
        stepsJson: body?.stepsJson ?? null,
        lastRunAt: this.date(body?.lastRunAt),
        notes: this.trim(body?.notes),
      },
    });
  }

  async executeCopilotPlaybook(actor: Actor, playbookId: string, body: any) {
    const companyId = this.ensureCompanyId(actor);
    const playbook = await (this.prisma as any).financeCopilotPlaybook.findFirst({
      where: { id: playbookId, companyId },
    });
    if (!playbook) throw new NotFoundException("Playbook do copiloto não encontrado.");
    return (this.prisma as any).financeCopilotPlaybook.update({
      where: { id: playbookId },
      data: {
        status: this.trim(body?.status)?.toUpperCase() || "RUNNING",
        lastRunAt: this.date(body?.lastRunAt) || new Date(),
        notes: this.trim(body?.notes) || playbook.notes,
      },
    });
  }

  async openCopilotInvestigation(actor: Actor, body: any) {
    const companyId = this.ensureCompanyId(actor);
    const title = this.trim(body?.title);
    const summary = this.trim(body?.summary);
    if (!title || !summary) throw new BadRequestException("title e summary sÃ£o obrigatÃ³rios.");
    return (this.prisma as any).financeCopilotInsight.create({
      data: {
        companyId,
        title,
        summary,
        recommendation: this.trim(body?.recommendation) || "Investigar exceÃ§Ã£o financeira identificada pelo copiloto.",
        actionLabel: this.trim(body?.actionLabel) || "Abrir investigaÃ§Ã£o",
        actionPayload: {
          type: "investigation",
          targetType: this.trim(body?.targetType),
          targetId: this.trim(body?.targetId),
          scope: body?.scope ?? null,
        },
        riskLevel: this.trim(body?.riskLevel) || "HIGH",
      },
    });
  }

  async suggestCostCut(actor: Actor, body: any) {
    const companyId = this.ensureCompanyId(actor);
    const vendorName = this.trim(body?.vendorName) || "Spend baseline";
    const title = this.trim(body?.title) || `Corte sugerido - ${vendorName}`;
    const summary = this.trim(body?.summary) || "O copiloto identificou uma oportunidade de reduÃ§Ã£o de custo.";
    return (this.prisma as any).financeCopilotInsight.create({
      data: {
        companyId,
        title,
        summary,
        recommendation: this.trim(body?.recommendation) || "Renegociar fornecedor, reavaliar contrato e reduzir spend recorrente.",
        actionLabel: this.trim(body?.actionLabel) || "Executar plano de corte",
        actionPayload: {
          type: "cost_cut",
          vendorName,
          estimatedMonthlySaving: this.decimal(body?.estimatedMonthlySaving),
          benchmarkReference: this.trim(body?.benchmarkReference),
        },
        riskLevel: this.trim(body?.riskLevel) || "MEDIUM",
      },
    });
  }

  async triggerRecoveryActions(actor: Actor, body: any) {
    const companyId = this.ensureCompanyId(actor);
    const billingPlanId = this.trim(body?.billingPlanId);
    const receivableId = this.trim(body?.receivableId);
    const customerName = this.trim(body?.customerName);
    if (!billingPlanId && !receivableId) {
      throw new BadRequestException("billingPlanId ou receivableId ? obrigat?rio.");
    }
    return (this.prisma as any).financeRecoveryCase.create({
      data: {
        companyId,
        billingPlanId,
        receivableId,
        status: this.trim(body?.status)?.toUpperCase() || "PENDING",
        reason: this.trim(body?.reason) || customerName || "Recovery iniciado pelo copiloto financeiro.",
        attemptCount: this.number(body?.attemptCount, 1),
        recoveredAt: this.date(body?.recoveredAt),
        notes: this.trim(body?.notes) || "Recovery disparado automaticamente.",
      },
    });
  }

  async recommendCashAllocation(actor: Actor, body: any) {
    const companyId = this.ensureCompanyId(actor);
    const title = this.trim(body?.title) || "RealocaÃ§Ã£o recomendada de caixa";
    const summary = this.trim(body?.summary) || "O copiloto recomenda realocaÃ§Ã£o entre contas para preservar liquidez.";
    return (this.prisma as any).financeCopilotInsight.create({
      data: {
        companyId,
        title,
        summary,
        recommendation: this.trim(body?.recommendation) || "Transferir caixa entre contas/unidades para cobrir saÃ­das crÃ­ticas e otimizar liquidez.",
        actionLabel: this.trim(body?.actionLabel) || "Avaliar transferÃªncia",
        actionPayload: {
          type: "cash_allocation",
          sourceBankAccountId: this.trim(body?.sourceBankAccountId),
          destinationBankAccountId: this.trim(body?.destinationBankAccountId),
          amount: this.decimal(body?.amount),
          horizonDays: this.number(body?.horizonDays, 7),
        },
        riskLevel: this.trim(body?.riskLevel) || "MEDIUM",
      },
    });
  }

  async listUsageMeters(actor: Actor) {
    const companyId = this.ensureCompanyId(actor);
    return (this.prisma as any).financeUsageMeter.findMany({
      where: { companyId },
      orderBy: [{ updatedAt: "desc" }],
    });
  }

  async createUsageMeter(actor: Actor, body: any) {
    const companyId = this.ensureCompanyId(actor);
    const name = this.trim(body?.name);
    if (!name) throw new BadRequestException("name Ã© obrigatÃ³rio.");
    return (this.prisma as any).financeUsageMeter.create({
      data: {
        companyId,
        name,
        externalKey: this.trim(body?.externalKey),
        billingUnit: this.trim(body?.billingUnit),
        currentUsage: this.decimal(body?.currentUsage),
        includedUnits: body?.includedUnits !== undefined ? this.decimal(body?.includedUnits) : null,
        overageRate: body?.overageRate !== undefined ? this.decimal(body?.overageRate) : null,
        notes: this.trim(body?.notes),
      },
    });
  }

  async listUsageEvents(actor: Actor) {
    const companyId = this.ensureCompanyId(actor);
    return (this.prisma as any).financeUsageEvent.findMany({
      where: { companyId },
      orderBy: [{ occurredAt: "desc" }],
    });
  }

  async createUsageEvent(actor: Actor, body: any) {
    const companyId = this.ensureCompanyId(actor);
    const usageMeterId = this.trim(body?.usageMeterId);
    if (!usageMeterId) throw new BadRequestException("usageMeterId Ã© obrigatÃ³rio.");
    return (this.prisma as any).financeUsageEvent.create({
      data: {
        companyId,
        usageMeterId,
        customerName: this.trim(body?.customerName) || "Customer",
        quantity: this.decimal(body?.quantity, 1),
        occurredAt: this.date(body?.occurredAt) || new Date(),
        source: this.trim(body?.source),
        metadataJson: body?.metadataJson ?? null,
      },
    });
  }

  async listRevenueSubledgerEntries(actor: Actor) {
    const companyId = this.ensureCompanyId(actor);
    return (this.prisma as any).financeRevenueSubledgerEntry.findMany({
      where: { companyId },
      orderBy: [{ entryDate: "desc" }],
    });
  }

  async createRevenueSubledgerEntry(actor: Actor, body: any) {
    const companyId = this.ensureCompanyId(actor);
    const entryType = this.trim(body?.entryType);
    if (!entryType) throw new BadRequestException("entryType Ã© obrigatÃ³rio.");
    return (this.prisma as any).financeRevenueSubledgerEntry.create({
      data: {
        companyId,
        entryDate: this.date(body?.entryDate) || new Date(),
        entryType,
        referenceType: this.trim(body?.referenceType),
        referenceId: this.trim(body?.referenceId),
        amount: this.decimal(body?.amount),
        currency: this.trim(body?.currency) || "BRL",
        metadataJson: body?.metadataJson ?? null,
        notes: this.trim(body?.notes),
      },
    });
  }

  async listRevenueConnectors(actor: Actor) {
    const companyId = this.ensureCompanyId(actor);
    return (this.prisma as any).financeRevenueConnector.findMany({
      where: { companyId },
      orderBy: [{ updatedAt: "desc" }],
    });
  }

  async createRevenueConnector(actor: Actor, body: any) {
    const companyId = this.ensureCompanyId(actor);
    const provider = this.trim(body?.provider)?.toUpperCase();
    const label = this.trim(body?.label);
    if (!provider || !label) throw new BadRequestException("provider e label sÃ£o obrigatÃ³rios.");
    return (this.prisma as any).financeRevenueConnector.create({
      data: {
        companyId,
        provider,
        label,
        status: this.trim(body?.status)?.toUpperCase() || "DRAFT",
        externalOrgId: this.trim(body?.externalOrgId),
        syncDirection: this.trim(body?.syncDirection),
        credentialsJson: body?.credentialsJson ?? null,
        settingsJson: body?.settingsJson ?? null,
        lastSyncAt: this.date(body?.lastSyncAt),
      },
    });
  }

  async syncRevenueConnector(actor: Actor, connectorId: string, body: any) {
    const companyId = this.ensureCompanyId(actor);
    const connector = await (this.prisma as any).financeRevenueConnector.findFirst({
      where: { id: connectorId, companyId },
    });
    if (!connector) throw new NotFoundException("Conector de receita nÃ£o encontrado.");
    return (this.prisma as any).financeRevenueConnector.update({
      where: { id: connectorId },
      data: {
        status: this.trim(body?.status)?.toUpperCase() || "ACTIVE",
        lastSyncAt: this.date(body?.lastSyncAt) || new Date(),
        credentialsJson: body?.credentialsJson ?? connector.credentialsJson,
        settingsJson: body?.settingsJson ?? connector.settingsJson,
      },
    });
  }

  async runBillingCycle(actor: Actor, billingPlanId: string, body: any) {
    const companyId = this.ensureCompanyId(actor);
    const billingPlan = await (this.prisma as any).financeBillingPlan.findFirst({
      where: { id: billingPlanId, companyId },
    });
    if (!billingPlan) throw new NotFoundException("Plano de billing nÃ£o encontrado.");
    const issueDate = this.date(body?.issueDate) || new Date();
    const dueAt = this.date(body?.dueAt) || this.endInDays(15);
    const amount = this.decimal(body?.amount, this.number(billingPlan.amount) * Math.max(1, this.number(body?.quantity, 1)));
    return this.prisma.$transaction(async (tx) => {
      const invoice = await (tx as any).financeInvoice.create({
        data: {
          companyId,
          billingPlanId: billingPlan.id,
          invoiceNumber: this.trim(body?.invoiceNumber) || `INV-${Date.now()}`,
          issueDate,
          dueAt,
          amount,
          taxAmount: this.decimal(body?.taxAmount),
          netAmount: this.decimal(body?.netAmount, amount - this.decimal(body?.taxAmount)),
          currency: this.trim(body?.currency) || billingPlan.currency || "BRL",
          status: this.trim(body?.status)?.toUpperCase() || "OPEN",
          smartNotes: this.trim(body?.smartNotes) || `Billing cycle for ${this.trim(body?.customerName) || billingPlan.customerName}`,
        },
      });

      await (tx as any).financeRevenueSubledgerEntry.create({
        data: {
          companyId,
          entryType: this.trim(body?.entryType) || "INVOICE_ISSUED",
          referenceType: "INVOICE",
          referenceId: invoice.id,
          amount,
          currency: invoice.currency,
          entryDate: issueDate,
          metadataJson: { performanceObligation: this.trim(body?.performanceObligation) || "Recurring billing cycle" },
          notes: "Entrada gerada pelo ciclo de billing.",
        },
      });

      return invoice;
    });
  }

  async cancelBillingPlan(actor: Actor, billingPlanId: string, body: any) {
    const companyId = this.ensureCompanyId(actor);
    const billingPlan = await (this.prisma as any).financeBillingPlan.findFirst({
      where: { id: billingPlanId, companyId },
    });
    if (!billingPlan) throw new NotFoundException("Plano de billing nÃ£o encontrado.");
    return (this.prisma as any).financeBillingPlan.update({
      where: { id: billingPlanId },
      data: {
        status: this.trim(body?.status)?.toUpperCase() || "CANCELLED",
        nextBillingAt: this.date(body?.nextBillingAt),
        churnRiskPct: body?.churnRiskPct !== undefined ? this.decimal(body?.churnRiskPct) : billingPlan.churnRiskPct,
        recoveryMode: this.trim(body?.recoveryMode) || billingPlan.recoveryMode,
        notes: this.trim(body?.notes) || billingPlan.notes,
      },
    });
  }

  async listFxRates(actor: Actor) {
    const companyId = this.ensureCompanyId(actor);
    return (this.prisma as any).financeFxRate.findMany({
      where: { companyId },
      orderBy: [{ asOf: "desc" }],
    });
  }

  async createFxRate(actor: Actor, body: any) {
    const companyId = this.ensureCompanyId(actor);
    const baseCurrency = this.trim(body?.baseCurrency);
    const quoteCurrency = this.trim(body?.quoteCurrency);
    if (!baseCurrency || !quoteCurrency) throw new BadRequestException("baseCurrency e quoteCurrency sÃ£o obrigatÃ³rios.");
    return (this.prisma as any).financeFxRate.create({
      data: {
        companyId,
        baseCurrency,
        quoteCurrency,
        rate: this.decimal(body?.rate, 1),
        source: this.trim(body?.source)?.toUpperCase() || "MANUAL",
        asOf: this.date(body?.asOf) || new Date(),
        notes: this.trim(body?.notes),
      },
    });
  }

  async listInternationalReimbursements(actor: Actor) {
    const companyId = this.ensureCompanyId(actor);
    return (this.prisma as any).financeInternationalReimbursement.findMany({
      where: { companyId },
      orderBy: [{ createdAt: "desc" }],
    });
  }

  async createInternationalReimbursement(actor: Actor, body: any) {
    const companyId = this.ensureCompanyId(actor);
    const employeeName = this.trim(body?.employeeName);
    const payoutCountryCode = this.trim(body?.payoutCountryCode);
    if (!employeeName || !payoutCountryCode) throw new BadRequestException("employeeName e payoutCountryCode sÃ£o obrigatÃ³rios.");
    return (this.prisma as any).financeInternationalReimbursement.create({
      data: {
        companyId,
        employeeName,
        homeCountryCode: this.trim(body?.homeCountryCode),
        payoutCountryCode,
        requestedAmount: this.decimal(body?.requestedAmount),
        payoutAmount: body?.payoutAmount !== undefined ? this.decimal(body?.payoutAmount) : null,
        sourceCurrency: this.trim(body?.sourceCurrency) || "BRL",
        payoutCurrency: this.trim(body?.payoutCurrency) || "USD",
        fxRateUsed: body?.fxRateUsed !== undefined ? this.decimal(body?.fxRateUsed, 1) : null,
        status: this.trim(body?.status)?.toUpperCase() || "PENDING",
        expenseReportId: this.trim(body?.expenseReportId),
        notes: this.trim(body?.notes),
      },
    });
  }

  async listLocalPayouts(actor: Actor) {
    const companyId = this.ensureCompanyId(actor);
    return (this.prisma as any).financeLocalPayout.findMany({
      where: { companyId },
      orderBy: [{ createdAt: "desc" }],
    });
  }

  async createLocalPayout(actor: Actor, body: any) {
    const companyId = this.ensureCompanyId(actor);
    const beneficiaryName = this.trim(body?.beneficiaryName);
    const countryCode = this.trim(body?.countryCode);
    if (!beneficiaryName || !countryCode) throw new BadRequestException("beneficiaryName e countryCode sÃ£o obrigatÃ³rios.");
    return (this.prisma as any).financeLocalPayout.create({
      data: {
        companyId,
        beneficiaryName,
        countryCode,
        amount: this.decimal(body?.amount),
        currency: this.trim(body?.currency) || "BRL",
        payoutMethod: this.trim(body?.payoutMethod),
        payoutReference: this.trim(body?.payoutReference),
        status: this.trim(body?.status)?.toUpperCase() || "PENDING",
        scheduledAt: this.date(body?.scheduledAt),
        paidAt: this.date(body?.paidAt),
        notes: this.trim(body?.notes),
      },
    });
  }

  async listIntercompanyTransfers(actor: Actor) {
    const companyId = this.ensureCompanyId(actor);
    return (this.prisma as any).financeIntercompanyTransfer.findMany({
      where: { companyId },
      orderBy: [{ createdAt: "desc" }],
    });
  }

  async createIntercompanyTransfer(actor: Actor, body: any) {
    const companyId = this.ensureCompanyId(actor);
    const reference = this.trim(body?.reference);
    if (!reference) throw new BadRequestException("reference Ã© obrigatÃ³rio.");
    return (this.prisma as any).financeIntercompanyTransfer.create({
      data: {
        companyId,
        reference,
        sourceEntityId: this.trim(body?.sourceEntityId),
        destinationEntityId: this.trim(body?.destinationEntityId),
        amount: this.decimal(body?.amount),
        currency: this.trim(body?.currency) || "BRL",
        initiatedAt: this.date(body?.initiatedAt),
        settledAt: this.date(body?.settledAt),
        status: this.trim(body?.status)?.toUpperCase() || "DRAFT",
        notes: this.trim(body?.notes),
      },
    });
  }

  async listConsolidationSnapshots(actor: Actor) {
    const companyId = this.ensureCompanyId(actor);
    return (this.prisma as any).financeConsolidationSnapshot.findMany({
      where: { companyId },
      orderBy: [{ asOf: "desc" }],
    });
  }

  async createConsolidationSnapshot(actor: Actor, body: any) {
    const companyId = this.ensureCompanyId(actor);
    const label = this.trim(body?.label);
    if (!label) throw new BadRequestException("label Ã© obrigatÃ³rio.");
    return (this.prisma as any).financeConsolidationSnapshot.create({
      data: {
        companyId,
        label,
        asOf: this.date(body?.asOf) || new Date(),
        status: this.trim(body?.status)?.toUpperCase() || "DRAFT",
        entityCount: this.number(body?.entityCount, 0),
        totalRevenue: this.decimal(body?.totalRevenue),
        totalSpend: this.decimal(body?.totalSpend),
        netCash: this.decimal(body?.netCash),
        notes: this.trim(body?.notes),
      },
    });
  }

  async listTaxJurisdictions(actor: Actor) {
    const companyId = this.ensureCompanyId(actor);
    return (this.prisma as any).financeTaxJurisdiction.findMany({
      where: { companyId },
      orderBy: [{ countryCode: "asc" }, { stateCode: "asc" }],
    });
  }

  async createTaxJurisdiction(actor: Actor, body: any) {
    const companyId = this.ensureCompanyId(actor);
    const countryCode = this.trim(body?.countryCode);
    if (!countryCode) throw new BadRequestException("countryCode Ã© obrigatÃ³rio.");
    return (this.prisma as any).financeTaxJurisdiction.create({
      data: {
        companyId,
        countryCode,
        stateCode: this.trim(body?.stateCode),
        city: this.trim(body?.city),
        regime: this.trim(body?.regime),
        defaultRatePct: body?.defaultRatePct !== undefined ? this.decimal(body?.defaultRatePct) : null,
        notes: this.trim(body?.notes),
      },
    });
  }

  async listTaxTrails(actor: Actor) {
    const companyId = this.ensureCompanyId(actor);
    return (this.prisma as any).financeTaxTrail.findMany({
      where: { companyId },
      orderBy: [{ updatedAt: "desc" }],
    });
  }

  async createTaxTrail(actor: Actor, body: any) {
    const companyId = this.ensureCompanyId(actor);
    const referenceType = this.trim(body?.referenceType);
    const jurisdictionCode = this.trim(body?.jurisdictionCode);
    if (!referenceType || !jurisdictionCode) throw new BadRequestException("referenceType e jurisdictionCode sÃ£o obrigatÃ³rios.");
    return (this.prisma as any).financeTaxTrail.create({
      data: {
        companyId,
        referenceType,
        referenceId: this.trim(body?.referenceId),
        jurisdictionCode,
        taxAmount: this.decimal(body?.taxAmount),
        currency: this.trim(body?.currency) || "BRL",
        detailsJson: body?.detailsJson ?? null,
        notes: this.trim(body?.notes),
      },
    });
  }

  async activateVendorPortal(actor: Actor, vendorId: string, body: any) {
    const companyId = this.ensureCompanyId(actor);
    const vendor = await (this.prisma as any).financeVendor.findFirst({
      where: { id: vendorId, companyId },
    });
    if (!vendor) throw new NotFoundException("Fornecedor nÃ£o encontrado.");
    return (this.prisma as any).financeVendor.update({
      where: { id: vendorId },
      data: {
        portalStatus: this.trim(body?.portalStatus)?.toUpperCase() || "ACTIVE",
        portalAccessEmail: this.trim(body?.portalAccessEmail) || vendor.portalAccessEmail,
        riskScore: body?.riskScore !== undefined ? this.number(body?.riskScore) : vendor.riskScore,
        notes: this.trim(body?.notes) || vendor.notes,
      },
    });
  }

  async listVendorKycReviews(actor: Actor) {
    const companyId = this.ensureCompanyId(actor);
    return (this.prisma as any).financeVendorKycReview.findMany({
      where: { companyId },
      orderBy: [{ createdAt: "desc" }],
    });
  }

  async createVendorKycReview(actor: Actor, body: any) {
    const companyId = this.ensureCompanyId(actor);
    const vendorId = this.trim(body?.vendorId);
    if (!vendorId) throw new BadRequestException("vendorId Ã© obrigatÃ³rio.");
    return (this.prisma as any).financeVendorKycReview.create({
      data: {
        companyId,
        vendorId,
        status: this.trim(body?.status)?.toUpperCase() || "PENDING",
        reviewerName: this.trim(body?.reviewerName),
        score: this.number(body?.score),
        checklistJson: body?.checklistJson ?? null,
        reviewedAt: this.date(body?.reviewedAt),
        notes: this.trim(body?.notes),
      },
    });
  }

  async listVendorContracts(actor: Actor) {
    const companyId = this.ensureCompanyId(actor);
    return (this.prisma as any).financeVendorContract.findMany({
      where: { companyId },
      orderBy: [{ renewalAt: "asc" }],
    });
  }

  async createVendorContract(actor: Actor, body: any) {
    const companyId = this.ensureCompanyId(actor);
    const vendorId = this.trim(body?.vendorId);
    const title = this.trim(body?.title);
    if (!vendorId || !title) throw new BadRequestException("vendorId e title sÃ£o obrigatÃ³rios.");
    return (this.prisma as any).financeVendorContract.create({
      data: {
        companyId,
        vendorId,
        title,
        status: this.trim(body?.status)?.toUpperCase() || "DRAFT",
        contractNumber: this.trim(body?.contractNumber),
        effectiveAt: this.date(body?.effectiveAt),
        endAt: this.date(body?.endAt),
        renewalAt: this.date(body?.renewalAt),
        totalValue: body?.totalValue !== undefined ? this.decimal(body?.totalValue) : null,
        currency: this.trim(body?.currency) || "BRL",
        fileUrl: this.trim(body?.fileUrl),
        notes: this.trim(body?.notes),
      },
    });
  }

  async listVendorBenchmarks(actor: Actor) {
    const companyId = this.ensureCompanyId(actor);
    return (this.prisma as any).financeVendorNegotiationBenchmark.findMany({
      where: { companyId },
      orderBy: [{ updatedAt: "desc" }],
    });
  }

  async createVendorBenchmark(actor: Actor, body: any) {
    const companyId = this.ensureCompanyId(actor);
    const vendorId = this.trim(body?.vendorId);
    if (!vendorId) throw new BadRequestException("vendorId Ã© obrigatÃ³rio.");
    return (this.prisma as any).financeVendorNegotiationBenchmark.create({
      data: {
        companyId,
        vendorId,
        benchmarkType: this.trim(body?.benchmarkType),
        currentSpend: this.decimal(body?.currentSpend),
        benchmarkSpend: this.decimal(body?.benchmarkSpend),
        savingsPotential: body?.savingsPotential !== undefined ? this.decimal(body?.savingsPotential) : null,
        status: this.trim(body?.status)?.toUpperCase() || "OPEN",
        notes: this.trim(body?.notes),
      },
    });
  }

  async listWarehouseConnections(actor: Actor) {
    const companyId = this.ensureCompanyId(actor);
    return (this.prisma as any).financeDataWarehouseConnection.findMany({
      where: { companyId },
      orderBy: [{ updatedAt: "desc" }],
    });
  }

  async createWarehouseConnection(actor: Actor, body: any) {
    const companyId = this.ensureCompanyId(actor);
    const provider = this.trim(body?.provider);
    const label = this.trim(body?.label);
    if (!provider || !label) throw new BadRequestException("provider e label sÃ£o obrigatÃ³rios.");
    return (this.prisma as any).financeDataWarehouseConnection.create({
      data: {
        companyId,
        provider,
        label,
        status: this.trim(body?.status)?.toUpperCase() || "DRAFT",
        dataset: this.trim(body?.dataset),
        schemaName: this.trim(body?.schemaName),
        credentialsJson: body?.credentialsJson ?? null,
        settingsJson: body?.settingsJson ?? null,
        lastSyncAt: this.date(body?.lastSyncAt),
      },
    });
  }

  async listMetricSnapshots(actor: Actor) {
    const companyId = this.ensureCompanyId(actor);
    return (this.prisma as any).financeMetricSnapshot.findMany({
      where: { companyId },
      orderBy: [{ metricDate: "desc" }],
    });
  }

  async createMetricSnapshot(actor: Actor, body: any) {
    const companyId = this.ensureCompanyId(actor);
    const metricType = this.trim(body?.metricType)?.toUpperCase();
    const label = this.trim(body?.label);
    if (!metricType || !label) throw new BadRequestException("metricType e label sÃ£o obrigatÃ³rios.");
    return (this.prisma as any).financeMetricSnapshot.create({
      data: {
        companyId,
        metricType,
        label,
        metricDate: this.date(body?.metricDate) || this.startOfToday(),
        value: this.decimal(body?.value),
        compareValue: body?.compareValue !== undefined ? this.decimal(body?.compareValue) : null,
        unitLabel: this.trim(body?.unitLabel),
        breakdownJson: body?.breakdownJson ?? null,
      },
    });
  }

  async listRevenueCohorts(actor: Actor) {
    const companyId = this.ensureCompanyId(actor);
    return (this.prisma as any).financeRevenueCohort.findMany({
      where: { companyId },
      orderBy: [{ startDate: "desc" }],
    });
  }

  async createRevenueCohort(actor: Actor, body: any) {
    const companyId = this.ensureCompanyId(actor);
    const cohortType = this.trim(body?.cohortType)?.toUpperCase();
    const cohortLabel = this.trim(body?.cohortLabel);
    const startDate = this.date(body?.startDate);
    if (!cohortType || !cohortLabel || !startDate) throw new BadRequestException("cohortType, cohortLabel e startDate sÃ£o obrigatÃ³rios.");
    return (this.prisma as any).financeRevenueCohort.create({
      data: {
        companyId,
        cohortType,
        cohortLabel,
        startDate,
        endDate: this.date(body?.endDate),
        customersCount: this.number(body?.customersCount, 0),
        retainedRevenue: this.decimal(body?.retainedRevenue),
        churnedRevenue: this.decimal(body?.churnedRevenue),
        metadataJson: body?.metadataJson ?? null,
      },
    });
  }

  async listUnitBenchmarks(actor: Actor) {
    const companyId = this.ensureCompanyId(actor);
    return (this.prisma as any).financeUnitBenchmark.findMany({
      where: { companyId },
      orderBy: [{ updatedAt: "desc" }],
    });
  }

  async createUnitBenchmark(actor: Actor, body: any) {
    const companyId = this.ensureCompanyId(actor);
    const unitLabel = this.trim(body?.unitLabel);
    if (!unitLabel) throw new BadRequestException("unitLabel Ã© obrigatÃ³rio.");
    return (this.prisma as any).financeUnitBenchmark.create({
      data: {
        companyId,
        unitLabel,
        benchmarkDate: this.date(body?.benchmarkDate) || this.startOfToday(),
        revenueValue: body?.revenueValue !== undefined ? this.decimal(body?.revenueValue) : null,
        spendValue: body?.spendValue !== undefined ? this.decimal(body?.spendValue) : null,
        marginPct: body?.marginPct !== undefined ? this.decimal(body?.marginPct) : null,
        cashValue: body?.cashValue !== undefined ? this.decimal(body?.cashValue) : null,
        benchmarkJson: body?.benchmarkJson ?? null,
      },
    });
  }

  async listSsoConfigs(actor: Actor) {
    const companyId = this.ensureCompanyId(actor);
    return (this.prisma as any).enterpriseSsoConfig.findMany({
      where: { companyId },
      orderBy: [{ updatedAt: "desc" }],
    });
  }

  async createSsoConfig(actor: Actor, body: any) {
    const companyId = this.ensureCompanyId(actor);
    const provider = this.trim(body?.provider)?.toUpperCase();
    const label = this.trim(body?.label);
    if (!provider || !label) throw new BadRequestException("provider e label sÃ£o obrigatÃ³rios.");
    return (this.prisma as any).enterpriseSsoConfig.create({
      data: {
        companyId,
        provider,
        label,
        status: this.trim(body?.status)?.toUpperCase() || "DRAFT",
        samlEntryPoint: this.trim(body?.samlEntryPoint),
        samlIssuer: this.trim(body?.samlIssuer),
        samlCert: this.trim(body?.samlCert),
        scimBaseUrl: this.trim(body?.scimBaseUrl),
        metadataJson: body?.metadataJson ?? null,
      },
    });
  }

  async listScimProvisions(actor: Actor) {
    const companyId = this.ensureCompanyId(actor);
    return (this.prisma as any).enterpriseScimProvision.findMany({
      where: { companyId },
      orderBy: [{ updatedAt: "desc" }],
    });
  }

  async createScimProvision(actor: Actor, body: any) {
    const companyId = this.ensureCompanyId(actor);
    const principalType = this.trim(body?.principalType);
    if (!principalType) throw new BadRequestException("principalType Ã© obrigatÃ³rio.");
    return (this.prisma as any).enterpriseScimProvision.create({
      data: {
        companyId,
        principalType,
        status: this.trim(body?.status)?.toUpperCase() || "DRAFT",
        principalRef: this.trim(body?.principalRef),
        externalId: this.trim(body?.externalId),
        lastSyncAt: this.date(body?.lastSyncAt),
        payloadJson: body?.payloadJson ?? null,
        errorMessage: this.trim(body?.errorMessage),
      },
    });
  }

  async listRetentionPolicies(actor: Actor) {
    const companyId = this.ensureCompanyId(actor);
    return (this.prisma as any).enterpriseDataRetentionPolicy.findMany({
      where: { companyId },
      orderBy: [{ updatedAt: "desc" }],
    });
  }

  async createRetentionPolicy(actor: Actor, body: any) {
    const companyId = this.ensureCompanyId(actor);
    const label = this.trim(body?.label);
    const entityScope = this.trim(body?.entityScope);
    if (!label || !entityScope) throw new BadRequestException("label e entityScope sÃ£o obrigatÃ³rios.");
    return (this.prisma as any).enterpriseDataRetentionPolicy.create({
      data: {
        companyId,
        label,
        status: this.trim(body?.status)?.toUpperCase() || "DRAFT",
        entityScope,
        retentionDays: this.number(body?.retentionDays, 365),
        archiveEnabled: body?.archiveEnabled !== false,
        purgeEnabled: body?.purgeEnabled === true,
        notes: this.trim(body?.notes),
      },
    });
  }

  async listAuditExports(actor: Actor) {
    const companyId = this.ensureCompanyId(actor);
    return (this.prisma as any).enterpriseAuditExport.findMany({
      where: { companyId },
      orderBy: [{ createdAt: "desc" }],
    });
  }

  async createAuditExport(actor: Actor, body: any) {
    const companyId = this.ensureCompanyId(actor);
    const format = this.trim(body?.format);
    if (!format) throw new BadRequestException("format Ã© obrigatÃ³rio.");
    return (this.prisma as any).enterpriseAuditExport.create({
      data: {
        companyId,
        format,
        status: this.trim(body?.status)?.toUpperCase() || "PENDING",
        dateFrom: this.date(body?.dateFrom),
        dateTo: this.date(body?.dateTo),
        fileUrl: this.trim(body?.fileUrl),
        notes: this.trim(body?.notes),
        scopeJson: body?.scopeJson ?? null,
      },
    });
  }

  async listSegregationPolicies(actor: Actor) {
    const companyId = this.ensureCompanyId(actor);
    return (this.prisma as any).enterpriseSegregationPolicy.findMany({
      where: { companyId },
      orderBy: [{ updatedAt: "desc" }],
    });
  }

  async createSegregationPolicy(actor: Actor, body: any) {
    const companyId = this.ensureCompanyId(actor);
    const label = this.trim(body?.label);
    if (!label) throw new BadRequestException("label Ã© obrigatÃ³rio.");
    return (this.prisma as any).enterpriseSegregationPolicy.create({
      data: {
        companyId,
        label,
        severity: this.trim(body?.severity)?.toUpperCase() || "MEDIUM",
        incompatibleRoles: body?.incompatibleRoles ?? [],
        controlsJson: body?.controlsJson ?? null,
        notes: this.trim(body?.notes),
      },
    });
  }

  async listApprovalEvidences(actor: Actor) {
    const companyId = this.ensureCompanyId(actor);
    return (this.prisma as any).financeApprovalEvidence.findMany({
      where: { companyId },
      orderBy: [{ createdAt: "desc" }],
    });
  }

  async createApprovalEvidence(actor: Actor, body: any) {
    const companyId = this.ensureCompanyId(actor);
    const approvalRequestId = this.trim(body?.approvalRequestId);
    const title = this.trim(body?.title);
    if (!approvalRequestId || !title) throw new BadRequestException("approvalRequestId e title sÃ£o obrigatÃ³rios.");
    return (this.prisma as any).financeApprovalEvidence.create({
      data: {
        companyId,
        approvalRequestId,
        title,
        status: this.trim(body?.status)?.toUpperCase() || "PENDING",
        evidenceType: this.trim(body?.evidenceType),
        fileUrl: this.trim(body?.fileUrl),
        verifiedAt: this.date(body?.verifiedAt),
        notes: this.trim(body?.notes),
      },
    });
  }

  async verifyApprovalEvidence(actor: Actor, evidenceId: string, body: any) {
    const companyId = this.ensureCompanyId(actor);
    const evidence = await (this.prisma as any).financeApprovalEvidence.findFirst({
      where: { id: evidenceId, companyId },
    });
    if (!evidence) throw new NotFoundException("EvidÃªncia de aprovaÃ§Ã£o nÃ£o encontrada.");
    return (this.prisma as any).financeApprovalEvidence.update({
      where: { id: evidenceId },
      data: {
        status: this.trim(body?.status)?.toUpperCase() || "VERIFIED",
        verifiedAt: this.date(body?.verifiedAt) || new Date(),
        notes: this.trim(body?.notes) || evidence.notes,
      },
    });
  }

  async listBillingPlanVersions(actor: Actor) {
    const companyId = this.ensureCompanyId(actor);
    return (this.prisma as any).financeBillingPlanVersion.findMany({
      where: { companyId },
      orderBy: [{ effectiveAt: "desc" }, { updatedAt: "desc" }],
    });
  }

  async createBillingPlanVersion(actor: Actor, body: any) {
    const companyId = this.ensureCompanyId(actor);
    const billingPlanId = this.trim(body?.billingPlanId);
    const versionLabel = this.trim(body?.versionLabel);
    const pricingModel = this.trim(body?.pricingModel) || "HYBRID";
    if (!billingPlanId || !versionLabel) throw new BadRequestException("billingPlanId e versionLabel são obrigatórios.");
    return (this.prisma as any).financeBillingPlanVersion.create({
      data: {
        companyId,
        billingPlanId,
        billingPlanRef: this.trim(body?.billingPlanRef),
        versionLabel,
        pricingModel,
        baseAmount: this.decimal(body?.baseAmount),
        includedUnits: body?.includedUnits !== undefined ? this.decimal(body?.includedUnits) : null,
        overageRate: body?.overageRate !== undefined ? this.decimal(body?.overageRate) : null,
        effectiveAt: this.date(body?.effectiveAt) || new Date(),
        retiredAt: this.date(body?.retiredAt),
        configurationJson: body?.configurationJson ?? null,
        notes: this.trim(body?.notes),
      },
    });
  }

  async listCustomerCreditBalances(actor: Actor) {
    const companyId = this.ensureCompanyId(actor);
    return (this.prisma as any).financeCustomerCreditBalance.findMany({
      where: { companyId },
      orderBy: [{ updatedAt: "desc" }],
    });
  }

  async createCustomerCreditBalance(actor: Actor, body: any) {
    const companyId = this.ensureCompanyId(actor);
    const customerName = this.trim(body?.customerName);
    if (!customerName) throw new BadRequestException("customerName é obrigatório.");
    return (this.prisma as any).financeCustomerCreditBalance.create({
      data: {
        companyId,
        customerName,
        currency: this.trim(body?.currency) || "BRL",
        availableBalance: this.decimal(body?.availableBalance),
        reservedBalance: body?.reservedBalance !== undefined ? this.decimal(body?.reservedBalance) : this.decimal(0),
        consumedBalance: body?.consumedBalance !== undefined ? this.decimal(body?.consumedBalance) : this.decimal(0),
        lastActivityAt: this.date(body?.lastActivityAt),
        notes: this.trim(body?.notes),
      },
    });
  }

  async listRateCards(actor: Actor) {
    const companyId = this.ensureCompanyId(actor);
    return (this.prisma as any).financeRateCard.findMany({
      where: { companyId },
      orderBy: [{ updatedAt: "desc" }],
    });
  }

  async createRateCard(actor: Actor, body: any) {
    const companyId = this.ensureCompanyId(actor);
    const label = this.trim(body?.label);
    const metricKey = this.trim(body?.metricKey);
    if (!label || !metricKey) throw new BadRequestException("label e metricKey são obrigatórios.");
    return (this.prisma as any).financeRateCard.create({
      data: {
        companyId,
        billingPlanId: this.trim(body?.billingPlanId),
        label,
        metricKey,
        pricingModel: this.trim(body?.pricingModel) || "USAGE",
        billingUnit: this.trim(body?.billingUnit),
        unitPrice: this.decimal(body?.unitPrice),
        minimumCommit: body?.minimumCommit !== undefined ? this.decimal(body?.minimumCommit) : null,
        tiersJson: body?.tiersJson ?? null,
        isActive: body?.isActive !== false,
        notes: this.trim(body?.notes),
      },
    });
  }

  async listInvoiceRetryAttempts(actor: Actor) {
    const companyId = this.ensureCompanyId(actor);
    return (this.prisma as any).financeInvoiceRetryAttempt.findMany({
      where: { companyId },
      orderBy: [{ createdAt: "desc" }],
    });
  }

  async createInvoiceRetryAttempt(actor: Actor, body: any) {
    const companyId = this.ensureCompanyId(actor);
    const invoiceId = this.trim(body?.invoiceId);
    if (!invoiceId) throw new BadRequestException("invoiceId é obrigatório.");
    return (this.prisma as any).financeInvoiceRetryAttempt.create({
      data: {
        companyId,
        invoiceId,
        attemptNumber: this.number(body?.attemptNumber, 1),
        status: this.trim(body?.status) || "SCHEDULED",
        channel: this.trim(body?.channel),
        scheduledAt: this.date(body?.scheduledAt),
        attemptedAt: this.date(body?.attemptedAt),
        responseCode: this.trim(body?.responseCode),
        notes: this.trim(body?.notes),
      },
    });
  }

  async listWorkforcePlans(actor: Actor) {
    const companyId = this.ensureCompanyId(actor);
    return (this.prisma as any).financeWorkforcePlan.findMany({
      where: { companyId },
      orderBy: [{ updatedAt: "desc" }],
    });
  }

  async createWorkforcePlan(actor: Actor, body: any) {
    const companyId = this.ensureCompanyId(actor);
    const label = this.trim(body?.label);
    if (!label) throw new BadRequestException("label é obrigatório.");
    return (this.prisma as any).financeWorkforcePlan.create({
      data: {
        companyId,
        label,
        branchId: this.trim(body?.branchId),
        departmentId: this.trim(body?.departmentId),
        scenarioId: this.trim(body?.scenarioId),
        headcountTarget: this.number(body?.headcountTarget, 0),
        hiringPlan: this.number(body?.hiringPlan, 0),
        payrollRunRate: this.decimal(body?.payrollRunRate),
        notes: this.trim(body?.notes),
      },
    });
  }

  async listScenarioMerges(actor: Actor) {
    const companyId = this.ensureCompanyId(actor);
    return (this.prisma as any).financeScenarioMerge.findMany({
      where: { companyId },
      orderBy: [{ createdAt: "desc" }],
    });
  }

  async createScenarioMerge(actor: Actor, body: any) {
    const companyId = this.ensureCompanyId(actor);
    const title = this.trim(body?.title);
    const sourceScenarioId = this.trim(body?.sourceScenarioId);
    const targetScenarioId = this.trim(body?.targetScenarioId);
    if (!title || !sourceScenarioId || !targetScenarioId) throw new BadRequestException("title, sourceScenarioId e targetScenarioId são obrigatórios.");
    return (this.prisma as any).financeScenarioMerge.create({
      data: {
        companyId,
        title,
        sourceScenarioId,
        targetScenarioId,
        mergeStatus: this.trim(body?.mergeStatus) || "DRAFT",
        assumptionsJson: body?.assumptionsJson ?? null,
        notes: this.trim(body?.notes),
      },
    });
  }

  async listVarianceExplanations(actor: Actor) {
    const companyId = this.ensureCompanyId(actor);
    return (this.prisma as any).financeVarianceExplanation.findMany({
      where: { companyId },
      orderBy: [{ updatedAt: "desc" }],
    });
  }

  async createVarianceExplanation(actor: Actor, body: any) {
    const companyId = this.ensureCompanyId(actor);
    const title = this.trim(body?.title);
    const varianceType = this.trim(body?.varianceType);
    const metricLabel = this.trim(body?.metricLabel);
    const explanation = this.trim(body?.explanation);
    if (!title || !varianceType || !metricLabel || !explanation) throw new BadRequestException("title, varianceType, metricLabel e explanation são obrigatórios.");
    return (this.prisma as any).financeVarianceExplanation.create({
      data: {
        companyId,
        title,
        varianceType,
        metricLabel,
        varianceAmount: this.decimal(body?.varianceAmount),
        explanation,
        recommendedAction: this.trim(body?.recommendedAction),
        ownerName: this.trim(body?.ownerName),
        status: this.trim(body?.status) || "OPEN",
        snapshotId: this.trim(body?.snapshotId),
        scenarioId: this.trim(body?.scenarioId),
      },
    });
  }

  async listPlanningCollaborations(actor: Actor) {
    const companyId = this.ensureCompanyId(actor);
    return (this.prisma as any).financePlanningCollaboration.findMany({
      where: { companyId },
      orderBy: [{ updatedAt: "desc" }],
    });
  }

  async createPlanningCollaboration(actor: Actor, body: any) {
    const companyId = this.ensureCompanyId(actor);
    const title = this.trim(body?.title);
    const content = this.trim(body?.body);
    if (!title || !content) throw new BadRequestException("title e body são obrigatórios.");
    return (this.prisma as any).financePlanningCollaboration.create({
      data: {
        companyId,
        title,
        body: content,
        authorName: this.trim(body?.authorName) || this.trim(actor.name) || this.trim(actor.id),
        status: this.trim(body?.status) || "OPEN",
        scenarioId: this.trim(body?.scenarioId),
        branchId: this.trim(body?.branchId),
        departmentId: this.trim(body?.departmentId),
      },
    });
  }

  async listProcurementSignals(actor: Actor) {
    const companyId = this.ensureCompanyId(actor);
    return (this.prisma as any).financeProcurementSignal.findMany({
      where: { companyId },
      orderBy: [{ updatedAt: "desc" }],
    });
  }

  async createProcurementSignal(actor: Actor, body: any) {
    const companyId = this.ensureCompanyId(actor);
    const signalType = this.trim(body?.signalType);
    const severity = this.trim(body?.severity);
    const title = this.trim(body?.title);
    if (!signalType || !severity || !title) throw new BadRequestException("signalType, severity e title são obrigatórios.");
    return (this.prisma as any).financeProcurementSignal.create({
      data: {
        companyId,
        signalType,
        severity,
        title,
        detail: this.trim(body?.detail),
        recommendedAction: this.trim(body?.recommendedAction),
        status: this.trim(body?.status) || "OPEN",
        payableId: this.trim(body?.payableId),
        purchaseOrderId: this.trim(body?.purchaseOrderId),
        vendorDocumentId: this.trim(body?.vendorDocumentId),
      },
    });
  }

  async listCopilotRuns(actor: Actor) {
    const companyId = this.ensureCompanyId(actor);
    return (this.prisma as any).financeCopilotRun.findMany({
      where: { companyId },
      orderBy: [{ startedAt: "desc" }],
    });
  }

  async listCopilotCases(actor: Actor) {
    const companyId = this.ensureCompanyId(actor);
    return (this.prisma as any).financeCopilotCase.findMany({
      where: { companyId },
      orderBy: [{ updatedAt: "desc" }],
    });
  }

  async createCopilotCase(actor: Actor, body: any) {
    const companyId = this.ensureCompanyId(actor);
    const caseType = this.trim(body?.caseType);
    const priority = this.trim(body?.priority);
    const title = this.trim(body?.title);
    if (!caseType || !priority || !title) throw new BadRequestException("caseType, priority e title são obrigatórios.");
    return (this.prisma as any).financeCopilotCase.create({
      data: {
        companyId,
        caseType,
        priority,
        title,
        status: this.trim(body?.status) || "OPEN",
        ownerName: this.trim(body?.ownerName),
        resolutionState: this.trim(body?.resolutionState),
        payloadJson: body?.payloadJson ?? null,
        notes: this.trim(body?.notes),
      },
    });
  }

  async listDunningPolicies(actor: Actor) {
    const companyId = this.ensureCompanyId(actor);
    return (this.prisma as any).financeDunningPolicy.findMany({
      where: { companyId },
      orderBy: [{ updatedAt: "desc" }],
    });
  }

  async createDunningPolicy(actor: Actor, body: any) {
    const companyId = this.ensureCompanyId(actor);
    const label = this.trim(body?.label);
    if (!label) throw new BadRequestException("label é obrigatório.");
    return (this.prisma as any).financeDunningPolicy.create({
      data: {
        companyId,
        label,
        status: this.trim(body?.status) || "DRAFT",
        segment: this.trim(body?.segment),
        maxAttempts: this.number(body?.maxAttempts, 3),
        strategyJson: body?.strategyJson ?? null,
        notes: this.trim(body?.notes),
      },
    });
  }

  async listInvoiceLifecycleEvents(actor: Actor) {
    const companyId = this.ensureCompanyId(actor);
    return (this.prisma as any).financeInvoiceLifecycleEvent.findMany({
      where: { companyId },
      orderBy: [{ eventAt: "desc" }],
    });
  }

  async createInvoiceLifecycleEvent(actor: Actor, body: any) {
    const companyId = this.ensureCompanyId(actor);
    const invoiceId = this.trim(body?.invoiceId);
    const eventType = this.trim(body?.eventType);
    if (!invoiceId || !eventType) throw new BadRequestException("invoiceId e eventType são obrigatórios.");
    return (this.prisma as any).financeInvoiceLifecycleEvent.create({
      data: {
        companyId,
        invoiceId,
        eventType,
        eventStatus: this.trim(body?.eventStatus) || "RECORDED",
        eventAt: this.date(body?.eventAt) || new Date(),
        payloadJson: body?.payloadJson ?? null,
        notes: this.trim(body?.notes),
      },
    });
  }

  async listCustomerBillingPortals(actor: Actor) {
    const companyId = this.ensureCompanyId(actor);
    return (this.prisma as any).financeCustomerBillingPortal.findMany({
      where: { companyId },
      orderBy: [{ updatedAt: "desc" }],
    });
  }

  async createCustomerBillingPortal(actor: Actor, body: any) {
    const companyId = this.ensureCompanyId(actor);
    const customerName = this.trim(body?.customerName);
    if (!customerName) throw new BadRequestException("customerName é obrigatório.");
    return (this.prisma as any).financeCustomerBillingPortal.create({
      data: {
        companyId,
        customerName,
        status: this.trim(body?.status) || "ACTIVE",
        portalUrl: this.trim(body?.portalUrl),
        lastAccessAt: this.date(body?.lastAccessAt),
        billingPlanId: this.trim(body?.billingPlanId),
        creditBalanceId: this.trim(body?.creditBalanceId),
        notes: this.trim(body?.notes),
      },
    });
  }

  async listProcurementInvestigations(actor: Actor) {
    const companyId = this.ensureCompanyId(actor);
    return (this.prisma as any).financeProcurementInvestigation.findMany({
      where: { companyId },
      orderBy: [{ updatedAt: "desc" }],
    });
  }

  async createProcurementInvestigation(actor: Actor, body: any) {
    const companyId = this.ensureCompanyId(actor);
    const title = this.trim(body?.title);
    const severity = this.trim(body?.severity);
    if (!title || !severity) throw new BadRequestException("title e severity são obrigatórios.");
    return (this.prisma as any).financeProcurementInvestigation.create({
      data: {
        companyId,
        signalId: this.trim(body?.signalId),
        title,
        severity,
        status: this.trim(body?.status) || "OPEN",
        finding: this.trim(body?.finding),
        recommendedAction: this.trim(body?.recommendedAction),
        ownerName: this.trim(body?.ownerName),
        notes: this.trim(body?.notes),
      },
    });
  }

  async listOcrLineItems(actor: Actor) {
    const companyId = this.ensureCompanyId(actor);
    return (this.prisma as any).financeOcrLineItem.findMany({
      where: { companyId },
      orderBy: [{ updatedAt: "desc" }],
    });
  }

  async createOcrLineItem(actor: Actor, body: any) {
    const companyId = this.ensureCompanyId(actor);
    return (this.prisma as any).financeOcrLineItem.create({
      data: {
        companyId,
        vendorDocumentId: this.trim(body?.vendorDocumentId),
        lineNumber: this.number(body?.lineNumber, 1),
        description: this.trim(body?.description),
        quantity: body?.quantity !== undefined ? this.decimal(body?.quantity) : null,
        unitPrice: body?.unitPrice !== undefined ? this.decimal(body?.unitPrice) : null,
        totalAmount: body?.totalAmount !== undefined ? this.decimal(body?.totalAmount) : null,
        confidencePct: body?.confidencePct !== undefined ? this.decimal(body?.confidencePct) : null,
        mappedCategory: this.trim(body?.mappedCategory),
        notes: this.trim(body?.notes),
      },
    });
  }

  async listVendorScorecards(actor: Actor) {
    const companyId = this.ensureCompanyId(actor);
    return (this.prisma as any).financeVendorScorecard.findMany({
      where: { companyId },
      orderBy: [{ scoreDate: "desc" }],
    });
  }

  async createVendorScorecard(actor: Actor, body: any) {
    const companyId = this.ensureCompanyId(actor);
    return (this.prisma as any).financeVendorScorecard.create({
      data: {
        companyId,
        vendorId: this.trim(body?.vendorId),
        scoreDate: this.date(body?.scoreDate) || new Date(),
        deliveryScore: body?.deliveryScore !== undefined ? this.decimal(body?.deliveryScore) : null,
        priceScore: body?.priceScore !== undefined ? this.decimal(body?.priceScore) : null,
        complianceScore: body?.complianceScore !== undefined ? this.decimal(body?.complianceScore) : null,
        riskScore: body?.riskScore !== undefined ? this.decimal(body?.riskScore) : null,
        totalScore: body?.totalScore !== undefined ? this.decimal(body?.totalScore) : null,
        notes: this.trim(body?.notes),
      },
    });
  }

  async listPlanningCycles(actor: Actor) {
    const companyId = this.ensureCompanyId(actor);
    return (this.prisma as any).financePlanningCycle.findMany({
      where: { companyId },
      orderBy: [{ updatedAt: "desc" }],
    });
  }

  async createPlanningCycle(actor: Actor, body: any) {
    const companyId = this.ensureCompanyId(actor);
    const label = this.trim(body?.label);
    if (!label) throw new BadRequestException("label é obrigatório.");
    return (this.prisma as any).financePlanningCycle.create({
      data: {
        companyId,
        label,
        status: this.trim(body?.status) || "DRAFT",
        horizonMonths: this.number(body?.horizonMonths, 12),
        ownerName: this.trim(body?.ownerName) || this.trim(actor.name) || this.trim(actor.id),
        lockedAt: this.date(body?.lockedAt),
        scenarioId: this.trim(body?.scenarioId),
        notes: this.trim(body?.notes),
      },
    });
  }

  async listHeadcountPlanLines(actor: Actor) {
    const companyId = this.ensureCompanyId(actor);
    return (this.prisma as any).financeHeadcountPlanLine.findMany({
      where: { companyId },
      orderBy: [{ updatedAt: "desc" }],
    });
  }

  async createHeadcountPlanLine(actor: Actor, body: any) {
    const companyId = this.ensureCompanyId(actor);
    const roleName = this.trim(body?.roleName);
    if (!roleName) throw new BadRequestException("roleName é obrigatório.");
    return (this.prisma as any).financeHeadcountPlanLine.create({
      data: {
        companyId,
        workforcePlanId: this.trim(body?.workforcePlanId),
        roleName,
        departmentName: this.trim(body?.departmentName),
        location: this.trim(body?.location),
        plannedHeadcount: this.number(body?.plannedHeadcount, 0),
        plannedCost: body?.plannedCost !== undefined ? this.decimal(body?.plannedCost) : null,
        notes: this.trim(body?.notes),
      },
    });
  }

  async listScenarioComparisons(actor: Actor) {
    const companyId = this.ensureCompanyId(actor);
    return (this.prisma as any).financeScenarioComparison.findMany({
      where: { companyId },
      orderBy: [{ updatedAt: "desc" }],
    });
  }

  async createScenarioComparison(actor: Actor, body: any) {
    const companyId = this.ensureCompanyId(actor);
    const baseScenarioId = this.trim(body?.baseScenarioId);
    const compareScenarioId = this.trim(body?.compareScenarioId);
    if (!baseScenarioId || !compareScenarioId) throw new BadRequestException("baseScenarioId e compareScenarioId são obrigatórios.");
    return (this.prisma as any).financeScenarioComparison.create({
      data: {
        companyId,
        baseScenarioId,
        compareScenarioId,
        status: this.trim(body?.status) || "DRAFT",
        summary: this.trim(body?.summary),
        deltaRevenue: body?.deltaRevenue !== undefined ? this.decimal(body?.deltaRevenue) : null,
        deltaSpend: body?.deltaSpend !== undefined ? this.decimal(body?.deltaSpend) : null,
        deltaCash: body?.deltaCash !== undefined ? this.decimal(body?.deltaCash) : null,
        notes: this.trim(body?.notes),
      },
    });
  }

  async listFxExposures(actor: Actor) {
    const companyId = this.ensureCompanyId(actor);
    return (this.prisma as any).financeFxExposure.findMany({
      where: { companyId },
      orderBy: [{ asOf: "desc" }],
    });
  }

  async createFxExposure(actor: Actor, body: any) {
    const companyId = this.ensureCompanyId(actor);
    const currencyCode = this.trim(body?.currencyCode);
    if (!currencyCode) throw new BadRequestException("currencyCode é obrigatório.");
    return (this.prisma as any).financeFxExposure.create({
      data: {
        companyId,
        entityId: this.trim(body?.entityId),
        currencyCode,
        exposureAmount: this.decimal(body?.exposureAmount),
        hedgeStatus: this.trim(body?.hedgeStatus) || "UNHEDGED",
        asOf: this.date(body?.asOf) || new Date(),
        notes: this.trim(body?.notes),
      },
    });
  }

  async listIntercompanySettlements(actor: Actor) {
    const companyId = this.ensureCompanyId(actor);
    return (this.prisma as any).financeIntercompanySettlement.findMany({
      where: { companyId },
      orderBy: [{ updatedAt: "desc" }],
    });
  }

  async createIntercompanySettlement(actor: Actor, body: any) {
    const companyId = this.ensureCompanyId(actor);
    return (this.prisma as any).financeIntercompanySettlement.create({
      data: {
        companyId,
        transferId: this.trim(body?.transferId),
        sourceEntityId: this.trim(body?.sourceEntityId),
        destinationEntityId: this.trim(body?.destinationEntityId),
        amount: this.decimal(body?.amount),
        currency: this.trim(body?.currency) || "BRL",
        status: this.trim(body?.status) || "PENDING",
        dueAt: this.date(body?.dueAt),
        settledAt: this.date(body?.settledAt),
        notes: this.trim(body?.notes),
      },
    });
  }

  async listTaxRegistrations(actor: Actor) {
    const companyId = this.ensureCompanyId(actor);
    return (this.prisma as any).financeTaxRegistration.findMany({
      where: { companyId },
      orderBy: [{ updatedAt: "desc" }],
    });
  }

  async createTaxRegistration(actor: Actor, body: any) {
    const companyId = this.ensureCompanyId(actor);
    const jurisdictionCode = this.trim(body?.jurisdictionCode);
    const registrationNumber = this.trim(body?.registrationNumber);
    if (!jurisdictionCode || !registrationNumber) throw new BadRequestException("jurisdictionCode e registrationNumber são obrigatórios.");
    return (this.prisma as any).financeTaxRegistration.create({
      data: {
        companyId,
        entityId: this.trim(body?.entityId),
        jurisdictionCode,
        registrationNumber,
        filingFrequency: this.trim(body?.filingFrequency),
        status: this.trim(body?.status) || "ACTIVE",
        notes: this.trim(body?.notes),
      },
    });
  }

  async listComplianceRuns(actor: Actor) {
    const companyId = this.ensureCompanyId(actor);
    return (this.prisma as any).financeComplianceRun.findMany({
      where: { companyId },
      orderBy: [{ startedAt: "desc" }],
    });
  }

  async listControlExceptions(actor: Actor) {
    const companyId = this.ensureCompanyId(actor);
    return (this.prisma as any).financeControlException.findMany({
      where: { companyId },
      orderBy: [{ updatedAt: "desc" }],
    });
  }

  async createControlException(actor: Actor, body: any) {
    const companyId = this.ensureCompanyId(actor);
    const controlType = this.trim(body?.controlType);
    const severity = this.trim(body?.severity);
    const title = this.trim(body?.title);
    if (!controlType || !severity || !title) throw new BadRequestException("controlType, severity e title são obrigatórios.");
    return (this.prisma as any).financeControlException.create({
      data: {
        companyId,
        complianceRunId: this.trim(body?.complianceRunId),
        controlType,
        severity,
        title,
        status: this.trim(body?.status) || "OPEN",
        ownerName: this.trim(body?.ownerName),
        remediation: this.trim(body?.remediation),
        dueAt: this.date(body?.dueAt),
        notes: this.trim(body?.notes),
      },
    });
  }

  async runCopilotAutopilot(actor: Actor, body: any) {
    const companyId = this.ensureCompanyId(actor);
    const [anomalies, invoices, payables, bankAccounts, vendorBenchmarks, copilotRules, approvalGuardrails, collectionAutomations] = await Promise.all([
      (this.prisma as any).financeAnomalyInsight.findMany({ where: { companyId } }),
      (this.prisma as any).financeInvoice.findMany({ where: { companyId } }),
      (this.prisma as any).financePayable.findMany({ where: { companyId } }),
      (this.prisma as any).financeBankAccount.findMany({ where: { companyId } }),
      (this.prisma as any).financeVendorNegotiationBenchmark.findMany({ where: { companyId } }),
      (this.prisma as any).financeCopilotRule.findMany({ where: { companyId } }),
      (this.prisma as any).financeApprovalGuardrail.findMany({ where: { companyId } }),
      (this.prisma as any).financeCollectionAutomation.findMany({ where: { companyId } }),
    ]);

    const activeAnomalies = anomalies.filter((item: any) => !item.resolvedAt);
    const overdueInvoices = invoices.filter((item: any) => item.status === "OVERDUE");
    const urgentPayables = payables.filter((item: any) => ["OVERDUE", "APPROVAL_PENDING"].includes(String(item.status)));
    const topBank = [...bankAccounts].sort((a: any, b: any) => this.number(b.currentBalance) - this.number(a.currentBalance))[0];
    const weakestBank = [...bankAccounts].sort((a: any, b: any) => this.number(a.currentBalance) - this.number(b.currentBalance))[0];

    const createdRule =
      copilotRules.length === 0
        ? await (this.prisma as any).financeCopilotRule.create({
            data: {
              companyId,
              name: "Autopilot de exceções financeiras",
              triggerType: "EXCEPTION",
              scope: "FINANCE",
              status: "ACTIVE",
              priority: "HIGH",
              conditionJson: { anomaly: true, overdueInvoice: true, approvalPending: true },
              actionJson: { openCase: true, queueApproval: true, queueCollection: true, prepareRebalance: true },
              notes: "Regra criada automaticamente para governar o CFO Copilot.",
            },
          })
        : null;

    const createdGuardrail =
      approvalGuardrails.length === 0 && urgentPayables[0]
        ? await (this.prisma as any).financeApprovalGuardrail.create({
            data: {
              companyId,
              title: "Guardrail de aprovação crítica",
              status: "ACTIVE",
              ruleType: "APPROVAL_LIMIT",
              thresholdAmount: this.decimal(this.number(urgentPayables[0].outstandingAmount, urgentPayables[0].amount)),
              scopeJson: { payableId: urgentPayables[0].id, status: urgentPayables[0].status },
              policyJson: { requireEvidencePack: true, requireSecondApprover: true },
              notes: "Guardrail automático criado pelo CFO Copilot.",
            },
          })
        : null;

    const createdInvestigation = activeAnomalies[0]
      ? await (this.prisma as any).financeCopilotInsight.create({
          data: {
            companyId,
            title: `Investigação automática: ${activeAnomalies[0].title || "anomalia financeira"}`,
            summary: activeAnomalies[0].summary || "O copiloto abriu uma investigação baseada em anomalia ativa.",
            recommendation: "Validar origem do desvio, histórico do fornecedor e impacto no fechamento.",
            actionLabel: "Investigar agora",
            actionPayload: { type: "investigation", anomalyId: activeAnomalies[0].id },
            riskLevel: "HIGH",
          },
        })
      : null;

    const createdCase = activeAnomalies[0]
      ? await (this.prisma as any).financeCopilotCase.create({
          data: {
            companyId,
            caseType: "ANOMALY_INVESTIGATION",
            priority: "HIGH",
            status: "OPEN",
            title: `Caso aberto: ${activeAnomalies[0].title || "anomalia financeira"}`,
            ownerName: actor.name || "CFO Copilot",
            resolutionState: "TRIAGE",
            payloadJson: { anomalyId: activeAnomalies[0].id },
            notes: "Caso criado automaticamente pelo CFO Copilot.",
          },
        })
      : null;

    const createdRecovery = overdueInvoices[0]
      ? await (this.prisma as any).financeRecoveryCase.create({
          data: {
            companyId,
            status: "PENDING",
            reason: `Recovery iniciado automaticamente para a invoice ${overdueInvoices[0].invoiceNumber}.`,
            attemptCount: 1,
            billingPlanId: overdueInvoices[0].billingPlanId,
            receivableId: overdueInvoices[0].receivableId,
            notes: "Disparo automático do CFO Copilot.",
          },
        })
      : null;

    const createdRetry = overdueInvoices[0]
      ? await (this.prisma as any).financeInvoiceRetryAttempt.create({
          data: {
            companyId,
            invoiceId: overdueInvoices[0].id,
            attemptNumber: 1,
            status: "SCHEDULED",
            channel: "EMAIL",
            scheduledAt: this.endInDays(1),
            notes: "Retry criado automaticamente pelo CFO Copilot.",
          },
        })
      : null;

    const createdCollectionAutomation =
      overdueInvoices[0] && collectionAutomations.length === 0
        ? await (this.prisma as any).financeCollectionAutomation.create({
            data: {
              companyId,
              name: "Recovery por exceção",
              segment: this.trim(body?.segment) || "DEFAULT",
              status: "ACTIVE",
              triggerType: "OVERDUE_INVOICE",
              cadenceJson: { day0: "EMAIL", day3: "WHATSAPP", day7: "ESCALATE" },
              policyJson: { autoOpenRecoveryCase: true, autoQueueRetry: true },
              lastRunAt: new Date(),
              notes: "Automação criada automaticamente pelo CFO Copilot.",
            },
          })
        : null;

    const createdNegotiation = vendorBenchmarks[0]
      ? await (this.prisma as any).financeCopilotInsight.create({
          data: {
            companyId,
            title: "Renegociação sugerida de fornecedor",
            summary: "O copiloto detectou benchmark aberto com oportunidade de economia.",
            recommendation: "Abrir renegociação com o fornecedor e revisar o contrato vigente.",
            actionLabel: "Abrir renegociação",
            actionPayload: { type: "vendor_renegotiation", benchmarkId: vendorBenchmarks[0].id },
            riskLevel: "MEDIUM",
          },
        })
      : null;

    const createdCashInsight =
      topBank && weakestBank && topBank.id !== weakestBank.id
        ? await (this.prisma as any).financeCopilotInsight.create({
            data: {
              companyId,
              title: "Rebalance automático de liquidez sugerido",
              summary: "O copiloto detectou concentração de caixa e recomendou rebalanceamento entre contas.",
              recommendation: "Transferir recursos entre contas para reduzir risco de liquidez e atrasos operacionais.",
              actionLabel: "Planejar transferência",
              actionPayload: {
                type: "cash_allocation",
                sourceBankAccountId: topBank.id,
                destinationBankAccountId: weakestBank.id,
                amount: Math.max(0, this.decimal(this.number(topBank.currentBalance) * 0.12)),
              },
              riskLevel: urgentPayables.length > 0 ? "HIGH" : "MEDIUM",
            },
          })
        : null;

    const createdRebalance =
      topBank && weakestBank && topBank.id !== weakestBank.id
        ? await (this.prisma as any).financeCashRebalanceInstruction.create({
            data: {
              companyId,
              status: "PLANNED",
              sourceAccountId: topBank.id,
              targetAccountId: weakestBank.id,
              currency: topBank.currency || "BRL",
              amount: Math.max(0, this.decimal(this.number(topBank.currentBalance) * 0.12)),
              rationale: "Instrução criada automaticamente para equalizar liquidez entre contas.",
              executeBy: this.endInDays(1),
              notes: "Cash rebalance pronto para execução.",
            },
          })
        : null;

    const run = await (this.prisma as any).financeCopilotRun.create({
      data: {
        companyId,
        runType: this.trim(body?.runType) || "AUTOPILOT",
        status: "COMPLETED",
        casesOpened: [createdCase, createdRecovery].filter(Boolean).length,
        actionsQueued: [createdRetry, createdCashInsight, createdNegotiation, createdRebalance, createdCollectionAutomation].filter(Boolean).length,
        startedAt: new Date(),
        completedAt: new Date(),
        summary: "Autopilot executado com abertura de casos, retry e recomendações.",
      },
    });

    const queuedActions = await Promise.all(
      [
        createdCase
          ? (this.prisma as any).financeCopilotAction.create({
              data: {
                companyId,
                caseId: createdCase.id,
                runId: run.id,
                actionType: "INVESTIGATE",
                status: "QUEUED",
                title: "Abrir investigação automática",
                ownerName: actor.name || "CFO Copilot",
                executeAfter: new Date(),
                payloadJson: { caseId: createdCase.id, insightId: createdInvestigation?.id || null },
                notes: "Ação de investigação preparada automaticamente.",
              },
            })
          : null,
        urgentPayables[0]
          ? (this.prisma as any).financeCopilotAction.create({
              data: {
                companyId,
                runId: run.id,
                actionType: "APPROVAL",
                status: "QUEUED",
                title: "Submeter aprovação com guardrail",
                ownerName: "Finance Approvals",
                executeAfter: new Date(),
                payloadJson: {
                  payableId: urgentPayables[0].id,
                  amount: this.decimal(this.number(urgentPayables[0].outstandingAmount, urgentPayables[0].amount)),
                  guardrailId: createdGuardrail?.id || null,
                },
                notes: "Aprovação sugerida com guardrails.",
              },
            })
          : null,
        createdRecovery
          ? (this.prisma as any).financeCopilotAction.create({
              data: {
                companyId,
                runId: run.id,
                actionType: "COLLECTION",
                status: "QUEUED",
                title: "Disparar cobrança automática assistida",
                ownerName: "Revenue Ops",
                executeAfter: this.endInDays(1),
                payloadJson: { recoveryCaseId: createdRecovery.id, retryId: createdRetry?.id || null },
                notes: "Cobrança preparada com automação e retry.",
              },
            })
          : null,
        createdNegotiation
          ? (this.prisma as any).financeCopilotAction.create({
              data: {
                companyId,
                runId: run.id,
                actionType: "NEGOTIATION",
                status: "QUEUED",
                title: "Preparar renegociação por benchmark",
                ownerName: "Vendor Office",
                executeAfter: this.endInDays(2),
                payloadJson: { benchmarkId: vendorBenchmarks[0]?.id || null, insightId: createdNegotiation.id },
                notes: "Renegociação sugerida com benchmark real.",
              },
            })
          : null,
        createdRebalance
          ? (this.prisma as any).financeCopilotAction.create({
              data: {
                companyId,
                runId: run.id,
                actionType: "REBALANCE",
                status: "QUEUED",
                title: "Executar cash rebalance",
                ownerName: "Treasury",
                executeAfter: createdRebalance.executeBy || this.endInDays(1),
                payloadJson: { rebalanceInstructionId: createdRebalance.id },
                notes: "Cash rebalance pronto para execução.",
              },
            })
          : null,
      ].filter(Boolean),
    );

    return {
      created: {
        run,
        rule: createdRule,
        guardrail: createdGuardrail,
        case: createdCase,
        investigation: createdInvestigation,
        recovery: createdRecovery,
        collectionAutomation: createdCollectionAutomation,
        retry: createdRetry,
        negotiation: createdNegotiation,
        cashInsight: createdCashInsight,
        rebalance: createdRebalance,
        actions: queuedActions,
      },
      summary: {
        anomalies: activeAnomalies.length,
        overdueInvoices: overdueInvoices.length,
        urgentPayables: urgentPayables.length,
      },
      mode: body?.mode || "auto",
    };
  }

  async runRevenueOps(actor: Actor, body: any) {
    const companyId = this.ensureCompanyId(actor);
    const [billingPlans, usageMeters, usageEvents, creditBalances, dunningPolicies, retrySegmentPolicies] = await Promise.all([
      (this.prisma as any).financeBillingPlan.findMany({ where: { companyId } }),
      (this.prisma as any).financeUsageMeter.findMany({ where: { companyId } }),
      (this.prisma as any).financeUsageEvent.findMany({ where: { companyId } }),
      (this.prisma as any).financeCustomerCreditBalance.findMany({ where: { companyId } }),
      (this.prisma as any).financeDunningPolicy.findMany({ where: { companyId } }),
      (this.prisma as any).financeRetrySegmentPolicy.findMany({ where: { companyId } }),
    ]);

    const cycleDate = this.date(body?.cycleDate) || new Date();
    const activePlans = billingPlans.filter((item: any) => ["ACTIVE", "PAST_DUE"].includes(String(item.status)));
    const invoices: any[] = [];
    const usageSnapshots: any[] = [];
    const paymentSessions: any[] = [];
    const creditApplications: any[] = [];

    for (const plan of activePlans.slice(0, this.number(body?.limit, 10))) {
      const quantity = usageEvents.filter((event: any) => {
        const meter = usageMeters.find((candidate: any) => candidate.id === event.usageMeterId);
        return meter && new Date(event.occurredAt) <= cycleDate;
      }).length || 1;

      const invoice = await this.runBillingCycle(actor, plan.id, {
        issueDate: cycleDate,
        dueAt: this.endInDays(15),
        quantity,
        amount: this.decimal(this.number(plan.amount) * Math.max(1, quantity)),
        taxAmount: this.decimal(this.number(plan.amount) * 0.09),
        smartNotes: `Usage billing consolidado para ${plan.customerName}.`,
      });
      invoices.push(invoice);

      usageSnapshots.push(
        await (this.prisma as any).financeCustomerUsageSnapshot.create({
          data: {
            companyId,
            customerName: plan.customerName,
            periodLabel: cycleDate.toISOString().slice(0, 7),
            usageQuantity: this.decimal(quantity),
            ratedAmount: this.decimal(this.number(invoice.netAmount)),
            creditApplied: 0,
            breakdownJson: { planId: plan.id, quantity },
            notes: "Snapshot de uso gerado automaticamente pelo Revenue Ops.",
          },
        }),
      );

      await (this.prisma as any).financeInvoiceLifecycleEvent.create({
        data: {
          companyId,
          invoiceId: invoice.id,
          eventType: "BILLING_RUN",
          eventStatus: "CREATED",
          eventAt: cycleDate,
          payloadJson: { quantity, planId: plan.id },
          notes: "Lifecycle gerado automaticamente pelo Revenue Ops.",
        },
      });

      const credit = creditBalances.find((item: any) => item.customerName === plan.customerName);
      const applicableCredit = credit ? Math.min(this.number(credit.availableBalance), this.number(invoice.netAmount)) : 0;
      if (credit && applicableCredit > 0) {
        creditApplications.push(
          await (this.prisma as any).financeBillingCreditApplication.create({
            data: {
              companyId,
              customerName: plan.customerName,
              status: "APPLIED",
              appliedAmount: this.decimal(applicableCredit),
              currency: invoice.currency || "BRL",
              reason: "Auto-aplicação de crédito no fechamento de billing.",
              invoiceId: invoice.id,
              creditBalanceId: credit.id,
              notes: "Crédito aplicado automaticamente.",
            },
          }),
        );
      }

      paymentSessions.push(
        await (this.prisma as any).financeInvoicePaymentSession.create({
          data: {
            companyId,
            customerName: plan.customerName,
            status: "OPEN",
            amount: this.decimal(Math.max(0, this.number(invoice.netAmount) - applicableCredit)),
            currency: invoice.currency || "BRL",
            paymentUrl: `billing/${invoice.id}/pay`,
            expiresAt: this.endInDays(7),
            paymentMethod: "BANK_TRANSFER",
            invoiceId: invoice.id,
            notes: "Sessão self-serve criada automaticamente.",
          },
        }),
      );

      if (credit) {
        await (this.prisma as any).financeCustomerBillingPortal.upsert({
          where: { id: `${credit.id}` },
          update: {
            status: "ACTIVE",
            billingPlanId: plan.id,
            creditBalanceId: credit.id,
            lastAccessAt: new Date(),
          },
          create: {
            companyId,
            customerName: plan.customerName,
            status: "ACTIVE",
            billingPlanId: plan.id,
            creditBalanceId: credit.id,
            portalUrl: `portal/${plan.id}`,
            lastAccessAt: new Date(),
          },
        }).catch(async () => {
          await (this.prisma as any).financeCustomerBillingPortal.create({
            data: {
              companyId,
              customerName: plan.customerName,
              status: "ACTIVE",
              billingPlanId: plan.id,
              creditBalanceId: credit.id,
              portalUrl: `portal/${plan.id}`,
              lastAccessAt: new Date(),
            },
          });
        });
      }
    }

    const retryPolicy =
      retrySegmentPolicies[0] ??
      (await (this.prisma as any).financeRetrySegmentPolicy.create({
        data: {
          companyId,
          segment: this.trim(body?.segment) || "DEFAULT",
          status: "ACTIVE",
          retryCount: 4,
          intervalDays: 3,
          channelJson: { sequence: ["EMAIL", "PORTAL", "ESCALATION"] },
          guardrailJson: { stopAfterDaysPastDue: 30 },
          notes: "Política de retry criada automaticamente pelo Revenue Ops.",
        },
      }));

    return {
      processedPlans: activePlans.length,
      createdInvoices: invoices.length,
      activeDunningPolicies: dunningPolicies.filter((item: any) => String(item.status).toUpperCase() === "ACTIVE").length,
      usageSnapshots: usageSnapshots.length,
      paymentSessions: paymentSessions.length,
      creditApplications: creditApplications.length,
      retryPolicy,
      cycleDate: cycleDate.toISOString(),
    };
  }

  async runGlobalFinanceOps(actor: Actor, body: any) {
    const companyId = this.ensureCompanyId(actor);
    const [entities, payouts, reimbursements, intercompanyTransfers, fxRates, bankAccounts, receivables, payables, taxRegistrations] = await Promise.all([
      (this.prisma as any).financeGlobalEntity.findMany({ where: { companyId } }),
      (this.prisma as any).financeLocalPayout.findMany({ where: { companyId } }),
      (this.prisma as any).financeInternationalReimbursement.findMany({ where: { companyId } }),
      (this.prisma as any).financeIntercompanyTransfer.findMany({ where: { companyId } }),
      (this.prisma as any).financeFxRate.findMany({ where: { companyId } }),
      (this.prisma as any).financeBankAccount.findMany({ where: { companyId } }),
      (this.prisma as any).financeReceivable.findMany({ where: { companyId } }),
      (this.prisma as any).financePayable.findMany({ where: { companyId } }),
      (this.prisma as any).financeTaxRegistration.findMany({ where: { companyId } }),
    ]);

    const snapshot = await (this.prisma as any).financeConsolidationSnapshot.create({
      data: {
        companyId,
        label: this.trim(body?.label) || `Global consolidation ${new Date().toISOString().slice(0, 10)}`,
        asOf: new Date(),
        status: "RUNNING",
        entityCount: entities.length,
        totalRevenue: 0,
        totalSpend: this.decimal(
          this.sumAmount(payouts, (item: any) => item.amount) +
            this.sumAmount(reimbursements, (item: any) => item.requestedAmount) +
            this.sumAmount(intercompanyTransfers, (item: any) => item.amount),
        ),
        netCash: 0,
        notes: "Snapshot gerado automaticamente pela malha global.",
      },
    });

    const fxExposure = entities[0]
      ? await (this.prisma as any).financeFxExposure.create({
          data: {
            companyId,
            entityId: entities[0].id,
            currencyCode: entities[0].baseCurrency,
            exposureAmount: this.decimal(this.sumAmount(payouts, (item: any) => item.amount)),
            hedgeStatus: fxRates.length > 0 ? "MONITORED" : "UNHEDGED",
            asOf: new Date(),
            notes: "Exposição criada automaticamente pela operação global.",
          },
        })
      : null;

    const settlement = intercompanyTransfers[0]
      ? await (this.prisma as any).financeIntercompanySettlement.create({
          data: {
            companyId,
            transferId: intercompanyTransfers[0].id,
            sourceEntityId: intercompanyTransfers[0].sourceEntityId,
            destinationEntityId: intercompanyTransfers[0].destinationEntityId,
            amount: intercompanyTransfers[0].amount,
            currency: intercompanyTransfers[0].currency,
            status: "PENDING",
            dueAt: this.endInDays(5),
            notes: "Settlement sugerido automaticamente pela malha global.",
          },
        })
      : null;

    const fxAutomationRun =
      fxRates[0]
        ? await (this.prisma as any).financeFxAutomationRun.create({
            data: {
              companyId,
              status: "COMPLETED",
              baseCurrency: fxRates[0].baseCurrency || "BRL",
              targetCurrency: fxRates[0].quoteCurrency || "USD",
              executedAt: new Date(),
              convertedAmount: this.decimal(this.sumAmount(reimbursements, (item: any) => item.requestedAmount)),
              averageRate: this.decimal(this.number(fxRates[0].rate, 1), 1),
              notes: "Run automático de FX criado pelo Global Ops.",
            },
          })
        : null;

    const payoutBatch =
      payouts.length > 0
        ? await (this.prisma as any).financeLocalPayoutBatch.create({
            data: {
              companyId,
              batchLabel: this.trim(body?.batchLabel) || `Local payouts ${new Date().toISOString().slice(0, 10)}`,
              status: "PLANNED",
              countryCode: payouts[0].countryCode || "BR",
              currency: payouts[0].currency || "BRL",
              payoutCount: payouts.length,
              totalAmount: this.decimal(this.sumAmount(payouts, (item: any) => item.amount)),
              notes: "Batch criado automaticamente pela malha global.",
            },
          })
        : null;

    const settlementLine =
      settlement
        ? await (this.prisma as any).financeIntercompanySettlementLine.create({
            data: {
              companyId,
              settlementId: settlement.id,
              status: "OPEN",
              description: "Linha de settlement criada automaticamente.",
              amount: settlement.amount,
              currency: settlement.currency,
              dueAt: settlement.dueAt,
              sourceEntityLabel: settlement.sourceEntityId,
              destinationEntityLabel: settlement.destinationEntityId,
              notes: "Detalhe operacional do intercompany settlement.",
            },
          })
        : null;

    const taxRule =
      taxRegistrations.length > 0
        ? null
        : await (this.prisma as any).financeTaxRule.create({
            data: {
              companyId,
              jurisdictionCode: this.trim(body?.jurisdictionCode) || "BR-SP",
              ruleType: "INDIRECT_TAX",
              status: "ACTIVE",
              ratePct: this.decimal(9.25),
              payloadJson: { filing: "MONTHLY", withholding: false },
              notes: "Regra tributária base criada automaticamente.",
            },
          });

    const entityBalances = await Promise.all(
      entities.slice(0, this.number(body?.entityLimit, 6)).map((entity: any) =>
        (this.prisma as any).financeConsolidationEntityBalance.create({
          data: {
            companyId,
            entityLabel: entity.name,
            snapshotLabel: snapshot.label,
            cashBalance: this.decimal(this.sumAmount(bankAccounts.filter((item: any) => item.currency === entity.baseCurrency), (item: any) => item.currentBalance)),
            receivables: this.decimal(this.sumAmount(receivables, (item: any) => item.outstandingAmount)),
            payables: this.decimal(this.sumAmount(payables, (item: any) => item.outstandingAmount)),
            fxImpact: this.decimal(this.sumAmount(fxRates, (item: any) => item.rate)),
            consolidationSnapshotId: snapshot.id,
            notes: "Saldo consolidado automaticamente por entidade.",
          },
        }),
      ),
    );

    return {
      consolidationSnapshot: snapshot,
      fxExposure,
      fxAutomationRun,
      payoutBatch,
      settlement,
      settlementLine,
      taxRule,
      entityBalances: entityBalances.length,
      entities: entities.length,
      payouts: payouts.length,
      reimbursements: reimbursements.length,
      intercompanyTransfers: intercompanyTransfers.length,
    };
  }

  async runVendorGovernance(actor: Actor, body: any) {
    const companyId = this.ensureCompanyId(actor);
    const vendors = await (this.prisma as any).financeVendor.findMany({ where: { companyId } });
    const results: any[] = [];
    const scorecards: any[] = [];
    const dynamicScores: any[] = [];
    const investigations: any[] = [];
    const matchResults: any[] = [];
    const negotiationOpportunities: any[] = [];

    for (const vendor of vendors.slice(0, this.number(body?.limit, 10))) {
      const kyc = await (this.prisma as any).financeVendorKycReview.create({
        data: {
          companyId,
          vendorId: vendor.id,
          status: "PENDING",
          reviewerName: actor.name || "Vendor Copilot",
          score: Math.max(10, Math.min(95, this.number(vendor.riskScore, 50))),
          checklistJson: { taxId: !!vendor.taxId, email: !!vendor.email, phone: !!vendor.phone },
          notes: "Review automático para atualização de vendor governance.",
        },
      });
      results.push(kyc);

      scorecards.push(
        await (this.prisma as any).financeVendorScorecard.create({
          data: {
            companyId,
            vendorId: vendor.id,
            scoreDate: new Date(),
            deliveryScore: this.decimal(Math.max(55, 100 - this.number(vendor.riskScore, 40))),
            priceScore: this.decimal(72),
            complianceScore: this.decimal(vendor.taxId ? 88 : 52),
            riskScore: this.decimal(this.number(vendor.riskScore, 40)),
            totalScore: this.decimal(78),
            notes: "Scorecard gerado automaticamente pelo Vendor Governance.",
          },
        }),
      );

      dynamicScores.push(
        await (this.prisma as any).financeVendorDynamicScore.create({
          data: {
            companyId,
            vendorId: vendor.id,
            scoreDate: new Date(),
            priceScore: this.decimal(Math.max(45, 92 - this.number(vendor.riskScore, 40) / 2)),
            fulfillmentScore: this.decimal(80),
            complianceScore: this.decimal(vendor.taxId ? 90 : 48),
            totalScore: this.decimal(76),
            notes: "Dynamic score gerado automaticamente pelo procurement intelligence.",
          },
        }),
      );

      investigations.push(
        await (this.prisma as any).financeProcurementInvestigation.create({
          data: {
            companyId,
            title: `Investigação de mismatch - ${vendor.name}`,
            severity: this.number(vendor.riskScore, 40) > 70 ? "HIGH" : "MEDIUM",
            status: "OPEN",
            finding: "Diferença potencial entre documento, benchmark e comportamento de spend.",
            recommendedAction: "Validar line items, benchmark histórico e contrato vigente.",
            ownerName: actor.name || "Procurement AI",
            notes: "Investigação criada automaticamente pelo Vendor Governance.",
          },
        }),
      );

      matchResults.push(
        await (this.prisma as any).financeOcrMatchResult.create({
          data: {
            companyId,
            status: "OPEN",
            matchType: "LINE_ITEM_MISMATCH",
            confidencePct: this.decimal(83),
            mismatchAmount: this.decimal(this.number(vendor.riskScore, 0) * 12.5),
            drilldownJson: { vendorId: vendor.id, invoiceVsPo: "PARTIAL", receivedVsInvoiced: "UNDER_REVIEW" },
            notes: "Resultado OCR criado automaticamente para drill-down de mismatch.",
          },
        }),
      );

      negotiationOpportunities.push(
        await (this.prisma as any).financeNegotiationOpportunity.create({
          data: {
            companyId,
            vendorId: vendor.id,
            benchmarkId: null,
            title: `Oportunidade de renegociação - ${vendor.name}`,
            status: "OPEN",
            savingsPotential: this.decimal(Math.max(0, this.number(vendor.riskScore, 0) * 22)),
            benchmarkGapPct: this.decimal(Math.max(3, this.number(vendor.riskScore, 0) / 4)),
            rationale: "Gap acima do benchmark histórico de spend e score dinâmico do fornecedor.",
            notes: "Renegociação preparada com base em histórico e benchmark.",
          },
        }),
      );
    }

    const fraudRun = await (this.prisma as any).financeFraudDetectionRun.create({
      data: {
        companyId,
        status: "COMPLETED",
        findingsCount: investigations.length,
        severity: investigations.some((item: any) => item.severity === "HIGH") ? "HIGH" : "MEDIUM",
        executedAt: new Date(),
        summary: "Fraud and overbilling scan concluído automaticamente.",
        notes: "Run criado pela camada de procurement intelligence.",
      },
    });

    return {
      reviewedVendors: results.length,
      kycReviews: results,
      scorecards: scorecards.length,
      dynamicScores: dynamicScores.length,
      investigations: investigations.length,
      matchResults: matchResults.length,
      negotiationOpportunities: negotiationOpportunities.length,
      fraudRun,
    };
  }

  async runBiRefresh(actor: Actor, body: any) {
    const companyId = this.ensureCompanyId(actor);
    const [branches, invoices, transactions, planScenarios, workforcePlans] = await Promise.all([
      this.prisma.branch.findMany({ where: { companyId } }),
      (this.prisma as any).financeInvoice.findMany({ where: { companyId } }),
      (this.prisma as any).financeTransaction.findMany({ where: { companyId } }),
      (this.prisma as any).financePlanScenario.findMany({ where: { companyId } }),
      (this.prisma as any).financeWorkforcePlan.findMany({ where: { companyId } }),
    ]);

    const snapshot = await (this.prisma as any).financeMetricSnapshot.create({
      data: {
        companyId,
        metricType: "MONTHLY",
        label: this.trim(body?.label) || "Receita líquida mensal",
        metricDate: this.startOfToday(),
        value: this.decimal(this.sumAmount(invoices, (item: any) => item.netAmount)),
        compareValue: this.decimal(this.sumAmount(transactions.filter((item: any) => item.direction === "INFLOW"), (item: any) => item.amount)),
        unitLabel: "BRL",
        breakdownJson: { branches: branches.length },
      },
    });

    const benchmarks: any[] = [];
    for (const branch of branches.slice(0, this.number(body?.limit, 5))) {
      benchmarks.push(
        await (this.prisma as any).financeUnitBenchmark.create({
          data: {
            companyId,
            unitLabel: branch.name,
            benchmarkDate: this.startOfToday(),
            revenueValue: this.decimal(this.sumAmount(transactions.filter((item: any) => item.branchId === branch.id && item.direction === "INFLOW"), (item: any) => item.amount)),
            spendValue: this.decimal(this.sumAmount(transactions.filter((item: any) => item.branchId === branch.id && item.direction === "OUTFLOW"), (item: any) => item.amount)),
            benchmarkJson: { branchId: branch.id },
          },
        }),
      );
    }

    const planningCycle = await (this.prisma as any).financePlanningCycle.create({
      data: {
        companyId,
        label: this.trim(body?.cycleLabel) || `Planning cycle ${new Date().toISOString().slice(0, 10)}`,
        status: "ACTIVE",
        horizonMonths: this.number(body?.horizonMonths, 12),
        ownerName: actor.name || "FP&A",
        notes: "Ciclo criado automaticamente pelo BI refresh.",
      },
    });

    const comparison =
      planScenarios.length >= 2
        ? await (this.prisma as any).financeScenarioComparison.create({
            data: {
              companyId,
              baseScenarioId: planScenarios[0].id,
              compareScenarioId: planScenarios[1].id,
              status: "READY",
              summary: "Comparação automática de cenários para FP&A.",
              deltaRevenue: this.decimal(this.number(planScenarios[1].revenuePlan) - this.number(planScenarios[0].revenuePlan)),
              deltaSpend: this.decimal(this.number(planScenarios[1].spendPlan) - this.number(planScenarios[0].spendPlan)),
              deltaCash: this.decimal((this.number(planScenarios[1].revenuePlan) - this.number(planScenarios[1].spendPlan)) - (this.number(planScenarios[0].revenuePlan) - this.number(planScenarios[0].spendPlan))),
              notes: "Comparison criada automaticamente pelo BI refresh.",
            },
          })
        : null;

    const variance =
      invoices.length > 0
        ? await (this.prisma as any).financeVarianceExplanation.create({
            data: {
              companyId,
              title: "Variação de receita explicada",
              varianceType: "REVENUE",
              metricLabel: "Net revenue",
              varianceAmount: this.decimal(this.sumAmount(invoices, (item: any) => item.netAmount) - this.sumAmount(transactions.filter((item: any) => item.direction === "INFLOW"), (item: any) => item.amount)),
              explanation: "A diferença entre faturamento e entrada realizada exige acompanhamento do ciclo de caixa.",
              recommendedAction: "Reforçar cobrança e revisar calendário de recebimento.",
              ownerName: actor.name || "FP&A",
              status: "OPEN",
            },
          })
        : null;

    return {
      metricSnapshot: snapshot,
      unitBenchmarks: benchmarks.length,
      planningCycle,
      comparison,
      variance,
      workforcePlans: workforcePlans.length,
    };
  }

  async runComplianceSweep(actor: Actor, body: any) {
    const companyId = this.ensureCompanyId(actor);
    const [approvalRequests, ssoConfigs, segregationPolicies, retentionPolicies] = await Promise.all([
      (this.prisma as any).financeApprovalRequest.findMany({ where: { companyId } }),
      (this.prisma as any).enterpriseSsoConfig.findMany({ where: { companyId } }),
      (this.prisma as any).enterpriseSegregationPolicy.findMany({ where: { companyId } }),
      (this.prisma as any).enterpriseDataRetentionPolicy.findMany({ where: { companyId } }),
    ]);

    const evidence = approvalRequests[0]
      ? await (this.prisma as any).financeApprovalEvidence.create({
          data: {
            companyId,
            approvalRequestId: approvalRequests[0].id,
            title: "Approval evidence pack",
            evidenceType: "AUTO_CHECK",
            status: "PENDING",
            notes: "Evidence bundle gerado pelo compliance sweep.",
          },
        })
      : null;

    const auditExport = await (this.prisma as any).enterpriseAuditExport.create({
      data: {
        companyId,
        format: this.trim(body?.format) || "CSV",
        status: "PENDING",
        dateFrom: this.date(body?.dateFrom),
        dateTo: this.date(body?.dateTo),
        notes: "Export gerado automaticamente pelo compliance sweep.",
        scopeJson: { ssoEnabled: ssoConfigs.length > 0 },
      },
    });

    const complianceRun = await (this.prisma as any).financeComplianceRun.create({
      data: {
        companyId,
        runType: this.trim(body?.runType) || "SWEEP",
        status: "COMPLETED",
        findingsCount: approvalRequests.length,
        exceptionsCount: Math.max(0, approvalRequests.filter((item: any) => item.status === "PENDING").length + segregationPolicies.filter((item: any) => String(item.severity) === "HIGH").length),
        startedAt: new Date(),
        completedAt: new Date(),
        notes: "Compliance sweep executado automaticamente.",
      },
    });

    const controlException =
      segregationPolicies[0]
        ? await (this.prisma as any).financeControlException.create({
            data: {
              companyId,
              complianceRunId: complianceRun.id,
              controlType: "SEGREGATION_OF_DUTIES",
              severity: String(segregationPolicies[0].severity || "MEDIUM"),
              title: "Possível conflito de segregação identificado",
              status: "OPEN",
              ownerName: "Finance Security",
              remediation: "Revisar matriz de acesso e exceções de aprovação.",
              dueAt: this.endInDays(7),
              notes: "Exceção criada automaticamente pelo compliance sweep.",
            },
        })
      : null;

    const enforcement =
      segregationPolicies[0]
        ? await (this.prisma as any).financeSegregationEnforcement.create({
            data: {
              companyId,
              policyId: segregationPolicies[0].id,
              title: "Enforcement automático de SoD",
              status: "ACTIVE",
              enforcementType: "APPROVAL_PATH",
              conflictDetected: true,
              payloadJson: { severity: segregationPolicies[0].severity, pendingApprovals: approvalRequests.length },
              notes: "Enforcement gerado automaticamente pelo compliance sweep.",
            },
          })
        : null;

    const evidencePack =
      evidence
        ? await (this.prisma as any).financeEvidencePack.create({
            data: {
              companyId,
              approvalRequestId: approvalRequests[0]?.id || null,
              title: "Enterprise evidence pack",
              status: "GENERATED",
              evidenceCount: 1,
              packageUrl: `evidence/${evidence.id}`,
              generatedAt: new Date(),
              notes: "Pack automático para auditoria enterprise.",
            },
          })
        : null;

    const retentionExecution = await (this.prisma as any).financeRetentionExecution.create({
      data: {
        companyId,
        retentionPolicyId: retentionPolicies[0]?.id || null,
        status: "COMPLETED",
        policyLabel: retentionPolicies[0]?.name || "Default retention",
        recordsAffected: approvalRequests.length,
        executedAt: new Date(),
        notes: "Execução automática da política de retenção.",
      },
    });

    const auditPackage = await (this.prisma as any).financeAuditPackage.create({
      data: {
        companyId,
        auditExportId: auditExport.id,
        label: `Audit package ${new Date().toISOString().slice(0, 10)}`,
        status: "GENERATED",
        packageUrl: `audit/${auditExport.id}`,
        generatedAt: new Date(),
        scopeJson: { approvals: approvalRequests.length, ssoConfigs: ssoConfigs.length },
        notes: "Pacote de auditoria pronto para operação enterprise.",
      },
    });

    return {
      complianceRun,
      controlException,
      enforcement,
      evidence,
      evidencePack,
      retentionExecution,
      auditExport,
      auditPackage,
      ssoEnabled: ssoConfigs.length > 0,
    };
  }

  async getModule(actor: Actor) {
    const companyId = this.ensureCompanyId(actor);
    const [company, branches, departments, users, bankAccounts, payables, receivables, transactions, approvalRequests, closePeriods, forecasts, statementLines, vendors, vendorDocuments, procurementRequests, purchaseOrders, expenseReports, corporateCards, erpConnections, treasuryTransfers, treasuryAllocations, cashPositionSnapshots, anomalyInsights, cashForecastRuns, travelPolicies, travelRequests, travelBookings, travelAdvances, billingPlans, invoices, taxProfiles, revenueSchedules, recoveryCases, closeEvidences, globalEntities, countryPolicies, planDrivers, planScenarios, copilotInsights, copilotPlaybooks, usageMeters, usageEvents, revenueSubledgerEntries, revenueConnectors, fxRates, internationalReimbursements, localPayouts, intercompanyTransfers, consolidationSnapshots, taxJurisdictions, taxTrails, vendorKycReviews, vendorContracts, vendorBenchmarks, warehouseConnections, metricSnapshots, revenueCohorts, unitBenchmarks, ssoConfigs, scimProvisions, retentionPolicies, auditExports, segregationPolicies, approvalEvidences, billingPlanVersions, customerCreditBalances, rateCards, invoiceRetryAttempts, workforcePlans, scenarioMerges, varianceExplanations, planningCollaborations, procurementSignals, copilotRuns, copilotCases, dunningPolicies, invoiceLifecycleEvents, customerBillingPortals, procurementInvestigations, ocrLineItems, vendorScorecards, planningCycles, headcountPlanLines, scenarioComparisons, fxExposures, intercompanySettlements, taxRegistrations, complianceRuns, controlExceptions, copilotRules, copilotActions, approvalGuardrails, collectionAutomations, cashRebalanceInstructions, customerUsageSnapshots, invoicePaymentSessions, billingCreditApplications, retrySegmentPolicies, fxAutomationRuns, localPayoutBatches, intercompanySettlementLines, taxRules, consolidationEntityBalances, segregationEnforcements, evidencePacks, retentionExecutions, auditPackages, ocrMatchResults, fraudDetectionRuns, vendorDynamicScores, negotiationOpportunities] =
      await Promise.all([
        this.prisma.company.findUnique({
          where: { id: companyId },
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
        }),
        this.prisma.branch.findMany({ where: { companyId }, select: { id: true, name: true, companyId: true } }),
        this.prisma.department.findMany({ where: { companyId }, select: { id: true, name: true, companyId: true, branchId: true } }),
        this.prisma.user.findMany({ where: { companyId }, select: { id: true, email: true, name: true, role: true, isActive: true, branchId: true, departmentId: true } }),
        (this.prisma as any).financeBankAccount.findMany({ where: { companyId } }),
        (this.prisma as any).financePayable.findMany({ where: { companyId } }),
        (this.prisma as any).financeReceivable.findMany({ where: { companyId } }),
        (this.prisma as any).financeTransaction.findMany({ where: { companyId } }),
        (this.prisma as any).financeApprovalRequest.findMany({ where: { companyId } }),
        (this.prisma as any).financeClosePeriod.findMany({ where: { companyId }, include: { checklistItems: true } }),
        (this.prisma as any).financeForecastSnapshot.findMany({ where: { companyId } }),
        (this.prisma as any).financeStatementLine.findMany({ where: { companyId } }),
        (this.prisma as any).financeVendor.findMany({ where: { companyId } }),
        (this.prisma as any).financeVendorDocument.findMany({ where: { companyId } }),
        (this.prisma as any).financeProcurementRequest.findMany({ where: { companyId } }),
        (this.prisma as any).financePurchaseOrder.findMany({ where: { companyId } }),
        (this.prisma as any).financeExpenseReport.findMany({ where: { companyId } }),
        (this.prisma as any).financeCorporateCard.findMany({ where: { companyId } }),
        (this.prisma as any).financeErpConnection.findMany({ where: { companyId } }),
        (this.prisma as any).financeTreasuryTransfer.findMany({ where: { companyId } }),
        (this.prisma as any).financeTreasuryAllocation.findMany({ where: { companyId } }),
        (this.prisma as any).financeCashPositionSnapshot.findMany({ where: { companyId } }),
        (this.prisma as any).financeAnomalyInsight.findMany({ where: { companyId } }),
        (this.prisma as any).financeCashForecastRun.findMany({ where: { companyId } }),
        (this.prisma as any).financeTravelPolicy.findMany({ where: { companyId } }),
        (this.prisma as any).financeTravelRequest.findMany({ where: { companyId } }),
        (this.prisma as any).financeTravelBooking.findMany({ where: { companyId } }),
        (this.prisma as any).financeTravelAdvance.findMany({ where: { companyId } }),
        (this.prisma as any).financeBillingPlan.findMany({ where: { companyId } }),
        (this.prisma as any).financeInvoice.findMany({ where: { companyId } }),
        (this.prisma as any).financeTaxProfile.findMany({ where: { companyId } }),
        (this.prisma as any).financeRevenueSchedule.findMany({ where: { companyId } }),
        (this.prisma as any).financeRecoveryCase.findMany({ where: { companyId } }),
        (this.prisma as any).financeCloseEvidence.findMany({ where: { companyId } }),
        (this.prisma as any).financeGlobalEntity.findMany({ where: { companyId } }),
        (this.prisma as any).financeCountryPolicy.findMany({ where: { companyId } }),
        (this.prisma as any).financePlanDriver.findMany({ where: { companyId } }),
        (this.prisma as any).financePlanScenario.findMany({ where: { companyId } }),
        (this.prisma as any).financeCopilotInsight.findMany({ where: { companyId } }),
        (this.prisma as any).financeCopilotPlaybook.findMany({ where: { companyId } }),
        (this.prisma as any).financeUsageMeter.findMany({ where: { companyId } }),
        (this.prisma as any).financeUsageEvent.findMany({ where: { companyId } }),
        (this.prisma as any).financeRevenueSubledgerEntry.findMany({ where: { companyId } }),
        (this.prisma as any).financeRevenueConnector.findMany({ where: { companyId } }),
        (this.prisma as any).financeFxRate.findMany({ where: { companyId } }),
        (this.prisma as any).financeInternationalReimbursement.findMany({ where: { companyId } }),
        (this.prisma as any).financeLocalPayout.findMany({ where: { companyId } }),
        (this.prisma as any).financeIntercompanyTransfer.findMany({ where: { companyId } }),
        (this.prisma as any).financeConsolidationSnapshot.findMany({ where: { companyId } }),
        (this.prisma as any).financeTaxJurisdiction.findMany({ where: { companyId } }),
        (this.prisma as any).financeTaxTrail.findMany({ where: { companyId } }),
        (this.prisma as any).financeVendorKycReview.findMany({ where: { companyId } }),
        (this.prisma as any).financeVendorContract.findMany({ where: { companyId } }),
        (this.prisma as any).financeVendorNegotiationBenchmark.findMany({ where: { companyId } }),
        (this.prisma as any).financeDataWarehouseConnection.findMany({ where: { companyId } }),
        (this.prisma as any).financeMetricSnapshot.findMany({ where: { companyId } }),
        (this.prisma as any).financeRevenueCohort.findMany({ where: { companyId } }),
        (this.prisma as any).financeUnitBenchmark.findMany({ where: { companyId } }),
        (this.prisma as any).enterpriseSsoConfig.findMany({ where: { companyId } }),
        (this.prisma as any).enterpriseScimProvision.findMany({ where: { companyId } }),
        (this.prisma as any).enterpriseDataRetentionPolicy.findMany({ where: { companyId } }),
        (this.prisma as any).enterpriseAuditExport.findMany({ where: { companyId } }),
        (this.prisma as any).enterpriseSegregationPolicy.findMany({ where: { companyId } }),
        (this.prisma as any).financeApprovalEvidence.findMany({ where: { companyId } }),
        (this.prisma as any).financeBillingPlanVersion.findMany({ where: { companyId } }),
        (this.prisma as any).financeCustomerCreditBalance.findMany({ where: { companyId } }),
        (this.prisma as any).financeRateCard.findMany({ where: { companyId } }),
        (this.prisma as any).financeInvoiceRetryAttempt.findMany({ where: { companyId } }),
        (this.prisma as any).financeWorkforcePlan.findMany({ where: { companyId } }),
        (this.prisma as any).financeScenarioMerge.findMany({ where: { companyId } }),
        (this.prisma as any).financeVarianceExplanation.findMany({ where: { companyId } }),
        (this.prisma as any).financePlanningCollaboration.findMany({ where: { companyId } }),
        (this.prisma as any).financeProcurementSignal.findMany({ where: { companyId } }),
        (this.prisma as any).financeCopilotRun.findMany({ where: { companyId } }),
        (this.prisma as any).financeCopilotCase.findMany({ where: { companyId } }),
        (this.prisma as any).financeDunningPolicy.findMany({ where: { companyId } }),
        (this.prisma as any).financeInvoiceLifecycleEvent.findMany({ where: { companyId } }),
        (this.prisma as any).financeCustomerBillingPortal.findMany({ where: { companyId } }),
        (this.prisma as any).financeProcurementInvestigation.findMany({ where: { companyId } }),
        (this.prisma as any).financeOcrLineItem.findMany({ where: { companyId } }),
        (this.prisma as any).financeVendorScorecard.findMany({ where: { companyId } }),
        (this.prisma as any).financePlanningCycle.findMany({ where: { companyId } }),
        (this.prisma as any).financeHeadcountPlanLine.findMany({ where: { companyId } }),
        (this.prisma as any).financeScenarioComparison.findMany({ where: { companyId } }),
        (this.prisma as any).financeFxExposure.findMany({ where: { companyId } }),
        (this.prisma as any).financeIntercompanySettlement.findMany({ where: { companyId } }),
        (this.prisma as any).financeTaxRegistration.findMany({ where: { companyId } }),
        (this.prisma as any).financeComplianceRun.findMany({ where: { companyId } }),
        (this.prisma as any).financeControlException.findMany({ where: { companyId } }),
        (this.prisma as any).financeCopilotRule.findMany({ where: { companyId } }),
        (this.prisma as any).financeCopilotAction.findMany({ where: { companyId } }),
        (this.prisma as any).financeApprovalGuardrail.findMany({ where: { companyId } }),
        (this.prisma as any).financeCollectionAutomation.findMany({ where: { companyId } }),
        (this.prisma as any).financeCashRebalanceInstruction.findMany({ where: { companyId } }),
        (this.prisma as any).financeCustomerUsageSnapshot.findMany({ where: { companyId } }),
        (this.prisma as any).financeInvoicePaymentSession.findMany({ where: { companyId } }),
        (this.prisma as any).financeBillingCreditApplication.findMany({ where: { companyId } }),
        (this.prisma as any).financeRetrySegmentPolicy.findMany({ where: { companyId } }),
        (this.prisma as any).financeFxAutomationRun.findMany({ where: { companyId } }),
        (this.prisma as any).financeLocalPayoutBatch.findMany({ where: { companyId } }),
        (this.prisma as any).financeIntercompanySettlementLine.findMany({ where: { companyId } }),
        (this.prisma as any).financeTaxRule.findMany({ where: { companyId } }),
        (this.prisma as any).financeConsolidationEntityBalance.findMany({ where: { companyId } }),
        (this.prisma as any).financeSegregationEnforcement.findMany({ where: { companyId } }),
        (this.prisma as any).financeEvidencePack.findMany({ where: { companyId } }),
        (this.prisma as any).financeRetentionExecution.findMany({ where: { companyId } }),
        (this.prisma as any).financeAuditPackage.findMany({ where: { companyId } }),
        (this.prisma as any).financeOcrMatchResult.findMany({ where: { companyId } }),
        (this.prisma as any).financeFraudDetectionRun.findMany({ where: { companyId } }),
        (this.prisma as any).financeVendorDynamicScore.findMany({ where: { companyId } }),
        (this.prisma as any).financeNegotiationOpportunity.findMany({ where: { companyId } }),
      ]);

    const today = this.startOfToday();
    const plus30 = this.endInDays(30);
    const plus7 = this.endInDays(7);
    const openPayables = payables.filter((item: any) => ["OPEN", "PARTIAL", "APPROVAL_PENDING", "OVERDUE"].includes(String(item.status)));
    const openReceivables = receivables.filter((item: any) => ["OPEN", "PARTIAL", "OVERDUE", "DISPUTED"].includes(String(item.status)));
    const overdueReceivablesItems = openReceivables.filter((item: any) => new Date(item.dueAt) < today);
    const next30Receivables = openReceivables.filter((item: any) => new Date(item.dueAt) <= plus30);
    const next30Payables = openPayables.filter((item: any) => new Date(item.dueAt) <= plus30);
    const next7Payables = openPayables.filter((item: any) => new Date(item.dueAt) <= plus7);

    const cashBalance =
      this.sumAmount(bankAccounts, (item: any) => item.currentBalance) +
      this.sumAmount(transactions.filter((item: any) => item.direction === "INFLOW"), (item: any) => item.amount) -
      this.sumAmount(transactions.filter((item: any) => item.direction === "OUTFLOW"), (item: any) => item.amount);
    const inflows30d = this.sumAmount(next30Receivables, (item: any) => item.outstandingAmount);
    const outflows30d = this.sumAmount(next30Payables, (item: any) => item.outstandingAmount);
    const projectedCash30d = cashBalance + inflows30d - outflows30d;
    const overdueReceivables = this.sumAmount(overdueReceivablesItems, (item: any) => item.outstandingAmount);
    const payablesNext7d = this.sumAmount(next7Payables, (item: any) => item.outstandingAmount);
    const approvalBacklog = approvalRequests.filter((item: any) => item.status === "PENDING").length;
    const inflowRealized = this.sumAmount(transactions.filter((item: any) => item.direction === "INFLOW"), (item: any) => item.amount);
    const outflowRealized = this.sumAmount(transactions.filter((item: any) => item.direction === "OUTFLOW"), (item: any) => item.amount);
    const grossMarginPct = inflowRealized > 0 ? Math.max(0, Math.min(100, Number((((inflowRealized - outflowRealized) / inflowRealized) * 100).toFixed(1)))) : 38;
    const automationBase = transactions.length + statementLines.length || 1;
    const automatedEvents = transactions.filter((item: any) => item.source !== "MANUAL").length + statementLines.filter((item: any) => item.matchStatus === "MATCHED").length;
    const automationRatePct = Math.max(12, Math.min(100, Number(((automatedEvents / automationBase) * 100).toFixed(1))));
    const collectionsEfficiencyPct = receivables.length > 0
      ? Math.max(20, Math.min(100, Number(((this.sumAmount(receivables.filter((item: any) => item.status === "PAID"), (item: any) => item.amount) / Math.max(this.sumAmount(receivables, (item: any) => item.amount), 1)) * 100).toFixed(1))))
      : 84;
    const latestClose = closePeriods[0];
    const latestCashSnapshot = cashPositionSnapshots[0];
    const pendingProcurement = procurementRequests.filter((item: any) => ["SUBMITTED", "APPROVAL_PENDING"].includes(String(item.status))).length;
    const unmatchedVendorDocs = vendorDocuments.filter((item: any) => item.captureStatus !== "REVIEWED").length;
    const issuedPos = purchaseOrders.filter((item: any) => ["APPROVED", "ISSUED", "PARTIALLY_RECEIVED"].includes(String(item.status))).length;
    const pendingExpenseReports = expenseReports.filter((item: any) => ["SUBMITTED", "APPROVAL_PENDING"].includes(String(item.status))).length;
    const syncIssues = erpConnections.filter((item: any) => item.status === "ERROR").length;
    const openTreasuryTransfers = treasuryTransfers.filter((item: any) => ["PLANNED", "IN_TRANSIT"].includes(String(item.status))).length;
    const activeAnomalies = anomalyInsights.filter((item: any) => !item.resolvedAt).length;
    const activeTravelRequests = travelRequests.filter((item: any) => ["SUBMITTED", "APPROVAL_PENDING", "APPROVED", "BOOKED"].includes(String(item.status))).length;
    const unsettledTravelAdvances = travelAdvances.filter((item: any) => item.status !== "SETTLED").length;
    const activeBillingPlans = billingPlans.filter((item: any) => ["ACTIVE", "PAST_DUE"].includes(String(item.status))).length;
    const overdueInvoices = invoices.filter((item: any) => item.status === "OVERDUE").length;
    const pendingRevenueSchedules = revenueSchedules.filter((item: any) => item.status !== "COMPLETED").length;
    const openRecoveryCases = recoveryCases.filter((item: any) => !["RECOVERED", "LOST"].includes(String(item.status))).length;
    const pendingCloseEvidences = closeEvidences.filter((item: any) => item.status !== "VERIFIED").length;
    const activeGlobalEntities = globalEntities.filter((item: any) => item.status === "ACTIVE").length;
    const activeCountryPolicies = countryPolicies.filter((item: any) => item.status === "ACTIVE").length;
    const activePlanScenarios = planScenarios.filter((item: any) => item.status === "ACTIVE").length;
    const activePlaybooks = copilotPlaybooks.filter((item: any) => ["ACTIVE", "RUNNING"].includes(String(item.status))).length;
    const activeRevenueConnectors = revenueConnectors.filter((item: any) => ["ACTIVE", "SYNCING"].includes(String(item.status))).length;
    const draftVendorKyc = vendorKycReviews.filter((item: any) => item.status !== "APPROVED").length;
    const activeVendorContracts = vendorContracts.filter((item: any) => ["ACTIVE", "SIGNED"].includes(String(item.status))).length;
    const activeBenchmarks = vendorBenchmarks.filter((item: any) => item.status !== "CLOSED").length;
    const activeWarehouseConnections = warehouseConnections.filter((item: any) => ["ACTIVE", "SYNCING"].includes(String(item.status))).length;
    const activeMetricSnapshots = metricSnapshots.length;
    const activeRevenueCohorts = revenueCohorts.length;
    const activeUnitBenchmarks = unitBenchmarks.length;
    const activeSsoConfigs = ssoConfigs.filter((item: any) => ["ACTIVE", "TESTING"].includes(String(item.status))).length;
    const activeScimProvisions = scimProvisions.filter((item: any) => ["ACTIVE", "SYNCING"].includes(String(item.status))).length;
    const activeRetentionPolicies = retentionPolicies.filter((item: any) => item.status === "ACTIVE").length;
    const pendingAuditExports = auditExports.filter((item: any) => ["PENDING", "RUNNING"].includes(String(item.status))).length;
    const highSodPolicies = segregationPolicies.filter((item: any) => String(item.severity) === "HIGH").length;
    const pendingApprovalEvidences = approvalEvidences.filter((item: any) => item.status !== "VERIFIED").length;
    const activeBillingPlanVersions = billingPlanVersions.filter((item: any) => !item.retiredAt).length;
    const activeCustomerCredits = customerCreditBalances.filter((item: any) => this.number(item.availableBalance) > 0).length;
    const activeRateCards = rateCards.filter((item: any) => item.isActive).length;
    const pendingInvoiceRetries = invoiceRetryAttempts.filter((item: any) => !["SUCCESS", "CANCELLED"].includes(String(item.status).toUpperCase())).length;
    const activeWorkforcePlans = workforcePlans.length;
    const activeScenarioMerges = scenarioMerges.filter((item: any) => !["MERGED", "DONE", "COMPLETED"].includes(String(item.mergeStatus).toUpperCase())).length;
    const openVarianceExplanations = varianceExplanations.filter((item: any) => String(item.status).toUpperCase() !== "CLOSED").length;
    const activePlanningCollaborations = planningCollaborations.filter((item: any) => String(item.status).toUpperCase() !== "ARCHIVED").length;
    const openProcurementSignals = procurementSignals.filter((item: any) => String(item.status).toUpperCase() !== "CLOSED").length;
    const criticalProcurementSignals = procurementSignals.filter((item: any) => ["HIGH", "CRITICAL"].includes(String(item.severity).toUpperCase())).length;
    const activeCopilotRuns = copilotRuns.filter((item: any) => ["RUNNING", "SUCCESS", "COMPLETED"].includes(String(item.status).toUpperCase())).length;
    const openCopilotCases = copilotCases.filter((item: any) => !["RESOLVED", "CLOSED", "DONE"].includes(String(item.status).toUpperCase())).length;
    const activeDunningPolicies = dunningPolicies.filter((item: any) => item.isActive !== false).length;
    const lifecycleEventsCount = invoiceLifecycleEvents.length;
    const activeBillingPortals = customerBillingPortals.filter((item: any) => item.isActive !== false).length;
    const openProcurementInvestigations = procurementInvestigations.filter((item: any) => !["CLOSED", "DONE", "RESOLVED"].includes(String(item.status).toUpperCase())).length;
    const activeOcrLineItems = ocrLineItems.length;
    const activeVendorScorecards = vendorScorecards.length;
    const activePlanningCycles = planningCycles.filter((item: any) => !["CLOSED", "ARCHIVED"].includes(String(item.status).toUpperCase())).length;
    const activeHeadcountLines = headcountPlanLines.length;
    const activeScenarioComparisons = scenarioComparisons.length;
    const activeFxExposures = fxExposures.filter((item: any) => !["HEDGED", "CLOSED"].includes(String(item.status).toUpperCase())).length;
    const activeIntercompanySettlements = intercompanySettlements.filter((item: any) => !["SETTLED", "COMPLETED"].includes(String(item.status).toUpperCase())).length;
    const activeTaxRegistrations = taxRegistrations.filter((item: any) => !["INACTIVE", "EXPIRED"].includes(String(item.status).toUpperCase())).length;
    const activeComplianceRuns = complianceRuns.filter((item: any) => ["RUNNING", "COMPLETED", "SUCCESS"].includes(String(item.status).toUpperCase())).length;
    const openControlExceptions = controlExceptions.filter((item: any) => !["RESOLVED", "CLOSED"].includes(String(item.status).toUpperCase())).length;
    const activeCopilotRules = copilotRules.filter((item: any) => String(item.status).toUpperCase() === "ACTIVE").length;
    const queuedCopilotActions = copilotActions.filter((item: any) => ["QUEUED", "READY"].includes(String(item.status).toUpperCase())).length;
    const activeApprovalGuardrails = approvalGuardrails.filter((item: any) => String(item.status).toUpperCase() === "ACTIVE").length;
    const activeCollectionAutomations = collectionAutomations.filter((item: any) => String(item.status).toUpperCase() === "ACTIVE").length;
    const pendingCashRebalances = cashRebalanceInstructions.filter((item: any) => !["EXECUTED", "CANCELLED"].includes(String(item.status).toUpperCase())).length;
    const activeUsageSnapshots = customerUsageSnapshots.length;
    const activePaymentSessions = invoicePaymentSessions.filter((item: any) => ["OPEN", "PENDING"].includes(String(item.status).toUpperCase())).length;
    const appliedCreditApplications = billingCreditApplications.length;
    const activeRetrySegmentPolicies = retrySegmentPolicies.filter((item: any) => String(item.status).toUpperCase() === "ACTIVE").length;
    const activeFxAutomationRuns = fxAutomationRuns.filter((item: any) => ["PENDING", "COMPLETED", "RUNNING"].includes(String(item.status).toUpperCase())).length;
    const activeLocalPayoutBatches = localPayoutBatches.filter((item: any) => !["COMPLETED", "CANCELLED"].includes(String(item.status).toUpperCase())).length;
    const openSettlementLines = intercompanySettlementLines.filter((item: any) => !["SETTLED", "CLOSED", "COMPLETED"].includes(String(item.status).toUpperCase())).length;
    const activeTaxRules = taxRules.filter((item: any) => String(item.status).toUpperCase() === "ACTIVE").length;
    const activeEntityBalances = consolidationEntityBalances.length;
    const activeSodEnforcements = segregationEnforcements.filter((item: any) => String(item.status).toUpperCase() === "ACTIVE").length;
    const generatedEvidencePacks = evidencePacks.filter((item: any) => ["GENERATED", "READY"].includes(String(item.status).toUpperCase())).length;
    const completedRetentionExecutions = retentionExecutions.filter((item: any) => String(item.status).toUpperCase() === "COMPLETED").length;
    const generatedAuditPackages = auditPackages.filter((item: any) => ["GENERATED", "READY"].includes(String(item.status).toUpperCase())).length;
    const openOcrMatchResults = ocrMatchResults.filter((item: any) => String(item.status).toUpperCase() !== "CLOSED").length;
    const activeFraudRuns = fraudDetectionRuns.filter((item: any) => ["COMPLETED", "RUNNING"].includes(String(item.status).toUpperCase())).length;
    const activeVendorDynamicScores = vendorDynamicScores.length;
    const openNegotiationOpportunities = negotiationOpportunities.filter((item: any) => String(item.status).toUpperCase() !== "CLOSED").length;
    const draftInvoices = invoices.filter((item: any) => ["DRAFT", "OPEN", "OVERDUE"].includes(String(item.status))).length;
    const pendingPayouts = localPayouts.filter((item: any) => !["PAID", "COMPLETED"].includes(String(item.status))).length;
    const pendingReimbursements = internationalReimbursements.filter((item: any) => !["PAID", "COMPLETED"].includes(String(item.status))).length;
    const openIntercompany = intercompanyTransfers.filter((item: any) => !["SETTLED", "COMPLETED"].includes(String(item.status))).length;
    const pendingVendorDocs = vendorDocuments.filter((item: any) => item.captureStatus !== "REVIEWED").length;
    const activeTravelBookings = travelBookings.filter((item: any) => ["RESERVED", "BOOKED", "TICKETED"].includes(String(item.status))).length;
    const requiredChecklistCount = latestClose?.checklistItems?.filter((item: any) => item.isRequired).length || 0;
    const completedChecklistCount = latestClose?.checklistItems?.filter((item: any) => item.completedAt).length || 0;
    const closeReadinessPct = requiredChecklistCount > 0 ? Number(((completedChecklistCount / requiredChecklistCount) * 100).toFixed(1)) : Math.max(35, Math.min(96, 78 - approvalBacklog * 4));
    const touchlessRatePct = Math.max(10, Math.min(100, Number((((statementLines.filter((item: any) => item.matchStatus === "MATCHED").length + transactions.filter((item: any) => item.source !== "MANUAL").length) / Math.max(statementLines.length + transactions.length, 1)) * 100).toFixed(1))));
    const runwayMonths = outflows30d > 0 ? Number((cashBalance / outflows30d).toFixed(1)) : 24;

    const branchSnapshots = (branches.length ? branches : [{ id: "hq", name: "Matriz", companyId }]).map((branch: any) => {
      const branchPayables = payables.filter((item: any) => item.branchId === branch.id);
      const branchReceivables = receivables.filter((item: any) => item.branchId === branch.id);
      const branchTransactions = transactions.filter((item: any) => item.branchId === branch.id);
      const branchCash =
        this.sumAmount(bankAccounts.filter((item: any) => item.branchId === branch.id), (item: any) => item.currentBalance) +
        this.sumAmount(branchTransactions.filter((item: any) => item.direction === "INFLOW"), (item: any) => item.amount) -
        this.sumAmount(branchTransactions.filter((item: any) => item.direction === "OUTFLOW"), (item: any) => item.amount);
      const branchRevenue = this.sumAmount(branchTransactions.filter((item: any) => item.direction === "INFLOW"), (item: any) => item.amount);
      const branchExpense = this.sumAmount(branchTransactions.filter((item: any) => item.direction === "OUTFLOW"), (item: any) => item.amount);
      const marginPct = branchRevenue > 0 ? Math.max(0, Math.min(100, Number((((branchRevenue - branchExpense) / branchRevenue) * 100).toFixed(1)))) : grossMarginPct;
      const receivablesRiskPct = branchReceivables.length > 0 ? Number((((this.sumAmount(branchReceivables.filter((item: any) => new Date(item.dueAt) < today), (item: any) => item.outstandingAmount)) / Math.max(this.sumAmount(branchReceivables, (item: any) => item.outstandingAmount), 1)) * 100).toFixed(1)) : 0;
      const approvalQueue = approvalRequests.filter((item: any) => item.branchId === branch.id && item.status === "PENDING").length;
      const branchForecast = forecasts.filter((item: any) => item.branchId === branch.id).slice(0, 1)[0];
      const forecastDeltaPct = branchForecast ? Number((((this.number(branchForecast.projectedClosingCash) - branchCash) / Math.max(Math.abs(branchCash), 1)) * 100).toFixed(1)) : 0;
      const collectionsPct = branchReceivables.length > 0 ? Math.max(0, Math.min(100, Number(((this.sumAmount(branchReceivables.filter((item: any) => item.status === "PAID"), (item: any) => item.amount) / Math.max(this.sumAmount(branchReceivables, (item: any) => item.amount), 1)) * 100).toFixed(1)))) : collectionsEfficiencyPct;
      const status = receivablesRiskPct >= 24 || forecastDeltaPct <= -8 ? "critical" : receivablesRiskPct >= 16 || forecastDeltaPct < 0 ? "watch" : "strong";
      return {
        id: branch.id,
        name: branch.name,
        cashContribution: Number(branchCash.toFixed(2)),
        marginPct,
        receivablesRiskPct,
        approvalQueue,
        forecastDeltaPct,
        collectionsPct,
        status,
      };
    });

    const worstBranch = [...branchSnapshots].sort((a, b) => a.forecastDeltaPct - b.forecastDeltaPct)[0];
    const highestRiskBranch = [...branchSnapshots].sort((a, b) => b.receivablesRiskPct - a.receivablesRiskPct)[0];
    const branchHealthScore = Math.max(35, Math.min(99, Math.round((grossMarginPct + automationRatePct + collectionsEfficiencyPct + closeReadinessPct) / 4)));
    const exceptionInbox = [
      ...(activeAnomalies > 0
        ? [{
            id: "anomaly-exception",
            type: "anomaly",
            title: `${activeAnomalies} anomalia(s) financeira(s) ativa(s)`,
            severity: "critical",
            owner: "CFO Copilot",
            detail: "Desvios relevantes pedem investigação guiada e possível bloqueio de aprovação.",
          }]
        : []),
      ...(overdueInvoices > 0
        ? [{
            id: "collection-exception",
            type: "collections",
            title: `${overdueInvoices} invoice(s) vencida(s)`,
            severity: "warning",
            owner: "Revenue Ops",
            detail: "Recuperação e cobrança automática assistida precisam ser disparadas.",
          }]
        : []),
      ...(pendingVendorDocs > 0
        ? [{
            id: "ocr-exception",
            type: "ocr",
            title: `${pendingVendorDocs} documento(s) aguardando revisão OCR`,
            severity: "warning",
            owner: "Procurement AI",
            detail: "Existe risco de mismatch, line-item inconsistente ou overbilling.",
          }]
        : []),
      ...(pendingApprovalEvidences > 0
        ? [{
            id: "approval-exception",
            type: "compliance",
            title: `${pendingApprovalEvidences} evidência(s) de aprovação pendente(s)`,
            severity: "critical",
            owner: "Finance Security",
            detail: "A trilha de aprovação ainda não está pronta para auditoria enterprise.",
          }]
        : []),
    ];

    const financeWorkspaces = [
      {
        id: "cfo-autopilot",
        title: "CFO Autopilot",
        subtitle: "Exceções, investigações guiadas e playbooks por clique",
        primaryMetric: `${activePlaybooks} playbook(s)`,
        secondaryMetric: `${exceptionInbox.length} exceção(ões)`,
        status: exceptionInbox.length > 0 ? "active" : "ready",
      },
      {
        id: "revenue-ops",
        title: "Revenue Ops",
        subtitle: "Usage billing, subledger, dunning e conectores",
        primaryMetric: `${activeBillingPlans} planos`,
        secondaryMetric: `${activeRevenueConnectors} conectores • ${activeBillingPlanVersions} versões`,
        status: overdueInvoices > 0 ? "attention" : "ready",
      },
      {
        id: "travel-spend",
        title: "Travel & Spend",
        subtitle: "Experiência do colaborador, reembolso e contexto automático",
        primaryMetric: `${activeTravelRequests} viagens`,
        secondaryMetric: `${pendingExpenseReports} despesas`,
        status: unsettledTravelAdvances > 0 ? "attention" : "ready",
      },
      {
        id: "vendor-governance",
        title: "Vendor Governance",
        subtitle: "KYC, contratos, benchmarks e portal de fornecedor",
        primaryMetric: `${draftVendorKyc} KYC`,
        secondaryMetric: `${activeVendorContracts} contratos`,
        status: activeBenchmarks > 0 ? "active" : "ready",
      },
      {
        id: "treasury-global",
        title: "Treasury & Global",
        subtitle: "Liquidez, FX, payouts, intercompany e consolidação",
        primaryMetric: `${pendingPayouts + pendingReimbursements} payout(s)`,
        secondaryMetric: `${openIntercompany} intercompany`,
        status: pendingPayouts + pendingReimbursements > 0 ? "attention" : "ready",
      },
      {
        id: "data-bi",
        title: "Data Platform & BI",
        subtitle: "Snapshots, cohorts, warehouse e benchmark entre unidades",
        primaryMetric: `${activeMetricSnapshots} snapshot(s)`,
        secondaryMetric: `${activeRevenueCohorts} cohort(s) • ${activeWorkforcePlans} workforce`,
        status: activeWarehouseConnections > 0 ? "active" : "ready",
      },
      {
        id: "compliance-hub",
        title: "Compliance Hub",
        subtitle: "SSO, SCIM, retenção, audit export e SoD",
        primaryMetric: `${activeSsoConfigs} SSO`,
        secondaryMetric: `${pendingAuditExports} export(s)`,
        status: highSodPolicies > 0 || pendingApprovalEvidences > 0 ? "attention" : "ready",
      },
      {
        id: "procurement-intel",
        title: "Procurement Intelligence",
        subtitle: "OCR, mismatch investigation, fraud e 3-way match",
        primaryMetric: `${pendingProcurement} intake(s)`,
        secondaryMetric: `${pendingVendorDocs} OCR pendente(s)`,
        status: pendingVendorDocs > 0 ? "active" : "ready",
      },
    ];

    const autopilotPanel = {
      exceptionInbox,
      copilotRuns: activeCopilotRuns,
      openCases: openCopilotCases,
      rules: activeCopilotRules,
      queuedActions: queuedCopilotActions,
      approvalGuardrails: activeApprovalGuardrails,
      collectionAutomations: activeCollectionAutomations,
      cashRebalances: pendingCashRebalances,
      guidedInvestigations: copilotInsights.slice(0, 4).map((item: any) => ({
        id: item.id,
        title: item.title,
        summary: item.summary,
        actionLabel: item.actionLabel || "Investigar",
        riskLevel: item.riskLevel || "MEDIUM",
      })),
      suggestedApprovals: approvalRequests
        .filter((item: any) => item.status === "PENDING")
        .slice(0, 4)
        .map((item: any) => ({
          id: item.id,
          title: item.title,
          amount: this.number(item.amount),
          owner: item.requestedByName || "Finance Team",
          rationale: "Pronto para decisão baseada em política, evidência e risco.",
        })),
      suggestedNegotiations: vendorBenchmarks.slice(0, 4).map((item: any) => ({
        id: item.id,
        title: item.benchmarkType || "Benchmark de spend",
        vendorId: item.vendorId,
        savingsPotential: this.number(item.savingsPotential),
        status: item.status,
      })),
      collectionsQueue: [...recoveryCases, ...invoiceRetryAttempts].slice(0, 4).map((item: any, index: number) => ({
        id: item.id,
        status: item.status,
        reason: item.reason || item.notes || "Recovery pendente",
        attempts: item.attemptCount ?? item.attemptNumber ?? index + 1,
      })),
      playbooks: copilotPlaybooks.slice(0, 4).map((item: any) => ({
        id: item.id,
        title: item.title,
        status: item.status,
        triggerType: item.triggerType,
      })),
    };

    const revenuePanel = {
      usageMeters: usageMeters.length,
      usageEvents: usageEvents.length,
      activePlans: activeBillingPlans,
      draftInvoices,
      overdueInvoices,
      subledgerEntries: revenueSubledgerEntries.length,
      connectors: activeRevenueConnectors,
      smartNotesCoverage: invoices.filter((item: any) => Boolean(item.smartNotes)).length,
      billingPlanVersions: activeBillingPlanVersions,
      customerCredits: activeCustomerCredits,
      rateCards: activeRateCards,
      retryAttempts: pendingInvoiceRetries,
      dunningPolicies: activeDunningPolicies,
      lifecycleEvents: lifecycleEventsCount,
      billingPortals: activeBillingPortals,
      usageSnapshots: activeUsageSnapshots,
      paymentSessions: activePaymentSessions,
      creditApplications: appliedCreditApplications,
      retryPolicies: activeRetrySegmentPolicies,
    };

    const employeeExperience = {
      travelPolicies: travelPolicies.length,
      activeTrips: activeTravelRequests,
      activeBookings: activeTravelBookings,
      unsettledAdvances: unsettledTravelAdvances,
      expenseReports: expenseReports.length,
      pendingExpenseReports,
      corporateCards: corporateCards.length,
      assistantMoments: [
        "Explicar política de viagem em linguagem natural",
        "Sugerir categoria e centro de custo automaticamente",
        "Montar contexto do gasto com base no fluxo e na viagem",
      ],
    };

    const dataPlatform = {
      warehouseConnections: warehouseConnections.length,
      metricSnapshots: activeMetricSnapshots,
      revenueCohorts: activeRevenueCohorts,
      unitBenchmarks: activeUnitBenchmarks,
      scenarioCount: planScenarios.length,
      driverCount: planDrivers.length,
      workforcePlans: activeWorkforcePlans,
      scenarioMerges: activeScenarioMerges,
      openVarianceExplanations,
      collaborationThreads: activePlanningCollaborations,
      planningCycles: activePlanningCycles,
      headcountLines: activeHeadcountLines,
      scenarioComparisons: activeScenarioComparisons,
    };

    const globalPanel = {
      globalEntities: activeGlobalEntities,
      countryPolicies: activeCountryPolicies,
      fxExposures: activeFxExposures,
      intercompanySettlements: activeIntercompanySettlements,
      taxRegistrations: activeTaxRegistrations,
      pendingPayouts,
      pendingReimbursements,
      fxAutomationRuns: activeFxAutomationRuns,
      payoutBatches: activeLocalPayoutBatches,
      settlementLines: openSettlementLines,
      taxRules: activeTaxRules,
      entityBalances: activeEntityBalances,
    };

    const compliancePanel = {
      sso: activeSsoConfigs,
      scim: activeScimProvisions,
      retentionPolicies: activeRetentionPolicies,
      auditExports: pendingAuditExports,
      segregationPolicies: segregationPolicies.length,
      highSeveritySod: highSodPolicies,
      pendingApprovalEvidences,
      complianceRuns: activeComplianceRuns,
      controlExceptions: openControlExceptions,
      sodEnforcements: activeSodEnforcements,
      evidencePacks: generatedEvidencePacks,
      retentionExecutions: completedRetentionExecutions,
      auditPackages: generatedAuditPackages,
    };

    const procurementIntelligence = {
      vendorDocsPending: pendingVendorDocs,
      procurementQueue: pendingProcurement,
      purchaseOrders: purchaseOrders.length,
      mismatchSignals: Math.max(0, pendingVendorDocs - issuedPos) + openProcurementSignals,
      fraudSignals: activeAnomalies + criticalProcurementSignals,
      overbillingWatch: activeBenchmarks + openProcurementSignals,
      openSignals: openProcurementSignals,
      investigations: openProcurementInvestigations,
      ocrLineItems: activeOcrLineItems,
      vendorScorecards: activeVendorScorecards,
      matchResults: openOcrMatchResults,
      fraudRuns: activeFraudRuns,
      dynamicScores: activeVendorDynamicScores,
      negotiationOpportunities: openNegotiationOpportunities,
    };

    return {
      context: {
        viewer: {
          id: actor.id || "",
          role: actor.role || "FINANCE",
          name: actor.name || null,
          companyId: actor.companyId || null,
          branchId: actor.branchId || null,
          departmentId: actor.departmentId || null,
        },
        company,
        branches,
        departments,
        users,
      },
      overview: {
        asOf: new Date().toISOString(),
        currency: "BRL",
        cashBalance: Number(cashBalance.toFixed(2)),
        projectedCash30d: Number(projectedCash30d.toFixed(2)),
        inflows30d: Number(inflows30d.toFixed(2)),
        outflows30d: Number(outflows30d.toFixed(2)),
        overdueReceivables: Number(overdueReceivables.toFixed(2)),
        payablesNext7d: Number(payablesNext7d.toFixed(2)),
        approvalBacklog,
        grossMarginPct,
        automationRatePct,
        collectionsEfficiencyPct,
        closeReadinessPct,
        touchlessRatePct,
        runwayMonths: Number(Math.max(0.5, runwayMonths).toFixed(1)),
        branchHealthScore,
      },
      branchSnapshots,
      workspaces: financeWorkspaces,
      autopilot: autopilotPanel,
      revenuePanel,
      employeeExperience,
      dataPlatform,
      globalPanel,
      compliancePanel,
      procurementIntelligence,
      alerts: [
        { id: "cash-forecast", severity: projectedCash30d < cashBalance ? "warning" : "info", title: "Pressão de caixa nos próximos 30 dias", description: projectedCash30d < cashBalance ? "A saída prevista está comprimindo a posição líquida." : "A projeção está positiva, mas depende da disciplina financeira.", action: "Repriorizar pagamentos críticos e acelerar recebimentos de maior ticket." },
        { id: "receivables-risk", severity: overdueReceivables > inflows30d * 0.18 ? "critical" : "warning", title: "Recebíveis em atraso pressionando a liquidez", description: `${highestRiskBranch?.name ?? "A operação"} concentra hoje o maior risco de inadimplência.`, action: "Disparar régua de cobrança, reminders e escalonamento automático." },
        { id: "branch-variance", severity: worstBranch?.forecastDeltaPct < -8 ? "critical" : "info", title: "Desvio relevante entre unidades", description: `${worstBranch?.name ?? "Uma unidade"} está abaixo do esperado na comparação entre posição real e forecast.`, action: "Abrir revisão por filial com margem, AR, aprovações e posição de caixa." },
        { id: "touchless-rate", severity: touchlessRatePct < 55 ? "info" : "warning", title: "Touchless finance abaixo do potencial", description: "Há espaço claro para conciliação, aprovação e cobrança operarem por exceção.", action: "Ativar políticas, conciliação assistida e roteamento financeiro automatizado." },
        { id: "procurement-backlog", severity: pendingProcurement > 0 ? "warning" : "info", title: "Procurement e PO exigindo coordenação", description: `${pendingProcurement} solicitação(ões) de compra e ${issuedPos} PO(s) em ciclo aberto.`, action: "Acelerar intake-to-pay, 3-way match e recebimento para evitar vazamento operacional." },
        { id: "sync-governance", severity: syncIssues > 0 || activeAnomalies > 0 ? "critical" : "info", title: "Integrações e anomalias pedindo intervenção", description: `${syncIssues} conexão(ões) ERP com erro e ${activeAnomalies} insight(s) de anomalia ativo(s).`, action: "Rodar sync contábil, revisar exceções e recalibrar o copiloto financeiro." },
        { id: "travel-governance", severity: activeTravelRequests > 0 || unsettledTravelAdvances > 0 ? "warning" : "info", title: "Travel & expense exigindo fechamento operacional", description: `${activeTravelRequests} viagem(ns) ativas e ${unsettledTravelAdvances} adiantamento(s) ainda não conciliados.`, action: "Aprovar fluxos, fechar reservas e reconciliar gastos pós-viagem automaticamente." },
        { id: "revenue-engine", severity: overdueInvoices > 0 || openRecoveryCases > 0 ? "critical" : "info", title: "Revenue engine pedindo ação em cobrança", description: `${activeBillingPlans} billing plan(s), ${overdueInvoices} invoice(s) vencida(s) e ${openRecoveryCases} caso(s) de recovery em aberto.`, action: "Reforçar billing recorrente, recovery e recognition para proteger a receita líquida." },
        { id: "global-control", severity: activeGlobalEntities > 0 && activeCountryPolicies === 0 ? "warning" : "info", title: "Governança global e políticas por país", description: `${activeGlobalEntities} entidade(s) global(is), ${activeCountryPolicies} política(s) ativa(s) e ${taxProfiles.length} perfil(is) tributário(s).`, action: "Conectar país, moeda, tributo e reembolso internacional na mesma malha financeira." },
        { id: "close-evidence", severity: pendingCloseEvidences > 0 ? "warning" : "info", title: "Fechamento profundo ainda requer evidências", description: `${pendingCloseEvidences} evidência(s) pendente(s) e ${pendingRevenueSchedules} agenda(s) de reconhecimento em andamento.`, action: "Validar evidências, accruals e variações antes do lock contábil." },
        { id: "connector-health", severity: activeRevenueConnectors === 0 ? "warning" : "info", title: "Conectores de receita e data ainda pedem ativação", description: `${activeRevenueConnectors} conector(es) de receita e ${activeWarehouseConnections} conexão(ões) de warehouse ativas.`, action: "Ligar billing externo, subledger e camada de BI versionado." },
        { id: "vendor-governance", severity: draftVendorKyc > 0 || activeBenchmarks > 0 ? "warning" : "info", title: "Vendor management exigindo KYC e benchmark", description: `${draftVendorKyc} review(s) KYC pendente(s), ${activeVendorContracts} contrato(s) e ${activeBenchmarks} benchmark(s) abertos.`, action: "Fechar onboarding, renovações e benchmark de spend com evidência e score." },
        { id: "enterprise-security", severity: activeSsoConfigs === 0 || pendingApprovalEvidences > 0 ? "critical" : "info", title: "Controles enterprise ainda precisam amadurecer", description: `${activeSsoConfigs} SSO, ${activeScimProvisions} SCIM, ${pendingAuditExports} export(s) e ${pendingApprovalEvidences} evidência(s) pendente(s).`, action: "Ativar SSO/SCIM, retenção, SoD e evidências completas de aprovação." },
      ],
      tasks: [
        { id: "payables-run", kind: "approval", title: "Liberar agenda de pagamentos críticos", owner: "Tesouraria", dueLabel: "Hoje, 17:00", amount: Number(payablesNext7d.toFixed(2)), status: approvalBacklog > 0 ? "active" : "done" },
        { id: "collections-run", kind: "collection", title: "Atacar recebíveis em atraso com maior ticket", owner: "Cobrança", dueLabel: "Hoje, 15:00", amount: Number(overdueReceivables.toFixed(2)), status: overdueReceivables > 0 ? "active" : "done" },
        { id: "reconciliation-run", kind: "reconciliation", title: "Conciliar extratos e linhas pendentes", owner: "Controladoria", dueLabel: "Hoje, 18:30", status: statementLines.some((item: any) => item.matchStatus !== "MATCHED") ? "queue" : "done" },
        { id: "close-run", kind: "close", title: "Executar checklist de fechamento e travar período", owner: "CFO Office", dueLabel: "Em 2 dias", status: closeReadinessPct >= 90 ? "done" : "queue" },
        { id: "cash-run", kind: "cash", title: "Atualizar posição diária de caixa consolidada", owner: "AI Treasury Copilot", dueLabel: "Agora", amount: Number(cashBalance.toFixed(2)), status: "active" },
        { id: "procurement-run", kind: "approval", title: "Converter intake aprovado em PO e 3-way match", owner: "Procurement Ops", dueLabel: "Hoje, 14:00", status: pendingProcurement > 0 ? "active" : "done" },
        { id: "expense-run", kind: "close", title: "Fechar reembolsos, cartões e despesas em aberto", owner: "Spend Control", dueLabel: "Amanhã, 11:00", amount: Number(this.sumAmount(expenseReports, (item: any) => item.totalAmount).toFixed(2)), status: pendingExpenseReports > 0 ? "queue" : "done" },
        { id: "travel-run", kind: "approval", title: "Aprovar viagens, adiantamentos e reconciliação pós-retorno", owner: "Travel Desk", dueLabel: "Hoje, 16:00", amount: Number(this.sumAmount(travelAdvances, (item: any) => item.amount).toFixed(2)), status: activeTravelRequests > 0 || unsettledTravelAdvances > 0 ? "active" : "done" },
        { id: "revenue-run", kind: "collection", title: "Executar billing, cobrança e recovery de churn financeiro", owner: "Revenue Ops", dueLabel: "Hoje, 13:00", amount: Number(this.sumAmount(invoices.filter((item: any) => item.status === "OVERDUE"), (item: any) => item.netAmount).toFixed(2)), status: overdueInvoices > 0 || openRecoveryCases > 0 ? "active" : "done" },
        { id: "planning-run", kind: "cash", title: "Reforecast rolling por driver, headcount e cenário", owner: "FP&A", dueLabel: "Em 1 dia", status: planDrivers.length > 0 || planScenarios.length > 0 ? "queue" : "done" },
        { id: "copilot-run", kind: "close", title: "Executar playbooks do CFO copiloto por unidade", owner: "CFO Copilot", dueLabel: "Agora", status: activePlaybooks > 0 || copilotInsights.length > 0 ? "active" : "queue" },
        { id: "connector-run", kind: "reconciliation", title: "Sincronizar conectores de receita, FX e warehouse", owner: "Data Finance Ops", dueLabel: "Hoje, 12:00", status: activeRevenueConnectors > 0 || activeWarehouseConnections > 0 ? "queue" : "active" },
        { id: "vendor-run", kind: "approval", title: "Fechar KYC, contratos e benchmark de fornecedores críticos", owner: "Vendor Office", dueLabel: "Amanhã, 10:00", status: draftVendorKyc > 0 || activeBenchmarks > 0 ? "active" : "done" },
        { id: "security-run", kind: "close", title: "Validar SSO, SCIM, SoD e evidências de aprovação", owner: "Finance Security", dueLabel: "Hoje, 19:00", status: pendingApprovalEvidences > 0 || activeSsoConfigs === 0 ? "active" : "done" },
      ],
      aiPriorities: [
        { id: "liquidity", label: "Liquidez", title: "Blindar o caixa de curto prazo", description: "Use agenda financeira, cobrança ativa e reforecast semanal para reduzir surpresa de liquidez.", impact: `Defesa potencial de ${Math.round(overdueReceivables * 0.22).toLocaleString("pt-BR")} em antecipação de entradas.` },
        { id: "multi-unit", label: "Multi-unidade", title: branches.length > 1 ? "Comparar performance financeira entre unidades" : "Preparar visão consolidada da operação", description: branches.length > 1 ? `${worstBranch?.name ?? "Uma unidade"} precisa de leitura comparativa de caixa, margem, AR e aprovação.` : "Mesmo centralizado, o financeiro já deve nascer pronto para matriz, filiais e franquias.", impact: "Cria base para cockpit de CFO, benchmark interno e políticas por unidade." },
        { id: "touchless", label: "Automação", title: "Expandir touchless finance", description: "Conciliação, reminders, aprovações e triagem de exceções devem ser primeira classe no Finance OS.", impact: `Touchless atual em ${touchlessRatePct}%, com espaço real para subir para ${Math.min(100, Math.round(touchlessRatePct + 16))}%.` },
        { id: "spend", label: "Spend", title: "Ativar procurement, cards e OCR como camada operacional", description: "Compras, despesas, cartões corporativos e documentos extraídos precisam operar no mesmo fluxo do fechamento.", impact: `${pendingProcurement} intake(s), ${corporateCards.length} cartão(ões), ${unmatchedVendorDocs} documento(s) OCR pendente(s).` },
        { id: "travel", label: "Travel", title: "Fechar viagem corporativa com política e reconciliação automática", description: "Travel requests, reservas, adiantamentos e reembolso internacional precisam operar dentro da mesma governança.", impact: `${travelPolicies.length} política(s), ${travelRequests.length} viagem(ns), ${unsettledTravelAdvances} adiantamento(s) aberto(s).` },
        { id: "revenue", label: "Revenue", title: "Blindar MRR, cobrança e revenue recognition", description: "Billing recorrente, invoice inteligente, tax e recovery devem alimentar o cockpit do CFO.", impact: `${billingPlans.length} plano(s), ${revenueSchedules.length} schedule(s), ${openRecoveryCases} recovery case(s).` },
        { id: "planning", label: "FP&A", title: "Planejar por driver, cenário e headcount", description: "A malha de FP&A precisa sair do budget estático e ir para rolling forecast assistido por driver.", impact: `${planDrivers.length} driver(s), ${planScenarios.length} cenário(s), ${activePlanScenarios} ativo(s).` },
        { id: "copilot", label: "Agentic", title: "Operar o financeiro com copiloto do CFO", description: "Investigar desvios, sugerir cortes e executar playbooks precisa estar embutido no Finance OS.", impact: `${copilotInsights.length} insight(s) e ${activePlaybooks} playbook(s) em estado operacional.` },
        { id: "connectors", label: "Connectors", title: "Plugar receita externa, subledger e BI executivo", description: "Conectores de revenue, FX e warehouse devem alimentar uma camada de métrica histórica versionada.", impact: `${revenueConnectors.length} connector(s), ${revenueSubledgerEntries.length} entry(s), ${activeMetricSnapshots} snapshot(s).` },
        { id: "global-enterprise", label: "Global", title: "Executar global finance enterprise", description: "FX, payouts, intercompany, consolidação e trilha tributária precisam rodar como malha única.", impact: `${fxRates.length} FX rate(s), ${localPayouts.length} payout(s), ${intercompanyTransfers.length} intercompany transfer(s).` },
        { id: "compliance", label: "Compliance", title: "Fortalecer controles enterprise e approval evidence", description: "SSO, SCIM, retenção, audit export e segregation of duties precisam estar no centro do Finance OS.", impact: `${ssoConfigs.length} SSO, ${scimProvisions.length} SCIM, ${approvalEvidences.length} evidence(s).` },
      ],
      innovations: [
        { id: "policy-engine", title: "Policy Engine financeiro", description: "Aprovações por valor, unidade, centro de custo e papel do aprovador.", maturity: `${approvalRequests.length} solicitação(ões) mapeadas`, outcome: "Reduz gargalo manual e fortalece governança enterprise." },
        { id: "banking-layer", title: "Open finance e conciliação assistida", description: "Bank feeds, importação de extrato, match automático e confirmação de PIX.", maturity: `${statementLines.length} linha(s) de extrato processadas`, outcome: "Leva o módulo além do ERP tradicional e aproxima de um command center financeiro." },
        { id: "close-layer", title: "Touchless close", description: "Checklist de fechamento, snapshots e monitoramento contínuo de prontidão.", maturity: `${closeReadinessPct}% de prontidão`, outcome: "Acelera o fechamento e reduz retrabalho operacional." },
        { id: "treasury-layer", title: "Treasury command layer", description: "Posição diária de caixa, liquidez por horizonte e risco de concentração.", maturity: `${bankAccounts.length} conta(s) bancária(s) ligadas`, outcome: "Transforma o financeiro em centro de comando, não apenas registro." },
        { id: "procure-to-pay", title: "Procure-to-pay enterprise", description: "Solicitação de compra, PO, recebimento e 3-way match no mesmo sistema.", maturity: `${procurementRequests.length} request(s), ${purchaseOrders.length} PO(s), ${vendors.length} fornecedor(es)`, outcome: "Coloca o financeiro na linha de frente do gasto antes da despesa acontecer." },
        { id: "spend-stack", title: "Spend management com cards e reembolso", description: "Despesas, cartões corporativos e reembolso operando sob política e OCR.", maturity: `${expenseReports.length} relatório(s), ${corporateCards.length} card(s), ${vendorDocuments.length} doc(s)`, outcome: "Aproxima o produto de uma pilha moderna de spend management." },
        { id: "erp-sync", title: "ERP / GL sync", description: "Conectores e jobs de sincronização para contabilidade e ERP externo.", maturity: `${erpConnections.length} conexão(ões), ${syncIssues} com erro`, outcome: "Cria ponte para NetSuite, Xero, QuickBooks, Sage e Dynamics." },
        { id: "ai-finance", title: "AI anomaly and cash intelligence", description: "Detecção de anomalias, previsões de caixa e leitura ativa do copiloto CFO.", maturity: `${activeAnomalies} anomalia(s), ${cashForecastRuns.length} run(s), ${latestCashSnapshot ? "snapshot ativo" : "sem snapshot"}`, outcome: "Transforma o financeiro em sistema de decisão, não só registro." },
        { id: "travel-stack", title: "Travel & expense nativo", description: "Política, reserva, adiantamento, aprovação e reconciliação pós-viagem.", maturity: `${travelPolicies.length} política(s), ${travelBookings.length} reserva(s), ${travelAdvances.length} adiantamento(s)`, outcome: "Leva o spend management para um patamar enterprise e global." },
        { id: "revenue-stack", title: "Revenue engine", description: "Billing recorrente, invoices inteligentes, tax, recognition e churn recovery.", maturity: `${billingPlans.length} billing plan(s), ${invoices.length} invoice(s), ${taxProfiles.length} tax profile(s)`, outcome: "Aproxima o produto de uma camada moderna de receita, não só de gasto." },
        { id: "global-finance", title: "Global finance mesh", description: "Entidades globais, políticas por país, multi-moeda e reembolso internacional.", maturity: `${globalEntities.length} entidade(s), ${countryPolicies.length} política(s), ${taxProfiles.length} regime(s)`, outcome: "Prepara o financeiro para operação cross-border real." },
        { id: "fpa-stack", title: "FP&A driver-based", description: "Drivers, cenários e planejamento de headcount acoplados ao caixa.", maturity: `${planDrivers.length} driver(s) e ${planScenarios.length} cenário(s)`, outcome: "Transforma orçamento em motor contínuo de decisão executiva." },
        { id: "cfo-copilot", title: "Agentic CFO copilot", description: "Insights, recomendações e playbooks financeiros executáveis.", maturity: `${copilotInsights.length} insight(s), ${copilotPlaybooks.length} playbook(s)`, outcome: "Move o módulo para o território de AI finance operacional." },
        { id: "revenue-connectors", title: "Revenue connectors + subledger", description: "Usage billing, conectores externos e subledger de receita unificados.", maturity: `${usageMeters.length} meter(s), ${usageEvents.length} event(s), ${revenueConnectors.length} connector(s)`, outcome: "Leva o engine de receita para mais perto do padrão Stripe-grade." },
        { id: "vendor-enterprise", title: "Vendor management profundo", description: "Portal real, KYC, contratos, benchmark e score do fornecedor.", maturity: `${vendorKycReviews.length} KYC review(s), ${vendorContracts.length} contrato(s), ${vendorBenchmarks.length} benchmark(s)`, outcome: "Transforma compras em governança de fornecedor e não só operação de gasto." },
        { id: "bi-warehouse", title: "Data platform + BI executivo", description: "Warehouse, snapshots versionados, cohorts e benchmark entre unidades.", maturity: `${warehouseConnections.length} warehouse(s), ${metricSnapshots.length} snapshot(s), ${revenueCohorts.length} cohort(s)`, outcome: "Empurra o financeiro para o território de intelligence platform." },
        { id: "security-enterprise", title: "Security & compliance enterprise", description: "SSO, SCIM, retention, audit export, SoD e approval evidence completa.", maturity: `${ssoConfigs.length} SSO, ${retentionPolicies.length} retention policy(s), ${segregationPolicies.length} SoD policy(s)`, outcome: "Prepara o produto para enterprise real e auditoria pesada." },
      ],
      scenarios: [
        { id: "collections-sprint", title: "Sprint de cobrança", description: "Escalar régua de cobrança e priorizar contratos de maior ticket.", cashDelta: Math.round(overdueReceivables * 0.24), marginDelta: 1.4, backlogDelta: -2, automationDelta: 6 },
        { id: "cost-discipline", title: "Disciplina de custos", description: "Segurar aprovações de menor impacto e revisar despesas variáveis.", cashDelta: Math.round(outflows30d * 0.08), marginDelta: 2.1, backlogDelta: 3, automationDelta: 2 },
        { id: "expansion-mode", title: "Expandir operação", description: "Acelerar capacidade operacional e comercial para crescer receita.", cashDelta: -Math.round(outflows30d * 0.11), marginDelta: -1.8, backlogDelta: 5, automationDelta: -3 },
        { id: "touchless-push", title: "Push de automação", description: "Ativar conciliação, aprovação e roteamento financeiro por exceção.", cashDelta: Math.round(outflows30d * 0.04), marginDelta: 1.1, backlogDelta: -5, automationDelta: 12 },
        { id: "travel-global", title: "Travel global policy", description: "Padronizar política, adiantamento e reconciliação internacional.", cashDelta: -Math.round(this.sumAmount(travelAdvances, (item: any) => item.amount) * 0.1), marginDelta: 0.6, backlogDelta: -3, automationDelta: 7 },
        { id: "revenue-lock", title: "Revenue lock-in", description: "Melhorar recovery, recognition e cobrança recorrente.", cashDelta: Math.round(this.sumAmount(invoices.filter((item: any) => item.status === "OVERDUE"), (item: any) => item.netAmount) * 0.18), marginDelta: 1.9, backlogDelta: -4, automationDelta: 5 },
        { id: "planning-reset", title: "Driver-based planning reset", description: "Replanejar headcount, receita e spend por cenário.", cashDelta: Math.round((this.sumAmount(planScenarios, (item: any) => item.revenuePlan) - this.sumAmount(planScenarios, (item: any) => item.spendPlan)) * 0.05), marginDelta: 1.3, backlogDelta: 1, automationDelta: 4 },
        { id: "global-liquidity", title: "Global liquidity rebalance", description: "Usar FX, payouts e intercompany para reequilibrar liquidez por entidade.", cashDelta: Math.round(this.sumAmount(localPayouts, (item: any) => item.amount) * -0.06 + this.sumAmount(intercompanyTransfers, (item: any) => item.amount) * 0.08), marginDelta: 0.8, backlogDelta: -2, automationDelta: 6 },
        { id: "vendor-renegotiation", title: "Vendor renegotiation wave", description: "Aplicar benchmark de spend e rever contratos críticos.", cashDelta: Math.round(this.sumAmount(vendorBenchmarks, (item: any) => item.savingsPotential) * 0.35), marginDelta: 1.1, backlogDelta: -1, automationDelta: 3 },
        { id: "compliance-hardening", title: "Enterprise compliance hardening", description: "Ativar SSO/SCIM, retenção e approval evidence em todas as frentes.", cashDelta: -Math.round(Math.max(approvalBacklog, pendingApprovalEvidences) * 120), marginDelta: 0.4, backlogDelta: -6, automationDelta: 8 },
      ],
    };
  }
}
