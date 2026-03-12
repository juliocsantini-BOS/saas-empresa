import type { ActivityComposerType, LeadPriority, LeadStatus, TemperatureFilter } from './types';

export const API_URL = 'http://localhost:3000';

export const STATUS_ORDER: LeadStatus[] = [
  'NEW',
  'CONTACTED',
  'PROPOSAL',
  'NEGOTIATION',
  'WON',
  'LOST',
];

export const STATUS_LABELS: Record<LeadStatus, string> = {
  NEW: 'Novo lead',
  CONTACTED: 'Contato feito',
  PROPOSAL: 'Proposta enviada',
  NEGOTIATION: 'NegociaÃ§Ã£o',
  WON: 'Fechado',
  LOST: 'Perdido',
};

export const FILTER_STATUS_LABELS: Record<'ALL' | LeadStatus, string> = {
  ALL: 'Todos',
  NEW: 'Novo lead',
  CONTACTED: 'Contato feito',
  PROPOSAL: 'Proposta enviada',
  NEGOTIATION: 'NegociaÃ§Ã£o',
  WON: 'Fechado',
  LOST: 'Perdido',
};

export const TEMPERATURE_LABELS: Record<TemperatureFilter, string> = {
  ALL: 'Todas',
  HOT: 'Quentes',
  WARM: 'Mornos',
  COLD: 'Frios',
};

export const PRIORITY_LABELS: Record<LeadPriority, string> = {
  LOW: 'Baixa',
  MEDIUM: 'MÃ©dia',
  HIGH: 'Alta',
  URGENT: 'Urgente',
};

export const STATUS_BASE_PROBABILITY: Record<LeadStatus, number> = {
  NEW: 10,
  CONTACTED: 25,
  PROPOSAL: 50,
  NEGOTIATION: 75,
  WON: 100,
  LOST: 0,
};

export const INTERACTION_OPTIONS: Array<{
  type: ActivityComposerType;
  label: string;
  badge: string;
}> = [
  { type: 'NOTE', label: 'Nota', badge: 'NT' },
  { type: 'CALL', label: 'LigaÃ§Ã£o', badge: 'CL' },
  { type: 'MESSAGE', label: 'Mensagem', badge: 'MS' },
  { type: 'MEETING', label: 'ReuniÃ£o', badge: 'MT' },
];

export const ACTIVITY_LABELS: Record<string, string> = {
  LEAD_CREATED: 'Lead criado',
  LEAD_UPDATED: 'Lead atualizado',
  LEAD_NOTE_UPDATED: 'ObservaÃ§Ãµes atualizadas',
  LEAD_STATUS_CHANGED: 'Status alterado',
  LEAD_WON: 'Lead ganho',
  LEAD_LOST: 'Lead perdido',
  TASK_CREATED: 'Tarefa criada',
  TASK_DONE: 'Tarefa concluÃ­da',
  TASK_REOPENED: 'Tarefa reaberta',
  NOTE: 'Nota',
  CALL: 'LigaÃ§Ã£o',
  MESSAGE: 'Mensagem',
  MEETING: 'ReuniÃ£o',
};
