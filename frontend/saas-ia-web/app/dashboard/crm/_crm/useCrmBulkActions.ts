import { useCallback, useState } from 'react';

import { bulkUpdateCrmLeadFields } from './crm.service';
import type { AuthHeaders } from './crm.service';
import type { ExtendedLeadItem } from './types';

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

type UseCrmBulkActionsParams = {
  authHeaders: AuthHeaders;
  loadLeads: () => Promise<void>;
  onLeadUpdated: (lead: ExtendedLeadItem) => void | Promise<void>;
  selectedLeadId?: string | null;
  setError: (value: string | null) => void;
};

export function useCrmBulkActions({
  authHeaders,
  loadLeads,
  onLeadUpdated,
  selectedLeadId,
  setError,
}: UseCrmBulkActionsParams) {
  const [savingBulkAction, setSavingBulkAction] = useState(false);

  const runBulkUpdate = useCallback(
    async (
      leadIds: string[],
      payload: {
        status?: string;
        ownerUserId?: string;
        priority?: string;
      },
      fallbackMessage: string,
    ) => {
      if (leadIds.length === 0) return false;

      try {
        setSavingBulkAction(true);
        setError(null);

        const updatedLeads = await bulkUpdateCrmLeadFields(authHeaders, {
          leadIds,
          ...payload,
        });

        await loadLeads();

        if (selectedLeadId) {
          const updatedSelectedLead = updatedLeads.find((lead) => lead.id === selectedLeadId);
          if (updatedSelectedLead) {
            await onLeadUpdated(updatedSelectedLead);
          }
        }

        return true;
      } catch (error: unknown) {
        setError(getErrorMessage(error, fallbackMessage));
        return false;
      } finally {
        setSavingBulkAction(false);
      }
    },
    [authHeaders, loadLeads, onLeadUpdated, selectedLeadId, setError],
  );

  const bulkChangeStatus = useCallback(
    (leadIds: string[], status: string) =>
      runBulkUpdate(leadIds, { status }, 'Não foi possível atualizar o status em lote.'),
    [runBulkUpdate],
  );

  const bulkChangeOwner = useCallback(
    (leadIds: string[], ownerUserId: string) =>
      runBulkUpdate(
        leadIds,
        { ownerUserId: ownerUserId === 'UNASSIGNED' ? '' : ownerUserId },
        'Não foi possível atualizar o responsável em lote.',
      ),
    [runBulkUpdate],
  );

  const bulkChangePriority = useCallback(
    (leadIds: string[], priority: string) =>
      runBulkUpdate(leadIds, { priority }, 'Não foi possível atualizar a prioridade em lote.'),
    [runBulkUpdate],
  );

  return {
    bulkChangeOwner,
    bulkChangePriority,
    bulkChangeStatus,
    savingBulkAction,
  };
}
