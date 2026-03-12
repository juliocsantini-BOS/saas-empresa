import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { CrmLeadStatus, Prisma } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import { CreateCrmLeadDto } from "./dto/create-crm-lead.dto";
import { UpdateCrmLeadDto } from "./dto/update-crm-lead.dto";
import { CreateCrmLeadTaskDto } from "./dto/create-crm-lead-task.dto";
import { CreateCrmLeadActivityDto } from "./dto/create-crm-lead-activity.dto";
import { AutomationEngine } from "../automation/automation.engine";

@Injectable()
export class CrmLeadsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly automationEngine: AutomationEngine,
  ) {}

  private ensureCompanyId(companyId: string) {
    const cid = String(companyId ?? "").trim();
    if (!cid) {
      throw new BadRequestException("Token sem companyId.");
    }
    return cid;
  }

  private normalizeStatus(status?: string | null): CrmLeadStatus | undefined {
    if (!status) return undefined;

    const raw = String(status).trim().toUpperCase();
    const allowed = Object.values(CrmLeadStatus) as string[];

    if (!allowed.includes(raw)) {
      throw new BadRequestException(
        "status inválido. Use: " + allowed.join(", "),
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
      throw new BadRequestException("dealValue inválido.");
    }
  }

  private normalizeDate(value?: string | null): Date | undefined | null {
    if (value === undefined) return undefined;
    if (value === null) return null;

    const raw = String(value).trim();
    if (!raw) return null;

    const parsed = new Date(raw);
    if (Number.isNaN(parsed.getTime())) {
      throw new BadRequestException("Data inválida.");
    }

    return parsed;
  }

  private normalizeOptionalString(value?: string | null): string | undefined | null {
    if (value === undefined) return undefined;
    if (value === null) return null;

    const trimmed = String(value).trim();
    return trimmed || null;
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

  private async ensureLeadExists(id: string, companyId: string) {
    const lead = await this.prisma.crmLead.findFirst({
      where: { id, companyId },
      select: {
        id: true,
        name: true,
        companyId: true,
        ownerUserId: true,
        branchId: true,
        departmentId: true,
        status: true,
      },
    });

    if (!lead) {
      throw new NotFoundException("Lead não encontrado");
    }

    return lead;
  }

  private async validateReferences(input: {
    companyId: string;
    ownerUserId?: string | null;
    branchId?: string | null;
    departmentId?: string | null;
  }) {
    const companyId = input.companyId;
    const ownerUserId = input.ownerUserId ?? null;
    const branchId = input.branchId ?? null;
    const departmentId = input.departmentId ?? null;

    if (ownerUserId) {
      const owner = await this.prisma.user.findFirst({
        where: {
          id: ownerUserId,
          companyId,
        },
        select: { id: true },
      });

      if (!owner) {
        throw new BadRequestException("ownerUserId inválido para esta empresa.");
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
    companyId: string;
    currentUserId: string;
    body: CreateCrmLeadDto;
  }) {
    const companyId = this.ensureCompanyId(input.companyId);
    const body = input.body;

    const name = String(body?.name ?? "").trim();
    if (!name) {
      throw new BadRequestException("name é obrigatório");
    }

    const ownerUserId = body?.ownerUserId
      ? String(body.ownerUserId).trim()
      : input.currentUserId;

    const branchId = body?.branchId ? String(body.branchId).trim() : null;
    const departmentId = body?.departmentId
      ? String(body.departmentId).trim()
      : null;

    await this.validateReferences({
      companyId,
      ownerUserId,
      branchId,
      departmentId,
    });

    const status = this.normalizeStatus(body?.status) ?? CrmLeadStatus.NEW;
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

    const lead = await this.prisma.crmLead.create({
      data: {
        name,
        phone: body?.phone?.trim() || null,
        email: body?.email?.trim().toLowerCase() || null,
        companyName: body?.companyName?.trim() || null,
        notes: body?.notes?.trim() || null,
        status,
        companyId,
        ownerUserId,
        branchId,
        departmentId,
        dealValue,
        currency: this.normalizeOptionalString(body?.currency) ?? "BRL",
        probability,
        source: this.normalizeOptionalString(body?.source) ?? null,
        priority: this.normalizeOptionalString(body?.priority) ?? null,
        nextStep: this.normalizeOptionalString(body?.nextStep) ?? null,
        nextStepDueAt: this.normalizeDate(body?.nextStepDueAt) ?? null,
        expectedCloseDate: this.normalizeDate(body?.expectedCloseDate) ?? null,
        lostReason: this.normalizeOptionalString(body?.lostReason) ?? null,
        statusChangedAt: new Date(),
        ...(status === CrmLeadStatus.WON ? { wonAt: new Date(), lostAt: null } : {}),
        ...(status === CrmLeadStatus.LOST ? { lostAt: new Date(), wonAt: null } : {}),
      },
      include: this.leadInclude(),
    });

    await this.createActivity({
      companyId,
      leadId: lead.id,
      userId: input.currentUserId,
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

    return lead;
  }

  async findAll(companyId: string) {
    const cid = this.ensureCompanyId(companyId);

    return this.prisma.crmLead.findMany({
      where: { companyId: cid },
      orderBy: { createdAt: "desc" },
      include: this.leadInclude(),
    });
  }

  async findActivities(id: string, companyId: string) {
    const cid = this.ensureCompanyId(companyId);

    const exists = await this.prisma.crmLead.findFirst({
      where: { id, companyId: cid },
      select: { id: true },
    });

    if (!exists) {
      throw new NotFoundException("Lead não encontrado");
    }

    return this.prisma.crmLeadActivity.findMany({
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
  }

  async createManualActivity(input: {
    leadId: string;
    companyId: string;
    currentUserId: string;
    body: CreateCrmLeadActivityDto;
  }) {
    const cid = this.ensureCompanyId(input.companyId);
    await this.ensureLeadExists(input.leadId, cid);

    const allowed = ["NOTE", "CALL", "MESSAGE", "MEETING"];
    const type = String(input.body?.type ?? "").trim().toUpperCase();

    if (!allowed.includes(type)) {
      throw new BadRequestException("type inválido. Use: NOTE, CALL, MESSAGE, MEETING");
    }

    const description = String(input.body?.description ?? "").trim();
    if (!description) {
      throw new BadRequestException("description é obrigatório");
    }

    return this.createActivity({
      companyId: cid,
      leadId: input.leadId,
      userId: input.currentUserId,
      type,
      description,
    });
  }

  async findTasks(leadId: string, companyId: string) {
    const cid = this.ensureCompanyId(companyId);

    await this.ensureLeadExists(leadId, cid);

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
    companyId: string;
    currentUserId: string;
    body: CreateCrmLeadTaskDto;
  }) {
    const cid = this.ensureCompanyId(input.companyId);
    const lead = await this.ensureLeadExists(input.leadId, cid);

    const title = String(input.body?.title ?? "").trim();
    if (!title) {
      throw new BadRequestException("title é obrigatório");
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
        throw new BadRequestException("assignedUserId inválido para esta empresa.");
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
      userId: input.currentUserId,
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

  async completeTask(taskId: string, companyId: string, currentUserId: string) {
    const cid = this.ensureCompanyId(companyId);

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
      throw new NotFoundException("Tarefa não encontrada");
    }

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
      userId: currentUserId,
      type: "TASK_DONE",
      description: `Tarefa concluída: ${task.title}`,
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

  async update(
    id: string,
    companyId: string,
    currentUserId: string,
    body: UpdateCrmLeadDto,
  ) {
    const cid = this.ensureCompanyId(companyId);

    const exists = await this.prisma.crmLead.findFirst({
      where: { id, companyId: cid },
    });

    if (!exists) {
      throw new NotFoundException("Lead não encontrado");
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

    if (
      body.ownerUserId !== undefined ||
      body.branchId !== undefined ||
      body.departmentId !== undefined
    ) {
      await this.validateReferences({
        companyId: cid,
        ownerUserId: nextOwnerUserId,
        branchId: nextBranchId,
        departmentId: nextDepartmentId,
      });
    }

    if (body.name !== undefined) {
      const nextValue = body.name ? String(body.name).trim() : "";
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

    if (body.notes !== undefined) {
      const nextValue = body.notes ? String(body.notes).trim() : null;
      if (nextValue !== exists.notes) {
        data.notes = nextValue;
        activityDescriptions.push({
          type: "LEAD_NOTE_UPDATED",
          description: "Observações atualizadas",
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

    if (body.nextStep !== undefined) {
      const nextValue = this.normalizeOptionalString(body.nextStep);
      if (nextValue !== exists.nextStep) {
        data.nextStep = nextValue;
        activityDescriptions.push({
          type: "LEAD_UPDATED",
          description: "Próximo passo atualizado",
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
          description: "Prazo do próximo passo atualizado",
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
          description: "Previsão de fechamento atualizada",
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

    if (body.status !== undefined) {
      const nextStatus = this.normalizeStatus(body.status);
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
          description: "Responsável atualizado",
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
            userId: currentUserId,
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

    return updatedLead;
  }

  async remove(id: string, companyId: string) {
    const cid = this.ensureCompanyId(companyId);

    const exists = await this.prisma.crmLead.findFirst({
      where: { id, companyId: cid },
    });

    if (!exists) {
      throw new NotFoundException("Lead não encontrado");
    }

    await this.prisma.crmLead.delete({
      where: { id },
    });

    return { ok: true };
  }

  async pipeline(companyId: string) {
    const cid = this.ensureCompanyId(companyId);

    const leads = await this.prisma.crmLead.findMany({
      where: { companyId: cid },
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
      pipeline[lead.status].push(lead);
    }

    return pipeline;
  }
}
