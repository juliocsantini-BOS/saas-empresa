'use client';

import { useMemo, useRef, useState } from 'react';

import {
  FILTER_STATUS_LABELS,
  INTERACTION_OPTIONS,
  PRIORITY_LABELS,
  STATUS_LABELS,
  STATUS_ORDER,
  TEMPERATURE_LABELS,
} from './_crm/constants';
import {
  CrmExecutiveHero,
  CrmMetricCard,
  CrmPanel,
  CrmSectionHeader,
  CrmStyles,
} from './_crm/components';
import type { AuthHeaders } from './_crm/crm.service';
import {
  classNames,
  daysSince,
  formatDateShort,
  formatDateTime,
  formatMoney,
  formatPriority,
  formatRelativeTime,
  getLastActivity,
  getLeadHealth,
  getLeadHealthClass,
  getLeadScore,
  getLeadTemperature,
  getTemperatureChipClass,
  getToken,
  normalizeProbability,
  normalizeUiText,
  parseMoney,
  priorityClass,
  statusBadge,
  statusDotClass,
} from './_crm/utils';
import { useCreateLeadForm } from './_crm/useCreateLeadForm';
import { useEditLeadForm } from './_crm/useEditLeadForm';
import { useCrmFilters } from './_crm/useCrmFilters';
import { useLeadActivityComposer } from './_crm/useLeadActivityComposer';
import { useLeadOutcomeUpdate } from './_crm/useLeadOutcomeUpdate';
import { useLeadStatusUpdate } from './_crm/useLeadStatusUpdate';
import { useLeadTaskCreate } from './_crm/useLeadTaskCreate';
import { useLeadDetails } from './_crm/useLeadDetails';
import { useCrmLeads } from './_crm/useCrmLeads';
import { useCrmPermissions } from './_crm/useCrmPermissions';
import { useCrmSavedViews } from './_crm/useCrmSavedViews';
import { useCrmBulkSelection } from './_crm/useCrmBulkSelection';
import { useCrmBulkActions } from './_crm/useCrmBulkActions';
import type {
  LeadStatus,
  TemperatureFilter,
} from './_crm/types';

export default function CrmPage() {
  const pipelineRef = useRef<HTMLDivElement | null>(null);

  const authHeaders = useMemo<AuthHeaders>(() => {
    const token = getToken();
    const headers: AuthHeaders = {};
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
    return headers;
  }, []);
  const {
    canChangeLeadStatus,
    canCreateActivities,
    canCreateSavedViews,
    canCreateTasks,
    canDeleteSavedViews,
    canEditLead,
    canMarkLeadOutcome,
    canSeeValues,
    canUseBulkActions,
  } = useCrmPermissions(authHeaders);

  const { error, leads, loading, reload: loadLeads, setError } = useCrmLeads(authHeaders);
  const { createForm, createLead, isCreateOpen, savingLead, setCreateForm, setIsCreateOpen } =
    useCreateLeadForm({
      authHeaders,
      loadLeads,
      setError,
    });
  const {
    averageProbability,
    applySavedFilters,
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
    openTasksOnly,
    ownerFilter,
    ownerOptions,
    pipelineGroups,
    pipelineTotals,
    pipelineValueByBranchReport,
    pipelineValueByDepartmentReport,
    pipelineValueByOwnerReport,
    priorityFilter,
    probabilityMax,
    probabilityMin,
    getSavableFilters,
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
    sourceConversionReport,
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
    overdueNextStepOnly,
    wonLostByPeriodReport,
    lossReasonsBreakdownReport,
    openTasksByOwnerReport,
  } = useCrmFilters(leads);
  const {
    applyViewById,
    deleteView,
    deletingViewId,
    loadingSavedViews,
    newViewName,
    saveCurrentView,
    savedViews,
    savingSavedView,
    selectedViewId,
    setNewViewName,
  } = useCrmSavedViews({
    authHeaders,
    currentFilters: getSavableFilters(),
    applySavedFilters,
    setError,
  });
  const { selectedLead, leadActivities, leadTasks, loadingDetails, openLeadDetails } =
    useLeadDetails(authHeaders);
  const {
    clearSelection,
    isLeadSelected,
    selectFilteredLeads,
    selectedLeadCount,
    selectedLeadIds,
    toggleLeadSelection,
  } = useCrmBulkSelection(filteredLeads);
  const [bulkStatusValue, setBulkStatusValue] = useState<'ALL' | LeadStatus>('ALL');
  const [bulkOwnerValue, setBulkOwnerValue] = useState('ALL');
  const [bulkPriorityValue, setBulkPriorityValue] = useState<'ALL' | 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'>('ALL');
  const {
    closeEditLead,
    editForm,
    editingLead,
    openEditLead,
    saveEditLead,
    savingEditLead,
    setEditForm,
  } = useEditLeadForm({
    authHeaders,
    loadLeads,
    setError,
    onLeadUpdated: (lead) => openLeadDetails(lead),
  });
  const { changeLeadStatus, savingStatus } = useLeadStatusUpdate({
    authHeaders,
    loadLeads,
    onLeadUpdated: (lead) => openLeadDetails(lead),
    setError,
  });
  const {
    closeOutcomeFlow,
    lostReason,
    openLostFlow,
    openWonFlow,
    outcomeLead,
    outcomeStatus,
    savingOutcome,
    setLostReason,
    submitOutcome,
  } = useLeadOutcomeUpdate({
    authHeaders,
    loadLeads,
    onLeadUpdated: (lead) => openLeadDetails(lead),
    setError,
  });
  const { activityText, activityType, savingActivity, setActivityText, setActivityType, submitActivity } = useLeadActivityComposer({
    authHeaders,
    loadLeads,
    refreshLeadDetails: openLeadDetails,
    setError,
  });
  const { bulkChangeOwner, bulkChangePriority, bulkChangeStatus, savingBulkAction } =
    useCrmBulkActions({
      authHeaders,
      loadLeads,
      onLeadUpdated: (lead) => openLeadDetails(lead),
      selectedLeadId: selectedLead?.id,
      setError,
    });
  const { savingTask, setTaskForm, submitTask, taskForm } = useLeadTaskCreate({
    authHeaders,
    loadLeads,
    refreshLeadDetails: openLeadDetails,
    setError,
  });

  const totalOpenTasks = useMemo(
    () => leadTasks.filter((task) => !task.completedAt).length,
    [leadTasks],
  );

  async function applyBulkStatus() {
    if (bulkStatusValue === 'ALL') return;
    const updated = await bulkChangeStatus(selectedLeadIds, bulkStatusValue);
    if (updated) {
      clearSelection();
      setBulkStatusValue('ALL');
    }
  }

  async function applyBulkOwner() {
    if (bulkOwnerValue === 'ALL') return;
    const updated = await bulkChangeOwner(selectedLeadIds, bulkOwnerValue);
    if (updated) {
      clearSelection();
      setBulkOwnerValue('ALL');
    }
  }

  async function applyBulkPriority() {
    if (bulkPriorityValue === 'ALL') return;
    const updated = await bulkChangePriority(selectedLeadIds, bulkPriorityValue);
    if (updated) {
      clearSelection();
      setBulkPriorityValue('ALL');
    }
  }

  return (
    <div className="min-h-screen w-full max-w-full overflow-x-hidden bg-[#07090A] px-4 py-5 text-white md:px-6 md:py-6">
      <CrmStyles />

      <div className="mx-auto flex w-full min-w-0 max-w-[1840px] flex-col gap-6">
        <CrmExecutiveHero
          stats={stats}
          dominantStatus={dominantStatus}
          topOwner={topOwner}
          onAddLead={() => setIsCreateOpen(true)}
          onViewPipeline={() => pipelineRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
        />

        <div className="grid gap-4 sm:grid-cols-2 2xl:grid-cols-4">
          <CrmMetricCard
            label="Pipeline value"
            value={canSeeValues ? formatMoney(totalPipelineValue) : 'Sem acesso'}
            helper="Valor total das oportunidades filtradas"
          />
          <CrmMetricCard
            label="Forecast"
            value={canSeeValues ? formatMoney(totalForecast) : 'Sem acesso'}
            helper="Receita ponderada por probabilidade"
            accent="success"
          />
          <CrmMetricCard
            label="Probabilidade média"
            value={`${averageProbability}%`}
            helper="Qualidade média do pipeline"
            accent="attention"
          />
          <CrmMetricCard
            label="Em atenção"
            value={stats.stalledLeads}
            helper="Leads sem atividade recente"
            accent={stats.stalledLeads > 0 ? 'danger' : 'success'}
          />
        </div>

        <CrmPanel className="p-5 md:p-6">
          <CrmSectionHeader
            eyebrow="Filtros inteligentes"
            title="Busque e refine sua operação comercial"
            description="Use filtros rápidos para ler o funil, identificar gargalos e encontrar oportunidades prioritárias."
            action={
              <button
                type="button"
                onClick={resetFilters}
                className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-xs text-zinc-300 transition hover:bg-white/10"
              >
                Limpar filtros
              </button>
            }
          />

          <div className="mb-5 grid gap-3 rounded-[24px] border border-white/10 bg-black/20 p-4 xl:grid-cols-[minmax(0,1.15fr)_minmax(0,0.95fr)_auto_auto]">
            <div>
              <div className="mb-2 text-[11px] uppercase tracking-[0.18em] text-zinc-500">Visualizações salvas</div>
              <select
                value={selectedViewId}
                onChange={(event) => applyViewById(event.target.value)}
                className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none transition focus:border-[#3BFF8C]/25 focus:bg-white/[0.07]"
              >
                <option value="ALL">Visualização atual</option>
                {savedViews.map((view) => (
                  <option key={view.id} value={view.id}>
                    {normalizeUiText(view.name)}
                  </option>
                ))}
              </select>
            </div>

            {canCreateSavedViews ? (
            <div>
              <div className="mb-2 text-[11px] uppercase tracking-[0.18em] text-zinc-500">Salvar configuração</div>
              <input
                value={newViewName}
                onChange={(event) => setNewViewName(event.target.value)}
                placeholder="Ex.: Prioridade alta"
                className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none transition placeholder:text-zinc-500 focus:border-[#3BFF8C]/25 focus:bg-white/[0.07]"
              />
            </div>
            ) : (
              <div />
            )}

            {canCreateSavedViews ? (
            <button
              type="button"
              onClick={() => void saveCurrentView()}
              disabled={savingSavedView || !newViewName.trim()}
              className="self-end rounded-2xl border border-[#3BFF8C]/20 bg-[#3BFF8C]/10 px-4 py-3 text-sm font-medium text-white transition hover:bg-[#3BFF8C]/15 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {savingSavedView ? 'Salvando...' : 'Salvar view'}
            </button>
            ) : (
              <div />
            )}

            {canDeleteSavedViews ? (
            <button
              type="button"
              onClick={() => void deleteView(selectedViewId)}
              disabled={selectedViewId === 'ALL' || deletingViewId === selectedViewId}
              className="self-end rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-zinc-300 transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {deletingViewId === selectedViewId ? 'Excluindo...' : 'Excluir view'}
            </button>
            ) : (
              <div />
            )}
          </div>

          {loadingSavedViews ? (
            <div className="mb-4 text-xs text-zinc-500">Carregando visualizações salvas...</div>
          ) : null}

          <div className="grid gap-4 xl:grid-cols-[minmax(0,1.45fr)_minmax(300px,1fr)]">
            <div className="rounded-[24px] border border-white/10 bg-black/20 p-4 md:p-5">
              <div className="mb-3 text-[11px] uppercase tracking-[0.18em] text-zinc-500">Busca</div>
              <input
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Buscar por lead, empresa, email, telefone, origem ou responsável"
                className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none transition placeholder:text-zinc-500 focus:border-[#3BFF8C]/25 focus:bg-white/[0.07]"
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-4">
              <FilterGroup
                label="Status"
                options={[
                  { id: 'ALL', label: FILTER_STATUS_LABELS.ALL },
                  ...STATUS_ORDER.map((status) => ({
                    id: status,
                    label: FILTER_STATUS_LABELS[status],
                  })),
                ]}
                value={statusFilter}
                onChange={(value) => setStatusFilter(value as 'ALL' | LeadStatus)}
              />
              <FilterGroup
                label="Temperatura"
                options={[
                  { id: 'ALL', label: TEMPERATURE_LABELS.ALL },
                  { id: 'HOT', label: TEMPERATURE_LABELS.HOT },
                  { id: 'WARM', label: TEMPERATURE_LABELS.WARM },
                  { id: 'COLD', label: TEMPERATURE_LABELS.COLD },
                ]}
                value={temperatureFilter}
                onChange={(value) => setTemperatureFilter(value as TemperatureFilter)}
              />
              <FilterGroup
                label="Responsável"
                options={[{ id: 'ALL', label: 'Todos' }, ...ownerOptions.map((item) => ({ id: item.id, label: item.name }))]}
                value={ownerFilter}
                onChange={setOwnerFilter}
              />
              <FilterGroup
                label="Filial"
                options={[{ id: 'ALL', label: 'Todas' }, ...branchOptions.map((item) => ({ id: item.id, label: item.name }))]}
                value={branchFilter}
                onChange={setBranchFilter}
              />
            </div>
          </div>

          {departmentOptions.length > 0 ? (
            <div className="mt-4">
              <FilterGroup
                label="Departamento"
                options={[{ id: 'ALL', label: 'Todos' }, ...departmentOptions.map((item) => ({ id: item.id, label: item.name }))]}
                value={departmentFilter}
                onChange={setDepartmentFilter}
              />
            </div>
          ) : null}

          <div className="mt-4 grid gap-4 md:grid-cols-2 2xl:grid-cols-4">
            <FilterGroup
              label="Prioridade"
              options={[
                { id: 'ALL', label: 'Todas' },
                { id: 'LOW', label: PRIORITY_LABELS.LOW },
                { id: 'MEDIUM', label: PRIORITY_LABELS.MEDIUM },
                { id: 'HIGH', label: PRIORITY_LABELS.HIGH },
                { id: 'URGENT', label: PRIORITY_LABELS.URGENT },
              ]}
              value={priorityFilter}
              onChange={(value) => setPriorityFilter(value as 'ALL' | 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT')}
            />
            <FilterGroup
              label="Origem"
              options={[{ id: 'ALL', label: 'Todas' }, ...sourceOptions.map((item) => ({ id: item.id, label: item.name }))]}
              value={sourceFilter}
              onChange={setSourceFilter}
            />
            <FilterGroup
              label="Tarefas abertas"
              options={[
                { id: 'ALL', label: 'Todas' },
                { id: 'YES', label: 'Somente com tarefas' },
              ]}
              value={openTasksOnly}
              onChange={(value) => setOpenTasksOnly(value as 'ALL' | 'YES')}
            />
            <FilterGroup
              label="Leads em atenção"
              options={[
                { id: 'ALL', label: 'Todos' },
                { id: 'YES', label: 'Somente stalled' },
              ]}
              value={stalledOnly}
              onChange={(value) => setStalledOnly(value as 'ALL' | 'YES')}
            />
          </div>

          <div className="mt-4 grid gap-4 md:grid-cols-2 2xl:grid-cols-3">
            <FilterGroup
              label="Próximo passo vencido"
              options={[
                { id: 'ALL', label: 'Todos' },
                { id: 'YES', label: 'Somente vencidos' },
              ]}
              value={overdueNextStepOnly}
              onChange={(value) => setOverdueNextStepOnly(value as 'ALL' | 'YES')}
            />
            <RangeFilterGroup
              label="Probabilidade (%)"
              minValue={probabilityMin}
              maxValue={probabilityMax}
              minPlaceholder="Mín."
              maxPlaceholder="Máx."
              onMinChange={setProbabilityMin}
              onMaxChange={setProbabilityMax}
            />
            <RangeFilterGroup
              label="Valor do negócio"
              minValue={dealValueMin}
              maxValue={dealValueMax}
              minPlaceholder="Mín."
              maxPlaceholder="Máx."
              onMinChange={setDealValueMin}
              onMaxChange={setDealValueMax}
            />
          </div>

          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <DateRangeFilterGroup
              label="Criação do lead"
              fromValue={createdAtFrom}
              toValue={createdAtTo}
              onFromChange={setCreatedAtFrom}
              onToChange={setCreatedAtTo}
            />
            <DateRangeFilterGroup
              label="Fechamento previsto"
              fromValue={expectedCloseDateFrom}
              toValue={expectedCloseDateTo}
              onFromChange={setExpectedCloseDateFrom}
              onToChange={setExpectedCloseDateTo}
            />
          </div>
        </CrmPanel>

        {error ? (
          <div className="rounded-[24px] border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">
            {normalizeUiText(error)}
          </div>
        ) : null}

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1.5fr)_minmax(360px,0.82fr)] 2xl:grid-cols-[minmax(0,1.55fr)_minmax(380px,0.82fr)]">
          <div ref={pipelineRef} className="min-w-0 space-y-6">
            <CrmPanel className="p-5">
              <CrmSectionHeader
                eyebrow="Inteligência do pipeline"
                title="Leitura financeira e operacional do funil"
                description="Veja quantidade, valor, forecast e risco médio por etapa."
              />

              <div className="grid gap-4 2xl:grid-cols-2">
                {pipelineTotals.map((item) => (
                  <div
                    key={item.status}
                    className="rounded-[24px] border border-white/10 bg-black/20 p-4 md:p-5"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <div className="text-xs uppercase tracking-[0.18em] text-zinc-500">
                          {STATUS_LABELS[item.status]}
                        </div>
                        <div className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-white">
                          {item.count} lead(s)
                        </div>
                      </div>
                      <div className={classNames('h-3 w-3 rounded-full', statusDotClass(item.status))} />
                    </div>

                    <div className="mt-4 grid gap-3 sm:grid-cols-3">
              <MiniStat label="Valor" value={canSeeValues ? formatMoney(item.totalValue) : 'Sem acesso'} />
              <MiniStat label="Forecast" value={canSeeValues ? formatMoney(item.forecast) : 'Sem acesso'} />
                      <MiniStat label="Probabilidade" value={`${item.avgProbability}%`} />
                    </div>
                  </div>
                ))}
              </div>
            </CrmPanel>

            <CrmPanel className="p-5 md:p-6">
              <CrmSectionHeader
                eyebrow="Reporting"
                title="Visibilidade gerencial do CRM"
                description="Conversão, aging, perdas e distribuição de valor reagem ao conjunto filtrado atual."
              />

              <div className="grid gap-4 2xl:grid-cols-2">
                <ReportListCard
                  title="Conversão por etapa"
                  rows={stageConversionReport.map((item) => ({
                    label: STATUS_LABELS[item.label as LeadStatus] || item.label,
                    value: `${item.rate || 0}%`,
                    helper: `${item.count} lead(s)`,
                  }))}
                />
                <ReportListCard
                  title="Conversão por origem"
                  rows={sourceConversionReport.map((item) => ({
                    label: item.label,
                    value: `${item.rate || 0}%`,
                    helper: `${item.count} lead(s) · ${canSeeValues ? formatMoney(item.value) : 'Sem acesso'}`,
                  }))}
                />
                <ReportListCard
                  title="Pipeline por responsável"
                  rows={pipelineValueByOwnerReport.map((item) => ({
                    label: item.label,
                    value: canSeeValues ? formatMoney(item.value) : 'Sem acesso',
                    helper: `${item.count} lead(s)`,
                  }))}
                />
                <ReportListCard
                  title="Pipeline por filial"
                  rows={pipelineValueByBranchReport.map((item) => ({
                    label: item.label,
                    value: canSeeValues ? formatMoney(item.value) : 'Sem acesso',
                    helper: `${item.count} lead(s)`,
                  }))}
                />
                <ReportListCard
                  title="Pipeline por departamento"
                  rows={pipelineValueByDepartmentReport.map((item) => ({
                    label: item.label,
                    value: canSeeValues ? formatMoney(item.value) : 'Sem acesso',
                    helper: `${item.count} lead(s)`,
                  }))}
                />
                <ReportListCard
                  title="Ganhos e perdas por período"
                  rows={wonLostByPeriodReport.map((item) => ({
                    label: item.period,
                    value: `${item.won} / ${item.lost}`,
                    helper: 'Ganhos / perdidos',
                  }))}
                />
                <ReportListCard
                  title="Motivos de perda"
                  rows={lossReasonsBreakdownReport.map((item) => ({
                    label: item.label,
                    value: String(item.count),
                    helper: 'lead(s) perdidos',
                  }))}
                />
                <ReportListCard
                  title="Aging por etapa"
                  rows={stageAgingReport.map((item) => ({
                    label: STATUS_LABELS[item.label as LeadStatus] || item.label,
                    value: `${item.averageDays || 0}d`,
                    helper: `${item.count} lead(s)`,
                  }))}
                />
                <ReportListCard
                  title="Leads stalled por responsável"
                  rows={stalledLeadsByOwnerReport.map((item) => ({
                    label: item.label,
                    value: String(item.count),
                    helper: 'lead(s) stalled',
                  }))}
                />
                <ReportListCard
                  title="Tarefas abertas por responsável"
                  rows={openTasksByOwnerReport.map((item) => ({
                    label: item.label,
                    value: String(item.count),
                    helper: 'tarefas abertas',
                  }))}
                />
              </div>
            </CrmPanel>

            <CrmPanel className="p-5">
              <CrmSectionHeader
                eyebrow="Pipeline"
                title="Kanban executivo de oportunidades"
                description="Cards com valor, probabilidade, prioridade, origem e ritmo comercial."
              />

              {canUseBulkActions ? (
              <div className="mb-5 grid gap-3 rounded-[24px] border border-white/10 bg-black/20 p-4 xl:grid-cols-[minmax(160px,auto)_minmax(220px,auto)_minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)]">
                <div className="self-end text-sm text-zinc-300">
                  {selectedLeadCount} lead(s) selecionado(s)
                </div>
                <div className="flex flex-wrap items-end gap-2">
                  <button
                    type="button"
                    onClick={selectFilteredLeads}
                    disabled={filteredLeads.length === 0 || selectedLeadCount === filteredLeads.length}
                    className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-zinc-300 transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    Selecionar filtrados
                  </button>
                  <button
                    type="button"
                    onClick={clearSelection}
                    disabled={selectedLeadCount === 0}
                    className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-zinc-300 transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    Limpar
                  </button>
                </div>

                <div className="grid gap-2">
                  <div className="text-[11px] uppercase tracking-[0.18em] text-zinc-500">Status em lote</div>
                  <div className="flex gap-2">
                    <select
                      value={bulkStatusValue}
                      onChange={(event) => setBulkStatusValue(event.target.value as 'ALL' | LeadStatus)}
                      className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none transition focus:border-[#3BFF8C]/25 focus:bg-white/[0.07]"
                    >
                      <option value="ALL">Selecionar status</option>
                      {STATUS_ORDER.map((status) => (
                        <option key={status} value={status}>
                          {STATUS_LABELS[status]}
                        </option>
                      ))}
                    </select>
                    <button
                      type="button"
                      onClick={() => void applyBulkStatus()}
                      disabled={selectedLeadCount === 0 || bulkStatusValue === 'ALL' || savingBulkAction}
                      className="rounded-2xl border border-[#3BFF8C]/20 bg-[#3BFF8C]/10 px-4 py-3 text-sm font-medium text-white transition hover:bg-[#3BFF8C]/15 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      Aplicar
                    </button>
                  </div>
                </div>

                <div className="grid gap-2">
                  <div className="text-[11px] uppercase tracking-[0.18em] text-zinc-500">Responsável em lote</div>
                  <div className="flex gap-2">
                    <select
                      value={bulkOwnerValue}
                      onChange={(event) => setBulkOwnerValue(event.target.value)}
                      className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none transition focus:border-[#3BFF8C]/25 focus:bg-white/[0.07]"
                    >
                      <option value="ALL">Selecionar responsável</option>
                      <option value="UNASSIGNED">Sem responsável</option>
                      {ownerOptions.map((item) => (
                        <option key={item.id} value={item.id}>
                          {item.name}
                        </option>
                      ))}
                    </select>
                    <button
                      type="button"
                      onClick={() => void applyBulkOwner()}
                      disabled={selectedLeadCount === 0 || bulkOwnerValue === 'ALL' || savingBulkAction}
                      className="rounded-2xl border border-[#3BFF8C]/20 bg-[#3BFF8C]/10 px-4 py-3 text-sm font-medium text-white transition hover:bg-[#3BFF8C]/15 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      Aplicar
                    </button>
                  </div>
                </div>

                <div className="grid gap-2">
                  <div className="text-[11px] uppercase tracking-[0.18em] text-zinc-500">Prioridade em lote</div>
                  <div className="flex gap-2">
                    <select
                      value={bulkPriorityValue}
                      onChange={(event) =>
                        setBulkPriorityValue(event.target.value as 'ALL' | 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT')
                      }
                      className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none transition focus:border-[#3BFF8C]/25 focus:bg-white/[0.07]"
                    >
                      <option value="ALL">Selecionar prioridade</option>
                      <option value="LOW">{PRIORITY_LABELS.LOW}</option>
                      <option value="MEDIUM">{PRIORITY_LABELS.MEDIUM}</option>
                      <option value="HIGH">{PRIORITY_LABELS.HIGH}</option>
                      <option value="URGENT">{PRIORITY_LABELS.URGENT}</option>
                    </select>
                    <button
                      type="button"
                      onClick={() => void applyBulkPriority()}
                      disabled={selectedLeadCount === 0 || bulkPriorityValue === 'ALL' || savingBulkAction}
                      className="rounded-2xl border border-[#3BFF8C]/20 bg-[#3BFF8C]/10 px-4 py-3 text-sm font-medium text-white transition hover:bg-[#3BFF8C]/15 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      Aplicar
                    </button>
                  </div>
                </div>
              </div>
              ) : null}

              {loading ? (
                <div className="crm-scroll-x w-full max-w-full overflow-x-auto pb-3">
                  <div className="flex w-max min-w-max gap-5">
                  {STATUS_ORDER.map((status) => (
                    <div
                      key={status}
                      className="w-[344px] min-w-[344px] max-w-[344px] shrink-0 rounded-[28px] border border-white/10 bg-black/20 p-5"
                    >
                      <div className="h-5 w-28 animate-pulse rounded bg-white/10" />
                      <div className="mt-4 space-y-3">
                        <div className="h-28 animate-pulse rounded-[22px] bg-white/5" />
                        <div className="h-28 animate-pulse rounded-[22px] bg-white/5" />
                      </div>
                    </div>
                  ))}
                  </div>
                </div>
              ) : (
                <div className="crm-scroll-x w-full max-w-full overflow-x-auto pb-3">
                  <div className="flex w-max min-w-max gap-5">
                  {STATUS_ORDER.map((status) => {
                    const stageLeads = pipelineGroups[status];
                    const stageValue = stageLeads.reduce((sum, lead) => sum + parseMoney(lead.dealValue), 0);

                    return (
                      <div
                        key={status}
                        className="crm-scroll flex max-h-[78vh] w-[344px] min-w-[344px] max-w-[344px] shrink-0 flex-col overflow-y-auto overflow-x-hidden rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.035),rgba(0,0,0,0.12))] p-5"
                      >
                        <div className="sticky top-0 z-10 -mx-2 mb-4 rounded-[22px] border border-white/10 bg-[#090B0C]/92 px-4 py-4 backdrop-blur">
                          <div className="flex items-center justify-between gap-3">
                            <div className="min-w-0">
                              <div className="truncate text-xs uppercase tracking-[0.18em] text-zinc-500">
                                {STATUS_LABELS[status]}
                              </div>
                              <div className="mt-1 text-sm font-medium text-white">
                                {stageLeads.length} lead(s)
                              </div>
                            </div>
                            <div className={classNames('h-3 w-3 shrink-0 rounded-full', statusDotClass(status))} />
                          </div>
                          <div className="mt-3 text-xs text-zinc-500">Valor da etapa</div>
                          <div className="mt-1 break-words text-lg font-semibold tracking-[-0.03em] text-white">
                            {canSeeValues ? formatMoney(stageValue) : 'Sem acesso'}
                          </div>
                        </div>

                        <div className="space-y-4">
                          {stageLeads.length === 0 ? (
                            <div className="rounded-[22px] border border-dashed border-white/10 bg-white/[0.03] px-4 py-8 text-center text-sm text-zinc-500">
                              Nenhum lead nesta etapa
                            </div>
                          ) : (
                            stageLeads.map((lead) => {
                              const score = getLeadScore(lead, [], []);
                              const temperature = getLeadTemperature(score);
                              const health = getLeadHealth(getLastActivity(lead), lead.status);
                              const probability = normalizeProbability(lead);
                              const isStalled = daysSince(getLastActivity(lead)) > 5;
                              const forecast = parseMoney(lead.dealValue) * (probability / 100);

                              return (
                                <div
                                  key={lead.id}
                                  onClick={() => void openLeadDetails(lead)}
                                  onKeyDown={(event) => {
                                    if (event.key === 'Enter' || event.key === ' ') {
                                      event.preventDefault();
                                      void openLeadDetails(lead);
                                    }
                                  }}
                                  role="button"
                                  tabIndex={0}
                                  className={classNames(
                                    'w-full overflow-hidden rounded-[26px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.05),rgba(255,255,255,0.02))] p-4 text-left transition hover:-translate-y-0.5 hover:border-[#3BFF8C]/20 hover:shadow-[0_12px_32px_rgba(0,0,0,0.28)] md:p-5',
                                    isLeadSelected(lead.id) ? 'border-[#3BFF8C]/25 shadow-[0_12px_32px_rgba(59,255,140,0.08)]' : '',
                                  )}
                                >
                                  <div className="flex items-start justify-between gap-3">
                                    <div className="min-w-0">
                                      <div className="truncate text-sm font-semibold text-white">
                                        {normalizeUiText(lead.name)}
                                      </div>
                                      <div className="mt-1 truncate text-xs text-zinc-500">
                                        {normalizeUiText(lead.companyName || lead.email || lead.phone || 'Sem empresa')}
                                      </div>
                                    </div>
                                    <div className="flex shrink-0 items-center gap-2">
                                      {canUseBulkActions ? (
                                      <button
                                        type="button"
                                        onClick={(event) => {
                                          event.stopPropagation();
                                          toggleLeadSelection(lead.id);
                                        }}
                                        className={classNames(
                                          'flex h-8 w-8 items-center justify-center rounded-full border text-xs transition',
                                          isLeadSelected(lead.id)
                                            ? 'border-[#3BFF8C]/25 bg-[#3BFF8C]/10 text-white'
                                            : 'border-white/10 bg-white/5 text-zinc-300 hover:bg-white/10',
                                        )}
                                        aria-label={isLeadSelected(lead.id) ? 'Remover seleção' : 'Selecionar lead'}
                                      >
                                        {isLeadSelected(lead.id) ? '✓' : '+'}
                                      </button>
                                      ) : null}
                                      <div className={classNames('max-w-full truncate', statusBadge(lead.status))}>{STATUS_LABELS[lead.status]}</div>
                                    </div>
                                  </div>

                                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                                    <LeadMiniInfo label="Valor" value={canSeeValues ? formatMoney(lead.dealValue, lead.currency || 'BRL') : 'Sem acesso'} />
                                    <LeadMiniInfo label="Forecast" value={canSeeValues ? formatMoney(forecast, lead.currency || 'BRL') : 'Sem acesso'} />
                                  </div>

                                  <div className="mt-4">
                                    <div className="mb-1 flex items-center justify-between gap-3 text-[11px] uppercase tracking-[0.16em] text-zinc-500">
                                      <span className="min-w-0">Probabilidade</span>
                                      <span className="shrink-0 text-white">{probability}%</span>
                                    </div>
                                    <div className="h-2 rounded-full bg-white/5">
                                      <div
                                        className="h-2 rounded-full bg-[linear-gradient(90deg,#3BFF8C,#A7FFCA)]"
                                        style={{ width: `${probability}%` }}
                                      />
                                    </div>
                                  </div>

                                  <div className="mt-4 flex flex-wrap gap-2.5">
                                    <span
                                      className={classNames(
                                        'max-w-full break-words rounded-full border px-3 py-1 text-[11px]',
                                        getTemperatureChipClass(temperature),
                                      )}
                                    >
                                      {temperature}
                                    </span>
                                    <span
                                      className={classNames(
                                        'max-w-full break-words rounded-full border px-3 py-1 text-[11px]',
                                        getLeadHealthClass(getLastActivity(lead), lead.status),
                                      )}
                                    >
                                      {health}
                                    </span>
                                    <span
                                      className={classNames(
                                        'max-w-full break-words rounded-full border px-3 py-1 text-[11px]',
                                        priorityClass(lead.priority),
                                      )}
                                    >
                                      Prioridade {formatPriority(lead.priority)}
                                    </span>
                                  </div>

                                  <div className="mt-4 grid gap-2.5 text-xs text-zinc-400">
                                    <div className="flex min-w-0 items-center justify-between gap-2">
                                      <span className="shrink-0">Responsável</span>
                                      <span className="min-w-0 truncate text-right text-zinc-200">
                                        {normalizeUiText(lead.ownerUser?.name || 'Não definido')}
                                      </span>
                                    </div>
                                    <div className="flex min-w-0 items-center justify-between gap-2">
                                      <span className="shrink-0">Origem</span>
                                      <span className="min-w-0 truncate text-right text-zinc-200">
                                        {normalizeUiText(lead.source || 'Não informada')}
                                      </span>
                                    </div>
                                    <div className="flex min-w-0 items-center justify-between gap-2">
                                      <span className="shrink-0">Última atividade</span>
                                      <span className={classNames('min-w-0 text-right', isStalled ? 'text-amber-200' : 'text-zinc-200')}>
                                        {formatRelativeTime(getLastActivity(lead))}
                                      </span>
                                    </div>
                                    <div className="flex min-w-0 items-center justify-between gap-2">
                                      <span className="shrink-0">Fechamento previsto</span>
                                      <span className="min-w-0 text-right text-zinc-200">
                                        {lead.expectedCloseDate ? formatDateShort(lead.expectedCloseDate) : 'Sem previsão'}
                                      </span>
                                    </div>
                                  </div>

                                  {lead.nextStep ? (
                                    <div className="mt-4 rounded-[20px] border border-white/10 bg-black/20 px-3 py-3">
                                      <div className="text-[11px] uppercase tracking-[0.16em] text-zinc-500">
                                        Próximo passo
                                      </div>
                                      <div className="mt-1 break-words text-sm text-white">{normalizeUiText(lead.nextStep)}</div>
                                      {lead.nextStepDueAt ? (
                                        <div className="mt-1 text-xs text-zinc-500">
                                          Prazo: {formatDateShort(lead.nextStepDueAt)}
                                        </div>
                                      ) : null}
                                    </div>
                                  ) : null}

                                  {isStalled ? (
                                    <div className="mt-4 rounded-2xl border border-amber-300/20 bg-amber-300/10 px-3 py-2 text-xs text-amber-100">
                                      Lead em atenção: sem atividade recente há {daysSince(getLastActivity(lead))} dia(s).
                                    </div>
                                  ) : null}
                                </div>
                              );
                            })
                          )}
                        </div>
                      </div>
                    );
                  })}
                  </div>
                </div>
              )}
            </CrmPanel>
          </div>

          <div className="min-w-0 space-y-6 xl:sticky xl:top-6 xl:self-start">
            <CrmPanel className="p-5 md:p-6">
              <CrmSectionHeader
                eyebrow="Central de comando"
                title="Resumo operacional do CRM"
                description="Leitura rápida da operação comercial filtrada."
              />

              <div className="space-y-4">
                <SidebarMetric label="Pipeline total" value={canSeeValues ? formatMoney(totalPipelineValue) : 'Sem acesso'} />
                <SidebarMetric label="Forecast ponderado" value={canSeeValues ? formatMoney(totalForecast) : 'Sem acesso'} />
                <SidebarMetric label="Conversão atual" value={`${stats.conversionRate}%`} />
                <SidebarMetric label="Leads novos no mês" value={String(stats.newThisMonth)} />
              </div>

              <div className="mt-5 rounded-[24px] border border-white/10 bg-black/20 p-5">
                <div className="text-[11px] uppercase tracking-[0.18em] text-zinc-500">
                  Insight prioritário
                </div>
                <div className="mt-3 text-sm font-medium text-white">
                  {stats.stalledLeads > 0
                    ? `Recupere ${stats.stalledLeads} lead(s) em atenção para proteger o forecast.`
                    : 'O pipeline está com ritmo saudável e sem gargalos críticos agora.'}
                </div>
                <div className="mt-2 text-xs leading-5 text-zinc-500">
                  A etapa com maior concentração é {STATUS_LABELS[dominantStatus]}. Foque no avanço das oportunidades com maior valor e probabilidade.
                </div>
              </div>
            </CrmPanel>

            <CrmPanel className="p-5 md:p-6">
              <CrmSectionHeader
                eyebrow="Lead intelligence"
                title={selectedLead ? normalizeUiText(selectedLead.name) : 'Selecione um lead'}
                description={
                  selectedLead
                    ? 'Visão detalhada da oportunidade selecionada.'
                    : 'Clique em um card do kanban para ver detalhes, atividades e tarefas.'
                }
              />

              {selectedLead ? (
                <div className="-mt-1 mb-5 flex flex-wrap justify-end gap-2">
                  {canMarkLeadOutcome ? (
                  <>
                  <button
                    type="button"
                    onClick={() => openWonFlow(selectedLead)}
                    className="rounded-2xl border border-[#3BFF8C]/20 bg-[#3BFF8C]/10 px-4 py-2 text-xs text-white transition hover:bg-[#3BFF8C]/15"
                  >
                    Marcar como ganho
                  </button>
                  <button
                    type="button"
                    onClick={() => openLostFlow(selectedLead)}
                    className="rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-2 text-xs text-red-200 transition hover:bg-red-500/15"
                  >
                    Marcar como perdido
                  </button>
                  </>
                  ) : null}
                  {canEditLead ? (
                  <button
                    type="button"
                    onClick={() => openEditLead(selectedLead)}
                    className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-xs text-zinc-300 transition hover:bg-white/10"
                  >
                    Editar lead
                  </button>
                  ) : null}
                </div>
              ) : null}

              {selectedLead && canChangeLeadStatus ? (
                <div className="mb-5 rounded-[24px] border border-white/10 bg-black/20 p-4 md:p-5">
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <div className="text-[11px] uppercase tracking-[0.18em] text-zinc-500">Status do lead</div>
                    <div className="text-xs text-zinc-500">
                      {savingStatus ? 'Atualizando...' : STATUS_LABELS[selectedLead.status]}
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {STATUS_ORDER.map((status) => (
                      <button
                        key={status}
                        type="button"
                        onClick={() => void changeLeadStatus(selectedLead, status)}
                        disabled={savingStatus || selectedLead.status === status}
                        className={classNames(
                          'rounded-full border px-3 py-2 text-xs transition disabled:cursor-not-allowed disabled:opacity-100',
                          selectedLead.status === status
                            ? statusBadge(status)
                            : 'border-white/10 bg-white/5 text-zinc-300 hover:bg-white/10',
                        )}
                      >
                        {STATUS_LABELS[status]}
                      </button>
                    ))}
                  </div>
                </div>
              ) : null}

              {!selectedLead ? (
                <div className="rounded-[24px] border border-dashed border-white/10 bg-white/[0.03] px-4 py-10 text-center text-sm text-zinc-500">
                  Nenhum lead selecionado.
                </div>
              ) : loadingDetails ? (
                <div className="space-y-3">
                  <div className="h-20 animate-pulse rounded-[22px] bg-white/5" />
                  <div className="h-20 animate-pulse rounded-[22px] bg-white/5" />
                  <div className="h-32 animate-pulse rounded-[22px] bg-white/5" />
                </div>
              ) : (
                <div className="space-y-5">
                  <div className="grid gap-3 sm:grid-cols-2">
                    <SidebarMetric label="Valor" value={canSeeValues ? formatMoney(selectedLead.dealValue, selectedLead.currency || 'BRL') : 'Sem acesso'} />
                    <SidebarMetric label="Probabilidade" value={`${normalizeProbability(selectedLead)}%`} />
                    <SidebarMetric label="Origem" value={normalizeUiText(selectedLead.source || 'Não informada')} />
                    <SidebarMetric label="Prioridade" value={formatPriority(selectedLead.priority)} />
                    <SidebarMetric label="Última atividade" value={formatRelativeTime(getLastActivity(selectedLead))} />
                    <SidebarMetric
                      label="Fechamento previsto"
                      value={selectedLead.expectedCloseDate ? formatDateShort(selectedLead.expectedCloseDate) : 'Sem previsão'}
                    />
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="h-full rounded-[24px] border border-white/10 bg-black/20 p-4 md:p-5">
                      <div className="text-[11px] uppercase tracking-[0.18em] text-zinc-500">Contato e empresa</div>
                      <div className="mt-3 space-y-2 text-sm text-zinc-300">
                        <LeadDetailRow label="Cargo" value={selectedLead.jobTitle} fallback="NÃ£o informado" />
                        <LeadDetailRow label="WhatsApp" value={selectedLead.whatsapp} fallback="NÃ£o informado" />
                        <LeadDetailRow label="Website" value={selectedLead.website} fallback="NÃ£o informado" />
                        <LeadDetailRow
                          label="Localidade"
                          value={[selectedLead.city, selectedLead.state].filter(Boolean).join(' / ')}
                          fallback="NÃ£o informada"
                        />
                        <LeadDetailRow label="Segmento" value={selectedLead.industry} fallback="NÃ£o informado" />
                        <LeadDetailRow label="Porte" value={selectedLead.companySize} fallback="NÃ£o informado" />
                      </div>
                    </div>

                    <div className="h-full rounded-[24px] border border-white/10 bg-black/20 p-4 md:p-5">
                      <div className="text-[11px] uppercase tracking-[0.18em] text-zinc-500">Contexto comercial</div>
                      <div className="mt-3 space-y-2 text-sm text-zinc-300">
                        <LeadDetailRow label="Detalhe da origem" value={selectedLead.sourceDetail} fallback="NÃ£o informado" />
                        <LeadDetailRow label="Concorrente" value={selectedLead.competitor} fallback="NÃ£o informado" />
                        <LeadDetailRow label="Motivo de ganho" value={selectedLead.wonReason} fallback="NÃ£o informado" />
                      </div>
                    </div>
                  </div>

                  {canCreateActivities ? (
                  <div className="rounded-[24px] border border-white/10 bg-black/20 p-4 md:p-5">
                    <div className="mb-3 flex items-center justify-between gap-3">
                      <div className="text-sm font-medium text-white">Registrar atividade</div>
                      <div className="text-xs text-zinc-500">
                        {savingActivity ? 'Salvando...' : 'Histórico do lead'}
                      </div>
                    </div>
                    <div className="mb-3 flex flex-wrap gap-2">
                      {INTERACTION_OPTIONS.map((option) => (
                        <button
                          key={option.type}
                          type="button"
                          onClick={() => setActivityType(option.type)}
                          className={classNames(
                            'rounded-full border px-3 py-2 text-xs transition',
                            activityType === option.type
                              ? 'border-[#3BFF8C]/25 bg-[#3BFF8C]/10 text-white'
                              : 'border-white/10 bg-white/5 text-zinc-300 hover:bg-white/10',
                          )}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                    <textarea
                      value={activityText}
                      onChange={(event) => setActivityText(event.target.value)}
                      rows={4}
                      className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none placeholder:text-zinc-500 focus:border-[#3BFF8C]/20"
                      placeholder="Registrar contexto, objeções, próximos alinhamentos ou decisões comerciais"
                    />
                    <div className="mt-3 flex justify-end">
                      <button
                        type="button"
                        onClick={() => void submitActivity(selectedLead)}
                        disabled={savingActivity || activityText.trim().length < 2}
                        className="rounded-2xl border border-[#3BFF8C]/20 bg-[#3BFF8C]/10 px-4 py-3 text-sm font-medium text-white transition hover:bg-[#3BFF8C]/15 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {savingActivity
                          ? 'Salvando...'
                          : `Adicionar ${INTERACTION_OPTIONS.find((option) => option.type === activityType)?.label.toLowerCase() || 'atividade'}`}
                      </button>
                    </div>
                  </div>
                  ) : null}

                  <div className="rounded-[24px] border border-white/10 bg-black/20 p-4 md:p-5">
                    <div className="text-[11px] uppercase tracking-[0.18em] text-zinc-500">Próximo passo</div>
                    <div className="mt-2 text-sm text-white">
                      {normalizeUiText(selectedLead.nextStep || 'Não definido')}
                    </div>
                    {selectedLead.nextStepDueAt ? (
                      <div className="mt-2 text-xs text-zinc-500">
                        Prazo: {formatDateShort(selectedLead.nextStepDueAt)}
                      </div>
                    ) : null}
                    {selectedLead.nextMeetingAt ? (
                      <div className="mt-2 text-xs text-zinc-500">
                        Próxima reunião: {formatDateShort(selectedLead.nextMeetingAt)}
                      </div>
                    ) : null}
                  </div>

                  <div className="rounded-[24px] border border-white/10 bg-black/20 p-4 md:p-5">
                    <div className="mb-3 flex items-center justify-between">
                      <div className="text-sm font-medium text-white">Timeline</div>
                      <div className="text-xs text-zinc-500">
                        {leadActivities.length} atividade(s)
                      </div>
                    </div>

                    <div className="crm-scroll max-h-[320px] space-y-3 overflow-y-auto pr-1">
                      {leadActivities.slice(0, 6).map((activity) => (
                        <div key={activity.id} className="rounded-2xl border border-white/10 bg-white/[0.03] p-3">
                          <div className="flex items-center justify-between gap-3">
                            <div className="text-sm text-white">{normalizeUiText(activity.description)}</div>
                            <div className="text-xs text-zinc-500">{formatRelativeTime(activity.createdAt)}</div>
                          </div>
                          <div className="mt-2 text-xs text-zinc-500">
                            {normalizeUiText(activity.user?.name || activity.type)} · {formatDateTime(activity.createdAt)}
                          </div>
                        </div>
                      ))}

                      {leadActivities.length === 0 ? (
                        <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.03] px-4 py-6 text-center text-sm text-zinc-500">
                          Nenhuma atividade registrada.
                        </div>
                      ) : null}
                    </div>
                  </div>

                  <div className="rounded-[24px] border border-white/10 bg-black/20 p-4 md:p-5">
                    <div className="mb-3 flex items-center justify-between">
                      <div className="text-sm font-medium text-white">Tarefas</div>
                      <div className="text-xs text-zinc-500">
                        {totalOpenTasks} em aberto
                      </div>
                    </div>

                    {canCreateTasks ? (
                    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-3">
                      <div className="mb-3 text-xs uppercase tracking-[0.18em] text-zinc-500">
                        Nova tarefa
                      </div>
                      <div className="grid gap-3">
                        <input
                          value={taskForm.title}
                          onChange={(event) => setTaskForm((prev) => ({ ...prev, title: event.target.value }))}
                          className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none placeholder:text-zinc-500 focus:border-[#3BFF8C]/20"
                          placeholder="Título da tarefa"
                        />
                        <textarea
                          value={taskForm.description}
                          onChange={(event) => setTaskForm((prev) => ({ ...prev, description: event.target.value }))}
                          rows={3}
                          className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none placeholder:text-zinc-500 focus:border-[#3BFF8C]/20"
                          placeholder="Descrição opcional"
                        />
                        <input
                          type="date"
                          value={taskForm.dueAt}
                          onChange={(event) => setTaskForm((prev) => ({ ...prev, dueAt: event.target.value }))}
                          className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none focus:border-[#3BFF8C]/20"
                        />
                      </div>
                      <div className="mt-3 flex justify-end">
                        <button
                          type="button"
                          onClick={() => void submitTask(selectedLead)}
                          disabled={savingTask || taskForm.title.trim().length < 2}
                          className="rounded-2xl border border-[#3BFF8C]/20 bg-[#3BFF8C]/10 px-4 py-3 text-sm font-medium text-white transition hover:bg-[#3BFF8C]/15 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {savingTask ? 'Salvando...' : 'Criar tarefa'}
                        </button>
                      </div>
                    </div>
                    ) : null}

                    <div className="crm-scroll mt-3 max-h-[360px] space-y-3 overflow-y-auto pr-1">
                      {leadTasks.slice(0, 6).map((task) => (
                        <div key={task.id} className="rounded-2xl border border-white/10 bg-white/[0.03] p-3">
                          <div className="flex items-center justify-between gap-3">
                            <div className="text-sm text-white">{normalizeUiText(task.title)}</div>
                            <div
                              className={classNames(
                                'rounded-full border px-3 py-1 text-[11px]',
                                task.completedAt
                                  ? 'border-[#3BFF8C]/20 bg-[#3BFF8C]/10 text-[#9CFFC2]'
                                  : 'border-white/10 bg-white/5 text-zinc-200',
                              )}
                            >
                              {task.completedAt ? 'Concluída' : 'Aberta'}
                            </div>
                          </div>
                          <div className="mt-2 text-xs text-zinc-500">
                            {task.dueAt ? `Prazo: ${formatDateShort(task.dueAt)}` : 'Sem prazo'} ·{' '}
                            {normalizeUiText(task.assignedUser?.name || 'Sem responsável')}
                          </div>
                        </div>
                      ))}

                      {leadTasks.length === 0 ? (
                        <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.03] px-4 py-6 text-center text-sm text-zinc-500">
                          Nenhuma tarefa registrada.
                        </div>
                      ) : null}
                    </div>
                  </div>
                </div>
              )}
            </CrmPanel>
          </div>
        </div>
      </div>

      {isCreateOpen ? (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/70 p-4 backdrop-blur-sm md:items-center">
          <div className="flex max-h-[calc(100vh-2rem)] w-full max-w-4xl flex-col overflow-hidden rounded-[30px] border border-white/10 bg-[#0A0C0D] shadow-[0_28px_120px_rgba(0,0,0,0.42)] md:max-h-[calc(100vh-3rem)]">
            <div className="flex shrink-0 items-start justify-between gap-4 border-b border-white/10 px-6 py-5">
              <div>
                <div className="text-[11px] uppercase tracking-[0.22em] text-zinc-500">Novo lead</div>
                <div className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-white">
                  Criar oportunidade no CRM
                </div>
                <div className="mt-1 text-sm text-zinc-500">
                  Já com valor, probabilidade, origem e previsão de fechamento.
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsCreateOpen(false)}
                className="rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-zinc-300 transition hover:bg-white/10"
              >
                Fechar
              </button>
            </div>

            <div className="crm-scroll min-h-0 flex-1 overflow-y-auto px-6 py-5">
              <div className="grid gap-4 xl:grid-cols-2">
              <FormField label="Nome do lead *">
                <input
                  value={createForm.name}
                  onChange={(event) => setCreateForm((prev) => ({ ...prev, name: event.target.value }))}
                  className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none placeholder:text-zinc-500 focus:border-[#3BFF8C]/20"
                  placeholder="Nome do lead"
                />
              </FormField>

              <FormField label="Empresa">
                <input
                  value={createForm.companyName}
                  onChange={(event) => setCreateForm((prev) => ({ ...prev, companyName: event.target.value }))}
                  className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none placeholder:text-zinc-500 focus:border-[#3BFF8C]/20"
                  placeholder="Empresa"
                />
              </FormField>

              <FormField label="Telefone">
                <input
                  value={createForm.phone}
                  onChange={(event) => setCreateForm((prev) => ({ ...prev, phone: event.target.value }))}
                  className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none placeholder:text-zinc-500 focus:border-[#3BFF8C]/20"
                  placeholder="Telefone"
                />
              </FormField>

              <FormField label="E-mail">
                <input
                  value={createForm.email}
                  onChange={(event) => setCreateForm((prev) => ({ ...prev, email: event.target.value }))}
                  className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none placeholder:text-zinc-500 focus:border-[#3BFF8C]/20"
                  placeholder="email@empresa.com"
                />
              </FormField>

              <FormField label="WhatsApp">
                <input
                  value={createForm.whatsapp}
                  onChange={(event) => setCreateForm((prev) => ({ ...prev, whatsapp: event.target.value }))}
                  className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none placeholder:text-zinc-500 focus:border-[#3BFF8C]/20"
                  placeholder="WhatsApp"
                />
              </FormField>

              <FormField label="Cargo / função">
                <input
                  value={createForm.jobTitle}
                  onChange={(event) => setCreateForm((prev) => ({ ...prev, jobTitle: event.target.value }))}
                  className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none placeholder:text-zinc-500 focus:border-[#3BFF8C]/20"
                  placeholder="Diretor comercial, gerente, comprador..."
                />
              </FormField>

              <FormField label="Website">
                <input
                  value={createForm.website}
                  onChange={(event) => setCreateForm((prev) => ({ ...prev, website: event.target.value }))}
                  className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none placeholder:text-zinc-500 focus:border-[#3BFF8C]/20"
                  placeholder="https://empresa.com"
                />
              </FormField>

              <FormField label="Cidade">
                <input
                  value={createForm.city}
                  onChange={(event) => setCreateForm((prev) => ({ ...prev, city: event.target.value }))}
                  className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none placeholder:text-zinc-500 focus:border-[#3BFF8C]/20"
                  placeholder="Cidade"
                />
              </FormField>

              <FormField label="Estado">
                <input
                  value={createForm.state}
                  onChange={(event) => setCreateForm((prev) => ({ ...prev, state: event.target.value }))}
                  className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none placeholder:text-zinc-500 focus:border-[#3BFF8C]/20"
                  placeholder="Estado"
                />
              </FormField>

              <FormField label="Segmento">
                <input
                  value={createForm.industry}
                  onChange={(event) => setCreateForm((prev) => ({ ...prev, industry: event.target.value }))}
                  className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none placeholder:text-zinc-500 focus:border-[#3BFF8C]/20"
                  placeholder="Tecnologia, varejo, saúde..."
                />
              </FormField>

              <FormField label="Porte da empresa">
                <input
                  value={createForm.companySize}
                  onChange={(event) => setCreateForm((prev) => ({ ...prev, companySize: event.target.value }))}
                  className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none placeholder:text-zinc-500 focus:border-[#3BFF8C]/20"
                  placeholder="Pequena, média, enterprise..."
                />
              </FormField>

              <FormField label="Valor do negócio">
                <input
                  value={createForm.dealValue}
                  onChange={(event) => setCreateForm((prev) => ({ ...prev, dealValue: event.target.value }))}
                  className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none placeholder:text-zinc-500 focus:border-[#3BFF8C]/20"
                  placeholder="45000"
                />
              </FormField>

              <FormField label="Probabilidade (%)">
                <input
                  value={createForm.probability}
                  onChange={(event) => setCreateForm((prev) => ({ ...prev, probability: event.target.value }))}
                  className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none placeholder:text-zinc-500 focus:border-[#3BFF8C]/20"
                  placeholder="60"
                />
              </FormField>

              <FormField label="Origem">
                <input
                  value={createForm.source}
                  onChange={(event) => setCreateForm((prev) => ({ ...prev, source: event.target.value }))}
                  className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none placeholder:text-zinc-500 focus:border-[#3BFF8C]/20"
                  placeholder="Website, indicação, anúncio..."
                />
              </FormField>

              <FormField label="Detalhe da origem">
                <input
                  value={createForm.sourceDetail}
                  onChange={(event) => setCreateForm((prev) => ({ ...prev, sourceDetail: event.target.value }))}
                  className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none placeholder:text-zinc-500 focus:border-[#3BFF8C]/20"
                  placeholder="Campanha, mídia, parceiro..."
                />
              </FormField>

              <FormField label="Prioridade">
                <div className="flex flex-wrap gap-2">
                  {['LOW', 'MEDIUM', 'HIGH', 'URGENT'].map((option) => (
                    <button
                      key={option}
                      type="button"
                      onClick={() => setCreateForm((prev) => ({ ...prev, priority: option }))}
                      className={classNames(
                        'rounded-full border px-3 py-2 text-xs transition',
                        createForm.priority === option
                          ? 'border-[#3BFF8C]/25 bg-[#3BFF8C]/10 text-white'
                          : 'border-white/10 bg-white/5 text-zinc-300 hover:bg-white/10',
                      )}
                    >
                      {formatPriority(option)}
                    </button>
                  ))}
                </div>
              </FormField>

              <div className="md:col-span-2">
                <FormField label="Próximo passo">
                  <input
                    value={createForm.nextStep}
                    onChange={(event) => setCreateForm((prev) => ({ ...prev, nextStep: event.target.value }))}
                    className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none placeholder:text-zinc-500 focus:border-[#3BFF8C]/20"
                    placeholder="Enviar proposta, agendar ligação, marcar reunião..."
                  />
                </FormField>
              </div>

              <div className="md:col-span-2">
                <FormField label="Próxima reunião">
                  <input
                    type="date"
                    value={createForm.nextMeetingAt}
                    onChange={(event) => setCreateForm((prev) => ({ ...prev, nextMeetingAt: event.target.value }))}
                    className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none focus:border-[#3BFF8C]/20"
                  />
                </FormField>
              </div>

              <div>
                <FormField label="Previsão de fechamento">
                  <input
                    type="date"
                    value={createForm.expectedCloseDate}
                    onChange={(event) => setCreateForm((prev) => ({ ...prev, expectedCloseDate: event.target.value }))}
                    className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none focus:border-[#3BFF8C]/20"
                  />
                </FormField>
              </div>

              <FormField label="Concorrente">
                <input
                  value={createForm.competitor}
                  onChange={(event) => setCreateForm((prev) => ({ ...prev, competitor: event.target.value }))}
                  className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none placeholder:text-zinc-500 focus:border-[#3BFF8C]/20"
                  placeholder="Concorrente principal"
                />
              </FormField>

              <FormField label="Motivo de ganho">
                <input
                  value={createForm.wonReason}
                  onChange={(event) => setCreateForm((prev) => ({ ...prev, wonReason: event.target.value }))}
                  className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none placeholder:text-zinc-500 focus:border-[#3BFF8C]/20"
                  placeholder="Diferencial comercial ou técnico"
                />
              </FormField>

              <div className="md:col-span-2">
                <FormField label="Observações">
                  <textarea
                    value={createForm.notes}
                    onChange={(event) => setCreateForm((prev) => ({ ...prev, notes: event.target.value }))}
                    rows={4}
                    className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none placeholder:text-zinc-500 focus:border-[#3BFF8C]/20"
                    placeholder="Resumo do contexto comercial"
                  />
                </FormField>
              </div>
              </div>
            </div>

            <div className="flex shrink-0 justify-end gap-3 border-t border-white/10 px-6 py-5">
              <button
                type="button"
                onClick={() => setIsCreateOpen(false)}
                className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-zinc-300 transition hover:bg-white/10"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => void createLead()}
                disabled={savingLead}
                className="rounded-2xl border border-[#3BFF8C]/20 bg-[#3BFF8C]/10 px-4 py-3 text-sm font-medium text-white transition hover:bg-[#3BFF8C]/15 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {savingLead ? 'Salvando...' : 'Criar lead'}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {editingLead ? (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/70 p-4 backdrop-blur-sm md:items-center">
          <div className="flex max-h-[calc(100vh-2rem)] w-full max-w-4xl flex-col overflow-hidden rounded-[30px] border border-white/10 bg-[#0A0C0D] shadow-[0_28px_120px_rgba(0,0,0,0.42)] md:max-h-[calc(100vh-3rem)]">
            <div className="flex shrink-0 items-start justify-between gap-4 border-b border-white/10 px-6 py-5">
              <div>
                <div className="text-[11px] uppercase tracking-[0.22em] text-zinc-500">Editar lead</div>
                <div className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-white">
                  Atualizar oportunidade no CRM
                </div>
                <div className="mt-1 text-sm text-zinc-500">
                  Revise os dados comerciais atuais sem alterar o restante do fluxo.
                </div>
              </div>

              <button
                type="button"
                onClick={closeEditLead}
                className="rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-zinc-300 transition hover:bg-white/10"
              >
                Fechar
              </button>
            </div>

            <div className="crm-scroll min-h-0 flex-1 overflow-y-auto px-6 py-5">
              <div className="grid gap-4 xl:grid-cols-2">
                <FormField label="Nome do lead *">
                  <input
                    value={editForm.name}
                    onChange={(event) => setEditForm((prev) => ({ ...prev, name: event.target.value }))}
                    className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none placeholder:text-zinc-500 focus:border-[#3BFF8C]/20"
                    placeholder="Nome do lead"
                  />
                </FormField>

                <FormField label="Empresa">
                  <input
                    value={editForm.companyName}
                    onChange={(event) => setEditForm((prev) => ({ ...prev, companyName: event.target.value }))}
                    className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none placeholder:text-zinc-500 focus:border-[#3BFF8C]/20"
                    placeholder="Empresa"
                  />
                </FormField>

                <FormField label="Telefone">
                  <input
                    value={editForm.phone}
                    onChange={(event) => setEditForm((prev) => ({ ...prev, phone: event.target.value }))}
                    className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none placeholder:text-zinc-500 focus:border-[#3BFF8C]/20"
                    placeholder="Telefone"
                  />
                </FormField>

                <FormField label="E-mail">
                  <input
                    value={editForm.email}
                    onChange={(event) => setEditForm((prev) => ({ ...prev, email: event.target.value }))}
                    className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none placeholder:text-zinc-500 focus:border-[#3BFF8C]/20"
                    placeholder="email@empresa.com"
                  />
                </FormField>

                <FormField label="WhatsApp">
                  <input
                    value={editForm.whatsapp}
                    onChange={(event) => setEditForm((prev) => ({ ...prev, whatsapp: event.target.value }))}
                    className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none placeholder:text-zinc-500 focus:border-[#3BFF8C]/20"
                    placeholder="WhatsApp"
                  />
                </FormField>

                <FormField label="Cargo / função">
                  <input
                    value={editForm.jobTitle}
                    onChange={(event) => setEditForm((prev) => ({ ...prev, jobTitle: event.target.value }))}
                    className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none placeholder:text-zinc-500 focus:border-[#3BFF8C]/20"
                    placeholder="Diretor comercial, gerente, comprador..."
                  />
                </FormField>

                <FormField label="Website">
                  <input
                    value={editForm.website}
                    onChange={(event) => setEditForm((prev) => ({ ...prev, website: event.target.value }))}
                    className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none placeholder:text-zinc-500 focus:border-[#3BFF8C]/20"
                    placeholder="https://empresa.com"
                  />
                </FormField>

                <FormField label="Cidade">
                  <input
                    value={editForm.city}
                    onChange={(event) => setEditForm((prev) => ({ ...prev, city: event.target.value }))}
                    className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none placeholder:text-zinc-500 focus:border-[#3BFF8C]/20"
                    placeholder="Cidade"
                  />
                </FormField>

                <FormField label="Estado">
                  <input
                    value={editForm.state}
                    onChange={(event) => setEditForm((prev) => ({ ...prev, state: event.target.value }))}
                    className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none placeholder:text-zinc-500 focus:border-[#3BFF8C]/20"
                    placeholder="Estado"
                  />
                </FormField>

                <FormField label="Segmento">
                  <input
                    value={editForm.industry}
                    onChange={(event) => setEditForm((prev) => ({ ...prev, industry: event.target.value }))}
                    className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none placeholder:text-zinc-500 focus:border-[#3BFF8C]/20"
                    placeholder="Tecnologia, varejo, saúde..."
                  />
                </FormField>

                <FormField label="Porte da empresa">
                  <input
                    value={editForm.companySize}
                    onChange={(event) => setEditForm((prev) => ({ ...prev, companySize: event.target.value }))}
                    className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none placeholder:text-zinc-500 focus:border-[#3BFF8C]/20"
                    placeholder="Pequena, média, enterprise..."
                  />
                </FormField>

                <FormField label="Valor do negÃ³cio">
                  <input
                    value={editForm.dealValue}
                    onChange={(event) => setEditForm((prev) => ({ ...prev, dealValue: event.target.value }))}
                    className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none placeholder:text-zinc-500 focus:border-[#3BFF8C]/20"
                    placeholder="45000"
                  />
                </FormField>

                <FormField label="Probabilidade (%)">
                  <input
                    value={editForm.probability}
                    onChange={(event) => setEditForm((prev) => ({ ...prev, probability: event.target.value }))}
                    className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none placeholder:text-zinc-500 focus:border-[#3BFF8C]/20"
                    placeholder="60"
                  />
                </FormField>

                <FormField label="Origem">
                  <input
                    value={editForm.source}
                    onChange={(event) => setEditForm((prev) => ({ ...prev, source: event.target.value }))}
                    className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none placeholder:text-zinc-500 focus:border-[#3BFF8C]/20"
                    placeholder="Website, indicaÃ§Ã£o, anÃºncio..."
                  />
                </FormField>

                <FormField label="Detalhe da origem">
                  <input
                    value={editForm.sourceDetail}
                    onChange={(event) => setEditForm((prev) => ({ ...prev, sourceDetail: event.target.value }))}
                    className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none placeholder:text-zinc-500 focus:border-[#3BFF8C]/20"
                    placeholder="Campanha, mídia, parceiro..."
                  />
                </FormField>

                <FormField label="Prioridade">
                  <div className="flex flex-wrap gap-2">
                    {['LOW', 'MEDIUM', 'HIGH', 'URGENT'].map((option) => (
                      <button
                        key={option}
                        type="button"
                        onClick={() => setEditForm((prev) => ({ ...prev, priority: option }))}
                        className={classNames(
                          'rounded-full border px-3 py-2 text-xs transition',
                          editForm.priority === option
                            ? 'border-[#3BFF8C]/25 bg-[#3BFF8C]/10 text-white'
                            : 'border-white/10 bg-white/5 text-zinc-300 hover:bg-white/10',
                        )}
                      >
                        {formatPriority(option)}
                      </button>
                    ))}
                  </div>
                </FormField>

                <div className="md:col-span-2">
                  <FormField label="PrÃ³ximo passo">
                    <input
                      value={editForm.nextStep}
                      onChange={(event) => setEditForm((prev) => ({ ...prev, nextStep: event.target.value }))}
                      className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none placeholder:text-zinc-500 focus:border-[#3BFF8C]/20"
                      placeholder="Enviar proposta, agendar ligaÃ§Ã£o, marcar reuniÃ£o..."
                    />
                  </FormField>
                </div>

                <div className="md:col-span-2">
                  <FormField label="PrevisÃ£o de fechamento">
                    <input
                      type="date"
                      value={editForm.expectedCloseDate}
                      onChange={(event) => setEditForm((prev) => ({ ...prev, expectedCloseDate: event.target.value }))}
                      className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none focus:border-[#3BFF8C]/20"
                    />
                  </FormField>
                </div>

                <div>
                  <FormField label="Próxima reunião">
                    <input
                      type="date"
                      value={editForm.nextMeetingAt}
                      onChange={(event) => setEditForm((prev) => ({ ...prev, nextMeetingAt: event.target.value }))}
                      className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none focus:border-[#3BFF8C]/20"
                    />
                  </FormField>
                </div>

                <FormField label="Concorrente">
                  <input
                    value={editForm.competitor}
                    onChange={(event) => setEditForm((prev) => ({ ...prev, competitor: event.target.value }))}
                    className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none placeholder:text-zinc-500 focus:border-[#3BFF8C]/20"
                    placeholder="Concorrente principal"
                  />
                </FormField>

              <FormField label="Motivo de ganho">
                <input
                  value={editForm.wonReason}
                  onChange={(event) => setEditForm((prev) => ({ ...prev, wonReason: event.target.value }))}
                  className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none placeholder:text-zinc-500 focus:border-[#3BFF8C]/20"
                  placeholder="Diferencial comercial ou tÃ©cnico"
                />
              </FormField>

              <div className="md:col-span-2">
                <FormField label="ObservaÃ§Ãµes">
                    <textarea
                      value={editForm.notes}
                      onChange={(event) => setEditForm((prev) => ({ ...prev, notes: event.target.value }))}
                      rows={4}
                      className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none placeholder:text-zinc-500 focus:border-[#3BFF8C]/20"
                      placeholder="Resumo do contexto comercial"
                    />
                  </FormField>
                </div>
              </div>
            </div>

            <div className="flex shrink-0 justify-end gap-3 border-t border-white/10 px-6 py-5">
              <button
                type="button"
                onClick={closeEditLead}
                className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-zinc-300 transition hover:bg-white/10"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => void saveEditLead()}
                disabled={savingEditLead}
                className="rounded-2xl border border-[#3BFF8C]/20 bg-[#3BFF8C]/10 px-4 py-3 text-sm font-medium text-white transition hover:bg-[#3BFF8C]/15 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {savingEditLead ? 'Salvando...' : 'Salvar alteraÃ§Ãµes'}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {outcomeLead && outcomeStatus ? (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/70 p-4 backdrop-blur-sm md:items-center">
          <div className="flex max-h-[calc(100vh-2rem)] w-full max-w-2xl flex-col overflow-hidden rounded-[30px] border border-white/10 bg-[#0A0C0D] shadow-[0_28px_120px_rgba(0,0,0,0.42)] md:max-h-[calc(100vh-3rem)]">
            <div className="flex shrink-0 items-start justify-between gap-4 border-b border-white/10 px-6 py-5">
              <div>
                <div className="text-[11px] uppercase tracking-[0.22em] text-zinc-500">
                  {outcomeStatus === 'WON' ? 'Fechar como ganho' : 'Fechar como perdido'}
                </div>
                <div className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-white">
                  {outcomeStatus === 'WON' ? 'Confirmar lead ganho' : 'Registrar perda do lead'}
                </div>
                <div className="mt-1 text-sm text-zinc-500">
                  {normalizeUiText(outcomeLead.name)}
                </div>
              </div>

              <button
                type="button"
                onClick={closeOutcomeFlow}
                className="rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-zinc-300 transition hover:bg-white/10"
              >
                Fechar
              </button>
            </div>

            <div className="crm-scroll min-h-0 flex-1 overflow-y-auto px-6 py-5">
              {outcomeStatus === 'WON' ? (
                <div className="rounded-[24px] border border-white/10 bg-black/20 p-4 text-sm text-zinc-300">
                  O lead será movido para <span className="text-white">Fechado</span> e a data de ganho será registrada automaticamente.
                </div>
              ) : (
                <FormField label="Motivo da perda *">
                  <textarea
                    value={lostReason}
                    onChange={(event) => setLostReason(event.target.value)}
                    rows={4}
                    className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none placeholder:text-zinc-500 focus:border-red-500/20"
                    placeholder="Explique por que a oportunidade foi perdida"
                  />
                </FormField>
              )}
            </div>

            <div className="flex shrink-0 justify-end gap-3 border-t border-white/10 px-6 py-5">
              <button
                type="button"
                onClick={closeOutcomeFlow}
                className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-zinc-300 transition hover:bg-white/10"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => void submitOutcome()}
                disabled={savingOutcome || (outcomeStatus === 'LOST' && !lostReason.trim())}
                className={classNames(
                  'rounded-2xl border px-4 py-3 text-sm font-medium text-white transition disabled:cursor-not-allowed disabled:opacity-60',
                  outcomeStatus === 'WON'
                    ? 'border-[#3BFF8C]/20 bg-[#3BFF8C]/10 hover:bg-[#3BFF8C]/15'
                    : 'border-red-500/20 bg-red-500/10 hover:bg-red-500/15',
                )}
              >
                {savingOutcome
                  ? 'Salvando...'
                  : outcomeStatus === 'WON'
                    ? 'Confirmar ganho'
                    : 'Confirmar perda'}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function FilterGroup({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: Array<{ id: string; label: string }>;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="flex h-full min-h-[144px] flex-col rounded-[24px] border border-white/10 bg-black/20 p-4">
      <div className="mb-3 text-[11px] uppercase tracking-[0.18em] text-zinc-500">{label}</div>
      <div className="flex flex-wrap gap-2.5">
        {options.map((option) => (
          <button
            key={`${label}-${option.id}`}
            type="button"
            onClick={() => onChange(option.id)}
            className={classNames(
              'rounded-full border px-3 py-2 text-xs transition',
              value === option.id
                ? 'border-[#3BFF8C]/25 bg-[#3BFF8C]/10 text-white'
                : 'border-white/10 bg-white/5 text-zinc-300 hover:bg-white/10',
            )}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}

function RangeFilterGroup({
  label,
  minValue,
  maxValue,
  minPlaceholder,
  maxPlaceholder,
  onMinChange,
  onMaxChange,
}: {
  label: string;
  minValue: string;
  maxValue: string;
  minPlaceholder: string;
  maxPlaceholder: string;
  onMinChange: (value: string) => void;
  onMaxChange: (value: string) => void;
}) {
  return (
    <div className="flex h-full min-h-[144px] flex-col rounded-[24px] border border-white/10 bg-black/20 p-4">
      <div className="mb-3 text-[11px] uppercase tracking-[0.18em] text-zinc-500">{label}</div>
      <div className="mt-auto grid gap-3 sm:grid-cols-2">
        <input
          value={minValue}
          onChange={(event) => onMinChange(event.target.value)}
          placeholder={minPlaceholder}
          className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none placeholder:text-zinc-500 focus:border-[#3BFF8C]/20"
        />
        <input
          value={maxValue}
          onChange={(event) => onMaxChange(event.target.value)}
          placeholder={maxPlaceholder}
          className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none placeholder:text-zinc-500 focus:border-[#3BFF8C]/20"
        />
      </div>
    </div>
  );
}

function DateRangeFilterGroup({
  label,
  fromValue,
  toValue,
  onFromChange,
  onToChange,
}: {
  label: string;
  fromValue: string;
  toValue: string;
  onFromChange: (value: string) => void;
  onToChange: (value: string) => void;
}) {
  return (
    <div className="flex h-full min-h-[144px] flex-col rounded-[24px] border border-white/10 bg-black/20 p-4">
      <div className="mb-3 text-[11px] uppercase tracking-[0.18em] text-zinc-500">{label}</div>
      <div className="mt-auto grid gap-3 sm:grid-cols-2">
        <input
          type="date"
          value={fromValue}
          onChange={(event) => onFromChange(event.target.value)}
          className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none focus:border-[#3BFF8C]/20"
        />
        <input
          type="date"
          value={toValue}
          onChange={(event) => onToChange(event.target.value)}
          className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none focus:border-[#3BFF8C]/20"
        />
      </div>
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0 rounded-2xl border border-white/10 bg-white/[0.03] p-3.5">
      <div className="text-[11px] uppercase tracking-[0.16em] text-zinc-500">{label}</div>
      <div className="mt-2 break-words text-sm font-medium text-white">{value}</div>
    </div>
  );
}

function LeadMiniInfo({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0 rounded-2xl border border-white/10 bg-black/20 p-3.5">
      <div className="text-[11px] uppercase tracking-[0.16em] text-zinc-500">{label}</div>
      <div className="mt-1 break-words text-sm font-medium text-white">{value}</div>
    </div>
  );
}

function ReportListCard({
  title,
  rows,
}: {
  title: string;
  rows: Array<{ label: string; value: string; helper: string }>;
}) {
  return (
    <div className="flex h-full min-h-[280px] flex-col rounded-[24px] border border-white/10 bg-black/20 p-4 md:p-5">
      <div className="text-[11px] uppercase tracking-[0.18em] text-zinc-500">{title}</div>
      <div className="mt-3 space-y-3">
        {rows.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.03] px-4 py-6 text-center text-sm text-zinc-500">
            Sem dados para este recorte.
          </div>
        ) : (
          rows.slice(0, 6).map((row) => (
            <div
              key={`${title}-${row.label}`}
              className="flex items-start justify-between gap-3 rounded-2xl border border-white/10 bg-white/[0.03] px-3 py-3.5"
            >
              <div className="min-w-0">
                <div className="truncate text-sm text-white">{normalizeUiText(row.label)}</div>
                <div className="mt-1 text-xs text-zinc-500">{row.helper}</div>
              </div>
              <div className="shrink-0 text-sm font-medium text-white">{row.value}</div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function SidebarMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0 rounded-[22px] border border-white/10 bg-black/20 p-4 md:p-5">
      <div className="text-[11px] uppercase tracking-[0.18em] text-zinc-500">{label}</div>
      <div className="mt-2 break-words text-lg font-semibold tracking-[-0.02em] text-white">{value}</div>
    </div>
  );
}

function LeadDetailRow({
  label,
  value,
  fallback,
}: {
  label: string;
  value?: string | null;
  fallback: string;
}) {
  return (
    <div className="flex items-start justify-between gap-4">
      <span className="min-w-0 max-w-[42%] text-zinc-500">{label}</span>
      <span className="min-w-0 flex-1 break-words text-right text-white">
        {normalizeUiText(value || fallback)}
      </span>
    </div>
  );
}

function FormField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <div className="mb-2.5 text-sm text-zinc-300">{label}</div>
      {children}
    </label>
  );
}
