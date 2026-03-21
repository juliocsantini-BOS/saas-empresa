'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  AiPriorityList,
  AlertList,
  BranchTable,
  InnovationGrid,
  ProgressBar,
  TaskList,
  formatMoney,
  formatPct,
} from './_finance/components';
import {
  loadFinanceModule,
  runFinanceBiRefresh,
  runFinanceComplianceSweep,
  runFinanceCopilotAutopilot,
  runFinanceGlobalOps,
  runFinanceRevenueOps,
  runFinanceVendorGovernance,
} from './_finance/service';
import type { FinanceModuleData, FinanceScenario } from './_finance/types';

function getErrorMessage(error: unknown, fallback: string) {
  if (error instanceof Error && error.message) return error.message;
  return fallback;
}

function Workspace({ title, metric, detail }: { title: string; metric: string; detail: string }) {
  return (
    <div className="rounded-[26px] border border-white/10 bg-white/[0.03] p-4">
      <div className="text-sm font-medium text-white">{title}</div>
      <div className="mt-4 text-2xl font-semibold text-violet-200">{metric}</div>
      <div className="mt-1 text-xs leading-5 text-zinc-500">{detail}</div>
    </div>
  );
}

function SmallStat({ label, value, hint }: { label: string; value: string; hint: string }) {
  return (
    <div className="rounded-[22px] border border-white/10 bg-black/20 p-4">
      <div className="text-[11px] uppercase tracking-[0.18em] text-zinc-500">{label}</div>
      <div className="mt-3 text-xl font-semibold text-white">{value}</div>
      <div className="mt-1 text-xs leading-5 text-zinc-500">{hint}</div>
    </div>
  );
}

function ActionButton({
  label,
  loading,
  onClick,
}: {
  label: string;
  loading: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="rounded-[22px] border border-white/10 bg-white/5 px-4 py-3 text-left text-sm text-white transition hover:border-violet-400/30 hover:bg-violet-500/10"
    >
      {loading ? 'Executando...' : label}
    </button>
  );
}

export default function FinancePage() {
  const [data, setData] = useState<FinanceModuleData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [feedback, setFeedback] = useState('');
  const [running, setRunning] = useState<string | null>(null);
  const [scenarioId, setScenarioId] = useState('touchless-push');

  async function refresh() {
    const token = localStorage.getItem('access_token');
    if (!token) {
      setError('Token não encontrado.');
      setLoading(false);
      return;
    }

    try {
      const moduleData = await loadFinanceModule({ Authorization: `Bearer ${token}` });
      setData(moduleData);
      setError('');
    } catch (err) {
      setError(getErrorMessage(err, 'Falha ao carregar o módulo financeiro.'));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refresh();
  }, []);

  const scenario = useMemo(
    () => data?.scenarios.find((item: FinanceScenario) => item.id === scenarioId) ?? null,
    [data, scenarioId],
  );

  async function executeAction(
    id: string,
    runner: (headers: Record<string, string>) => Promise<unknown>,
    message: string,
  ) {
    const token = localStorage.getItem('access_token');
    if (!token) return;

    setRunning(id);
    setFeedback('');
    try {
      await runner({ Authorization: `Bearer ${token}` });
      await refresh();
      setFeedback(message);
    } catch (err) {
      setFeedback(getErrorMessage(err, 'Falha ao executar a automação.'));
    } finally {
      setRunning(null);
    }
  }

  if (loading) {
    return (
      <div className="rounded-[32px] border border-white/10 bg-[#111113] p-5 text-sm text-zinc-300">
        Carregando cockpit financeiro...
      </div>
    );
  }

  if (!data || error) {
    return (
      <div className="rounded-[32px] border border-red-500/20 bg-red-500/10 p-5 text-sm text-red-200">
        {error || 'Falha ao montar a camada financeira.'}
      </div>
    );
  }

  const {
    overview,
    context,
    autopilot,
    revenuePanel,
    employeeExperience,
    dataPlatform,
    globalPanel,
    compliancePanel,
    procurementIntelligence,
  } = data;

  const projectedCash = scenario
    ? overview.projectedCash30d + scenario.cashDelta
    : overview.projectedCash30d;

  return (
    <div className="space-y-5">
      <section className="rounded-[36px] border border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(139,92,246,0.24),transparent_32%),linear-gradient(180deg,rgba(11,15,24,0.96),rgba(9,10,16,0.98))] p-6 shadow-[0_0_60px_rgba(139,92,246,0.12)]">
        <div className="grid gap-6 xl:grid-cols-[1.3fr,0.7fr]">
          <div>
            <div className="inline-flex rounded-full border border-violet-400/25 bg-violet-400/10 px-3 py-1 text-[11px] uppercase tracking-[0.24em] text-violet-200">
              Finance Enterprise OS
            </div>
            <h2 className="mt-4 text-3xl font-semibold tracking-tight text-white xl:text-4xl">
              CFO command center com autopilot, revenue ops e compliance
            </h2>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-zinc-300">
              O financeiro agora opera como centro de comando: copiloto executável,
              workspaces por domínio, treasury global, employee experience, vendor
              governance, BI e compliance no mesmo cockpit.
            </p>
            <div className="mt-6 grid grid-cols-2 gap-3 xl:grid-cols-4">
              <SmallStat
                label="Caixa atual"
                value={formatMoney(overview.cashBalance, overview.currency)}
                hint="Posição consolidada."
              />
              <SmallStat
                label="Caixa projetado"
                value={formatMoney(projectedCash, overview.currency)}
                hint="Com cenário selecionado."
              />
              <SmallStat
                label="Runway"
                value={`${overview.runwayMonths.toFixed(1).replace('.', ',')} meses`}
                hint="Fôlego operacional."
              />
              <SmallStat
                label="CFO score"
                value={`${overview.branchHealthScore}/100`}
                hint="Saúde do Finance OS."
              />
              <SmallStat
                label="Runs"
                value={String(compliancePanel.complianceRuns)}
                hint="Sweeps executados."
              />
              <SmallStat
                label="Exceptions"
                value={String(compliancePanel.controlExceptions)}
                hint="Controles em aberto."
              />
              <SmallStat
                label="Enforce"
                value={String(compliancePanel.sodEnforcements)}
                hint="SoD em enforcement."
              />
              <SmallStat
                label="Packs"
                value={String(compliancePanel.evidencePacks)}
                hint="Evidência pronta."
              />
              <SmallStat
                label="Retention"
                value={String(compliancePanel.retentionExecutions)}
                hint="Política executada."
              />
              <SmallStat
                label="Audit pkg"
                value={String(compliancePanel.auditPackages)}
                hint="Pacotes enterprise."
              />
              <SmallStat
                label="Runs"
                value={String(compliancePanel.complianceRuns)}
                hint="Sweeps executados."
              />
              <SmallStat
                label="Exceptions"
                value={String(compliancePanel.controlExceptions)}
                hint="Controles em aberto."
              />
              <SmallStat
                label="Enforce"
                value={String(compliancePanel.sodEnforcements)}
                hint="SoD em enforcement."
              />
              <SmallStat
                label="Packs"
                value={String(compliancePanel.evidencePacks)}
                hint="Pacotes gerados."
              />
              <SmallStat
                label="Retention ops"
                value={String(compliancePanel.retentionExecutions)}
                hint="ExecuÃ§Ã£o de polÃ­ticas."
              />
              <SmallStat
                label="Audit pkg"
                value={String(compliancePanel.auditPackages)}
                hint="Pacotes enterprise."
              />
            </div>
          </div>

          <div className="rounded-[28px] border border-white/10 bg-black/25 p-5">
            <div className="text-sm font-medium text-white">
              {context.company?.name || 'Operação atual'}
            </div>
            <div className="mt-1 text-xs text-zinc-500">
              {context.company?.sector || 'Setor não informado'} • {context.branches.length || 1}{' '}
              unidade(s) • {context.viewer.role}
            </div>
            <div className="mt-5 space-y-4">
              <div>
                <div className="mb-2 flex items-center justify-between text-xs uppercase tracking-[0.18em] text-zinc-500">
                  <span>Touchless</span>
                  <span>{formatPct(overview.touchlessRatePct)}</span>
                </div>
                <ProgressBar value={overview.touchlessRatePct} />
              </div>
              <div>
                <div className="mb-2 flex items-center justify-between text-xs uppercase tracking-[0.18em] text-zinc-500">
                  <span>Close</span>
                  <span>{formatPct(overview.closeReadinessPct)}</span>
                </div>
                <ProgressBar value={overview.closeReadinessPct} tone="amber" />
              </div>
              <div>
                <div className="mb-2 flex items-center justify-between text-xs uppercase tracking-[0.18em] text-zinc-500">
                  <span>Collections</span>
                  <span>{formatPct(overview.collectionsEfficiencyPct)}</span>
                </div>
                <ProgressBar value={overview.collectionsEfficiencyPct} tone="emerald" />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-4 xl:grid-cols-4">
        {data.workspaces.map((item) => (
          <Workspace
            key={item.id}
            title={item.title}
            metric={item.primaryMetric}
            detail={`${item.secondaryMetric} • ${item.subtitle}`}
          />
        ))}
      </section>

      <section className="grid grid-cols-1 gap-5 xl:grid-cols-[1fr,1fr]">
        <div className="rounded-[32px] border border-white/10 bg-[#111113] p-5">
          <div className="text-lg font-semibold text-white">CFO Autopilot</div>
          <div className="mt-1 text-sm text-zinc-500">
            Inbox de exceções, investigação guiada, aprovação sugerida, renegociação
            assistida e playbooks executáveis.
          </div>

          <div className="mt-5 grid gap-3 md:grid-cols-2">
            {autopilot.exceptionInbox.slice(0, 4).map((item) => (
              <div key={item.id} className="rounded-[22px] border border-white/10 bg-black/20 p-4">
                <div className="text-sm font-medium text-white">{item.title}</div>
                <div className="mt-2 text-sm leading-6 text-zinc-400">{item.detail}</div>
                <div className="mt-3 text-xs uppercase tracking-[0.18em] text-violet-200">
                  {item.owner}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-5 grid gap-3 md:grid-cols-2">
            <SmallStat
              label="Autopilot runs"
              value={String(autopilot.copilotRuns)}
              hint="Execuções recentes."
            />
            <SmallStat
              label="Open cases"
              value={String(autopilot.openCases)}
              hint="Investigações abertas."
            />
            <SmallStat
              label="Rules"
              value={String(autopilot.rules)}
              hint="Regras do Copilot."
            />
            <SmallStat
              label="Actions"
              value={String(autopilot.queuedActions)}
              hint="Fila pronta."
            />
            <SmallStat
              label="Guardrails"
              value={String(autopilot.approvalGuardrails)}
              hint="Aprovação protegida."
            />
            <SmallStat
              label="Collections"
              value={String(autopilot.collectionAutomations)}
              hint="Cobrança por regra."
            />
            <SmallStat
              label="Rebalances"
              value={String(autopilot.cashRebalances)}
              hint="Caixa pronto."
            />
            {autopilot.guidedInvestigations.slice(0, 2).map((item) => (
              <div
                key={item.id}
                className="rounded-[22px] border border-violet-400/15 bg-violet-500/5 p-4"
              >
                <div className="text-xs uppercase tracking-[0.18em] text-violet-200">
                  {item.riskLevel}
                </div>
                <div className="mt-2 text-sm font-medium text-white">{item.title}</div>
                <div className="mt-2 text-sm leading-6 text-zinc-400">{item.summary}</div>
                <div className="mt-3 text-xs uppercase tracking-[0.18em] text-zinc-500">
                  {item.actionLabel}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            <ActionButton
              label="Rodar Autopilot"
              loading={running === 'copilot'}
              onClick={() =>
                executeAction('copilot', runFinanceCopilotAutopilot, 'CFO Autopilot executado.')
              }
            />
            <ActionButton
              label="Rodar Revenue Ops"
              loading={running === 'revenue'}
              onClick={() =>
                executeAction('revenue', runFinanceRevenueOps, 'Revenue Ops executado.')
              }
            />
            <ActionButton
              label="Rodar Global Ops"
              loading={running === 'global'}
              onClick={() => executeAction('global', runFinanceGlobalOps, 'Global Ops executado.')}
            />
            <ActionButton
              label="Rodar Vendor Governance"
              loading={running === 'vendor'}
              onClick={() =>
                executeAction('vendor', runFinanceVendorGovernance, 'Vendor Governance executado.')
              }
            />
            <ActionButton
              label="Atualizar BI"
              loading={running === 'bi'}
              onClick={() => executeAction('bi', runFinanceBiRefresh, 'BI refresh executado.')}
            />
            <ActionButton
              label="Rodar Compliance"
              loading={running === 'compliance'}
              onClick={() =>
                executeAction('compliance', runFinanceComplianceSweep, 'Compliance sweep executado.')
              }
            />
          </div>

          {feedback ? (
            <div className="mt-4 rounded-[20px] border border-violet-400/20 bg-violet-500/10 px-4 py-3 text-sm text-violet-100">
              {feedback}
            </div>
          ) : null}
        </div>

        <div className="rounded-[32px] border border-white/10 bg-[#111113] p-5">
          <div className="text-lg font-semibold text-white">Treasury cockpit</div>
          <div className="mt-1 text-sm text-zinc-500">
            Liquidez, cobrança, approvals e automação em visão executiva compacta.
          </div>
          <div className="mt-5 grid grid-cols-2 gap-3 xl:grid-cols-4">
            <SmallStat
              label="Entradas 30d"
              value={formatMoney(overview.inflows30d, overview.currency)}
              hint="Recebíveis previstos."
            />
            <SmallStat
              label="Saídas 30d"
              value={formatMoney(overview.outflows30d, overview.currency)}
              hint="Compromissos projetados."
            />
            <SmallStat
              label="AR atraso"
              value={formatMoney(overview.overdueReceivables, overview.currency)}
              hint="Cobrança assistida."
            />
            <SmallStat
              label="Aprovações"
              value={String(overview.approvalBacklog)}
              hint="Backlog atual."
            />
          </div>

          <div className="mt-5 grid gap-3 md:grid-cols-2">
            {autopilot.suggestedApprovals.slice(0, 2).map((item) => (
              <div key={item.id} className="rounded-[22px] border border-white/10 bg-black/20 p-4">
                <div className="text-xs uppercase tracking-[0.18em] text-zinc-500">
                  Aprovação sugerida
                </div>
                <div className="mt-2 text-sm font-medium text-white">{item.title}</div>
                <div className="mt-2 text-sm leading-6 text-zinc-400">{item.rationale}</div>
                <div className="mt-3 text-xs uppercase tracking-[0.18em] text-violet-200">
                  {item.owner} • {formatMoney(item.amount, overview.currency)}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-5">
            <TaskList tasks={data.tasks.slice(0, 6)} currency={overview.currency} />
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-5 xl:grid-cols-12">
        <div className="space-y-5 xl:col-span-7">
          <div className="rounded-[32px] border border-white/10 bg-[#111113] p-5">
            <div className="text-lg font-semibold text-white">Revenue engine</div>
            <div className="mt-1 text-sm text-zinc-500">
              Planos híbridos, versionamento, credits, rate cards, subledger, dunning e
              lifecycle de invoice.
            </div>
            <div className="mt-5 grid grid-cols-2 gap-3 xl:grid-cols-4">
              <SmallStat label="Plans" value={String(revenuePanel.activePlans)} hint="Billing ativo." />
              <SmallStat
                label="Versions"
                value={String(revenuePanel.billingPlanVersions)}
                hint="Versionamento do pricing."
              />
              <SmallStat
                label="Credits"
                value={String(revenuePanel.customerCredits)}
                hint="Prepaid e saldo de cliente."
              />
              <SmallStat
                label="Rate cards"
                value={String(revenuePanel.rateCards)}
                hint="Precificação por uso."
              />
              <SmallStat label="Usage" value={String(revenuePanel.usageEvents)} hint="Eventos consumidos." />
              <SmallStat
                label="Subledger"
                value={String(revenuePanel.subledgerEntries)}
                hint="Receita reconhecida."
              />
              <SmallStat
                label="Overdue"
                value={String(revenuePanel.overdueInvoices)}
                hint="Dunning e cobrança."
              />
              <SmallStat
                label="Dunning"
                value={String(revenuePanel.dunningPolicies)}
                hint="PolÃ­ticas ativas."
              />
              <SmallStat
                label="Retries"
                value={String(revenuePanel.retryAttempts)}
                hint="Retry strategy ativa."
              />
              <SmallStat
                label="Lifecycle"
                value={String(revenuePanel.lifecycleEvents)}
                hint="Eventos da invoice."
              />
              <SmallStat
                label="Portals"
                value={String(revenuePanel.billingPortals)}
                hint="Billing self-serve."
              />
              <SmallStat
                label="Usage snapshots"
                value={String(revenuePanel.usageSnapshots)}
                hint="Uso por cliente."
              />
              <SmallStat
                label="Pay sessions"
                value={String(revenuePanel.paymentSessions)}
                hint="Pagamento self-serve."
              />
              <SmallStat
                label="Credit apply"
                value={String(revenuePanel.creditApplications)}
                hint="Créditos automáticos."
              />
              <SmallStat
                label="Retry policy"
                value={String(revenuePanel.retryPolicies)}
                hint="Segmentos configurados."
              />
              <SmallStat
                label="Draft/Open"
                value={String(revenuePanel.draftInvoices)}
                hint="Invoices em fluxo."
              />
              <SmallStat
                label="Connectors"
                value={String(revenuePanel.connectors)}
                hint="Receita externa ligada."
              />
              <SmallStat
                label="Smart notes"
                value={String(revenuePanel.smartNotesCoverage)}
                hint="Invoice intelligence."
              />
              <SmallStat
                label="Meters"
                value={String(revenuePanel.usageMeters)}
                hint="Usage-based billing."
              />
            </div>
          </div>

          <div className="rounded-[32px] border border-white/10 bg-[#111113] p-5">
            <div className="text-lg font-semibold text-white">Travel & spend employee experience</div>
            <div className="mt-1 text-sm text-zinc-500">
              Assistente de despesa, política em linguagem natural e menos atrito de reembolso.
            </div>
            <div className="mt-5 grid grid-cols-2 gap-3 xl:grid-cols-4">
              <SmallStat label="Travel" value={String(employeeExperience.activeTrips)} hint="Viagens ativas." />
              <SmallStat
                label="Bookings"
                value={String(employeeExperience.activeBookings)}
                hint="Reservas em curso."
              />
              <SmallStat
                label="Reports"
                value={String(employeeExperience.expenseReports)}
                hint="Despesas submetidas."
              />
              <SmallStat
                label="Cards"
                value={String(employeeExperience.corporateCards)}
                hint="Cartões corporativos."
              />
              <SmallStat
                label="Advances"
                value={String(employeeExperience.unsettledAdvances)}
                hint="Adiantamentos abertos."
              />
              <SmallStat
                label="Pendências"
                value={String(employeeExperience.pendingExpenseReports)}
                hint="Aguardando revisão."
              />
              <SmallStat
                label="Policies"
                value={String(employeeExperience.travelPolicies)}
                hint="Políticas ativas."
              />
              <SmallStat
                label="Assistant"
                value={String(employeeExperience.assistantMoments.length)}
                hint="Momentos guiados."
              />
            </div>
          </div>

          <div className="rounded-[32px] border border-white/10 bg-[#111113] p-5">
            <div className="text-lg font-semibold text-white">Data platform + BI executivo</div>
            <div className="mt-1 text-sm text-zinc-500">
              Snapshots, cohorts, workforce, scenario merge e explainability de variação.
            </div>
            <div className="mt-5 grid grid-cols-2 gap-3 xl:grid-cols-3">
              <SmallStat
                label="Warehouses"
                value={String(dataPlatform.warehouseConnections)}
                hint="Conexões ativas."
              />
              <SmallStat
                label="Snapshots"
                value={String(dataPlatform.metricSnapshots)}
                hint="Histórico versionado."
              />
              <SmallStat
                label="Cohorts"
                value={String(dataPlatform.revenueCohorts)}
                hint="Receita e gasto."
              />
              <SmallStat
                label="Benchmarks"
                value={String(dataPlatform.unitBenchmarks)}
                hint="Comparação interna."
              />
              <SmallStat
                label="Scenarios"
                value={String(dataPlatform.scenarioCount)}
                hint="Planejamento em curso."
              />
              <SmallStat
                label="Drivers"
                value={String(dataPlatform.driverCount)}
                hint="Driver-based planning."
              />
              <SmallStat
                label="Workforce"
                value={String(dataPlatform.workforcePlans)}
                hint="Headcount e payroll."
              />
              <SmallStat
                label="Merges"
                value={String(dataPlatform.scenarioMerges)}
                hint="Scenario merge ativo."
              />
              <SmallStat
                label="Variance"
                value={String(dataPlatform.openVarianceExplanations)}
                hint="Explainability aberta."
              />
              <SmallStat
                label="Threads"
                value={String(dataPlatform.collaborationThreads)}
                hint="Colaboração entre áreas."
              />
              <SmallStat
                label="Cycles"
                value={String(dataPlatform.planningCycles)}
                hint="Ciclos ativos."
              />
              <SmallStat
                label="Headcount"
                value={String(dataPlatform.headcountLines)}
                hint="Linhas planejadas."
              />
              <SmallStat
                label="Comparisons"
                value={String(dataPlatform.scenarioComparisons)}
                hint="CenÃ¡rios comparados."
              />
            </div>
          </div>
        </div>

        <div className="space-y-5 xl:col-span-5">
          <div className="rounded-[32px] border border-white/10 bg-[#111113] p-5">
            <div className="text-lg font-semibold text-white">Global finance enterprise</div>
            <div className="mt-1 text-sm text-zinc-500">
              FX, payouts locais, intercompany, consolidaÃ§Ã£o e trilha tributÃ¡ria por jurisdiÃ§Ã£o.
            </div>
            <div className="mt-5 grid grid-cols-2 gap-3">
              <SmallStat label="Entities" value={String(globalPanel.globalEntities)} hint="Entidades ativas." />
              <SmallStat
                label="Country rules"
                value={String(globalPanel.countryPolicies)}
                hint="PolÃ­ticas por paÃ­s."
              />
              <SmallStat label="FX exposure" value={String(globalPanel.fxExposures)} hint="ExposiÃ§Ã£o aberta." />
              <SmallStat
                label="Intercompany"
                value={String(globalPanel.intercompanySettlements)}
                hint="Settlements pendentes."
              />
              <SmallStat
                label="Tax regs"
                value={String(globalPanel.taxRegistrations)}
                hint="Registros tributÃ¡rios."
              />
              <SmallStat label="Payouts" value={String(globalPanel.pendingPayouts)} hint="PendÃªncias locais." />
              <SmallStat
                label="Reimburse"
                value={String(globalPanel.pendingReimbursements)}
                hint="Internacionais em aberto."
              />
              <SmallStat
                label="FX runs"
                value={String(globalPanel.fxAutomationRuns)}
                hint="Conversão automática."
              />
              <SmallStat
                label="Batches"
                value={String(globalPanel.payoutBatches)}
                hint="Payouts agrupados."
              />
              <SmallStat
                label="Settle lines"
                value={String(globalPanel.settlementLines)}
                hint="Detalhe intercompany."
              />
              <SmallStat
                label="Tax rules"
                value={String(globalPanel.taxRules)}
                hint="Jurisdictions ativas."
              />
              <SmallStat
                label="Entity bal."
                value={String(globalPanel.entityBalances)}
                hint="Consolidação por entidade."
              />
            </div>
          </div>

          <div className="rounded-[32px] border border-white/10 bg-[#111113] p-5">
            <div className="text-lg font-semibold text-white">Compliance hub</div>
            <div className="mt-1 text-sm text-zinc-500">
              SSO, SCIM, SoD, retenção, audit export e approval evidence.
            </div>
            <div className="mt-5 grid grid-cols-2 gap-3">
              <SmallStat label="SSO" value={String(compliancePanel.sso)} hint="Identity providers." />
              <SmallStat label="SCIM" value={String(compliancePanel.scim)} hint="Provisionamento." />
              <SmallStat
                label="Retention"
                value={String(compliancePanel.retentionPolicies)}
                hint="Políticas ativas."
              />
              <SmallStat
                label="Audit export"
                value={String(compliancePanel.auditExports)}
                hint="Exports em fila."
              />
              <SmallStat
                label="SoD"
                value={String(compliancePanel.segregationPolicies)}
                hint="Políticas de conflito."
              />
              <SmallStat
                label="Evidences"
                value={String(compliancePanel.pendingApprovalEvidences)}
                hint="Pendências de aprovação."
              />
            </div>
          </div>

          <div className="rounded-[32px] border border-white/10 bg-[#111113] p-5">
            <div className="text-lg font-semibold text-white">Procurement / AP intelligence</div>
            <div className="mt-1 text-sm text-zinc-500">
              OCR, mismatch, fraude, overbilling e drill-down de exceções de compra.
            </div>
            <div className="mt-5 grid grid-cols-2 gap-3">
              <SmallStat
                label="OCR pendente"
                value={String(procurementIntelligence.vendorDocsPending)}
                hint="Revisão documental."
              />
              <SmallStat
                label="Queue"
                value={String(procurementIntelligence.procurementQueue)}
                hint="Solicitações em fila."
              />
              <SmallStat
                label="PO"
                value={String(procurementIntelligence.purchaseOrders)}
                hint="Pedidos em ciclo."
              />
              <SmallStat
                label="Mismatch"
                value={String(procurementIntelligence.mismatchSignals)}
                hint="Diferenças detectadas."
              />
              <SmallStat
                label="Fraud watch"
                value={String(procurementIntelligence.fraudSignals)}
                hint="Sinais anômalos."
              />
              <SmallStat
                label="Overbilling"
                value={String(procurementIntelligence.overbillingWatch)}
                hint="Benchmarks abertos."
              />
              <SmallStat
                label="Signals"
                value={String(procurementIntelligence.openSignals)}
                hint="Inbox de procurement."
              />
              <SmallStat
                label="Investigations"
                value={String(procurementIntelligence.investigations)}
                hint="Casos abertos."
              />
              <SmallStat
                label="OCR items"
                value={String(procurementIntelligence.ocrLineItems)}
                hint="Itens extraÃ­dos."
              />
              <SmallStat
                label="Scorecards"
                value={String(procurementIntelligence.vendorScorecards)}
                hint="AvaliaÃ§Ã£o de fornecedor."
              />
              <SmallStat
                label="Match"
                value={String(procurementIntelligence.matchResults)}
                hint="OCR com drill-down."
              />
              <SmallStat
                label="Fraud runs"
                value={String(procurementIntelligence.fraudRuns)}
                hint="Scan inteligente."
              />
              <SmallStat
                label="Dyn score"
                value={String(procurementIntelligence.dynamicScores)}
                hint="Score dinâmico."
              />
              <SmallStat
                label="Negotiation"
                value={String(procurementIntelligence.negotiationOpportunities)}
                hint="Benchmark acionável."
              />
            </div>
            <div className="mt-5 grid gap-3">
              {autopilot.suggestedNegotiations.slice(0, 2).map((item) => (
                <div key={item.id} className="rounded-[22px] border border-white/10 bg-black/20 p-4">
                  <div className="text-xs uppercase tracking-[0.18em] text-zinc-500">
                    Renegociação sugerida
                  </div>
                  <div className="mt-2 text-sm font-medium text-white">{item.title}</div>
                  <div className="mt-3 text-xs uppercase tracking-[0.18em] text-violet-200">
                    {formatMoney(item.savingsPotential, overview.currency)} • {item.status}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[32px] border border-white/10 bg-[#111113] p-5">
            <div className="text-lg font-semibold text-white">Simulação executiva</div>
            <div className="mt-4 grid gap-3">
              {data.scenarios.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setScenarioId(item.id)}
                  className={`rounded-[22px] border px-4 py-3 text-left text-sm ${
                    scenarioId === item.id
                      ? 'border-violet-400/30 bg-violet-500/10 text-white'
                      : 'border-white/10 bg-black/20 text-zinc-300'
                  }`}
                >
                  <div className="font-medium">{item.title}</div>
                  <div className="mt-1 text-xs leading-5 text-zinc-500">{item.description}</div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-5 xl:grid-cols-12">
        <div className="space-y-5 xl:col-span-7">
          <div className="rounded-[32px] border border-white/10 bg-[#111113] p-5">
            <div className="text-lg font-semibold text-white">Benchmark entre unidades</div>
            <div className="mt-5">
              <BranchTable branches={data.branchSnapshots} currency={overview.currency} />
            </div>
          </div>
          <div className="rounded-[32px] border border-white/10 bg-[#111113] p-5">
            <div className="text-lg font-semibold text-white">Alertas do copiloto financeiro</div>
            <div className="mt-5">
              <AlertList alerts={data.alerts} />
            </div>
          </div>
        </div>

        <div className="space-y-5 xl:col-span-5">
          <div className="rounded-[32px] border border-white/10 bg-[#111113] p-5">
            <div className="text-lg font-semibold text-white">Prioridades da IA</div>
            <div className="mt-5">
              <AiPriorityList priorities={data.aiPriorities} />
            </div>
          </div>
          <div className="rounded-[32px] border border-white/10 bg-[#111113] p-5">
            <div className="text-lg font-semibold text-white">Innovation stack</div>
            <div className="mt-5">
              <InnovationGrid items={data.innovations} />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
