import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CrmLeadStatus, Role } from "@prisma/client";
import { CreateCrmPipelineStageDto } from "./dto/create-crm-pipeline-stage.dto";
import { UpdateCrmPipelineStageDto } from "./dto/update-crm-pipeline-stage.dto";
import { ReorderCrmPipelineStagesDto } from "./dto/reorder-crm-pipeline-stages.dto";

type PipelineActor = {
  id: string;
  role: Role;
  companyId?: string | null;
};

@Injectable()
export class CrmPipelineStagesService {
  constructor(private readonly prisma: PrismaService) {}

  private ensureCompanyId(companyId: string | null | undefined) {
    const cid = String(companyId ?? "").trim();
    if (!cid) {
      throw new ForbiddenException("Company obrigatória");
    }
    return cid;
  }

  private normalizeId(value: string, field: string) {
    const parsed = String(value ?? "").trim();
    if (!parsed) {
      throw new BadRequestException(`${field} inválido`);
    }
    return parsed;
  }

  private canManage(role: Role) {
    return (
      role === Role.ADMIN_MASTER ||
      role === Role.ADMIN ||
      role === Role.CEO ||
      role === Role.CMO
    );
  }

  private async ensurePipeline(companyId: string, pipelineId: string) {
    const pipeline = await this.prisma.crmPipeline.findFirst({
      where: { id: pipelineId, companyId },
      select: { id: true, companyId: true, isDefault: true },
    });

    if (!pipeline) {
      throw new NotFoundException("Pipeline não encontrado");
    }

    return pipeline;
  }

  private async ensureStage(companyId: string, pipelineId: string, stageId: string) {
    const stage = await this.prisma.crmPipelineStage.findFirst({
      where: {
        id: stageId,
        companyId,
        pipelineId,
      },
      select: {
        id: true,
        name: true,
        order: true,
        isSystemStage: true,
        pipelineId: true,
      },
    });

    if (!stage) {
      throw new NotFoundException("Etapa não encontrada");
    }

    return stage;
  }

  async list(actor: PipelineActor, pipelineId: string) {
    const companyId = this.ensureCompanyId(actor.companyId);
    const normalizedPipelineId = this.normalizeId(pipelineId, "pipelineId");

    await this.ensurePipeline(companyId, normalizedPipelineId);

    return this.prisma.crmPipelineStage.findMany({
      where: {
        companyId,
        pipelineId: normalizedPipelineId,
      },
      orderBy: [{ order: "asc" }, { createdAt: "asc" }],
    });
  }

  async create(actor: PipelineActor, pipelineId: string, body: CreateCrmPipelineStageDto) {
    const companyId = this.ensureCompanyId(actor.companyId);
    const normalizedPipelineId = this.normalizeId(pipelineId, "pipelineId");

    if (!this.canManage(actor.role)) {
      throw new ForbiddenException("Você não pode criar etapas de pipeline.");
    }

    await this.ensurePipeline(companyId, normalizedPipelineId);

    const name = String(body.name ?? "").trim();
    if (!name) {
      throw new BadRequestException("name é obrigatório");
    }

    return this.prisma.crmPipelineStage.create({
      data: {
        companyId,
        pipelineId: normalizedPipelineId,
        name,
        order: body.order,
        color: body.color?.trim() || null,
        isActive: body.isActive ?? true,
        isSystemStage: false,
        statusBase: body.statusBase ?? CrmLeadStatus.NEW,
      },
    });
  }

  async update(
    actor: PipelineActor,
    pipelineId: string,
    stageId: string,
    body: UpdateCrmPipelineStageDto,
  ) {
    const companyId = this.ensureCompanyId(actor.companyId);
    const normalizedPipelineId = this.normalizeId(pipelineId, "pipelineId");
    const normalizedStageId = this.normalizeId(stageId, "stageId");

    if (!this.canManage(actor.role)) {
      throw new ForbiddenException("Você não pode atualizar etapas de pipeline.");
    }

    await this.ensurePipeline(companyId, normalizedPipelineId);
    const existing = await this.ensureStage(companyId, normalizedPipelineId, normalizedStageId);

    if (existing.isSystemStage && body.statusBase && body.statusBase !== undefined) {
      // permitido trocar nome/cor/ordem/ativo, mas manteremos simples sem travar isso
    }

    const data: Record<string, any> = {};

    if (body.name !== undefined) {
      const name = String(body.name ?? "").trim();
      if (!name) {
        throw new BadRequestException("name não pode ser vazio");
      }
      data.name = name;
    }

    if (body.order !== undefined) data.order = body.order;
    if (body.color !== undefined) data.color = body.color?.trim() || null;
    if (body.isActive !== undefined) data.isActive = body.isActive;
    if (body.statusBase !== undefined) data.statusBase = body.statusBase;

    return this.prisma.crmPipelineStage.update({
      where: { id: existing.id },
      data,
    });
  }

  async reorder(
    actor: PipelineActor,
    pipelineId: string,
    body: ReorderCrmPipelineStagesDto,
  ) {
    const companyId = this.ensureCompanyId(actor.companyId);
    const normalizedPipelineId = this.normalizeId(pipelineId, "pipelineId");

    if (!this.canManage(actor.role)) {
      throw new ForbiddenException("Você não pode reordenar etapas de pipeline.");
    }

    await this.ensurePipeline(companyId, normalizedPipelineId);

    const items = Array.isArray(body.items) ? body.items : [];
    if (items.length === 0) {
      throw new BadRequestException("items é obrigatório");
    }

    const ids = items.map((item) => String(item.id ?? "").trim()).filter(Boolean);
    const uniqueIds = Array.from(new Set(ids));

    if (uniqueIds.length !== items.length) {
      throw new BadRequestException("items contém ids duplicados");
    }

    const stages = await this.prisma.crmPipelineStage.findMany({
      where: {
        companyId,
        pipelineId: normalizedPipelineId,
        id: { in: uniqueIds },
      },
      select: { id: true },
    });

    if (stages.length !== uniqueIds.length) {
      throw new NotFoundException("Uma ou mais etapas não foram encontradas");
    }

    await this.prisma.$transaction(
      items.map((item) =>
        this.prisma.crmPipelineStage.update({
          where: { id: item.id },
          data: { order: item.order },
        }),
      ),
    );

    return this.prisma.crmPipelineStage.findMany({
      where: {
        companyId,
        pipelineId: normalizedPipelineId,
      },
      orderBy: [{ order: "asc" }, { createdAt: "asc" }],
    });
  }

  async remove(actor: PipelineActor, pipelineId: string, stageId: string) {
    const companyId = this.ensureCompanyId(actor.companyId);
    const normalizedPipelineId = this.normalizeId(pipelineId, "pipelineId");
    const normalizedStageId = this.normalizeId(stageId, "stageId");

    if (!this.canManage(actor.role)) {
      throw new ForbiddenException("Você não pode excluir etapas de pipeline.");
    }

    await this.ensurePipeline(companyId, normalizedPipelineId);
    const existing = await this.ensureStage(companyId, normalizedPipelineId, normalizedStageId);

    if (existing.isSystemStage) {
      throw new BadRequestException("Não é permitido excluir uma etapa de sistema.");
    }

    const leadsUsingStage = await this.prisma.crmLead.count({
      where: {
        companyId,
        stageId: existing.id,
      },
    });

    if (leadsUsingStage > 0) {
      throw new BadRequestException(
        "Não é possível excluir: existem leads vinculados a esta etapa.",
      );
    }

    await this.prisma.crmPipelineStage.delete({
      where: { id: existing.id },
    });

    return { ok: true };
  }
}
