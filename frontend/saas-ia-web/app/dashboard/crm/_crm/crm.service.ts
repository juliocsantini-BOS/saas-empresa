import axios from 'axios';
import { API_URL } from './constants';
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
  CrmPipelineStage,
  CrmQuote,
  CrmRoutingRule,
  CrmSavedView,
  CrmSavedViewFilters,
  CrmSalesTarget,
  CrmSequence,
  CreateCrmSalesTargetInput,
  CreateLeadTaskForm,
  CreateLeadForm,
  EditLeadForm,
  ExtendedLeadItem,
  LeadActivity,
  LeadTask,
} from './types';

export type AuthHeaders = Record<string, string>;

export type CrmLeadsQueryParams = {
  q?: string;
  status?: string;
  ownerUserId?: string;
  branchId?: string;
  departmentId?: string;
  source?: string;
  priority?: string;
  accountId?: string;
  contactId?: string;
  forecastCategory?: string;
  page?: number;
  pageSize?: number;
  sortBy?: 'createdAt' | 'updatedAt' | 'expectedCloseDate' | 'lastActivityAt';
  sortOrder?: 'asc' | 'desc';
};

export type PaginatedCrmLeadsResponse = {
  items: ExtendedLeadItem[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

export type CrmLeadDetailsResponse = ExtendedLeadItem & {
  activities: LeadActivity[];
  tasks: LeadTask[];
  summary: {
    activitiesCount: number;
    openTasksCount: number;
    completedTasksCount: number;
    emailMessagesCount?: number;
    sequenceEnrollmentsCount?: number;
    quotesCount?: number;
    documentsCount?: number;
    conversationInsightsCount?: number;
  };
};

type SavedViewApiItem = {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  filtersJson: CrmSavedViewFilters;
};

function cleanString(value: unknown): string | undefined {
  if (typeof value !== 'string') return undefined;
  const trimmed = value.trim();
  return trimmed || undefined;
}

function cleanNumber(value: unknown): number | undefined {
  if (typeof value === 'number' && Number.isFinite(value)) return value;

  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (!trimmed) return undefined;
    const parsed = Number(trimmed);
    return Number.isFinite(parsed) ? parsed : undefined;
  }

  return undefined;
}

function buildLeadPayload(form: CreateLeadForm | EditLeadForm) {
  const raw = form as Record<string, unknown>;

  return {
    name: cleanString(raw.name) ?? '',
    phone: cleanString(raw.phone),
    whatsapp: cleanString(raw.whatsapp),
    email: cleanString(raw.email),
    companyName: cleanString(raw.companyName),
    jobTitle: cleanString(raw.jobTitle),
    website: cleanString(raw.website),
    city: cleanString(raw.city),
    state: cleanString(raw.state),
    industry: cleanString(raw.industry),
    companySize: cleanString(raw.companySize),
    notes: cleanString(raw.notes),
    accountId: cleanString(raw.accountId),
    contactId: cleanString(raw.contactId),
    forecastCategory: cleanString(raw.forecastCategory),
    dealValue: cleanString(raw.dealValue),
    currency: cleanString(raw.currency),
    probability: cleanNumber(raw.probability),
    source: cleanString(raw.source),
    sourceDetail: cleanString(raw.sourceDetail),
    priority: cleanString(raw.priority),
    competitor: cleanString(raw.competitor),
    wonReason: cleanString(raw.wonReason),
    lostReason: cleanString(raw.lostReason),
    nextStep: cleanString(raw.nextStep),
    nextStepDueAt: cleanString(raw.nextStepDueAt),
    nextMeetingAt: cleanString(raw.nextMeetingAt),
    expectedCloseDate: cleanString(raw.expectedCloseDate),
    ownerUserId: cleanString(raw.ownerUserId),
    branchId: cleanString(raw.branchId),
    departmentId: cleanString(raw.departmentId),
  };
}

export async function getCrmLeads(
  headers: AuthHeaders,
  params: CrmLeadsQueryParams = {},
): Promise<PaginatedCrmLeadsResponse> {
  const response = await axios.get<PaginatedCrmLeadsResponse>(`${API_URL}/v1/crm/leads`, {
    headers,
    params,
  });

  return response.data;
}

export async function getCrmLeadDetails(
  leadId: string,
  headers: AuthHeaders,
): Promise<CrmLeadDetailsResponse> {
  const response = await axios.get<CrmLeadDetailsResponse>(
    `${API_URL}/v1/crm/leads/${leadId}`,
    { headers },
  );

  return response.data;
}

export async function getCrmSavedViews(
  headers: AuthHeaders,
): Promise<CrmSavedView[]> {
  const response = await axios.get<SavedViewApiItem[]>(
    `${API_URL}/v1/crm/leads/saved-views`,
    { headers },
  );

  return response.data.map((item) => ({
    id: item.id,
    name: item.name,
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
    filters: item.filtersJson,
  }));
}

export async function getMyCrmPermissions(
  headers: AuthHeaders,
): Promise<string[]> {
  const response = await axios.get<string[]>(`${API_URL}/v1/rbac/me`, {
    headers,
  });

  return Array.isArray(response.data) ? response.data : [];
}

export async function createCrmSavedView(
  headers: AuthHeaders,
  input: { name: string; filters: CrmSavedViewFilters },
): Promise<CrmSavedView> {
  const response = await axios.post<SavedViewApiItem>(
    `${API_URL}/v1/crm/leads/saved-views`,
    {
      name: input.name.trim(),
      filters: input.filters,
    },
    { headers },
  );

  return {
    id: response.data.id,
    name: response.data.name,
    createdAt: response.data.createdAt,
    updatedAt: response.data.updatedAt,
    filters: response.data.filtersJson,
  };
}

export async function deleteCrmSavedView(
  headers: AuthHeaders,
  viewId: string,
) {
  const response = await axios.delete(
    `${API_URL}/v1/crm/leads/saved-views/${viewId}`,
    { headers },
  );

  return response.data;
}

export async function getCrmLeadActivities(
  leadId: string,
  headers: AuthHeaders,
) {
  const response = await axios.get<LeadActivity[]>(
    `${API_URL}/v1/crm/leads/${leadId}/activities`,
    { headers },
  );

  return response.data;
}

export async function getCrmLeadTasks(
  leadId: string,
  headers: AuthHeaders,
) {
  const response = await axios.get<LeadTask[]>(
    `${API_URL}/v1/crm/leads/${leadId}/tasks`,
    { headers },
  );

  return response.data;
}

export async function createCrmLeadActivity(
  headers: AuthHeaders,
  leadId: string,
  input: { type: ActivityComposerType; description: string },
) {
  const response = await axios.post(
    `${API_URL}/v1/crm/leads/${leadId}/activities`,
    input,
    { headers },
  );

  return response.data;
}

export async function createCrmLeadTask(
  headers: AuthHeaders,
  leadId: string,
  input: CreateLeadTaskForm,
) {
  const raw = input as Record<string, unknown>;

  const response = await axios.post(
    `${API_URL}/v1/crm/leads/${leadId}/tasks`,
    {
      title: cleanString(raw.title) ?? '',
      description: cleanString(raw.description),
      dueAt: cleanString(raw.dueAt),
      assignedUserId: cleanString(raw.assignedUserId),
    },
    { headers },
  );

  return response.data;
}

export async function createCrmLead(
  headers: AuthHeaders,
  createForm: CreateLeadForm,
) {
  const payload = buildLeadPayload(createForm);

  const response = await axios.post(`${API_URL}/v1/crm/leads`, payload, {
    headers,
  });

  return response.data;
}

export async function updateCrmLead(
  headers: AuthHeaders,
  leadId: string,
  editForm: EditLeadForm,
) {
  const payload = buildLeadPayload(editForm);

  const response = await axios.patch(
    `${API_URL}/v1/crm/leads/${leadId}`,
    payload,
    { headers },
  );

  return response.data;
}

export async function patchCrmLeadFields(
  headers: AuthHeaders,
  leadId: string,
  input: {
    status?: string;
    ownerUserId?: string;
    priority?: string;
    lostReason?: string;
  },
): Promise<ExtendedLeadItem> {
  const response = await axios.patch<ExtendedLeadItem>(
    `${API_URL}/v1/crm/leads/${leadId}`,
    input,
    { headers },
  );

  return response.data;
}

export async function bulkUpdateCrmLeadFields(
  headers: AuthHeaders,
  input: {
    leadIds: string[];
    status?: string;
    ownerUserId?: string;
    priority?: string;
  },
): Promise<ExtendedLeadItem[]> {
  const response = await axios.patch<ExtendedLeadItem[]>(
    `${API_URL}/v1/crm/leads/bulk`,
    input,
    { headers },
  );

  return Array.isArray(response.data) ? response.data : [];
}

export async function updateCrmLeadStatus(
  headers: AuthHeaders,
  leadId: string,
  status: string,
) {
  return patchCrmLeadFields(headers, leadId, { status });
}

export async function updateCrmLeadOutcome(
  headers: AuthHeaders,
  leadId: string,
  input: { status: 'WON' | 'LOST'; lostReason?: string },
) {
  const response = await axios.patch(
    `${API_URL}/v1/crm/leads/${leadId}`,
    {
      status: input.status,
      lostReason:
        input.status === 'LOST'
          ? input.lostReason?.trim() || undefined
          : undefined,
    },
    { headers },
  );

  return response.data;
}

export async function completeCrmLeadTask(
  headers: AuthHeaders,
  taskId: string,
) {
  const response = await axios.patch(
    `${API_URL}/v1/crm/leads/tasks/${taskId}/complete`,
    undefined,
    { headers },
  );

  return response.data;
}

export async function reopenCrmLeadTask(
  headers: AuthHeaders,
  taskId: string,
) {
  const response = await axios.patch(
    `${API_URL}/v1/crm/leads/tasks/${taskId}/reopen`,
    undefined,
    { headers },
  );

  return response.data;
}

export async function deleteCrmLead(
  headers: AuthHeaders,
  leadId: string,
) {
  const response = await axios.delete(`${API_URL}/v1/crm/leads/${leadId}`, {
    headers,
  });

  return response.data;
}

export async function getCrmPipeline(headers: AuthHeaders) {
  const response = await axios.get<Record<string, ExtendedLeadItem[]>>(
    `${API_URL}/v1/crm/leads/pipeline`,
    { headers },
  );

  return response.data;
}

export async function listCrmPipelines(
  headers: AuthHeaders,
): Promise<CrmPipeline[]> {
  const response = await axios.get<CrmPipeline[]>(`${API_URL}/v1/crm/pipelines`, {
    headers,
  });

  return Array.isArray(response.data) ? response.data : [];
}

export async function createCrmPipeline(
  headers: AuthHeaders,
  input: {
    name: string;
    description?: string;
    isDefault?: boolean;
    stages?: Array<{
      name: string;
      color?: string;
      statusBase: string;
      isActive?: boolean;
    }>;
  },
): Promise<CrmPipeline> {
  const response = await axios.post<CrmPipeline>(
    `${API_URL}/v1/crm/pipelines`,
    {
      name: input.name.trim(),
      description: cleanString(input.description),
      isDefault: !!input.isDefault,
      stages: Array.isArray(input.stages)
        ? input.stages.map((stage) => ({
            name: stage.name.trim(),
            color: cleanString(stage.color),
            statusBase: stage.statusBase,
            isActive: stage.isActive ?? true,
          }))
        : [],
    },
    { headers },
  );

  return response.data;
}

export async function deleteCrmPipeline(
  headers: AuthHeaders,
  pipelineId: string,
) {
  const response = await axios.delete(`${API_URL}/v1/crm/pipelines/${pipelineId}`, {
    headers,
  });

  return response.data;
}

export async function createCrmPipelineStage(
  headers: AuthHeaders,
  pipelineId: string,
  input: {
    name: string;
    order: number;
    color?: string;
    statusBase: string;
    isActive?: boolean;
  },
): Promise<CrmPipelineStage> {
  const response = await axios.post<CrmPipelineStage>(
    `${API_URL}/v1/crm/pipelines/${pipelineId}/stages`,
    {
      name: input.name.trim(),
      order: input.order,
      color: cleanString(input.color),
      statusBase: input.statusBase,
      isActive: input.isActive ?? true,
    },
    { headers },
  );

  return response.data;
}

export async function deleteCrmPipelineStage(
  headers: AuthHeaders,
  pipelineId: string,
  stageId: string,
) {
  const response = await axios.delete(
    `${API_URL}/v1/crm/pipelines/${pipelineId}/stages/${stageId}`,
    { headers },
  );

  return response.data;
}

export async function getCrmSalesTargets(
  headers: AuthHeaders,
): Promise<CrmSalesTarget[]> {
  const response = await axios.get<CrmSalesTarget[]>(
    `${API_URL}/v1/crm/sales-targets`,
    { headers },
  );

  return Array.isArray(response.data) ? response.data : [];
}

export async function createCrmSalesTarget(
  headers: AuthHeaders,
  input: CreateCrmSalesTargetInput,
): Promise<CrmSalesTarget> {
  const response = await axios.post<CrmSalesTarget>(
    `${API_URL}/v1/crm/sales-targets`,
    {
      branchId: cleanString(input.branchId),
      departmentId: cleanString(input.departmentId),
      userId: cleanString(input.userId),
      periodType: input.periodType,
      periodStart: input.periodStart,
      periodEnd: input.periodEnd,
      targetValue: input.targetValue,
      targetDeals: input.targetDeals,
    },
    { headers },
  );

  return response.data;
}

export async function deleteCrmSalesTarget(
  headers: AuthHeaders,
  targetId: string,
) {
  const response = await axios.delete(
    `${API_URL}/v1/crm/sales-targets/${targetId}`,
    { headers },
  );

  return response.data;
}

export async function listCrmAccounts(headers: AuthHeaders): Promise<CrmAccount[]> {
  const response = await axios.get<CrmAccount[]>(`${API_URL}/v1/crm/accounts`, { headers });
  return Array.isArray(response.data) ? response.data : [];
}

export async function createCrmAccount(headers: AuthHeaders, input: Partial<CrmAccount>) {
  const response = await axios.post<CrmAccount>(`${API_URL}/v1/crm/accounts`, input, { headers });
  return response.data;
}

export async function createCrmContact(
  headers: AuthHeaders,
  accountId: string,
  input: Partial<CrmContact>,
) {
  const response = await axios.post<CrmContact>(
    `${API_URL}/v1/crm/accounts/${accountId}/contacts`,
    input,
    { headers },
  );
  return response.data;
}

export async function listCrmContacts(
  headers: AuthHeaders,
  accountId: string,
): Promise<CrmContact[]> {
  const response = await axios.get<CrmContact[]>(
    `${API_URL}/v1/crm/accounts/${accountId}/contacts`,
    { headers },
  );
  return Array.isArray(response.data) ? response.data : [];
}

export async function listCrmMailboxes(headers: AuthHeaders): Promise<CrmMailbox[]> {
  const response = await axios.get<CrmMailbox[]>(`${API_URL}/v1/crm/engagement/mailboxes`, {
    headers,
  });
  return Array.isArray(response.data) ? response.data : [];
}

export async function listCrmIntegrationCatalog(
  headers: AuthHeaders,
): Promise<CrmIntegrationCatalogItem[]> {
  const response = await axios.get<CrmIntegrationCatalogItem[]>(
    `${API_URL}/v1/crm/integrations/catalog`,
    { headers },
  );
  return Array.isArray(response.data) ? response.data : [];
}

export async function listCrmChannelIntegrations(
  headers: AuthHeaders,
): Promise<CrmChannelIntegration[]> {
  const response = await axios.get<CrmChannelIntegration[]>(
    `${API_URL}/v1/crm/integrations`,
    { headers },
  );
  return Array.isArray(response.data) ? response.data : [];
}

export async function createCrmChannelIntegration(
  headers: AuthHeaders,
  input: Record<string, unknown>,
) {
  const response = await axios.post<CrmChannelIntegration>(
    `${API_URL}/v1/crm/integrations`,
    input,
    { headers },
  );
  return response.data;
}

export async function createCrmIntegrationConnectUrl(
  headers: AuthHeaders,
  input: Record<string, unknown>,
): Promise<{
  integration: CrmChannelIntegration;
  connectUrl?: string | null;
  callbackUrl?: string | null;
  webhookUrl?: string | null;
  provider: string;
  providerLabel: string;
  status: string;
  requiredEnv?: string[];
}> {
  const response = await axios.post(
    `${API_URL}/v1/crm/integrations/connect-url`,
    input,
    { headers },
  );
  return response.data as {
    integration: CrmChannelIntegration;
    connectUrl?: string | null;
    callbackUrl?: string | null;
    webhookUrl?: string | null;
    provider: string;
    providerLabel: string;
    status: string;
    requiredEnv?: string[];
  };
}

export async function syncCrmChannelIntegration(
  headers: AuthHeaders,
  integrationId: string,
) {
  const response = await axios.patch<CrmChannelIntegration>(
    `${API_URL}/v1/crm/integrations/${integrationId}/sync`,
    undefined,
    { headers },
  );
  return response.data;
}

export async function listCrmOmnichannelMessages(
  headers: AuthHeaders,
): Promise<CrmOmnichannelMessage[]> {
  const response = await axios.get<CrmOmnichannelMessage[]>(
    `${API_URL}/v1/crm/integrations/messages`,
    { headers },
  );
  return Array.isArray(response.data) ? response.data : [];
}

export async function createCrmOmnichannelMessage(
  headers: AuthHeaders,
  input: Record<string, unknown>,
) {
  const response = await axios.post<CrmOmnichannelMessage>(
    `${API_URL}/v1/crm/integrations/messages`,
    input,
    { headers },
  );
  return response.data;
}

export async function createCrmMailbox(
  headers: AuthHeaders,
  input: Partial<CrmMailbox> & { provider: string; emailAddress: string; label?: string },
) {
  const response = await axios.post<CrmMailbox>(
    `${API_URL}/v1/crm/engagement/mailboxes`,
    input,
    { headers },
  );
  return response.data;
}

export async function listCrmEmailTemplates(
  headers: AuthHeaders,
): Promise<CrmEmailTemplate[]> {
  const response = await axios.get<CrmEmailTemplate[]>(
    `${API_URL}/v1/crm/engagement/templates`,
    { headers },
  );
  return Array.isArray(response.data) ? response.data : [];
}

export async function createCrmEmailTemplate(
  headers: AuthHeaders,
  input: Partial<CrmEmailTemplate> & { name: string; subject: string; body: string },
) {
  const response = await axios.post<CrmEmailTemplate>(
    `${API_URL}/v1/crm/engagement/templates`,
    input,
    { headers },
  );
  return response.data;
}

export async function listCrmSequences(headers: AuthHeaders): Promise<CrmSequence[]> {
  const response = await axios.get<CrmSequence[]>(`${API_URL}/v1/crm/engagement/sequences`, {
    headers,
  });
  return Array.isArray(response.data) ? response.data : [];
}

export async function createCrmSequence(
  headers: AuthHeaders,
  input: {
    name: string;
    description?: string;
    isActive?: boolean;
    steps: Array<{
      type: string;
      subject?: string;
      body?: string;
      taskTitle?: string;
      dueInDays?: number;
    }>;
  },
) {
  const response = await axios.post<CrmSequence>(
    `${API_URL}/v1/crm/engagement/sequences`,
    input,
    { headers },
  );
  return response.data;
}

export async function enrollCrmSequence(
  headers: AuthHeaders,
  input: {
    sequenceId: string;
    leadId: string;
    contactId?: string;
    nextRunAt?: string;
  },
) {
  const response = await axios.post(
    `${API_URL}/v1/crm/engagement/enrollments`,
    input,
    { headers },
  );
  return response.data;
}

export async function listCrmInbox(headers: AuthHeaders): Promise<CrmEmailMessage[]> {
  const response = await axios.get<CrmEmailMessage[]>(`${API_URL}/v1/crm/engagement/inbox`, {
    headers,
  });
  return Array.isArray(response.data) ? response.data : [];
}

export async function createCrmEmailMessage(
  headers: AuthHeaders,
  input: Partial<CrmEmailMessage> & { subject: string; body: string },
) {
  const response = await axios.post<CrmEmailMessage>(
    `${API_URL}/v1/crm/engagement/messages`,
    input,
    { headers },
  );
  return response.data;
}

export async function listCrmConversationInsights(
  headers: AuthHeaders,
  leadId?: string,
): Promise<CrmConversationInsight[]> {
  const response = await axios.get<CrmConversationInsight[]>(
    `${API_URL}/v1/crm/engagement/insights`,
    { headers, params: leadId ? { leadId } : undefined },
  );
  return Array.isArray(response.data) ? response.data : [];
}

export async function createCrmConversationInsight(
  headers: AuthHeaders,
  input: Partial<CrmConversationInsight> & { leadId: string },
) {
  const response = await axios.post<CrmConversationInsight>(
    `${API_URL}/v1/crm/engagement/insights`,
    input,
    { headers },
  );
  return response.data;
}

export async function listCrmQuotes(headers: AuthHeaders): Promise<CrmQuote[]> {
  const response = await axios.get<CrmQuote[]>(`${API_URL}/v1/crm/quotes`, { headers });
  return Array.isArray(response.data) ? response.data : [];
}

export async function createCrmQuote(
  headers: AuthHeaders,
  input: Record<string, unknown>,
) {
  const response = await axios.post<CrmQuote>(`${API_URL}/v1/crm/quotes`, input, { headers });
  return response.data;
}

export async function updateCrmQuoteStatus(
  headers: AuthHeaders,
  quoteId: string,
  status: string,
) {
  const response = await axios.patch<CrmQuote>(
    `${API_URL}/v1/crm/quotes/${quoteId}/status`,
    { status },
    { headers },
  );
  return response.data;
}

export async function listCrmDocuments(headers: AuthHeaders): Promise<CrmDocument[]> {
  const response = await axios.get<CrmDocument[]>(`${API_URL}/v1/crm/documents`, { headers });
  return Array.isArray(response.data) ? response.data : [];
}

export async function createCrmDocument(
  headers: AuthHeaders,
  input: Record<string, unknown>,
) {
  const response = await axios.post<CrmDocument>(`${API_URL}/v1/crm/documents`, input, {
    headers,
  });
  return response.data;
}

export async function listCrmRoutingRules(headers: AuthHeaders): Promise<CrmRoutingRule[]> {
  const response = await axios.get<CrmRoutingRule[]>(`${API_URL}/v1/crm/routing/rules`, {
    headers,
  });
  return Array.isArray(response.data) ? response.data : [];
}

export async function createCrmRoutingRule(
  headers: AuthHeaders,
  input: Record<string, unknown>,
) {
  const response = await axios.post<CrmRoutingRule>(
    `${API_URL}/v1/crm/routing/rules`,
    input,
    { headers },
  );
  return response.data;
}

export async function applyCrmRoutingRule(
  headers: AuthHeaders,
  leadId: string,
) {
  const response = await axios.post(
    `${API_URL}/v1/crm/routing/apply/${leadId}`,
    undefined,
    { headers },
  );
  return response.data;
}

export async function getCrmForecastSummary(headers: AuthHeaders): Promise<{
  totals: Record<string, number>;
  snapshots: CrmForecastSnapshot[];
  adjustments?: Array<Record<string, unknown>>;
}> {
  const response = await axios.get(`${API_URL}/v1/crm/forecast/summary`, { headers });
  return response.data as {
    totals: Record<string, number>;
    snapshots: CrmForecastSnapshot[];
    adjustments?: Array<Record<string, unknown>>;
  };
}

export async function createCrmForecastSnapshot(
  headers: AuthHeaders,
  input: Record<string, unknown>,
) {
  const response = await axios.post(
    `${API_URL}/v1/crm/forecast/snapshots`,
    input,
    { headers },
  );
  return response.data;
}

export async function createCrmForecastAdjustment(
  headers: AuthHeaders,
  input: Record<string, unknown>,
) {
  const response = await axios.post(
    `${API_URL}/v1/crm/forecast/adjustments`,
    input,
    { headers },
  );
  return response.data;
}
