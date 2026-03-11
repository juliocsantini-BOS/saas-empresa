import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreateAutomationRuleDto } from "./dto/create-automation-rule.dto";
import { UpdateAutomationRuleDto } from "./dto/update-automation-rule.dto";
import { ListAutomationExecutionsQueryDto } from "./dto/list-automation-executions.query.dto";
import { AutomationEngine } from "./automation.engine";

@Injectable()
export class AutomationService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly engine: AutomationEngine,
  ) {}

  private ensureCompanyId(companyId: string) {
    const cid = String(companyId ?? "").trim();
    if (!cid) {
      throw new BadRequestException("Token sem companyId.");
    }
    return cid;
  }

  private async ensureRuleExists(id: string, companyId: string) {
    const rule = await this.prisma.automationRule.findFirst({
      where: { id, companyId },
      include: {
        actions: {
          orderBy: [{ order: "asc" }, { createdAt: "asc" }],
        },
      },
    });

    if (!rule) {
      throw new NotFoundException("Regra de automação não encontrada");
    }

    return rule;
  }

  async listRules(companyId: string) {
    const cid = this.ensureCompanyId(companyId);

    return this.prisma.automationRule.findMany({
      where: { companyId: cid },
      orderBy: { createdAt: "desc" },
      include: {
        actions: {
          orderBy: [{ order: "asc" }, { createdAt: "asc" }],
        },
      },
    });
  }

  async createRule(input: { companyId: string; body: CreateAutomationRuleDto }) {
    const cid = this.ensureCompanyId(input.companyId);
    const body = input.body;

    if (!body.actions?.length) {
      throw new BadRequestException("A regra precisa ter pelo menos uma ação.");
    }

    const rule = await this.prisma.automationRule.create({
      data: {
        companyId: cid,
        name: body.name.trim(),
        description: body.description?.trim() || null,
        module: body.module,
        triggerType: body.triggerType,
        isActive: body.isActive ?? true,
        conditionsJson: body.conditionsJson ?? {},
      },
    });

    await this.prisma.automationAction.createMany({
      data: body.actions.map((action, index) => ({
        companyId: cid,
        ruleId: rule.id,
        type: action.type,
        order: action.order ?? index,
        configJson: action.configJson ?? {},
      })),
    });

    return this.ensureRuleExists(rule.id, cid);
  }

  async updateRule(input: {
    id: string;
    companyId: string;
    body: UpdateAutomationRuleDto;
  }) {
    const cid = this.ensureCompanyId(input.companyId);
    const existing = await this.ensureRuleExists(input.id, cid);

    await this.prisma.automationRule.update({
      where: { id: existing.id },
      data: {
        name: input.body.name?.trim(),
        description:
          input.body.description === undefined
            ? undefined
            : input.body.description?.trim() || null,
        module: input.body.module,
        triggerType: input.body.triggerType,
        isActive: input.body.isActive,
        conditionsJson: input.body.conditionsJson,
      },
    });

    if (input.body.actions) {
      await this.prisma.automationAction.deleteMany({
        where: { ruleId: existing.id, companyId: cid },
      });

      if (input.body.actions.length > 0) {
        await this.prisma.automationAction.createMany({
          data: input.body.actions.map((action, index) => ({
            companyId: cid,
            ruleId: existing.id,
            type: action.type,
            order: action.order ?? index,
            configJson: action.configJson ?? {},
          })),
        });
      }
    }

    return this.ensureRuleExists(existing.id, cid);
  }

  async deleteRule(id: string, companyId: string) {
    const cid = this.ensureCompanyId(companyId);
    const existing = await this.ensureRuleExists(id, cid);

    await this.prisma.automationRule.delete({
      where: { id: existing.id },
    });

    return { ok: true };
  }

  async listExecutions(companyId: string, query: ListAutomationExecutionsQueryDto) {
    const cid = this.ensureCompanyId(companyId);

    return this.prisma.automationExecution.findMany({
      where: {
        companyId: cid,
        ruleId: query.ruleId || undefined,
        status: query.status as any || undefined,
      },
      orderBy: { createdAt: "desc" },
      include: {
        rule: {
          select: {
            id: true,
            name: true,
            triggerType: true,
            module: true,
          },
        },
      },
      take: 100,
    });
  }

  async runMaintenance(companyId: string) {
    const cid = this.ensureCompanyId(companyId);
    const now = new Date();

    const dueTasks = await this.prisma.crmLeadTask.findMany({
      where: {
        companyId: cid,
        completedAt: null,
        dueAt: { lte: now },
      },
      include: {
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

    for (const task of dueTasks) {
      const dueAt = task.dueAt ? new Date(task.dueAt) : null;
      const isOverdue = dueAt ? dueAt.getTime() < now.getTime() : false;

      await this.engine.handleEvent({
        companyId: cid,
        module: "CRM",
        triggerType: "TASK_DUE",
        payload: {
          taskId: task.id,
          leadId: task.leadId,
          leadName: task.lead?.name ?? null,
          ownerUserId: task.lead?.ownerUserId ?? null,
          branchId: task.lead?.branchId ?? null,
          departmentId: task.lead?.departmentId ?? null,
          dueAt: task.dueAt,
          isOverdue,
          isDueToday: true,
          taskTitle: task.title,
        },
      });
    }

    const leads = await this.prisma.crmLead.findMany({
      where: { companyId: cid },
      include: {
        activities: {
          select: { createdAt: true },
          orderBy: { createdAt: "desc" },
          take: 1,
        },
      },
    });

    for (const lead of leads) {
      const referenceDate =
        lead.activities[0]?.createdAt ?? lead.updatedAt ?? lead.createdAt;
      const diffMs = now.getTime() - new Date(referenceDate).getTime();
      const daysWithoutActivity = Math.floor(diffMs / (1000 * 60 * 60 * 24));

      await this.engine.handleEvent({
        companyId: cid,
        module: "CRM",
        triggerType: "LEAD_STALE",
        payload: {
          leadId: lead.id,
          leadName: lead.name,
          ownerUserId: lead.ownerUserId ?? null,
          branchId: lead.branchId ?? null,
          departmentId: lead.departmentId ?? null,
          status: lead.status,
          daysWithoutActivity,
        },
      });
    }

    return {
      ok: true,
      dueTasksProcessed: dueTasks.length,
      staleLeadsProcessed: leads.length,
    };
  }
}
