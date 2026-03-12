import { useCallback, useState } from 'react';

import { updateCrmLead } from './crm.service';
import type { AuthHeaders } from './crm.service';
import type { EditLeadForm, ExtendedLeadItem } from './types';

const emptyForm: EditLeadForm = {
  name: '',
  phone: '',
  whatsapp: '',
  email: '',
  companyName: '',
  jobTitle: '',
  website: '',
  city: '',
  state: '',
  industry: '',
  companySize: '',
  notes: '',
  dealValue: '',
  probability: '',
  source: '',
  sourceDetail: '',
  priority: 'MEDIUM',
  competitor: '',
  wonReason: '',
  nextStep: '',
  nextMeetingAt: '',
  expectedCloseDate: '',
};

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

function toInputValue(value?: string | number | null) {
  if (value === undefined || value === null) return '';
  return String(value);
}

function toDateInputValue(value?: string | null) {
  if (!value) return '';
  return String(value).slice(0, 10);
}

function buildEditForm(lead: ExtendedLeadItem): EditLeadForm {
  return {
    name: lead.name || '',
    phone: lead.phone || '',
    whatsapp: lead.whatsapp || '',
    email: lead.email || '',
    companyName: lead.companyName || '',
    jobTitle: lead.jobTitle || '',
    website: lead.website || '',
    city: lead.city || '',
    state: lead.state || '',
    industry: lead.industry || '',
    companySize: lead.companySize || '',
    notes: lead.notes || '',
    dealValue: toInputValue(lead.dealValue),
    probability: toInputValue(lead.probability),
    source: lead.source || '',
    sourceDetail: lead.sourceDetail || '',
    priority: lead.priority || 'MEDIUM',
    competitor: lead.competitor || '',
    wonReason: lead.wonReason || '',
    nextStep: lead.nextStep || '',
    nextMeetingAt: toDateInputValue(lead.nextMeetingAt),
    expectedCloseDate: toDateInputValue(lead.expectedCloseDate),
  };
}

type UseEditLeadFormParams = {
  authHeaders: AuthHeaders;
  loadLeads: () => Promise<void>;
  setError: (value: string | null) => void;
  onLeadUpdated: (lead: ExtendedLeadItem) => void | Promise<void>;
};

export function useEditLeadForm({
  authHeaders,
  loadLeads,
  setError,
  onLeadUpdated,
}: UseEditLeadFormParams) {
  const [editingLead, setEditingLead] = useState<ExtendedLeadItem | null>(null);
  const [editForm, setEditForm] = useState<EditLeadForm>(emptyForm);
  const [savingEditLead, setSavingEditLead] = useState(false);

  const openEditLead = useCallback((lead: ExtendedLeadItem) => {
    setEditingLead(lead);
    setEditForm(buildEditForm(lead));
  }, []);

  const closeEditLead = useCallback(() => {
    setEditingLead(null);
    setEditForm(emptyForm);
  }, []);

  const saveEditLead = useCallback(async () => {
    if (!editingLead || !editForm.name.trim()) return;

    try {
      setSavingEditLead(true);
      setError(null);

      const updatedLead = await updateCrmLead(authHeaders, editingLead.id, editForm);

      await loadLeads();
      await onLeadUpdated(updatedLead);
      closeEditLead();
    } catch (error: unknown) {
      setError(getErrorMessage(error, 'Não foi possível atualizar o lead.'));
    } finally {
      setSavingEditLead(false);
    }
  }, [authHeaders, closeEditLead, editForm, editingLead, loadLeads, onLeadUpdated, setError]);

  return {
    closeEditLead,
    editForm,
    editingLead,
    openEditLead,
    saveEditLead,
    savingEditLead,
    setEditForm,
  };
}
