import { SEVERITY_STYLES, STATUS_STYLES, TASK_KIND_LABELS, TASK_STATUS_LABELS } from './constants';
import type {
  FinanceAlert,
  FinanceAiPriority,
  FinanceBranchSnapshot,
  FinanceInnovation,
  FinanceTask,
} from './types';

export function formatMoney(value: number, currency = 'BRL') {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatPct(value: number) {
  return `${value.toFixed(1).replace('.', ',')}%`;
}

export function MetricCard({
  label,
  value,
  hint,
  tone = 'default',
}: {
  label: string;
  value: string;
  hint: string;
  tone?: 'default' | 'accent' | 'positive' | 'warning';
}) {
  const toneClass =
    tone === 'accent'
      ? 'text-violet-200'
      : tone === 'positive'
      ? 'text-emerald-300'
      : tone === 'warning'
      ? 'text-amber-300'
      : 'text-white';

  return (
    <div className="rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0.02))] p-5">
      <div className="text-[11px] uppercase tracking-[0.22em] text-zinc-500">{label}</div>
      <div className={`mt-4 text-3xl font-semibold tracking-tight ${toneClass}`}>{value}</div>
      <div className="mt-2 text-sm leading-6 text-zinc-400">{hint}</div>
    </div>
  );
}

export function ProgressBar({
  value,
  tone = 'violet',
}: {
  value: number;
  tone?: 'violet' | 'emerald' | 'amber';
}) {
  const width = Math.min(100, Math.max(0, value));
  const barClass =
    tone === 'emerald'
      ? 'from-emerald-400 to-emerald-200'
      : tone === 'amber'
      ? 'from-amber-400 to-orange-200'
      : 'from-violet-500 to-fuchsia-300';

  return (
    <div className="h-2 overflow-hidden rounded-full bg-white/10">
      <div
        className={`h-full rounded-full bg-gradient-to-r ${barClass}`}
        style={{ width: `${width}%` }}
      />
    </div>
  );
}

export function AlertList({ alerts }: { alerts: FinanceAlert[] }) {
  return (
    <div className="space-y-3">
      {alerts.map((alert) => (
        <div key={alert.id} className="rounded-[24px] border border-white/10 bg-black/20 p-4">
          <div>
            <div className="flex items-center gap-3">
              <span
                className={`rounded-full border px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.22em] ${SEVERITY_STYLES[alert.severity]}`}
              >
                {alert.severity}
              </span>
              <div className="text-sm font-medium text-white">{alert.title}</div>
            </div>
            <div className="mt-2 text-sm leading-6 text-zinc-400">{alert.description}</div>
          </div>
          <div className="mt-3 rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-zinc-300">
            Proxima acao: {alert.action}
          </div>
        </div>
      ))}
    </div>
  );
}

export function BranchTable({
  branches,
  currency,
}: {
  branches: FinanceBranchSnapshot[];
  currency: string;
}) {
  return (
    <div className="overflow-hidden rounded-[28px] border border-white/10">
      <div className="grid grid-cols-[1.4fr,1fr,0.9fr,0.9fr,0.8fr,0.8fr] gap-3 border-b border-white/10 bg-white/5 px-4 py-3 text-[11px] uppercase tracking-[0.18em] text-zinc-500">
        <div>Unidade</div>
        <div>Caixa</div>
        <div>Margem</div>
        <div>Risco AR</div>
        <div>Forecast</div>
        <div>Status</div>
      </div>

      <div className="divide-y divide-white/10">
        {branches.map((branch) => (
          <div
            key={branch.id}
            className="grid grid-cols-[1.4fr,1fr,0.9fr,0.9fr,0.8fr,0.8fr] gap-3 px-4 py-4 text-sm text-zinc-300"
          >
            <div>
              <div className="font-medium text-white">{branch.name}</div>
              <div className="mt-1 text-xs text-zinc-500">
                Cobranca {formatPct(branch.collectionsPct)} • fila {branch.approvalQueue}
              </div>
            </div>
            <div>{formatMoney(branch.cashContribution, currency)}</div>
            <div>{formatPct(branch.marginPct)}</div>
            <div>{formatPct(branch.receivablesRiskPct)}</div>
            <div className={branch.forecastDeltaPct < 0 ? 'text-red-300' : 'text-emerald-300'}>
              {branch.forecastDeltaPct > 0 ? '+' : ''}
              {formatPct(branch.forecastDeltaPct)}
            </div>
            <div>
              <span
                className={`rounded-full border px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.18em] ${STATUS_STYLES[branch.status]}`}
              >
                {branch.status}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function TaskList({
  tasks,
  currency,
}: {
  tasks: FinanceTask[];
  currency: string;
}) {
  return (
    <div className="space-y-3">
      {tasks.map((task) => (
        <div key={task.id} className="rounded-[24px] border border-white/10 bg-black/20 p-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[10px] uppercase tracking-[0.2em] text-zinc-400">
                  {TASK_KIND_LABELS[task.kind]}
                </span>
                <span className="text-[11px] uppercase tracking-[0.18em] text-zinc-500">
                  {TASK_STATUS_LABELS[task.status]}
                </span>
              </div>
              <div className="mt-2 text-sm font-medium text-white">{task.title}</div>
              <div className="mt-1 text-xs text-zinc-500">
                Owner: {task.owner} • prazo: {task.dueLabel}
              </div>
            </div>
            {typeof task.amount === 'number' ? (
              <div className="text-sm font-medium text-zinc-200">
                {formatMoney(task.amount, currency)}
              </div>
            ) : null}
          </div>
        </div>
      ))}
    </div>
  );
}

export function AiPriorityList({ priorities }: { priorities: FinanceAiPriority[] }) {
  return (
    <div className="space-y-3">
      {priorities.map((priority) => (
        <div key={priority.id} className="rounded-[24px] border border-white/10 bg-black/20 p-4">
          <div className="flex items-center gap-3">
            <span className="rounded-full border border-violet-500/25 bg-violet-500/10 px-2.5 py-1 text-[10px] uppercase tracking-[0.22em] text-violet-200">
              {priority.label}
            </span>
            <div className="text-sm font-medium text-white">{priority.title}</div>
          </div>
          <div className="mt-2 text-sm leading-6 text-zinc-400">{priority.description}</div>
          <div className="mt-3 rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-zinc-300">
            Impacto estimado: {priority.impact}
          </div>
        </div>
      ))}
    </div>
  );
}

export function InnovationGrid({ items }: { items: FinanceInnovation[] }) {
  return (
    <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
      {items.map((item) => (
        <div key={item.id} className="rounded-[28px] border border-white/10 bg-black/20 p-5">
          <div className="text-sm font-medium text-white">{item.title}</div>
          <div className="mt-2 text-sm leading-6 text-zinc-400">{item.description}</div>
          <div className="mt-4 flex items-center justify-between gap-3 text-xs text-zinc-400">
            <span>{item.maturity}</span>
            <span className="text-zinc-500">{item.outcome}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
