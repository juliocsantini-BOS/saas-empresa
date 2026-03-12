import { useCallback, useState } from 'react';

import { updateCrmLeadOutcome } from './crm.service';
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

type OutcomeStatus = 'WON' | 'LOST';

type UseLeadOutcomeUpdateParams = {
  authHeaders: AuthHeaders;
  loadLeads: () => Promise<void>;
  onLeadUpdated: (lead: ExtendedLeadItem) => void | Promise<void>;
  setError: (value: string | null) => void;
};

export function useLeadOutcomeUpdate({
  authHeaders,
  loadLeads,
  onLeadUpdated,
  setError,
}: UseLeadOutcomeUpdateParams) {
  const [outcomeLead, setOutcomeLead] = useState<ExtendedLeadItem | null>(null);
  const [outcomeStatus, setOutcomeStatus] = useState<OutcomeStatus | null>(null);
  const [lostReason, setLostReason] = useState('');
  const [savingOutcome, setSavingOutcome] = useState(false);

  const openWonFlow = useCallback((lead: ExtendedLeadItem) => {
    setOutcomeLead(lead);
    setOutcomeStatus('WON');
    setLostReason('');
  }, []);

  const openLostFlow = useCallback((lead: ExtendedLeadItem) => {
    setOutcomeLead(lead);
    setOutcomeStatus('LOST');
    setLostReason(lead.lostReason || '');
  }, []);

  const closeOutcomeFlow = useCallback(() => {
    setOutcomeLead(null);
    setOutcomeStatus(null);
    setLostReason('');
  }, []);

  const submitOutcome = useCallback(async () => {
    if (!outcomeLead || !outcomeStatus || savingOutcome) return;
    if (outcomeStatus === 'LOST' && !lostReason.trim()) return;

    try {
      setSavingOutcome(true);
      setError(null);

      const updatedLead = await updateCrmLeadOutcome(authHeaders, outcomeLead.id, {
        status: outcomeStatus,
        lostReason: outcomeStatus === 'LOST' ? lostReason : undefined,
      });

      await loadLeads();
      await onLeadUpdated(updatedLead);
      closeOutcomeFlow();
    } catch (error: unknown) {
      setError(
        getErrorMessage(
          error,
          outcomeStatus === 'LOST'
            ? 'Não foi possível marcar o lead como perdido.'
            : 'Não foi possível marcar o lead como ganho.',
        ),
      );
    } finally {
      setSavingOutcome(false);
    }
  }, [
    authHeaders,
    closeOutcomeFlow,
    loadLeads,
    lostReason,
    onLeadUpdated,
    outcomeLead,
    outcomeStatus,
    savingOutcome,
    setError,
  ]);

  return {
    closeOutcomeFlow,
    lostReason,
    openLostFlow,
    openWonFlow,
    outcomeLead,
    outcomeStatus,
    savingOutcome,
    setLostReason,
    submitOutcome,
  };
}
