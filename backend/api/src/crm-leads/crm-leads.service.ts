import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { CrmLeadStatus } from "@prisma/client";
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

  private async createActivity(input: {
    companyId: string;
    leadId: string;
    userId?: string | null;
    type: string;
    description: string;
  }) {
    return this.prisma.crmLeadActivity.create({
      data: {
        companyId: input.companyId,
        leadId: input.leadId,
        userId: input.userId ?? null,
        type: input.type,
        description: input.description,
      },
    });
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

    const status = this.normalizeStatus(body?.status) ?? CrmLeadStatus.NEW;

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
    const lead = await this.ensureLeadExists(input.leadId, cid);

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

    if (body.status !== undefined) {
      const nextStatus = this.normalizeStatus(body.status);
      if (nextStatus && nextStatus !== exists.status) {
        data.status = nextStatus;
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
      const nextValue = body.ownerUserId
        ? String(body.ownerUserId).trim()
        : null;
      if (nextValue !== exists.ownerUserId) {
        data.ownerUserId = nextValue;
        activityDescriptions.push({
          type: "LEAD_UPDATED",
          description: "Responsável atualizado",
        });
      }
    }

    if (body.branchId !== undefined) {
      const nextValue = body.branchId ? String(body.branchId).trim() : null;
      if (nextValue !== exists.branchId) {
        data.branchId = nextValue;
        activityDescriptions.push({
          type: "LEAD_UPDATED",
          description: "Filial atualizada",
        });
      }
    }

    if (body.departmentId !== undefined) {
      const nextValue = body.departmentId
        ? String(body.departmentId).trim()
        : null;
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
