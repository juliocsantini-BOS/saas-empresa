import { Injectable } from "@nestjs/common";
import { AutomationExecutionStatus, AutomationModuleName, AutomationTriggerType } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import { AutomationExecutor } from "./automation.executor";
import { AutomationEventInput } from "./automation.types";

@Injectable()
export class AutomationEngine {
  constructor(
    private readonly prisma: PrismaService,
    private readonly executor: AutomationExecutor,
  ) {}

  private matchesConditions(
    conditions: Record<string, any> | null | undefined,
    payload: Record<string, any>,
  ) {
    if (!conditions) return true;

    const exactKeys = [
      "fromStatus",
      "toStatus",
      "status",
      "ownerUserId",
      "branchId",
      "departmentId",
      "leadId",
      "taskId",
    ];

    for (const key of exactKeys) {
      if (conditions[key] !== undefined && String(conditions[key]) !== String(payload[key] ?? "")) {
        return false;
      }
    }

    if (conditions.isOverdue !== undefined && Boolean(conditions.isOverdue) !== Boolean(payload.isOverdue)) {
      return false;
    }

    if (conditions.isDueToday !== undefined && Boolean(conditions.isDueToday) !== Boolean(payload.isDueToday)) {
      return false;
    }

    if (conditions.daysWithoutActivity !== undefined) {
      const required = Number(conditions.daysWithoutActivity);
      const actual = Number(payload.daysWithoutActivity ?? 0);
      if (actual < required) return false;
    }

    return true;
  }

  async handleEvent(input: AutomationEventInput) {
    const rules = await this.prisma.automationRule.findMany({
      where: {
        companyId: input.companyId,
        module: input.module as AutomationModuleName,
        triggerType: input.triggerType as AutomationTriggerType,
        isActive: true,
      },
      orderBy: { createdAt: "asc" },
      include: {
        actions: {
          orderBy: [{ order: "asc" }, { createdAt: "asc" }],
        },
      },
    });

    for (const rule of rules) {
      const conditions = (rule.conditionsJson ?? {}) as Record<string, any>;

      if (!this.matchesConditions(conditions, input.payload)) {
        await this.prisma.automationExecution.create({
          data: {
            companyId: input.companyId,
            ruleId: rule.id,
            status: "SKIPPED",
            triggerPayloadJson: input.payload,
            resultJson: { reason: "conditions_not_matched" },
          },
        });
        continue;
      }

      try {
        const actionResults: Array<Record<string, any>> = [];

        for (const action of rule.actions) {
          const result = await this.executor.executeAction({
            companyId: input.companyId,
            action: {
              type: action.type,
              configJson: action.configJson,
            },
            payload: input.payload,
          });

          actionResults.push({
            actionId: action.id,
            type: action.type,
            result,
          });
        }

        await this.prisma.automationExecution.create({
          data: {
            companyId: input.companyId,
            ruleId: rule.id,
            status: AutomationExecutionStatus.SUCCESS,
            triggerPayloadJson: input.payload,
            resultJson: actionResults,
          },
        });
      } catch (error: any) {
        await this.prisma.automationExecution.create({
          data: {
            companyId: input.companyId,
            ruleId: rule.id,
            status: AutomationExecutionStatus.FAILED,
            triggerPayloadJson: input.payload,
            errorMessage: String(error?.message ?? error ?? "unknown_error"),
          },
        });
      }
    }
  }
}
