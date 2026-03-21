import {
  BadRequestException,
  ForbiddenException,
  Injectable,
} from "@nestjs/common";
import { Prisma, Role } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";

type Actor = {
  id: string;
  role: Role;
  companyId?: string | null;
};

@Injectable()
export class CrmForecastService {
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
    if (value === undefined || value === null || value === "") return new Prisma.Decimal(0);
    const parsed = Number(value);
    if (!Number.isFinite(parsed)) {
      throw new BadRequestException("Valor inválido.");
    }
    return new Prisma.Decimal(parsed);
  }

  private normalizeDate(value: unknown) {
    const raw = this.trim(value);
    if (!raw) throw new BadRequestException("Data obrigatória.");
    const parsed = new Date(raw);
    if (Number.isNaN(parsed.getTime())) throw new BadRequestException("Data inválida.");
    return parsed;
  }

  async summary(actor: Actor) {
    const companyId = this.ensureCompanyId(actor);
    const leads = await (this.prisma as any).crmLead.findMany({
      where: { companyId },
      select: {
        id: true,
        status: true,
        dealValue: true,
        probability: true,
        forecastCategory: true,
      },
    });

    const totals = {
      pipeline: 0,
      bestCase: 0,
      commit: 0,
      closed: 0,
    };

    for (const lead of leads) {
      const amount = Number(lead.dealValue ?? 0);
      const weighted = amount * ((Number(lead.probability ?? 0) || 0) / 100);
      const category = String(lead.forecastCategory || "PIPELINE");

      if (category === "BEST_CASE") totals.bestCase += weighted;
      else if (category === "COMMIT") totals.commit += weighted;
      else if (category === "CLOSED" || lead.status === "WON") totals.closed += amount;
      else totals.pipeline += weighted;
    }

    const adjustments = await (this.prisma as any).crmForecastAdjustment.findMany({
      where: { companyId },
      orderBy: [{ createdAt: "desc" }],
      take: 20,
    });

    const snapshots = await (this.prisma as any).crmForecastSnapshot.findMany({
      where: { companyId },
      orderBy: [{ createdAt: "desc" }],
      take: 12,
    });

    return {
      totals,
      adjustments,
      snapshots,
    };
  }

  async createSnapshot(actor: Actor, body: any) {
    const companyId = this.ensureCompanyId(actor);
    const label = this.trim(body?.label);
    if (!label) throw new BadRequestException("label é obrigatório.");

    return (this.prisma as any).crmForecastSnapshot.create({
      data: {
        companyId,
        label,
        periodStart: this.normalizeDate(body?.periodStart),
        periodEnd: this.normalizeDate(body?.periodEnd),
        pipelineValue: this.decimal(body?.pipelineValue),
        bestCaseValue: this.decimal(body?.bestCaseValue),
        commitValue: this.decimal(body?.commitValue),
        closedValue: this.decimal(body?.closedValue),
        gapToTarget: body?.gapToTarget !== undefined ? this.decimal(body.gapToTarget) : null,
        notes: this.trim(body?.notes),
        branchId: this.trim(body?.branchId),
        departmentId: this.trim(body?.departmentId),
        ownerUserId: this.trim(body?.ownerUserId),
      },
    });
  }

  async createAdjustment(actor: Actor, body: any) {
    const companyId = this.ensureCompanyId(actor);
    const category = this.trim(body?.category);
    const reason = this.trim(body?.reason);
    if (!category || !reason) {
      throw new BadRequestException("category e reason são obrigatórios.");
    }

    return (this.prisma as any).crmForecastAdjustment.create({
      data: {
        companyId,
        snapshotId: this.trim(body?.snapshotId),
        leadId: this.trim(body?.leadId),
        userId: actor.id,
        category,
        adjustedValue: this.decimal(body?.adjustedValue),
        reason,
      },
    });
  }
}
