import type { ReactNode } from 'react';
import { STATUS_LABELS } from './constants';
import type { CrmStats, LeadStatus } from './types';
import { formatCurrency } from './utils';

export function CrmStyles() {
  return (
    <style jsx>{`
      .crm-scroll {
        scrollbar-width: thin;
        scrollbar-color: rgba(139, 92, 246, 0.35) rgba(255, 255, 255, 0.04);
      }

      .crm-scroll-x {
        scrollbar-width: thin;
        scrollbar-color: rgba(139, 92, 246, 0.35) rgba(255, 255, 255, 0.04);
      }

      .crm-scroll::-webkit-scrollbar {
        width: 10px;
      }

      .crm-scroll-x::-webkit-scrollbar {
        height: 10px;
      }

      .crm-scroll::-webkit-scrollbar-track {
        background: rgba(255, 255, 255, 0.04);
        border-radius: 999px;
      }

      .crm-scroll-x::-webkit-scrollbar-track {
        background: rgba(255, 255, 255, 0.04);
        border-radius: 999px;
      }

      .crm-scroll::-webkit-scrollbar-thumb {
        background: linear-gradient(
          180deg,
          rgba(139, 92, 246, 0.45),
          rgba(139, 92, 246, 0.2)
        );
        border-radius: 999px;
        border: 2px solid rgba(17, 17, 19, 0.95);
        box-shadow: 0 0 12px rgba(139, 92, 246, 0.12);
      }

      .crm-scroll-x::-webkit-scrollbar-thumb {
        background: linear-gradient(
          90deg,
          rgba(139, 92, 246, 0.45),
          rgba(139, 92, 246, 0.2)
        );
        border-radius: 999px;
        border: 2px solid rgba(17, 17, 19, 0.95);
        box-shadow: 0 0 12px rgba(139, 92, 246, 0.12);
      }

      .crm-scroll::-webkit-scrollbar-thumb:hover {
        background: linear-gradient(
          180deg,
          rgba(139, 92, 246, 0.65),
          rgba(139, 92, 246, 0.28)
        );
      }

      .crm-scroll-x::-webkit-scrollbar-thumb:hover {
        background: linear-gradient(
          90deg,
          rgba(139, 92, 246, 0.65),
          rgba(139, 92, 246, 0.28)
        );
      }

      :global(.crm-dashboard-shell select),
      :global(.crm-dashboard-shell input:not([type='checkbox']):not([type='radio'])),
      :global(.crm-dashboard-shell textarea) {
        color-scheme: dark;
        color: #f8fafc !important;
        background-color: rgba(11, 15, 24, 0.9) !important;
        background-image: linear-gradient(
          180deg,
          rgba(255, 255, 255, 0.045),
          rgba(255, 255, 255, 0.018)
        ) !important;
        border-color: rgba(255, 255, 255, 0.09) !important;
        border-radius: 18px;
        box-shadow:
          inset 0 1px 0 rgba(255, 255, 255, 0.045),
          inset 0 -1px 0 rgba(255, 255, 255, 0.015),
          0 14px 34px rgba(0, 0, 0, 0.22);
        transition:
          border-color 180ms ease,
          background-color 180ms ease,
          box-shadow 180ms ease,
          transform 180ms ease;
      }

      :global(.crm-dashboard-shell select) {
        appearance: none;
        -webkit-appearance: none;
        -moz-appearance: none;
        background-image:
          linear-gradient(180deg, rgba(255, 255, 255, 0.045), rgba(255, 255, 255, 0.018)),
          radial-gradient(circle at top left, rgba(44, 139, 255, 0.1), transparent 55%),
          url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='18' height='18' viewBox='0 0 20 20' fill='none'%3E%3Cpath d='M5.5 7.25L10 11.75L14.5 7.25' stroke='%23B5C5E8' stroke-width='1.7' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E") !important;
        background-repeat: no-repeat, no-repeat;
        background-position: center, center, right 0.95rem center;
        background-size: auto, auto, 1rem;
        padding-right: 2.8rem;
      }

      :global(.crm-dashboard-shell input[type='date']),
      :global(.crm-dashboard-shell input[type='datetime-local']) {
        appearance: none;
        -webkit-appearance: none;
        min-height: 48px;
        width: 100%;
        min-width: 0;
        padding-right: 3.2rem;
        background-image:
          linear-gradient(180deg, rgba(255, 255, 255, 0.045), rgba(255, 255, 255, 0.018)),
          radial-gradient(circle at top left, rgba(44, 139, 255, 0.1), transparent 55%),
          url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='18' height='18' viewBox='0 0 20 20' fill='none'%3E%3Cpath d='M6.5 3.75V5.25M13.5 3.75V5.25M4.75 7.25H15.25M5.75 16.25H14.25C15.0784 16.25 15.75 15.5784 15.75 14.75V6.75C15.75 5.92157 15.0784 5.25 14.25 5.25H5.75C4.92157 5.25 4.25 5.92157 4.25 6.75V14.75C4.25 15.5784 4.92157 16.25 5.75 16.25Z' stroke='%23B5C5E8' stroke-width='1.4' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E") !important;
        background-repeat: no-repeat, no-repeat, no-repeat;
        background-position: center, center, right 0.85rem center;
        background-size: auto, auto, 1rem;
      }

      :global(.crm-dashboard-shell input::placeholder),
      :global(.crm-dashboard-shell textarea::placeholder) {
        color: rgba(148, 163, 184, 0.72) !important;
      }

      :global(.crm-dashboard-shell select:hover),
      :global(.crm-dashboard-shell input:not([type='checkbox']):not([type='radio']):hover),
      :global(.crm-dashboard-shell textarea:hover) {
        border-color: rgba(255, 255, 255, 0.16) !important;
        background-color: rgba(14, 20, 31, 0.96) !important;
        box-shadow:
          inset 0 1px 0 rgba(255, 255, 255, 0.05),
          0 16px 38px rgba(0, 0, 0, 0.26);
      }

      :global(.crm-dashboard-shell select:focus),
      :global(.crm-dashboard-shell input:not([type='checkbox']):not([type='radio']):focus),
      :global(.crm-dashboard-shell textarea:focus) {
        outline: none;
        border-color: rgba(44, 139, 255, 0.42) !important;
        background-color: rgba(15, 23, 36, 0.98) !important;
        box-shadow:
          inset 0 1px 0 rgba(255, 255, 255, 0.06),
          0 0 0 1px rgba(44, 139, 255, 0.18),
          0 0 0 4px rgba(44, 139, 255, 0.08),
          0 18px 44px rgba(0, 0, 0, 0.28);
        transform: translateY(-1px);
      }

      :global(.crm-dashboard-shell select option),
      :global(.crm-dashboard-shell select optgroup) {
        background: #0b1220;
        color: #eef2ff;
      }

      :global(.crm-dashboard-shell input[type='date']::-webkit-calendar-picker-indicator),
      :global(.crm-dashboard-shell input[type='datetime-local']::-webkit-calendar-picker-indicator) {
        opacity: 0;
        display: block;
        width: 2.25rem;
        height: 2.25rem;
        cursor: pointer;
      }

      :global(.crm-dashboard-shell input[type='date']::-webkit-datetime-edit),
      :global(.crm-dashboard-shell input[type='date']::-webkit-datetime-edit-text),
      :global(.crm-dashboard-shell input[type='date']::-webkit-datetime-edit-month-field),
      :global(.crm-dashboard-shell input[type='date']::-webkit-datetime-edit-day-field),
      :global(.crm-dashboard-shell input[type='date']::-webkit-datetime-edit-year-field),
      :global(.crm-dashboard-shell input[type='datetime-local']::-webkit-datetime-edit),
      :global(.crm-dashboard-shell input[type='datetime-local']::-webkit-datetime-edit-text),
      :global(.crm-dashboard-shell input[type='datetime-local']::-webkit-datetime-edit-month-field),
      :global(.crm-dashboard-shell input[type='datetime-local']::-webkit-datetime-edit-day-field),
      :global(.crm-dashboard-shell input[type='datetime-local']::-webkit-datetime-edit-year-field),
      :global(.crm-dashboard-shell input[type='datetime-local']::-webkit-datetime-edit-hour-field),
      :global(.crm-dashboard-shell input[type='datetime-local']::-webkit-datetime-edit-minute-field) {
        color: #eef2ff;
      }

      :global(.crm-dashboard-shell input[type='date']::-webkit-datetime-edit-fields-wrapper),
      :global(.crm-dashboard-shell input[type='datetime-local']::-webkit-datetime-edit-fields-wrapper) {
        padding-right: 0.35rem;
      }

      :global(.crm-dashboard-shell select::-ms-expand) {
        display: none;
      }
    `}</style>
  );
}

export function CrmPanel({
  children,
  className = '',
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`relative overflow-hidden rounded-[32px] border border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(139,92,246,0.08),transparent_30%),radial-gradient(circle_at_top_right,rgba(109,120,255,0.08),transparent_26%),linear-gradient(180deg,rgba(17,17,19,0.98),rgba(11,11,13,0.98))] shadow-[0_24px_80px_rgba(0,0,0,0.34)] before:pointer-events-none before:absolute before:inset-x-10 before:top-0 before:h-px before:bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.16),transparent)] ${className}`}
    >
      {children}
    </div>
  );
}

export function CrmSectionHeader({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-7 flex flex-wrap items-start justify-between gap-4">
      <div className="max-w-3xl">
        {eyebrow ? (
          <div className="inline-flex items-center rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-[10px] font-medium uppercase tracking-[0.24em] text-[#A7B3AC] shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
            {eyebrow}
          </div>
        ) : null}
        <div className="mt-3 text-[22px] font-semibold tracking-[-0.04em] text-white md:text-[24px]">
          {title}
        </div>
        {description ? (
          <div className="mt-2 max-w-2xl text-sm leading-6 text-zinc-500 md:text-[15px]">
            {description}
          </div>
        ) : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}

export function CrmMetricCard({
  label,
  value,
  helper,
  accent = 'default',
}: {
  label: string;
  value: string | number;
  helper: string;
  accent?: 'default' | 'success' | 'danger' | 'attention';
}) {
  const valueClass =
    accent === 'success'
      ? 'text-[#8B5CF6]'
      : accent === 'danger'
        ? 'text-red-300'
        : accent === 'attention'
          ? 'text-amber-200'
          : 'text-white';

  return (
    <div className="group relative flex h-full min-h-[132px] flex-col overflow-hidden rounded-[26px] border border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(139,92,246,0.11),transparent_34%),linear-gradient(180deg,rgba(255,255,255,0.045),rgba(255,255,255,0.02))] p-3.5 shadow-[0_18px_42px_rgba(0,0,0,0.16)] transition duration-200 hover:-translate-y-0.5 hover:border-white/15">
      <div className="pointer-events-none absolute inset-x-8 top-0 h-px bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.18),transparent)]" />
      <div className="text-[11px] uppercase tracking-[0.22em] text-zinc-500">{label}</div>
      <div className={`mt-3 text-[27px] font-semibold tracking-[-0.04em] ${valueClass}`}>{value}</div>
      <div className="mt-auto pt-2.5 text-[13px] leading-5 text-zinc-400">{helper}</div>
    </div>
  );
}

export function CrmInsightCard({
  label,
  value,
  helper,
}: {
  label: string;
  value: string;
  helper: string;
}) {
  return (
    <div className="h-full rounded-[24px] border border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(139,92,246,0.1),transparent_45%),linear-gradient(180deg,rgba(255,255,255,0.04),rgba(0,0,0,0.14))] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]">
      <div className="text-[11px] uppercase tracking-[0.2em] text-zinc-500">{label}</div>
      <div className="mt-3 text-sm font-medium leading-6 text-white">{value}</div>
      <div className="mt-2 text-xs leading-5 text-zinc-500">{helper}</div>
    </div>
  );
}

export function CrmQuickActionButton({
  label,
  onClick,
  emphasis = 'default',
}: {
  label: string;
  onClick?: () => void;
  emphasis?: 'default' | 'primary';
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={
        emphasis === 'primary'
          ? 'group w-full rounded-[22px] border border-[#8B5CF6]/20 bg-[radial-gradient(circle_at_left,rgba(139,92,246,0.16),transparent_70%),linear-gradient(180deg,rgba(139,92,246,0.11),rgba(139,92,246,0.06))] px-4 py-3.5 text-left text-sm font-medium text-white transition hover:-translate-y-0.5 hover:border-[#8B5CF6]/35 hover:bg-[radial-gradient(circle_at_left,rgba(139,92,246,0.2),transparent_72%),linear-gradient(180deg,rgba(139,92,246,0.15),rgba(139,92,246,0.08))]'
          : 'group w-full rounded-[22px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.05),rgba(255,255,255,0.025))] px-4 py-3.5 text-left text-sm text-white transition hover:-translate-y-0.5 hover:bg-[linear-gradient(180deg,rgba(255,255,255,0.08),rgba(255,255,255,0.035))]'
      }
    >
      <span className="flex items-center justify-between gap-3">
        <span>{label}</span>
        <span className="text-xs text-zinc-500 transition group-hover:text-zinc-300">↗</span>
      </span>
    </button>
  );
}

export function CrmProbabilityBar({ value }: { value: number }) {
  const safe = Math.max(0, Math.min(100, Math.round(value)));
  return (
    <div>
      <div className="mb-2 flex items-center justify-between text-[11px] uppercase tracking-[0.18em] text-zinc-500">
        <span>Probabilidade</span>
        <span className="text-white">{safe}%</span>
      </div>
      <div className="h-2 rounded-full bg-white/8">
        <div
          className="h-2 rounded-full bg-[linear-gradient(90deg,#8B5CF6,#DDD6FE)] shadow-[0_0_16px_rgba(139,92,246,0.22)]"
          style={{ width: `${safe}%` }}
        />
      </div>
    </div>
  );
}

export function CrmStageExecutiveChip({
  status,
  count,
  value,
  forecast,
}: {
  status: LeadStatus;
  count: number;
  value: number;
  forecast: number;
}) {
  return (
    <div className="rounded-[24px] border border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(139,92,246,0.08),transparent_42%),linear-gradient(180deg,rgba(255,255,255,0.04),rgba(0,0,0,0.14))] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]">
      <div className="text-[11px] uppercase tracking-[0.2em] text-zinc-500">{STATUS_LABELS[status]}</div>
      <div className="mt-3 text-2xl font-semibold tracking-[-0.03em] text-white">{count}</div>
      <div className="mt-2 text-sm text-zinc-400">{formatCurrency(value)} em pipeline</div>
      <div className="mt-1 text-xs text-zinc-500">Forecast {formatCurrency(forecast)}</div>
    </div>
  );
}

export function CrmExecutiveHero({
  stats,
  topOwner,
  dominantStatus,
  quickCharts,
  onAddLead,
  onViewPipeline,
  onManagePipeline,
}: {
  stats: CrmStats;
  topOwner: [string, number] | null;
  dominantStatus: LeadStatus;
  quickCharts?: Array<{
    label: string;
    helper: string;
    value: number;
    valueLabel: string;
  }>;
  onAddLead: () => void;
  onViewPipeline: () => void;
  onManagePipeline?: () => void;
}) {
  const safeCharts = (quickCharts || [])
    .filter((item) => Number.isFinite(item.value) && item.value >= 0)
    .slice(0, 3);
  const maxChartValue = safeCharts.reduce((max, item) => Math.max(max, item.value), 0);

  return (
    <div className="grid items-start gap-3 xl:grid-cols-[minmax(0,1.5fr)_minmax(300px,0.82fr)]">
        <div className="relative overflow-hidden rounded-[28px] border border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(139,92,246,0.18),transparent_34%),radial-gradient(circle_at_top_right,rgba(93,156,255,0.12),transparent_30%),linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0.02))] p-4">
          <div className="pointer-events-none absolute inset-x-10 top-0 h-px bg-[linear-gradient(90deg,transparent,rgba(139,92,246,0.5),transparent)]" />
          <div className="inline-flex items-center gap-2 rounded-full border border-[#8B5CF6]/20 bg-[#8B5CF6]/10 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.22em] text-[#E9DDFF]">
            <span className="h-1.5 w-1.5 rounded-full bg-[#8B5CF6] shadow-[0_0_14px_rgba(196,181,253,0.9)]" />
            CRM Enterprise
          </div>

          <div className="mt-3.5 max-w-3xl text-[26px] font-semibold leading-[0.98] tracking-[-0.05em] text-white md:text-[32px]">
            Um pipeline comercial com leitura executiva, previsão de receita e ação imediata.
          </div>

          <div className="mt-3 max-w-2xl text-[13.5px] leading-6 text-zinc-400">
            Seu CRM mostra valor estimado, forecast ponderado e sinais reais de prioridade.
            Isso aumenta a percepção de produto internacional e melhora a tomada de decisão do time.
          </div>

          <div className="mt-3.5 flex flex-wrap gap-2 text-[10px] uppercase tracking-[0.18em] text-zinc-400">
            <div className="rounded-full border border-white/10 bg-black/20 px-4 py-2 backdrop-blur-sm">
              Pipeline orientado por receita
            </div>
            <div className="rounded-full border border-white/10 bg-black/20 px-4 py-2 backdrop-blur-sm">
              Leitura executiva em tempo real
            </div>
            <div className="rounded-full border border-[#8B5CF6]/15 bg-[#8B5CF6]/[0.06] px-4 py-2 text-[#E9DDFF] backdrop-blur-sm">
              Pronto para integrações com IA
            </div>
          </div>

          <div className="mt-4 grid gap-2.5 sm:grid-cols-2 2xl:grid-cols-4">
            <div className="rounded-[20px] border border-white/10 bg-black/20 p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]">
              <div className="text-[11px] uppercase tracking-[0.2em] text-zinc-500">Leads ativos</div>
              <div className="mt-1.5 text-[24px] font-semibold tracking-[-0.03em] text-white">{stats.open}</div>
              <div className="mt-1 text-xs text-zinc-400">Carteira em andamento</div>
            </div>

            <div className="rounded-[20px] border border-white/10 bg-black/20 p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]">
              <div className="text-[11px] uppercase tracking-[0.2em] text-zinc-500">Pipeline</div>
              <div className="mt-1.5 text-[24px] font-semibold tracking-[-0.03em] text-white">
                {formatCurrency(stats.pipelineValue ?? 0)}
              </div>
              <div className="mt-1 text-xs text-zinc-400">Valor bruto em negociação</div>
            </div>

            <div className="rounded-[20px] border border-white/10 bg-black/20 p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]">
              <div className="text-[11px] uppercase tracking-[0.2em] text-zinc-500">Forecast</div>
              <div className="mt-1.5 text-[24px] font-semibold tracking-[-0.03em] text-[#8B5CF6]">
                {formatCurrency(stats.forecastValue ?? 0)}
              </div>
              <div className="mt-1 text-xs text-zinc-400">Receita ponderada por probabilidade</div>
            </div>

            <div className="rounded-[20px] border border-white/10 bg-black/20 p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]">
              <div className="text-[11px] uppercase tracking-[0.2em] text-zinc-500">Probabilidade média</div>
              <div className="mt-1.5 text-[24px] font-semibold tracking-[-0.03em] text-white">
                {stats.averageProbability ?? 0}%
              </div>
              <div className="mt-1 text-xs text-zinc-400">Maturidade média do funil</div>
            </div>
          </div>

          <div className="mt-4 rounded-[22px] border border-white/10 bg-black/20 p-3.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]">
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="text-[11px] uppercase tracking-[0.2em] text-zinc-500">
                  Quick decision radar
                </div>
                <div className="mt-1 text-sm font-medium text-white">Graficos rapidos</div>
              </div>
              <div className="rounded-full border border-[#8B5CF6]/20 bg-[#8B5CF6]/10 px-3 py-1 text-[10px] uppercase tracking-[0.18em] text-[#E9DDFF]">
                Above the fold
              </div>
            </div>

            <div className="mt-3 grid gap-3 md:grid-cols-3">
              {safeCharts.length === 0 ? (
                <div className="md:col-span-3 rounded-2xl border border-dashed border-white/10 bg-white/[0.03] px-3 py-4 text-sm text-zinc-500">
                  Sem dados no recorte atual.
                </div>
              ) : (
                safeCharts.map((item) => {
                  const width = maxChartValue > 0 ? Math.max((item.value / maxChartValue) * 100, 18) : 18;

                  return (
                    <div
                      key={item.label}
                      className="rounded-[18px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.04),rgba(0,0,0,0.16))] p-3"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="truncate text-[11px] uppercase tracking-[0.18em] text-zinc-500">
                            {item.label}
                          </div>
                          <div className="mt-1 truncate text-sm font-medium text-white">{item.valueLabel}</div>
                        </div>
                      </div>
                      <div className="mt-2 text-xs text-zinc-400">{item.helper}</div>
                      <div className="mt-3 h-2.5 rounded-full bg-white/[0.05]">
                        <div
                          className="h-2.5 rounded-full bg-[linear-gradient(90deg,rgba(139,92,246,0.95),rgba(221,214,254,0.92))]"
                          style={{ width: `${width}%` }}
                        />
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        <div className="grid gap-3 xl:self-stretch">
          <div className="rounded-[26px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.035),rgba(0,0,0,0.12))] p-3.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]">
            <div className="text-sm font-medium text-white">Command actions</div>
            <div className="mt-1.5 text-[13px] leading-5 text-zinc-500">
              Ações rápidas para mover a operação sem sair da visão executiva.
            </div>
            <div className="mt-3 space-y-2">
              <CrmQuickActionButton label="Novo lead" emphasis="primary" onClick={onAddLead} />
              <CrmQuickActionButton label="Ver pipeline" onClick={onViewPipeline} />
              <CrmQuickActionButton
                label="Gerenciar pipeline"
                onClick={onManagePipeline}
              />
            </div>
          </div>

          <div className="rounded-[26px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.035),rgba(0,0,0,0.12))] p-3.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]">
            <div className="text-sm font-medium text-white">Leitura executiva</div>
            <div className="mt-2.5 space-y-2">
              <CrmInsightCard
                label="Maior concentração"
                value={STATUS_LABELS[dominantStatus]}
                helper="Etapa com maior volume de oportunidades"
              />
              <CrmInsightCard
                label="Responsável em destaque"
                value={topOwner ? `${topOwner[0]} · ${topOwner[1]}` : 'Sem dados'}
                helper="Maior carteira ativa sob gestão"
              />
              <CrmInsightCard
                label="Prioridade"
                value={
                  stats.stalledLeads > 0
                    ? `Retomar ${stats.stalledLeads} lead(s) em atenção`
                    : 'Pipeline com ritmo saudável'
                }
                helper="Recomendação automática de operação"
              />
            </div>
          </div>

        </div>
      </div>
  );
}

