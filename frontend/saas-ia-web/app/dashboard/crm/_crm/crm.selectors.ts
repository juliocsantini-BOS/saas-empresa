import { STATUS_ORDER } from './constants';
import type {
  BranchOption,
  CrmSavedViewFilters,
  CrmStats,
  DepartmentOption,
  ExtendedLeadItem,
  LeadStatus,
  UserOption,
} from './types';
import {
  daysSince,
  getLastActivity,
  getLeadScore,
  getLeadTemperature,
  normalizeProbability,
  normalizeUiText,
  parseMoney,
  temperatureFilterMatch,
} from './utils';

export type CrmFiltersState = CrmSavedViewFilters;

export type PipelineTotal = {
  status: LeadStatus;
  count: number;
  totalValue: number;
  forecast: number;
  avgProbability: number;
};

export type CrmReportRow = {
  label: string;
  count: number;
  value?: number;
  rate?: number;
  averageDays?: number;
};

export type CrmPeriodOutcomeRow = {
  period: string;
  won: number;
  lost: number;
};

function sortByName<T extends { name: string }>(items: T[]) {
  return items.sort((a, b) => a.name.localeCompare(b.name));
}

export function getOwnerOptions(leads: ExtendedLeadItem[]): UserOption[] {
  const map = new Map<string, string>();

  leads.forEach((lead) => {
    if (lead.ownerUser?.id && lead.ownerUser?.name) {
      map.set(lead.ownerUser.id, normalizeUiText(lead.ownerUser.name));
    }
  });

  return sortByName([...map.entries()].map(([id, name]) => ({ id, name })));
}

export function getBranchOptions(leads: ExtendedLeadItem[]): BranchOption[] {
  const map = new Map<string, string>();

  leads.forEach((lead) => {
    if (lead.branch?.id && lead.branch?.name) {
      map.set(lead.branch.id, normalizeUiText(lead.branch.name));
    }
  });

  return sortByName([...map.entries()].map(([id, name]) => ({ id, name })));
}

export function getDepartmentOptions(leads: ExtendedLeadItem[]): DepartmentOption[] {
  const map = new Map<string, string>();

  leads.forEach((lead) => {
    if (lead.department?.id && lead.department?.name) {
      map.set(lead.department.id, normalizeUiText(lead.department.name));
    }
  });

  return sortByName([...map.entries()].map(([id, name]) => ({ id, name })));
}

export function getSourceOptions(leads: ExtendedLeadItem[]) {
  const values = new Set<string>();

  leads.forEach((lead) => {
    const source = normalizeUiText(lead.source || '').trim();
    if (source) values.add(source);
  });

  return [...values]
    .sort((a, b) => a.localeCompare(b))
    .map((value) => ({ id: value, name: value }));
}

function isTruthyFilter(filter: 'ALL' | 'YES') {
  return filter === 'YES';
}

function isDateInRange(value: string | null | undefined, from: string, to: string) {
  if (!from && !to) return true;
  if (!value) return false;

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return false;

  if (from) {
    const start = new Date(from);
    start.setHours(0, 0, 0, 0);
    if (date.getTime() < start.getTime()) return false;
  }

  if (to) {
    const end = new Date(to);
    end.setHours(23, 59, 59, 999);
    if (date.getTime() > end.getTime()) return false;
  }

  return true;
}

export function getFilteredLeads(leads: ExtendedLeadItem[], filters: CrmFiltersState) {
  const term = filters.searchTerm.trim().toLowerCase();
  const probabilityMin = filters.probabilityMin.trim() ? Number(filters.probabilityMin) : null;
  const probabilityMax = filters.probabilityMax.trim() ? Number(filters.probabilityMax) : null;
  const dealValueMin = filters.dealValueMin.trim() ? Number(filters.dealValueMin) : null;
  const dealValueMax = filters.dealValueMax.trim() ? Number(filters.dealValueMax) : null;
  const now = new Date();

  return leads.filter((lead) => {
    const score = getLeadScore(lead, [], []);
    const temperature = getLeadTemperature(score);
    const priority = String(lead.priority || '').trim().toUpperCase();
    const source = normalizeUiText(lead.source || '').trim();
    const probability = normalizeProbability(lead);
    const dealValue = parseMoney(lead.dealValue);
    const openTasksCount = lead.tasks?.length || 0;

    const searchable = [
      lead.name,
      lead.companyName,
      lead.email,
      lead.phone,
      lead.source,
      lead.ownerUser?.name,
    ]
      .filter(Boolean)
      .join(' ')
      .toLowerCase();

    if (term && !searchable.includes(term)) return false;
    if (filters.statusFilter !== 'ALL' && lead.status !== filters.statusFilter) return false;
    if (!temperatureFilterMatch(temperature, filters.temperatureFilter)) return false;
    if (filters.priorityFilter !== 'ALL' && priority !== filters.priorityFilter) return false;
    if (filters.sourceFilter !== 'ALL' && source !== filters.sourceFilter) return false;
    if (filters.ownerFilter !== 'ALL' && lead.ownerUser?.id !== filters.ownerFilter) return false;
    if (filters.branchFilter !== 'ALL' && lead.branch?.id !== filters.branchFilter) return false;

    if (
      filters.departmentFilter !== 'ALL' &&
      lead.department?.id !== filters.departmentFilter
    ) {
      return false;
    }

    if (isTruthyFilter(filters.openTasksOnly) && openTasksCount === 0) return false;
    if (isTruthyFilter(filters.stalledOnly) && daysSince(getLastActivity(lead)) <= 5) return false;

    if (
      isTruthyFilter(filters.overdueNextStepOnly) &&
      (!lead.nextStepDueAt || new Date(lead.nextStepDueAt).getTime() >= now.getTime())
    ) {
      return false;
    }

    if (probabilityMin !== null && probability < probabilityMin) return false;
    if (probabilityMax !== null && probability > probabilityMax) return false;
    if (dealValueMin !== null && dealValue < dealValueMin) return false;
    if (dealValueMax !== null && dealValue > dealValueMax) return false;

    if (!isDateInRange(lead.createdAt, filters.createdAtFrom, filters.createdAtTo)) {
      return false;
    }

    if (
      !isDateInRange(
        lead.expectedCloseDate,
        filters.expectedCloseDateFrom,
        filters.expectedCloseDateTo,
      )
    ) {
      return false;
    }

    return true;
  });
}

export function getCrmStats(filteredLeads: ExtendedLeadItem[]): CrmStats {
  const total = filteredLeads.length;
  const won = filteredLeads.filter((lead) => lead.status === 'WON').length;
  const lost = filteredLeads.filter((lead) => lead.status === 'LOST').length;
  const open = filteredLeads.filter((lead) => !['WON', 'LOST'].includes(lead.status)).length;
  const contacted = filteredLeads.filter((lead) => lead.status === 'CONTACTED').length;
  const proposal = filteredLeads.filter((lead) => lead.status === 'PROPOSAL').length;
  const pipeline = filteredLeads.filter((lead) =>
    ['NEW', 'CONTACTED', 'PROPOSAL', 'NEGOTIATION'].includes(lead.status),
  ).length;

  const conversionRate = total ? Math.round((won / total) * 100) : 0;

  const monthStart = new Date();
  monthStart.setDate(1);
  monthStart.setHours(0, 0, 0, 0);

  const newThisMonth = filteredLeads.filter(
    (lead) => new Date(lead.createdAt).getTime() >= monthStart.getTime(),
  ).length;

  const hotLeads = filteredLeads.filter(
    (lead) => getLeadTemperature(getLeadScore(lead, [], [])) === 'Quente',
  ).length;

  const stalledLeads = filteredLeads.filter(
    (lead) => daysSince(getLastActivity(lead)) > 5,
  ).length;

  return {
    total,
    pipeline,
    open,
    won,
    lost,
    contacted,
    proposal,
    conversionRate,
    newThisMonth,
    hotLeads,
    stalledLeads,
  };
}

export function getPipelineGroups(
  filteredLeads: ExtendedLeadItem[],
): Record<LeadStatus, ExtendedLeadItem[]> {
  return STATUS_ORDER.reduce(
    (acc, status) => {
      acc[status] = filteredLeads
        .filter((lead) => lead.status === status)
        .sort(
          (a, b) =>
            normalizeProbability(b) - normalizeProbability(a) ||
            parseMoney(b.dealValue) - parseMoney(a.dealValue) ||
            new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
        );

      return acc;
    },
    {} as Record<LeadStatus, ExtendedLeadItem[]>,
  );
}

export function getPipelineTotals(
  pipelineGroups: Record<LeadStatus, ExtendedLeadItem[]>,
): PipelineTotal[] {
  return STATUS_ORDER.map((status) => {
    const items = pipelineGroups[status];
    const totalValue = items.reduce((sum, lead) => sum + parseMoney(lead.dealValue), 0);
    const forecast = items.reduce(
      (sum, lead) => sum + parseMoney(lead.dealValue) * (normalizeProbability(lead) / 100),
      0,
    );

    const avgProbability = items.length
      ? Math.round(
          items.reduce((sum, lead) => sum + normalizeProbability(lead), 0) / items.length,
        )
      : 0;

    return {
      status,
      count: items.length,
      totalValue,
      forecast,
      avgProbability,
    };
  });
}

export function getDominantStatus(pipelineTotals: PipelineTotal[]): LeadStatus {
  const best = [...pipelineTotals].sort((a, b) => b.count - a.count)[0];
  return best?.status || 'NEW';
}

export function getTopOwner(filteredLeads: ExtendedLeadItem[]): [string, number] | null {
  const counts = new Map<string, number>();

  filteredLeads.forEach((lead) => {
    const owner = normalizeUiText(lead.ownerUser?.name || '');
    if (!owner) return;
    counts.set(owner, (counts.get(owner) || 0) + 1);
  });

  const top = [...counts.entries()].sort((a, b) => b[1] - a[1])[0];
  return top || null;
}

export function getTotalPipelineValue(pipelineTotals: PipelineTotal[]) {
  return pipelineTotals.reduce((sum, item) => sum + item.totalValue, 0);
}

export function getTotalForecast(pipelineTotals: PipelineTotal[]) {
  return pipelineTotals.reduce((sum, item) => sum + item.forecast, 0);
}

export function getAverageProbability(filteredLeads: ExtendedLeadItem[]) {
  if (!filteredLeads.length) return 0;

  return Math.round(
    filteredLeads.reduce((sum, lead) => sum + normalizeProbability(lead), 0) /
      filteredLeads.length,
  );
}

export function getStageConversionReport(filteredLeads: ExtendedLeadItem[]): CrmReportRow[] {
  const counts = new Map<LeadStatus, number>();
  STATUS_ORDER.forEach((status) => counts.set(status, 0));

  filteredLeads.forEach((lead) => {
    counts.set(lead.status, (counts.get(lead.status) || 0) + 1);
  });

  return STATUS_ORDER.map((status, index) => {
    const count = counts.get(status) || 0;
    const previousStatus = STATUS_ORDER[Math.max(index - 1, 0)];
    const previousCount = counts.get(previousStatus) || 0;

    const rate =
      index === 0
        ? count > 0
          ? 100
          : 0
        : previousCount
          ? Math.round((count / previousCount) * 100)
          : 0;

    return {
      label: status,
      count,
      rate,
    };
  });
}

export function getSourceConversionReport(filteredLeads: ExtendedLeadItem[]): CrmReportRow[] {
  const groups = new Map<string, { count: number; won: number; value: number }>();

  filteredLeads.forEach((lead) => {
    const source = normalizeUiText(lead.source || 'Sem origem');
    const current = groups.get(source) || { count: 0, won: 0, value: 0 };

    current.count += 1;
    current.won += lead.status === 'WON' ? 1 : 0;
    current.value += parseMoney(lead.dealValue);

    groups.set(source, current);
  });

  return [...groups.entries()]
    .map(([label, item]) => ({
      label,
      count: item.count,
      value: item.value,
      rate: item.count ? Math.round((item.won / item.count) * 100) : 0,
    }))
    .sort((a, b) => (b.value || 0) - (a.value || 0));
}

function getPipelineLeads(filteredLeads: ExtendedLeadItem[]) {
  return filteredLeads.filter((lead) => !['WON', 'LOST'].includes(lead.status));
}

function getValueByGroup(
  filteredLeads: ExtendedLeadItem[],
  getLabel: (lead: ExtendedLeadItem) => string,
): CrmReportRow[] {
  const groups = new Map<string, { count: number; value: number }>();

  getPipelineLeads(filteredLeads).forEach((lead) => {
    const label = normalizeUiText(getLabel(lead) || 'Não definido');
    const current = groups.get(label) || { count: 0, value: 0 };

    current.count += 1;
    current.value += parseMoney(lead.dealValue);

    groups.set(label, current);
  });

  return [...groups.entries()]
    .map(([label, item]) => ({
      label,
      count: item.count,
      value: item.value,
    }))
    .sort((a, b) => (b.value || 0) - (a.value || 0));
}

export function getPipelineValueByOwnerReport(filteredLeads: ExtendedLeadItem[]) {
  return getValueByGroup(filteredLeads, (lead) => lead.ownerUser?.name || 'Sem responsável');
}

export function getPipelineValueByBranchReport(filteredLeads: ExtendedLeadItem[]) {
  return getValueByGroup(filteredLeads, (lead) => lead.branch?.name || 'Sem filial');
}

export function getPipelineValueByDepartmentReport(filteredLeads: ExtendedLeadItem[]) {
  return getValueByGroup(filteredLeads, (lead) => lead.department?.name || 'Sem departamento');
}

export function getWonLostByPeriodReport(
  filteredLeads: ExtendedLeadItem[],
): CrmPeriodOutcomeRow[] {
  const groups = new Map<string, CrmPeriodOutcomeRow>();

  filteredLeads.forEach((lead) => {
    const date =
      lead.status === 'WON'
        ? lead.wonAt
        : lead.status === 'LOST'
          ? lead.lostAt
          : null;

    if (!date) return;

    const parsed = new Date(date);
    if (Number.isNaN(parsed.getTime())) return;

    const period = `${parsed.getFullYear()}-${String(parsed.getMonth() + 1).padStart(2, '0')}`;
    const current = groups.get(period) || { period, won: 0, lost: 0 };

    if (lead.status === 'WON') current.won += 1;
    if (lead.status === 'LOST') current.lost += 1;

    groups.set(period, current);
  });

  return [...groups.values()].sort((a, b) => a.period.localeCompare(b.period)).slice(-6);
}

export function getLossReasonsBreakdownReport(filteredLeads: ExtendedLeadItem[]): CrmReportRow[] {
  const groups = new Map<string, number>();

  filteredLeads
    .filter((lead) => lead.status === 'LOST')
    .forEach((lead) => {
      const reason = normalizeUiText(lead.lostReason || 'Não informado');
      groups.set(reason, (groups.get(reason) || 0) + 1);
    });

  return [...groups.entries()]
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => b.count - a.count);
}

export function getStageAgingReport(filteredLeads: ExtendedLeadItem[]): CrmReportRow[] {
  return STATUS_ORDER.map((status) => {
    const leads = filteredLeads.filter((lead) => lead.status === status);
    const totalDays = leads.reduce(
      (sum, lead) => sum + daysSince(lead.statusChangedAt || lead.updatedAt),
      0,
    );

    return {
      label: status,
      count: leads.length,
      averageDays: leads.length ? Math.round(totalDays / leads.length) : 0,
    };
  });
}

export function getStalledLeadsByOwnerReport(filteredLeads: ExtendedLeadItem[]): CrmReportRow[] {
  const groups = new Map<string, number>();

  filteredLeads
    .filter((lead) => daysSince(getLastActivity(lead)) > 5)
    .forEach((lead) => {
      const label = normalizeUiText(lead.ownerUser?.name || 'Sem responsável');
      groups.set(label, (groups.get(label) || 0) + 1);
    });

  return [...groups.entries()]
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => b.count - a.count);
}

export function getOpenTasksByOwnerReport(filteredLeads: ExtendedLeadItem[]): CrmReportRow[] {
  const groups = new Map<string, number>();

  filteredLeads.forEach((lead) => {
    const openTasks = lead.tasks?.length || 0;
    if (openTasks === 0) return;

    const label = normalizeUiText(lead.ownerUser?.name || 'Sem responsável');
    groups.set(label, (groups.get(label) || 0) + openTasks);
  });

  return [...groups.entries()]
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => b.count - a.count);
}