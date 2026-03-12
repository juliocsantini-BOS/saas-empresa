import { PRIORITY_LABELS, STATUS_BASE_PROBABILITY, STATUS_LABELS } from './constants';
import type {
  LeadActivity,
  LeadItem,
  LeadPriority,
  LeadStatus,
  LeadTask,
  PipelineStageSummary,
} from './types';

const utf8TextDecoder = new TextDecoder('utf-8');

export function formatDateTime(value?: string | null) {
  if (!value) return 'Sem data';
  return new Date(value).toLocaleString('pt-BR');
}

export function formatDateShort(value?: string | null) {
  if (!value) return 'Sem prazo';
  return new Date(value).toLocaleDateString('pt-BR');
}

export function formatRelativeTime(value?: string | null) {
  if (!value) return 'Sem data';

  const now = Date.now();
  const time = new Date(value).getTime();
  const diff = now - time;

  const minute = 1000 * 60;
  const hour = minute * 60;
  const day = hour * 24;

  if (diff < minute) return 'Agora há pouco';
  if (diff < hour) return `${Math.max(1, Math.floor(diff / minute))} min atrás`;
  if (diff < day) return `${Math.max(1, Math.floor(diff / hour))}h atrás`;
  if (diff < day * 7) return `${Math.max(1, Math.floor(diff / day))}d atrás`;

  return formatDateShort(value);
}

export function formatCurrency(value?: string | number | null, currency = 'BRL') {
  const amount = toNumber(value);
  if (amount === null) return '—';

  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: currency || 'BRL',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function sanitizeText(value?: string | null) {
  if (!value) return '';
  const input = String(value);

  if (!/[Ãâð]/.test(input)) return input;

  try {
    return utf8TextDecoder.decode(Uint8Array.from(input, (char) => char.charCodeAt(0)));
  } catch {
    return input;
  }
}

export function normalizeUiText(value?: string | null) {
  return sanitizeText(value);
}

export function getToken() {
  return localStorage.getItem('access_token');
}

export function toNumber(value?: string | number | null) {
  if (value === undefined || value === null || value === '') return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

export function getLeadLastActivityAt(lead: LeadItem | null) {
  return lead?.lastActivityAt || lead?.updatedAt || lead?.createdAt || null;
}

export function getLeadProbability(lead: LeadItem | null) {
  if (!lead) return 0;

  if (typeof lead.probability === 'number' && Number.isFinite(lead.probability)) {
    return Math.max(0, Math.min(100, Math.round(lead.probability)));
  }

  return STATUS_BASE_PROBABILITY[lead.status] ?? 0;
}

export function getLeadForecastValue(lead: LeadItem | null) {
  if (!lead) return 0;
  const amount = toNumber(lead.dealValue) ?? 0;
  const probability = getLeadProbability(lead) / 100;
  return amount * probability;
}

export function getLeadPriorityLabel(priority?: string | null) {
  const normalized = String(priority ?? '').trim().toUpperCase() as LeadPriority;
  return PRIORITY_LABELS[normalized] ?? 'Sem prioridade';
}

export function getLeadPriorityClass(priority?: string | null) {
  const normalized = String(priority ?? '').trim().toUpperCase();

  if (normalized === 'URGENT') {
    return 'border-red-500/20 bg-red-500/10 text-red-300';
  }

  if (normalized === 'HIGH') {
    return 'border-amber-400/20 bg-amber-400/10 text-amber-200';
  }

  if (normalized === 'MEDIUM') {
    return 'border-sky-400/20 bg-sky-400/10 text-sky-200';
  }

  return 'border-white/10 bg-white/5 text-zinc-300';
}

export function getLeadSourceLabel(source?: string | null) {
  if (!source) return 'Sem origem';
  return sanitizeText(source)
    .split(/[-_\s]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(' ');
}

export function getPipelineStageSummary(status: LeadStatus, leads: LeadItem[]): PipelineStageSummary {
  const value = leads.reduce((sum, lead) => sum + (toNumber(lead.dealValue) ?? 0), 0);
  const forecast = leads.reduce((sum, lead) => sum + getLeadForecastValue(lead), 0);

  return {
    status,
    count: leads.length,
    value,
    forecast,
  };
}

export function getPipelineTotals(pipeline: Record<LeadStatus, LeadItem[]>) {
  const statuses = Object.keys(pipeline) as LeadStatus[];
  return statuses.map((status) => getPipelineStageSummary(status, pipeline[status] ?? []));
}

export function getAverageProbability(leads: LeadItem[]) {
  if (!leads.length) return 0;
  const sum = leads.reduce((acc, lead) => acc + getLeadProbability(lead), 0);
  return Math.round(sum / leads.length);
}

export function getLeadScore(
  lead: LeadItem | null,
  activities: LeadActivity[],
  tasks: LeadTask[],
) {
  if (!lead) return 0;

  let score = 0;

  if (lead.phone) score += 10;
  if (lead.email) score += 10;
  if (lead.companyName) score += 10;
  if (lead.notes) score += 5;
  if (lead.dealValue) score += 10;
  if (lead.expectedCloseDate) score += 5;
  if (lead.nextStep) score += 5;

  if (activities.length > 0) score += 10;
  if (activities.some((a) => a.type === 'CALL')) score += 10;
  if (activities.some((a) => a.type === 'MEETING')) score += 15;
  if (activities.some((a) => a.type === 'MESSAGE')) score += 5;
  if (activities.some((a) => a.type === 'TASK_CREATED')) score += 5;

  switch (lead.status) {
    case 'CONTACTED':
      score += 10;
      break;
    case 'PROPOSAL':
      score += 20;
      break;
    case 'NEGOTIATION':
      score += 30;
      break;
    case 'WON':
      score += 50;
      break;
    case 'LOST':
      score = Math.max(0, score - 20);
      break;
  }

  score += Math.round(getLeadProbability(lead) * 0.15);

  const now = new Date();

  if (tasks.some((task) => task.dueAt && new Date(task.dueAt) > now && !task.completedAt)) {
    score += 10;
  }

  if (tasks.some((task) => task.dueAt && new Date(task.dueAt) < now && !task.completedAt)) {
    score -= 15;
  }

  return Math.max(0, Math.min(score, 100));
}

export function getLeadTemperature(score: number) {
  if (score >= 75) return 'Quente';
  if (score >= 45) return 'Morno';
  return 'Frio';
}

export function getTemperatureChipClass(label: string) {
  if (label === 'Quente') {
    return 'border-emerald-400/20 bg-emerald-400/10 text-emerald-200';
  }

  if (label === 'Morno') {
    return 'border-amber-400/20 bg-amber-400/10 text-amber-200';
  }

  return 'border-sky-400/20 bg-sky-400/10 text-sky-200';
}

export function getLeadHealth(updatedAt?: string | null, status?: LeadStatus) {
  if (status === 'WON') return 'Concluído';
  if (status === 'LOST') return 'Encerrado';
  if (!updatedAt) return 'Sem histórico';

  const diff = Date.now() - new Date(updatedAt).getTime();
  const day = 1000 * 60 * 60 * 24;

  if (diff <= day * 2) return 'Saudável';
  if (diff <= day * 5) return 'Atenção';
  return 'Crítico';
}

export function getLeadHealthClass(updatedAt?: string | null, status?: LeadStatus) {
  const health = getLeadHealth(updatedAt, status);

  if (health === 'Concluído') {
    return 'border-[#3BFF8C]/20 bg-[#3BFF8C]/10 text-[#9CFFC2]';
  }

  if (health === 'Encerrado') {
    return 'border-red-500/20 bg-red-500/10 text-red-300';
  }

  if (health === 'Saudável') {
    return 'border-emerald-400/20 bg-emerald-400/10 text-emerald-200';
  }

  if (health === 'Atenção') {
    return 'border-amber-400/20 bg-amber-400/10 text-amber-200';
  }

  return 'border-red-500/20 bg-red-500/10 text-red-300';
}

export function activityIcon(type: string) {
  if (type === 'TASK_DONE') return 'OK';
  if (type === 'TASK_CREATED') return 'TK';
  if (type === 'LEAD_UPDATED') return 'UP';
  if (type === 'LEAD_NOTE_UPDATED') return 'NT';
  if (type === 'LEAD_STATUS_CHANGED') return 'ST';
  if (type === 'CALL') return 'CL';
  if (type === 'MESSAGE') return 'MS';
  if (type === 'MEETING') return 'MT';
  if (type === 'LEAD_CREATED') return 'NV';
  return 'NT';
}

export function activityIconBadgeClass(type: string) {
  if (type === 'TASK_DONE') {
    return 'border-[#3BFF8C]/25 bg-[radial-gradient(circle_at_top,rgba(59,255,140,0.22),transparent_80%),rgba(59,255,140,0.08)] text-[#C8FFD8]';
  }

  if (type === 'LEAD_CREATED') {
    return 'border-[#3BFF8C]/18 bg-[radial-gradient(circle_at_top,rgba(59,255,140,0.16),transparent_80%),rgba(255,255,255,0.04)] text-white';
  }

  if (type === 'CALL') {
    return 'border-amber-300/20 bg-amber-300/10 text-amber-100';
  }

  if (type === 'MESSAGE') {
    return 'border-sky-300/20 bg-sky-300/10 text-sky-100';
  }

  if (type === 'MEETING') {
    return 'border-violet-300/20 bg-violet-300/10 text-violet-100';
  }

  return 'border-white/10 bg-white/[0.05] text-zinc-100';
}

export function statusBadge(status: LeadStatus) {
  if (status === 'WON') {
    return 'rounded-full border border-[#3BFF8C]/20 bg-[#3BFF8C]/10 px-3 py-1 text-xs text-[#9CFFC2]';
  }

  if (status === 'LOST') {
    return 'rounded-full border border-red-500/20 bg-red-500/10 px-3 py-1 text-xs text-red-300';
  }

  return 'rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white';
}

export function statusDotClass(status: LeadStatus) {
  if (status === 'WON') return 'bg-[#3BFF8C] shadow-[0_0_12px_rgba(59,255,140,0.5)]';
  if (status === 'LOST') return 'bg-red-400 shadow-[0_0_12px_rgba(248,113,113,0.45)]';
  return 'bg-white/70 shadow-[0_0_10px_rgba(255,255,255,0.18)]';
}

export function getDominantStatusLabel(entries: Array<{ status: LeadStatus; count: number }>) {
  const best = [...entries].sort((a, b) => b.count - a.count)[0];
  return best ? STATUS_LABELS[best.status] : 'Sem dados';
}
