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
export class CrmRoutingService {
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

  async listRules(actor: Actor) {
    const companyId = this.ensureCompanyId(actor);
    return (this.prisma as any).crmRoutingRule.findMany({
      where: { companyId },
      include: {
        branch: { select: { id: true, name: true } },
        department: { select: { id: true, name: true } },
      },
      orderBy: [{ priority: "desc" }, { updatedAt: "desc" }],
    });
  }

  async createRule(actor: Actor, body: any) {
    const companyId = this.ensureCompanyId(actor);
    const name = this.trim(body?.name);
    if (!name) throw new BadRequestException("name é obrigatório.");

    return (this.prisma as any).crmRoutingRule.create({
      data: {
        companyId,
        name,
        isActive: body?.isActive !== false,
        priority: Number.isFinite(Number(body?.priority)) ? Number(body.priority) : 0,
        strategy: this.trim(body?.strategy) || "ROUND_ROBIN",
        source: this.trim(body?.source),
        conditionsJson: body?.conditionsJson ?? null,
        ownerPoolJson: body?.ownerPoolJson ?? null,
        branchId: this.trim(body?.branchId),
        departmentId: this.trim(body?.departmentId),
      },
    });
  }

  async preview(actor: Actor, body: any) {
    const companyId = this.ensureCompanyId(actor);
    const leadId = this.trim(body?.leadId);
    if (!leadId) throw new BadRequestException("leadId é obrigatório.");

    const lead = await (this.prisma as any).crmLead.findFirst({
      where: { id: leadId, companyId },
      select: {
        id: true,
        source: true,
        branchId: true,
        departmentId: true,
        ownerUserId: true,
      },
    });

    if (!lead) throw new NotFoundException("Lead não encontrado.");

    const rules = await (this.prisma as any).crmRoutingRule.findMany({
      where: { companyId, isActive: true },
      orderBy: [{ priority: "desc" }, { updatedAt: "desc" }],
    });

    const matched = rules.find((rule: any) => {
      if (rule.source && rule.source !== lead.source) return false;
      if (rule.branchId && rule.branchId !== lead.branchId) return false;
      if (rule.departmentId && rule.departmentId !== lead.departmentId) return false;
      return true;
    });

    if (!matched) {
      return { matched: false, reason: "Nenhuma regra ativa aplicável ao lead." };
    }

    const ownerPool = Array.isArray(matched.ownerPoolJson) ? matched.ownerPoolJson : [];
    return {
      matched: true,
      rule: matched,
      suggestedOwnerId: ownerPool[0] || null,
      reason: "Regra encontrada com base em origem/unidade do lead.",
    };
  }

  async apply(actor: Actor, leadId: string) {
    const companyId = this.ensureCompanyId(actor);
    const preview = await this.preview(actor, { leadId });
    if (!preview.matched) {
      return preview;
    }

    const ownerId = preview.suggestedOwnerId;
    if (!ownerId) {
      return { matched: true, applied: false, reason: "Regra sem pool de owners configurado." };
    }

    await (this.prisma as any).crmLead.update({
      where: { id: leadId },
      data: { ownerUserId: ownerId },
    });

    await (this.prisma as any).crmRoutingExecution.create({
      data: {
        companyId,
        routingRuleId: preview.rule.id,
        leadId,
        assignedUserId: ownerId,
        status: "APPLIED",
        reason: preview.reason,
      },
    });

    await (this.prisma as any).crmRoutingRule.update({
      where: { id: preview.rule.id },
      data: { lastAssignedUserId: ownerId },
    });

    return { matched: true, applied: true, assignedUserId: ownerId, ruleId: preview.rule.id };
  }
}
