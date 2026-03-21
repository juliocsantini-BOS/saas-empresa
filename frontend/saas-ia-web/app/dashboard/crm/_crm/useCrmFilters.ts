import { useEffect, useMemo, useState } from 'react';
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
import type { CrmLeadsQueryParams } from './crm.service';
import type {
  BooleanFilter,
  CrmSavedViewFilters,
  ExtendedLeadItem,
  LeadPriority,
  LeadStatus,
  TemperatureFilter,
} from './types';

type SortBy = 'createdAt' | 'updatedAt' | 'expectedCloseDate' | 'lastActivityAt';
type SortOrder = 'asc' | 'desc';

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

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [sortBy, setSortBy] = useState<SortBy>('updatedAt');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');

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

  const queryParams = useMemo<CrmLeadsQueryParams>(
    () => ({
      q: searchTerm.trim() || undefined,
      status: statusFilter !== 'ALL' ? statusFilter : undefined,
      ownerUserId: ownerFilter !== 'ALL' ? ownerFilter : undefined,
      branchId: branchFilter !== 'ALL' ? branchFilter : undefined,
      departmentId: departmentFilter !== 'ALL' ? departmentFilter : undefined,
      source: sourceFilter !== 'ALL' ? sourceFilter : undefined,
      priority: priorityFilter !== 'ALL' ? priorityFilter : undefined,
      page,
      pageSize,
      sortBy,
      sortOrder,
    }),
    [
      branchFilter,
      departmentFilter,
      ownerFilter,
      page,
      pageSize,
      priorityFilter,
      searchTerm,
      sortBy,
      sortOrder,
      sourceFilter,
      statusFilter,
    ],
  );

  useEffect(() => {
    setPage(1);
  }, [
    searchTerm,
    statusFilter,
    priorityFilter,
    sourceFilter,
    ownerFilter,
    branchFilter,
    departmentFilter,
    sortBy,
    sortOrder,
    pageSize,
  ]);

  const ownerOptions = useMemo(() => getOwnerOptions(leads), [leads]);
  const branchOptions = useMemo(() => getBranchOptions(leads), [leads]);
  const departmentOptions = useMemo(() => getDepartmentOptions(leads), [leads]);
  const sourceOptions = useMemo(() => getSourceOptions(leads), [leads]);

  // Estes filtros continuam locais por enquanto.
  // Eles agem sobre os leads já carregados pela página atual do backend.
  const filteredLeads = useMemo(() => getFilteredLeads(leads, filters), [filters, leads]);

  const stats = useMemo(() => getCrmStats(filteredLeads), [filteredLeads]);
  const pipelineGroups = useMemo(() => getPipelineGroups(filteredLeads), [filteredLeads]);
  const pipelineTotals = useMemo(() => getPipelineTotals(pipelineGroups), [pipelineGroups]);
  const dominantStatus = useMemo(() => getDominantStatus(pipelineTotals), [pipelineTotals]);
  const topOwner = useMemo(() => getTopOwner(filteredLeads), [filteredLeads]);
  const totalPipelineValue = useMemo(() => getTotalPipelineValue(pipelineTotals), [pipelineTotals]);
  const totalForecast = useMemo(() => getTotalForecast(pipelineTotals), [pipelineTotals]);
  const averageProbability = useMemo(() => getAverageProbability(filteredLeads), [filteredLeads]);

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
    setPage(1);
    setPageSize(20);
    setSortBy('updatedAt');
    setSortOrder('desc');
  }

  function getSavableFilters(): CrmSavedViewFilters {
    return {
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
      page: String(page),
      pageSize: String(pageSize),
      sortBy,
      sortOrder,
    };
  }

  function applySavedFilters(savedFilters: CrmSavedViewFilters) {
    setSearchTerm(savedFilters.searchTerm || '');
    setStatusFilter((savedFilters.statusFilter as 'ALL' | LeadStatus) || 'ALL');
    setTemperatureFilter((savedFilters.temperatureFilter as TemperatureFilter) || 'ALL');
    setPriorityFilter((savedFilters.priorityFilter as 'ALL' | LeadPriority) || 'ALL');
    setSourceFilter(savedFilters.sourceFilter || 'ALL');
    setOwnerFilter(savedFilters.ownerFilter || 'ALL');
    setBranchFilter(savedFilters.branchFilter || 'ALL');
    setDepartmentFilter(savedFilters.departmentFilter || 'ALL');
    setOpenTasksOnly((savedFilters.openTasksOnly as BooleanFilter) || 'ALL');
    setStalledOnly((savedFilters.stalledOnly as BooleanFilter) || 'ALL');
    setOverdueNextStepOnly((savedFilters.overdueNextStepOnly as BooleanFilter) || 'ALL');
    setProbabilityMin(savedFilters.probabilityMin || '');
    setProbabilityMax(savedFilters.probabilityMax || '');
    setDealValueMin(savedFilters.dealValueMin || '');
    setDealValueMax(savedFilters.dealValueMax || '');
    setCreatedAtFrom(savedFilters.createdAtFrom || '');
    setCreatedAtTo(savedFilters.createdAtTo || '');
    setExpectedCloseDateFrom(savedFilters.expectedCloseDateFrom || '');
    setExpectedCloseDateTo(savedFilters.expectedCloseDateTo || '');
    setPage(Number(savedFilters.page || 1));
    setPageSize(Number(savedFilters.pageSize || 20));
    setSortBy((savedFilters.sortBy as SortBy) || 'updatedAt');
    setSortOrder((savedFilters.sortOrder as SortOrder) || 'desc');
  }

  return {
    applySavedFilters,
    averageProbability,
    branchFilter,
    branchOptions,
    createdAtFrom,
    createdAtTo,
    dealValueMax,
    dealValueMin,
    departmentFilter,
    departmentOptions,
    dominantStatus,
    expectedCloseDateFrom,
    expectedCloseDateTo,
    filteredLeads,
    getSavableFilters,
    lossReasonsBreakdownReport,
    openTasksByOwnerReport,
    openTasksOnly,
    overdueNextStepOnly,
    ownerFilter,
    ownerOptions,
    page,
    pageSize,
    pipelineGroups,
    pipelineTotals,
    pipelineValueByBranchReport,
    pipelineValueByDepartmentReport,
    pipelineValueByOwnerReport,
    priorityFilter,
    probabilityMax,
    probabilityMin,
    queryParams,
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
    setOverdueNextStepOnly,
    setOwnerFilter,
    setPage,
    setPageSize,
    setPriorityFilter,
    setProbabilityMax,
    setProbabilityMin,
    setSearchTerm,
    setSortBy,
    setSortOrder,
    setSourceFilter,
    setStalledOnly,
    setStatusFilter,
    setTemperatureFilter,
    sortBy,
    sortOrder,
    sourceConversionReport,
    sourceFilter,
    sourceOptions,
    stageAgingReport,
    stageConversionReport,
    stalledLeadsByOwnerReport,
    stalledOnly,
    stats,
    statusFilter,
    temperatureFilter,
    topOwner,
    totalForecast,
    totalPipelineValue,
    wonLostByPeriodReport,
  };
}