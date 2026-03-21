import { useCallback, useState } from 'react';
import { updateCrmLeadStatus } from './crm.service';
import type { AuthHeaders } from './crm.service';
import type { ExtendedLeadItem, LeadStatus } from './types';

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

type UseLeadStatusUpdateParams = {
  authHeaders: AuthHeaders;
  loadLeads: () => Promise<void>;
  onLeadUpdated: (lead: ExtendedLeadItem) => void | Promise<void>;
  setError: (value: string | null) => void;
};

export function useLeadStatusUpdate({
  authHeaders,
  loadLeads,
  onLeadUpdated,
  setError,
}: UseLeadStatusUpdateParams) {
  const [savingStatus, setSavingStatus] = useState(false);

  const changeLeadStatus = useCallback(
    async (lead: ExtendedLeadItem, status: LeadStatus) => {
      if (lead.status === status) return;

      try {
        setSavingStatus(true);
        setError(null);

        const updatedLead = await updateCrmLeadStatus(
          authHeaders,
          lead.id,
          status,
        );

        await loadLeads();

        if (updatedLead) {
          await onLeadUpdated(updatedLead);
        }
      } catch (error: unknown) {
        setError(
          getErrorMessage(
            error,
            'Não foi possível atualizar o status do lead.',
          ),
        );
      } finally {
        setSavingStatus(false);
      }
    },
    [authHeaders, loadLeads, onLeadUpdated, setError],
  );

  return {
    changeLeadStatus,
    savingStatus,
  };
}