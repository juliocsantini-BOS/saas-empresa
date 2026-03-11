import type { ReactNode } from 'react';
import { STATUS_LABELS } from './constants';
import type { CrmStats, LeadStatus } from './types';

export function CrmStyles() {
  return (
    <style jsx>{`
      .crm-scroll {
        scrollbar-width: thin;
        scrollbar-color: rgba(59, 255, 140, 0.35) rgba(255, 255, 255, 0.04);
      }

      .crm-scroll::-webkit-scrollbar {
        width: 10px;
      }

      .crm-scroll::-webkit-scrollbar-track {
        background: rgba(255, 255, 255, 0.04);
        border-radius: 999px;
      }

      .crm-scroll::-webkit-scrollbar-thumb {
        background: linear-gradient(
          180deg,
          rgba(59, 255, 140, 0.45),
          rgba(59, 255, 140, 0.2)
        );
        border-radius: 999px;
        border: 2px solid rgba(17, 17, 19, 0.95);
        box-shadow: 0 0 12px rgba(59, 255, 140, 0.12);
      }

      .crm-scroll::-webkit-scrollbar-thumb:hover {
        background: linear-gradient(
          180deg,
          rgba(59, 255, 140, 0.65),
          rgba(59, 255, 140, 0.28)
        );
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
      className={`rounded-[32px] border border-white/10 bg-[linear-gradient(180deg,rgba(17,17,19,0.98),rgba(11,11,13,0.98))] shadow-[0_16px_60px_rgba(0,0,0,0.28)] ${className}`}
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
    <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
      <div>
        {eyebrow ? (
          <div className="text-[11px] font-medium uppercase tracking-[0.28em] text-[#7C8A81]">
            {eyebrow}
          </div>
        ) : null}
        <div className="mt-2 text-xl font-semibold tracking-[-0.02em] text-white">{title}</div>
        {description ? <div className="mt-1 text-sm text-zinc-500">{description}</div> : null}
      </div>
      {action ? <div>{action}</div> : null}
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
      ? 'text-[#3BFF8C]'
      : accent === 'danger'
        ? 'text-red-300'
        : accent === 'attention'
          ? 'text-amber-200'
          : 'text-white';

  return (
    <div className="relative overflow-hidden rounded-[28px] border border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(59,255,140,0.1),transparent_36%),linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0.02))] p-5">
      <div className="text-[11px] uppercase tracking-[0.2em] text-zinc-500">{label}</div>
      <div className={`mt-4 text-3xl font-semibold tracking-[-0.03em] ${valueClass}`}>{value}</div>
      <div className="mt-2 text-sm text-zinc-400">{helper}</div>
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
    <div className="rounded-[24px] border border-white/10 bg-black/20 p-4">
      <div className="text-[11px] uppercase tracking-[0.2em] text-zinc-500">{label}</div>
      <div className="mt-2 text-sm font-medium text-white">{value}</div>
      <div className="mt-1 text-xs text-zinc-500">{helper}</div>
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
          ? 'w-full rounded-[22px] border border-[#3BFF8C]/20 bg-[radial-gradient(circle_at_left,rgba(59,255,140,0.14),transparent_70%),rgba(59,255,140,0.08)] px-4 py-3 text-sm font-medium text-white transition hover:border-[#3BFF8C]/35 hover:bg-[radial-gradient(circle_at_left,rgba(59,255,140,0.18),transparent_72%),rgba(59,255,140,0.12)]'
          : 'w-full rounded-[22px] border border-white/10 bg-white/5 px-4 py-3 text-sm text-white transition hover:bg-white/10'
      }
    >
      {label}
    </button>
  );
}

export function CrmExecutiveHero({
  stats,
  topOwner,
  dominantStatus,
  onAddLead,
  onViewPipeline,
}: {
  stats: CrmStats;
  topOwner: [string, number] | null;
  dominantStatus: LeadStatus;
  onAddLead: () => void;
  onViewPipeline: () => void;
}) {
  return (
    <CrmPanel className="overflow-hidden p-6">
      <div className="grid gap-6 xl:grid-cols-[1.35fr_0.9fr]">
        <div className="relative overflow-hidden rounded-[30px] border border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(59,255,140,0.16),transparent_35%),linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0.02))] p-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#3BFF8C]/20 bg-[#3BFF8C]/10 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.22em] text-[#C8FFD8]">
            CRM Enterprise
          </div>

          <div className="mt-5 max-w-3xl text-[32px] font-semibold leading-tight tracking-[-0.04em] text-white">
            Um pipeline comercial com leitura executiva, presença premium e operação clara.
          </div>

          <div className="mt-3 max-w-2xl text-sm leading-6 text-zinc-400">
            Seu CRM já tem base forte. Agora ele começa a parecer produto de mercado grande:
            indicadores claros, visual refinado e leitura instantânea para o time comercial.
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-3">
            <div className="rounded-[24px] border border-white/10 bg-black/20 p-4">
              <div className="text-[11px] uppercase tracking-[0.2em] text-zinc-500">Leads ativos</div>
              <div className="mt-3 text-3xl font-semibold tracking-[-0.03em] text-white">{stats.open}</div>
              <div className="mt-2 text-sm text-zinc-400">Oportunidades em andamento</div>
            </div>

            <div className="rounded-[24px] border border-white/10 bg-black/20 p-4">
              <div className="text-[11px] uppercase tracking-[0.2em] text-zinc-500">Conversão</div>
              <div className="mt-3 text-3xl font-semibold tracking-[-0.03em] text-white">{stats.conversionRate}%</div>
              <div className="mt-2 text-sm text-zinc-400">Eficiência do funil filtrado</div>
            </div>

            <div className="rounded-[24px] border border-white/10 bg-black/20 p-4">
              <div className="text-[11px] uppercase tracking-[0.2em] text-zinc-500">Leads quentes</div>
              <div className="mt-3 text-3xl font-semibold tracking-[-0.03em] text-[#3BFF8C]">{stats.hotLeads}</div>
              <div className="mt-2 text-sm text-zinc-400">Maior probabilidade de fechamento</div>
            </div>
          </div>
        </div>

        <div className="grid gap-5">
          <div className="rounded-[30px] border border-white/10 bg-black/20 p-5">
            <div className="text-sm font-medium text-white">Ações rápidas</div>
            <div className="mt-4 space-y-3">
              <CrmQuickActionButton label="Novo lead" emphasis="primary" onClick={onAddLead} />
              <CrmQuickActionButton label="Ver pipeline" onClick={onViewPipeline} />
              <CrmQuickActionButton label="Relatório de vendas" />
            </div>
          </div>

          <div className="rounded-[30px] border border-white/10 bg-black/20 p-5">
            <div className="text-sm font-medium text-white">Leitura executiva</div>
            <div className="mt-4 space-y-3">
              <CrmInsightCard
                label="Maior concentração"
                value={STATUS_LABELS[dominantStatus]}
                helper="Etapa com mais leads no funil atual"
              />
              <CrmInsightCard
                label="Responsável em destaque"
                value={topOwner ? `${topOwner[0]} · ${topOwner[1]}` : 'Sem dados'}
                helper="Maior volume de leads sob gestão"
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
    </CrmPanel>
  );
}
