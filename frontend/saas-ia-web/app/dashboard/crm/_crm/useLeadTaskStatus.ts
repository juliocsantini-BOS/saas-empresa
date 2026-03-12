import { useCallback, useState } from 'react';

import { completeCrmLeadTask, reopenCrmLeadTask } from './crm.service';
import type { AuthHeaders } from './crm.service';
import type { ExtendedLeadItem, LeadTask } from './types';

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

type UseLeadTaskStatusParams = {
  authHeaders: AuthHeaders;
  loadLeads: () => Promise<void>;
  refreshLeadDetails: (lead: ExtendedLeadItem) => Promise<void>;
  setError: (value: string | null) => void;
};

export function useLeadTaskStatus({
  authHeaders,
  loadLeads,
  refreshLeadDetails,
  setError,
}: UseLeadTaskStatusParams) {
  const [updatingTaskId, setUpdatingTaskId] = useState<string | null>(null);

  const toggleTaskStatus = useCallback(
    async (lead: ExtendedLeadItem | null, task: LeadTask) => {
      if (!lead || updatingTaskId) return;

      try {
        setUpdatingTaskId(task.id);
        setError(null);

        const now = new Date().toISOString();

        if (task.completedAt) {
          await reopenCrmLeadTask(authHeaders, task.id);
        } else {
          await completeCrmLeadTask(authHeaders, task.id);
        }

        await loadLeads();
        await refreshLeadDetails({
          ...lead,
          lastActivityAt: now,
          updatedAt: now,
        });
      } catch (error: unknown) {
        setError(
          getErrorMessage(
            error,
            task.completedAt
              ? 'Não foi possível reabrir a tarefa.'
              : 'Não foi possível concluir a tarefa.',
          ),
        );
      } finally {
        setUpdatingTaskId(null);
      }
    },
    [authHeaders, loadLeads, refreshLeadDetails, setError, updatingTaskId],
  );

  return {
    toggleTaskStatus,
    updatingTaskId,
  };
}
