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
export class CrmEngagementService {
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

  private normalizeDate(value: unknown) {
    const raw = this.trim(value);
    if (!raw) return null;
    const parsed = new Date(raw);
    if (Number.isNaN(parsed.getTime())) {
      throw new BadRequestException("Data inválida.");
    }
    return parsed;
  }

  async listMailboxes(actor: Actor) {
    const companyId = this.ensureCompanyId(actor);
    return (this.prisma as any).crmMailbox.findMany({
      where: { companyId },
      orderBy: [{ updatedAt: "desc" }],
    });
  }

  async createMailbox(actor: Actor, body: any) {
    const companyId = this.ensureCompanyId(actor);
    const emailAddress = this.trim(body?.emailAddress);
    const provider = this.trim(body?.provider);
    const label = this.trim(body?.label) || emailAddress;

    if (!emailAddress || !provider) {
      throw new BadRequestException("provider e emailAddress são obrigatórios.");
    }

    return (this.prisma as any).crmMailbox.create({
      data: {
        companyId,
        userId: this.trim(body?.userId) || actor.id,
        provider,
        label,
        emailAddress,
        isActive: body?.isActive !== false,
        syncStatus: this.trim(body?.syncStatus) || "CONNECTED",
        configJson: body?.configJson ?? null,
      },
    });
  }

  async listTemplates(actor: Actor) {
    const companyId = this.ensureCompanyId(actor);
    return (this.prisma as any).crmEmailTemplate.findMany({
      where: { companyId },
      orderBy: [{ updatedAt: "desc" }],
    });
  }

  async createTemplate(actor: Actor, body: any) {
    const companyId = this.ensureCompanyId(actor);
    const name = this.trim(body?.name);
    const subject = this.trim(body?.subject);
    const bodyText = this.trim(body?.body);

    if (!name || !subject || !bodyText) {
      throw new BadRequestException("name, subject e body são obrigatórios.");
    }

    return (this.prisma as any).crmEmailTemplate.create({
      data: {
        companyId,
        userId: actor.id,
        name,
        subject,
        body: bodyText,
        category: this.trim(body?.category),
        isActive: body?.isActive !== false,
      },
    });
  }

  async listSequences(actor: Actor) {
    const companyId = this.ensureCompanyId(actor);
    return (this.prisma as any).crmSequence.findMany({
      where: { companyId },
      include: {
        steps: { orderBy: [{ order: "asc" }] },
        enrollments: {
          orderBy: [{ createdAt: "desc" }],
          take: 10,
        },
      },
      orderBy: [{ updatedAt: "desc" }],
    });
  }

  async createSequence(actor: Actor, body: any) {
    const companyId = this.ensureCompanyId(actor);
    const name = this.trim(body?.name);
    if (!name) {
      throw new BadRequestException("name é obrigatório.");
    }

    return this.prisma.$transaction(async (tx) => {
      const sequence = await (tx as any).crmSequence.create({
        data: {
          companyId,
          userId: actor.id,
          name,
          description: this.trim(body?.description),
          isActive: body?.isActive !== false,
        },
      });

      const steps = Array.isArray(body?.steps) ? body.steps : [];
      for (let index = 0; index < steps.length; index += 1) {
        const step = steps[index];
        await (tx as any).crmSequenceStep.create({
          data: {
            companyId,
            sequenceId: sequence.id,
            order: index,
            type: this.trim(step?.type) || "EMAIL",
            subject: this.trim(step?.subject),
            body: this.trim(step?.body),
            taskTitle: this.trim(step?.taskTitle),
            dueInDays: Number.isFinite(Number(step?.dueInDays)) ? Number(step.dueInDays) : 0,
            configJson: step?.configJson ?? null,
          },
        });
      }

      return (tx as any).crmSequence.findUnique({
        where: { id: sequence.id },
        include: { steps: { orderBy: [{ order: "asc" }] } },
      });
    });
  }

  async enrollSequence(actor: Actor, body: any) {
    const companyId = this.ensureCompanyId(actor);
    const sequenceId = this.trim(body?.sequenceId);
    const leadId = this.trim(body?.leadId);
    if (!sequenceId || !leadId) {
      throw new BadRequestException("sequenceId e leadId são obrigatórios.");
    }

    return (this.prisma as any).crmSequenceEnrollment.create({
      data: {
        companyId,
        sequenceId,
        leadId,
        contactId: this.trim(body?.contactId),
        status: this.trim(body?.status) || "ACTIVE",
        currentStepOrder: Number.isFinite(Number(body?.currentStepOrder))
          ? Number(body.currentStepOrder)
          : 0,
        nextRunAt: this.normalizeDate(body?.nextRunAt),
        stoppedReason: this.trim(body?.stoppedReason),
      },
    });
  }

  async listInbox(actor: Actor) {
    const companyId = this.ensureCompanyId(actor);
    return (this.prisma as any).crmEmailMessage.findMany({
      where: { companyId },
      include: {
        mailbox: true,
        lead: { select: { id: true, name: true, status: true } },
        account: { select: { id: true, name: true } },
        contact: { select: { id: true, fullName: true, email: true } },
      },
      orderBy: [{ createdAt: "desc" }],
      take: 100,
    });
  }

  async createEmailMessage(actor: Actor, body: any) {
    const companyId = this.ensureCompanyId(actor);
    const subject = this.trim(body?.subject);
    const bodyText = this.trim(body?.body);
    if (!subject || !bodyText) {
      throw new BadRequestException("subject e body são obrigatórios.");
    }

    return (this.prisma as any).crmEmailMessage.create({
      data: {
        companyId,
        mailboxId: this.trim(body?.mailboxId),
        leadId: this.trim(body?.leadId),
        accountId: this.trim(body?.accountId),
        contactId: this.trim(body?.contactId),
        sequenceEnrollmentId: this.trim(body?.sequenceEnrollmentId),
        direction: this.trim(body?.direction) || "OUTBOUND",
        syncSource: this.trim(body?.syncSource) || "MANUAL",
        providerMessageId: this.trim(body?.providerMessageId),
        threadId: this.trim(body?.threadId),
        subject,
        body: bodyText,
        fromEmail: this.trim(body?.fromEmail),
        toEmail: this.trim(body?.toEmail),
        status: this.trim(body?.status),
        sentAt: this.normalizeDate(body?.sentAt) || new Date(),
        receivedAt: this.normalizeDate(body?.receivedAt),
        openedAt: this.normalizeDate(body?.openedAt),
        repliedAt: this.normalizeDate(body?.repliedAt),
        metadataJson: body?.metadataJson ?? null,
      },
    });
  }

  async listConversationInsights(actor: Actor, leadId?: string) {
    const companyId = this.ensureCompanyId(actor);
    return (this.prisma as any).crmConversationInsight.findMany({
      where: {
        companyId,
        ...(leadId ? { leadId } : {}),
      },
      orderBy: [{ createdAt: "desc" }],
      take: 50,
    });
  }

  async createConversationInsight(actor: Actor, body: any) {
    const companyId = this.ensureCompanyId(actor);
    const leadId = this.trim(body?.leadId);
    if (!leadId) {
      throw new BadRequestException("leadId é obrigatório.");
    }

    return (this.prisma as any).crmConversationInsight.create({
      data: {
        companyId,
        leadId,
        userId: actor.id,
        sourceType: this.trim(body?.sourceType) || "CALL",
        transcriptText: this.trim(body?.transcriptText),
        summaryText: this.trim(body?.summaryText),
        objectionsJson: body?.objectionsJson ?? null,
        nextStepsJson: body?.nextStepsJson ?? null,
        sentimentScore: Number.isFinite(Number(body?.sentimentScore))
          ? Number(body.sentimentScore)
          : null,
        coachingNotes: this.trim(body?.coachingNotes),
      },
    });
  }
}
