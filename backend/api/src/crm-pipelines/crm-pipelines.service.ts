import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { Role } from "@prisma/client";

type Actor = {
  id: string
  role: Role
  companyId?: string | null
}

@Injectable()
export class CrmPipelinesService {
  constructor(private prisma: PrismaService) {}

  private getCompanyId(actor: Actor) {
    const cid = String(actor.companyId ?? "").trim()

    if (!cid) {
      throw new ForbiddenException("Company obrigatória")
    }

    return cid
  }

  async list(actor: Actor) {
    const companyId = this.getCompanyId(actor)

    return this.prisma.crmPipeline.findMany({
      where: { companyId },
      include: {
        stages: {
          where: { isActive: true },
          orderBy: { order: "asc" },
        },
      },
      orderBy: { createdAt: "asc" },
    })
  }

  async create(actor: Actor, body: any) {
    const companyId = this.getCompanyId(actor)

    const name = String(body.name ?? "").trim()

    if (!name) {
      throw new BadRequestException("name obrigatório")
    }

    return this.prisma.$transaction(async (tx) => {
      if (body.isDefault) {
        await tx.crmPipeline.updateMany({
          where: { companyId, isDefault: true },
          data: { isDefault: false },
        })
      }

      const pipeline = await tx.crmPipeline.create({
        data: {
          companyId,
          name,
          description: body.description ?? null,
          isDefault: body.isDefault ?? false,
          isActive: body.isActive ?? true,
        },
      })

      if (Array.isArray(body.stages) && body.stages.length > 0) {
        for (let i = 0; i < body.stages.length; i++) {
          const s = body.stages[i]

          await tx.crmPipelineStage.create({
            data: {
              companyId,
              pipelineId: pipeline.id,
              name: s.name,
              order: i,
              color: s.color ?? null,
              statusBase: s.statusBase ?? "NEW",
              isActive: s.isActive ?? true,
              isSystemStage: false,
            },
          })
        }
      }

      return pipeline
    })
  }

  async delete(actor: Actor, pipelineId: string) {
    const companyId = this.getCompanyId(actor)

    const pipeline = await this.prisma.crmPipeline.findFirst({
      where: { id: pipelineId, companyId },
    })

    if (!pipeline) {
      throw new NotFoundException("Pipeline não encontrado")
    }

    await this.prisma.crmPipeline.delete({
      where: { id: pipelineId },
    })

    return { ok: true }
  }
}
