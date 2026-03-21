import { useCallback, useState } from 'react';
import { createCrmLead } from './crm.service';
import type { AuthHeaders } from './crm.service';
import type { CreateLeadForm } from './types';

const emptyForm: CreateLeadForm = {
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
  accountId: '',
  contactId: '',
  forecastCategory: 'PIPELINE',
  dealValue: '',
  currency: 'BRL',
  probability: '',
  source: '',
  sourceDetail: '',
  priority: 'MEDIUM',
  competitor: '',
  wonReason: '',
  lostReason: '',
  nextStep: '',
  nextStepDueAt: '',
  nextMeetingAt: '',
  expectedCloseDate: '',
  ownerUserId: '',
  branchId: '',
  departmentId: '',
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

type UseCreateLeadFormParams = {
  authHeaders: AuthHeaders;
  loadLeads: () => Promise<void>;
  setError: (value: string | null) => void;
};

export function useCreateLeadForm({
  authHeaders,
  loadLeads,
  setError,
}: UseCreateLeadFormParams) {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [createForm, setCreateForm] = useState<CreateLeadForm>(emptyForm);
  const [savingLead, setSavingLead] = useState(false);

  const createLead = useCallback(async () => {
    if (!createForm.name.trim()) return;

    try {
      setSavingLead(true);
      setError(null);

      await createCrmLead(authHeaders, createForm);

      setCreateForm(emptyForm);
      setIsCreateOpen(false);
      await loadLeads();
    } catch (error: unknown) {
      setError(getErrorMessage(error, 'Não foi possível criar o lead.'));
    } finally {
      setSavingLead(false);
    }
  }, [authHeaders, createForm, loadLeads, setError]);

  return {
    createForm,
    createLead,
    isCreateOpen,
    savingLead,
    setCreateForm,
    setIsCreateOpen,
  };
}
