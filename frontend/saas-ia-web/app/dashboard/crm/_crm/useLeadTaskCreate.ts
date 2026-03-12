import { useCallback, useState } from 'react';

import { createCrmLeadTask } from './crm.service';
import type { AuthHeaders } from './crm.service';
import type { CreateLeadTaskForm, ExtendedLeadItem } from './types';

const emptyTaskForm: CreateLeadTaskForm = {
  title: '',
  description: '',
  dueAt: '',
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

type UseLeadTaskCreateParams = {
  authHeaders: AuthHeaders;
  loadLeads: () => Promise<void>;
  refreshLeadDetails: (lead: ExtendedLeadItem) => Promise<void>;
  setError: (value: string | null) => void;
};

export function useLeadTaskCreate({
  authHeaders,
  loadLeads,
  refreshLeadDetails,
  setError,
}: UseLeadTaskCreateParams) {
  const [taskForm, setTaskForm] = useState<CreateLeadTaskForm>(emptyTaskForm);
  const [savingTask, setSavingTask] = useState(false);

  const submitTask = useCallback(
    async (lead: ExtendedLeadItem | null) => {
      if (!lead || savingTask || taskForm.title.trim().length < 2) return;

      try {
        setSavingTask(true);
        setError(null);

        const now = new Date().toISOString();

        await createCrmLeadTask(authHeaders, lead.id, taskForm);

        setTaskForm(emptyTaskForm);
        await loadLeads();
        await refreshLeadDetails({
          ...lead,
          lastActivityAt: now,
          updatedAt: now,
        });
      } catch (error: unknown) {
        setError(getErrorMessage(error, 'Não foi possível criar a tarefa do lead.'));
      } finally {
        setSavingTask(false);
      }
    },
    [authHeaders, loadLeads, refreshLeadDetails, savingTask, setError, taskForm],
  );

  return {
    savingTask,
    setTaskForm,
    submitTask,
    taskForm,
  };
}
