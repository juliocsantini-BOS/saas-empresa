import { Injectable } from "@nestjs/common";
import { AutomationActionType, CrmLeadStatus, Prisma } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class AutomationExecutor {
  constructor(private readonly prisma: PrismaService) {}

  private renderTemplate(value: any, payload: Record<string, any>): string | null {
    if (value === undefined || value === null) return null;
    const raw = String(value);

    return raw.replace(/\{\{\s*([\w.]+)\s*\}\}/g, (_match, path) => {
      const parts = String(path).split(".");
      let current: any = payload;

      for (const part of parts) {
        current = current?.[part];
      }

      if (current === undefined || current === null) return "";
      return String(current);
    });
  }

  private normalizeStatus(status?: string | null): CrmLeadStatus | null {
    if (!status) return null;
    const raw = String(status).trim().toUpperCase();
    const allowed = Object.values(CrmLeadStatus) as string[];
    if (!allowed.includes(raw)) return null;
    return raw as CrmLeadStatus;
  }

  async executeAction(input: {
    companyId: string;
    action: {
      type: AutomationActionType;
      configJson: Prisma.JsonValue | null;
    };
    payload: Record<string, any>;
  }) {
    const config = (input.action.configJson ?? {}) as Record<string, any>;
    const payload = input.payload;
    const companyId = input.companyId;

    if (input.action.type === "CREATE_TASK") {
      const leadId = String(payload.leadId ?? "").trim();
      if (!leadId) {
        return { skipped: true, reason: "payload sem leadId para CREATE_TASK" };
      }

      const dueInDays = Number(config.dueInDays ?? 0);
      const dueInHours = Number(config.dueInHours ?? 0);
      const dueAt = new Date();
      dueAt.setDate(dueAt.getDate() + dueInDays);
      dueAt.setHours(dueAt.getHours() + dueInHours);

      const title =
        this.renderTemplate(config.title ?? "Tarefa automática", payload) ??
        "Tarefa automática";

      const description =
        this.renderTemplate(config.description ?? "Criada por automação.", payload) ??
        "Criada por automação.";

      const assignedUserId =
        String(config.assignedUserId ?? payload.ownerUserId ?? "").trim() || null;

      const task = await this.prisma.crmLeadTask.create({
        data: {
          companyId,
          leadId,
          title,
          description,
          dueAt: config.withoutDueDate ? null : dueAt,
          assignedUserId,
        },
      });

      await this.prisma.crmLeadActivity.create({
        data: {
          companyId,
          leadId,
          type: "TASK_CREATED",
          description: `Automação: tarefa criada (${title})`,
          userId: null,
        },
      });

      return { createdTaskId: task.id };
    }

    if (input.action.type === "CREATE_ACTIVITY") {
      const leadId = String(payload.leadId ?? "").trim();
      if (!leadId) {
        return { skipped: true, reason: "payload sem leadId para CREATE_ACTIVITY" };
      }

      const type = String(config.type ?? "NOTE").trim().toUpperCase();
      const description =
        this.renderTemplate(config.description ?? "Atividade criada por automação.", payload) ??
        "Atividade criada por automação.";

      const activity = await this.prisma.crmLeadActivity.create({
        data: {
          companyId,
          leadId,
          type,
          description,
          userId: null,
        },
      });

      return { createdActivityId: activity.id };
    }

    if (input.action.type === "UPDATE_LEAD_STATUS") {
      const leadId = String(payload.leadId ?? "").trim();
      if (!leadId) {
        return { skipped: true, reason: "payload sem leadId para UPDATE_LEAD_STATUS" };
      }

      const nextStatus = this.normalizeStatus(config.status);
      if (!nextStatus) {
        return { skipped: true, reason: "status inválido em configJson" };
      }

      const currentLead = await this.prisma.crmLead.findFirst({
        where: { id: leadId, companyId },
        select: { id: true, status: true },
      });

      if (!currentLead) {
        return { skipped: true, reason: "lead não encontrado" };
      }

      if (currentLead.status === nextStatus) {
        return { skipped: true, reason: "lead já está no status configurado" };
      }

      const updatedLead = await this.prisma.crmLead.update({
        where: { id: currentLead.id },
        data: { status: nextStatus },
      });

      await this.prisma.crmLeadActivity.create({
        data: {
          companyId,
          leadId,
          type: "LEAD_STATUS_CHANGED",
          description: `Automação: status alterado de ${currentLead.status} para ${nextStatus}`,
          userId: null,
        },
      });

      return { updatedLeadId: updatedLead.id, nextStatus };
    }

    if (input.action.type === "NOTIFY_INTERNAL") {
      const leadId = String(payload.leadId ?? "").trim();
      if (!leadId) {
        return { skipped: true, reason: "payload sem leadId para NOTIFY_INTERNAL" };
      }

      const description =
        this.renderTemplate(config.description ?? "Notificação interna criada por automação.", payload) ??
        "Notificação interna criada por automação.";

      const activity = await this.prisma.crmLeadActivity.create({
        data: {
          companyId,
          leadId,
          type: "NOTE",
          description: `[NOTIFY_INTERNAL] ${description}`,
          userId: null,
        },
      });

      return { notifyActivityId: activity.id };
    }

    return { skipped: true, reason: `ação não suportada: ${input.action.type}` };
  }
}
