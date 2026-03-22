import type {
  FinanceAlertSeverity,
  FinanceBranchStatus,
  FinanceTaskKind,
  FinanceTaskStatus,
} from './types';

export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.elyonos.com.br';

export const SEVERITY_STYLES: Record<FinanceAlertSeverity, string> = {
  critical: 'border-red-500/30 bg-red-500/10 text-red-200',
  warning: 'border-amber-500/30 bg-amber-500/10 text-amber-200',
  info: 'border-violet-500/30 bg-violet-500/10 text-violet-200',
};

export const STATUS_STYLES: Record<FinanceBranchStatus, string> = {
  strong: 'border-emerald-500/25 bg-emerald-500/10 text-emerald-200',
  watch: 'border-amber-500/25 bg-amber-500/10 text-amber-200',
  critical: 'border-red-500/25 bg-red-500/10 text-red-200',
};

export const TASK_KIND_LABELS: Record<FinanceTaskKind, string> = {
  approval: 'Aprovacao',
  collection: 'Cobranca',
  reconciliation: 'Conciliacao',
  close: 'Fechamento',
  cash: 'Caixa',
};

export const TASK_STATUS_LABELS: Record<FinanceTaskStatus, string> = {
  queue: 'Na fila',
  active: 'Em andamento',
  done: 'Concluido',
};
