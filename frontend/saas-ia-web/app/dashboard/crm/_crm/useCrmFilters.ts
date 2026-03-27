import { useEffect, useMemo, useState } from "react";
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
} from "./crm.selectors";
import type { CrmFiltersState } from "./crm.selectors";
import type { CrmLeadsQueryParams } from "./crm.service";
import type {
  BooleanFilter,
  CrmAnalyticsResponse,
  CrmSavedViewFilters,
  ExtendedLeadItem,
  LeadPriority,
  LeadStatus,
  TemperatureFilter,
} from "./types";

type SortBy =
  | "createdAt"
  | "updatedAt"
  | "expectedCloseDate"
  | "lastActivityAt";
type SortOrder = "asc" | "desc";

export function useCrmFilters(
  leads: ExtendedLeadItem[],
  analyticsResponse?: CrmAnalyticsResponse | null,
) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | LeadStatus>("ALL");
  const [temperatureFilter, setTemperatureFilter] =
    useState<TemperatureFilter>("ALL");
  const [priorityFilter, setPriorityFilter] = useState<"ALL" | LeadPriority>(
    "ALL",
  );
  const [sourceFilter, setSourceFilter] = useState("ALL");
  const [ownerFilter, setOwnerFilter] = useState("ALL");
  const [branchFilter, setBranchFilter] = useState("ALL");
  const [departmentFilter, setDepartmentFilter] = useState("ALL");

  const [openTasksOnly, setOpenTasksOnly] = useState<BooleanFilter>("ALL");
  const [stalledOnly, setStalledOnly] = useState<BooleanFilter>("ALL");
  const [overdueNextStepOnly, setOverdueNextStepOnly] =
    useState<BooleanFilter>("ALL");

  const [probabilityMin, setProbabilityMin] = useState("");
  const [probabilityMax, setProbabilityMax] = useState("");
  const [dealValueMin, setDealValueMin] = useState("");
  const [dealValueMax, setDealValueMax] = useState("");
  const [createdAtFrom, setCreatedAtFrom] = useState("");
  const [createdAtTo, setCreatedAtTo] = useState("");
  const [expectedCloseDateFrom, setExpectedCloseDateFrom] = useState("");
  const [expectedCloseDateTo, setExpectedCloseDateTo] = useState("");

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [sortBy, setSortBy] = useState<SortBy>("updatedAt");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");

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
      status: statusFilter !== "ALL" ? statusFilter : undefined,
      ownerUserId: ownerFilter !== "ALL" ? ownerFilter : undefined,
      branchId: branchFilter !== "ALL" ? branchFilter : undefined,
      departmentId: departmentFilter !== "ALL" ? departmentFilter : undefined,
      source: sourceFilter !== "ALL" ? sourceFilter : undefined,
      priority: priorityFilter !== "ALL" ? priorityFilter : undefined,
      temperatureFilter:
        temperatureFilter !== "ALL" ? temperatureFilter : undefined,
      openTasksOnly: openTasksOnly !== "ALL" ? openTasksOnly : undefined,
      stalledOnly: stalledOnly !== "ALL" ? stalledOnly : undefined,
      overdueNextStepOnly:
        overdueNextStepOnly !== "ALL" ? overdueNextStepOnly : undefined,
      probabilityMin: probabilityMin.trim()
        ? Number(probabilityMin)
        : undefined,
      probabilityMax: probabilityMax.trim()
        ? Number(probabilityMax)
        : undefined,
      dealValueMin: dealValueMin.trim() ? Number(dealValueMin) : undefined,
      dealValueMax: dealValueMax.trim() ? Number(dealValueMax) : undefined,
      createdAtFrom: createdAtFrom || undefined,
      createdAtTo: createdAtTo || undefined,
      expectedCloseDateFrom: expectedCloseDateFrom || undefined,
      expectedCloseDateTo: expectedCloseDateTo || undefined,
      page,
      pageSize,
      sortBy,
      sortOrder,
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
      page,
      pageSize,
      priorityFilter,
      probabilityMax,
      probabilityMin,
      searchTerm,
      sortBy,
      sortOrder,
      sourceFilter,
      stalledOnly,
      statusFilter,
      temperatureFilter,
    ],
  );

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setPage(1);
    }, 0);

    return () => window.clearTimeout(timer);
  }, [
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
    sortBy,
    sortOrder,
    pageSize,
  ]);

  const ownerOptions = useMemo(() => getOwnerOptions(leads), [leads]);
  const branchOptions = useMemo(() => getBranchOptions(leads), [leads]);
  const departmentOptions = useMemo(() => getDepartmentOptions(leads), [leads]);
  const sourceOptions = useMemo(() => getSourceOptions(leads), [leads]);

  // Mantemos os selectors locais para derivar cards e relatórios da página.
  // Os filtros principais agora também são enviados ao backend.
  const filteredLeads = useMemo(
    () => getFilteredLeads(leads, filters),
    [filters, leads],
  );
  const analyticsLeads = analyticsResponse?.items ?? filteredLeads;

  const stats = useMemo(() => getCrmStats(analyticsLeads), [analyticsLeads]);
  const pipelineGroups = useMemo(
    () => getPipelineGroups(analyticsLeads),
    [analyticsLeads],
  );
  const pipelineTotals = useMemo(
    () => getPipelineTotals(pipelineGroups),
    [pipelineGroups],
  );
  const dominantStatus = useMemo(
    () => getDominantStatus(pipelineTotals),
    [pipelineTotals],
  );
  const topOwner = useMemo(() => getTopOwner(analyticsLeads), [analyticsLeads]);
  const totalPipelineValue = useMemo(
    () => getTotalPipelineValue(pipelineTotals),
    [pipelineTotals],
  );
  const totalForecast = useMemo(
    () => getTotalForecast(pipelineTotals),
    [pipelineTotals],
  );
  const averageProbability = useMemo(
    () => getAverageProbability(analyticsLeads),
    [analyticsLeads],
  );

  const stageConversionReport = useMemo(
    () => getStageConversionReport(analyticsLeads),
    [analyticsLeads],
  );

  const sourceConversionReport = useMemo(
    () => getSourceConversionReport(analyticsLeads),
    [analyticsLeads],
  );

  const pipelineValueByOwnerReport = useMemo(
    () => getPipelineValueByOwnerReport(analyticsLeads),
    [analyticsLeads],
  );

  const pipelineValueByBranchReport = useMemo(
    () => getPipelineValueByBranchReport(analyticsLeads),
    [analyticsLeads],
  );

  const pipelineValueByDepartmentReport = useMemo(
    () => getPipelineValueByDepartmentReport(analyticsLeads),
    [analyticsLeads],
  );

  const wonLostByPeriodReport = useMemo(
    () => getWonLostByPeriodReport(analyticsLeads),
    [analyticsLeads],
  );

  const lossReasonsBreakdownReport = useMemo(
    () => getLossReasonsBreakdownReport(analyticsLeads),
    [analyticsLeads],
  );

  const stageAgingReport = useMemo(
    () => getStageAgingReport(analyticsLeads),
    [analyticsLeads],
  );

  const stalledLeadsByOwnerReport = useMemo(
    () => getStalledLeadsByOwnerReport(analyticsLeads),
    [analyticsLeads],
  );

  const openTasksByOwnerReport = useMemo(
    () => getOpenTasksByOwnerReport(analyticsLeads),
    [analyticsLeads],
  );

  function resetFilters() {
    setSearchTerm("");
    setStatusFilter("ALL");
    setTemperatureFilter("ALL");
    setPriorityFilter("ALL");
    setSourceFilter("ALL");
    setOwnerFilter("ALL");
    setBranchFilter("ALL");
    setDepartmentFilter("ALL");
    setOpenTasksOnly("ALL");
    setStalledOnly("ALL");
    setOverdueNextStepOnly("ALL");
    setProbabilityMin("");
    setProbabilityMax("");
    setDealValueMin("");
    setDealValueMax("");
    setCreatedAtFrom("");
    setCreatedAtTo("");
    setExpectedCloseDateFrom("");
    setExpectedCloseDateTo("");
    setPage(1);
    setPageSize(20);
    setSortBy("updatedAt");
    setSortOrder("desc");
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
    setSearchTerm(savedFilters.searchTerm || "");
    setStatusFilter((savedFilters.statusFilter as "ALL" | LeadStatus) || "ALL");
    setTemperatureFilter(
      (savedFilters.temperatureFilter as TemperatureFilter) || "ALL",
    );
    setPriorityFilter(
      (savedFilters.priorityFilter as "ALL" | LeadPriority) || "ALL",
    );
    setSourceFilter(savedFilters.sourceFilter || "ALL");
    setOwnerFilter(savedFilters.ownerFilter || "ALL");
    setBranchFilter(savedFilters.branchFilter || "ALL");
    setDepartmentFilter(savedFilters.departmentFilter || "ALL");
    setOpenTasksOnly((savedFilters.openTasksOnly as BooleanFilter) || "ALL");
    setStalledOnly((savedFilters.stalledOnly as BooleanFilter) || "ALL");
    setOverdueNextStepOnly(
      (savedFilters.overdueNextStepOnly as BooleanFilter) || "ALL",
    );
    setProbabilityMin(savedFilters.probabilityMin || "");
    setProbabilityMax(savedFilters.probabilityMax || "");
    setDealValueMin(savedFilters.dealValueMin || "");
    setDealValueMax(savedFilters.dealValueMax || "");
    setCreatedAtFrom(savedFilters.createdAtFrom || "");
    setCreatedAtTo(savedFilters.createdAtTo || "");
    setExpectedCloseDateFrom(savedFilters.expectedCloseDateFrom || "");
    setExpectedCloseDateTo(savedFilters.expectedCloseDateTo || "");
    setPage(Number(savedFilters.page || 1));
    setPageSize(Number(savedFilters.pageSize || 20));
    setSortBy((savedFilters.sortBy as SortBy) || "updatedAt");
    setSortOrder((savedFilters.sortOrder as SortOrder) || "desc");
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
