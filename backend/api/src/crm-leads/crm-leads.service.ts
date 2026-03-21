import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { CrmLeadStatus, Prisma, Role } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import { CreateCrmLeadDto } from "./dto/create-crm-lead.dto";
import { UpdateCrmLeadDto } from "./dto/update-crm-lead.dto";
import { CreateCrmLeadTaskDto } from "./dto/create-crm-lead-task.dto";
import { CreateCrmLeadActivityDto } from "./dto/create-crm-lead-activity.dto";
import { CreateCrmSavedViewDto } from "./dto/create-crm-saved-view.dto";
import { ListCrmLeadsQueryDto } from "./dto/list-crm-leads.query.dto";
import { AutomationEngine } from "../automation/automation.engine";
import { PermissionsCacheService } from "../common/permissions/permissions-cache.service";

type CrmActor = {
  id: string;
  role: Role;
  companyId?: string | null;
  branchId?: string | null;
  departmentId?: string | null;
};

const CRM_READ_OWN = "crm.read.own";
const CRM_READ_DEPARTMENT = "crm.read.department";
const CRM_READ_BRANCH = "crm.read.branch";
const CRM_READ_COMPANY = "crm.read.company";
const CRM_VALUES_READ = "crm.values.read";
const CRM_LOSS_REASONS_READ = "crm.loss_reasons.read";
const CRM_LEADS_EDIT = "crm.leads.edit";
const CRM_LEADS_STATUS = "crm.leads.status";
const CRM_LEADS_CLOSE = "crm.leads.close";
const CRM_ACTIVITIES_CREATE = "crm.activities.create";
const CRM_TASKS_CREATE = "crm.tasks.create";
const CRM_TASKS_UPDATE = "crm.tasks.update";
const CRM_BULK_UPDATE = "crm.bulk.update";
const CRM_SAVED_VIEWS_CREATE = "crm.saved_views.create";
const CRM_SAVED_VIEWS_DELETE = "crm.saved_views.delete";

@Injectable()
export class CrmLeadsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly automationEngine: AutomationEngine,
    private readonly permsCache: PermissionsCacheService,
  ) {}

  private ensureCompanyId(companyId: string) {
    const cid = String(companyId ?? "").trim();
    if (!cid) {
      throw new BadRequestException("Token sem companyId.");
    }
    return cid;
  }

  private async getPermissions(actor: CrmActor) {
    if (actor.role === Role.ADMIN_MASTER) {
      return new Set<string>([
        CRM_READ_OWN,
        CRM_READ_DEPARTMENT,
        CRM_READ_BRANCH,
        CRM_READ_COMPANY,
        CRM_VALUES_READ,
        CRM_LOSS_REASONS_READ,
        CRM_LEADS_EDIT,
        CRM_LEADS_STATUS,
        CRM_LEADS_CLOSE,
        CRM_ACTIVITIES_CREATE,
        CRM_TASKS_CREATE,
        CRM_TASKS_UPDATE,
        CRM_BULK_UPDATE,
        CRM_SAVED_VIEWS_CREATE,
        CRM_SAVED_VIEWS_DELETE,
      ]);
    }

    const companyId = this.ensureCompanyId(String(actor.companyId ?? "").trim());
      return this.permsCache.getEffectivePermissions({
      userId: actor.id,
      role: actor.role,
      companyId,
    });
  }

  private ensurePermission(perms: Set<string>, key: string, message: string) {
    if (!perms.has(key)) {
      throw new ForbiddenException(message);
    }
  }

  private buildLeadScopeWhere(actor: CrmActor, perms: Set<string>): Prisma.CrmLeadWhereInput {
    const companyId = this.ensureCompanyId(String(actor.companyId ?? "").trim());
    const userId = String(actor.id ?? "").trim();
    const branchId = String(actor.branchId ?? "").trim();
    const departmentId = String(actor.departmentId ?? "").trim();

    if (perms.has(CRM_READ_COMPANY)) {
      return { companyId };
    }

    if (perms.has(CRM_READ_BRANCH) && branchId) {
      return {
        companyId,
        OR: [{ ownerUserId: userId }, { branchId }],
      };
    }

    if (perms.has(CRM_READ_DEPARTMENT) && departmentId) {
      return {
        companyId,
        OR: [{ ownerUserId: userId }, { departmentId }],
      };
    }

    if (perms.has(CRM_READ_OWN)) {
      return {
        companyId,
        ownerUserId: userId,
      };
    }

    throw new ForbiddenException("VocÃƒÂª nÃƒÂ£o tem acesso aos leads do CRM.");
  }

  private sanitizeLead<T extends { dealValue?: unknown; lostReason?: unknown }>(
    lead: T,
    perms: Set<string>,
  ): T {
    const nextLead = { ...lead };

    if (!perms.has(CRM_VALUES_READ)) {
      nextLead.dealValue = null;
    }

    if (!perms.has(CRM_LOSS_REASONS_READ)) {
      nextLead.lostReason = null;
    }

    return nextLead;
  }

  private sanitizeActivity<T extends { type?: unknown; description?: unknown }>(
    activity: T,
    perms: Set<string>,
  ): T {
    if (
      !perms.has(CRM_LOSS_REASONS_READ) &&
      activity.type === "LEAD_LOST" &&
      typeof activity.description === "string"
    ) {
      return {
        ...activity,
        description: activity.description.replace(/ Â· Motivo:.*$/u, ""),
      };
    }

    return activity;
  }

  private normalizeStatus(status?: string | null): CrmLeadStatus | undefined {
    if (!status) return undefined;

    const raw = String(status).trim().toUpperCase();
    const allowed = Object.values(CrmLeadStatus) as string[];

    if (!allowed.includes(raw)) {
      throw new BadRequestException(
        "status invÃ¡lido. Use: " + allowed.join(", "),
      );
    }

    return raw as CrmLeadStatus;
  }

  private normalizeProbability(value?: number | null): number | undefined | null {
    if (value === undefined) return undefined;
    if (value === null) return null;

    const parsed = Number(value);
    if (!Number.isInteger(parsed) || parsed < 0 || parsed > 100) {
      throw new BadRequestException("probability deve ser um inteiro entre 0 e 100.");
    }

    return parsed;
  }

  private normalizeMoney(value?: string | number | null): Prisma.Decimal | undefined | null {
    if (value === undefined) return undefined;
    if (value === null) return null;

    const rawInput = String(value).trim();
    if (!rawInput) return null;

    let normalized = rawInput;

    const brazilianPattern = /^-?\d{1,3}(\.\d{3})*,\d+$/;
    if (brazilianPattern.test(normalized)) {
      normalized = normalized.replace(/\./g, "").replace(",", ".");
    } else {
      normalized = normalized.replace(",", ".");
    }

    try {
      return new Prisma.Decimal(normalized);
    } catch {
      throw new BadRequestException("dealValue invÃ¡lido.");
    }
  }

  private normalizeDate(value?: string | null): Date | undefined | null {
    if (value === undefined) return undefined;
    if (value === null) return null;

    const raw = String(value).trim();
    if (!raw) return null;

    const parsed = new Date(raw);
    if (Number.isNaN(parsed.getTime())) {
      throw new BadRequestException("Data invÃ¡lida.");
    }

    return parsed;
  }

  private normalizeOptionalString(value?: string | null): string | undefined | null {
    if (value === undefined) return undefined;
    if (value === null) return null;

    const trimmed = String(value).trim();
    return trimmed || null;
  }

  private normalizeSavedViewFilters(input: Record<string, unknown>): Prisma.JsonObject {
    const asString = (value: unknown) => (typeof value === "string" ? value : "");

    const filters: Prisma.JsonObject = {
      searchTerm: asString(input.searchTerm),
      statusFilter: asString(input.statusFilter) || "ALL",
      temperatureFilter: asString(input.temperatureFilter) || "ALL",
      priorityFilter: asString(input.priorityFilter) || "ALL",
      sourceFilter: asString(input.sourceFilter) || "ALL",
      ownerFilter: asString(input.ownerFilter) || "ALL",
      departmentFilter: asString(input.departmentFilter) || "ALL",
      openTasksOnly: asString(input.openTasksOnly) || "ALL",
      stalledOnly: asString(input.stalledOnly) || "ALL",
      overdueNextStepOnly: asString(input.overdueNextStepOnly) || "ALL",
      probabilityMin: asString(input.probabilityMin),
      probabilityMax: asString(input.probabilityMax),
      dealValueMin: asString(input.dealValueMin),
      dealValueMax: asString(input.dealValueMax),
      createdAtFrom: asString(input.createdAtFrom),
      createdAtTo: asString(input.createdAtTo),
      expectedCloseDateFrom: asString(input.expectedCloseDateFrom),
      expectedCloseDateTo: asString(input.expectedCloseDateTo),
    };

    return filters;
  }

  private buildLeadListWhere(
    actor: CrmActor,
    perms: Set<string>,
    query: ListCrmLeadsQueryDto,
  ): Record<string, unknown> {
    const scopedWhere = this.buildLeadScopeWhere(actor, perms);
    const andFilters: Array<Record<string, unknown>> = [scopedWhere as Record<string, unknown>];

    if (query.q) {
      andFilters.push({
        OR: [
          { name: { contains: query.q, mode: "insensitive" } },
          { email: { contains: query.q, mode: "insensitive" } },
          { phone: { contains: query.q, mode: "insensitive" } },
          { companyName: { contains: query.q, mode: "insensitive" } },
        ],
      });
    }

    if (query.status) {
      andFilters.push({ status: query.status });
    }

    if (query.ownerUserId) {
      andFilters.push({ ownerUserId: query.ownerUserId });
    }

    if (query.branchId) {
      andFilters.push({ branchId: query.branchId });
    }

    if (query.departmentId) {
      andFilters.push({ departmentId: query.departmentId });
    }

    if (query.source) {
      andFilters.push({ source: query.source });
    }

    if (query.priority) {
      andFilters.push({ priority: query.priority });
    }

    if (query.accountId) {
      andFilters.push({ accountId: query.accountId });
    }

    if (query.contactId) {
      andFilters.push({ contactId: query.contactId });
    }

    if (query.forecastCategory) {
      andFilters.push({ forecastCategory: query.forecastCategory as any });
    }

    return andFilters.length === 1
      ? (scopedWhere as Record<string, unknown>)
      : { AND: andFilters };
  }

  private buildLeadListOrderBy(
    query: ListCrmLeadsQueryDto,
  ): Array<Record<string, unknown>> {
    const sortBy = query.sortBy ?? "updatedAt";
    const sortOrder = query.sortOrder ?? "desc";

    return [{ [sortBy]: sortOrder }, { createdAt: "desc" }];
  }

  private leadInclude() {
    return {
      ownerUser: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      branch: {
        select: {
          id: true,
          name: true,
        },
      },
      department: {
        select: {
          id: true,
          name: true,
        },
      },
      account: {
        select: {
          id: true,
          name: true,
        },
      },
      contact: {
        select: {
          id: true,
          fullName: true,
          email: true,
        },
      },
      tasks: {
        where: {
          completedAt: null,
        },
        select: {
          id: true,
        },
      },
    } as const;
  }

  private taskInclude() {
    return {
      assignedUser: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    } as const;
  }

  private async ensureLeadExists(id: string, actor: CrmActor, perms?: Set<string>) {
    const effectivePerms = perms ?? (await this.getPermissions(actor));
    const scopedWhere = this.buildLeadScopeWhere(actor, effectivePerms);

    const lead = await (this.prisma as any).crmLead.findFirst({
      where: {
        AND: [scopedWhere, { id }],
      },
      select: {
        id: true,
        name: true,
        companyId: true,
        ownerUserId: true,
        branchId: true,
        departmentId: true,
        accountId: true,
        contactId: true,
        status: true,
      },
    });

    if (!lead) {
      throw new NotFoundException("Lead nÃ£o encontrado");
    }

    return lead;
  }

  private async validateReferences(input: {
    companyId: string;
    ownerUserId?: string | null;
    branchId?: string | null;
    departmentId?: string | null;
    accountId?: string | null;
    contactId?: string | null;
  }) {
    const companyId = input.companyId;
    const ownerUserId = input.ownerUserId ?? null;
    const branchId = input.branchId ?? null;
    const departmentId = input.departmentId ?? null;
    const accountId = input.accountId ?? null;
    const contactId = input.contactId ?? null;

    if (ownerUserId) {
      const owner = await this.prisma.user.findFirst({
        where: {
          id: ownerUserId,
          companyId,
        },
        select: { id: true },
      });

      if (!owner) {
        throw new BadRequestException("ownerUserId invÃ¡lido para esta empresa.");
      }
    }

    if (branchId) {
      const branch = await this.prisma.branch.findFirst({
        where: {
          id: branchId,
          companyId,
        },
        select: { id: true },
      });

      if (!branch) {
        throw new BadRequestException("branchId invÃ¡lido para esta empresa.");
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
        throw new BadRequestException("departmentId invÃ¡lido para esta empresa.");
      }
    }

    if (accountId) {
      const account = await (this.prisma as any).crmAccount.findFirst({
        where: {
          id: accountId,
          companyId,
        },
        select: { id: true },
      });

      if (!account) {
        throw new BadRequestException("accountId inválido para esta empresa.");
      }
    }

    if (contactId) {
      const contact = await (this.prisma as any).crmContact.findFirst({
        where: {
          id: contactId,
          companyId,
          ...(accountId ? { accountId } : {}),
        },
        select: { id: true },
      });

      if (!contact) {
        throw new BadRequestException("contactId inválido para esta empresa.");
      }
    }
  }

  private normalizeForecastCategory(value?: string | null) {
    if (value === undefined) return undefined;
    if (value === null) return null;

    const raw = String(value).trim().toUpperCase();
    const allowed = ["PIPELINE", "BEST_CASE", "COMMIT", "CLOSED"];
    if (!raw) return null;
    if (!allowed.includes(raw)) {
      throw new BadRequestException(
        "forecastCategory inválido. Use: " + allowed.join(", "),
      );
    }
    return raw;
  }

  private async ensureAccountAndContact(input: {
    companyId: string;
    ownerUserId?: string | null;
    branchId?: string | null;
    departmentId?: string | null;
    accountId?: string | null;
    contactId?: string | null;
    companyName?: string | null;
    name?: string | null;
    email?: string | null;
    phone?: string | null;
    whatsapp?: string | null;
    jobTitle?: string | null;
  }) {
    let accountId = input.accountId ?? null;
    let contactId = input.contactId ?? null;

    if (!accountId && input.companyName) {
      const existingAccount = await (this.prisma as any).crmAccount.findFirst({
        where: {
          companyId: input.companyId,
          name: input.companyName,
        },
        select: { id: true },
      });

      if (existingAccount) {
        accountId = existingAccount.id;
      } else {
        const createdAccount = await (this.prisma as any).crmAccount.create({
          data: {
            companyId: input.companyId,
            name: input.companyName,
            ownerUserId: input.ownerUserId ?? null,
            branchId: input.branchId ?? null,
            departmentId: input.departmentId ?? null,
          },
          select: { id: true },
        });
        accountId = createdAccount.id;
      }
    }

    if (!contactId && accountId && (input.email || input.phone || input.whatsapp || input.name)) {
      const contactOr = [
        input.email ? { email: input.email } : undefined,
        input.phone ? { phone: input.phone } : undefined,
        input.whatsapp ? { whatsapp: input.whatsapp } : undefined,
      ].filter(Boolean);

      const existingContact = await (this.prisma as any).crmContact.findFirst({
        where: {
          companyId: input.companyId,
          accountId,
          ...(contactOr.length > 0 ? { OR: contactOr } : {}),
        },
        select: { id: true },
      });

      if (existingContact) {
        contactId = existingContact.id;
      } else {
        const fullName = String(input.name ?? "").trim() || "Contato CRM";
        const createdContact = await (this.prisma as any).crmContact.create({
          data: {
            companyId: input.companyId,
            accountId,
            firstName: fullName.split(" ")[0] || fullName,
            lastName: fullName.split(" ").slice(1).join(" ") || null,
            fullName,
            email: input.email ?? null,
            phone: input.phone ?? null,
            whatsapp: input.whatsapp ?? null,
            jobTitle: input.jobTitle ?? null,
            ownerUserId: input.ownerUserId ?? null,
            branchId: input.branchId ?? null,
            departmentId: input.departmentId ?? null,
          },
          select: { id: true },
        });
        contactId = createdContact.id;
      }
    }

    return { accountId, contactId };
  }

  private async applyRoutingIfNeeded(input: {
    companyId: string;
    leadId: string;
    source?: string | null;
    branchId?: string | null;
    departmentId?: string | null;
    ownerUserId?: string | null;
  }) {
    if (input.ownerUserId) return;

    const rules = await (this.prisma as any).crmRoutingRule.findMany({
      where: {
        companyId: input.companyId,
        isActive: true,
      },
      orderBy: [{ priority: "desc" }, { updatedAt: "desc" }],
    });

    const matchedRule = rules.find((rule: any) => {
      if (rule.source && rule.source !== input.source) return false;
      if (rule.branchId && rule.branchId !== input.branchId) return false;
      if (rule.departmentId && rule.departmentId !== input.departmentId) return false;
      return true;
    });

    if (!matchedRule) return;

    const ownerPool = Array.isArray(matchedRule.ownerPoolJson) ? matchedRule.ownerPoolJson : [];
    const nextOwnerId =
      ownerPool.find((candidate: unknown) => typeof candidate === "string" && candidate) || null;

    if (!nextOwnerId) return;

    await this.prisma.crmLead.update({
      where: { id: input.leadId },
      data: { ownerUserId: nextOwnerId },
    });

    await (this.prisma as any).crmRoutingExecution.create({
      data: {
        companyId: input.companyId,
        routingRuleId: matchedRule.id,
        leadId: input.leadId,
        assignedUserId: nextOwnerId,
        status: "APPLIED",
        reason: "Lead distribuído automaticamente por regra de roteamento.",
      },
    });

    await (this.prisma as any).crmRoutingRule.update({
      where: { id: matchedRule.id },
      data: { lastAssignedUserId: nextOwnerId },
    });
  }

  private async createActivity(input: {
    companyId: string;
    leadId: string;
    userId?: string | null;
    type: string;
    description: string;
  }) {
    const now = new Date();
    const shouldUpdateContact = ["CALL", "MESSAGE", "MEETING"].includes(
      String(input.type ?? "").trim().toUpperCase(),
    );

    const [activity] = await this.prisma.$transaction([
      this.prisma.crmLeadActivity.create({
        data: {
          companyId: input.companyId,
          leadId: input.leadId,
          userId: input.userId ?? null,
          type: input.type,
          description: input.description,
        },
      }),
      this.prisma.crmLead.update({
        where: { id: input.leadId },
        data: {
          lastActivityAt: now,
          ...(shouldUpdateContact ? { lastContactAt: now } : {}),
        },
      }),
    ]);

    return activity;
  }

  async create(input: {
    actor: CrmActor;
    body: CreateCrmLeadDto;
  }) {
    const companyId = this.ensureCompanyId(String(input.actor.companyId ?? "").trim());
    const perms = await this.getPermissions(input.actor);
    this.ensurePermission(perms, CRM_LEADS_EDIT, "VocÃƒÂª nÃƒÂ£o pode criar ou editar leads do CRM.");
    const body = input.body;

    const name = String(body?.name ?? "").trim();
    if (!name) {
      throw new BadRequestException("name Ã© obrigatÃ³rio");
    }

    const ownerUserId = body?.ownerUserId
      ? String(body.ownerUserId).trim()
      : null;

    const branchId = body?.branchId ? String(body.branchId).trim() : null;
    const departmentId = body?.departmentId
      ? String(body.departmentId).trim()
      : null;
    const accountId = body?.accountId ? String(body.accountId).trim() : null;
    const contactId = body?.contactId ? String(body.contactId).trim() : null;

    await this.validateReferences({
      companyId,
      ownerUserId,
      branchId,
      departmentId,
      accountId,
      contactId,
    });

    const accountAndContact = await this.ensureAccountAndContact({
      companyId,
      ownerUserId,
      branchId,
      departmentId,
      accountId,
      contactId,
      companyName: body?.companyName?.trim() || null,
      name,
      email: body?.email?.trim().toLowerCase() || null,
      phone: body?.phone?.trim() || null,
      whatsapp: this.normalizeOptionalString(body?.whatsapp) ?? null,
      jobTitle: this.normalizeOptionalString(body?.jobTitle) ?? null,
    });

    const status = this.normalizeStatus(body?.status) ?? CrmLeadStatus.NEW;
    const lostReason = this.normalizeOptionalString(body?.lostReason);
    if (status === CrmLeadStatus.LOST && !lostReason) {
      throw new BadRequestException("lostReason Ã© obrigatÃ³rio quando status = LOST.");
    }

    const dealValue = this.normalizeMoney(body?.dealValue);
    const probability =
      this.normalizeProbability(body?.probability) ??
      (status === CrmLeadStatus.NEW
        ? 10
        : status === CrmLeadStatus.CONTACTED
          ? 25
          : status === CrmLeadStatus.PROPOSAL
            ? 50
            : status === CrmLeadStatus.NEGOTIATION
              ? 75
              : status === CrmLeadStatus.WON
                ? 100
                : 0);

    const lead = await (this.prisma as any).crmLead.create({
      data: {
        name,
        phone: body?.phone?.trim() || null,
        whatsapp: this.normalizeOptionalString(body?.whatsapp) ?? null,
        email: body?.email?.trim().toLowerCase() || null,
        companyName: body?.companyName?.trim() || null,
        jobTitle: this.normalizeOptionalString(body?.jobTitle) ?? null,
        website: this.normalizeOptionalString(body?.website) ?? null,
        city: this.normalizeOptionalString(body?.city) ?? null,
        state: this.normalizeOptionalString(body?.state) ?? null,
        industry: this.normalizeOptionalString(body?.industry) ?? null,
        companySize: this.normalizeOptionalString(body?.companySize) ?? null,
        notes: body?.notes?.trim() || null,
        status,
        companyId,
        ownerUserId,
        branchId,
        departmentId,
        accountId: accountAndContact.accountId,
        contactId: accountAndContact.contactId,
        dealValue,
        currency: this.normalizeOptionalString(body?.currency) ?? "BRL",
        probability,
        source: this.normalizeOptionalString(body?.source) ?? null,
        sourceDetail: this.normalizeOptionalString(body?.sourceDetail) ?? null,
        priority: this.normalizeOptionalString(body?.priority) ?? null,
        competitor: this.normalizeOptionalString(body?.competitor) ?? null,
        wonReason: this.normalizeOptionalString(body?.wonReason) ?? null,
        forecastCategory: this.normalizeForecastCategory(body?.forecastCategory) ?? "PIPELINE",
        nextStep: this.normalizeOptionalString(body?.nextStep) ?? null,
        nextStepDueAt: this.normalizeDate(body?.nextStepDueAt) ?? null,
        nextMeetingAt: this.normalizeDate(body?.nextMeetingAt) ?? null,
        expectedCloseDate: this.normalizeDate(body?.expectedCloseDate) ?? null,
        lostReason: lostReason ?? null,
        statusChangedAt: new Date(),
        ...(status === CrmLeadStatus.WON ? { wonAt: new Date(), lostAt: null } : {}),
        ...(status === CrmLeadStatus.LOST ? { lostAt: new Date(), wonAt: null } : {}),
      },
      include: this.leadInclude(),
    });

    await this.createActivity({
      companyId,
      leadId: lead.id,
      userId: input.actor.id,
      type: "LEAD_CREATED",
      description: `Lead criado: ${lead.name}`,
    });

    await this.automationEngine.handleEvent({
      companyId,
      module: "CRM",
      triggerType: "LEAD_CREATED",
      payload: {
        leadId: lead.id,
        leadName: lead.name,
        ownerUserId: lead.ownerUserId ?? null,
        branchId: lead.branchId ?? null,
        departmentId: lead.departmentId ?? null,
        status: lead.status,
      },
    });

    await this.applyRoutingIfNeeded({
      companyId,
      leadId: lead.id,
      source: lead.source ?? null,
      branchId: lead.branchId ?? null,
      departmentId: lead.departmentId ?? null,
      ownerUserId: body?.ownerUserId ? lead.ownerUserId ?? null : null,
    });

    const finalLead = await (this.prisma as any).crmLead.findUnique({
      where: { id: lead.id },
      include: this.leadInclude(),
    });

    return this.sanitizeLead(finalLead ?? lead, perms);
  }

  async findAll(
    actor: CrmActor,
    query: ListCrmLeadsQueryDto,
  ) {
    const perms = await this.getPermissions(actor);
    const where = this.buildLeadListWhere(actor, perms, query);
    const page = query.page ?? 1;
    const pageSize = query.pageSize ?? 20;
    const skip = (page - 1) * pageSize;

    const [items, total] = await this.prisma.$transaction([
      (this.prisma as any).crmLead.findMany({
        where,
        orderBy: this.buildLeadListOrderBy(query),
        skip,
        take: pageSize,
        include: this.leadInclude(),
      }),
      (this.prisma as any).crmLead.count({ where }),
    ]);

    return {
      items: items.map((lead) => this.sanitizeLead(lead, perms)),
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  async findOneDetailed(id: string, actor: CrmActor) {
    const perms = await this.getPermissions(actor);
    const cid = this.ensureCompanyId(String(actor.companyId ?? "").trim());

    const lead = await (this.prisma as any).crmLead.findFirst({
      where: {
        AND: [this.buildLeadScopeWhere(actor, perms), { id, companyId: cid }],
      },
      include: {
        ownerUser: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        branch: {
          select: {
            id: true,
            name: true,
          },
        },
        department: {
          select: {
            id: true,
            name: true,
          },
        },
        account: {
          select: {
            id: true,
            name: true,
            industry: true,
            website: true,
          },
        },
        contact: {
          select: {
            id: true,
            fullName: true,
            email: true,
            phone: true,
            whatsapp: true,
            jobTitle: true,
          },
        },
        activities: {
          orderBy: [{ createdAt: "desc" }],
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
        tasks: {
          orderBy: [{ dueAt: "asc" }, { createdAt: "desc" }],
          include: this.taskInclude(),
        },
        sequenceEnrollments: {
          orderBy: [{ createdAt: "desc" }],
          take: 10,
        },
        emailMessages: {
          orderBy: [{ createdAt: "desc" }],
          take: 10,
        },
        quotes: {
          orderBy: [{ createdAt: "desc" }],
          take: 10,
        },
        documents: {
          orderBy: [{ createdAt: "desc" }],
          take: 10,
        },
        conversationInsights: {
          orderBy: [{ createdAt: "desc" }],
          take: 10,
        },
      },
    });

    if (!lead) {
      throw new NotFoundException("Lead nÃ£o encontrado");
    }

    const sanitizedLead = this.sanitizeLead(lead, perms);
    const sanitizedActivities = lead.activities.map((activity) =>
      this.sanitizeActivity(activity, perms),
    );

    return {
      ...sanitizedLead,
      activities: sanitizedActivities,
      summary: {
        activitiesCount: lead.activities.length,
        openTasksCount: lead.tasks.filter((task) => !task.completedAt).length,
        completedTasksCount: lead.tasks.filter((task) => !!task.completedAt).length,
        emailMessagesCount: lead.emailMessages.length,
        sequenceEnrollmentsCount: lead.sequenceEnrollments.length,
        quotesCount: lead.quotes.length,
        documentsCount: lead.documents.length,
        conversationInsightsCount: lead.conversationInsights.length,
      },
    };
  }

  async findSavedViews(actor: CrmActor) {
    const perms = await this.getPermissions(actor);
    this.buildLeadScopeWhere(actor, perms);
    const cid = this.ensureCompanyId(String(actor.companyId ?? "").trim());

    return this.prisma.crmSavedView.findMany({
      where: {
        companyId: cid,
        userId: actor.id,
      },
      orderBy: [{ createdAt: "desc" }],
    });
  }

  async createSavedView(input: {
    actor: CrmActor;
    body: CreateCrmSavedViewDto;
  }) {
    const perms = await this.getPermissions(input.actor);
    this.ensurePermission(perms, CRM_SAVED_VIEWS_CREATE, "VocÃƒÂª nÃƒÂ£o pode salvar visualizaÃƒÂ§ÃƒÂµes do CRM.");
    const cid = this.ensureCompanyId(String(input.actor.companyId ?? "").trim());
    const name = String(input.body?.name ?? "").trim();

    if (!name) {
      throw new BadRequestException("name Ã© obrigatÃ³rio");
    }

    return this.prisma.crmSavedView.create({
      data: {
        companyId: cid,
        userId: input.actor.id,
        name,
        filtersJson: this.normalizeSavedViewFilters(input.body.filters ?? {}),
      },
    });
  }

  async removeSavedView(viewId: string, actor: CrmActor) {
    const perms = await this.getPermissions(actor);
    this.ensurePermission(perms, CRM_SAVED_VIEWS_DELETE, "VocÃƒÂª nÃƒÂ£o pode excluir visualizaÃƒÂ§ÃƒÂµes do CRM.");
    const cid = this.ensureCompanyId(String(actor.companyId ?? "").trim());

    const existing = await this.prisma.crmSavedView.findFirst({
      where: {
        id: viewId,
        companyId: cid,
        userId: actor.id,
      },
      select: { id: true },
    });

    if (!existing) {
      throw new NotFoundException("VisualizaÃ§Ã£o salva nÃ£o encontrada");
    }

    await this.prisma.crmSavedView.delete({
      where: { id: existing.id },
    });

    return { ok: true };
  }

  async findActivities(id: string, actor: CrmActor) {
    const perms = await this.getPermissions(actor);
    const cid = this.ensureCompanyId(String(actor.companyId ?? "").trim());

    await this.ensureLeadExists(id, actor, perms);

    const activities = await this.prisma.crmLeadActivity.findMany({
      where: {
        leadId: id,
        companyId: cid,
      },
      orderBy: { createdAt: "desc" },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return activities.map((activity) => this.sanitizeActivity(activity, perms));
  }

  async createManualActivity(input: {
    leadId: string;
    actor: CrmActor;
    body: CreateCrmLeadActivityDto;
  }) {
    const perms = await this.getPermissions(input.actor);
    this.ensurePermission(perms, CRM_ACTIVITIES_CREATE, "VocÃª nÃ£o pode registrar atividades no CRM.");
    const cid = this.ensureCompanyId(String(input.actor.companyId ?? "").trim());
    await this.ensureLeadExists(input.leadId, input.actor, perms);

    const allowed = ["NOTE", "CALL", "MESSAGE", "MEETING"];
    const type = String(input.body?.type ?? "").trim().toUpperCase();

    if (!allowed.includes(type)) {
      throw new BadRequestException("type invÃ¡lido. Use: NOTE, CALL, MESSAGE, MEETING");
    }

    const description = String(input.body?.description ?? "").trim();
    if (!description) {
      throw new BadRequestException("description Ã© obrigatÃ³rio");
    }

    return this.createActivity({
      companyId: cid,
      leadId: input.leadId,
      userId: input.actor.id,
      type,
      description,
    });
  }

  async findTasks(leadId: string, actor: CrmActor) {
    const perms = await this.getPermissions(actor);
    const cid = this.ensureCompanyId(String(actor.companyId ?? "").trim());

    await this.ensureLeadExists(leadId, actor, perms);

    return this.prisma.crmLeadTask.findMany({
      where: {
        leadId,
        companyId: cid,
      },
      orderBy: [
        { completedAt: "asc" },
        { dueAt: "asc" },
        { createdAt: "desc" },
      ],
      include: this.taskInclude(),
    });
  }

  async createTask(input: {
    leadId: string;
    actor: CrmActor;
    body: CreateCrmLeadTaskDto;
  }) {
    const perms = await this.getPermissions(input.actor);
    this.ensurePermission(perms, CRM_TASKS_CREATE, "VocÃª nÃ£o pode criar tarefas no CRM.");
    const cid = this.ensureCompanyId(String(input.actor.companyId ?? "").trim());
    const lead = await this.ensureLeadExists(input.leadId, input.actor, perms);

    const title = String(input.body?.title ?? "").trim();
    if (!title) {
      throw new BadRequestException("title Ã© obrigatÃ³rio");
    }

    let assignedUserId: string | null = null;
    if (input.body.assignedUserId) {
      assignedUserId = String(input.body.assignedUserId).trim();

      const assignedUser = await this.prisma.user.findFirst({
        where: {
          id: assignedUserId,
          companyId: cid,
        },
        select: { id: true },
      });

      if (!assignedUser) {
        throw new BadRequestException("assignedUserId invÃ¡lido para esta empresa.");
      }
    }

    const task = await this.prisma.crmLeadTask.create({
      data: {
        companyId: cid,
        leadId: input.leadId,
        assignedUserId,
        title,
        description: input.body.description?.trim() || null,
        dueAt: input.body.dueAt ? new Date(input.body.dueAt) : null,
      },
      include: this.taskInclude(),
    });

    await this.createActivity({
      companyId: cid,
      leadId: input.leadId,
      userId: input.actor.id,
      type: "TASK_CREATED",
      description: `Tarefa criada: ${title}${task.dueAt ? ` (prazo: ${task.dueAt.toISOString()})` : ""}`,
    });

    await this.automationEngine.handleEvent({
      companyId: cid,
      module: "CRM",
      triggerType: "TASK_CREATED",
      payload: {
        taskId: task.id,
        leadId: input.leadId,
        leadName: lead.name,
        ownerUserId: lead.ownerUserId ?? null,
        branchId: lead.branchId ?? null,
        departmentId: lead.departmentId ?? null,
        taskTitle: task.title,
        dueAt: task.dueAt,
      },
    });

    return task;
  }

  async completeTask(taskId: string, actor: CrmActor) {
    const perms = await this.getPermissions(actor);
    this.ensurePermission(perms, CRM_TASKS_UPDATE, "Voce nao pode concluir tarefas no CRM.");
    const cid = this.ensureCompanyId(String(actor.companyId ?? "").trim());

    const task = await this.prisma.crmLeadTask.findFirst({
      where: {
        id: taskId,
        companyId: cid,
      },
      select: {
        id: true,
        leadId: true,
        title: true,
        completedAt: true,
        dueAt: true,
        lead: {
          select: {
            id: true,
            name: true,
            ownerUserId: true,
            branchId: true,
            departmentId: true,
            status: true,
          },
        },
      },
    });

    if (!task) {
      throw new NotFoundException("Tarefa nÃ£o encontrada");
    }

    await this.ensureLeadExists(task.leadId, actor, perms);

    if (task.completedAt) {
      return this.prisma.crmLeadTask.findUnique({
        where: { id: task.id },
        include: this.taskInclude(),
      });
    }

    const updatedTask = await this.prisma.crmLeadTask.update({
      where: { id: task.id },
      data: {
        completedAt: new Date(),
      },
      include: this.taskInclude(),
    });

    await this.createActivity({
      companyId: cid,
      leadId: task.leadId,
      userId: actor.id,
      type: "TASK_DONE",
      description: `Tarefa concluÃ­da: ${task.title}`,
    });

    await this.automationEngine.handleEvent({
      companyId: cid,
      module: "CRM",
      triggerType: "TASK_COMPLETED",
      payload: {
        taskId: task.id,
        leadId: task.leadId,
        leadName: task.lead?.name ?? null,
        ownerUserId: task.lead?.ownerUserId ?? null,
        branchId: task.lead?.branchId ?? null,
        departmentId: task.lead?.departmentId ?? null,
        taskTitle: task.title,
        dueAt: task.dueAt,
        completedAt: updatedTask.completedAt,
      },
    });

    return updatedTask;
  }

  async reopenTask(taskId: string, actor: CrmActor) {
    const perms = await this.getPermissions(actor);
    this.ensurePermission(perms, CRM_TASKS_UPDATE, "Voce nao pode reabrir tarefas no CRM.");
    const cid = this.ensureCompanyId(String(actor.companyId ?? "").trim());

    const task = await this.prisma.crmLeadTask.findFirst({
      where: {
        id: taskId,
        companyId: cid,
      },
      select: {
        id: true,
        leadId: true,
        title: true,
        completedAt: true,
        dueAt: true,
        lead: {
          select: {
            id: true,
            name: true,
            ownerUserId: true,
            branchId: true,
            departmentId: true,
          },
        },
      },
    });

    if (!task) {
      throw new NotFoundException("Tarefa nÃ£o encontrada");
    }

    await this.ensureLeadExists(task.leadId, actor, perms);

    if (!task.completedAt) {
      return this.prisma.crmLeadTask.findUnique({
        where: { id: task.id },
        include: this.taskInclude(),
      });
    }

    const updatedTask = await this.prisma.crmLeadTask.update({
      where: { id: task.id },
      data: {
        completedAt: null,
      },
      include: this.taskInclude(),
    });

    await this.createActivity({
      companyId: cid,
      leadId: task.leadId,
      userId: actor.id,
      type: "TASK_REOPENED",
      description: `Tarefa reaberta: ${task.title}`,
    });

    return updatedTask;
  }

  async update(
    id: string,
    actor: CrmActor,
    body: UpdateCrmLeadDto,
  ) {
    const cid = this.ensureCompanyId(String(actor.companyId ?? "").trim());
    const perms = await this.getPermissions(actor);

    const exists = await (this.prisma as any).crmLead.findFirst({
      where: {
        AND: [this.buildLeadScopeWhere(actor, perms), { id, companyId: cid }],
      },
    });

    if (!exists) {
      throw new NotFoundException("Lead nÃ£o encontrado");
    }

    const data: Record<string, any> = {};
    const activityDescriptions: Array<{ type: string; description: string }> = [];
    let statusChangedPayload:
      | {
          leadId: string;
          leadName: string;
          ownerUserId: string | null;
          branchId: string | null;
          departmentId: string | null;
          fromStatus: string;
          toStatus: string;
        }
      | null = null;

    const nextOwnerUserId =
      body.ownerUserId !== undefined
        ? this.normalizeOptionalString(body.ownerUserId)
        : exists.ownerUserId;

    const nextBranchId =
      body.branchId !== undefined
        ? this.normalizeOptionalString(body.branchId)
        : exists.branchId;

    const nextDepartmentId =
      body.departmentId !== undefined
        ? this.normalizeOptionalString(body.departmentId)
        : exists.departmentId;

    const nextAccountId =
      body.accountId !== undefined
        ? this.normalizeOptionalString(body.accountId)
        : (exists as any).accountId;

    const nextContactId =
      body.contactId !== undefined
        ? this.normalizeOptionalString(body.contactId)
        : (exists as any).contactId;

    const requestedStatus =
      body.status !== undefined ? this.normalizeStatus(body.status) : undefined;
    const statusIsChanging =
      requestedStatus !== undefined && requestedStatus !== exists.status;
    const wantsClose =
      statusIsChanging &&
      (requestedStatus === CrmLeadStatus.WON || requestedStatus === CrmLeadStatus.LOST);
    const wantsStatusChange = statusIsChanging && !wantsClose;
    const wantsEdit = [
      "name",
      "phone",
      "whatsapp",
      "email",
      "companyName",
      "jobTitle",
      "website",
      "city",
      "state",
      "industry",
      "companySize",
      "notes",
      "dealValue",
      "currency",
      "probability",
      "source",
      "sourceDetail",
      "priority",
      "competitor",
      "wonReason",
      "nextStep",
      "nextStepDueAt",
      "nextMeetingAt",
      "expectedCloseDate",
      "lostReason",
      "ownerUserId",
      "branchId",
      "departmentId",
      "accountId",
      "contactId",
      "forecastCategory",
    ].some((key) => body[key as keyof UpdateCrmLeadDto] !== undefined);

    if (wantsEdit) {
      this.ensurePermission(perms, CRM_LEADS_EDIT, "VocÃƒÂª nÃƒÂ£o pode editar leads do CRM.");
    }

    if (wantsStatusChange) {
      this.ensurePermission(perms, CRM_LEADS_STATUS, "VocÃƒÂª nÃƒÂ£o pode alterar o status do lead.");
    }

    if (wantsClose) {
      this.ensurePermission(perms, CRM_LEADS_CLOSE, "VocÃƒÂª nÃƒÂ£o pode marcar leads como ganhos ou perdidos.");
    }

    if (
      body.ownerUserId !== undefined ||
      body.branchId !== undefined ||
      body.departmentId !== undefined ||
      body.accountId !== undefined ||
      body.contactId !== undefined
    ) {
      await this.validateReferences({
        companyId: cid,
        ownerUserId: nextOwnerUserId,
        branchId: nextBranchId,
        departmentId: nextDepartmentId,
        accountId: nextAccountId,
        contactId: nextContactId,
      });
    }

    const linkedAccountAndContact = await this.ensureAccountAndContact({
      companyId: cid,
      ownerUserId: nextOwnerUserId,
      branchId: nextBranchId,
      departmentId: nextDepartmentId,
      accountId: nextAccountId,
      contactId: nextContactId,
      companyName:
        body.companyName !== undefined
          ? this.normalizeOptionalString(body.companyName)
          : exists.companyName,
      name:
        body.name !== undefined
          ? this.normalizeOptionalString(body.name)
          : exists.name,
      email:
        body.email !== undefined
          ? this.normalizeOptionalString(body.email)?.toLowerCase() ?? null
          : exists.email,
      phone:
        body.phone !== undefined ? this.normalizeOptionalString(body.phone) : exists.phone,
      whatsapp:
        body.whatsapp !== undefined
          ? this.normalizeOptionalString(body.whatsapp)
          : exists.whatsapp,
      jobTitle:
        body.jobTitle !== undefined
          ? this.normalizeOptionalString(body.jobTitle)
          : exists.jobTitle,
    });

    if (body.name !== undefined) {
      const nextValue = body.name ? String(body.name).trim() : "";
      if (!nextValue) {
        throw new BadRequestException("name nÃ£o pode ser vazio.");
      }
      if (nextValue !== exists.name) {
        data.name = nextValue;
        activityDescriptions.push({
          type: "LEAD_UPDATED",
          description: `Nome alterado para ${nextValue || "(vazio)"}`,
        });
      }
    }

    if (body.phone !== undefined) {
      const nextValue = body.phone ? String(body.phone).trim() : null;
      if (nextValue !== exists.phone) {
        data.phone = nextValue;
        activityDescriptions.push({
          type: "LEAD_UPDATED",
          description: "Telefone atualizado",
        });
      }
    }

    if (body.whatsapp !== undefined) {
      const nextValue = this.normalizeOptionalString(body.whatsapp);
      if (nextValue !== exists.whatsapp) {
        data.whatsapp = nextValue;
        activityDescriptions.push({
          type: "LEAD_UPDATED",
          description: "WhatsApp atualizado",
        });
      }
    }

    if (body.email !== undefined) {
      const nextValue = body.email ? String(body.email).trim().toLowerCase() : null;
      if (nextValue !== exists.email) {
        data.email = nextValue;
        activityDescriptions.push({
          type: "LEAD_UPDATED",
          description: "E-mail atualizado",
        });
      }
    }

    if (body.companyName !== undefined) {
      const nextValue = body.companyName
        ? String(body.companyName).trim()
        : null;
      if (nextValue !== exists.companyName) {
        data.companyName = nextValue;
        activityDescriptions.push({
          type: "LEAD_UPDATED",
          description: "Empresa atualizada",
        });
      }
    }

    if (body.jobTitle !== undefined) {
      const nextValue = this.normalizeOptionalString(body.jobTitle);
      if (nextValue !== exists.jobTitle) {
        data.jobTitle = nextValue;
        activityDescriptions.push({
          type: "LEAD_UPDATED",
          description: "Cargo do contato atualizado",
        });
      }
    }

    if (body.website !== undefined) {
      const nextValue = this.normalizeOptionalString(body.website);
      if (nextValue !== exists.website) {
        data.website = nextValue;
        activityDescriptions.push({
          type: "LEAD_UPDATED",
          description: "Website atualizado",
        });
      }
    }

    if (body.city !== undefined) {
      const nextValue = this.normalizeOptionalString(body.city);
      if (nextValue !== exists.city) {
        data.city = nextValue;
        activityDescriptions.push({
          type: "LEAD_UPDATED",
          description: "Cidade atualizada",
        });
      }
    }

    if (body.state !== undefined) {
      const nextValue = this.normalizeOptionalString(body.state);
      if (nextValue !== exists.state) {
        data.state = nextValue;
        activityDescriptions.push({
          type: "LEAD_UPDATED",
          description: "Estado atualizado",
        });
      }
    }

    if (body.industry !== undefined) {
      const nextValue = this.normalizeOptionalString(body.industry);
      if (nextValue !== exists.industry) {
        data.industry = nextValue;
        activityDescriptions.push({
          type: "LEAD_UPDATED",
          description: "Segmento atualizado",
        });
      }
    }

    if (body.companySize !== undefined) {
      const nextValue = this.normalizeOptionalString(body.companySize);
      if (nextValue !== exists.companySize) {
        data.companySize = nextValue;
        activityDescriptions.push({
          type: "LEAD_UPDATED",
          description: "Porte da empresa atualizado",
        });
      }
    }

    if (body.notes !== undefined) {
      const nextValue = body.notes ? String(body.notes).trim() : null;
      if (nextValue !== exists.notes) {
        data.notes = nextValue;
        activityDescriptions.push({
          type: "LEAD_NOTE_UPDATED",
          description: "ObservaÃ§Ãµes atualizadas",
        });
      }
    }

    if (body.dealValue !== undefined) {
      const nextValue = this.normalizeMoney(body.dealValue);
      const currentValue = exists.dealValue ? exists.dealValue.toString() : null;
      const nextComparable = nextValue ? nextValue.toString() : null;

      if (nextComparable !== currentValue) {
        data.dealValue = nextValue;
        activityDescriptions.push({
          type: "LEAD_UPDATED",
          description: "Valor estimado atualizado",
        });
      }
    }

    if (body.currency !== undefined) {
      const nextValue = this.normalizeOptionalString(body.currency) ?? "BRL";
      if (nextValue !== exists.currency) {
        data.currency = nextValue;
        activityDescriptions.push({
          type: "LEAD_UPDATED",
          description: "Moeda atualizada",
        });
      }
    }

    if (body.probability !== undefined) {
      const nextValue = this.normalizeProbability(body.probability);
      if (nextValue !== null && nextValue !== exists.probability) {
        data.probability = nextValue;
        activityDescriptions.push({
          type: "LEAD_UPDATED",
          description: `Probabilidade atualizada para ${nextValue}%`,
        });
      }
    }

    if (body.source !== undefined) {
      const nextValue = this.normalizeOptionalString(body.source);
      if (nextValue !== exists.source) {
        data.source = nextValue;
        activityDescriptions.push({
          type: "LEAD_UPDATED",
          description: "Origem atualizada",
        });
      }
    }

    if (body.sourceDetail !== undefined) {
      const nextValue = this.normalizeOptionalString(body.sourceDetail);
      if (nextValue !== exists.sourceDetail) {
        data.sourceDetail = nextValue;
        activityDescriptions.push({
          type: "LEAD_UPDATED",
          description: "Detalhe da origem atualizado",
        });
      }
    }

    if (body.priority !== undefined) {
      const nextValue = this.normalizeOptionalString(body.priority);
      if (nextValue !== exists.priority) {
        data.priority = nextValue;
        activityDescriptions.push({
          type: "LEAD_UPDATED",
          description: "Prioridade atualizada",
        });
      }
    }

    if (body.competitor !== undefined) {
      const nextValue = this.normalizeOptionalString(body.competitor);
      if (nextValue !== exists.competitor) {
        data.competitor = nextValue;
        activityDescriptions.push({
          type: "LEAD_UPDATED",
          description: "Concorrente atualizado",
        });
      }
    }

    if (body.wonReason !== undefined) {
      const nextValue = this.normalizeOptionalString(body.wonReason);
      if (nextValue !== exists.wonReason) {
        data.wonReason = nextValue;
        activityDescriptions.push({
          type: "LEAD_UPDATED",
          description: "Motivo de ganho atualizado",
        });
      }
    }

    if (body.nextStep !== undefined) {
      const nextValue = this.normalizeOptionalString(body.nextStep);
      if (nextValue !== exists.nextStep) {
        data.nextStep = nextValue;
        activityDescriptions.push({
          type: "LEAD_UPDATED",
          description: "PrÃ³ximo passo atualizado",
        });
      }
    }

    if (body.nextStepDueAt !== undefined) {
      const nextValue = this.normalizeDate(body.nextStepDueAt);
      const currentValue = exists.nextStepDueAt?.toISOString() ?? null;
      const nextComparable = nextValue?.toISOString() ?? null;

      if (nextComparable !== currentValue) {
        data.nextStepDueAt = nextValue;
        activityDescriptions.push({
          type: "LEAD_UPDATED",
          description: "Prazo do prÃ³ximo passo atualizado",
        });
      }
    }

    if (body.nextMeetingAt !== undefined) {
      const nextValue = this.normalizeDate(body.nextMeetingAt);
      const currentValue = exists.nextMeetingAt?.toISOString() ?? null;
      const nextComparable = nextValue?.toISOString() ?? null;

      if (nextComparable !== currentValue) {
        data.nextMeetingAt = nextValue;
        activityDescriptions.push({
          type: "LEAD_UPDATED",
          description: "PrÃ³xima reuniÃ£o atualizada",
        });
      }
    }

    if (body.expectedCloseDate !== undefined) {
      const nextValue = this.normalizeDate(body.expectedCloseDate);
      const currentValue = exists.expectedCloseDate?.toISOString() ?? null;
      const nextComparable = nextValue?.toISOString() ?? null;

      if (nextComparable !== currentValue) {
        data.expectedCloseDate = nextValue;
        activityDescriptions.push({
          type: "LEAD_UPDATED",
          description: "PrevisÃ£o de fechamento atualizada",
        });
      }
    }

    if (body.lostReason !== undefined) {
      const nextValue = this.normalizeOptionalString(body.lostReason);
      if (nextValue !== exists.lostReason) {
        data.lostReason = nextValue;
        activityDescriptions.push({
          type: "LEAD_UPDATED",
          description: "Motivo de perda atualizado",
        });
      }
    }

    const effectiveStatus = requestedStatus ?? exists.status;
    const effectiveLostReason =
      body.lostReason !== undefined
        ? this.normalizeOptionalString(body.lostReason)
        : exists.lostReason;

    if (effectiveStatus === CrmLeadStatus.LOST && !effectiveLostReason) {
      throw new BadRequestException("lostReason Ã© obrigatÃ³rio quando status = LOST.");
    }

    if (body.status !== undefined) {
      const nextStatus = requestedStatus;
      if (nextStatus && nextStatus !== exists.status) {
        data.status = nextStatus;
        data.statusChangedAt = new Date();

        if (nextStatus === CrmLeadStatus.WON) {
          data.wonAt = new Date();
          data.lostAt = null;
          data.lostReason = null;
        } else if (nextStatus === CrmLeadStatus.LOST) {
          data.lostAt = new Date();
          data.wonAt = null;
        } else {
          if (exists.status === CrmLeadStatus.WON) {
            data.wonAt = null;
          }
          if (exists.status === CrmLeadStatus.LOST) {
            data.lostAt = null;
          }
        }

        activityDescriptions.push({
          type: "LEAD_STATUS_CHANGED",
          description: `Status alterado de ${exists.status} para ${nextStatus}`,
        });

        if (nextStatus === CrmLeadStatus.WON) {
          activityDescriptions.push({
            type: "LEAD_WON",
            description: `Lead marcado como ganho: ${exists.name}`,
          });
        }

        if (nextStatus === CrmLeadStatus.LOST) {
          const lostReason = this.normalizeOptionalString(body.lostReason);
          activityDescriptions.push({
            type: "LEAD_LOST",
            description: lostReason
              ? `Lead marcado como perdido: ${exists.name} Â· Motivo: ${lostReason}`
              : `Lead marcado como perdido: ${exists.name}`,
          });
        }

        statusChangedPayload = {
          leadId: id,
          leadName: exists.name,
          ownerUserId: exists.ownerUserId ?? null,
          branchId: exists.branchId ?? null,
          departmentId: exists.departmentId ?? null,
          fromStatus: exists.status,
          toStatus: nextStatus,
        };
      }
    }

    if (body.ownerUserId !== undefined) {
      const nextValue = this.normalizeOptionalString(body.ownerUserId);
      if (nextValue !== exists.ownerUserId) {
        data.ownerUserId = nextValue;
        activityDescriptions.push({
          type: "LEAD_UPDATED",
          description: "ResponsÃ¡vel atualizado",
        });
      }
    }

    if (body.branchId !== undefined) {
      const nextValue = this.normalizeOptionalString(body.branchId);
      if (nextValue !== exists.branchId) {
        data.branchId = nextValue;
        activityDescriptions.push({
          type: "LEAD_UPDATED",
          description: "Filial atualizada",
        });
      }
    }

    if (body.departmentId !== undefined) {
      const nextValue = this.normalizeOptionalString(body.departmentId);
      if (nextValue !== exists.departmentId) {
        data.departmentId = nextValue;
        activityDescriptions.push({
          type: "LEAD_UPDATED",
          description: "Departamento atualizado",
        });
      }
    }

    if (linkedAccountAndContact.accountId !== (exists as any).accountId) {
      data.accountId = linkedAccountAndContact.accountId;
      activityDescriptions.push({
        type: "LEAD_UPDATED",
        description: "Conta relacionada atualizada",
      });
    }

    if (linkedAccountAndContact.contactId !== (exists as any).contactId) {
      data.contactId = linkedAccountAndContact.contactId;
      activityDescriptions.push({
        type: "LEAD_UPDATED",
        description: "Contato relacionado atualizado",
      });
    }

    if (body.forecastCategory !== undefined) {
      const nextValue = this.normalizeForecastCategory(body.forecastCategory);
      if (nextValue !== (exists as any).forecastCategory) {
        data.forecastCategory = nextValue;
        activityDescriptions.push({
          type: "LEAD_UPDATED",
          description: "Categoria de forecast atualizada",
        });
      }
    }

    const updatedLead = await this.prisma.crmLead.update({
      where: { id },
      data,
      include: this.leadInclude(),
    });

    if (activityDescriptions.length > 0) {
      await Promise.all(
        activityDescriptions.map((item) =>
          this.createActivity({
            companyId: cid,
            leadId: id,
            userId: actor.id,
            type: item.type,
            description: item.description,
          }),
        ),
      );
    }

    if (statusChangedPayload) {
      await this.automationEngine.handleEvent({
        companyId: cid,
        module: "CRM",
        triggerType: "LEAD_STATUS_CHANGED",
        payload: statusChangedPayload,
      });
    }

    await this.applyRoutingIfNeeded({
      companyId: cid,
      leadId: updatedLead.id,
      source: updatedLead.source ?? null,
      branchId: updatedLead.branchId ?? null,
      departmentId: updatedLead.departmentId ?? null,
      ownerUserId: updatedLead.ownerUserId ?? null,
    });

    return this.sanitizeLead(updatedLead, perms);
  }

  async remove(id: string, actor: CrmActor) {
    const perms = await this.getPermissions(actor);
    this.ensurePermission(perms, CRM_LEADS_EDIT, "Voce nao pode remover leads do CRM.");
    const exists = await (this.prisma as any).crmLead.findFirst({
      where: {
        AND: [this.buildLeadScopeWhere(actor, perms), { id }],
      },
    });

    if (!exists) {
      throw new NotFoundException("Lead nÃ£o encontrado");
    }

    await this.prisma.crmLead.delete({
      where: { id },
    });

    return { ok: true };
  }

  async pipeline(actor: CrmActor) {
    const perms = await this.getPermissions(actor);
    const leads = await (this.prisma as any).crmLead.findMany({
      where: this.buildLeadScopeWhere(actor, perms),
      orderBy: { createdAt: "desc" },
      include: this.leadInclude(),
    });

    const pipeline: Record<string, any[]> = {
      NEW: [],
      CONTACTED: [],
      PROPOSAL: [],
      NEGOTIATION: [],
      WON: [],
      LOST: [],
    };

    for (const lead of leads) {
      pipeline[lead.status].push(this.sanitizeLead(lead, perms));
    }

    return pipeline;
  }

  async bulkUpdate(
    actor: CrmActor,
    body: {
      leadIds: string[];
      status?: string;
      ownerUserId?: string;
      priority?: string;
    },
  ) {
    const perms = await this.getPermissions(actor);
    this.ensurePermission(perms, CRM_BULK_UPDATE, "Voce nao pode executar acoes em lote no CRM.");

    const leadIds = Array.from(
      new Set(
        (Array.isArray(body.leadIds) ? body.leadIds : [])
          .map((leadId) => String(leadId ?? "").trim())
          .filter(Boolean),
      ),
    );

    if (leadIds.length === 0) {
      throw new BadRequestException("leadIds e obrigatorio.");
    }

    const payload: UpdateCrmLeadDto = {};

    if (body.status !== undefined) payload.status = body.status;
    if (body.ownerUserId !== undefined) payload.ownerUserId = body.ownerUserId;
    if (body.priority !== undefined) payload.priority = body.priority;

    if (
      payload.status === undefined &&
      payload.ownerUserId === undefined &&
      payload.priority === undefined
    ) {
      throw new BadRequestException("Nenhum campo de atualizacao foi informado.");
    }

    const scopedLeads = await (this.prisma as any).crmLead.findMany({
      where: {
        AND: [this.buildLeadScopeWhere(actor, perms), { id: { in: leadIds } }],
      },
      select: {
        id: true,
      },
    });

    if (scopedLeads.length === 0) {
      throw new NotFoundException("Nenhum lead encontrado para atualizacao em lote.");
    }

    return Promise.all(
      scopedLeads.map((lead) => this.update(lead.id, actor, payload)),
    );
  }

  async moveLeadStage(
    leadId: string,
    actor: CrmActor,
    pipelineId: string,
    stageId: string,
  ) {
    const perms = await this.getPermissions(actor);
    this.ensurePermission(perms, CRM_LEADS_STATUS, "Você não pode mover leads entre etapas do pipeline.");

    const companyId = this.ensureCompanyId(String(actor.companyId ?? "").trim());
    const lead = await this.ensureLeadExists(leadId, actor, perms);

    const pipeline = await this.prisma.crmPipeline.findFirst({
      where: {
        id: String(pipelineId ?? "").trim(),
        companyId,
        isActive: true,
      },
      select: {
        id: true,
      },
    });

    if (!pipeline) {
      throw new NotFoundException("Pipeline não encontrado");
    }

    const stage = await this.prisma.crmPipelineStage.findFirst({
      where: {
        id: String(stageId ?? "").trim(),
        pipelineId: pipeline.id,
        companyId,
        isActive: true,
      },
      select: {
        id: true,
        name: true,
        statusBase: true,
        pipelineId: true,
      },
    });

    if (!stage) {
      throw new NotFoundException("Etapa não encontrada");
    }

    const previousStatus = lead.status;

    const updatedLead = await (this.prisma as any).crmLead.update({
      where: { id: lead.id },
      data: {
        pipelineId: pipeline.id,
        stageId: stage.id,
        status: stage.statusBase,
        statusChangedAt: previousStatus !== stage.statusBase ? new Date() : undefined,
        wonAt: (stage.statusBase as CrmLeadStatus) === CrmLeadStatus.WON ? new Date() : (stage.statusBase as CrmLeadStatus) !== CrmLeadStatus.WON ? null : undefined,
        lostAt: (stage.statusBase as CrmLeadStatus) === CrmLeadStatus.LOST ? new Date() : (stage.statusBase as CrmLeadStatus) !== CrmLeadStatus.LOST ? null : undefined,
        lostReason: (stage.statusBase as CrmLeadStatus) !== CrmLeadStatus.LOST ? null : undefined,
      },
      include: this.leadInclude(),
    });

    await this.createActivity({
      companyId,
      leadId: lead.id,
      userId: actor.id,
      type: "LEAD_STAGE_MOVED",
      description: `Lead movido para a etapa ${stage.name}`,
    });

    if (previousStatus !== stage.statusBase) {
      await this.createActivity({
        companyId,
        leadId: lead.id,
        userId: actor.id,
        type: "LEAD_STATUS_CHANGED",
        description: `Status alterado de ${previousStatus} para ${stage.statusBase}`,
      });

      await this.automationEngine.handleEvent({
        companyId,
        module: "CRM",
        triggerType: "LEAD_STATUS_CHANGED",
        payload: {
          leadId: lead.id,
          leadName: lead.name,
          ownerUserId: lead.ownerUserId ?? null,
          branchId: lead.branchId ?? null,
          departmentId: lead.departmentId ?? null,
          fromStatus: previousStatus,
          toStatus: stage.statusBase,
        },
      });
    }

    return this.sanitizeLead(updatedLead, perms);
  }}


