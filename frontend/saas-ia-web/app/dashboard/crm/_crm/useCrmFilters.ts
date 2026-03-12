import { useMemo, useState } from 'react';

import {
  getAverageProbability,
  getBranchOptions,
  getCrmStats,
  getDepartmentOptions,
  getDominantStatus,
  getFilteredLeads,
  getOwnerOptions,
  getPipelineGroups,
  getPipelineTotals,
  getPipelineValueByBranchReport,
  getPipelineValueByDepartmentReport,
  getPipelineValueByOwnerReport,
  getSourceOptions,
  getSourceConversionReport,
  getStageAgingReport,
  getStageConversionReport,
  getStalledLeadsByOwnerReport,
  getTopOwner,
  getTotalForecast,
  getTotalPipelineValue,
  getWonLostByPeriodReport,
  getLossReasonsBreakdownReport,
  getOpenTasksByOwnerReport,
} from './crm.selectors';
import type { CrmFiltersState } from './crm.selectors';
import type {
  BooleanFilter,
  CrmSavedViewFilters,
  ExtendedLeadItem,
  LeadPriority,
  LeadStatus,
  TemperatureFilter,
} from './types';

export function useCrmFilters(leads: ExtendedLeadItem[]) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | LeadStatus>('ALL');
  const [temperatureFilter, setTemperatureFilter] = useState<TemperatureFilter>('ALL');
  const [priorityFilter, setPriorityFilter] = useState<'ALL' | LeadPriority>('ALL');
  const [sourceFilter, setSourceFilter] = useState('ALL');
  const [ownerFilter, setOwnerFilter] = useState('ALL');
  const [branchFilter, setBranchFilter] = useState('ALL');
  const [departmentFilter, setDepartmentFilter] = useState('ALL');
  const [openTasksOnly, setOpenTasksOnly] = useState<BooleanFilter>('ALL');
  const [stalledOnly, setStalledOnly] = useState<BooleanFilter>('ALL');
  const [overdueNextStepOnly, setOverdueNextStepOnly] = useState<BooleanFilter>('ALL');
  const [probabilityMin, setProbabilityMin] = useState('');
  const [probabilityMax, setProbabilityMax] = useState('');
  const [dealValueMin, setDealValueMin] = useState('');
  const [dealValueMax, setDealValueMax] = useState('');
  const [createdAtFrom, setCreatedAtFrom] = useState('');
  const [createdAtTo, setCreatedAtTo] = useState('');
  const [expectedCloseDateFrom, setExpectedCloseDateFrom] = useState('');
  const [expectedCloseDateTo, setExpectedCloseDateTo] = useState('');

  const filters = useMemo<CrmFiltersState>(
    () => ({
      searchTerm,
      statusFilter,
      temperatureFilter,
      priorityFilter,
      sourceFilter,
      ownerFilter,
      branchFilter,
      departmentFilter,
      openTasksOnly,
      stalledOnly,
      overdueNextStepOnly,
      probabilityMin,
      probabilityMax,
      dealValueMin,
      dealValueMax,
      createdAtFrom,
      createdAtTo,
      expectedCloseDateFrom,
      expectedCloseDateTo,
    }),
    [
      branchFilter,
      createdAtFrom,
      createdAtTo,
      dealValueMax,
      dealValueMin,
      departmentFilter,
      expectedCloseDateFrom,
      expectedCloseDateTo,
      openTasksOnly,
      overdueNextStepOnly,
      ownerFilter,
      priorityFilter,
      probabilityMax,
      probabilityMin,
      searchTerm,
      sourceFilter,
      stalledOnly,
      statusFilter,
      temperatureFilter,
    ],
  );

  const ownerOptions = useMemo(() => getOwnerOptions(leads), [leads]);
  const branchOptions = useMemo(() => getBranchOptions(leads), [leads]);
  const departmentOptions = useMemo(() => getDepartmentOptions(leads), [leads]);
  const sourceOptions = useMemo(() => getSourceOptions(leads), [leads]);
  const filteredLeads = useMemo(() => getFilteredLeads(leads, filters), [filters, leads]);
  const stats = useMemo(() => getCrmStats(filteredLeads), [filteredLeads]);
  const pipelineGroups = useMemo(() => getPipelineGroups(filteredLeads), [filteredLeads]);
  const pipelineTotals = useMemo(() => getPipelineTotals(pipelineGroups), [pipelineGroups]);
  const dominantStatus = useMemo(() => getDominantStatus(pipelineTotals), [pipelineTotals]);
  const topOwner = useMemo(() => getTopOwner(filteredLeads), [filteredLeads]);
  const totalPipelineValue = useMemo(
    () => getTotalPipelineValue(pipelineTotals),
    [pipelineTotals],
  );
  const totalForecast = useMemo(() => getTotalForecast(pipelineTotals), [pipelineTotals]);
  const averageProbability = useMemo(
    () => getAverageProbability(filteredLeads),
    [filteredLeads],
  );
  const stageConversionReport = useMemo(
    () => getStageConversionReport(filteredLeads),
    [filteredLeads],
  );
  const sourceConversionReport = useMemo(
    () => getSourceConversionReport(filteredLeads),
    [filteredLeads],
  );
  const pipelineValueByOwnerReport = useMemo(
    () => getPipelineValueByOwnerReport(filteredLeads),
    [filteredLeads],
  );
  const pipelineValueByBranchReport = useMemo(
    () => getPipelineValueByBranchReport(filteredLeads),
    [filteredLeads],
  );
  const pipelineValueByDepartmentReport = useMemo(
    () => getPipelineValueByDepartmentReport(filteredLeads),
    [filteredLeads],
  );
  const wonLostByPeriodReport = useMemo(
    () => getWonLostByPeriodReport(filteredLeads),
    [filteredLeads],
  );
  const lossReasonsBreakdownReport = useMemo(
    () => getLossReasonsBreakdownReport(filteredLeads),
    [filteredLeads],
  );
  const stageAgingReport = useMemo(
    () => getStageAgingReport(filteredLeads),
    [filteredLeads],
  );
  const stalledLeadsByOwnerReport = useMemo(
    () => getStalledLeadsByOwnerReport(filteredLeads),
    [filteredLeads],
  );
  const openTasksByOwnerReport = useMemo(
    () => getOpenTasksByOwnerReport(filteredLeads),
    [filteredLeads],
  );

  function resetFilters() {
    setSearchTerm('');
    setStatusFilter('ALL');
    setTemperatureFilter('ALL');
    setPriorityFilter('ALL');
    setSourceFilter('ALL');
    setOwnerFilter('ALL');
    setBranchFilter('ALL');
    setDepartmentFilter('ALL');
    setOpenTasksOnly('ALL');
    setStalledOnly('ALL');
    setOverdueNextStepOnly('ALL');
    setProbabilityMin('');
    setProbabilityMax('');
    setDealValueMin('');
    setDealValueMax('');
    setCreatedAtFrom('');
    setCreatedAtTo('');
    setExpectedCloseDateFrom('');
    setExpectedCloseDateTo('');
  }

  function getSavableFilters(): CrmSavedViewFilters {
    return {
      searchTerm,
      statusFilter,
      temperatureFilter,
      priorityFilter,
      sourceFilter,
      ownerFilter,
      departmentFilter,
      openTasksOnly,
      stalledOnly,
      overdueNextStepOnly,
      probabilityMin,
      probabilityMax,
      dealValueMin,
      dealValueMax,
      createdAtFrom,
      createdAtTo,
      expectedCloseDateFrom,
      expectedCloseDateTo,
    };
  }

  function applySavedFilters(savedFilters: CrmSavedViewFilters) {
    setSearchTerm(savedFilters.searchTerm || '');
    setStatusFilter(savedFilters.statusFilter || 'ALL');
    setTemperatureFilter(savedFilters.temperatureFilter || 'ALL');
    setPriorityFilter(savedFilters.priorityFilter || 'ALL');
    setSourceFilter(savedFilters.sourceFilter || 'ALL');
    setOwnerFilter(savedFilters.ownerFilter || 'ALL');
    setDepartmentFilter(savedFilters.departmentFilter || 'ALL');
    setOpenTasksOnly(savedFilters.openTasksOnly || 'ALL');
    setStalledOnly(savedFilters.stalledOnly || 'ALL');
    setOverdueNextStepOnly(savedFilters.overdueNextStepOnly || 'ALL');
    setProbabilityMin(savedFilters.probabilityMin || '');
    setProbabilityMax(savedFilters.probabilityMax || '');
    setDealValueMin(savedFilters.dealValueMin || '');
    setDealValueMax(savedFilters.dealValueMax || '');
    setCreatedAtFrom(savedFilters.createdAtFrom || '');
    setCreatedAtTo(savedFilters.createdAtTo || '');
    setExpectedCloseDateFrom(savedFilters.expectedCloseDateFrom || '');
    setExpectedCloseDateTo(savedFilters.expectedCloseDateTo || '');
  }

  return {
    applySavedFilters,
    averageProbability,
    branchFilter,
    branchOptions,
    departmentFilter,
    departmentOptions,
    dominantStatus,
    filteredLeads,
    createdAtFrom,
    createdAtTo,
    dealValueMax,
    dealValueMin,
    expectedCloseDateFrom,
    expectedCloseDateTo,
    openTasksOnly,
    ownerFilter,
    ownerOptions,
    pipelineGroups,
    pipelineTotals,
    priorityFilter,
    probabilityMax,
    probabilityMin,
    stageAgingReport,
    stageConversionReport,
    stalledLeadsByOwnerReport,
    getSavableFilters,
    lossReasonsBreakdownReport,
    openTasksByOwnerReport,
    pipelineValueByBranchReport,
    pipelineValueByDepartmentReport,
    pipelineValueByOwnerReport,
    resetFilters,
    searchTerm,
    setBranchFilter,
    setCreatedAtFrom,
    setCreatedAtTo,
    setDealValueMax,
    setDealValueMin,
    setDepartmentFilter,
    setExpectedCloseDateFrom,
    setExpectedCloseDateTo,
    setOpenTasksOnly,
    setOwnerFilter,
    setOverdueNextStepOnly,
    setPriorityFilter,
    setProbabilityMax,
    setProbabilityMin,
    setSearchTerm,
    setSourceFilter,
    setStalledOnly,
    setStatusFilter,
    setTemperatureFilter,
    sourceFilter,
    sourceOptions,
    stats,
    sourceConversionReport,
    stalledOnly,
    statusFilter,
    temperatureFilter,
    topOwner,
    totalForecast,
    totalPipelineValue,
    overdueNextStepOnly,
    wonLostByPeriodReport,
  };
}
