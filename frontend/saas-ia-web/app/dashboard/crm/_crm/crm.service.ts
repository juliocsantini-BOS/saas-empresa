import axios from 'axios';

import { API_URL } from './constants';
import type {
  ActivityComposerType,
  CrmSavedView,
  CrmSavedViewFilters,
  CreateLeadTaskForm,
  CreateLeadForm,
  EditLeadForm,
  ExtendedLeadItem,
  LeadActivity,
  LeadTask,
} from './types';

export type AuthHeaders = Record<string, string>;

export async function getCrmLeads(headers: AuthHeaders) {
  const response = await axios.get<ExtendedLeadItem[]>(`${API_URL}/v1/crm/leads`, {
    headers,
  });

  return response.data;
}

type SavedViewApiItem = {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  filtersJson: CrmSavedViewFilters;
};

export async function getCrmSavedViews(headers: AuthHeaders): Promise<CrmSavedView[]> {
  const response = await axios.get<SavedViewApiItem[]>(`${API_URL}/v1/crm/views`, {
    headers,
  });

  return response.data.map((item) => ({
    id: item.id,
    name: item.name,
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
    filters: item.filtersJson,
  }));
}

export async function getMyCrmPermissions(headers: AuthHeaders): Promise<string[]> {
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
    `${API_URL}/v1/crm/views`,
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

export async function deleteCrmSavedView(headers: AuthHeaders, viewId: string) {
  const response = await axios.delete(`${API_URL}/v1/crm/views/${viewId}`, {
    headers,
  });

  return response.data;
}

export async function getCrmLeadActivities(leadId: string, headers: AuthHeaders) {
  const response = await axios.get<LeadActivity[]>(`${API_URL}/v1/crm/leads/${leadId}/activities`, {
    headers,
  });

  return response.data;
}

export async function getCrmLeadTasks(leadId: string, headers: AuthHeaders) {
  const response = await axios.get<LeadTask[]>(`${API_URL}/v1/crm/leads/${leadId}/tasks`, {
    headers,
  });

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
  const response = await axios.post(
    `${API_URL}/v1/crm/leads/${leadId}/tasks`,
    {
      title: input.title.trim(),
      description: input.description.trim() || undefined,
      dueAt: input.dueAt || undefined,
    },
    { headers },
  );

  return response.data;
}

export async function createCrmLead(headers: AuthHeaders, createForm: CreateLeadForm) {
  const response = await axios.post(
    `${API_URL}/v1/crm/leads`,
    {
      name: createForm.name.trim(),
      phone: createForm.phone.trim() || undefined,
      whatsapp: createForm.whatsapp.trim() || undefined,
      email: createForm.email.trim() || undefined,
      companyName: createForm.companyName.trim() || undefined,
      jobTitle: createForm.jobTitle.trim() || undefined,
      website: createForm.website.trim() || undefined,
      city: createForm.city.trim() || undefined,
      state: createForm.state.trim() || undefined,
      industry: createForm.industry.trim() || undefined,
      companySize: createForm.companySize.trim() || undefined,
      notes: createForm.notes.trim() || undefined,
      dealValue: createForm.dealValue.trim() || undefined,
      probability: createForm.probability ? Number(createForm.probability) : undefined,
      source: createForm.source.trim() || undefined,
      sourceDetail: createForm.sourceDetail.trim() || undefined,
      priority: createForm.priority.trim() || undefined,
      competitor: createForm.competitor.trim() || undefined,
      wonReason: createForm.wonReason.trim() || undefined,
      nextStep: createForm.nextStep.trim() || undefined,
      nextMeetingAt: createForm.nextMeetingAt || undefined,
      expectedCloseDate: createForm.expectedCloseDate || undefined,
    },
    { headers },
  );

  return response.data;
}

export async function updateCrmLead(
  headers: AuthHeaders,
  leadId: string,
  editForm: EditLeadForm,
) {
  const response = await axios.patch(
    `${API_URL}/v1/crm/leads/${leadId}`,
    {
      name: editForm.name.trim(),
      phone: editForm.phone.trim() || undefined,
      whatsapp: editForm.whatsapp.trim() || undefined,
      email: editForm.email.trim() || undefined,
      companyName: editForm.companyName.trim() || undefined,
      jobTitle: editForm.jobTitle.trim() || undefined,
      website: editForm.website.trim() || undefined,
      city: editForm.city.trim() || undefined,
      state: editForm.state.trim() || undefined,
      industry: editForm.industry.trim() || undefined,
      companySize: editForm.companySize.trim() || undefined,
      notes: editForm.notes.trim() || undefined,
      dealValue: editForm.dealValue.trim() || undefined,
      probability: editForm.probability ? Number(editForm.probability) : undefined,
      source: editForm.source.trim() || undefined,
      sourceDetail: editForm.sourceDetail.trim() || undefined,
      priority: editForm.priority.trim() || undefined,
      competitor: editForm.competitor.trim() || undefined,
      wonReason: editForm.wonReason.trim() || undefined,
      nextStep: editForm.nextStep.trim() || undefined,
      nextMeetingAt: editForm.nextMeetingAt || undefined,
      expectedCloseDate: editForm.expectedCloseDate || undefined,
    },
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
  },
): Promise<ExtendedLeadItem> {
  const response = await axios.patch(
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
  const response = await axios.patch(
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
      lostReason: input.status === 'LOST' ? input.lostReason?.trim() || undefined : undefined,
    },
    { headers },
  );

  return response.data;
}

export async function completeCrmLeadTask(headers: AuthHeaders, taskId: string) {
  const response = await axios.patch(
    `${API_URL}/v1/crm/leads/tasks/${taskId}/complete`,
    undefined,
    { headers },
  );

  return response.data;
}

export async function reopenCrmLeadTask(headers: AuthHeaders, taskId: string) {
  const response = await axios.patch(
    `${API_URL}/v1/crm/leads/tasks/${taskId}/reopen`,
    undefined,
    { headers },
  );

  return response.data;
}
