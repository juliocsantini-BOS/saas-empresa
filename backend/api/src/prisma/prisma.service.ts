import { Injectable, OnModuleDestroy, OnModuleInit } from "@nestjs/common";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { RequestContext } from "../common/request-context/request-context";

// ✅ Modelos TENANT (possuem companyId)
const TENANT_MODELS = new Set([
  "User",
  "Branch",
  "AuditLog",
  "UserPermission",
  "Department",
  "CrmLead",
  "CrmLeadActivity",
  "CrmLeadTask",
  "CrmAccount",
  "CrmContact",
  "CrmMailbox",
  "CrmChannelIntegration",
  "CrmOmnichannelMessage",
  "CrmEmailTemplate",
  "CrmSequence",
  "CrmSequenceStep",
  "CrmSequenceEnrollment",
  "CrmEmailMessage",
  "CrmQuote",
  "CrmQuoteItem",
  "CrmDocument",
  "CrmRoutingRule",
  "CrmRoutingExecution",
  "CrmConversationInsight",
  "CrmForecastSnapshot",
  "CrmForecastAdjustment",
  "FinanceAccount",
  "FinanceBankAccount",
  "FinanceCostCenter",
  "FinanceCategory",
  "FinancePayable",
  "FinanceReceivable",
  "FinanceReminder",
  "FinanceTransaction",
  "FinanceStatementImport",
  "FinanceStatementLine",
  "FinanceReconciliationMatch",
  "FinancePixConfirmation",
  "FinanceApprovalPolicy",
  "FinanceApprovalRequest",
  "FinanceClosePeriod",
  "FinanceCloseChecklistItem",
  "FinanceBudgetPlan",
  "FinanceBudgetLine",
  "FinanceForecastSnapshot",
  "FinanceVendor",
  "FinanceVendorDocument",
  "FinanceProcurementRequest",
  "FinancePurchaseOrder",
  "FinancePurchaseOrderLine",
  "FinanceGoodsReceipt",
  "FinanceThreeWayMatch",
  "FinanceExpenseReport",
  "FinanceExpenseItem",
  "FinanceCorporateCard",
  "FinanceCardTransaction",
  "FinanceErpConnection",
  "FinanceErpSyncJob",
  "FinanceTreasuryTransfer",
  "FinanceTreasuryAllocation",
  "FinanceCashPositionSnapshot",
  "FinanceAnomalyInsight",
  "FinanceCashForecastRun",
  "FinanceTravelPolicy",
  "FinanceTravelRequest",
  "FinanceTravelBooking",
  "FinanceTravelAdvance",
  "FinanceBillingPlan",
  "FinanceInvoice",
  "FinanceTaxProfile",
  "FinanceRevenueSchedule",
  "FinanceRecoveryCase",
  "FinanceCloseEvidence",
  "FinanceGlobalEntity",
  "FinanceCountryPolicy",
  "FinancePlanDriver",
  "FinancePlanScenario",
  "FinanceCopilotInsight",
  "FinanceCopilotPlaybook",
  "FinanceUsageMeter",
  "FinanceUsageEvent",
  "FinanceRevenueSubledgerEntry",
  "FinanceRevenueConnector",
  "FinanceFxRate",
  "FinanceInternationalReimbursement",
  "FinanceLocalPayout",
  "FinanceIntercompanyTransfer",
  "FinanceConsolidationSnapshot",
  "FinanceTaxJurisdiction",
  "FinanceTaxTrail",
  "FinanceVendorKycReview",
  "FinanceVendorContract",
  "FinanceVendorNegotiationBenchmark",
  "FinanceDataWarehouseConnection",
  "FinanceMetricSnapshot",
  "FinanceRevenueCohort",
  "FinanceUnitBenchmark",
  "EnterpriseSsoConfig",
  "EnterpriseScimProvision",
  "EnterpriseDataRetentionPolicy",
  "EnterpriseAuditExport",
  "EnterpriseSegregationPolicy",
  "FinanceApprovalEvidence",
  "FinanceBillingPlanVersion",
  "FinanceCustomerCreditBalance",
  "FinanceRateCard",
  "FinanceInvoiceRetryAttempt",
  "FinanceWorkforcePlan",
  "FinanceScenarioMerge",
  "FinanceVarianceExplanation",
  "FinancePlanningCollaboration",
  "FinanceProcurementSignal",
  "FinanceCopilotRun",
  "FinanceCopilotCase",
  "FinanceDunningPolicy",
  "FinanceInvoiceLifecycleEvent",
  "FinanceCustomerBillingPortal",
  "FinanceProcurementInvestigation",
  "FinanceOcrLineItem",
  "FinanceVendorScorecard",
  "FinancePlanningCycle",
  "FinanceHeadcountPlanLine",
  "FinanceScenarioComparison",
  "FinanceFxExposure",
  "FinanceIntercompanySettlement",
  "FinanceTaxRegistration",
  "FinanceComplianceRun",
  "FinanceControlException",
  "FinanceCopilotRule",
  "FinanceCopilotAction",
  "FinanceApprovalGuardrail",
  "FinanceCollectionAutomation",
  "FinanceCashRebalanceInstruction",
  "FinanceCustomerUsageSnapshot",
  "FinanceInvoicePaymentSession",
  "FinanceBillingCreditApplication",
  "FinanceRetrySegmentPolicy",
  "FinanceFxAutomationRun",
  "FinanceLocalPayoutBatch",
  "FinanceIntercompanySettlementLine",
  "FinanceTaxRule",
  "FinanceConsolidationEntityBalance",
  "FinanceSegregationEnforcement",
  "FinanceEvidencePack",
  "FinanceRetentionExecution",
  "FinanceAuditPackage",
  "FinanceOcrMatchResult",
  "FinanceFraudDetectionRun",
  "FinanceVendorDynamicScore",
  "FinanceNegotiationOpportunity",
  "AutomationRule",
  "AutomationAction",
  "AutomationExecution",
]);

// ✅ Modelos GLOBAIS (não possuem companyId) — write só em contexto de sistema
const GLOBAL_MODELS = new Set(["Permission", "RolePermission"]);

function getCtx(): any {
  return (RequestContext as any).get?.() ?? {};
}

function getCompanyIdFromCtx(): string | null {
  const ctx: any = getCtx();
  const v = ctx?.companyId ?? null;
  return typeof v === "string" && v.trim().length > 0 ? v.trim() : null;
}

function getRoleFromCtx(): string | null {
  const ctx: any = getCtx();
  const r = ctx?.role ?? null;
  return typeof r === "string" && r.trim().length > 0 ? r.trim() : null;
}

function isSystemCtx(): boolean {
  const ctx: any = getCtx();
  return ctx?.isSystem === true;
}

function isTenantModel(model?: string) {
  return !!model && TENANT_MODELS.has(model);
}

function isGlobalModel(model?: string) {
  return !!model && GLOBAL_MODELS.has(model);
}

function ensureWhereCompanyId(args: any, companyId: string) {
  args.where = args.where ?? {};
  if (args.where.companyId === undefined) args.where.companyId = companyId;
}

function ensureDataCompanyId(args: any, companyId: string) {
  args.data = args.data ?? {};
  if (args.data.companyId === undefined) args.data.companyId = companyId;
}

function onlyRefreshOrLogoutFields(data: any): boolean {
  const allowed = new Set(["refreshTokenHash", "refreshTokenId"]);
  const keys = Object.keys(data ?? {});
  if (keys.length === 0) return false;
  return keys.every((k) => allowed.has(k));
}

function onlyTenantLinkFields(data: any): boolean {
  const allowed = new Set(["companyId", "branchId"]);
  const keys = Object.keys(data ?? {});
  if (keys.length === 0) return false;
  return keys.every((k) => allowed.has(k));
}

function hasValidCompanyIdInArgs(args: any): boolean {
  const cid = args?.data?.companyId;
  return typeof cid === "string" && cid.trim().length > 0;
}

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  constructor() {
    const connectionString =
      process.env.DATABASE_URL ||
      "postgresql://saas:saas_pass@localhost:5432/saas_db?schema=public";

    const adapter = new PrismaPg({ connectionString });

    super({ adapter });

    const base = this;

    const guarded = base.$extends({
      query: {
        $allModels: {
          async $allOperations(params: any) {
            const { model, operation, args, query } = params;

            if (!isTenantModel(model) && !isGlobalModel(model)) {
              return query(args);
            }

            const isRead =
              operation === "findMany" ||
              operation === "findFirst" ||
              operation === "findFirstOrThrow" ||
              operation === "findUnique" ||
              operation === "findUniqueOrThrow" ||
              operation === "count" ||
              operation === "aggregate" ||
              operation === "groupBy";

            if (isGlobalModel(model)) {
              if (isRead) return query(args);

              if (!isSystemCtx()) {
                throw new Error(
                  `[TENANT_GUARD] ${model}.${operation} bloqueado: operação global exige RequestContext(isSystem=true).`,
                );
              }

              return query(args);
            }

            const companyId = getCompanyIdFromCtx();
            const role = getRoleFromCtx();

            if (!companyId) {
              if (isRead) return query(args);

              if (model === "AuditLog" && operation === "create" && isSystemCtx()) {
                return query(args);
              }

              if (model === "User" && operation === "update" && onlyRefreshOrLogoutFields(args?.data ?? {})) {
                const whereId = args?.where?.id;

                if (typeof whereId !== "string" || whereId.trim().length === 0) {
                  throw new Error(`[TENANT_GUARD] User.update (refresh) bloqueado: exige where.id.`);
                }

                const target = await base.user.findUnique({
                  where: { id: whereId },
                  select: { id: true, role: true },
                });

                if (!target) throw new Error(`[TENANT_GUARD] User.update (refresh): usuário alvo não encontrado.`);

                if (target.role !== "ADMIN_MASTER") {
                  throw new Error(
                    `[TENANT_GUARD] User.update (refresh) bloqueado: sem companyId só pode atualizar refresh de ADMIN_MASTER.`,
                  );
                }

                return query(args);
              }

              if (role === "ADMIN_MASTER" && model === "Branch" && operation === "create") {
                if (!hasValidCompanyIdInArgs(args)) {
                  throw new Error(
                    `[TENANT_GUARD] Branch.create bloqueado: ADMIN_MASTER sem ctx.companyId precisa enviar data.companyId.`,
                  );
                }
                return query(args);
              }

              if (role === "ADMIN_MASTER" && model === "User" && operation === "update") {
                const data: any = args?.data ?? {};
                const where: any = args?.where ?? {};
                const hasId = typeof where?.id === "string" && where.id.length > 0;

                if (!hasId) {
                  throw new Error(`[TENANT_GUARD] ADMIN_MASTER bypass bloqueado: User.update exige where.id.`);
                }

                if (isSystemCtx() && onlyRefreshOrLogoutFields(data)) {
                  return query(args);
                }

                if (!onlyTenantLinkFields(data) || !hasValidCompanyIdInArgs(args)) {
                  throw new Error(
                    `[TENANT_GUARD] ADMIN_MASTER bypass bloqueado: User.update sem ctx.companyId permitido apenas para { companyId, branchId } com companyId válido.`,
                  );
                }

                const target = await base.user.findUnique({
                  where: { id: where.id },
                  select: { id: true, role: true },
                });

                if (!target) throw new Error(`[TENANT_GUARD] ADMIN_MASTER bypass: usuário alvo não encontrado.`);
                if (target.role === "ADMIN_MASTER") {
                  throw new Error(`[TENANT_GUARD] ADMIN_MASTER bypass bloqueado: não pode alterar ADMIN_MASTER.`);
                }

                return query(args);
              }

              if (isSystemCtx() && model === "User" && operation === "create") {
                const data: any = args?.data ?? {};
                const r = data?.role;
                const hasCompanyId = data?.companyId !== undefined && data?.companyId !== null;

                if (r !== "ADMIN_MASTER") {
                  throw new Error(
                    `[TENANT_GUARD] System bypass bloqueado: somente criar role=ADMIN_MASTER sem companyId.`,
                  );
                }

                if (hasCompanyId) {
                  throw new Error(`[TENANT_GUARD] System bypass bloqueado: ADMIN_MASTER não pode ter companyId.`);
                }

                return query(args);
              }

              throw new Error(
                `[TENANT_GUARD] ${model}.${operation} bloqueado: sem RequestContext(companyId).`,
              );
            }

            const a = args ?? {};

            if (isRead) {
              if (
                (operation === "findUnique" || operation === "findUniqueOrThrow") &&
                typeof a?.where?.id === "string" &&
                a.where.id.length > 0
              ) {
                const delegateKey = model!.charAt(0).toLowerCase() + model!.slice(1);
                const delegate = (base as any)[delegateKey];

                if (!delegate) {
                  throw new Error(`[TENANT_GUARD] Delegate não encontrado para model=${model}`);
                }

                const exists = await delegate.findFirst({
                  where: { id: a.where.id, companyId },
                  select: { id: true },
                });

                if (!exists) {
                  throw new Error(
                    `[TENANT_GUARD] ${model}.${operation} bloqueado: registro não pertence ao tenant.`,
                  );
                }

                return query(a);
              }

              if (operation !== "findUnique" && operation !== "findUniqueOrThrow") {
                ensureWhereCompanyId(a, companyId);
              }

              return query(a);
            }

            if (operation === "create") {
              ensureDataCompanyId(a, companyId);
              return query(a);
            }

            if (operation === "createMany" && Array.isArray(a.data)) {
              a.data = a.data.map((d: any) => {
                if (d.companyId === undefined) d.companyId = companyId;
                return d;
              });
              return query(a);
            }

            if (operation === "updateMany" || operation === "deleteMany") {
              ensureWhereCompanyId(a, companyId);
              return query(a);
            }

            if (operation === "update" || operation === "delete") {
              a.where = a.where ?? {};
              const hasId = typeof a.where.id === "string" && a.where.id.length > 0;

              if (hasId) {
                const delegateKey = model!.charAt(0).toLowerCase() + model!.slice(1);
                const delegate = (base as any)[delegateKey];

                if (!delegate) {
                  throw new Error(`[TENANT_GUARD] Delegate não encontrado para model=${model}`);
                }

                const exists = await delegate.findFirst({
                  where: { id: a.where.id, companyId },
                  select: { id: true },
                });

                if (!exists) {
                  throw new Error(
                    `[TENANT_GUARD] ${model}.${operation} bloqueado: registro não pertence ao tenant.`,
                  );
                }

                return query(a);
              }

              ensureWhereCompanyId(a, companyId);
              return query(a);
            }

            if (operation === "upsert") {
              throw new Error(
                `[TENANT_GUARD] ${model}.upsert bloqueado: use create/update (tenant-safe).`,
              );
            }

            return query(a);
          },
        },
      },
    });

    return guarded as any;
  }

  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
