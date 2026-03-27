'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

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
import {
  applyCrmRoutingRule,
  createCrmChannelIntegration,
  createCrmAccount,
  createCrmContact,
  createCrmDocument,
  createCrmEmailMessage,
  createCrmEmailTemplate,
  createCrmForecastAdjustment,
  createCrmForecastSnapshot,
  createCrmIntegrationConnectUrl,
  createCrmMailbox,
  createCrmOmnichannelMessage,
  createCrmPipeline,
  createCrmPipelineStage,
  createCrmQuote,
  createCrmRoutingRule,
  createCrmSalesTarget,
  createCrmSequence,
  createCrmConversationInsight,
  deleteCrmPipeline,
  deleteCrmPipelineStage,
  deleteCrmSalesTarget,
  enrollCrmSequence,
  getCrmForecastSummary,
  getCrmSalesTargets,
  listCrmChannelIntegrations,
  listCrmAccounts,
  listCrmContacts,
  listCrmConversationInsights,
  listCrmDocuments,
  listCrmEmailTemplates,
  listCrmIntegrationCatalog,
  listCrmInbox,
  listCrmMailboxes,
  listCrmOmnichannelMessages,
  listCrmPipelines,
  listCrmQuotes,
  listCrmRoutingRules,
  listCrmSequences,
  syncCrmChannelIntegration,
  updateCrmDocumentSignatureStatus,
} from './_crm/crm.service';
import type { AuthHeaders, CrmLeadsQueryParams } from './_crm/crm.service';
import {
  classNames,
  daysSince,
  formatDateShort,
  formatDateTime,
  formatMoney,
  getLeadGuidance,
  getLeadGuidanceClass,
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
import { useLeadNotes } from './_crm/useLeadNotes';
import { useLeadStatusUpdate } from './_crm/useLeadStatusUpdate';
import { useLeadTaskCreate } from './_crm/useLeadTaskCreate';
import { useLeadDetails } from './_crm/useLeadDetails';
import { useCrmAnalytics } from './_crm/useCrmAnalytics';
import { useCrmLeads } from './_crm/useCrmLeads';
import { useCrmPermissions } from './_crm/useCrmPermissions';
import { useCrmSavedViews } from './_crm/useCrmSavedViews';
import { useCrmBulkSelection } from './_crm/useCrmBulkSelection';
import { useCrmBulkActions } from './_crm/useCrmBulkActions';
import type {
  ActivityComposerType,
  CrmAccount,
  CrmContact,
  CrmConversationInsight,
  CrmChannelIntegration,
  CrmDocument,
  CrmEmailMessage,
  CrmEmailTemplate,
  CrmForecastSnapshot,
  CrmIntegrationCatalogItem,
  CrmMailbox,
  CrmOmnichannelMessage,
  CrmPipeline,
  CrmQuote,
  CrmRoutingRule,
  CrmSalesTarget,
  CrmSequence,
  CreateCrmSalesTargetInput,
  LeadStatus,
  SalesTargetPeriod,
  TemperatureFilter,
} from './_crm/types';

function getErrorMessage(error: unknown, fallback: string) {
  if (
    typeof error === 'object' &&
    error !== null &&
    'response' in error &&
    typeof error.response === 'object' &&
    error.response !== null &&
    'data' in error.response &&
    typeof error.response.data === 'object' &&
    error.response.data !== null &&
    'message' in error.response.data &&
    typeof error.response.data.message === 'string'
  ) {
    return error.response.data.message;
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return fallback;
}

const emptySalesTargetForm: CreateCrmSalesTargetInput = {
  periodType: 'MONTHLY',
  periodStart: '',
  periodEnd: '',
  targetValue: undefined,
  targetDeals: undefined,
  branchId: '',
  departmentId: '',
  userId: '',
};

const emptyPipelineForm = {
  name: '',
  description: '',
  isDefault: false,
};

const emptyStageForm = {
  name: '',
  color: '#8B5CF6',
  statusBase: 'NEW' as LeadStatus,
};

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

  const [crmQueryParams, setCrmQueryParams] = useState<CrmLeadsQueryParams>({
    page: 1,
    pageSize: 20,
    sortBy: 'updatedAt',
    sortOrder: 'desc',
  });

  const [salesTargets, setSalesTargets] = useState<CrmSalesTarget[]>([]);
  const [loadingSalesTargets, setLoadingSalesTargets] = useState(true);
  const [savingSalesTarget, setSavingSalesTarget] = useState(false);
  const [deletingSalesTargetId, setDeletingSalesTargetId] = useState<string | null>(null);
  const [isSalesTargetOpen, setIsSalesTargetOpen] = useState(false);
  const [pipelines, setPipelines] = useState<CrmPipeline[]>([]);
  const [loadingPipelines, setLoadingPipelines] = useState(true);
  const [savingPipeline, setSavingPipeline] = useState(false);
  const [savingStage, setSavingStage] = useState(false);
  const [deletingPipelineId, setDeletingPipelineId] = useState<string | null>(null);
  const [deletingStageId, setDeletingStageId] = useState<string | null>(null);
  const [isPipelineManagerOpen, setIsPipelineManagerOpen] = useState(false);
  const [pipelineForm, setPipelineForm] = useState(emptyPipelineForm);
  const [stageForm, setStageForm] = useState(emptyStageForm);
  const [selectedPipelineId, setSelectedPipelineId] = useState('');
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [salesTargetForm, setSalesTargetForm] =
    useState<CreateCrmSalesTargetInput>(emptySalesTargetForm);
  const [loadingEnterpriseHub, setLoadingEnterpriseHub] = useState(true);
  const [savingEnterpriseAction, setSavingEnterpriseAction] = useState(false);
  const [accounts, setAccounts] = useState<CrmAccount[]>([]);
  const [accountContacts, setAccountContacts] = useState<CrmContact[]>([]);
  const [mailboxes, setMailboxes] = useState<CrmMailbox[]>([]);
  const [integrationCatalog, setIntegrationCatalog] = useState<CrmIntegrationCatalogItem[]>([]);
  const [channelIntegrations, setChannelIntegrations] = useState<CrmChannelIntegration[]>([]);
  const [omnichannelMessages, setOmnichannelMessages] = useState<CrmOmnichannelMessage[]>([]);
  const [emailTemplates, setEmailTemplates] = useState<CrmEmailTemplate[]>([]);
  const [sequences, setSequences] = useState<CrmSequence[]>([]);
  const [inboxMessages, setInboxMessages] = useState<CrmEmailMessage[]>([]);
  const [quotes, setQuotes] = useState<CrmQuote[]>([]);
  const [documents, setDocuments] = useState<CrmDocument[]>([]);
  const [routingRules, setRoutingRules] = useState<CrmRoutingRule[]>([]);
  const [conversationInsights, setConversationInsights] = useState<CrmConversationInsight[]>([]);
  const [forecastSnapshots, setForecastSnapshots] = useState<CrmForecastSnapshot[]>([]);
  const [, setForecastAdjustments] = useState<Array<Record<string, unknown>>>([]);
  const [, setForecastTotals] = useState<Record<string, number>>({});
  const [isAccountWorkspaceOpen, setIsAccountWorkspaceOpen] = useState(false);
  const [isEngagementWorkspaceOpen, setIsEngagementWorkspaceOpen] = useState(false);
  const [isDocumentsWorkspaceOpen, setIsDocumentsWorkspaceOpen] = useState(false);
  const [isRoutingWorkspaceOpen, setIsRoutingWorkspaceOpen] = useState(false);
  const [isForecastWorkspaceOpen, setIsForecastWorkspaceOpen] = useState(false);
  const [accountForm, setAccountForm] = useState({
    name: '',
    website: '',
    industry: '',
    companySize: '',
  });
  const [contactForm, setContactForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    jobTitle: '',
  });
  const [mailboxForm, setMailboxForm] = useState({
    provider: 'GOOGLE',
    emailAddress: '',
    label: '',
  });
  const [integrationForm, setIntegrationForm] = useState({
    provider: 'WHATSAPP',
    label: '',
    channelIdentifier: '',
    connectionMode: 'OAUTH',
  });
  const [integrationConnectPreview, setIntegrationConnectPreview] = useState<{
    providerLabel: string;
    connectUrl?: string | null;
    callbackUrl?: string | null;
    webhookUrl?: string | null;
    requiredEnv?: string[];
  } | null>(null);
  const [templateForm, setTemplateForm] = useState({
    name: '',
    subject: '',
    body: '',
  });
  const [sequenceForm, setSequenceForm] = useState({
    name: '',
    description: '',
    stepSubject: '',
    stepBody: '',
  });
  const [messageForm, setMessageForm] = useState({
    subject: '',
    body: '',
  });
  const [omnichannelForm, setOmnichannelForm] = useState({
    channelType: 'WHATSAPP',
    body: '',
    recipientHandle: '',
  });
  const [quoteForm, setQuoteForm] = useState({
    title: '',
    amount: '',
    currency: 'BRL',
  });
  const [documentForm, setDocumentForm] = useState({
    title: '',
    type: 'PROPOSAL',
    provider: '',
  });
  const [routingForm, setRoutingForm] = useState({
    name: '',
    source: '',
    strategy: 'ROUND_ROBIN',
    ownerPool: '',
  });
  const [forecastSnapshotForm, setForecastSnapshotForm] = useState({
    label: '',
    periodStart: '',
    periodEnd: '',
    pipelineValue: '',
    bestCaseValue: '',
    commitValue: '',
    closedValue: '',
    gapToTarget: '',
  });
  const [forecastAdjustmentForm, setForecastAdjustmentForm] = useState({
    category: 'COMMIT',
    adjustedValue: '',
    reason: '',
  });
  const [insightForm, setInsightForm] = useState({
    sourceType: 'CALL',
    summaryText: '',
    coachingNotes: '',
  });

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
    canReadSalesTargets,
    canCreateSalesTargets,
    canDeleteSalesTargets,
  } = useCrmPermissions(authHeaders);

  const {
    error,
    leads,
    loading,
    reload: loadLeads,
    setError,
    total,
    totalPages,
    page,
    pageSize,
  } = useCrmLeads(authHeaders, crmQueryParams);

  const {
    items: analyticsItems,
  } = useCrmAnalytics(authHeaders, crmQueryParams);

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
    queryParams,
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
  } = useCrmFilters(leads, { items: analyticsItems, total: analyticsItems.length });

  useEffect(() => {
    setCrmQueryParams(queryParams);
  }, [queryParams]);

  const {
    createForm,
    createLead,
    isCreateOpen,
    savingLead,
    setCreateForm,
    setIsCreateOpen,
  } = useCreateLeadForm({
    authHeaders,
    loadLeads,
    setError,
  });

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

  const {
    selectedLead,
    leadActivities,
    leadTasks,
    loadingDetails,
    openLeadDetails,
  } = useLeadDetails(authHeaders);

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
  const [bulkPriorityValue, setBulkPriorityValue] = useState<
    'ALL' | 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'
  >('ALL');

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

  const {
    activityText,
    activityType,
    savingActivity,
    setActivityText,
    setActivityType,
    submitActivity,
  } = useLeadActivityComposer({
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

  const { noteText, savingNote, setNoteText, submitNote } = useLeadNotes({
    authHeaders,
    loadLeads,
    refreshLeadDetails: openLeadDetails,
    setError,
  });

  const totalOpenTasks = useMemo(
    () => leadTasks.filter((task) => !task.completedAt).length,
    [leadTasks],
  );

  const loadSalesTargets = useCallback(async () => {
    if (!canReadSalesTargets) {
      setSalesTargets([]);
      setLoadingSalesTargets(false);
      return;
    }

    try {
      setLoadingSalesTargets(true);
      const data = await getCrmSalesTargets(authHeaders);
      setSalesTargets(Array.isArray(data) ? data : []);
    } catch (error: unknown) {
      setError(getErrorMessage(error, 'Não foi possível carregar as metas comerciais.'));
    } finally {
      setLoadingSalesTargets(false);
    }
  }, [authHeaders, canReadSalesTargets, setError]);

  useEffect(() => {
    void loadSalesTargets();
  }, [loadSalesTargets]);

  const loadPipelines = useCallback(async () => {
    try {
      setLoadingPipelines(true);
      const data = await listCrmPipelines(authHeaders);
      setPipelines(Array.isArray(data) ? data : []);
      setSelectedPipelineId((current) => {
        if (current && data.some((item) => item.id === current)) return current;
        return data.find((item) => item.isDefault)?.id || data[0]?.id || '';
      });
    } catch (error: unknown) {
      setError(getErrorMessage(error, 'Não foi possível carregar os pipelines.'));
    } finally {
      setLoadingPipelines(false);
    }
  }, [authHeaders, setError]);

  useEffect(() => {
    void loadPipelines();
  }, [loadPipelines]);

  const loadEnterpriseHub = useCallback(async () => {
    try {
      setLoadingEnterpriseHub(true);
      const [
        nextAccounts,
        nextMailboxes,
        nextIntegrationCatalog,
        nextChannelIntegrations,
        nextOmnichannelMessages,
        nextTemplates,
        nextSequences,
        nextInbox,
        nextQuotes,
        nextDocuments,
        nextRoutingRules,
        nextConversationInsights,
        nextForecast,
      ] = await Promise.all([
        listCrmAccounts(authHeaders),
        listCrmMailboxes(authHeaders),
        listCrmIntegrationCatalog(authHeaders),
        listCrmChannelIntegrations(authHeaders),
        listCrmOmnichannelMessages(authHeaders),
        listCrmEmailTemplates(authHeaders),
        listCrmSequences(authHeaders),
        listCrmInbox(authHeaders),
        listCrmQuotes(authHeaders),
        listCrmDocuments(authHeaders),
        listCrmRoutingRules(authHeaders),
        listCrmConversationInsights(authHeaders),
        getCrmForecastSummary(authHeaders),
      ]);

      setAccounts(Array.isArray(nextAccounts) ? nextAccounts : []);
      setMailboxes(Array.isArray(nextMailboxes) ? nextMailboxes : []);
      setIntegrationCatalog(Array.isArray(nextIntegrationCatalog) ? nextIntegrationCatalog : []);
      setChannelIntegrations(Array.isArray(nextChannelIntegrations) ? nextChannelIntegrations : []);
      setOmnichannelMessages(
        Array.isArray(nextOmnichannelMessages) ? nextOmnichannelMessages : [],
      );
      setEmailTemplates(Array.isArray(nextTemplates) ? nextTemplates : []);
      setSequences(Array.isArray(nextSequences) ? nextSequences : []);
      setInboxMessages(Array.isArray(nextInbox) ? nextInbox : []);
      setQuotes(Array.isArray(nextQuotes) ? nextQuotes : []);
      setDocuments(Array.isArray(nextDocuments) ? nextDocuments : []);
      setRoutingRules(Array.isArray(nextRoutingRules) ? nextRoutingRules : []);
      setConversationInsights(
        Array.isArray(nextConversationInsights) ? nextConversationInsights : [],
      );
      setForecastTotals(nextForecast?.totals || {});
      setForecastSnapshots(Array.isArray(nextForecast?.snapshots) ? nextForecast.snapshots : []);
      setForecastAdjustments(
        Array.isArray(nextForecast?.adjustments) ? nextForecast.adjustments : [],
      );
    } catch (enterpriseError: unknown) {
      setError(
        getErrorMessage(
          enterpriseError,
          'Não foi possível carregar a camada enterprise do CRM.',
        ),
      );
    } finally {
      setLoadingEnterpriseHub(false);
    }
  }, [authHeaders, setError]);

  useEffect(() => {
    void loadEnterpriseHub();
  }, [loadEnterpriseHub]);

  useEffect(() => {
    const primaryAccountId = accounts[0]?.id;
    if (!primaryAccountId) {
      setAccountContacts([]);
      return;
    }

    let cancelled = false;
    void (async () => {
      try {
        const nextContacts = await listCrmContacts(authHeaders, primaryAccountId);
        if (!cancelled) {
          setAccountContacts(Array.isArray(nextContacts) ? nextContacts : []);
        }
      } catch (contactsError: unknown) {
        if (!cancelled) {
          setError(
            getErrorMessage(
              contactsError,
              'Não foi possível carregar os contatos da conta principal.',
            ),
          );
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [accounts, authHeaders, setError]);

  const currentSalesTarget = useMemo(() => {
    const now = new Date();

    return (
      salesTargets.find((target) => {
        const start = new Date(target.periodStart);
        const end = new Date(target.periodEnd);
        return start.getTime() <= now.getTime() && end.getTime() >= now.getTime();
      }) || null
    );
  }, [salesTargets]);

  const currentTargetProgress = useMemo(() => {
    if (!currentSalesTarget) return 0;

    const targetValue = parseMoney(currentSalesTarget.targetValue);
    if (targetValue <= 0) return 0;

    const progress = Math.round((totalForecast / targetValue) * 100);
    return Math.max(0, Math.min(progress, 999));
  }, [currentSalesTarget, totalForecast]);

  const selectedPipeline = useMemo(() => {
    return pipelines.find((pipeline) => pipeline.id === selectedPipelineId) || pipelines[0] || null;
  }, [pipelines, selectedPipelineId]);

  const selectedEnterpriseLead = selectedLead || filteredLeads[0] || null;
  const primaryAccount = accounts[0] || null;
  const primarySequence = sequences[0] || null;
  const latestQuote = quotes[0] || null;
  const latestForecastSnapshot = forecastSnapshots[0] || null;
  const connectedMailboxes = useMemo(
    () =>
      mailboxes.filter((mailbox) =>
        ['CONNECTED', 'ACTIVE', 'SYNCED'].includes(
          String(mailbox.syncStatus || '')
            .trim()
            .toUpperCase(),
        ),
      ),
    [mailboxes],
  );
  const mailboxErrors = useMemo(
    () => mailboxes.filter((mailbox) => mailbox.errorMessage),
    [mailboxes],
  );
  const connectedChannelIntegrations = useMemo(
    () =>
      channelIntegrations.filter((integration) =>
        ['CONNECTED', 'READY'].includes(
          String(integration.status || '')
            .trim()
            .toUpperCase(),
        ),
      ),
    [channelIntegrations],
  );
  const pendingChannelIntegrations = useMemo(
    () =>
      channelIntegrations.filter((integration) =>
        ['PENDING', 'REQUIRES_REAUTH', 'EXPIRED'].includes(
          String(integration.status || '')
            .trim()
            .toUpperCase(),
        ),
      ),
    [channelIntegrations],
  );
  const latestInboundChannel = useMemo(
    () =>
      [...channelIntegrations]
        .filter((integration) => integration.lastInboundAt)
        .sort(
          (a, b) =>
            new Date(b.lastInboundAt || 0).getTime() -
            new Date(a.lastInboundAt || 0).getTime(),
        )[0] || null,
    [channelIntegrations],
  );
  const emailReadinessLabel = useMemo(() => {
    if (connectedMailboxes.length > 0) return 'Operacional';
    if (mailboxes.length > 0) return 'Parcial';
    if (emailTemplates.length > 0 || sequences.length > 0) return 'Estruturando';
    return 'Nao conectado';
  }, [connectedMailboxes.length, emailTemplates.length, mailboxes.length, sequences.length]);
  const omnichannelReadinessLabel = useMemo(() => {
    if (connectedChannelIntegrations.length > 0) return 'Operacional';
    if (pendingChannelIntegrations.length > 0) return 'Pendente';
    if (channelIntegrations.length > 0) return 'Configurando';
    return 'Nao conectado';
  }, [
    channelIntegrations.length,
    connectedChannelIntegrations.length,
    pendingChannelIntegrations.length,
  ]);

  const managementForecastSummary = useMemo(() => {
    const openLeads = filteredLeads.filter((lead) => !['WON', 'LOST'].includes(lead.status));
    const wonLeads = filteredLeads.filter((lead) => lead.status === 'WON');

    const categories = [
      {
        key: 'pipeline',
        label: 'Pipeline',
        helper: 'Até 39% de probabilidade',
        leads: openLeads.filter((lead) => normalizeProbability(lead) < 40),
      },
      {
        key: 'bestCase',
        label: 'Best case',
        helper: '40% a 69% de probabilidade',
        leads: openLeads.filter((lead) => {
          const probability = normalizeProbability(lead);
          return probability >= 40 && probability < 70;
        }),
      },
      {
        key: 'commit',
        label: 'Commit',
        helper: '70%+ com maior chance de fechamento',
        leads: openLeads.filter((lead) => normalizeProbability(lead) >= 70),
      },
      {
        key: 'won',
        label: 'Closed won',
        helper: 'Receita já ganha no recorte filtrado',
        leads: wonLeads,
      },
    ].map((category) => {
      const totalValue = category.leads.reduce((sum, lead) => sum + parseMoney(lead.dealValue), 0);
      const forecastValue = category.leads.reduce(
        (sum, lead) => sum + parseMoney(lead.dealValue) * (normalizeProbability(lead) / 100),
        0,
      );

      return {
        ...category,
        count: category.leads.length,
        totalValue,
        forecastValue,
      };
    });

    const commitCategory = categories.find((item) => item.key === 'commit');
    const bestCaseCategory = categories.find((item) => item.key === 'bestCase');
    const targetValue = currentSalesTarget ? parseMoney(currentSalesTarget.targetValue) : 0;
    const commitCoverage = targetValue > 0 ? Math.round((totalForecast / targetValue) * 100) : 0;
    const gapValue = targetValue > 0 ? Math.max(targetValue - totalForecast, 0) : 0;

    return {
      categories,
      commitCoverage,
      gapValue,
      targetValue,
      commitValue: commitCategory?.forecastValue || 0,
      bestCaseValue: bestCaseCategory?.forecastValue || 0,
    };
  }, [currentSalesTarget, filteredLeads, totalForecast]);

  const accountIntelligence = useMemo(() => {
    const accounts = new Map<
      string,
      {
        label: string;
        openDeals: number;
        contacts: Set<string>;
        owners: Set<string>;
        pipelineValue: number;
        forecastValue: number;
        avgProbabilitySum: number;
        stalled: number;
      }
    >();

    filteredLeads.forEach((lead) => {
      const accountLabel = normalizeUiText(lead.companyName || lead.name || 'Conta sem nome').trim();
      const current = accounts.get(accountLabel) || {
        label: accountLabel,
        openDeals: 0,
        contacts: new Set<string>(),
        owners: new Set<string>(),
        pipelineValue: 0,
        forecastValue: 0,
        avgProbabilitySum: 0,
        stalled: 0,
      };

      if (!['WON', 'LOST'].includes(lead.status)) {
        current.openDeals += 1;
        current.pipelineValue += parseMoney(lead.dealValue);
        current.forecastValue += parseMoney(lead.dealValue) * (normalizeProbability(lead) / 100);
        current.avgProbabilitySum += normalizeProbability(lead);
      }

      if (lead.email) current.contacts.add(lead.email);
      else if (lead.phone) current.contacts.add(lead.phone);
      else current.contacts.add(lead.id);

      if (lead.ownerUser?.name) current.owners.add(normalizeUiText(lead.ownerUser.name));
      if (daysSince(getLastActivity(lead)) > 5) current.stalled += 1;

      accounts.set(accountLabel, current);
    });

    return [...accounts.values()]
      .map((account) => ({
        label: account.label,
        openDeals: account.openDeals,
        contacts: account.contacts.size,
        owners: account.owners.size,
        pipelineValue: account.pipelineValue,
        forecastValue: account.forecastValue,
        averageProbability: account.openDeals
          ? Math.round(account.avgProbabilitySum / account.openDeals)
          : 0,
        stalled: account.stalled,
      }))
      .sort((a, b) => b.pipelineValue - a.pipelineValue || b.openDeals - a.openDeals)
      .slice(0, 5);
  }, [filteredLeads]);

  const pipelineGovernanceSummary = useMemo(() => {
    const openLeads = filteredLeads.filter((lead) => !['WON', 'LOST'].includes(lead.status));

    const blockers = [
      {
        label: 'Sem responsável',
        count: openLeads.filter((lead) => !lead.ownerUser?.id).length,
        helper: 'Oportunidades sem ownership comercial definido',
      },
      {
        label: 'Sem próximo passo',
        count: openLeads.filter((lead) => !lead.nextStep?.trim()).length,
        helper: 'Leads sem ação registrada para continuar o funil',
      },
      {
        label: 'Follow-up vencido',
        count: openLeads.filter(
          (lead) =>
            !!lead.nextStepDueAt && new Date(lead.nextStepDueAt).getTime() < Date.now(),
        ).length,
        helper: 'Pendências comerciais que já perderam o SLA',
      },
      {
        label: 'Sem fechamento previsto',
        count: openLeads.filter((lead) => !lead.expectedCloseDate).length,
        helper: 'Negócios sem previsão de receita para forecast',
      },
      {
        label: 'Sem valor de negócio',
        count: openLeads.filter((lead) => parseMoney(lead.dealValue) <= 0).length,
        helper: 'Leads sem valor, dificultando priorização e previsão',
      },
    ]
      .sort((a, b) => b.count - a.count)
      .filter((item) => item.count > 0);

    const readiness =
      openLeads.length === 0
        ? 100
        : Math.max(
            0,
            100 -
              Math.round(
                blockers.reduce((sum, item) => sum + item.count, 0) / openLeads.length,
              ) *
                10,
          );

    return {
      blockers: blockers.slice(0, 4),
      readiness,
      openLeadsCount: openLeads.length,
    };
  }, [filteredLeads]);

  const selectedLeadReadiness = useMemo(() => {
    if (!selectedLead) return null;

    const warnings: string[] = [];

    if (!selectedLead.ownerUser?.id) warnings.push('Definir responsável antes de acelerar a oportunidade.');
    if (!selectedLead.nextStep?.trim()) warnings.push('Registrar o próximo passo para manter a cadência comercial.');
    if (!selectedLead.nextStepDueAt) warnings.push('Definir prazo do próximo passo para proteger o SLA.');
    if (!selectedLead.expectedCloseDate) warnings.push('Informar a data prevista de fechamento para forecast gerencial.');
    if (parseMoney(selectedLead.dealValue) <= 0) warnings.push('Adicionar valor do negócio para priorização financeira.');
    if (!selectedLead.email && !selectedLead.phone && !selectedLead.whatsapp) {
      warnings.push('Completar ao menos um canal de contato do lead.');
    }
    if (
      ['PROPOSAL', 'NEGOTIATION'].includes(selectedLead.status) &&
      !selectedLead.competitor?.trim()
    ) {
      warnings.push('Mapear concorrente e objeções nesta fase mais avançada do funil.');
    }

    const score = Math.max(0, 100 - warnings.length * 14);

    return {
      score,
      warnings,
      label: score >= 85 ? 'Pronto para avançar' : score >= 65 ? 'Atenção de governança' : 'Bloqueios relevantes',
    };
  }, [selectedLead]);

  const conversationCoachingSummary = useMemo(() => {
    const recentInsights = conversationInsights.slice(0, 12);
    const insightsWithSentiment = recentInsights.filter(
      (insight) =>
        insight.sentimentScore !== null && insight.sentimentScore !== undefined,
    );
    const averageSentiment = insightsWithSentiment.length
      ? Math.round(
          insightsWithSentiment.reduce(
            (sum, insight) => sum + Number(insight.sentimentScore || 0),
            0,
          ) / insightsWithSentiment.length,
        )
      : null;
    const coachingCoverage = recentInsights.length
      ? Math.round(
          (recentInsights.filter((insight) => insight.coachingNotes?.trim()).length /
            recentInsights.length) *
            100,
        )
      : 0;
    const sourceCounts = recentInsights.reduce<Record<string, number>>((acc, insight) => {
      const key = normalizeUiText(insight.sourceType || 'CALL');
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});
    const dominantSource =
      Object.entries(sourceCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'Sem fonte dominante';
    const negativeCount = recentInsights.filter(
      (insight) => Number(insight.sentimentScore || 0) < 0,
    ).length;

    return {
      total: recentInsights.length,
      averageSentiment,
      coachingCoverage,
      dominantSource,
      negativeCount,
      alert:
        negativeCount > 0
          ? 'Conversas com sentimento negativo pedem acompanhamento imediato.'
          : coachingCoverage < 60 && recentInsights.length > 0
            ? 'Falta consolidar notas de coaching em boa parte das conversas.'
            : 'Camada de coaching está saudável neste recorte.',
    };
  }, [conversationInsights]);

  const selectedAccountSummary = useMemo(() => {
    if (!selectedLead?.companyName?.trim()) return null;

    const accountLeads = leads.filter(
      (lead) =>
        normalizeUiText(lead.companyName || '').trim().toLowerCase() ===
        normalizeUiText(selectedLead.companyName || '').trim().toLowerCase(),
    );

    if (accountLeads.length === 0) return null;

    const openDeals = accountLeads.filter((lead) => !['WON', 'LOST'].includes(lead.status));
    const stakeholders = new Set(
      accountLeads
        .map((lead) => normalizeUiText(lead.name || '').trim())
        .filter(Boolean),
    );

    return {
      name: normalizeUiText(selectedLead.companyName),
      stakeholders: stakeholders.size,
      openDeals: openDeals.length,
      pipelineValue: openDeals.reduce((sum, lead) => sum + parseMoney(lead.dealValue), 0),
      forecastValue: openDeals.reduce(
        (sum, lead) => sum + parseMoney(lead.dealValue) * (normalizeProbability(lead) / 100),
        0,
      ),
    };
  }, [leads, selectedLead]);

  const selectedLeadRoutingSuggestion = useMemo(() => {
    if (!selectedLead) return null;

    const candidates = ownerOptions
      .map((owner) => {
        const ownerLeads = leads.filter((lead) => lead.ownerUser?.id === owner.id);
        const sameBranch = selectedLead.branchId
          ? ownerLeads.filter((lead) => lead.branchId === selectedLead.branchId).length
          : 0;
        const sameDepartment = selectedLead.departmentId
          ? ownerLeads.filter((lead) => lead.departmentId === selectedLead.departmentId).length
          : 0;
        const openDeals = ownerLeads.filter((lead) => !['WON', 'LOST'].includes(lead.status)).length;
        const pipelineValue = ownerLeads
          .filter((lead) => !['WON', 'LOST'].includes(lead.status))
          .reduce((sum, lead) => sum + parseMoney(lead.dealValue), 0);
        const openTasks =
          openTasksByOwnerReport.find((item) => item.label === owner.name)?.count || 0;

        const fitScore =
          sameDepartment * 8 +
          sameBranch * 5 +
          Math.max(0, 12 - openDeals) +
          Math.max(0, 8 - openTasks) +
          (pipelineValue < 25000 ? 4 : pipelineValue < 60000 ? 2 : 0);

        return {
          id: owner.id,
          name: owner.name,
          fitScore,
          sameBranch,
          sameDepartment,
          openDeals,
        };
      })
      .sort((a, b) => b.fitScore - a.fitScore || a.openDeals - b.openDeals);

    return candidates[0] || null;
  }, [leads, openTasksByOwnerReport, ownerOptions, selectedLead]);

  function applyPlaybookPreset(preset: ReturnType<typeof getStagePlaybook>[number]) {
    if (!selectedLead) return;

    if (preset.mode === 'activity') {
      setActivityType(preset.activityType ?? 'NOTE');
      setActivityText(preset.template);
      return;
    }

    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + preset.dueInDays);

    setTaskForm({
      title: preset.title,
      description: preset.template,
      dueAt: dueDate.toISOString().slice(0, 16),
      assignedUserId: selectedLead.ownerUser?.id || '',
    });
  }

  const guidedSellingQueue = useMemo(() => {
    return filteredLeads
      .map((lead) => ({
        lead,
        guidance: getLeadGuidance(lead, [], []),
      }))
      .sort((a, b) => b.guidance.score - a.guidance.score)
      .slice(0, 4);
  }, [filteredLeads]);

  const selectedLeadGuidance = useMemo(() => {
    return getLeadGuidance(selectedLead, leadActivities, leadTasks);
  }, [selectedLead, leadActivities, leadTasks]);

  const ownerExecutionSignals = useMemo(() => {
    const ownerMap = new Map<
      string,
      { name: string; stalled: number; tasks: number; pipelineValue: number; score: number }
    >();

    pipelineValueByOwnerReport.forEach((item) => {
      ownerMap.set(item.label, {
        name: item.label,
        stalled: 0,
        tasks: 0,
        pipelineValue: item.value || 0,
        score: 0,
      });
    });

    stalledLeadsByOwnerReport.forEach((item) => {
      const current = ownerMap.get(item.label) || {
        name: item.label,
        stalled: 0,
        tasks: 0,
        pipelineValue: 0,
        score: 0,
      };
      current.stalled = item.count;
      ownerMap.set(item.label, current);
    });

    openTasksByOwnerReport.forEach((item) => {
      const current = ownerMap.get(item.label) || {
        name: item.label,
        stalled: 0,
        tasks: 0,
        pipelineValue: 0,
        score: 0,
      };
      current.tasks = item.count;
      ownerMap.set(item.label, current);
    });

    return [...ownerMap.values()]
      .map((item) => ({
        ...item,
        score: item.stalled * 5 + item.tasks * 2 + (item.pipelineValue >= 50000 ? 6 : item.pipelineValue >= 15000 ? 3 : 0),
      }))
      .sort((a, b) => b.score - a.score || b.pipelineValue - a.pipelineValue)
      .slice(0, 3);
  }, [openTasksByOwnerReport, pipelineValueByOwnerReport, stalledLeadsByOwnerReport]);

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

  async function saveSalesTarget() {
    if (!salesTargetForm.periodStart || !salesTargetForm.periodEnd) {
      setError('Informe o período inicial e final da meta.');
      return;
    }

    try {
      setSavingSalesTarget(true);
      setError(null);

      await createCrmSalesTarget(authHeaders, {
        periodType: salesTargetForm.periodType,
        periodStart: salesTargetForm.periodStart,
        periodEnd: salesTargetForm.periodEnd,
        targetValue:
          salesTargetForm.targetValue !== undefined &&
          Number.isFinite(Number(salesTargetForm.targetValue))
            ? Number(salesTargetForm.targetValue)
            : undefined,
        targetDeals:
          salesTargetForm.targetDeals !== undefined &&
          Number.isFinite(Number(salesTargetForm.targetDeals))
            ? Number(salesTargetForm.targetDeals)
            : undefined,
        branchId: salesTargetForm.branchId?.trim() || undefined,
        departmentId: salesTargetForm.departmentId?.trim() || undefined,
        userId: salesTargetForm.userId?.trim() || undefined,
      });

      setSalesTargetForm(emptySalesTargetForm);
      setIsSalesTargetOpen(false);
      await loadSalesTargets();
    } catch (error: unknown) {
      setError(getErrorMessage(error, 'Não foi possível salvar a meta comercial.'));
    } finally {
      setSavingSalesTarget(false);
    }
  }

  async function removeSalesTarget(targetId: string) {
    try {
      setDeletingSalesTargetId(targetId);
      setError(null);
      await deleteCrmSalesTarget(authHeaders, targetId);
      await loadSalesTargets();
    } catch (error: unknown) {
      setError(getErrorMessage(error, 'Não foi possível excluir a meta comercial.'));
    } finally {
      setDeletingSalesTargetId(null);
    }
  }

  async function savePipeline() {
    if (!pipelineForm.name.trim()) {
      setError('Informe um nome para o pipeline.');
      return;
    }

    try {
      setSavingPipeline(true);
      setError(null);
      await createCrmPipeline(authHeaders, {
        name: pipelineForm.name,
        description: pipelineForm.description,
        isDefault: pipelineForm.isDefault,
      });
      setPipelineForm(emptyPipelineForm);
      await loadPipelines();
    } catch (error: unknown) {
      setError(getErrorMessage(error, 'Não foi possível criar o pipeline.'));
    } finally {
      setSavingPipeline(false);
    }
  }

  async function removePipeline(pipelineId: string) {
    try {
      setDeletingPipelineId(pipelineId);
      setError(null);
      await deleteCrmPipeline(authHeaders, pipelineId);
      await loadPipelines();
    } catch (error: unknown) {
      setError(getErrorMessage(error, 'Não foi possível excluir o pipeline.'));
    } finally {
      setDeletingPipelineId(null);
    }
  }

  async function saveStage() {
    if (!selectedPipeline) {
      setError('Selecione um pipeline antes de criar uma etapa.');
      return;
    }

    if (!stageForm.name.trim()) {
      setError('Informe um nome para a etapa.');
      return;
    }

    try {
      setSavingStage(true);
      setError(null);
      await createCrmPipelineStage(authHeaders, selectedPipeline.id, {
        name: stageForm.name,
        color: stageForm.color,
        statusBase: stageForm.statusBase,
        order: selectedPipeline.stages.length,
      });
      setStageForm(emptyStageForm);
      await loadPipelines();
    } catch (error: unknown) {
      setError(getErrorMessage(error, 'Não foi possível criar a etapa.'));
    } finally {
      setSavingStage(false);
    }
  }

  async function removeStage(stageId: string) {
    if (!selectedPipeline) return;

    try {
      setDeletingStageId(stageId);
      setError(null);
      await deleteCrmPipelineStage(authHeaders, selectedPipeline.id, stageId);
      await loadPipelines();
    } catch (error: unknown) {
      setError(getErrorMessage(error, 'Não foi possível excluir a etapa.'));
    } finally {
      setDeletingStageId(null);
    }
  }

  async function saveAccountWorkspace() {
    if (!accountForm.name.trim()) {
      setError('Informe um nome para a conta.');
      return;
    }

    try {
      setSavingEnterpriseAction(true);
      setError(null);
      const account = await createCrmAccount(authHeaders, {
        name: accountForm.name.trim(),
        website: accountForm.website.trim() || undefined,
        industry: accountForm.industry.trim() || undefined,
        companySize: accountForm.companySize.trim() || undefined,
      });

      if (account?.id && contactForm.firstName.trim()) {
        await createCrmContact(authHeaders, account.id, {
          firstName: contactForm.firstName.trim(),
          lastName: contactForm.lastName.trim() || undefined,
          email: contactForm.email.trim() || undefined,
          phone: contactForm.phone.trim() || undefined,
          jobTitle: contactForm.jobTitle.trim() || undefined,
        });
      }

      setAccountForm({ name: '', website: '', industry: '', companySize: '' });
      setContactForm({ firstName: '', lastName: '', email: '', phone: '', jobTitle: '' });
      setIsAccountWorkspaceOpen(false);
      await loadEnterpriseHub();
    } catch (workspaceError: unknown) {
      setError(getErrorMessage(workspaceError, 'Não foi possível salvar conta e contato.'));
    } finally {
      setSavingEnterpriseAction(false);
    }
  }

  async function saveEngagementWorkspace() {
    try {
      setSavingEnterpriseAction(true);
      setError(null);

      if (mailboxForm.emailAddress.trim()) {
        await createCrmMailbox(authHeaders, {
          provider: mailboxForm.provider,
          emailAddress: mailboxForm.emailAddress.trim(),
          label: mailboxForm.label.trim() || mailboxForm.emailAddress.trim(),
        });
      }

      if (templateForm.subject.trim() && templateForm.body.trim()) {
        await createCrmEmailTemplate(authHeaders, {
          name: templateForm.name.trim() || templateForm.subject.trim(),
          subject: templateForm.subject.trim(),
          body: templateForm.body.trim(),
        });
      }

      if (sequenceForm.name.trim() && sequenceForm.stepSubject.trim()) {
        const sequence = await createCrmSequence(authHeaders, {
          name: sequenceForm.name.trim(),
          description: sequenceForm.description.trim() || undefined,
          steps: [
            {
              type: 'EMAIL',
              subject: sequenceForm.stepSubject.trim(),
              body: sequenceForm.stepBody.trim() || undefined,
              dueInDays: 0,
            },
          ],
        });

        if (selectedEnterpriseLead && sequence?.id) {
          await enrollCrmSequence(authHeaders, {
            sequenceId: sequence.id,
            leadId: selectedEnterpriseLead.id,
            contactId: selectedEnterpriseLead.contactId || undefined,
          });
        }
      }

      if (selectedEnterpriseLead && messageForm.body.trim()) {
        await createCrmEmailMessage(authHeaders, {
          leadId: selectedEnterpriseLead.id,
          accountId: selectedEnterpriseLead.accountId || undefined,
          contactId: selectedEnterpriseLead.contactId || undefined,
          subject: messageForm.subject.trim() || 'Follow-up comercial',
          body: messageForm.body.trim(),
          direction: 'OUTBOUND',
        });
      }

      if (selectedEnterpriseLead && omnichannelForm.body.trim()) {
        const defaultIntegration =
          channelIntegrations.find((item) => item.provider === omnichannelForm.channelType) ||
          channelIntegrations[0];

        await createCrmOmnichannelMessage(authHeaders, {
          integrationId: defaultIntegration?.id,
          leadId: selectedEnterpriseLead.id,
          accountId: selectedEnterpriseLead.accountId || undefined,
          contactId: selectedEnterpriseLead.contactId || undefined,
          channelType: omnichannelForm.channelType,
          recipientHandle:
            omnichannelForm.recipientHandle.trim() ||
            selectedEnterpriseLead.whatsapp ||
            selectedEnterpriseLead.phone ||
            selectedEnterpriseLead.email ||
            undefined,
          body: omnichannelForm.body.trim(),
          direction: 'OUTBOUND',
        });
      }

      if (selectedEnterpriseLead && insightForm.summaryText.trim()) {
        await createCrmConversationInsight(authHeaders, {
          leadId: selectedEnterpriseLead.id,
          sourceType: insightForm.sourceType,
          summaryText: insightForm.summaryText.trim(),
          coachingNotes: insightForm.coachingNotes.trim() || undefined,
        });
      }

      setMailboxForm({ provider: 'GOOGLE', emailAddress: '', label: '' });
      setIntegrationForm({
        provider: 'WHATSAPP',
        label: '',
        channelIdentifier: '',
        connectionMode: 'OAUTH',
      });
      setIntegrationConnectPreview(null);
      setTemplateForm({ name: '', subject: '', body: '' });
      setSequenceForm({ name: '', description: '', stepSubject: '', stepBody: '' });
      setMessageForm({ subject: '', body: '' });
      setOmnichannelForm({ channelType: 'WHATSAPP', body: '', recipientHandle: '' });
      setInsightForm({ sourceType: 'CALL', summaryText: '', coachingNotes: '' });
      setIsEngagementWorkspaceOpen(false);
      await loadEnterpriseHub();
      if (selectedEnterpriseLead) {
        await openLeadDetails(selectedEnterpriseLead);
      }
    } catch (workspaceError: unknown) {
      setError(
        getErrorMessage(workspaceError, 'Não foi possível salvar inbox, cadência ou insight.'),
      );
    } finally {
      setSavingEnterpriseAction(false);
    }
  }

  async function handleGenerateIntegrationConnection() {
    try {
      setSavingEnterpriseAction(true);
      setError(null);

      const result = await createCrmIntegrationConnectUrl(authHeaders, {
        provider: integrationForm.provider,
        label: integrationForm.label.trim() || undefined,
        channelIdentifier: integrationForm.channelIdentifier.trim() || undefined,
        connectionMode: integrationForm.connectionMode,
      });

      setIntegrationConnectPreview({
        providerLabel: result.providerLabel,
        connectUrl: result.connectUrl,
        callbackUrl: result.callbackUrl,
        webhookUrl: result.webhookUrl,
        requiredEnv: result.requiredEnv,
      });

      await loadEnterpriseHub();
    } catch (workspaceError: unknown) {
      setError(getErrorMessage(workspaceError, 'Não foi possível gerar a conexão do provider.'));
    } finally {
      setSavingEnterpriseAction(false);
    }
  }

  async function handleCreateManualIntegration() {
    try {
      setSavingEnterpriseAction(true);
      setError(null);

      await createCrmChannelIntegration(authHeaders, {
        provider: integrationForm.provider,
        label: integrationForm.label.trim() || undefined,
        channelIdentifier: integrationForm.channelIdentifier.trim() || undefined,
        connectionMode: integrationForm.connectionMode,
        status: 'PENDING',
      });

      setIntegrationConnectPreview(null);
      await loadEnterpriseHub();
    } catch (workspaceError: unknown) {
      setError(getErrorMessage(workspaceError, 'Não foi possível cadastrar a integração.'));
    } finally {
      setSavingEnterpriseAction(false);
    }
  }

  async function handleSyncIntegration(integrationId: string) {
    try {
      setSavingEnterpriseAction(true);
      setError(null);
      await syncCrmChannelIntegration(authHeaders, integrationId);
      await loadEnterpriseHub();
    } catch (workspaceError: unknown) {
      setError(getErrorMessage(workspaceError, 'Não foi possível sincronizar a integração.'));
    } finally {
      setSavingEnterpriseAction(false);
    }
  }

  async function saveDocumentsWorkspace() {
    if (!selectedEnterpriseLead) {
      setError('Selecione um lead para gerar proposta e documentos.');
      return;
    }

    try {
      setSavingEnterpriseAction(true);
      setError(null);

      let createdQuoteId = latestQuote?.id;

      if (quoteForm.title.trim() && quoteForm.amount.trim()) {
        const amount = Number(quoteForm.amount);
        const createdQuote = await createCrmQuote(authHeaders, {
          title: quoteForm.title.trim(),
          leadId: selectedEnterpriseLead.id,
          accountId: selectedEnterpriseLead.accountId || undefined,
          contactId: selectedEnterpriseLead.contactId || undefined,
          currency: quoteForm.currency,
          items: [
            {
              description: quoteForm.title.trim(),
              quantity: 1,
              unitPrice: Number.isFinite(amount) ? amount : 0,
            },
          ],
        });
        createdQuoteId = createdQuote?.id || createdQuoteId;
      }

      if (documentForm.title.trim()) {
        await createCrmDocument(authHeaders, {
          title: documentForm.title.trim(),
          type: documentForm.type,
          leadId: selectedEnterpriseLead.id,
          accountId: selectedEnterpriseLead.accountId || undefined,
          contactId: selectedEnterpriseLead.contactId || undefined,
          quoteId: createdQuoteId || undefined,
          provider: documentForm.provider.trim() || undefined,
        });
      }

      setQuoteForm({ title: '', amount: '', currency: 'BRL' });
      setDocumentForm({ title: '', type: 'PROPOSAL', provider: '' });
      setIsDocumentsWorkspaceOpen(false);
      await loadEnterpriseHub();
      await openLeadDetails(selectedEnterpriseLead);
    } catch (workspaceError: unknown) {
      setError(
        getErrorMessage(workspaceError, 'Não foi possível salvar proposal, quote ou documento.'),
      );
    } finally {
      setSavingEnterpriseAction(false);
    }
  }

  async function handleUpdateDocumentSignatureStatus(
    documentId: string,
    signatureStatus: 'SENT' | 'OPENED' | 'SIGNED',
  ) {
    try {
      setSavingEnterpriseAction(true);
      setError(null);
      await updateCrmDocumentSignatureStatus(documentId, authHeaders, {
        signatureStatus,
        provider: documentForm.provider.trim() || undefined,
      });
      await loadEnterpriseHub();
    } catch (workspaceError: unknown) {
      setError(
        getErrorMessage(workspaceError, 'Nao foi possivel atualizar o status de assinatura.'),
      );
    } finally {
      setSavingEnterpriseAction(false);
    }
  }

  async function saveRoutingWorkspace() {
    try {
      setSavingEnterpriseAction(true);
      setError(null);

      if (routingForm.name.trim()) {
        const ownerPoolJson = routingForm.ownerPool
          .split(',')
          .map((value) => value.trim())
          .filter(Boolean);

        await createCrmRoutingRule(authHeaders, {
          name: routingForm.name.trim(),
          source: routingForm.source.trim() || undefined,
          strategy: routingForm.strategy,
          ownerPoolJson,
        });
      }

      if (selectedEnterpriseLead) {
        await applyCrmRoutingRule(authHeaders, selectedEnterpriseLead.id);
        await loadLeads();
        await openLeadDetails(selectedEnterpriseLead);
      }

      setRoutingForm({ name: '', source: '', strategy: 'ROUND_ROBIN', ownerPool: '' });
      setIsRoutingWorkspaceOpen(false);
      await loadEnterpriseHub();
    } catch (workspaceError: unknown) {
      setError(getErrorMessage(workspaceError, 'Não foi possível salvar a governança de roteamento.'));
    } finally {
      setSavingEnterpriseAction(false);
    }
  }

  async function saveForecastWorkspace() {
    try {
      setSavingEnterpriseAction(true);
      setError(null);

      if (
        forecastSnapshotForm.label.trim() &&
        forecastSnapshotForm.periodStart &&
        forecastSnapshotForm.periodEnd
      ) {
        await createCrmForecastSnapshot(authHeaders, {
          label: forecastSnapshotForm.label.trim(),
          periodStart: forecastSnapshotForm.periodStart,
          periodEnd: forecastSnapshotForm.periodEnd,
          pipelineValue: Number(forecastSnapshotForm.pipelineValue || 0),
          bestCaseValue: Number(forecastSnapshotForm.bestCaseValue || 0),
          commitValue: Number(forecastSnapshotForm.commitValue || 0),
          closedValue: Number(forecastSnapshotForm.closedValue || 0),
          gapToTarget: forecastSnapshotForm.gapToTarget
            ? Number(forecastSnapshotForm.gapToTarget)
            : undefined,
        });
      }

      if (forecastAdjustmentForm.reason.trim() && forecastAdjustmentForm.adjustedValue.trim()) {
        await createCrmForecastAdjustment(authHeaders, {
          snapshotId: latestForecastSnapshot?.id || undefined,
          leadId: selectedEnterpriseLead?.id || undefined,
          category: forecastAdjustmentForm.category,
          adjustedValue: Number(forecastAdjustmentForm.adjustedValue),
          reason: forecastAdjustmentForm.reason.trim(),
        });
      }

      setForecastSnapshotForm({
        label: '',
        periodStart: '',
        periodEnd: '',
        pipelineValue: '',
        bestCaseValue: '',
        commitValue: '',
        closedValue: '',
        gapToTarget: '',
      });
      setForecastAdjustmentForm({ category: 'COMMIT', adjustedValue: '', reason: '' });
      setIsForecastWorkspaceOpen(false);
      await loadEnterpriseHub();
    } catch (workspaceError: unknown) {
      setError(getErrorMessage(workspaceError, 'Não foi possível salvar a governança de forecast.'));
    } finally {
      setSavingEnterpriseAction(false);
    }
  }

  const heroQuickCharts = useMemo(() => {
    const bestStage = [...stageConversionReport].sort((a, b) => (b.rate || 0) - (a.rate || 0))[0];
    const bestSource = [...sourceConversionReport].sort((a, b) => (b.value || 0) - (a.value || 0))[0];
    const topOwnerPipeline = [...pipelineValueByOwnerReport].sort(
      (a, b) => (b.value || 0) - (a.value || 0),
    )[0];

    return [
      {
        label: 'Conversão',
        helper: bestStage
          ? `${STATUS_LABELS[bestStage.label as LeadStatus] || bestStage.label}`
          : 'Sem etapa líder',
        value: bestStage?.rate || 0,
        valueLabel: `${bestStage?.rate || 0}%`,
      },
      {
        label: 'Origem',
        helper: bestSource ? bestSource.label : 'Sem origem líder',
        value: bestSource?.value || 0,
        valueLabel: canSeeValues ? formatMoney(bestSource?.value || 0) : 'Sem acesso',
      },
      {
        label: 'Owner',
        helper: topOwnerPipeline ? topOwnerPipeline.label : 'Sem owner líder',
        value: topOwnerPipeline?.value || 0,
        valueLabel: canSeeValues ? formatMoney(topOwnerPipeline?.value || 0) : 'Sem acesso',
      },
    ];
  }, [canSeeValues, pipelineValueByOwnerReport, sourceConversionReport, stageConversionReport]);

  return (
    <div className="min-h-screen w-full max-w-full overflow-x-hidden bg-[#07090A] px-4 py-5 text-white md:px-6 md:py-6">
      <CrmStyles />

      <div className="mx-auto flex w-full min-w-0 max-w-[1840px] flex-col gap-4">
        <CrmExecutiveHero
          stats={stats}
          dominantStatus={dominantStatus}
          topOwner={topOwner}
          quickCharts={heroQuickCharts}
          onAddLead={() => setIsCreateOpen(true)}
          onManagePipeline={() => setIsPipelineManagerOpen(true)}
          onViewPipeline={() =>
            pipelineRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
          }
        />

        <div className="grid gap-2.5 sm:grid-cols-2 xl:grid-cols-5">
          <CrmMetricCard
            label="Pipeline value"
            value={canSeeValues ? formatMoney(totalPipelineValue) : 'Sem acesso'}
            helper="Valor total das oportunidades filtradas"
          />
          <CrmMetricCard
            label="Forecast"
            value={canSeeValues ? formatMoney(totalForecast) : 'Sem acesso'}
            helper="Receita ponderada do pipeline"
            accent="success"
          />
          <CrmMetricCard
            label="Probabilidade média"
            value={`${averageProbability}%`}
            helper="Qualidade média das negociações"
            accent="attention"
          />
          <CrmMetricCard
            label="Em atenção"
            value={stats.stalledLeads}
            helper="Leads sem atividade recente"
            accent={stats.stalledLeads > 0 ? 'danger' : 'success'}
          />
          <CrmMetricCard
            label="Meta atual"
            value={
              !canReadSalesTargets
                ? 'Sem acesso'
                : currentSalesTarget && canSeeValues
                  ? formatMoney(currentSalesTarget.targetValue)
                  : currentSalesTarget
                    ? `${currentSalesTarget.targetDeals || 0} negócios`
                    : 'Não definida'
            }
            helper={
              !canReadSalesTargets
                ? 'Você não pode visualizar metas comerciais'
                : currentSalesTarget
                  ? `Atingimento: ${currentTargetProgress}%`
                  : 'Cadastre metas para acompanhar o time'
            }
            accent={currentTargetProgress >= 100 ? 'success' : 'attention'}
          />
        </div>

        <CrmPanel className="p-4 md:p-5">
          <CrmSectionHeader
            eyebrow="Executive analytics"
            title="Painel executivo de performance comercial"
            description="Uma camada visual mais premium para ler tendencia, composicao do funil, distribuicao de receita e foco de execucao."
          />

          <div className="grid gap-3 xl:grid-cols-[minmax(0,1.45fr)_minmax(320px,0.8fr)]">
            <ExecutiveAreaChartCard
              title="Ritmo de fechamento"
              subtitle="Ganhos e perdas recentes do CRM filtrado"
              rows={wonLostByPeriodReport.slice(-6)}
            />
            <ExecutiveDonutCard
              title="Composicao do pipeline"
              subtitle="Distribuicao visual por etapa"
              rows={pipelineTotals.map((item) => ({
                label: STATUS_LABELS[item.status],
                value: item.count,
                helper: canSeeValues ? formatMoney(item.totalValue) : `${item.count} lead(s)`,
              }))}
            />
          </div>

          <div className="mt-3 grid gap-3 xl:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]">
            <ExecutiveColumnChartCard
              title="Receita por owner"
              subtitle="Concentracao do pipeline nas carteiras principais"
              rows={pipelineValueByOwnerReport.slice(0, 6).map((item) => ({
                label: item.label,
                value: item.value || 0,
                helper: `${item.count} lead(s)`,
                valueLabel: canSeeValues ? formatMoney(item.value) : 'Sem acesso',
              }))}
            />
            <ExecutiveRankCard
              title="Prioridades do comercial"
              subtitle="Onde agir primeiro para proteger forecast e conversao"
              rows={[
                {
                  label: topOwner ? `Owner lider: ${topOwner[0]}` : 'Owner lider sem dado',
                  value: topOwner ? `${topOwner[1]} lead(s)` : 'Sem carteira destaque',
                  helper: 'Maior volume de oportunidades em andamento',
                },
                {
                  label: `Leads parados`,
                  value: `${stats.stalledLeads}`,
                  helper: 'Negocios com baixa atividade recente',
                },
                {
                  label: `Tarefas abertas`,
                  value: `${totalOpenTasks}`,
                  helper: 'Follow-ups pendentes no recorte atual',
                },
                {
                  label: 'Meta atual',
                  value:
                    currentSalesTarget && canSeeValues
                      ? formatMoney(currentSalesTarget.targetValue)
                      : currentSalesTarget
                        ? `${currentSalesTarget.targetDeals || 0} negocios`
                        : 'Nao definida',
                  helper:
                    currentSalesTarget
                      ? `${currentTargetProgress}% da meta coberta`
                      : 'Cadastre uma meta para acompanhar a execucao',
                },
              ]}
            />
          </div>
        </CrmPanel>

        <CrmPanel className="p-4">
          <CrmSectionHeader
            eyebrow="Guided selling"
            title="Fila de execução sugerida"
            description="O CRM prioriza automaticamente onde a operação comercial deve agir agora."
          />

          <div className="mb-4 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => {
                setOverdueNextStepOnly('YES');
                setStalledOnly('ALL');
                setDealValueMin('');
                pipelineRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
              }}
              className="rounded-2xl border border-[#8B5CF6]/20 bg-[#8B5CF6]/10 px-3.5 py-2 text-xs font-medium text-white transition hover:bg-[#8B5CF6]/15"
            >
              Ver follow-up vencido
            </button>
            <button
              type="button"
              onClick={() => {
                setStalledOnly('YES');
                setOverdueNextStepOnly('ALL');
                setDealValueMin('10000');
                pipelineRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
              }}
              className="rounded-2xl border border-white/10 bg-white/5 px-3.5 py-2 text-xs font-medium text-zinc-300 transition hover:bg-white/10 hover:text-white"
            >
              Alto valor parado
            </button>
            <button
              type="button"
              onClick={() => {
                setStalledOnly('ALL');
                setOverdueNextStepOnly('ALL');
                setDealValueMin('');
                setSearchTerm('');
              }}
              className="rounded-2xl border border-white/10 bg-white/5 px-3.5 py-2 text-xs font-medium text-zinc-300 transition hover:bg-white/10 hover:text-white"
            >
              Limpar atalhos
            </button>
          </div>

          <div className="grid gap-3 xl:grid-cols-4">
            {guidedSellingQueue.length === 0 ? (
              <div className="xl:col-span-4 rounded-[24px] border border-dashed border-white/10 bg-white/[0.03] px-4 py-8 text-center text-sm text-zinc-500">
                Sem oportunidades suficientes para montar a fila de execução.
              </div>
            ) : (
              guidedSellingQueue.map(({ lead, guidance }) => (
                <button
                  key={lead.id}
                  type="button"
                  onClick={() => void openLeadDetails(lead)}
                  className="group rounded-[24px] border border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(139,92,246,0.08),transparent_42%),linear-gradient(180deg,rgba(255,255,255,0.04),rgba(0,0,0,0.14))] p-4 text-left shadow-[0_18px_48px_rgba(0,0,0,0.16)] transition hover:-translate-y-0.5 hover:border-[#8B5CF6]/20"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="truncate text-sm font-medium text-white">
                        {normalizeUiText(lead.name)}
                      </div>
                      <div className="mt-1 truncate text-xs text-zinc-500">
                        {normalizeUiText(lead.companyName || 'Sem empresa')}
                      </div>
                    </div>
                    <div
                      className={classNames(
                        'rounded-full border px-2.5 py-1 text-[10px] uppercase tracking-[0.16em]',
                        getLeadGuidanceClass(guidance.level),
                      )}
                    >
                      {guidance.score}
                    </div>
                  </div>

                  <div className="mt-4 text-[11px] uppercase tracking-[0.18em] text-zinc-500">
                    {guidance.title}
                  </div>
                  <div className="mt-2 text-sm leading-6 text-zinc-300">{guidance.reason}</div>

                  <div className="mt-4 rounded-[18px] border border-white/10 bg-black/20 px-3 py-2.5 text-xs text-zinc-300">
                    Próxima ação: <span className="text-white">{guidance.action}</span>
                  </div>
                </button>
              ))
            )}
          </div>
        </CrmPanel>

        <CrmPanel className="p-4">
          <CrmSectionHeader
            eyebrow="CRM enterprise"
            title="Accounts, inbox, docs, routing e governança"
            description="Fundação enterprise para o CRM operar contas, comunicação, proposals, distribuição automática e forecast gerencial."
            action={
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setIsAccountWorkspaceOpen(true)}
                  className="rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-medium text-zinc-300 transition hover:bg-white/10 hover:text-white"
                >
                  Conta
                </button>
                <button
                  type="button"
                  onClick={() => setIsEngagementWorkspaceOpen(true)}
                  className="rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-medium text-zinc-300 transition hover:bg-white/10 hover:text-white"
                >
                  Inbox
                </button>
                <button
                  type="button"
                  onClick={() => setIsDocumentsWorkspaceOpen(true)}
                  className="rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-medium text-zinc-300 transition hover:bg-white/10 hover:text-white"
                >
                  Proposal
                </button>
                <button
                  type="button"
                  onClick={() => setIsRoutingWorkspaceOpen(true)}
                  className="rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-medium text-zinc-300 transition hover:bg-white/10 hover:text-white"
                >
                  Routing
                </button>
                <button
                  type="button"
                  onClick={() => setIsForecastWorkspaceOpen(true)}
                  className="rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-medium text-zinc-300 transition hover:bg-white/10 hover:text-white"
                >
                  Forecast
                </button>
              </div>
            }
          />

          <div className="grid gap-3 xl:grid-cols-5">
            <EnterpriseHubCard
              title="Accounts e contatos"
              eyebrow="Account intelligence"
              metric={`${accounts.length} conta(s)`}
              helper={
                primaryAccount
                  ? `${normalizeUiText(primaryAccount.name)} com ${(primaryAccount.contacts || accountContacts).length} stakeholder(s)`
                  : 'Estruture contas e múltiplos stakeholders por empresa.'
              }
              loading={loadingEnterpriseHub}
              rows={(primaryAccount?.contacts || accountContacts).slice(0, 3).map((contact) => ({
                label: normalizeUiText(contact.fullName),
                helper: normalizeUiText(contact.jobTitle || contact.email || 'Contato mapeado'),
                value: contact.isPrimary ? 'Primary' : 'Contato',
              }))}
              actionLabel="Gerenciar"
              onAction={() => setIsAccountWorkspaceOpen(true)}
            />

            <EnterpriseHubCard
              title="Inbox e cadências"
              eyebrow="Email sync"
              metric={`${mailboxes.length} mailbox(es)`}
              helper={
                mailboxes[0]
                  ? `${emailReadinessLabel} · ${connectedMailboxes.length}/${mailboxes.length} conectada(s)`
                  : primarySequence
                    ? `${emailTemplates.length} template(s) · ${normalizeUiText(primarySequence.name)}`
                    : 'Conecte caixas, templates e sequences reais.'
              }
              loading={loadingEnterpriseHub}
              rows={
                inboxMessages.length > 0
                  ? inboxMessages.slice(0, 3).map((message) => ({
                      label: normalizeUiText(message.subject),
                      helper: normalizeUiText(message.fromEmail || message.toEmail || 'Sem remetente'),
                      value: normalizeUiText(message.direction),
                    }))
                  : [
                      {
                        label: `${connectedMailboxes.length} mailbox(es) conectada(s)`,
                        helper: mailboxErrors[0]
                          ? normalizeUiText(mailboxErrors[0].errorMessage || 'Erro de sincronizacao')
                          : 'Pronto para sincronizar entrada e saida comercial',
                        value: emailReadinessLabel,
                      },
                    ]
              }
              actionLabel="Operar"
              onAction={() => setIsEngagementWorkspaceOpen(true)}
            />

            <EnterpriseHubCard
              title="Quotes e documentos"
              eyebrow="Proposal desk"
              metric={`${quotes.length} quote(s)`}
              helper={
                latestQuote
                  ? `${normalizeUiText(latestQuote.title)} · ${normalizeUiText(latestQuote.status)}`
                  : 'Gere quote, proposta, contrato e assinatura.'
              }
              loading={loadingEnterpriseHub}
              rows={documents.slice(0, 3).map((document) => ({
                label: normalizeUiText(document.title),
                helper: normalizeUiText(document.type),
                value: normalizeUiText(document.signatureStatus),
              }))}
              actionLabel="Gerar"
              onAction={() => setIsDocumentsWorkspaceOpen(true)}
            />

            <EnterpriseHubCard
              title="Routing e coaching"
              eyebrow="Auto-assignment"
              metric={`${routingRules.length} regra(s)`}
              helper={
                selectedEnterpriseLead
                  ? `Lead foco: ${normalizeUiText(selectedEnterpriseLead.name)}`
                  : 'Distribua leads automaticamente por regra e prioridade.'
              }
              loading={loadingEnterpriseHub}
              rows={conversationInsights.slice(0, 3).map((insight) => ({
                label: normalizeUiText(insight.sourceType),
                helper: normalizeUiText(insight.summaryText || 'Resumo de conversa'),
                value:
                  insight.sentimentScore !== null && insight.sentimentScore !== undefined
                    ? `${insight.sentimentScore}`
                    : 'IA',
              }))}
              actionLabel="Governar"
              onAction={() => setIsRoutingWorkspaceOpen(true)}
            />

            <EnterpriseHubCard
              title="Canais e execução"
              eyebrow="Omnichannel"
              metric={`${connectedChannelIntegrations.length} ativo(s)`}
              helper={
                latestInboundChannel?.lastInboundAt
                  ? `${omnichannelReadinessLabel} · ultimo inbound ${formatRelativeTime(latestInboundChannel.lastInboundAt)}`
                  : `${omnichannelReadinessLabel} · conecte WhatsApp, Instagram e Facebook`
              }
              loading={loadingEnterpriseHub}
              rows={
                channelIntegrations.length > 0
                  ? channelIntegrations.slice(0, 3).map((integration) => ({
                      label: normalizeUiText(integration.label),
                      helper: integration.lastInboundAt
                        ? `Inbound ${formatRelativeTime(integration.lastInboundAt)}`
                        : normalizeUiText(
                            integration.channelIdentifier || integration.provider,
                          ),
                      value: normalizeUiText(integration.status),
                    }))
                  : [
                      {
                        label: 'WhatsApp e social',
                        helper: 'Receba mensagens e atualize o lead em tempo real',
                        value: omnichannelReadinessLabel,
                      },
                    ]
              }
              actionLabel="Conectar"
              onAction={() => setIsEngagementWorkspaceOpen(true)}
            />
          </div>
        </CrmPanel>

        <CrmPanel className="p-4 md:p-5">
          <CrmSectionHeader
            eyebrow="Filtros inteligentes"
            title="Controle de leitura do CRM"
            description="Ajuste a visão comercial sem perder os indicadores principais da tela."
            action={
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setIsFiltersOpen((current) => !current)}
                  className="rounded-2xl border border-[#8B5CF6]/20 bg-[#8B5CF6]/10 px-4 py-2 text-xs font-medium text-white transition hover:bg-[#8B5CF6]/15"
                >
                  {isFiltersOpen ? 'Ocultar filtros' : 'Abrir filtros'}
                </button>
                <button
                  type="button"
                  onClick={resetFilters}
                  className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-xs text-zinc-300 transition hover:bg-white/10"
                >
                  Limpar filtros
                </button>
              </div>
            }
          />

          <div className="mb-4 grid gap-3 xl:grid-cols-[minmax(0,1.2fr)_minmax(320px,0.8fr)]">
            <div className="rounded-[28px] border border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(139,92,246,0.08),transparent_42%),linear-gradient(180deg,rgba(255,255,255,0.035),rgba(0,0,0,0.12))] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]">
              <div className="mb-3 text-[11px] uppercase tracking-[0.18em] text-zinc-500">
                Busca principal
              </div>
              <input
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Buscar por lead, empresa, email, telefone, origem ou responsável"
                className="w-full rounded-[24px] border border-white/10 bg-white/[0.04] px-4 py-3.5 text-sm text-white outline-none transition placeholder:text-zinc-500 focus:border-[#8B5CF6]/25 focus:bg-white/[0.07]"
              />
            </div>

            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <CompactFilterStat
                label="Status"
                value={statusFilter === 'ALL' ? 'Todos' : FILTER_STATUS_LABELS[statusFilter]}
              />
              <CompactFilterStat
                label="Responsável"
                value={
                  ownerFilter === 'ALL'
                    ? 'Todos'
                    : ownerOptions.find((item) => item.id === ownerFilter)?.name || 'Selecionado'
                }
              />
              <CompactFilterStat
                label="Fechamento"
                value={
                  expectedCloseDateFrom || expectedCloseDateTo
                    ? `${expectedCloseDateFrom ? formatDateShort(expectedCloseDateFrom) : '...'} - ${expectedCloseDateTo ? formatDateShort(expectedCloseDateTo) : '...'}`
                    : 'Todas datas'
                }
              />
              <CompactFilterStat
                label="Valor"
                value={
                  dealValueMin || dealValueMax
                    ? `${dealValueMin || '0'} - ${dealValueMax || '...'}`
                    : 'Todos os valores'
                }
              />
            </div>
          </div>

          {isFiltersOpen ? (
            <>
              <div className="mb-4 grid gap-3 rounded-[26px] border border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(139,92,246,0.08),transparent_42%),linear-gradient(180deg,rgba(255,255,255,0.035),rgba(0,0,0,0.12))] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)] xl:grid-cols-[minmax(0,1.15fr)_minmax(0,0.95fr)_auto_auto]">
            <div>
              <div className="mb-2 text-[11px] uppercase tracking-[0.18em] text-zinc-500">
                Visualizações salvas
              </div>
              <select
                value={selectedViewId}
                onChange={(event) => applyViewById(event.target.value)}
                className="w-full rounded-[22px] border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white outline-none transition focus:border-[#8B5CF6]/25 focus:bg-white/[0.07]"
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
                <div className="mb-2 text-[11px] uppercase tracking-[0.18em] text-zinc-500">
                  Salvar configuração
                </div>
                <input
                  value={newViewName}
                  onChange={(event) => setNewViewName(event.target.value)}
                  placeholder="Ex.: Prioridade alta"
                  className="w-full rounded-[22px] border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white outline-none transition placeholder:text-zinc-500 focus:border-[#8B5CF6]/25 focus:bg-white/[0.07]"
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
                className="self-end rounded-[22px] border border-[#8B5CF6]/20 bg-[#8B5CF6]/10 px-4 py-3 text-sm font-medium text-white transition hover:bg-[#8B5CF6]/15 disabled:cursor-not-allowed disabled:opacity-60"
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
                className="self-end rounded-[22px] border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-zinc-300 transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {deletingViewId === selectedViewId ? 'Excluindo...' : 'Excluir view'}
              </button>
            ) : (
              <div />
            )}
          </div>

          {loadingSavedViews ? (
            <div className="mb-4 text-xs text-zinc-500">
              Carregando visualizações salvas...
            </div>
          ) : null}

          <div className="grid gap-4 xl:grid-cols-[minmax(0,1.45fr)_minmax(300px,1fr)]">
            <div className="rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.035),rgba(0,0,0,0.12))] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)] md:p-5">
              <div className="mb-3 text-[11px] uppercase tracking-[0.18em] text-zinc-500">
                Busca
              </div>
              <input
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Buscar por lead, empresa, email, telefone, origem ou responsável"
                className="w-full rounded-[24px] border border-white/10 bg-white/[0.04] px-4 py-3.5 text-sm text-white outline-none transition placeholder:text-zinc-500 focus:border-[#8B5CF6]/25 focus:bg-white/[0.07]"
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
                label="Responsável"
                options={[
                  { id: 'ALL', label: 'Todos' },
                  ...ownerOptions.map((item) => ({ id: item.id, label: item.name })),
                ]}
                value={ownerFilter}
                onChange={setOwnerFilter}
              />
              <FilterGroup
                label="Próximo passo vencido"
                options={[
                  { id: 'ALL', label: 'Todos' },
                  { id: 'YES', label: 'Somente vencidos' },
                ]}
                value={overdueNextStepOnly}
                onChange={(value) => setOverdueNextStepOnly(value as 'ALL' | 'YES')}
              />
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
                onChange={(value) =>
                  setPriorityFilter(value as 'ALL' | 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT')
                }
              />
            </div>
          </div>

          <div className="mt-3 grid gap-3 md:grid-cols-2 2xl:grid-cols-4">
            <DateRangeFilterGroup
              label="Fechamento previsto"
              fromValue={expectedCloseDateFrom}
              toValue={expectedCloseDateTo}
              onFromChange={setExpectedCloseDateFrom}
              onToChange={setExpectedCloseDateTo}
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
            <RangeFilterGroup
              label="Probabilidade (%)"
              minValue={probabilityMin}
              maxValue={probabilityMax}
              minPlaceholder="Mín."
              maxPlaceholder="Máx."
              onMinChange={setProbabilityMin}
              onMaxChange={setProbabilityMax}
            />
            <FilterGroup
              label="Origem"
              options={[
                { id: 'ALL', label: 'Todas' },
                ...sourceOptions.map((item) => ({ id: item.id, label: item.name })),
              ]}
              value={sourceFilter}
              onChange={setSourceFilter}
            />
          </div>

          <div className="mt-3 grid gap-3 md:grid-cols-2 2xl:grid-cols-4">
            <FilterGroup
              label="Filial"
              options={[
                { id: 'ALL', label: 'Todas' },
                ...branchOptions.map((item) => ({ id: item.id, label: item.name })),
              ]}
              value={branchFilter}
              onChange={setBranchFilter}
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

          <div className="mt-3 grid gap-3 md:grid-cols-2">
            {departmentOptions.length > 0 ? (
              <FilterGroup
                label="Departamento"
                options={[
                  { id: 'ALL', label: 'Todos' },
                  ...departmentOptions.map((item) => ({ id: item.id, label: item.name })),
                ]}
                value={departmentFilter}
                onChange={setDepartmentFilter}
              />
            ) : null}
            <DateRangeFilterGroup
              label="Criação do lead"
              fromValue={createdAtFrom}
              toValue={createdAtTo}
              onFromChange={setCreatedAtFrom}
              onToChange={setCreatedAtTo}
            />
          </div>
            </>
          ) : null}
        </CrmPanel>

        {error ? (
          <div className="rounded-[24px] border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">
            {normalizeUiText(error)}
          </div>
        ) : null}

        <div className="grid gap-5 xl:grid-cols-[minmax(0,1.5fr)_minmax(360px,0.82fr)] 2xl:grid-cols-[minmax(0,1.55fr)_minmax(380px,0.82fr)]">
          <div ref={pipelineRef} className="min-w-0 space-y-5">
            <CrmPanel className="p-4 md:p-5">
              <CrmSectionHeader
                eyebrow="Inteligência do pipeline"
                title="Leitura financeira e operacional do funil"
                description="Veja quantidade, valor, forecast e risco médio por etapa."
              />

              <div className="grid gap-3 2xl:grid-cols-2">
                {pipelineTotals.map((item) => (
                  <div
                    key={item.status}
                    className="rounded-[22px] border border-white/10 bg-black/20 p-4"
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
                      <div
                        className={classNames('h-3 w-3 rounded-full', statusDotClass(item.status))}
                      />
                    </div>

                    <div className="mt-3 grid gap-3 sm:grid-cols-3">
                      <MiniStat
                        label="Valor"
                        value={canSeeValues ? formatMoney(item.totalValue) : 'Sem acesso'}
                      />
                      <MiniStat
                        label="Forecast"
                        value={canSeeValues ? formatMoney(item.forecast) : 'Sem acesso'}
                      />
                      <MiniStat label="Probabilidade" value={`${item.avgProbability}%`} />
                    </div>
                  </div>
                ))}
              </div>
            </CrmPanel>

            <CrmPanel className="p-4 md:p-5">
              <CrmSectionHeader
                eyebrow="Metas comerciais"
                title="Metas do time e da operação"
                description="Acompanhe o objetivo atual, progresso do forecast e metas cadastradas."
                action={
                  canCreateSalesTargets ? (
                    <button
                      type="button"
                      onClick={() => setIsSalesTargetOpen(true)}
                      className="rounded-2xl border border-[#8B5CF6]/20 bg-[#8B5CF6]/10 px-4 py-2 text-xs font-medium text-white transition hover:bg-[#8B5CF6]/15"
                    >
                      Nova meta
                    </button>
                  ) : null
                }
              />

              <div className="grid gap-3 xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
                <div className="rounded-[26px] border border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(139,92,246,0.08),transparent_40%),linear-gradient(180deg,rgba(255,255,255,0.035),rgba(0,0,0,0.12))] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]">
                  <div className="text-[11px] uppercase tracking-[0.18em] text-zinc-500">
                    Meta vigente
                  </div>

                  {!canReadSalesTargets ? (
                    <div className="mt-4 rounded-2xl border border-dashed border-white/10 bg-white/[0.03] px-4 py-8 text-center text-sm text-zinc-500">
                      Você não tem permissão para visualizar metas comerciais.
                    </div>
                  ) : currentSalesTarget ? (
                    <>
                      <div className="mt-3 text-2xl font-semibold tracking-[-0.03em] text-white">
                        {canSeeValues && currentSalesTarget.targetValue
                          ? formatMoney(currentSalesTarget.targetValue)
                          : currentSalesTarget.targetDeals
                            ? `${currentSalesTarget.targetDeals} negócio(s)`
                            : 'Meta cadastrada'}
                      </div>

                      <div className="mt-2 text-sm text-zinc-400">
                        {normalizeUiText(formatSalesTargetScope(currentSalesTarget))}
                      </div>

                      <div className="mt-2 text-xs text-zinc-500">
                        {formatSalesTargetPeriodLabel(currentSalesTarget.periodType)} ·{' '}
                        {formatDateShort(currentSalesTarget.periodStart)} até{' '}
                        {formatDateShort(currentSalesTarget.periodEnd)}
                      </div>

                      <div className="mt-4 rounded-[22px] border border-white/10 bg-black/20 p-3.5">
                        <div className="mb-2 flex items-center justify-between gap-3 text-xs text-zinc-400">
                          <span>Progresso do forecast</span>
                          <span className="text-white">{currentTargetProgress}%</span>
                        </div>
                        <div className="h-2 rounded-full bg-white/5">
                          <div
                            className="h-2 rounded-full bg-[linear-gradient(90deg,#8B5CF6,#C4B5FD)]"
                            style={{ width: `${Math.min(currentTargetProgress, 100)}%` }}
                          />
                        </div>
                      </div>

                      <div className="mt-3 grid gap-3 sm:grid-cols-2">
                        <MiniStat
                          label="Forecast atual"
                          value={canSeeValues ? formatMoney(totalForecast) : 'Sem acesso'}
                        />
                        <MiniStat label="Negócios em aberto" value={String(stats.pipeline)} />
                      </div>
                    </>
                  ) : (
                    <div className="mt-4 rounded-2xl border border-dashed border-white/10 bg-white/[0.03] px-4 py-8 text-center text-sm text-zinc-500">
                      Nenhuma meta comercial cadastrada para o período atual.
                    </div>
                  )}
                </div>

                <div className="rounded-[26px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.035),rgba(0,0,0,0.12))] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]">
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <div className="text-[11px] uppercase tracking-[0.18em] text-zinc-500">
                      Histórico de metas
                    </div>
                    <div className="text-xs text-zinc-500">
                      {loadingSalesTargets ? 'Carregando...' : `${salesTargets.length} meta(s)`}
                    </div>
                  </div>

                  {!canReadSalesTargets ? (
                    <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.03] px-4 py-8 text-center text-sm text-zinc-500">
                      Você não tem permissão para visualizar metas comerciais.
                    </div>
                  ) : (
                    <div className="crm-scroll max-h-[260px] space-y-2.5 overflow-y-auto pr-1">
                      {salesTargets.map((target) => (
                        <div
                          key={target.id}
                          className="rounded-[22px] border border-white/10 bg-white/[0.03] p-3.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <div className="text-sm font-medium text-white">
                                {canSeeValues && target.targetValue
                                  ? formatMoney(target.targetValue)
                                  : target.targetDeals
                                    ? `${target.targetDeals} negócio(s)`
                                    : 'Meta cadastrada'}
                              </div>
                              <div className="mt-1 text-xs text-zinc-500">
                                {formatSalesTargetPeriodLabel(target.periodType)} ·{' '}
                                {formatDateShort(target.periodStart)} até{' '}
                                {formatDateShort(target.periodEnd)}
                              </div>
                              <div className="mt-2 text-xs text-zinc-400">
                                {normalizeUiText(formatSalesTargetScope(target))}
                              </div>
                            </div>

                            {canDeleteSalesTargets ? (
                              <button
                                type="button"
                                onClick={() => void removeSalesTarget(target.id)}
                                disabled={deletingSalesTargetId === target.id}
                                className="rounded-2xl border border-red-500/20 bg-red-500/10 px-3 py-2 text-xs text-red-200 transition hover:bg-red-500/15 disabled:cursor-not-allowed disabled:opacity-60"
                              >
                                {deletingSalesTargetId === target.id ? 'Excluindo...' : 'Excluir'}
                              </button>
                            ) : null}
                          </div>
                        </div>
                      ))}

                      {!loadingSalesTargets && salesTargets.length === 0 ? (
                        <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.03] px-4 py-8 text-center text-sm text-zinc-500">
                          Nenhuma meta comercial cadastrada.
                        </div>
                      ) : null}
                    </div>
                  )}
                </div>
              </div>
            </CrmPanel>

            <CrmPanel className="p-4 md:p-5">
              <CrmSectionHeader
                eyebrow="Forecast management"
                title="Camadas de forecast da operação"
                description="Leitura gerencial de pipeline, best case, commit e receita ganha no recorte atual."
              />

              <div className="mb-3 grid gap-3 xl:grid-cols-4">
                {managementForecastSummary.categories.map((category) => (
                  <ExecutiveSpotlightCard
                    key={category.key}
                    label={category.label}
                    value={
                      canSeeValues ? formatMoney(category.forecastValue || category.totalValue) : `${category.count} lead(s)`
                    }
                    helper={`${category.count} oportunidade(s) · ${category.helper}`}
                    accent={category.key === 'commit' || category.key === 'won' ? 'success' : 'default'}
                  />
                ))}
              </div>

              <div className="grid gap-3 xl:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]">
                <ReportBarChartCard
                  title="Cobertura por categoria"
                  subtitle="Onde a receita está concentrada entre pipeline, best case, commit e ganhos."
                  rows={managementForecastSummary.categories.map((category) => ({
                    label: category.label,
                    value: canSeeValues ? category.forecastValue || category.totalValue : category.count,
                    helper: `${category.count} oportunidade(s)`,
                    valueLabel: canSeeValues
                      ? formatMoney(category.forecastValue || category.totalValue)
                      : `${category.count} lead(s)`,
                  }))}
                />

                <div className="rounded-[26px] border border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(139,92,246,0.07),transparent_38%),linear-gradient(180deg,rgba(255,255,255,0.04),rgba(0,0,0,0.14))] p-4 shadow-[0_18px_48px_rgba(0,0,0,0.18)]">
                  <div className="text-[11px] uppercase tracking-[0.18em] text-zinc-500">
                    Leitura de gestão
                  </div>
                  <div className="mt-3 space-y-3">
                    <MiniStat
                      label="Cobertura da meta"
                      value={
                        currentSalesTarget
                          ? `${managementForecastSummary.commitCoverage}% do target`
                          : 'Sem meta ativa'
                      }
                    />
                    <MiniStat
                      label="Gap até a meta"
                      value={
                        currentSalesTarget && canSeeValues
                          ? formatMoney(managementForecastSummary.gapValue)
                          : currentSalesTarget
                            ? 'Sem acesso'
                            : 'Não aplicável'
                      }
                    />
                    <MiniStat
                      label="Commit atual"
                      value={
                        canSeeValues
                          ? formatMoney(managementForecastSummary.commitValue)
                          : `${managementForecastSummary.categories.find((item) => item.key === 'commit')?.count || 0} lead(s)`
                      }
                    />
                    <MiniStat
                      label="Best case"
                      value={
                        canSeeValues
                          ? formatMoney(managementForecastSummary.bestCaseValue)
                          : `${managementForecastSummary.categories.find((item) => item.key === 'bestCase')?.count || 0} lead(s)`
                      }
                    />
                  </div>
                </div>
              </div>
            </CrmPanel>

            <CrmPanel className="p-4 md:p-5">
              <CrmSectionHeader
                eyebrow="Accounts intelligence"
                title="Contas com maior relevância no pipeline"
                description="Agrupa leads por empresa para dar visão de conta, cobertura e risco operacional."
              />

              <div className="grid gap-3 xl:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
                <div className="grid gap-3">
                  {accountIntelligence.length === 0 ? (
                    <div className="rounded-[24px] border border-dashed border-white/10 bg-white/[0.03] px-4 py-10 text-center text-sm text-zinc-500">
                      Sem contas suficientes no recorte atual.
                    </div>
                  ) : (
                    accountIntelligence.map((account) => (
                      <div
                        key={account.label}
                        className="rounded-[24px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.04),rgba(0,0,0,0.14))] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <div className="truncate text-sm font-medium text-white">
                              {account.label}
                            </div>
                            <div className="mt-1 text-xs text-zinc-500">
                              {account.openDeals} oportunidade(s) aberta(s) · {account.contacts} contato(s) · {account.owners} owner(s)
                            </div>
                          </div>
                          <div className="rounded-full border border-[#8B5CF6]/20 bg-[#8B5CF6]/10 px-2.5 py-1 text-[10px] uppercase tracking-[0.16em] text-[#E9DDFF]">
                            {account.averageProbability}% prob.
                          </div>
                        </div>

                        <div className="mt-3 grid gap-2.5 sm:grid-cols-3">
                          <MiniStat
                            label="Pipeline"
                            value={canSeeValues ? formatMoney(account.pipelineValue) : 'Sem acesso'}
                          />
                          <MiniStat
                            label="Forecast"
                            value={canSeeValues ? formatMoney(account.forecastValue) : 'Sem acesso'}
                          />
                          <MiniStat
                            label="Em atenção"
                            value={`${account.stalled} lead(s)`}
                          />
                        </div>
                      </div>
                    ))
                  )}
                </div>

                <div className="rounded-[26px] border border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(139,92,246,0.07),transparent_38%),linear-gradient(180deg,rgba(255,255,255,0.04),rgba(0,0,0,0.14))] p-4 shadow-[0_18px_48px_rgba(0,0,0,0.18)]">
                  <div className="text-[11px] uppercase tracking-[0.18em] text-zinc-500">
                    Governança do pipeline
                  </div>
                  <div className="mt-2 text-sm leading-6 text-zinc-400">
                    A camada de governança destaca os bloqueios que mais enfraquecem forecast, ownership e avanço de etapa.
                  </div>

                  <div className="mt-4 rounded-[22px] border border-white/10 bg-black/20 p-3.5">
                    <div className="mb-2 flex items-center justify-between gap-3 text-xs text-zinc-400">
                      <span>Readiness da operação</span>
                      <span className="text-white">{pipelineGovernanceSummary.readiness}%</span>
                    </div>
                    <div className="h-2 rounded-full bg-white/5">
                      <div
                        className="h-2 rounded-full bg-[linear-gradient(90deg,#8B5CF6,#DDD6FE)]"
                        style={{ width: `${pipelineGovernanceSummary.readiness}%` }}
                      />
                    </div>
                    <div className="mt-2 text-xs text-zinc-500">
                      {pipelineGovernanceSummary.openLeadsCount} oportunidade(s) abertas no recorte atual.
                    </div>
                  </div>

                  <div className="mt-4 space-y-2.5">
                    {pipelineGovernanceSummary.blockers.length === 0 ? (
                      <div className="rounded-[20px] border border-dashed border-white/10 bg-white/[0.03] px-4 py-6 text-sm text-zinc-500">
                        Nenhum bloqueio crítico encontrado neste recorte.
                      </div>
                    ) : (
                      pipelineGovernanceSummary.blockers.map((blocker) => (
                        <div
                          key={blocker.label}
                          className="rounded-[20px] border border-white/10 bg-white/[0.03] px-3.5 py-3"
                        >
                          <div className="flex items-center justify-between gap-3">
                            <div className="text-sm text-white">{blocker.label}</div>
                            <div className="text-sm font-medium text-white">{blocker.count}</div>
                          </div>
                          <div className="mt-1 text-xs leading-5 text-zinc-500">
                            {blocker.helper}
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  <div className="mt-4 rounded-[22px] border border-white/10 bg-black/20 p-3.5">
                    <div className="text-[11px] uppercase tracking-[0.18em] text-zinc-500">
                      Coaching comercial
                    </div>
                    <div className="mt-3 grid gap-2.5 sm:grid-cols-2">
                      <MiniStat
                        label="Insights recentes"
                        value={String(conversationCoachingSummary.total)}
                      />
                      <MiniStat
                        label="Cobertura de coaching"
                        value={`${conversationCoachingSummary.coachingCoverage}%`}
                      />
                      <MiniStat
                        label="Sentimento médio"
                        value={
                          conversationCoachingSummary.averageSentiment !== null
                            ? String(conversationCoachingSummary.averageSentiment)
                            : 'Sem score'
                        }
                      />
                      <MiniStat
                        label="Canal dominante"
                        value={conversationCoachingSummary.dominantSource}
                      />
                    </div>
                    <div className="mt-3 text-xs leading-5 text-zinc-400">
                      {conversationCoachingSummary.alert}
                    </div>
                  </div>
                </div>
              </div>
            </CrmPanel>

            <CrmPanel className="p-4 md:p-5">
              <CrmSectionHeader
                eyebrow="Reporting"
                title="Visibilidade gerencial do CRM"
                description="Conversão, aging, perdas e distribuição de valor reagem ao conjunto filtrado atual."
              />

              <div className="mb-3 grid gap-3 xl:grid-cols-3">
                <ReportBarChartCard
                  title="Conversão por etapa"
                  subtitle="Taxa de avanço do pipeline filtrado"
                  accent="purple"
                  rows={stageConversionReport.map((item) => ({
                    label: STATUS_LABELS[item.label as LeadStatus] || item.label,
                    value: item.rate || 0,
                    helper: `${item.count} lead(s)`,
                    valueLabel: `${item.rate || 0}%`,
                  }))}
                />
                <ReportBarChartCard
                  title="Valor por origem"
                  subtitle="Canais com maior peso financeiro"
                  accent="blue"
                  rows={sourceConversionReport.map((item) => ({
                    label: item.label,
                    value: item.value || 0,
                    helper: `${item.count} lead(s) · ${item.rate || 0}% conv.`,
                    valueLabel: canSeeValues ? formatMoney(item.value) : 'Sem acesso',
                  }))}
                />
                <WonLostTrendCard
                  title="Ganhos e perdas por período"
                  subtitle="Ritmo recente do fechamento comercial"
                  rows={wonLostByPeriodReport}
                />
              </div>

              <div className="grid gap-3 2xl:grid-cols-2">
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
                    helper: `${item.count} lead(s) · ${
                      canSeeValues ? formatMoney(item.value) : 'Sem acesso'
                    }`,
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

            <CrmPanel className="p-4 md:p-5">
              <CrmSectionHeader
                eyebrow="Pipeline"
                title="Kanban executivo de oportunidades"
                description="Cards com valor, probabilidade, prioridade, origem e ritmo comercial."
              />

              {canUseBulkActions ? (
                <div className="mb-4 grid gap-2.5 rounded-[20px] border border-white/10 bg-black/20 p-3 xl:grid-cols-[minmax(140px,auto)_minmax(220px,auto)_minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)]">
                  <div className="self-end text-sm text-zinc-300">
                    {selectedLeadCount} lead(s) selecionado(s)
                  </div>
                  <div className="flex flex-wrap items-end gap-2">
                    <button
                      type="button"
                      onClick={selectFilteredLeads}
                      disabled={
                        filteredLeads.length === 0 ||
                        selectedLeadCount === filteredLeads.length
                      }
                        className="rounded-2xl border border-white/10 bg-white/5 px-3.5 py-2.5 text-sm text-zinc-300 transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      Selecionar filtrados
                    </button>
                    <button
                      type="button"
                      onClick={clearSelection}
                      disabled={selectedLeadCount === 0}
                        className="rounded-2xl border border-white/10 bg-white/5 px-3.5 py-2.5 text-sm text-zinc-300 transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      Limpar
                    </button>
                  </div>

                  <div className="grid gap-2">
                    <div className="text-[11px] uppercase tracking-[0.18em] text-zinc-500">
                      Status em lote
                    </div>
                    <div className="flex gap-2">
                      <select
                        value={bulkStatusValue}
                        onChange={(event) =>
                          setBulkStatusValue(event.target.value as 'ALL' | LeadStatus)
                        }
                        className="w-full rounded-2xl border border-white/10 bg-white/5 px-3.5 py-2.5 text-sm text-white outline-none transition focus:border-[#8B5CF6]/25 focus:bg-white/[0.07]"
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
                        disabled={
                          selectedLeadCount === 0 ||
                          bulkStatusValue === 'ALL' ||
                          savingBulkAction
                        }
                        className="rounded-2xl border border-[#8B5CF6]/20 bg-[#8B5CF6]/10 px-3.5 py-2.5 text-sm font-medium text-white transition hover:bg-[#8B5CF6]/15 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        Aplicar
                      </button>
                    </div>
                  </div>

                  <div className="grid gap-2">
                    <div className="text-[11px] uppercase tracking-[0.18em] text-zinc-500">
                      Responsável em lote
                    </div>
                    <div className="flex gap-2">
                      <select
                        value={bulkOwnerValue}
                        onChange={(event) => setBulkOwnerValue(event.target.value)}
                        className="w-full rounded-2xl border border-white/10 bg-white/5 px-3.5 py-2.5 text-sm text-white outline-none transition focus:border-[#8B5CF6]/25 focus:bg-white/[0.07]"
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
                        disabled={
                          selectedLeadCount === 0 ||
                          bulkOwnerValue === 'ALL' ||
                          savingBulkAction
                        }
                        className="rounded-2xl border border-[#8B5CF6]/20 bg-[#8B5CF6]/10 px-3.5 py-2.5 text-sm font-medium text-white transition hover:bg-[#8B5CF6]/15 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        Aplicar
                      </button>
                    </div>
                  </div>

                  <div className="grid gap-2">
                    <div className="text-[11px] uppercase tracking-[0.18em] text-zinc-500">
                      Prioridade em lote
                    </div>
                    <div className="flex gap-2">
                      <select
                        value={bulkPriorityValue}
                        onChange={(event) =>
                          setBulkPriorityValue(
                            event.target.value as 'ALL' | 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT',
                          )
                        }
                        className="w-full rounded-2xl border border-white/10 bg-white/5 px-3.5 py-2.5 text-sm text-white outline-none transition focus:border-[#8B5CF6]/25 focus:bg-white/[0.07]"
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
                        disabled={
                          selectedLeadCount === 0 ||
                          bulkPriorityValue === 'ALL' ||
                          savingBulkAction
                        }
                        className="rounded-2xl border border-[#8B5CF6]/20 bg-[#8B5CF6]/10 px-3.5 py-2.5 text-sm font-medium text-white transition hover:bg-[#8B5CF6]/15 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        Aplicar
                      </button>
                    </div>
                  </div>
                </div>
              ) : null}

              {loading ? (
                <div className="crm-scroll-x w-full max-w-full overflow-x-auto pb-3">
                    <div className="flex w-max min-w-max gap-4">
                    {STATUS_ORDER.map((status) => (
                      <div
                        key={status}
                        className="w-[320px] min-w-[320px] max-w-[320px] shrink-0 rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.04),rgba(0,0,0,0.12))] p-4"
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
                  <div className="flex w-max min-w-max gap-4">
                    {STATUS_ORDER.map((status) => {
                      const stageLeads = pipelineGroups[status];
                      const stageValue = stageLeads.reduce(
                        (sum, lead) => sum + parseMoney(lead.dealValue),
                        0,
                      );

                      return (
                        <div
                          key={status}
                          className="crm-scroll flex max-h-[76vh] w-[320px] min-w-[320px] max-w-[320px] shrink-0 flex-col overflow-y-auto overflow-x-hidden rounded-[28px] border border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(139,92,246,0.08),transparent_28%),linear-gradient(180deg,rgba(255,255,255,0.04),rgba(0,0,0,0.12))] p-4 shadow-[0_18px_42px_rgba(0,0,0,0.16)]"
                        >
                          <div className="sticky top-0 z-10 -mx-1 mb-3 rounded-[22px] border border-white/10 bg-[#090B0C]/92 px-3.5 py-3.5 backdrop-blur">
                            <div className="pointer-events-none absolute inset-x-8 top-0 h-px bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.16),transparent)]" />
                            <div className="flex items-center justify-between gap-3">
                              <div className="min-w-0">
                                <div className="truncate text-xs uppercase tracking-[0.18em] text-zinc-500">
                                  {STATUS_LABELS[status]}
                                </div>
                                <div className="mt-1 text-[15px] font-semibold tracking-[-0.03em] text-white">
                                  {stageLeads.length} lead(s)
                                </div>
                              </div>
                              <div
                                className={classNames(
                                  'h-3 w-3 shrink-0 rounded-full shadow-[0_0_12px_rgba(255,255,255,0.16)]',
                                  statusDotClass(status),
                                )}
                              />
                            </div>
                            <div className="mt-3 grid gap-2.5 sm:grid-cols-2">
                              <div className="rounded-[18px] border border-white/10 bg-white/[0.03] px-3 py-2.5">
                                <div className="text-[10px] uppercase tracking-[0.18em] text-zinc-500">
                                  Valor da etapa
                                </div>
                                <div className="mt-1.5 break-words text-[15px] font-semibold tracking-[-0.03em] text-white">
                                  {canSeeValues ? formatMoney(stageValue) : 'Sem acesso'}
                                </div>
                              </div>
                              <div className="rounded-[18px] border border-white/10 bg-white/[0.03] px-3 py-2.5">
                                <div className="text-[10px] uppercase tracking-[0.18em] text-zinc-500">
                                  Ticket medio
                                </div>
                                <div className="mt-1.5 break-words text-[15px] font-semibold tracking-[-0.03em] text-white">
                                  {canSeeValues && stageLeads.length > 0
                                    ? formatMoney(stageValue / stageLeads.length)
                                    : 'Sem acesso'}
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="space-y-3">
                            {stageLeads.length === 0 ? (
                              <div className="rounded-[22px] border border-dashed border-white/10 bg-white/[0.03] px-4 py-8 text-center text-sm text-zinc-500">
                                Nenhum lead nesta etapa
                              </div>
                            ) : (
                              stageLeads.map((lead) => {
                                const score = getLeadScore(lead, [], []);
                                const guidance = getLeadGuidance(lead, [], []);
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
                                      'group relative w-full overflow-hidden rounded-[24px] border border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.05),transparent_38%),linear-gradient(180deg,rgba(255,255,255,0.05),rgba(255,255,255,0.02))] p-3.5 text-left shadow-[0_14px_34px_rgba(0,0,0,0.16)] transition hover:-translate-y-0.5 hover:border-[#8B5CF6]/20 hover:shadow-[0_16px_38px_rgba(0,0,0,0.26)]',
                                      isLeadSelected(lead.id)
                                        ? 'border-[#8B5CF6]/25 shadow-[0_12px_32px_rgba(139,92,246,0.08)]'
                                        : '',
                                    )}
                                  >
                                    <div className="pointer-events-none absolute inset-x-6 top-0 h-px bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.14),transparent)] opacity-0 transition group-hover:opacity-100" />
                                    <div className="flex items-start justify-between gap-3">
                                      <div className="min-w-0">
                                        <div className="truncate text-sm font-semibold tracking-[-0.02em] text-white">
                                          {normalizeUiText(lead.name)}
                                        </div>
                                        <div className="mt-1 truncate text-xs text-zinc-500">
                                          {normalizeUiText(
                                            lead.companyName ||
                                              lead.email ||
                                              lead.phone ||
                                              'Sem empresa',
                                          )}
                                        </div>
                                      </div>
                                        <div className="flex shrink-0 items-center gap-1.5">
                                        {canUseBulkActions ? (
                                          <button
                                            type="button"
                                            onClick={(event) => {
                                              event.stopPropagation();
                                              toggleLeadSelection(lead.id);
                                            }}
                                            className={classNames(
                                              'flex h-7 w-7 items-center justify-center rounded-full border text-xs transition',
                                              isLeadSelected(lead.id)
                                                ? 'border-[#8B5CF6]/25 bg-[#8B5CF6]/10 text-white'
                                                : 'border-white/10 bg-white/5 text-zinc-300 hover:bg-white/10',
                                            )}
                                            aria-label={
                                              isLeadSelected(lead.id)
                                                ? 'Remover seleção'
                                                : 'Selecionar lead'
                                            }
                                          >
                                            {isLeadSelected(lead.id) ? '✓' : '+'}
                                          </button>
                                        ) : null}
                                        <div
                                          className={classNames(
                                            'max-w-full truncate',
                                            statusBadge(lead.status),
                                          )}
                                        >
                                          {STATUS_LABELS[lead.status]}
                                        </div>
                                      </div>
                                    </div>

                                    <div className="mt-3 grid gap-2.5 sm:grid-cols-2">
                                      <LeadMiniInfo
                                        label="Valor"
                                        value={
                                          canSeeValues
                                            ? formatMoney(
                                                lead.dealValue,
                                                lead.currency || 'BRL',
                                              )
                                            : 'Sem acesso'
                                        }
                                      />
                                      <LeadMiniInfo
                                        label="Forecast"
                                        value={
                                          canSeeValues
                                            ? formatMoney(forecast, lead.currency || 'BRL')
                                            : 'Sem acesso'
                                        }
                                      />
                                    </div>

                                    <div className="mt-3 rounded-[20px] border border-white/10 bg-black/20 px-3 py-2.5">
                                      <div className="mb-1 flex items-center justify-between gap-3 text-[11px] uppercase tracking-[0.16em] text-zinc-500">
                                        <span className="min-w-0">Probabilidade</span>
                                        <span className="shrink-0 text-white">
                                          {probability}%
                                        </span>
                                      </div>
                                      <div className="h-2 rounded-full bg-white/5">
                                        <div
                                          className="h-2 rounded-full bg-[linear-gradient(90deg,#8B5CF6,#C4B5FD)]"
                                          style={{ width: `${probability}%` }}
                                        />
                                      </div>
                                    </div>

                                    <div className="mt-3 flex flex-wrap gap-2">
                                      <span
                                        className={classNames(
                                          'max-w-full break-words rounded-full border px-2.5 py-1 text-[10px]',
                                          getLeadGuidanceClass(guidance.level),
                                        )}
                                      >
                                        {guidance.title}
                                      </span>
                                      <span
                                        className={classNames(
                                          'max-w-full break-words rounded-full border px-2.5 py-1 text-[10px]',
                                          getTemperatureChipClass(temperature),
                                        )}
                                      >
                                        {temperature}
                                      </span>
                                      <span
                                        className={classNames(
                                          'max-w-full break-words rounded-full border px-2.5 py-1 text-[10px]',
                                          getLeadHealthClass(
                                            getLastActivity(lead),
                                            lead.status,
                                          ),
                                        )}
                                      >
                                        {health}
                                      </span>
                                      <span
                                        className={classNames(
                                          'max-w-full break-words rounded-full border px-2.5 py-1 text-[10px]',
                                          priorityClass(lead.priority),
                                        )}
                                      >
                                        Prioridade {formatPriority(lead.priority)}
                                      </span>
                                    </div>

                                    <div className="mt-3 rounded-[20px] border border-white/10 bg-[linear-gradient(180deg,rgba(139,92,246,0.05),rgba(255,255,255,0.02))] px-3 py-2.5">
                                      <div className="text-[11px] uppercase tracking-[0.16em] text-zinc-500">
                                        Guided selling
                                      </div>
                                      <div className="mt-1 break-words text-sm text-white">
                                        {guidance.action}
                                      </div>
                                      <div className="mt-1 text-xs leading-5 text-zinc-500">
                                        {guidance.reason}
                                      </div>
                                    </div>

                                    <div className="mt-3 grid gap-2 rounded-[20px] border border-white/10 bg-black/20 px-3 py-2.5 text-xs text-zinc-400">
                                      <div className="flex min-w-0 items-center justify-between gap-2">
                                        <span className="shrink-0">Responsável</span>
                                        <span className="min-w-0 truncate text-right text-zinc-200">
                                          {normalizeUiText(
                                            lead.ownerUser?.name || 'Não definido',
                                          )}
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
                                        <span
                                          className={classNames(
                                            'min-w-0 text-right',
                                            isStalled ? 'text-amber-200' : 'text-zinc-200',
                                          )}
                                        >
                                          {formatRelativeTime(getLastActivity(lead))}
                                        </span>
                                      </div>
                                      <div className="flex min-w-0 items-center justify-between gap-2">
                                        <span className="shrink-0">Fechamento previsto</span>
                                        <span className="min-w-0 text-right text-zinc-200">
                                          {lead.expectedCloseDate
                                            ? formatDateShort(lead.expectedCloseDate)
                                            : 'Sem previsão'}
                                        </span>
                                      </div>
                                    </div>

                                    {lead.nextStep ? (
                                      <div className="mt-3 rounded-[20px] border border-white/10 bg-[linear-gradient(180deg,rgba(139,92,246,0.05),rgba(255,255,255,0.02))] px-3 py-2.5">
                                        <div className="text-[11px] uppercase tracking-[0.16em] text-zinc-500">
                                          Próximo passo
                                        </div>
                                        <div className="mt-1 break-words text-sm text-white">
                                          {normalizeUiText(lead.nextStep)}
                                        </div>
                                        {lead.nextStepDueAt ? (
                                          <div className="mt-1 text-xs text-zinc-500">
                                            Prazo: {formatDateShort(lead.nextStepDueAt)}
                                          </div>
                                        ) : null}
                                      </div>
                                    ) : null}

                                    {isStalled ? (
                                      <div className="mt-3 rounded-2xl border border-amber-300/20 bg-amber-300/10 px-3 py-2 text-xs text-amber-100">
                                        Lead em atenção: sem atividade recente há{' '}
                                        {daysSince(getLastActivity(lead))} dia(s).
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

          <div className="min-w-0 space-y-5 xl:sticky xl:top-6 xl:self-start">
            <CrmPanel className="p-4 md:p-5">
              <CrmSectionHeader
                eyebrow="Central de comando"
                title="Resumo operacional do CRM"
                description="Leitura rápida da operação comercial filtrada."
              />

              <div className="grid gap-2.5 sm:grid-cols-2 xl:grid-cols-1">
                <SidebarMetric
                  label="Pipeline total"
                  value={canSeeValues ? formatMoney(totalPipelineValue) : 'Sem acesso'}
                />
                <SidebarMetric
                  label="Forecast ponderado"
                  value={canSeeValues ? formatMoney(totalForecast) : 'Sem acesso'}
                />
                <SidebarMetric
                  label="Conversão atual"
                  value={`${stats.conversionRate}%`}
                />
                <SidebarMetric
                  label="Leads novos no mês"
                  value={String(stats.newThisMonth)}
                />
                <SidebarMetric label="Total encontrado" value={String(total)} />
                <SidebarMetric label="Páginas" value={String(totalPages)} />
                <SidebarMetric label="Página atual" value={`${page} / ${totalPages || 1}`} />
                <SidebarMetric label="Itens por página" value={String(pageSize)} />
              </div>

              <div className="mt-4 rounded-[24px] border border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(139,92,246,0.08),transparent_42%),linear-gradient(180deg,rgba(255,255,255,0.035),rgba(0,0,0,0.12))] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]">
                <div className="text-[11px] uppercase tracking-[0.18em] text-zinc-500">
                  Insight prioritário
                </div>
                <div className="mt-2.5 text-[15px] font-medium leading-6 text-white">
                  {stats.stalledLeads > 0
                    ? `Recupere ${stats.stalledLeads} lead(s) em atenção para proteger o forecast.`
                    : 'O pipeline está com ritmo saudável e sem gargalos críticos agora.'}
                </div>
                <div className="mt-2 text-xs leading-5 text-zinc-500">
                  A etapa com maior concentração é {STATUS_LABELS[dominantStatus]}. Foque no
                  avanço das oportunidades com maior valor e probabilidade.
                </div>
              </div>

              <div className="mt-4 rounded-[24px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.035),rgba(0,0,0,0.12))] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]">
                <div className="text-[11px] uppercase tracking-[0.18em] text-zinc-500">
                  Quem precisa agir hoje
                </div>

                <div className="mt-3 space-y-2.5">
                  {ownerExecutionSignals.length === 0 ? (
                    <div className="rounded-[20px] border border-dashed border-white/10 bg-white/[0.03] px-3.5 py-4 text-sm text-zinc-500">
                      Sem sinais suficientes por responsável neste recorte.
                    </div>
                  ) : (
                    ownerExecutionSignals.map((owner) => (
                      <div
                        key={owner.name}
                        className="rounded-[20px] border border-white/10 bg-black/20 px-3.5 py-3"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <div className="truncate text-sm font-medium text-white">
                              {normalizeUiText(owner.name)}
                            </div>
                            <div className="mt-1 text-xs text-zinc-500">
                              {owner.stalled} lead(s) parados · {owner.tasks} tarefa(s) aberta(s)
                            </div>
                          </div>
                          <div className="rounded-full border border-[#8B5CF6]/20 bg-[#8B5CF6]/10 px-2.5 py-1 text-[10px] uppercase tracking-[0.16em] text-[#E9DDFF]">
                            score {owner.score}
                          </div>
                        </div>

                        <div className="mt-2 text-xs leading-5 text-zinc-400">
                          {canSeeValues
                            ? `${formatMoney(owner.pipelineValue)} em pipeline sob gestão.`
                            : 'Pipeline sob gestão sem acesso a valores.'}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </CrmPanel>

            <CrmPanel className="p-4 md:p-5">
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
                <div className="-mt-1 mb-4 flex flex-wrap justify-end gap-2">
                  {canMarkLeadOutcome ? (
                    <>
                      <button
                        type="button"
                        onClick={() => openWonFlow(selectedLead)}
                        className="rounded-2xl border border-[#8B5CF6]/20 bg-[#8B5CF6]/10 px-3.5 py-2 text-xs text-white transition hover:bg-[#8B5CF6]/15"
                      >
                        Marcar como ganho
                      </button>
                      <button
                        type="button"
                        onClick={() => openLostFlow(selectedLead)}
                        className="rounded-2xl border border-red-500/20 bg-red-500/10 px-3.5 py-2 text-xs text-red-200 transition hover:bg-red-500/15"
                      >
                        Marcar como perdido
                      </button>
                    </>
                  ) : null}
                  {canEditLead ? (
                    <button
                      type="button"
                      onClick={() => openEditLead(selectedLead)}
                       className="rounded-2xl border border-white/10 bg-white/5 px-3.5 py-2 text-xs text-zinc-300 transition hover:bg-white/10"
                    >
                      Editar lead
                    </button>
                  ) : null}
                </div>
              ) : null}

              {selectedLead && canChangeLeadStatus ? (
                 <div className="mb-4 rounded-[24px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.035),rgba(0,0,0,0.12))] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]">
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <div className="text-[11px] uppercase tracking-[0.18em] text-zinc-500">
                      Status do lead
                    </div>
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

              {selectedLead ? (
                <div className="mb-4 rounded-[24px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.035),rgba(0,0,0,0.12))] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]">
                  <div className="mb-3 flex items-start justify-between gap-3">
                    <div>
                      <div className="text-[11px] uppercase tracking-[0.18em] text-zinc-500">
                        Conversation intelligence
                      </div>
                      <div className="mt-2 text-[15px] font-medium leading-6 text-white">
                        Coaching e sinais da conversa comercial
                      </div>
                    </div>
                    <div className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[10px] uppercase tracking-[0.16em] text-zinc-300">
                      {conversationCoachingSummary.total} insight(s)
                    </div>
                  </div>

                  <div className="grid gap-2.5 sm:grid-cols-3">
                    <MiniStat
                      label="Sentimento médio"
                      value={
                        conversationCoachingSummary.averageSentiment !== null
                          ? String(conversationCoachingSummary.averageSentiment)
                          : 'Sem score'
                      }
                    />
                    <MiniStat
                      label="Cobertura de coaching"
                      value={`${conversationCoachingSummary.coachingCoverage}%`}
                    />
                    <MiniStat
                      label="Canal dominante"
                      value={conversationCoachingSummary.dominantSource}
                    />
                  </div>

                  <div className="mt-3 rounded-[18px] border border-white/10 bg-black/20 px-3 py-3 text-sm text-zinc-300">
                    {conversationCoachingSummary.alert}
                  </div>
                </div>
              ) : null}

              {selectedLead ? (
                <div className="mb-4 rounded-[24px] border border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(139,92,246,0.08),transparent_42%),linear-gradient(180deg,rgba(255,255,255,0.035),rgba(0,0,0,0.12))] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]">
                  <div className="mb-3 flex items-start justify-between gap-3">
                    <div>
                      <div className="text-[11px] uppercase tracking-[0.18em] text-zinc-500">
                        Próxima melhor ação
                      </div>
                      <div className="mt-2 text-[15px] font-medium leading-6 text-white">
                        {selectedLeadGuidance.title}
                      </div>
                    </div>
                    <div
                      className={classNames(
                        'rounded-full border px-2.5 py-1 text-[10px] uppercase tracking-[0.16em]',
                        getLeadGuidanceClass(selectedLeadGuidance.level),
                      )}
                    >
                      {selectedLeadGuidance.score}
                    </div>
                  </div>

                  <div className="text-sm leading-6 text-zinc-300">
                    {selectedLeadGuidance.reason}
                  </div>

                  <div className="mt-3 rounded-[18px] border border-white/10 bg-black/20 px-3 py-3">
                    <div className="text-[11px] uppercase tracking-[0.16em] text-zinc-500">
                      Execução recomendada
                    </div>
                    <div className="mt-1.5 text-sm font-medium text-white">
                      {selectedLeadGuidance.action}
                    </div>
                  </div>
                </div>
              ) : null}

                  {selectedLead && selectedLeadReadiness ? (
                <div className="mb-4 rounded-[24px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.035),rgba(0,0,0,0.12))] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]">
                  <div className="mb-3 flex items-start justify-between gap-3">
                    <div>
                      <div className="text-[11px] uppercase tracking-[0.18em] text-zinc-500">
                        Governança da etapa
                      </div>
                      <div className="mt-2 text-[15px] font-medium leading-6 text-white">
                        {selectedLeadReadiness.label}
                      </div>
                    </div>
                    <div className="rounded-full border border-[#8B5CF6]/20 bg-[#8B5CF6]/10 px-2.5 py-1 text-[10px] uppercase tracking-[0.16em] text-[#E9DDFF]">
                      {selectedLeadReadiness.score}
                    </div>
                  </div>

                  {selectedLeadReadiness.warnings.length === 0 ? (
                    <div className="rounded-[18px] border border-[#8B5CF6]/20 bg-[#8B5CF6]/10 px-3 py-3 text-sm text-[#E9DDFF]">
                      O lead está com os sinais mínimos de prontidão preenchidos para avançar no pipeline.
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {selectedLeadReadiness.warnings.map((warning) => (
                        <div
                          key={warning}
                          className="rounded-[18px] border border-white/10 bg-black/20 px-3 py-2.5 text-sm text-zinc-300"
                        >
                          {warning}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : null}

              {selectedLead ? (
                <div className="mb-4 rounded-[24px] border border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(139,92,246,0.08),transparent_42%),linear-gradient(180deg,rgba(255,255,255,0.035),rgba(0,0,0,0.12))] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]">
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <div>
                      <div className="text-[11px] uppercase tracking-[0.18em] text-zinc-500">
                        Playbooks comerciais
                      </div>
                      <div className="mt-2 text-[15px] font-medium leading-6 text-white">
                        Cadência sugerida para {STATUS_LABELS[selectedLead.status]}
                      </div>
                    </div>
                    <div className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[10px] uppercase tracking-[0.16em] text-zinc-300">
                      {getStagePlaybook(selectedLead.status).length} ação(ões)
                    </div>
                  </div>

                  <div className="space-y-2.5">
                    {getStagePlaybook(selectedLead.status).map((preset) => (
                      <button
                        key={`${selectedLead.status}-${preset.title}`}
                        type="button"
                        onClick={() => applyPlaybookPreset(preset)}
                        className="w-full rounded-[18px] border border-white/10 bg-black/20 px-3 py-3 text-left transition hover:border-[#8B5CF6]/20 hover:bg-[#8B5CF6]/10"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <div className="text-sm font-medium text-white">{preset.title}</div>
                            <div className="mt-1 text-xs leading-5 text-zinc-400">
                              {preset.helper}
                            </div>
                          </div>
                          <div className="rounded-full border border-white/10 bg-white/5 px-2 py-1 text-[10px] uppercase tracking-[0.16em] text-zinc-300">
                            {preset.mode === 'activity' ? 'Template' : `T+${preset.dueInDays}`}
                          </div>
                        </div>
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
                <div className="space-y-4">
                  <div className="grid gap-2.5 sm:grid-cols-2">
                    <SidebarMetric
                      label="Valor"
                      value={
                        canSeeValues
                          ? formatMoney(selectedLead.dealValue, selectedLead.currency || 'BRL')
                          : 'Sem acesso'
                      }
                    />
                    <SidebarMetric
                      label="Probabilidade"
                      value={`${normalizeProbability(selectedLead)}%`}
                    />
                    <SidebarMetric
                      label="Origem"
                      value={normalizeUiText(selectedLead.source || 'Não informada')}
                    />
                    <SidebarMetric
                      label="Prioridade"
                      value={formatPriority(selectedLead.priority)}
                    />
                    <SidebarMetric
                      label="Última atividade"
                      value={formatRelativeTime(getLastActivity(selectedLead))}
                    />
                    <SidebarMetric
                      label="Fechamento previsto"
                      value={
                        selectedLead.expectedCloseDate
                          ? formatDateShort(selectedLead.expectedCloseDate)
                          : 'Sem previsão'
                      }
                    />
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="h-full rounded-[24px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.035),rgba(0,0,0,0.12))] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]">
                      <div className="text-[11px] uppercase tracking-[0.18em] text-zinc-500">
                        Contato e empresa
                      </div>
                      <div className="mt-3 space-y-1.5 text-sm text-zinc-300">
                        <LeadDetailRow
                          label="Cargo"
                          value={selectedLead.jobTitle}
                          fallback="Não informado"
                        />
                        <LeadDetailRow
                          label="WhatsApp"
                          value={selectedLead.whatsapp}
                          fallback="Não informado"
                        />
                        <LeadDetailRow
                          label="Website"
                          value={selectedLead.website}
                          fallback="Não informado"
                        />
                        <LeadDetailRow
                          label="Localidade"
                          value={[selectedLead.city, selectedLead.state]
                            .filter(Boolean)
                            .join(' / ')}
                          fallback="Não informada"
                        />
                        <LeadDetailRow
                          label="Segmento"
                          value={selectedLead.industry}
                          fallback="Não informado"
                        />
                        <LeadDetailRow
                          label="Porte"
                          value={selectedLead.companySize}
                          fallback="Não informado"
                        />
                      </div>
                    </div>

                    <div className="h-full rounded-[24px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.035),rgba(0,0,0,0.12))] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]">
                      <div className="text-[11px] uppercase tracking-[0.18em] text-zinc-500">
                        Contexto comercial
                      </div>
                      <div className="mt-3 space-y-1.5 text-sm text-zinc-300">
                        <LeadDetailRow
                          label="Detalhe da origem"
                          value={selectedLead.sourceDetail}
                          fallback="Não informado"
                        />
                        <LeadDetailRow
                          label="Concorrente"
                          value={selectedLead.competitor}
                          fallback="Não informado"
                        />
                        <LeadDetailRow
                          label="Motivo de ganho"
                          value={selectedLead.wonReason}
                          fallback="Não informado"
                        />
                      </div>
                    </div>
                  </div>

                  {selectedAccountSummary ? (
                    <div className="rounded-[24px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.035),rgba(0,0,0,0.12))] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]">
                      <div className="mb-3 text-[11px] uppercase tracking-[0.18em] text-zinc-500">
                        Account intelligence
                      </div>
                      <div className="text-sm font-medium text-white">{selectedAccountSummary.name}</div>
                      <div className="mt-1 text-xs leading-5 text-zinc-500">
                        Visão consolidada da conta com base nos leads cadastrados no CRM.
                      </div>
                      <div className="mt-3 grid gap-2.5 sm:grid-cols-2 xl:grid-cols-4">
                        <MiniStat
                          label="Stakeholders"
                          value={String(selectedAccountSummary.stakeholders)}
                        />
                        <MiniStat
                          label="Oportunidades"
                          value={String(selectedAccountSummary.openDeals)}
                        />
                        <MiniStat
                          label="Pipeline"
                          value={
                            canSeeValues
                              ? formatMoney(selectedAccountSummary.pipelineValue)
                              : 'Sem acesso'
                          }
                        />
                        <MiniStat
                          label="Forecast"
                          value={
                            canSeeValues
                              ? formatMoney(selectedAccountSummary.forecastValue)
                              : 'Sem acesso'
                          }
                        />
                      </div>
                    </div>
                  ) : null}

                  {selectedLeadRoutingSuggestion ? (
                    <div className="rounded-[24px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.035),rgba(0,0,0,0.12))] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]">
                      <div className="mb-3 text-[11px] uppercase tracking-[0.18em] text-zinc-500">
                        Routing intelligence
                      </div>
                      <div className="text-sm font-medium text-white">
                        Owner sugerido: {selectedLeadRoutingSuggestion.name}
                      </div>
                      <div className="mt-1 text-xs leading-5 text-zinc-500">
                        Sugestão baseada em aderência operacional por unidade e carga atual do time.
                      </div>
                      <div className="mt-3 grid gap-2.5 sm:grid-cols-2 xl:grid-cols-4">
                        <MiniStat
                          label="Score"
                          value={String(selectedLeadRoutingSuggestion.fitScore)}
                        />
                        <MiniStat
                          label="Mesmo depto."
                          value={String(selectedLeadRoutingSuggestion.sameDepartment)}
                        />
                        <MiniStat
                          label="Mesmo branch"
                          value={String(selectedLeadRoutingSuggestion.sameBranch)}
                        />
                        <MiniStat
                          label="Deals abertos"
                          value={String(selectedLeadRoutingSuggestion.openDeals)}
                        />
                      </div>
                    </div>
                  ) : null}

                  {canCreateActivities ? (
                    <div className="rounded-[24px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.035),rgba(0,0,0,0.12))] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]">
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
                               'rounded-full border px-2.5 py-1.5 text-[11px] transition',
                              activityType === option.type
                                ? 'border-[#8B5CF6]/25 bg-[#8B5CF6]/10 text-white'
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
                        rows={3}
                        className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none placeholder:text-zinc-500 focus:border-[#8B5CF6]/20"
                        placeholder="Registrar contexto, objeções, próximos alinhamentos ou decisões comerciais"
                      />
                      <div className="mt-3 flex justify-end">
                        <button
                          type="button"
                          onClick={() => void submitActivity(selectedLead)}
                          disabled={savingActivity || activityText.trim().length < 2}
                          className="rounded-2xl border border-[#8B5CF6]/20 bg-[#8B5CF6]/10 px-3.5 py-2.5 text-sm font-medium text-white transition hover:bg-[#8B5CF6]/15 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {savingActivity
                            ? 'Salvando...'
                            : `Adicionar ${
                                INTERACTION_OPTIONS.find(
                                  (option) => option.type === activityType,
                                )?.label.toLowerCase() || 'atividade'
                              }`}
                        </button>
                      </div>
                    </div>
                  ) : null}

                  {canCreateActivities ? (
                    <div className="rounded-[24px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.035),rgba(0,0,0,0.12))] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]">
                      <div className="mb-3 flex items-center justify-between gap-3">
                        <div className="text-sm font-medium text-white">Nota rápida</div>
                        <div className="text-xs text-zinc-500">
                          {savingNote ? 'Salvando...' : 'Registrar contexto instantâneo'}
                        </div>
                      </div>
                      <textarea
                        value={noteText}
                        onChange={(event) => setNoteText(event.target.value)}
                        rows={2}
                        className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none placeholder:text-zinc-500 focus:border-[#8B5CF6]/20"
                        placeholder="Escreva uma nota rápida sobre objeções, contexto ou próximos alinhamentos"
                      />
                      <div className="mt-3 flex justify-end">
                        <button
                          type="button"
                          onClick={() => void submitNote(selectedLead)}
                          disabled={savingNote || noteText.trim().length < 2}
                          className="rounded-2xl border border-[#8B5CF6]/20 bg-[#8B5CF6]/10 px-3.5 py-2.5 text-sm font-medium text-white transition hover:bg-[#8B5CF6]/15 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {savingNote ? 'Salvando...' : 'Salvar nota'}
                        </button>
                      </div>
                    </div>
                  ) : null}

                    <div className="rounded-[24px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.035),rgba(0,0,0,0.12))] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]">
                    <div className="text-[11px] uppercase tracking-[0.18em] text-zinc-500">
                      Próximo passo
                    </div>
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

                    <div className="rounded-[24px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.035),rgba(0,0,0,0.12))] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]">
                    <div className="mb-3 flex items-center justify-between">
                      <div className="text-sm font-medium text-white">Timeline</div>
                      <div className="text-xs text-zinc-500">
                        {leadActivities.length} atividade(s)
                      </div>
                    </div>

                    <div className="crm-scroll max-h-[280px] space-y-2.5 overflow-y-auto pr-1">
                      {leadActivities.slice(0, 5).map((activity) => (
                        <div
                          key={activity.id}
                          className="rounded-2xl border border-white/10 bg-white/[0.03] p-3"
                        >
                          <div className="flex items-center justify-between gap-3">
                            <div className="text-sm text-white">
                              {normalizeUiText(activity.description)}
                            </div>
                            <div className="text-xs text-zinc-500">
                              {formatRelativeTime(activity.createdAt)}
                            </div>
                          </div>
                          <div className="mt-2 text-xs text-zinc-500">
                            {normalizeUiText(activity.user?.name || activity.type)} ·{' '}
                            {formatDateTime(activity.createdAt)}
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

                    <div className="rounded-[24px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.035),rgba(0,0,0,0.12))] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]">
                    <div className="mb-3 flex items-center justify-between">
                      <div className="text-sm font-medium text-white">Tarefas</div>
                      <div className="text-xs text-zinc-500">{totalOpenTasks} em aberto</div>
                    </div>

                    {canCreateTasks ? (
                      <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-3">
                        <div className="mb-3 text-xs uppercase tracking-[0.18em] text-zinc-500">
                          Nova tarefa
                        </div>
                        <div className="grid gap-3">
                          <input
                            value={taskForm.title}
                            onChange={(event) =>
                              setTaskForm((prev) => ({
                                ...prev,
                                title: event.target.value,
                              }))
                            }
                            className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white outline-none placeholder:text-zinc-500 focus:border-[#8B5CF6]/20"
                            placeholder="Título da tarefa"
                          />
                          <textarea
                            value={taskForm.description}
                            onChange={(event) =>
                              setTaskForm((prev) => ({
                                ...prev,
                                description: event.target.value,
                              }))
                            }
                            rows={2}
                            className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white outline-none placeholder:text-zinc-500 focus:border-[#8B5CF6]/20"
                            placeholder="Descrição opcional"
                          />
                          <input
                            type="date"
                            value={taskForm.dueAt}
                            onChange={(event) =>
                              setTaskForm((prev) => ({
                                ...prev,
                                dueAt: event.target.value,
                              }))
                            }
                            className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white outline-none focus:border-[#8B5CF6]/20"
                          />
                        </div>
                        <div className="mt-3 flex justify-end">
                          <button
                            type="button"
                            onClick={() => void submitTask(selectedLead)}
                            disabled={savingTask || taskForm.title.trim().length < 2}
                            className="rounded-2xl border border-[#8B5CF6]/20 bg-[#8B5CF6]/10 px-3.5 py-2.5 text-sm font-medium text-white transition hover:bg-[#8B5CF6]/15 disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            {savingTask ? 'Salvando...' : 'Criar tarefa'}
                          </button>
                        </div>
                      </div>
                    ) : null}

                    <div className="crm-scroll mt-3 max-h-[280px] space-y-2.5 overflow-y-auto pr-1">
                      {leadTasks.slice(0, 5).map((task) => (
                        <div
                          key={task.id}
                          className="rounded-2xl border border-white/10 bg-white/[0.03] p-3"
                        >
                          <div className="flex items-center justify-between gap-3">
                            <div className="text-sm text-white">
                              {normalizeUiText(task.title)}
                            </div>
                            <div
                              className={classNames(
                                'rounded-full border px-3 py-1 text-[11px]',
                                task.completedAt
                                  ? 'border-[#8B5CF6]/20 bg-[#8B5CF6]/10 text-[#D8B4FE]'
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

      {isAccountWorkspaceOpen ? (
        <EnterpriseWorkspaceModal
          eyebrow="CRM enterprise"
          title="Conta e stakeholders"
          description="Crie a conta principal, registre stakeholders e fortaleça account intelligence."
          onClose={() => setIsAccountWorkspaceOpen(false)}
          onSave={() => void saveAccountWorkspace()}
          saving={savingEnterpriseAction}
          saveLabel="Salvar conta"
        >
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-4">
              <FormField label="Nome da conta">
                <input
                  value={accountForm.name}
                  onChange={(event) => setAccountForm((prev) => ({ ...prev, name: event.target.value }))}
                  className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none placeholder:text-zinc-500 focus:border-[#8B5CF6]/20"
                  placeholder="Ex.: Grupo Kairos"
                />
              </FormField>
              <FormField label="Website">
                <input
                  value={accountForm.website}
                  onChange={(event) => setAccountForm((prev) => ({ ...prev, website: event.target.value }))}
                  className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none placeholder:text-zinc-500 focus:border-[#8B5CF6]/20"
                  placeholder="https://empresa.com"
                />
              </FormField>
              <FormField label="Segmento">
                <input
                  value={accountForm.industry}
                  onChange={(event) => setAccountForm((prev) => ({ ...prev, industry: event.target.value }))}
                  className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none placeholder:text-zinc-500 focus:border-[#8B5CF6]/20"
                  placeholder="Tecnologia, varejo, serviços..."
                />
              </FormField>
              <FormField label="Porte">
                <input
                  value={accountForm.companySize}
                  onChange={(event) => setAccountForm((prev) => ({ ...prev, companySize: event.target.value }))}
                  className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none placeholder:text-zinc-500 focus:border-[#8B5CF6]/20"
                  placeholder="SMB, mid-market, enterprise"
                />
              </FormField>
            </div>

            <div className="space-y-4">
              <FormField label="Primeiro contato">
                <input
                  value={contactForm.firstName}
                  onChange={(event) => setContactForm((prev) => ({ ...prev, firstName: event.target.value }))}
                  className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none placeholder:text-zinc-500 focus:border-[#8B5CF6]/20"
                  placeholder="Nome"
                />
              </FormField>
              <FormField label="Sobrenome">
                <input
                  value={contactForm.lastName}
                  onChange={(event) => setContactForm((prev) => ({ ...prev, lastName: event.target.value }))}
                  className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none placeholder:text-zinc-500 focus:border-[#8B5CF6]/20"
                  placeholder="Sobrenome"
                />
              </FormField>
              <FormField label="E-mail">
                <input
                  value={contactForm.email}
                  onChange={(event) => setContactForm((prev) => ({ ...prev, email: event.target.value }))}
                  className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none placeholder:text-zinc-500 focus:border-[#8B5CF6]/20"
                  placeholder="contato@empresa.com"
                />
              </FormField>
              <FormField label="Cargo">
                <input
                  value={contactForm.jobTitle}
                  onChange={(event) => setContactForm((prev) => ({ ...prev, jobTitle: event.target.value }))}
                  className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none placeholder:text-zinc-500 focus:border-[#8B5CF6]/20"
                  placeholder="Head de vendas, diretor comercial..."
                />
              </FormField>
            </div>
          </div>

          <div className="mt-5 rounded-[24px] border border-white/10 bg-white/[0.03] p-4">
            <div className="mb-3 flex items-center justify-between gap-3">
              <div>
                <div className="text-[11px] uppercase tracking-[0.18em] text-zinc-500">
                  Signature desk
                </div>
                <div className="mt-1 text-sm text-zinc-400">
                  Atualize o andamento comercial dos documentos sem sair do CRM.
                </div>
              </div>
            </div>
            <div className="space-y-3">
              {documents.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-white/10 px-4 py-5 text-sm text-zinc-500">
                  Nenhum documento comercial gerado ainda.
                </div>
              ) : (
                documents.slice(0, 4).map((document) => (
                  <div
                    key={document.id}
                    className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="truncate text-sm font-medium text-white">
                          {normalizeUiText(document.title)}
                        </div>
                        <div className="mt-1 text-xs text-zinc-500">
                          {normalizeUiText(document.type)} ·{' '}
                          {normalizeUiText(document.provider || 'Provider pendente')}
                        </div>
                      </div>
                      <div className="text-xs uppercase tracking-[0.18em] text-zinc-400">
                        {normalizeUiText(document.signatureStatus)}
                      </div>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => void handleUpdateDocumentSignatureStatus(document.id, 'SENT')}
                        className="rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-medium text-zinc-200 transition hover:bg-white/10"
                      >
                        Marcar enviado
                      </button>
                      <button
                        type="button"
                        onClick={() => void handleUpdateDocumentSignatureStatus(document.id, 'OPENED')}
                        className="rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-medium text-zinc-200 transition hover:bg-white/10"
                      >
                        Marcar aberto
                      </button>
                      <button
                        type="button"
                        onClick={() => void handleUpdateDocumentSignatureStatus(document.id, 'SIGNED')}
                        className="rounded-2xl border border-emerald-400/20 bg-emerald-400/10 px-3 py-2 text-xs font-medium text-emerald-200 transition hover:bg-emerald-400/15"
                      >
                        Marcar assinado
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </EnterpriseWorkspaceModal>
      ) : null}

      {isEngagementWorkspaceOpen ? (
        <EnterpriseWorkspaceModal
          eyebrow="Engagement"
          title="Inbox, templates, cadências e conversation intelligence"
          description="Conecte mailbox, padronize comunicação e registre inteligência de conversa."
          onClose={() => setIsEngagementWorkspaceOpen(false)}
          onSave={() => void saveEngagementWorkspace()}
          saving={savingEnterpriseAction}
          saveLabel="Salvar engagement"
        >
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-4">
              <FormField label="Provider omnichannel">
                <select
                  value={integrationForm.provider}
                  onChange={(event) =>
                    setIntegrationForm((prev) => ({ ...prev, provider: event.target.value }))
                  }
                  className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none focus:border-[#8B5CF6]/20"
                >
                  {integrationCatalog.map((item) => (
                    <option key={item.provider} value={item.provider}>
                      {item.label}
                    </option>
                  ))}
                </select>
              </FormField>
              <FormField label="Rótulo da conexão">
                <input
                  value={integrationForm.label}
                  onChange={(event) =>
                    setIntegrationForm((prev) => ({ ...prev, label: event.target.value }))
                  }
                  className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none placeholder:text-zinc-500 focus:border-[#8B5CF6]/20"
                  placeholder="WhatsApp matriz, Instagram principal, Gmail SDR..."
                />
              </FormField>
              <FormField label="Identificador do canal">
                <input
                  value={integrationForm.channelIdentifier}
                  onChange={(event) =>
                    setIntegrationForm((prev) => ({
                      ...prev,
                      channelIdentifier: event.target.value,
                    }))
                  }
                  className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none placeholder:text-zinc-500 focus:border-[#8B5CF6]/20"
                  placeholder={
                    integrationCatalog.find((item) => item.provider === integrationForm.provider)
                      ?.defaultIdentifierPlaceholder || 'Identificador do canal'
                  }
                />
              </FormField>
              <div className="grid gap-3 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={() => void handleGenerateIntegrationConnection()}
                  className="rounded-2xl border border-[#8B5CF6]/20 bg-[#8B5CF6]/10 px-4 py-3 text-sm font-medium text-white transition hover:bg-[#8B5CF6]/15"
                >
                  Gerar conexão OAuth
                </button>
                <button
                  type="button"
                  onClick={() => void handleCreateManualIntegration()}
                  className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-medium text-zinc-200 transition hover:bg-white/10"
                >
                  Salvar conexão manual
                </button>
              </div>
              <FormField label="Mailbox">
                <input
                  value={mailboxForm.emailAddress}
                  onChange={(event) => setMailboxForm((prev) => ({ ...prev, emailAddress: event.target.value }))}
                  className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none placeholder:text-zinc-500 focus:border-[#8B5CF6]/20"
                  placeholder="seller@kairos.ai"
                />
              </FormField>
              <FormField label="Provider">
                <select
                  value={mailboxForm.provider}
                  onChange={(event) => setMailboxForm((prev) => ({ ...prev, provider: event.target.value }))}
                  className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none focus:border-[#8B5CF6]/20"
                >
                  <option value="GOOGLE">Google</option>
                  <option value="MICROSOFT">Microsoft</option>
                  <option value="IMAP">IMAP</option>
                </select>
              </FormField>
              <FormField label="Nome do template">
                <input
                  value={templateForm.name}
                  onChange={(event) => setTemplateForm((prev) => ({ ...prev, name: event.target.value }))}
                  className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none placeholder:text-zinc-500 focus:border-[#8B5CF6]/20"
                  placeholder="Template de descoberta"
                />
              </FormField>
              <FormField label="Template assunto">
                <input
                  value={templateForm.subject}
                  onChange={(event) => setTemplateForm((prev) => ({ ...prev, subject: event.target.value }))}
                  className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none placeholder:text-zinc-500 focus:border-[#8B5CF6]/20"
                  placeholder="Assunto do template"
                />
              </FormField>
              <FormField label="Corpo do template">
                <textarea
                  value={templateForm.body}
                  onChange={(event) => setTemplateForm((prev) => ({ ...prev, body: event.target.value }))}
                  rows={4}
                  className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none placeholder:text-zinc-500 focus:border-[#8B5CF6]/20"
                  placeholder="Mensagem base para cadências"
                />
              </FormField>
            </div>

            <div className="space-y-4">
              <FormField label="Nome da cadência">
                <input
                  value={sequenceForm.name}
                  onChange={(event) => setSequenceForm((prev) => ({ ...prev, name: event.target.value }))}
                  className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none placeholder:text-zinc-500 focus:border-[#8B5CF6]/20"
                  placeholder="Cadência outbound enterprise"
                />
              </FormField>
              <FormField label="Assunto da primeira etapa">
                <input
                  value={sequenceForm.stepSubject}
                  onChange={(event) => setSequenceForm((prev) => ({ ...prev, stepSubject: event.target.value }))}
                  className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none placeholder:text-zinc-500 focus:border-[#8B5CF6]/20"
                  placeholder="Assunto do primeiro disparo"
                />
              </FormField>
              <FormField label="Assunto do e-mail rápido">
                <input
                  value={messageForm.subject}
                  onChange={(event) => setMessageForm((prev) => ({ ...prev, subject: event.target.value }))}
                  className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none placeholder:text-zinc-500 focus:border-[#8B5CF6]/20"
                  placeholder="Retomando nossa conversa"
                />
              </FormField>
              <FormField label="Mensagem rápida para o lead selecionado">
                <textarea
                  value={messageForm.body}
                  onChange={(event) => setMessageForm((prev) => ({ ...prev, body: event.target.value }))}
                  rows={3}
                  className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none placeholder:text-zinc-500 focus:border-[#8B5CF6]/20"
                  placeholder="Corpo do e-mail ou resposta"
                />
              </FormField>
              <FormField label="Resumo da conversa">
                <textarea
                  value={insightForm.summaryText}
                  onChange={(event) => setInsightForm((prev) => ({ ...prev, summaryText: event.target.value }))}
                  rows={3}
                  className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none placeholder:text-zinc-500 focus:border-[#8B5CF6]/20"
                  placeholder="Resumo, objeções e próximos passos"
                />
              </FormField>
              <FormField label="Mensagem omnichannel">
                <textarea
                  value={omnichannelForm.body}
                  onChange={(event) =>
                    setOmnichannelForm((prev) => ({ ...prev, body: event.target.value }))
                  }
                  rows={3}
                  className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none placeholder:text-zinc-500 focus:border-[#8B5CF6]/20"
                  placeholder="Mensagem rápida por WhatsApp, Instagram ou Facebook."
                />
              </FormField>
              <FormField label="Destino omnichannel">
                <input
                  value={omnichannelForm.recipientHandle}
                  onChange={(event) =>
                    setOmnichannelForm((prev) => ({
                      ...prev,
                      recipientHandle: event.target.value,
                    }))
                  }
                  className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none placeholder:text-zinc-500 focus:border-[#8B5CF6]/20"
                  placeholder="Número, @handle ou page id do contato"
                />
              </FormField>
            </div>
          </div>

          <div className="mt-5 grid gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
            <div className="rounded-[24px] border border-white/10 bg-white/[0.03] p-4 xl:col-span-2">
              <div className="grid gap-3 md:grid-cols-4">
                <MiniStat label="Email readiness" value={emailReadinessLabel} />
                <MiniStat
                  label="Mailboxes conectadas"
                  value={`${connectedMailboxes.length}/${mailboxes.length || 0}`}
                />
                <MiniStat
                  label="Omnichannel readiness"
                  value={omnichannelReadinessLabel}
                />
                <MiniStat
                  label="Canais pendentes"
                  value={String(pendingChannelIntegrations.length)}
                />
              </div>
            </div>

            <div className="rounded-[24px] border border-white/10 bg-white/[0.03] p-4">
              <div className="mb-2 text-[11px] uppercase tracking-[0.18em] text-zinc-500">
                Conexões ativas
              </div>
              <div className="space-y-3">
                {channelIntegrations.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-white/10 px-4 py-5 text-sm text-zinc-500">
                    Nenhuma integração omnichannel conectada ainda.
                  </div>
                ) : (
                  channelIntegrations.slice(0, 4).map((integration) => (
                    <div
                      key={integration.id}
                      className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <div className="text-sm font-semibold text-white">
                            {normalizeUiText(integration.label)}
                          </div>
                          <div className="mt-1 text-xs text-zinc-500">
                            {normalizeUiText(
                              integration.channelIdentifier ||
                                integration.callbackUrl ||
                                integration.provider,
                            )}
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => void handleSyncIntegration(integration.id)}
                          className="rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-medium text-zinc-200 transition hover:bg-white/10"
                        >
                          Sync
                        </button>
                      </div>
                      <div className="mt-3 flex flex-wrap gap-2 text-[11px] uppercase tracking-[0.18em] text-zinc-500">
                        <span>{normalizeUiText(integration.provider)}</span>
                        <span>{normalizeUiText(integration.status)}</span>
                        {integration.errorMessage ? (
                          <span className="text-amber-300">
                            {normalizeUiText(integration.errorMessage)}
                          </span>
                        ) : null}
                        {integration.lastInboundAt ? (
                          <span>Última entrada {formatRelativeTime(integration.lastInboundAt)}</span>
                        ) : null}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="rounded-[24px] border border-white/10 bg-white/[0.03] p-4">
              <div className="mb-2 text-[11px] uppercase tracking-[0.18em] text-zinc-500">
                Conexão gerada
              </div>
              {integrationConnectPreview ? (
                <div className="space-y-3 text-sm text-zinc-300">
                  <div>
                    <div className="text-white">{integrationConnectPreview.providerLabel}</div>
                    <div className="mt-1 text-xs text-zinc-500">
                      Use a URL abaixo para conectar a conta do cliente.
                    </div>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-xs text-zinc-400">
                    <div className="mb-1 uppercase tracking-[0.18em] text-zinc-500">OAuth URL</div>
                    <div className="break-all">{integrationConnectPreview.connectUrl || 'Credenciais externas ainda não configuradas no ambiente.'}</div>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-xs text-zinc-400">
                    <div className="mb-1 uppercase tracking-[0.18em] text-zinc-500">Callback</div>
                    <div className="break-all">{integrationConnectPreview.callbackUrl || 'Não gerado'}</div>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-xs text-zinc-400">
                    <div className="mb-1 uppercase tracking-[0.18em] text-zinc-500">Webhook</div>
                    <div className="break-all">{integrationConnectPreview.webhookUrl || 'Este provider não usa webhook'}</div>
                  </div>
                  {integrationConnectPreview.requiredEnv?.length ? (
                    <div className="rounded-2xl border border-dashed border-white/10 bg-black/20 px-4 py-3 text-xs text-zinc-400">
                      <div className="mb-1 uppercase tracking-[0.18em] text-zinc-500">Variáveis exigidas</div>
                      <div>{integrationConnectPreview.requiredEnv.join(', ')}</div>
                    </div>
                  ) : null}
                </div>
              ) : (
                <div className="rounded-2xl border border-dashed border-white/10 px-4 py-5 text-sm text-zinc-500">
                  Gere uma conexão para obter OAuth URL, callback e webhook do provider.
                </div>
              )}
            </div>
          </div>

          <div className="mt-5 rounded-[24px] border border-white/10 bg-white/[0.03] p-4">
            <div className="mb-3 text-[11px] uppercase tracking-[0.18em] text-zinc-500">
              Mensagens omnichannel recentes
            </div>
            <div className="space-y-3">
              {omnichannelMessages.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-white/10 px-4 py-5 text-sm text-zinc-500">
                  Ainda não há mensagens de WhatsApp, Facebook ou Instagram no CRM.
                </div>
              ) : (
                omnichannelMessages.slice(0, 4).map((message) => (
                  <div
                    key={message.id}
                    className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="text-sm font-semibold text-white">
                          {normalizeUiText(message.integration?.label || message.channelType)}
                        </div>
                        <div className="mt-1 text-xs text-zinc-500">
                          {normalizeUiText(
                            message.senderHandle || message.recipientHandle || 'Sem identificador',
                          )}
                        </div>
                      </div>
                      <div className="text-[11px] uppercase tracking-[0.18em] text-zinc-500">
                        {normalizeUiText(message.direction)} · {normalizeUiText(message.status)}
                      </div>
                    </div>
                    <div className="mt-3 text-sm leading-6 text-zinc-300">
                      {normalizeUiText(message.body)}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </EnterpriseWorkspaceModal>
      ) : null}

      {isDocumentsWorkspaceOpen ? (
        <EnterpriseWorkspaceModal
          eyebrow="Proposal desk"
          title="Quote, proposta, contrato e assinatura"
          description="Gere documentos comerciais vinculados ao lead, conta e contato atuais."
          onClose={() => setIsDocumentsWorkspaceOpen(false)}
          onSave={() => void saveDocumentsWorkspace()}
          saving={savingEnterpriseAction}
          saveLabel="Salvar proposal"
        >
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-4">
              <FormField label="Título da quote">
                <input
                  value={quoteForm.title}
                  onChange={(event) => setQuoteForm((prev) => ({ ...prev, title: event.target.value }))}
                  className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none placeholder:text-zinc-500 focus:border-[#8B5CF6]/20"
                  placeholder="Proposta enterprise anual"
                />
              </FormField>
              <FormField label="Valor">
                <input
                  value={quoteForm.amount}
                  onChange={(event) => setQuoteForm((prev) => ({ ...prev, amount: event.target.value }))}
                  className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none placeholder:text-zinc-500 focus:border-[#8B5CF6]/20"
                  placeholder="15000"
                />
              </FormField>
            </div>
            <div className="space-y-4">
              <FormField label="Título do documento">
                <input
                  value={documentForm.title}
                  onChange={(event) => setDocumentForm((prev) => ({ ...prev, title: event.target.value }))}
                  className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none placeholder:text-zinc-500 focus:border-[#8B5CF6]/20"
                  placeholder="Contrato comercial"
                />
              </FormField>
              <FormField label="Tipo">
                <select
                  value={documentForm.type}
                  onChange={(event) => setDocumentForm((prev) => ({ ...prev, type: event.target.value }))}
                  className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none focus:border-[#8B5CF6]/20"
                >
                  <option value="PROPOSAL">Proposal</option>
                  <option value="CONTRACT">Contract</option>
                  <option value="QUOTE">Quote</option>
                </select>
              </FormField>
              <FormField label="Provider de assinatura">
                <input
                  value={documentForm.provider}
                  onChange={(event) => setDocumentForm((prev) => ({ ...prev, provider: event.target.value }))}
                  className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none placeholder:text-zinc-500 focus:border-[#8B5CF6]/20"
                  placeholder="DocuSign, Clicksign, PandaDoc..."
                />
              </FormField>
            </div>
          </div>
        </EnterpriseWorkspaceModal>
      ) : null}

      {isRoutingWorkspaceOpen ? (
        <EnterpriseWorkspaceModal
          eyebrow="Routing"
          title="Distribuição automática e coaching comercial"
          description="Defina regras persistidas e aplique roteamento no lead atualmente em foco."
          onClose={() => setIsRoutingWorkspaceOpen(false)}
          onSave={() => void saveRoutingWorkspace()}
          saving={savingEnterpriseAction}
          saveLabel="Salvar roteamento"
        >
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-4">
              <FormField label="Nome da regra">
                <input
                  value={routingForm.name}
                  onChange={(event) => setRoutingForm((prev) => ({ ...prev, name: event.target.value }))}
                  className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none placeholder:text-zinc-500 focus:border-[#8B5CF6]/20"
                  placeholder="Round robin inbound enterprise"
                />
              </FormField>
              <FormField label="Origem">
                <input
                  value={routingForm.source}
                  onChange={(event) => setRoutingForm((prev) => ({ ...prev, source: event.target.value }))}
                  className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none placeholder:text-zinc-500 focus:border-[#8B5CF6]/20"
                  placeholder="Website, WhatsApp, referral..."
                />
              </FormField>
              <FormField label="Owners (IDs separados por vírgula)">
                <textarea
                  value={routingForm.ownerPool}
                  onChange={(event) => setRoutingForm((prev) => ({ ...prev, ownerPool: event.target.value }))}
                  rows={3}
                  className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none placeholder:text-zinc-500 focus:border-[#8B5CF6]/20"
                  placeholder="user_1, user_2, user_3"
                />
              </FormField>
              <FormField label="Estratégia">
                <select
                  value={routingForm.strategy}
                  onChange={(event) => setRoutingForm((prev) => ({ ...prev, strategy: event.target.value }))}
                  className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none focus:border-[#8B5CF6]/20"
                >
                  <option value="ROUND_ROBIN">Round robin</option>
                  <option value="LOAD_BALANCED">Load balanced</option>
                  <option value="BEST_FIT">Best fit</option>
                </select>
              </FormField>
            </div>
            <div className="space-y-4">
              <FormField label="Resumo da conversa atual">
                <textarea
                  value={insightForm.coachingNotes}
                  onChange={(event) => setInsightForm((prev) => ({ ...prev, coachingNotes: event.target.value }))}
                  rows={6}
                  className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none placeholder:text-zinc-500 focus:border-[#8B5CF6]/20"
                  placeholder="Notas de coaching, objeções e guidance para o vendedor."
                />
              </FormField>
              <div className="rounded-[22px] border border-white/10 bg-white/[0.03] p-4 text-sm text-zinc-400">
                {selectedEnterpriseLead
                  ? `Ao salvar, o roteamento poderá ser aplicado ao lead ${normalizeUiText(selectedEnterpriseLead.name)}.`
                  : 'Selecione um lead no kanban para aplicar roteamento imediato.'}
              </div>
            </div>
          </div>
        </EnterpriseWorkspaceModal>
      ) : null}

      {isForecastWorkspaceOpen ? (
        <EnterpriseWorkspaceModal
          eyebrow="Forecast governance"
          title="Snapshots, commit e ajustes manuais"
          description="Capture snapshots do forecast e aplique governança sobre commit, best case e pipeline."
          onClose={() => setIsForecastWorkspaceOpen(false)}
          onSave={() => void saveForecastWorkspace()}
          saving={savingEnterpriseAction}
          saveLabel="Salvar governança"
        >
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-4">
              <FormField label="Label do snapshot">
                <input
                  value={forecastSnapshotForm.label}
                  onChange={(event) => setForecastSnapshotForm((prev) => ({ ...prev, label: event.target.value }))}
                  className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none placeholder:text-zinc-500 focus:border-[#8B5CF6]/20"
                  placeholder="Forecast março 2026"
                />
              </FormField>
              <div className="grid gap-4 sm:grid-cols-2">
                <FormField label="Início">
                  <input
                    type="date"
                    value={forecastSnapshotForm.periodStart}
                    onChange={(event) => setForecastSnapshotForm((prev) => ({ ...prev, periodStart: event.target.value }))}
                    className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none focus:border-[#8B5CF6]/20"
                  />
                </FormField>
                <FormField label="Fim">
                  <input
                    type="date"
                    value={forecastSnapshotForm.periodEnd}
                    onChange={(event) => setForecastSnapshotForm((prev) => ({ ...prev, periodEnd: event.target.value }))}
                    className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none focus:border-[#8B5CF6]/20"
                  />
                </FormField>
              </div>
              <FormField label="Commit">
                <input
                  value={forecastSnapshotForm.commitValue}
                  onChange={(event) => setForecastSnapshotForm((prev) => ({ ...prev, commitValue: event.target.value }))}
                  className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none placeholder:text-zinc-500 focus:border-[#8B5CF6]/20"
                  placeholder="50000"
                />
              </FormField>
            </div>

            <div className="space-y-4">
              <FormField label="Best case">
                <input
                  value={forecastSnapshotForm.bestCaseValue}
                  onChange={(event) => setForecastSnapshotForm((prev) => ({ ...prev, bestCaseValue: event.target.value }))}
                  className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none placeholder:text-zinc-500 focus:border-[#8B5CF6]/20"
                  placeholder="75000"
                />
              </FormField>
              <FormField label="Categoria do ajuste">
                <select
                  value={forecastAdjustmentForm.category}
                  onChange={(event) => setForecastAdjustmentForm((prev) => ({ ...prev, category: event.target.value }))}
                  className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none focus:border-[#8B5CF6]/20"
                >
                  <option value="PIPELINE">Pipeline</option>
                  <option value="BEST_CASE">Best case</option>
                  <option value="COMMIT">Commit</option>
                  <option value="CLOSED">Closed</option>
                </select>
              </FormField>
              <FormField label="Valor do ajuste">
                <input
                  value={forecastAdjustmentForm.adjustedValue}
                  onChange={(event) => setForecastAdjustmentForm((prev) => ({ ...prev, adjustedValue: event.target.value }))}
                  className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none placeholder:text-zinc-500 focus:border-[#8B5CF6]/20"
                  placeholder="25000"
                />
              </FormField>
              <FormField label="Pipeline">
                <input
                  value={forecastSnapshotForm.pipelineValue}
                  onChange={(event) => setForecastSnapshotForm((prev) => ({ ...prev, pipelineValue: event.target.value }))}
                  className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none placeholder:text-zinc-500 focus:border-[#8B5CF6]/20"
                  placeholder="120000"
                />
              </FormField>
              <FormField label="Ajuste manual">
                <textarea
                  value={forecastAdjustmentForm.reason}
                  onChange={(event) => setForecastAdjustmentForm((prev) => ({ ...prev, reason: event.target.value }))}
                  rows={3}
                  className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none placeholder:text-zinc-500 focus:border-[#8B5CF6]/20"
                  placeholder="Justifique o ajuste gerencial do forecast."
                />
              </FormField>
            </div>
          </div>
        </EnterpriseWorkspaceModal>
      ) : null}

      {isPipelineManagerOpen ? (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/70 p-4 backdrop-blur-sm md:items-center">
          <div className="flex max-h-[calc(100vh-2rem)] w-full max-w-5xl flex-col overflow-hidden rounded-[30px] border border-white/10 bg-[#0A0C0D] shadow-[0_28px_120px_rgba(0,0,0,0.42)] md:max-h-[calc(100vh-3rem)]">
            <div className="flex shrink-0 items-start justify-between gap-4 border-b border-white/10 px-6 py-5">
              <div>
                <div className="text-[11px] uppercase tracking-[0.22em] text-zinc-500">
                  Pipeline manager
                </div>
                <div className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-white">
                  Gerenciar pipelines e etapas
                </div>
                <div className="mt-1 text-sm text-zinc-500">
                  Estruture o funil comercial com pipelines customizados e etapas operacionais.
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsPipelineManagerOpen(false)}
                className="rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-zinc-300 transition hover:bg-white/10"
              >
                Fechar
              </button>
            </div>

            <div className="crm-scroll flex-1 overflow-y-auto px-6 py-5">
              <div className="grid gap-4 xl:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]">
                <div className="space-y-4">
                  <div className="rounded-[26px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.035),rgba(0,0,0,0.12))] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]">
                    <div className="mb-3 text-sm font-medium text-white">Pipelines disponíveis</div>

                    {loadingPipelines ? (
                      <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.03] px-4 py-8 text-center text-sm text-zinc-500">
                        Carregando pipelines...
                      </div>
                    ) : pipelines.length === 0 ? (
                      <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.03] px-4 py-8 text-center text-sm text-zinc-500">
                        Nenhum pipeline cadastrado ainda.
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {pipelines.map((pipeline) => (
                          <div
                            key={pipeline.id}
                            onClick={() => setSelectedPipelineId(pipeline.id)}
                            onKeyDown={(event) => {
                              if (event.key === 'Enter' || event.key === ' ') {
                                event.preventDefault();
                                setSelectedPipelineId(pipeline.id);
                              }
                            }}
                            role="button"
                            tabIndex={0}
                            className={classNames(
                              'w-full rounded-[22px] border px-4 py-3 text-left transition',
                              selectedPipeline?.id === pipeline.id
                                ? 'border-[#8B5CF6]/20 bg-[#8B5CF6]/10'
                                : 'border-white/10 bg-white/[0.03] hover:bg-white/[0.05]',
                            )}
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div className="min-w-0">
                                <div className="truncate text-sm font-medium text-white">
                                  {normalizeUiText(pipeline.name)}
                                </div>
                                <div className="mt-1 text-xs text-zinc-500">
                                  {pipeline.stages.length} etapa(s){pipeline.isDefault ? ' · padrão' : ''}
                                </div>
                              </div>
                              <button
                                type="button"
                                onClick={(event) => {
                                  event.stopPropagation();
                                  void removePipeline(pipeline.id);
                                }}
                                disabled={deletingPipelineId === pipeline.id}
                                className="rounded-xl border border-red-500/20 bg-red-500/10 px-2.5 py-1 text-[11px] text-red-200 transition hover:bg-red-500/15 disabled:opacity-60"
                              >
                                {deletingPipelineId === pipeline.id ? '...' : 'Excluir'}
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="rounded-[26px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.035),rgba(0,0,0,0.12))] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]">
                    <div className="mb-3 text-sm font-medium text-white">Criar novo pipeline</div>
                    <div className="grid gap-3">
                      <input
                        value={pipelineForm.name}
                        onChange={(event) =>
                          setPipelineForm((prev) => ({ ...prev, name: event.target.value }))
                        }
                        className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none placeholder:text-zinc-500 focus:border-[#8B5CF6]/20"
                        placeholder="Ex.: Enterprise sales"
                      />
                      <textarea
                        value={pipelineForm.description}
                        onChange={(event) =>
                          setPipelineForm((prev) => ({ ...prev, description: event.target.value }))
                        }
                        rows={2}
                        className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none placeholder:text-zinc-500 focus:border-[#8B5CF6]/20"
                        placeholder="Descrição opcional do pipeline"
                      />
                      <label className="flex items-center gap-3 text-sm text-zinc-300">
                        <input
                          type="checkbox"
                          checked={pipelineForm.isDefault}
                          onChange={(event) =>
                            setPipelineForm((prev) => ({
                              ...prev,
                              isDefault: event.target.checked,
                            }))
                          }
                          className="h-4 w-4 rounded border-white/10 bg-white/5"
                        />
                        Definir como pipeline padrão
                      </label>
                    </div>
                    <div className="mt-4 flex justify-end">
                      <button
                        type="button"
                        onClick={() => void savePipeline()}
                        disabled={savingPipeline}
                        className="rounded-2xl border border-[#8B5CF6]/20 bg-[#8B5CF6]/10 px-4 py-3 text-sm font-medium text-white transition hover:bg-[#8B5CF6]/15 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {savingPipeline ? 'Salvando...' : 'Criar pipeline'}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="rounded-[26px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.035),rgba(0,0,0,0.12))] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]">
                    <div className="mb-3 text-sm font-medium text-white">Etapas do pipeline</div>

                    {!selectedPipeline ? (
                      <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.03] px-4 py-8 text-center text-sm text-zinc-500">
                        Selecione um pipeline para gerenciar as etapas.
                      </div>
                    ) : (
                      <div className="space-y-2.5">
                        {selectedPipeline.stages
                          .slice()
                          .sort((a, b) => a.order - b.order)
                          .map((stage) => (
                            <div
                              key={stage.id}
                              className="rounded-[20px] border border-white/10 bg-black/20 px-3.5 py-3"
                            >
                              <div className="flex items-start justify-between gap-3">
                                <div className="min-w-0">
                                  <div className="flex items-center gap-2">
                                    <span
                                      className="h-2.5 w-2.5 rounded-full"
                                      style={{ backgroundColor: stage.color || '#8B5CF6' }}
                                    />
                                    <div className="truncate text-sm font-medium text-white">
                                      {normalizeUiText(stage.name)}
                                    </div>
                                  </div>
                                  <div className="mt-1 text-xs text-zinc-500">
                                    Base: {STATUS_LABELS[stage.statusBase]} · ordem {stage.order + 1}
                                  </div>
                                </div>
                                {!stage.isSystemStage ? (
                                  <button
                                    type="button"
                                    onClick={() => void removeStage(stage.id)}
                                    disabled={deletingStageId === stage.id}
                                    className="rounded-xl border border-red-500/20 bg-red-500/10 px-2.5 py-1 text-[11px] text-red-200 transition hover:bg-red-500/15 disabled:opacity-60"
                                  >
                                    {deletingStageId === stage.id ? '...' : 'Excluir'}
                                  </button>
                                ) : (
                                  <div className="rounded-xl border border-white/10 bg-white/[0.04] px-2.5 py-1 text-[11px] text-zinc-500">
                                    Sistema
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
                      </div>
                    )}
                  </div>

                  <div className="rounded-[26px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.035),rgba(0,0,0,0.12))] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]">
                    <div className="mb-3 text-sm font-medium text-white">Adicionar etapa</div>
                    <div className="grid gap-3">
                      <input
                        value={stageForm.name}
                        onChange={(event) =>
                          setStageForm((prev) => ({ ...prev, name: event.target.value }))
                        }
                        className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none placeholder:text-zinc-500 focus:border-[#8B5CF6]/20"
                        placeholder="Ex.: Validação financeira"
                      />
                      <div className="grid gap-3 sm:grid-cols-2">
                        <select
                          value={stageForm.statusBase}
                          onChange={(event) =>
                            setStageForm((prev) => ({
                              ...prev,
                              statusBase: event.target.value as LeadStatus,
                            }))
                          }
                          className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none focus:border-[#8B5CF6]/20"
                        >
                          {STATUS_ORDER.map((status) => (
                            <option key={status} value={status}>
                              {STATUS_LABELS[status]}
                            </option>
                          ))}
                        </select>
                        <input
                          type="color"
                          value={stageForm.color}
                          onChange={(event) =>
                            setStageForm((prev) => ({ ...prev, color: event.target.value }))
                          }
                          className="h-[48px] w-full rounded-2xl border border-white/10 bg-white/5 px-2 py-2"
                        />
                      </div>
                    </div>
                    <div className="mt-4 flex justify-end">
                      <button
                        type="button"
                        onClick={() => void saveStage()}
                        disabled={savingStage || !selectedPipeline}
                        className="rounded-2xl border border-[#8B5CF6]/20 bg-[#8B5CF6]/10 px-4 py-3 text-sm font-medium text-white transition hover:bg-[#8B5CF6]/15 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {savingStage ? 'Salvando...' : 'Adicionar etapa'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {isSalesTargetOpen && canCreateSalesTargets ? (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/70 p-4 backdrop-blur-sm md:items-center">
          <div className="flex max-h-[calc(100vh-2rem)] w-full max-w-3xl flex-col overflow-hidden rounded-[30px] border border-white/10 bg-[#0A0C0D] shadow-[0_28px_120px_rgba(0,0,0,0.42)] md:max-h-[calc(100vh-3rem)]">
            <div className="flex shrink-0 items-start justify-between gap-4 border-b border-white/10 px-6 py-5">
              <div>
                <div className="text-[11px] uppercase tracking-[0.22em] text-zinc-500">
                  Meta comercial
                </div>
                <div className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-white">
                  Cadastrar nova meta
                </div>
                <div className="mt-1 text-sm text-zinc-500">
                  Defina meta por empresa, filial, departamento ou usuário.
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsSalesTargetOpen(false)}
                className="rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-zinc-300 transition hover:bg-white/10"
              >
                Fechar
              </button>
            </div>

            <div className="crm-scroll min-h-0 flex-1 overflow-y-auto px-6 py-5">
              <div className="grid gap-4 md:grid-cols-2">
                <FormField label="Período">
                  <select
                    value={salesTargetForm.periodType}
                    onChange={(event) =>
                      setSalesTargetForm((prev) => ({
                        ...prev,
                        periodType: event.target.value as SalesTargetPeriod,
                      }))
                    }
                    className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none focus:border-[#8B5CF6]/20"
                  >
                    <option value="DAILY">Diária</option>
                    <option value="WEEKLY">Semanal</option>
                    <option value="MONTHLY">Mensal</option>
                    <option value="QUARTERLY">Trimestral</option>
                    <option value="YEARLY">Anual</option>
                  </select>
                </FormField>

                <FormField label="Valor da meta">
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={salesTargetForm.targetValue ?? ''}
                    onChange={(event) =>
                      setSalesTargetForm((prev) => ({
                        ...prev,
                        targetValue: event.target.value
                          ? Number(event.target.value)
                          : undefined,
                      }))
                    }
                    className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none placeholder:text-zinc-500 focus:border-[#8B5CF6]/20"
                    placeholder="50000"
                  />
                </FormField>

                <FormField label="Início do período">
                  <input
                    type="date"
                    value={salesTargetForm.periodStart}
                    onChange={(event) =>
                      setSalesTargetForm((prev) => ({
                        ...prev,
                        periodStart: event.target.value,
                      }))
                    }
                    className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none focus:border-[#8B5CF6]/20"
                  />
                </FormField>

                <FormField label="Fim do período">
                  <input
                    type="date"
                    value={salesTargetForm.periodEnd}
                    onChange={(event) =>
                      setSalesTargetForm((prev) => ({
                        ...prev,
                        periodEnd: event.target.value,
                      }))
                    }
                    className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none focus:border-[#8B5CF6]/20"
                  />
                </FormField>

                <FormField label="Meta de negócios">
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={salesTargetForm.targetDeals ?? ''}
                    onChange={(event) =>
                      setSalesTargetForm((prev) => ({
                        ...prev,
                        targetDeals: event.target.value
                          ? Number(event.target.value)
                          : undefined,
                      }))
                    }
                    className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none placeholder:text-zinc-500 focus:border-[#8B5CF6]/20"
                    placeholder="20"
                  />
                </FormField>

                <FormField label="Filial">
                  <select
                    value={salesTargetForm.branchId ?? ''}
                    onChange={(event) =>
                      setSalesTargetForm((prev) => ({
                        ...prev,
                        branchId: event.target.value,
                        departmentId: '',
                        userId: '',
                      }))
                    }
                    className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none focus:border-[#8B5CF6]/20"
                  >
                    <option value="">Empresa inteira</option>
                    {branchOptions.map((branch) => (
                      <option key={branch.id} value={branch.id}>
                        {branch.name}
                      </option>
                    ))}
                  </select>
                </FormField>

                <FormField label="Departamento">
                  <select
                    value={salesTargetForm.departmentId ?? ''}
                    onChange={(event) =>
                      setSalesTargetForm((prev) => ({
                        ...prev,
                        departmentId: event.target.value,
                        userId: '',
                      }))
                    }
                    className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none focus:border-[#8B5CF6]/20"
                  >
                    <option value="">Todos os departamentos</option>
                    {departmentOptions
                      .filter((department) => {
                        if (!salesTargetForm.branchId) return true;
                        return (
                          !department.branchId ||
                          department.branchId === salesTargetForm.branchId
                        );
                      })
                      .map((department) => (
                        <option key={department.id} value={department.id}>
                          {department.name}
                        </option>
                      ))}
                  </select>
                </FormField>

                <FormField label="Usuário responsável">
                  <select
                    value={salesTargetForm.userId ?? ''}
                    onChange={(event) =>
                      setSalesTargetForm((prev) => ({
                        ...prev,
                        userId: event.target.value,
                      }))
                    }
                    className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none focus:border-[#8B5CF6]/20"
                  >
                    <option value="">Todos os usuários</option>
                    {ownerOptions.map((owner) => (
                      <option key={owner.id} value={owner.id}>
                        {owner.name}
                      </option>
                    ))}
                  </select>
                </FormField>
              </div>
            </div>

            <div className="flex shrink-0 justify-end gap-3 border-t border-white/10 px-6 py-5">
              <button
                type="button"
                onClick={() => setIsSalesTargetOpen(false)}
                className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-zinc-300 transition hover:bg-white/10"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => void saveSalesTarget()}
                disabled={savingSalesTarget}
                className="rounded-2xl border border-[#8B5CF6]/20 bg-[#8B5CF6]/10 px-4 py-3 text-sm font-medium text-white transition hover:bg-[#8B5CF6]/15 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {savingSalesTarget ? 'Salvando...' : 'Salvar meta'}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {isCreateOpen ? (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/70 p-4 backdrop-blur-sm md:items-center">
          <div className="flex max-h-[calc(100vh-2rem)] w-full max-w-4xl flex-col overflow-hidden rounded-[30px] border border-white/10 bg-[#0A0C0D] shadow-[0_28px_120px_rgba(0,0,0,0.42)] md:max-h-[calc(100vh-3rem)]">
            <div className="flex shrink-0 items-start justify-between gap-4 border-b border-white/10 px-6 py-5">
              <div>
                <div className="text-[11px] uppercase tracking-[0.22em] text-zinc-500">
                  Novo lead
                </div>
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
                    onChange={(event) =>
                      setCreateForm((prev) => ({ ...prev, name: event.target.value }))
                    }
                    className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none placeholder:text-zinc-500 focus:border-[#8B5CF6]/20"
                    placeholder="Nome do lead"
                  />
                </FormField>

                <FormField label="Empresa">
                  <input
                    value={createForm.companyName}
                    onChange={(event) =>
                      setCreateForm((prev) => ({
                        ...prev,
                        companyName: event.target.value,
                      }))
                    }
                    className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none placeholder:text-zinc-500 focus:border-[#8B5CF6]/20"
                    placeholder="Empresa"
                  />
                </FormField>

                <FormField label="Telefone">
                  <input
                    value={createForm.phone}
                    onChange={(event) =>
                      setCreateForm((prev) => ({ ...prev, phone: event.target.value }))
                    }
                    className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none placeholder:text-zinc-500 focus:border-[#8B5CF6]/20"
                    placeholder="Telefone"
                  />
                </FormField>

                <FormField label="E-mail">
                  <input
                    value={createForm.email}
                    onChange={(event) =>
                      setCreateForm((prev) => ({ ...prev, email: event.target.value }))
                    }
                    className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none placeholder:text-zinc-500 focus:border-[#8B5CF6]/20"
                    placeholder="email@empresa.com"
                  />
                </FormField>

                <FormField label="WhatsApp">
                  <input
                    value={createForm.whatsapp}
                    onChange={(event) =>
                      setCreateForm((prev) => ({
                        ...prev,
                        whatsapp: event.target.value,
                      }))
                    }
                    className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none placeholder:text-zinc-500 focus:border-[#8B5CF6]/20"
                    placeholder="WhatsApp"
                  />
                </FormField>

                <FormField label="Cargo / função">
                  <input
                    value={createForm.jobTitle}
                    onChange={(event) =>
                      setCreateForm((prev) => ({
                        ...prev,
                        jobTitle: event.target.value,
                      }))
                    }
                    className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none placeholder:text-zinc-500 focus:border-[#8B5CF6]/20"
                    placeholder="Diretor comercial, gerente, comprador..."
                  />
                </FormField>

                <FormField label="Website">
                  <input
                    value={createForm.website}
                    onChange={(event) =>
                      setCreateForm((prev) => ({ ...prev, website: event.target.value }))
                    }
                    className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none placeholder:text-zinc-500 focus:border-[#8B5CF6]/20"
                    placeholder="https://empresa.com"
                  />
                </FormField>

                <FormField label="Cidade">
                  <input
                    value={createForm.city}
                    onChange={(event) =>
                      setCreateForm((prev) => ({ ...prev, city: event.target.value }))
                    }
                    className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none placeholder:text-zinc-500 focus:border-[#8B5CF6]/20"
                    placeholder="Cidade"
                  />
                </FormField>

                <FormField label="Estado">
                  <input
                    value={createForm.state}
                    onChange={(event) =>
                      setCreateForm((prev) => ({ ...prev, state: event.target.value }))
                    }
                    className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none placeholder:text-zinc-500 focus:border-[#8B5CF6]/20"
                    placeholder="Estado"
                  />
                </FormField>

                <FormField label="Segmento">
                  <input
                    value={createForm.industry}
                    onChange={(event) =>
                      setCreateForm((prev) => ({
                        ...prev,
                        industry: event.target.value,
                      }))
                    }
                    className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none placeholder:text-zinc-500 focus:border-[#8B5CF6]/20"
                    placeholder="Tecnologia, varejo, saúde..."
                  />
                </FormField>

                <FormField label="Porte da empresa">
                  <input
                    value={createForm.companySize}
                    onChange={(event) =>
                      setCreateForm((prev) => ({
                        ...prev,
                        companySize: event.target.value,
                      }))
                    }
                    className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none placeholder:text-zinc-500 focus:border-[#8B5CF6]/20"
                    placeholder="Pequena, média, enterprise..."
                  />
                </FormField>

                <FormField label="Valor do negócio">
                  <input
                    value={createForm.dealValue}
                    onChange={(event) =>
                      setCreateForm((prev) => ({
                        ...prev,
                        dealValue: event.target.value,
                      }))
                    }
                    className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none placeholder:text-zinc-500 focus:border-[#8B5CF6]/20"
                    placeholder="45000"
                  />
                </FormField>

                <FormField label="Probabilidade (%)">
                  <input
                    value={createForm.probability}
                    onChange={(event) =>
                      setCreateForm((prev) => ({
                        ...prev,
                        probability: event.target.value,
                      }))
                    }
                    className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none placeholder:text-zinc-500 focus:border-[#8B5CF6]/20"
                    placeholder="60"
                  />
                </FormField>

                <FormField label="Origem">
                  <input
                    value={createForm.source}
                    onChange={(event) =>
                      setCreateForm((prev) => ({ ...prev, source: event.target.value }))
                    }
                    className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none placeholder:text-zinc-500 focus:border-[#8B5CF6]/20"
                    placeholder="Website, indicação, anúncio..."
                  />
                </FormField>

                <FormField label="Detalhe da origem">
                  <input
                    value={createForm.sourceDetail}
                    onChange={(event) =>
                      setCreateForm((prev) => ({
                        ...prev,
                        sourceDetail: event.target.value,
                      }))
                    }
                    className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none placeholder:text-zinc-500 focus:border-[#8B5CF6]/20"
                    placeholder="Campanha, mídia, parceiro..."
                  />
                </FormField>

                <FormField label="Prioridade">
                  <div className="flex flex-wrap gap-2">
                    {['LOW', 'MEDIUM', 'HIGH', 'URGENT'].map((option) => (
                      <button
                        key={option}
                        type="button"
                        onClick={() =>
                          setCreateForm((prev) => ({ ...prev, priority: option }))
                        }
                        className={classNames(
                          'rounded-full border px-3 py-2 text-xs transition',
                          createForm.priority === option
                            ? 'border-[#8B5CF6]/25 bg-[#8B5CF6]/10 text-white'
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
                      onChange={(event) =>
                        setCreateForm((prev) => ({
                          ...prev,
                          nextStep: event.target.value,
                        }))
                      }
                      className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none placeholder:text-zinc-500 focus:border-[#8B5CF6]/20"
                      placeholder="Enviar proposta, agendar ligação, marcar reunião..."
                    />
                  </FormField>
                </div>

                <div className="md:col-span-2">
                  <FormField label="Próxima reunião">
                    <input
                      type="date"
                      value={createForm.nextMeetingAt}
                      onChange={(event) =>
                        setCreateForm((prev) => ({
                          ...prev,
                          nextMeetingAt: event.target.value,
                        }))
                      }
                      className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none focus:border-[#8B5CF6]/20"
                    />
                  </FormField>
                </div>

                <div>
                  <FormField label="Previsão de fechamento">
                    <input
                      type="date"
                      value={createForm.expectedCloseDate}
                      onChange={(event) =>
                        setCreateForm((prev) => ({
                          ...prev,
                          expectedCloseDate: event.target.value,
                        }))
                      }
                      className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none focus:border-[#8B5CF6]/20"
                    />
                  </FormField>
                </div>

                <FormField label="Concorrente">
                  <input
                    value={createForm.competitor}
                    onChange={(event) =>
                      setCreateForm((prev) => ({
                        ...prev,
                        competitor: event.target.value,
                      }))
                    }
                    className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none placeholder:text-zinc-500 focus:border-[#8B5CF6]/20"
                    placeholder="Concorrente principal"
                  />
                </FormField>

                <FormField label="Motivo de ganho">
                  <input
                    value={createForm.wonReason}
                    onChange={(event) =>
                      setCreateForm((prev) => ({
                        ...prev,
                        wonReason: event.target.value,
                      }))
                    }
                    className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none placeholder:text-zinc-500 focus:border-[#8B5CF6]/20"
                    placeholder="Diferencial comercial ou técnico"
                  />
                </FormField>

                <div className="md:col-span-2">
                  <FormField label="Observações">
                    <textarea
                      value={createForm.notes}
                      onChange={(event) =>
                        setCreateForm((prev) => ({ ...prev, notes: event.target.value }))
                      }
                      rows={4}
                      className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none placeholder:text-zinc-500 focus:border-[#8B5CF6]/20"
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
                className="rounded-2xl border border-[#8B5CF6]/20 bg-[#8B5CF6]/10 px-4 py-3 text-sm font-medium text-white transition hover:bg-[#8B5CF6]/15 disabled:cursor-not-allowed disabled:opacity-60"
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
                <div className="text-[11px] uppercase tracking-[0.22em] text-zinc-500">
                  Editar lead
                </div>
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
                    onChange={(event) =>
                      setEditForm((prev) => ({ ...prev, name: event.target.value }))
                    }
                    className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none placeholder:text-zinc-500 focus:border-[#8B5CF6]/20"
                    placeholder="Nome do lead"
                  />
                </FormField>

                <FormField label="Empresa">
                  <input
                    value={editForm.companyName}
                    onChange={(event) =>
                      setEditForm((prev) => ({
                        ...prev,
                        companyName: event.target.value,
                      }))
                    }
                    className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none placeholder:text-zinc-500 focus:border-[#8B5CF6]/20"
                    placeholder="Empresa"
                  />
                </FormField>

                <FormField label="Telefone">
                  <input
                    value={editForm.phone}
                    onChange={(event) =>
                      setEditForm((prev) => ({ ...prev, phone: event.target.value }))
                    }
                    className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none placeholder:text-zinc-500 focus:border-[#8B5CF6]/20"
                    placeholder="Telefone"
                  />
                </FormField>

                <FormField label="E-mail">
                  <input
                    value={editForm.email}
                    onChange={(event) =>
                      setEditForm((prev) => ({ ...prev, email: event.target.value }))
                    }
                    className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none placeholder:text-zinc-500 focus:border-[#8B5CF6]/20"
                    placeholder="email@empresa.com"
                  />
                </FormField>

                <FormField label="WhatsApp">
                  <input
                    value={editForm.whatsapp}
                    onChange={(event) =>
                      setEditForm((prev) => ({
                        ...prev,
                        whatsapp: event.target.value,
                      }))
                    }
                    className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none placeholder:text-zinc-500 focus:border-[#8B5CF6]/20"
                    placeholder="WhatsApp"
                  />
                </FormField>

                <FormField label="Cargo / função">
                  <input
                    value={editForm.jobTitle}
                    onChange={(event) =>
                      setEditForm((prev) => ({
                        ...prev,
                        jobTitle: event.target.value,
                      }))
                    }
                    className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none placeholder:text-zinc-500 focus:border-[#8B5CF6]/20"
                    placeholder="Diretor comercial, gerente, comprador..."
                  />
                </FormField>

                <FormField label="Website">
                  <input
                    value={editForm.website}
                    onChange={(event) =>
                      setEditForm((prev) => ({ ...prev, website: event.target.value }))
                    }
                    className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none placeholder:text-zinc-500 focus:border-[#8B5CF6]/20"
                    placeholder="https://empresa.com"
                  />
                </FormField>

                <FormField label="Cidade">
                  <input
                    value={editForm.city}
                    onChange={(event) =>
                      setEditForm((prev) => ({ ...prev, city: event.target.value }))
                    }
                    className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none placeholder:text-zinc-500 focus:border-[#8B5CF6]/20"
                    placeholder="Cidade"
                  />
                </FormField>

                <FormField label="Estado">
                  <input
                    value={editForm.state}
                    onChange={(event) =>
                      setEditForm((prev) => ({ ...prev, state: event.target.value }))
                    }
                    className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none placeholder:text-zinc-500 focus:border-[#8B5CF6]/20"
                    placeholder="Estado"
                  />
                </FormField>

                <FormField label="Segmento">
                  <input
                    value={editForm.industry}
                    onChange={(event) =>
                      setEditForm((prev) => ({
                        ...prev,
                        industry: event.target.value,
                      }))
                    }
                    className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none placeholder:text-zinc-500 focus:border-[#8B5CF6]/20"
                    placeholder="Tecnologia, varejo, saúde..."
                  />
                </FormField>

                <FormField label="Porte da empresa">
                  <input
                    value={editForm.companySize}
                    onChange={(event) =>
                      setEditForm((prev) => ({
                        ...prev,
                        companySize: event.target.value,
                      }))
                    }
                    className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none placeholder:text-zinc-500 focus:border-[#8B5CF6]/20"
                    placeholder="Pequena, média, enterprise..."
                  />
                </FormField>

                <FormField label="Valor do negócio">
                  <input
                    value={editForm.dealValue}
                    onChange={(event) =>
                      setEditForm((prev) => ({
                        ...prev,
                        dealValue: event.target.value,
                      }))
                    }
                    className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none placeholder:text-zinc-500 focus:border-[#8B5CF6]/20"
                    placeholder="45000"
                  />
                </FormField>

                <FormField label="Probabilidade (%)">
                  <input
                    value={editForm.probability}
                    onChange={(event) =>
                      setEditForm((prev) => ({
                        ...prev,
                        probability: event.target.value,
                      }))
                    }
                    className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none placeholder:text-zinc-500 focus:border-[#8B5CF6]/20"
                    placeholder="60"
                  />
                </FormField>

                <FormField label="Origem">
                  <input
                    value={editForm.source}
                    onChange={(event) =>
                      setEditForm((prev) => ({ ...prev, source: event.target.value }))
                    }
                    className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none placeholder:text-zinc-500 focus:border-[#8B5CF6]/20"
                    placeholder="Website, indicação, anúncio..."
                  />
                </FormField>

                <FormField label="Detalhe da origem">
                  <input
                    value={editForm.sourceDetail}
                    onChange={(event) =>
                      setEditForm((prev) => ({
                        ...prev,
                        sourceDetail: event.target.value,
                      }))
                    }
                    className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none placeholder:text-zinc-500 focus:border-[#8B5CF6]/20"
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
                            ? 'border-[#8B5CF6]/25 bg-[#8B5CF6]/10 text-white'
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
                      value={editForm.nextStep}
                      onChange={(event) =>
                        setEditForm((prev) => ({
                          ...prev,
                          nextStep: event.target.value,
                        }))
                      }
                      className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none placeholder:text-zinc-500 focus:border-[#8B5CF6]/20"
                      placeholder="Enviar proposta, agendar ligação, marcar reunião..."
                    />
                  </FormField>
                </div>

                <div className="md:col-span-2">
                  <FormField label="Previsão de fechamento">
                    <input
                      type="date"
                      value={editForm.expectedCloseDate}
                      onChange={(event) =>
                        setEditForm((prev) => ({
                          ...prev,
                          expectedCloseDate: event.target.value,
                        }))
                      }
                      className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none focus:border-[#8B5CF6]/20"
                    />
                  </FormField>
                </div>

                <div>
                  <FormField label="Próxima reunião">
                    <input
                      type="date"
                      value={editForm.nextMeetingAt}
                      onChange={(event) =>
                        setEditForm((prev) => ({
                          ...prev,
                          nextMeetingAt: event.target.value,
                        }))
                      }
                      className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none focus:border-[#8B5CF6]/20"
                    />
                  </FormField>
                </div>

                <FormField label="Concorrente">
                  <input
                    value={editForm.competitor}
                    onChange={(event) =>
                      setEditForm((prev) => ({
                        ...prev,
                        competitor: event.target.value,
                      }))
                    }
                    className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none placeholder:text-zinc-500 focus:border-[#8B5CF6]/20"
                    placeholder="Concorrente principal"
                  />
                </FormField>

                <FormField label="Motivo de ganho">
                  <input
                    value={editForm.wonReason}
                    onChange={(event) =>
                      setEditForm((prev) => ({
                        ...prev,
                        wonReason: event.target.value,
                      }))
                    }
                    className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none placeholder:text-zinc-500 focus:border-[#8B5CF6]/20"
                    placeholder="Diferencial comercial ou técnico"
                  />
                </FormField>

                <div className="md:col-span-2">
                  <FormField label="Observações">
                    <textarea
                      value={editForm.notes}
                      onChange={(event) =>
                        setEditForm((prev) => ({ ...prev, notes: event.target.value }))
                      }
                      rows={4}
                      className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none placeholder:text-zinc-500 focus:border-[#8B5CF6]/20"
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
                className="rounded-2xl border border-[#8B5CF6]/20 bg-[#8B5CF6]/10 px-4 py-3 text-sm font-medium text-white transition hover:bg-[#8B5CF6]/15 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {savingEditLead ? 'Salvando...' : 'Salvar alterações'}
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
                  O lead será movido para <span className="text-white">Fechado</span> e a data
                  de ganho será registrada automaticamente.
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
                    ? 'border-[#8B5CF6]/20 bg-[#8B5CF6]/10 hover:bg-[#8B5CF6]/15'
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

function formatSalesTargetPeriodLabel(periodType: SalesTargetPeriod) {
  switch (periodType) {
    case 'DAILY':
      return 'Diária';
    case 'WEEKLY':
      return 'Semanal';
    case 'MONTHLY':
    case 'MONTH':
      return 'Mensal';
    case 'QUARTERLY':
    case 'QUARTER':
      return 'Trimestral';
    case 'YEARLY':
    case 'YEAR':
      return 'Anual';
    default:
      return periodType;
  }
}

function formatSalesTargetScope(target: CrmSalesTarget) {
  if (target.user?.name) return `Usuário · ${target.user.name}`;
  if (target.department?.name) return `Departamento · ${target.department.name}`;
  if (target.branch?.name) return `Filial · ${target.branch.name}`;
  return 'Empresa inteira';
}

function getStagePlaybook(
  status: LeadStatus,
): Array<{
  title: string;
  helper: string;
  mode: 'activity' | 'task';
  activityType?: ActivityComposerType;
  dueInDays: number;
  template: string;
}> {
  if (status === 'NEW') {
    return [
      {
        title: 'Mensagem inicial de qualificação',
        helper: 'Prepara um template de abordagem para abrir a conversa.',
        mode: 'activity',
        activityType: 'MESSAGE',
        dueInDays: 0,
        template:
          'Olá! Quero entender seu contexto, prioridade atual e como podemos ajudar com mais velocidade. Qual é o principal objetivo da sua operação neste momento?',
      },
      {
        title: 'Tarefa de primeiro contato',
        helper: 'Gera uma tarefa para não deixar o lead esfriar na entrada do pipeline.',
        mode: 'task',
        dueInDays: 1,
        template:
          'Realizar primeiro contato, validar interesse inicial e registrar qualificação básica.',
      },
    ];
  }

  if (status === 'CONTACTED') {
    return [
      {
        title: 'Roteiro de descoberta',
        helper: 'Template para aprofundar dores, timing, decisor e orçamento.',
        mode: 'activity',
        activityType: 'CALL',
        dueInDays: 0,
        template:
          'Validar problema principal, urgência, stakeholders envolvidos, orçamento disponível e critério de decisão.',
      },
      {
        title: 'Agendar reunião de diagnóstico',
        helper: 'Cria uma tarefa curta para levar o lead a uma etapa de entendimento mais forte.',
        mode: 'task',
        dueInDays: 2,
        template:
          'Agendar reunião de diagnóstico com agenda, participantes e objetivo definido.',
      },
    ];
  }

  if (status === 'PROPOSAL') {
    return [
      {
        title: 'Follow-up de proposta',
        helper: 'Template de retorno para validar leitura, objeções e prazo de decisão.',
        mode: 'activity',
        activityType: 'MESSAGE',
        dueInDays: 0,
        template:
          'Quero validar se a proposta foi bem recebida, quais pontos precisam de ajuste e qual é o prazo estimado para decisão.',
      },
      {
        title: 'Tarefa de revisão comercial',
        helper: 'Organiza o próximo checkpoint com proposta, objeções e próximos decisores.',
        mode: 'task',
        dueInDays: 1,
        template:
          'Revisar proposta enviada, registrar objeções e preparar próxima conversa com o decisor.',
      },
    ];
  }

  if (status === 'NEGOTIATION') {
    return [
      {
        title: 'Script de fechamento',
        helper: 'Template para reduzir atrito e consolidar próximos passos de fechamento.',
        mode: 'activity',
        activityType: 'CALL',
        dueInDays: 0,
        template:
          'Validar objeção final, alinhar prazo de assinatura, responsáveis internos e condição para fechamento nesta janela.',
      },
      {
        title: 'Tarefa de fechamento executivo',
        helper: 'Mantém a negociação quente com dono, prazo e entrega definidos.',
        mode: 'task',
        dueInDays: 1,
        template:
          'Executar follow-up executivo de fechamento e registrar condição final de aprovação.',
      },
    ];
  }

  return [
    {
      title: 'Revisão do negócio',
      helper: 'Template genérico de acompanhamento do estágio atual.',
      mode: 'activity',
      activityType: 'NOTE',
      dueInDays: 0,
      template:
        'Revisar contexto atual do lead, próximos passos, stakeholders envolvidos e risco de avanço.',
    },
  ];
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
    <div className="relative flex h-full min-h-[152px] flex-col overflow-hidden rounded-[26px] border border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(139,92,246,0.08),transparent_42%),linear-gradient(180deg,rgba(255,255,255,0.04),rgba(0,0,0,0.14))] p-4 shadow-[0_16px_44px_rgba(0,0,0,0.16)]">
      <div className="pointer-events-none absolute inset-x-6 top-0 h-px bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.14),transparent)]" />
      <div className="mb-3 text-[11px] uppercase tracking-[0.18em] text-zinc-500">
        {label}
      </div>
      <div className="flex flex-wrap gap-2.5">
        {options.map((option) => (
          <button
            key={`${label}-${option.id}`}
            type="button"
            onClick={() => onChange(option.id)}
            className={classNames(
              'rounded-full border px-3 py-2 text-xs transition duration-200',
              value === option.id
                ? 'border-[#8B5CF6]/25 bg-[linear-gradient(180deg,rgba(139,92,246,0.16),rgba(139,92,246,0.08))] text-white shadow-[0_10px_24px_rgba(139,92,246,0.12)]'
                : 'border-white/10 bg-white/[0.04] text-zinc-300 hover:-translate-y-0.5 hover:bg-white/[0.08]',
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
    <div className="relative flex h-full min-h-[152px] flex-col overflow-hidden rounded-[26px] border border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(109,120,255,0.08),transparent_42%),linear-gradient(180deg,rgba(255,255,255,0.04),rgba(0,0,0,0.14))] p-4 shadow-[0_16px_44px_rgba(0,0,0,0.16)]">
      <div className="pointer-events-none absolute inset-x-6 top-0 h-px bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.14),transparent)]" />
      <div className="mb-3 text-[11px] uppercase tracking-[0.18em] text-zinc-500">
        {label}
      </div>
      <div className="mt-auto grid gap-3 sm:grid-cols-2">
        <input
          value={minValue}
          onChange={(event) => onMinChange(event.target.value)}
          placeholder={minPlaceholder}
          className="w-full rounded-[22px] border border-white/10 bg-white/[0.05] px-4 py-3 text-sm text-white outline-none transition placeholder:text-zinc-500 focus:border-[#8B5CF6]/20 focus:bg-white/[0.08]"
        />
        <input
          value={maxValue}
          onChange={(event) => onMaxChange(event.target.value)}
          placeholder={maxPlaceholder}
          className="w-full rounded-[22px] border border-white/10 bg-white/[0.05] px-4 py-3 text-sm text-white outline-none transition placeholder:text-zinc-500 focus:border-[#8B5CF6]/20 focus:bg-white/[0.08]"
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
    <div className="relative flex h-full min-h-[152px] flex-col overflow-hidden rounded-[26px] border border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(139,92,246,0.06),transparent_44%),linear-gradient(180deg,rgba(255,255,255,0.04),rgba(0,0,0,0.14))] p-4 shadow-[0_16px_44px_rgba(0,0,0,0.16)]">
      <div className="pointer-events-none absolute inset-x-6 top-0 h-px bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.14),transparent)]" />
      <div className="mb-3 text-[11px] uppercase tracking-[0.18em] text-zinc-500">
        {label}
      </div>
      <div className="mt-auto grid gap-3 sm:grid-cols-2">
        <input
          type="date"
          value={fromValue}
          onChange={(event) => onFromChange(event.target.value)}
          className="w-full rounded-[22px] border border-white/10 bg-white/[0.05] px-4 py-3 text-sm text-white outline-none transition focus:border-[#8B5CF6]/20 focus:bg-white/[0.08]"
        />
        <input
          type="date"
          value={toValue}
          onChange={(event) => onToChange(event.target.value)}
          className="w-full rounded-[22px] border border-white/10 bg-white/[0.05] px-4 py-3 text-sm text-white outline-none transition focus:border-[#8B5CF6]/20 focus:bg-white/[0.08]"
        />
      </div>
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0 rounded-[22px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.05),rgba(255,255,255,0.02))] p-3.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]">
      <div className="text-[11px] uppercase tracking-[0.16em] text-zinc-500">{label}</div>
      <div className="mt-2 break-words text-sm font-medium leading-6 text-white">{value}</div>
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
    <div className="relative flex h-full min-h-[236px] flex-col overflow-hidden rounded-[24px] border border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(139,92,246,0.06),transparent_38%),linear-gradient(180deg,rgba(255,255,255,0.04),rgba(0,0,0,0.14))] p-4 shadow-[0_18px_48px_rgba(0,0,0,0.18)]">
      <div className="pointer-events-none absolute inset-x-6 top-0 h-px bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.14),transparent)]" />
      <div className="text-[11px] uppercase tracking-[0.18em] text-zinc-500">{title}</div>
      <div className="mt-3 space-y-2.5">
        {rows.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.03] px-4 py-6 text-center text-sm text-zinc-500">
            Sem dados para este recorte.
          </div>
        ) : (
          rows.slice(0, 5).map((row) => (
            <div
              key={`${title}-${row.label}`}
              className="flex items-start justify-between gap-3 rounded-[20px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.05),rgba(255,255,255,0.02))] px-3.5 py-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]"
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

function ReportBarChartCard({
  title,
  subtitle,
  rows,
  accent = 'purple',
}: {
  title: string;
  subtitle: string;
  rows: Array<{ label: string; value: number; helper: string; valueLabel: string }>;
  accent?: 'purple' | 'blue' | 'green';
}) {
  const topRows = rows
    .filter((row) => Number.isFinite(row.value) && row.value >= 0)
    .sort((a, b) => b.value - a.value)
    .slice(0, 4);

  const maxValue = topRows.reduce((current, row) => Math.max(current, row.value), 0);
  const barClass =
    accent === 'blue'
      ? 'bg-[linear-gradient(90deg,rgba(120,168,255,0.95),rgba(178,206,255,0.9))]'
      : accent === 'green'
        ? 'bg-[linear-gradient(90deg,rgba(34,197,94,0.95),rgba(134,239,172,0.9))]'
      : 'bg-[linear-gradient(90deg,rgba(139,92,246,0.95),rgba(221,214,254,0.92))]';

  return (
    <div className="relative overflow-hidden rounded-[26px] border border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(139,92,246,0.07),transparent_38%),linear-gradient(180deg,rgba(255,255,255,0.04),rgba(0,0,0,0.14))] p-4 shadow-[0_18px_48px_rgba(0,0,0,0.18)]">
      <div className="pointer-events-none absolute inset-x-6 top-0 h-px bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.14),transparent)]" />
      <div className="text-[11px] uppercase tracking-[0.18em] text-zinc-500">{title}</div>
      <div className="mt-2 text-sm leading-6 text-zinc-400">{subtitle}</div>

      <div className="mt-4 space-y-3">
        {topRows.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.03] px-4 py-8 text-center text-sm text-zinc-500">
            Sem dados para este recorte.
          </div>
        ) : (
          topRows.map((row) => {
            const width = maxValue > 0 ? Math.max((row.value / maxValue) * 100, 8) : 18;

            return (
              <div key={`${title}-${row.label}`} className="space-y-2">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="truncate text-sm font-medium text-white">
                      {normalizeUiText(row.label)}
                    </div>
                    <div className="mt-1 text-xs text-zinc-500">{row.helper}</div>
                  </div>
                  <div className="shrink-0 text-sm font-medium text-white">{row.valueLabel}</div>
                </div>
                <div className="h-2.5 rounded-full bg-white/[0.05]">
                  <div
                    className={`h-2.5 rounded-full shadow-[0_0_18px_rgba(255,255,255,0.08)] ${barClass}`}
                    style={{ width: `${width}%` }}
                  />
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

function WonLostTrendCard({
  title,
  subtitle,
  rows,
}: {
  title: string;
  subtitle: string;
  rows: Array<{ period: string; won: number; lost: number }>;
}) {
  const topRows = rows.slice(0, 5);
  const maxValue = topRows.reduce((current, row) => Math.max(current, row.won + row.lost), 0);

  return (
    <div className="relative overflow-hidden rounded-[26px] border border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(109,120,255,0.08),transparent_38%),linear-gradient(180deg,rgba(255,255,255,0.04),rgba(0,0,0,0.14))] p-4 shadow-[0_18px_48px_rgba(0,0,0,0.18)]">
      <div className="pointer-events-none absolute inset-x-6 top-0 h-px bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.14),transparent)]" />
      <div className="text-[11px] uppercase tracking-[0.18em] text-zinc-500">{title}</div>
      <div className="mt-2 text-sm leading-6 text-zinc-400">{subtitle}</div>

      <div className="mt-4 space-y-3">
        {topRows.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.03] px-4 py-8 text-center text-sm text-zinc-500">
            Sem dados para este recorte.
          </div>
        ) : (
          topRows.map((row) => {
            const total = row.won + row.lost;
            const width = maxValue > 0 ? Math.max((total / maxValue) * 100, 12) : 0;
            const wonWidth = total > 0 ? (row.won / total) * 100 : 0;
            const lostWidth = total > 0 ? (row.lost / total) * 100 : 0;

            return (
              <div key={`${title}-${row.period}`} className="space-y-2">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="truncate text-sm font-medium text-white">
                      {normalizeUiText(row.period)}
                    </div>
                    <div className="mt-1 text-xs text-zinc-500">
                      {row.won} ganho(s) · {row.lost} perdido(s)
                    </div>
                  </div>
                  <div className="shrink-0 text-sm font-medium text-white">{total}</div>
                </div>
                <div className="h-2.5 rounded-full bg-white/[0.05]">
                  <div
                    className="flex h-2.5 overflow-hidden rounded-full"
                    style={{ width: `${width}%` }}
                  >
                    <div
                      className="h-full bg-[linear-gradient(90deg,rgba(139,92,246,0.95),rgba(167,255,202,0.9))]"
                      style={{ width: `${wonWidth}%` }}
                    />
                    <div
                      className="h-full bg-[linear-gradient(90deg,rgba(255,111,111,0.95),rgba(255,170,170,0.9))]"
                      style={{ width: `${lostWidth}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

function ExecutiveAreaChartCard({
  title,
  subtitle,
  rows,
}: {
  title: string;
  subtitle: string;
  rows: Array<{ period: string; won: number; lost: number }>;
}) {
  const points = rows.slice(0, 6);
  const totals = points.map((row) => row.won + row.lost);
  const max = Math.max(...totals, 1);
  const currentTotal = totals[totals.length - 1] || 0;
  const previousTotal = totals[totals.length - 2] || 0;
  const delta = currentTotal - previousTotal;
  const deltaLabel =
    previousTotal > 0
      ? `${delta >= 0 ? '+' : ''}${Math.round((delta / previousTotal) * 100)}%`
      : currentTotal > 0
        ? '+100%'
        : '0%';

  const buildPath = (values: number[]) =>
    values
      .map((value, index) => {
        const x = values.length === 1 ? 12 : 12 + (index / Math.max(values.length - 1, 1)) * 76;
        const y = 84 - (value / max) * 54;
        return `${index === 0 ? 'M' : 'L'} ${x} ${y}`;
      })
      .join(' ');

  const totalPath = buildPath(totals);
  const wonPath = buildPath(points.map((row) => row.won));
  const focusIndex = points.length > 0 ? Math.floor(points.length / 2) : 0;
  const focusValue = totals[focusIndex] || 0;
  const focusX = points.length <= 1 ? 12 : 12 + (focusIndex / Math.max(points.length - 1, 1)) * 76;
  const focusY = 84 - (focusValue / max) * 54;

  return (
    <div className="relative overflow-hidden rounded-[28px] border border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(120,168,255,0.1),transparent_28%),linear-gradient(180deg,rgba(255,255,255,0.04),rgba(6,10,20,0.34))] p-4 shadow-[0_24px_80px_rgba(0,0,0,0.24)]">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-[11px] uppercase tracking-[0.2em] text-zinc-500">{title}</div>
          <div className="mt-2 text-sm leading-6 text-zinc-400">{subtitle}</div>
        </div>
        <div className="text-right">
          <div className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs text-white">
            {points.reduce((sum, row) => sum + row.won, 0)} ganhos
          </div>
          <div
            className={classNames(
              'mt-2 text-xs',
              delta >= 0 ? 'text-emerald-300' : 'text-amber-200',
            )}
          >
            {deltaLabel} vs periodo anterior
          </div>
        </div>
      </div>

      <div className="mt-5">
        {points.length === 0 ? (
          <div className="rounded-[22px] border border-dashed border-white/10 bg-white/[0.03] px-4 py-14 text-center text-sm text-zinc-500">
            Sem dados para este recorte.
          </div>
        ) : (
          <>
            <div className="relative h-[260px] rounded-[24px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.02),rgba(0,0,0,0.18))] p-4">
              <div className="pointer-events-none absolute inset-4 grid grid-rows-4">
                {[0, 1, 2, 3].map((line) => (
                  <div
                    key={line}
                    className="border-b border-dashed border-white/10 last:border-b-0"
                  />
                ))}
              </div>
              <svg viewBox="0 0 100 100" className="relative h-full w-full overflow-visible">
                <defs>
                  <linearGradient id="crm-area-fill" x1="0%" x2="0%" y1="0%" y2="100%">
                    <stop offset="0%" stopColor="rgba(191,219,254,0.9)" />
                    <stop offset="100%" stopColor="rgba(191,219,254,0.03)" />
                  </linearGradient>
                </defs>
                <path d={`${totalPath} L 88 96 L 12 96 Z`} fill="url(#crm-area-fill)" opacity="0.95" />
                <path d={totalPath} fill="none" stroke="rgba(226,232,240,0.95)" strokeWidth="1.6" />
                <path d={wonPath} fill="none" stroke="rgba(56,189,248,0.95)" strokeWidth="1.25" />
                <line
                  x1={focusX}
                  y1="14"
                  x2={focusX}
                  y2="96"
                  stroke="rgba(255,255,255,0.18)"
                  strokeDasharray="2.5 3"
                />
                <circle cx={focusX} cy={focusY} r="2.4" fill="white" stroke="rgba(56,189,248,0.95)" strokeWidth="1.4" />
              </svg>
              <div className="absolute left-[52%] top-6 -translate-x-1/2 rounded-[18px] border border-white/10 bg-[#BFC8D8] px-3 py-2 text-center text-[#1B2433] shadow-[0_18px_48px_rgba(0,0,0,0.24)]">
                <div className="text-lg font-semibold">{focusValue}</div>
                <div className="text-xs">{points[focusIndex]?.period || 'Sem periodo'}</div>
              </div>
            </div>
            <div className="mt-3 grid grid-cols-6 gap-2 text-center text-xs text-zinc-500">
              {points.map((row) => (
                <div key={row.period}>{normalizeUiText(row.period)}</div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function ExecutiveDonutCard({
  title,
  subtitle,
  rows,
}: {
  title: string;
  subtitle: string;
  rows: Array<{ label: string; value: number; helper: string }>;
}) {
  const items = rows.filter((row) => row.value > 0).slice(0, 5);
  const total = items.reduce((sum, row) => sum + row.value, 0);
  const palette = ['#DCEFFF', '#FFC98B', '#DFF0AE', '#8D95A6', '#7DD3FC'];
  const dominantSegment =
    [...items].sort((a, b) => b.value - a.value)[0] || null;

  const segments = items.reduce<
    Array<{ label: string; value: number; helper: string; color: string; start: number; angle: number }>
  >((acc, item, index) => {
    const angle = total > 0 ? (item.value / total) * 360 : 0;
    const start = acc.length === 0 ? 0 : acc[acc.length - 1].start + acc[acc.length - 1].angle;
    return [
      ...acc,
      { ...item, color: palette[index % palette.length], start, angle },
    ];
  }, []);

  return (
    <div className="rounded-[28px] border border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.06),transparent_26%),linear-gradient(180deg,rgba(255,255,255,0.03),rgba(6,10,20,0.28))] p-4 shadow-[0_24px_80px_rgba(0,0,0,0.22)]">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-[11px] uppercase tracking-[0.2em] text-zinc-500">{title}</div>
          <div className="mt-2 text-sm leading-6 text-zinc-400">{subtitle}</div>
        </div>
        <div className="text-right">
          <div className="text-2xl font-semibold text-white">{total}</div>
          <div className="text-xs text-zinc-500">oportunidades</div>
          <div className="mt-2 text-xs text-zinc-400">
            {dominantSegment
              ? `${Math.round((dominantSegment.value / Math.max(total, 1)) * 100)}% em ${normalizeUiText(dominantSegment.label)}`
              : 'Sem concentracao dominante'}
          </div>
        </div>
      </div>

      <div className="mt-5 flex flex-col gap-4 md:flex-row md:items-center">
        <div className="relative mx-auto h-[220px] w-[220px] shrink-0">
          <div
            className="absolute inset-0 rounded-full"
            style={{
              background:
                segments.length === 0
                  ? 'conic-gradient(rgba(255,255,255,0.08) 0 360deg)'
                  : `conic-gradient(${segments
                      .map((segment) => `${segment.color} ${segment.start}deg ${segment.start + segment.angle}deg`)
                      .join(', ')})`,
            }}
          />
          <div className="absolute inset-[48px] rounded-full border border-white/10 bg-[#0F1524]" />
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <div className="text-[11px] uppercase tracking-[0.18em] text-zinc-500">Mix do funil</div>
            <div className="mt-2 text-3xl font-semibold text-white">{total}</div>
            <div className="mt-1 text-xs text-zinc-500">etapas com volume</div>
          </div>
        </div>

        <div className="flex-1 space-y-2.5">
          {segments.length === 0 ? (
            <div className="rounded-[20px] border border-dashed border-white/10 bg-white/[0.03] px-4 py-10 text-center text-sm text-zinc-500">
              Sem dados para este recorte.
            </div>
          ) : (
            segments.map((segment) => (
              <div
                key={segment.label}
                className="rounded-[20px] border border-white/10 bg-black/20 px-3.5 py-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span
                        className="h-2.5 w-2.5 rounded-full"
                        style={{ backgroundColor: segment.color }}
                      />
                      <span className="truncate text-sm font-medium text-white">
                        {segment.label}
                      </span>
                    </div>
                    <div className="mt-1 text-xs text-zinc-500">{segment.helper}</div>
                  </div>
                  <div className="shrink-0 text-sm font-medium text-white">
                    {total > 0 ? `${Math.round((segment.value / total) * 100)}%` : '0%'}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

function ExecutiveColumnChartCard({
  title,
  subtitle,
  rows,
}: {
  title: string;
  subtitle: string;
  rows: Array<{ label: string; value: number; helper: string; valueLabel: string }>;
}) {
  const items = rows.filter((row) => row.value >= 0).slice(0, 6);
  const max = Math.max(...items.map((row) => row.value), 1);
  const topItem = [...items].sort((a, b) => b.value - a.value)[0] || null;
  const topShare = topItem ? Math.round((topItem.value / Math.max(items.reduce((sum, row) => sum + row.value, 0), 1)) * 100) : 0;

  return (
    <div className="rounded-[28px] border border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(88,196,255,0.08),transparent_24%),linear-gradient(180deg,rgba(255,255,255,0.03),rgba(6,10,20,0.28))] p-4 shadow-[0_24px_80px_rgba(0,0,0,0.22)]">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-[11px] uppercase tracking-[0.2em] text-zinc-500">{title}</div>
          <div className="mt-2 text-sm leading-6 text-zinc-400">{subtitle}</div>
        </div>
        <div className="text-right text-xs text-zinc-400">
          {topItem ? `${normalizeUiText(topItem.label)} lidera com ${topShare}%` : 'Sem owner lider'}
        </div>
      </div>

      <div className="mt-5">
        {items.length === 0 ? (
          <div className="rounded-[20px] border border-dashed border-white/10 bg-white/[0.03] px-4 py-12 text-center text-sm text-zinc-500">
            Sem dados para este recorte.
          </div>
        ) : (
          <>
            <div className="flex h-[240px] items-end gap-3 rounded-[22px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.02),rgba(0,0,0,0.18))] p-4">
              {items.map((item, index) => {
                const height = Math.max((item.value / max) * 100, 14);
                const active = index === items.length - 2 || index === items.length - 1;
                return (
                  <div key={item.label} className="flex min-w-0 flex-1 flex-col justify-end gap-3">
                    <div className="text-center text-xs text-zinc-400">{item.valueLabel}</div>
                    <div
                      className={
                        active
                          ? 'rounded-t-[14px] bg-[linear-gradient(180deg,#41E0D0,#5D8BFF)] shadow-[0_0_22px_rgba(93,139,255,0.22)]'
                          : 'rounded-t-[14px] bg-[linear-gradient(180deg,#CFE3EA,#8FB0C7)]'
                      }
                      style={{ height: `${height}%` }}
                    />
                    <div className="text-center text-xs text-zinc-500">{normalizeUiText(item.label)}</div>
                  </div>
                );
              })}
            </div>
            <div className="mt-3 grid gap-2 md:grid-cols-3">
              {items.slice(0, 3).map((item) => (
                <MiniStat
                  key={`${title}-${item.label}`}
                  label={normalizeUiText(item.label)}
                  value={item.helper}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function ExecutiveRankCard({
  title,
  subtitle,
  rows,
}: {
  title: string;
  subtitle: string;
  rows: Array<{ label: string; value: string; helper: string }>;
}) {
  return (
    <div className="rounded-[28px] border border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.04),transparent_22%),linear-gradient(180deg,rgba(255,255,255,0.03),rgba(6,10,20,0.28))] p-4 shadow-[0_24px_80px_rgba(0,0,0,0.22)]">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-[11px] uppercase tracking-[0.2em] text-zinc-500">{title}</div>
          <div className="mt-2 text-sm leading-6 text-zinc-400">{subtitle}</div>
        </div>
      </div>

      <div className="mt-5 space-y-3">
        {rows.map((row, index) => (
          <div
            key={`${title}-${row.label}`}
            className="rounded-[20px] border border-white/10 bg-black/20 px-3.5 py-3"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex min-w-0 items-start gap-3">
                <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/[0.05] text-xs text-zinc-300">
                  0{index + 1}
                </div>
                <div className="min-w-0">
                  <div className="truncate text-sm font-medium text-white">{row.label}</div>
                  <div className="mt-1 text-xs text-zinc-500">{row.helper}</div>
                </div>
              </div>
              <div className="shrink-0 text-sm font-medium text-white">{row.value}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ExecutiveSpotlightCard({
  label,
  value,
  helper,
  accent = 'default',
}: {
  label: string;
  value: string;
  helper: string;
  accent?: 'default' | 'success' | 'danger';
}) {
  const valueClass =
    accent === 'success'
      ? 'text-[#C4B5FD]'
      : accent === 'danger'
        ? 'text-red-300'
        : 'text-white';

  return (
    <div className="rounded-[22px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.035),rgba(0,0,0,0.16))] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]">
      <div className="text-[11px] uppercase tracking-[0.18em] text-zinc-500">{label}</div>
      <div className={`mt-2 text-[26px] font-semibold tracking-[-0.03em] ${valueClass}`}>
        {value}
      </div>
      <div className="mt-1 text-xs leading-5 text-zinc-400">{helper}</div>
    </div>
  );
}

function EnterpriseHubCard({
  eyebrow,
  title,
  metric,
  helper,
  rows,
  actionLabel,
  onAction,
  loading,
}: {
  eyebrow: string;
  title: string;
  metric: string;
  helper: string;
  rows: Array<{ label: string; helper: string; value: string }>;
  actionLabel: string;
  onAction: () => void;
  loading: boolean;
}) {
  return (
    <div className="rounded-[26px] border border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(139,92,246,0.08),transparent_42%),linear-gradient(180deg,rgba(255,255,255,0.035),rgba(0,0,0,0.12))] p-4 shadow-[0_18px_48px_rgba(0,0,0,0.18)]">
      <div className="text-[11px] uppercase tracking-[0.18em] text-zinc-500">{eyebrow}</div>
      <div className="mt-2 text-sm font-medium text-white">{title}</div>
      <div className="mt-3 text-[22px] font-semibold tracking-[-0.03em] text-white">{metric}</div>
      <div className="mt-1 text-xs leading-5 text-zinc-500">{helper}</div>

      <div className="mt-4 space-y-2.5">
        {loading ? (
          <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.03] px-3 py-6 text-center text-sm text-zinc-500">
            Carregando...
          </div>
        ) : rows.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.03] px-3 py-6 text-center text-sm text-zinc-500">
            Sem dados neste recorte.
          </div>
        ) : (
          rows.map((row) => (
            <div
              key={`${title}-${row.label}-${row.value}`}
              className="rounded-[18px] border border-white/10 bg-black/20 px-3 py-2.5"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="truncate text-sm text-white">{row.label}</div>
                  <div className="mt-1 text-xs text-zinc-500">{row.helper}</div>
                </div>
                <div className="shrink-0 text-xs font-medium uppercase tracking-[0.16em] text-[#E9DDFF]">
                  {row.value}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <button
        type="button"
        onClick={onAction}
        className="mt-4 w-full rounded-2xl border border-[#8B5CF6]/20 bg-[#8B5CF6]/10 px-3.5 py-2.5 text-sm font-medium text-white transition hover:bg-[#8B5CF6]/15"
      >
        {actionLabel}
      </button>
    </div>
  );
}

function EnterpriseWorkspaceModal({
  eyebrow,
  title,
  description,
  onClose,
  onSave,
  saving,
  saveLabel,
  children,
}: {
  eyebrow: string;
  title: string;
  description: string;
  onClose: () => void;
  onSave: () => void;
  saving: boolean;
  saveLabel: string;
  children: React.ReactNode;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/70 p-4 backdrop-blur-sm md:items-center">
      <div className="flex max-h-[calc(100vh-2rem)] w-full max-w-3xl flex-col overflow-hidden rounded-[30px] border border-white/10 bg-[#0A0C0D] shadow-[0_28px_120px_rgba(0,0,0,0.42)] md:max-h-[calc(100vh-3rem)]">
        <div className="flex shrink-0 items-start justify-between gap-4 border-b border-white/10 px-6 py-5">
          <div>
            <div className="text-[11px] uppercase tracking-[0.22em] text-zinc-500">{eyebrow}</div>
            <div className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-white">{title}</div>
            <div className="mt-1 text-sm text-zinc-500">{description}</div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-zinc-300 transition hover:bg-white/10"
          >
            Fechar
          </button>
        </div>

        <div className="crm-scroll flex-1 overflow-y-auto px-6 py-5">{children}</div>

        <div className="flex shrink-0 justify-end border-t border-white/10 px-6 py-4">
          <button
            type="button"
            onClick={onSave}
            disabled={saving}
            className="rounded-2xl border border-[#8B5CF6]/20 bg-[#8B5CF6]/10 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-[#8B5CF6]/15 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving ? 'Salvando...' : saveLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

function CompactFilterStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[22px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.05),rgba(255,255,255,0.02))] p-3.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]">
      <div className="text-[11px] uppercase tracking-[0.16em] text-zinc-500">{label}</div>
      <div className="mt-2 truncate text-sm font-medium text-white">{value}</div>
    </div>
  );
}

function SidebarMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0 rounded-[20px] border border-white/10 bg-black/20 p-3.5">
      <div className="text-[11px] uppercase tracking-[0.18em] text-zinc-500">{label}</div>
      <div className="mt-1.5 break-words text-[17px] font-semibold tracking-[-0.02em] text-white">
        {value}
      </div>
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

